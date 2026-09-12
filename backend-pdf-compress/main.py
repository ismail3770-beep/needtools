from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import os
import uuid
import io
import time
import subprocess
import pymupdf as fitz

from office_endpoints import router as office_router

app = FastAPI(title="NeedTools PDF Compress Service")

# ---------------------------------------------------------------------------
# CORS — set ALLOWED_ORIGINS env var on Railway to your frontend domain
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://needtools.app,https://needtools.appwrite.app,https://needtools.vercel.app,http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Office / TIFF conversion endpoints live in office_endpoints.py
app.include_router(office_router)

TMP_DIR = "/tmp" if os.name != "nt" else "."


def _tmp(suffix: str) -> str:
    return os.path.join(TMP_DIR, f"{uuid.uuid4()}{suffix}")


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {"status": "ok", "service": "pdf-compress", "message": "NeedTools PDF Compress Service is running"}


# ---------------------------------------------------------------------------
# Blocking PDF work — offloaded to a thread pool via run_in_executor
# so one heavy compress request does not block the entire event loop.
# ---------------------------------------------------------------------------
def _do_compress(input_path: str, output_path: str,
                 image_quality: int, resolution_scale: float) -> bytes:
    """Synchronous wrapper: runs PyMuPDF compress and returns the result bytes."""
    compress_pdf(input_path, output_path, image_quality, resolution_scale)
    with open(output_path, "rb") as f:
        return f.read()


# ---------------------------------------------------------------------------
# PDF Compress
# Accepts: multipart — file (PDF)
# Query:   image_quality (10–100), resolution_scale (0.5–4.0)
# Returns: compressed PDF blob
# ---------------------------------------------------------------------------
@app.post("/compress")
async def compress_pdf_endpoint(
    file: UploadFile = File(...),
    image_quality: int = 60,
    resolution_scale: float = 1.5,
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    image_quality    = max(10, min(100, image_quality))
    resolution_scale = max(0.5, min(4.0, resolution_scale))

    pdf_bytes   = await file.read()
    input_path  = _tmp("_input.pdf")
    output_path = _tmp("_compressed.pdf")

    try:
        with open(input_path, "wb") as f:
            f.write(pdf_bytes)

        # Offload CPU-heavy PyMuPDF work to thread pool
        loop = asyncio.get_running_loop()
        result_bytes = await loop.run_in_executor(
            None, _do_compress, input_path, output_path, image_quality, resolution_scale
        )

        safe_name = (file.filename or "document.pdf").replace('"', '')
        return StreamingResponse(
            io.BytesIO(result_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="compressed_{safe_name}"',
                "Content-Length": str(len(result_bytes)),
            },
        )

    except Exception as exc:
        print(f"[compress_pdf] Error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

    finally:
        for p in (input_path, output_path):
            if os.path.exists(p):
                os.remove(p)


# ---------------------------------------------------------------------------
# Compress logic (inline — no separate module needed)
# ---------------------------------------------------------------------------
def compress_pdf(input_path: str, output_path: str,
                 image_quality: int = 60, resolution_scale: float = 1.5):
    """
    Re-render each PDF page as a JPEG image and pack into a new PDF.
    Drastically reduces file size for image-heavy PDFs.
    """
    doc     = fitz.open(input_path)
    out_doc = fitz.open()

    for page in doc:
        mat = fitz.Matrix(resolution_scale, resolution_scale)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        jpeg_bytes = pix.tobytes("jpeg", jpg_quality=image_quality)

        img_pdf    = fitz.open("pdf", fitz.open("jpg", jpeg_bytes).convert_to_pdf())
        out_doc.insert_pdf(img_pdf)

    out_doc.save(output_path, garbage=4, deflate=True)
    out_doc.close()
    doc.close()


# ---------------------------------------------------------------------------
# PDF Protect (encrypt with password — preserves all original content)
# Accepts: multipart — file (PDF) + user_password (form field)
#          Optional: owner_password, permissions (comma-separated)
# Returns: encrypted PDF blob
# ---------------------------------------------------------------------------
@app.post("/protect")
async def protect_pdf_endpoint(
    file: UploadFile = File(...),
    user_password: str = Form(...),
    owner_password: str = Form(default=""),
    permissions: str = Form(default=""),
):
    """
    Encrypt a PDF with AES-256 encryption using PyMuPDF.
    Preserves all original content — text, vectors, forms, bookmarks, etc.
    No rasterization.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    if not user_password or len(user_password) < 3:
        raise HTTPException(status_code=400, detail="Password must be at least 3 characters.")

    pdf_bytes = await file.read()
    input_path = _tmp("_input.pdf")
    output_path = _tmp("_protected.pdf")

    # Parse permissions — PyMuPDF uses bitmask constants
    # Defaults: no extra permissions (viewer only with password)
    perm_value = fitz.PDF_PERM_ACCESSIBILITY  # always allow accessibility
    perm_list = [p.strip().lower() for p in permissions.split(",") if p.strip()]
    if "print" in perm_list:
        perm_value |= fitz.PDF_PERM_PRINT | fitz.PDF_PERM_PRINT_HQ
    if "modify" in perm_list:
        perm_value |= fitz.PDF_PERM_MODIFY
    if "copy" in perm_list:
        perm_value |= fitz.PDF_PERM_COPY
    if "annot-forms" in perm_list:
        perm_value |= fitz.PDF_PERM_ANNOTATE | fitz.PDF_PERM_FORM

    # Use owner_password if provided, otherwise generate a random one
    # (different from user password for proper security)
    actual_owner_pw = owner_password if owner_password else f"{user_password}_owner_{uuid.uuid4().hex[:8]}"

    try:
        with open(input_path, "wb") as f:
            f.write(pdf_bytes)

        loop = asyncio.get_running_loop()
        result_bytes = await loop.run_in_executor(
            None, _do_protect, input_path, output_path,
            user_password, actual_owner_pw, perm_value
        )

        safe_name = (file.filename or "document.pdf").replace('"', '')
        return StreamingResponse(
            io.BytesIO(result_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="protected_{safe_name}"',
                "Content-Length": str(len(result_bytes)),
            },
        )

    except Exception as exc:
        print(f"[protect_pdf] Error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

    finally:
        for p in (input_path, output_path):
            if os.path.exists(p):
                os.remove(p)


def _do_protect(input_path: str, output_path: str,
                user_pw: str, owner_pw: str, permissions: int) -> bytes:
    """Synchronous wrapper: encrypts PDF with PyMuPDF AES-256."""
    doc = fitz.open(input_path)
    doc.save(
        output_path,
        encryption=fitz.PDF_ENCRYPT_AES_256,
        user_pw=user_pw,
        owner_pw=owner_pw,
        permissions=permissions,
        garbage=4,
        deflate=True,
    )
    doc.close()
    with open(output_path, "rb") as f:
        return f.read()

# ---------------------------------------------------------------------------
def _do_ocr(input_path: str, output_path: str, lang: str, is_pdf: bool) -> bytes:
    import pytesseract
    import PIL.Image
    import io
    import pymupdf as fitz

    if is_pdf:
        doc = fitz.open(input_path)
        out_pdf = fitz.open()
        for page in doc:
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            img_bytes = pix.tobytes("png")
            img = PIL.Image.open(io.BytesIO(img_bytes))
            pdf_page_bytes = pytesseract.image_to_pdf_or_hocr(img, extension='pdf', lang=lang)
            page_doc = fitz.open("pdf", pdf_page_bytes)
            out_pdf.insert_pdf(page_doc)
        out_pdf.save(output_path)
        out_pdf.close()
        doc.close()
    else:
        img = PIL.Image.open(input_path)
        pdf_bytes = pytesseract.image_to_pdf_or_hocr(img, extension='pdf', lang=lang)
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)

    with open(output_path, "rb") as f:
        return f.read()

@app.post("/ocr")
async def ocr_endpoint(
    file: UploadFile = File(...),
    lang: str = Form(default="eng")
):
    """
    Run OCR on image or PDF to generate a searchable PDF.
    lang can be 'eng', 'ben', or 'eng+ben'.
    """
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 20MB for OCR.")

    is_pdf = file.content_type == "application/pdf"
    if not is_pdf and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only PDF or Images are accepted.")

    input_path = _tmp("_input_ocr" + (".pdf" if is_pdf else ".png"))
    output_path = _tmp("_ocr_output.pdf")

    try:
        with open(input_path, "wb") as f:
            f.write(content)

        loop = asyncio.get_running_loop()
        result_bytes = await loop.run_in_executor(
            None, _do_ocr, input_path, output_path, lang, is_pdf
        )

        safe_name = (file.filename or "document").rsplit('.', 1)[0]
        return StreamingResponse(
            io.BytesIO(result_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}_searchable.pdf"',
                "Content-Length": str(len(result_bytes)),
            },
        )

    except Exception as exc:
        print(f"[ocr] Error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        for p in (input_path, output_path):
            if os.path.exists(p):
                os.remove(p)


def _do_word_to_pdf(input_path: str, output_path: str) -> bytes:
    import subprocess
    import os
    outdir = os.path.dirname(output_path)
    subprocess.run([
        "libreoffice", "--headless", "--nologo", "--nofirststartwizard",
        "--convert-to", "pdf", input_path, "--outdir", outdir
    ], check=True)
    expected_out = os.path.join(outdir, os.path.splitext(os.path.basename(input_path))[0] + ".pdf")
    os.rename(expected_out, output_path)
    with open(output_path, "rb") as f:
        return f.read()

@app.post("/convert/word-to-pdf")
async def word_to_pdf_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(".docx") and not file.filename.endswith(".doc"):
        raise HTTPException(status_code=400, detail="Only Word documents are accepted.")

    content = await file.read()
    input_path = _tmp("_input" + os.path.splitext(file.filename)[1])
    output_path = _tmp("_output.pdf")

    try:
        with open(input_path, "wb") as f:
            f.write(content)

        loop = asyncio.get_running_loop()
        result_bytes = await loop.run_in_executor(None, _do_word_to_pdf, input_path, output_path)

        safe_name = file.filename.rsplit('.', 1)[0]
        return StreamingResponse(
            io.BytesIO(result_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}.pdf"',
                "Content-Length": str(len(result_bytes)),
            },
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        for p in (input_path, output_path):
            if os.path.exists(p):
                os.remove(p)

def _do_pdf_to_word(input_path: str, output_path: str) -> bytes:
    from pdf2docx import Converter
    cv = Converter(input_path)
    cv.convert(output_path, start=0, end=None)
    cv.close()
    with open(output_path, "rb") as f:
        return f.read()

@app.post("/convert/pdf-to-word")
async def pdf_to_word_endpoint(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content = await file.read()
    input_path = _tmp("_input.pdf")
    output_path = _tmp("_output.docx")

    try:
        with open(input_path, "wb") as f:
            f.write(content)

        loop = asyncio.get_running_loop()
        result_bytes = await loop.run_in_executor(None, _do_pdf_to_word, input_path, output_path)

        safe_name = file.filename.rsplit('.', 1)[0]
        return StreamingResponse(
            io.BytesIO(result_bytes),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}.docx"',
                "Content-Length": str(len(result_bytes)),
            },
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        for p in (input_path, output_path):
            if os.path.exists(p):
                os.remove(p)

def _do_pdf_to_excel(input_path: str, output_path: str) -> bytes:
    import camelot
    tables = camelot.read_pdf(input_path, pages='all', flavor='lattice')
    if len(tables) == 0:
        tables = camelot.read_pdf(input_path, pages='all', flavor='stream')
        if len(tables) == 0:
            raise ValueError("No tables detected in the PDF.")

    tables.export(output_path, f='excel')
    # camelot appends to the file, so it might create a .xlsx
    with open(output_path, "rb") as f:
        return f.read()

@app.post("/convert/pdf-to-excel")
async def pdf_to_excel_endpoint(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content = await file.read()
    input_path = _tmp("_input.pdf")
    output_path = _tmp("_output.xlsx")

    try:
        with open(input_path, "wb") as f:
            f.write(content)

        loop = asyncio.get_running_loop()
        result_bytes = await loop.run_in_executor(None, _do_pdf_to_excel, input_path, output_path)

        safe_name = file.filename.rsplit('.', 1)[0]
        return StreamingResponse(
            io.BytesIO(result_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}.xlsx"',
                "Content-Length": str(len(result_bytes)),
            },
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        for p in (input_path, output_path):
            if os.path.exists(p):
                os.remove(p)
# Background Cleanup Task (Every Hour, > 7 Days Old)
# ---------------------------------------------------------------------------
from datetime import datetime, timedelta, timezone

async def cleanup_task():
    while True:
        try:
            print("[cleanup] Running hourly storage cleanup (7-day policy)...")
            
            # 1. Clean local temporary files older than 7 days
            now = time.time()
            seven_days_ago_ts = now - (7 * 24 * 60 * 60)
            
            local_deleted = 0
            if os.path.exists(TMP_DIR):
                for file in os.listdir(TMP_DIR):
                    if file.endswith(".pdf"):
                        file_path = os.path.join(TMP_DIR, file)
                        try:
                            if os.path.getmtime(file_path) < seven_days_ago_ts:
                                os.remove(file_path)
                                local_deleted += 1
                        except Exception:
                            pass
            print(f"[cleanup] Deleted {local_deleted} local files.")

            # Note: Appwrite cleanup is handled by backend-pdf-edit to avoid duplicate API calls.

        except Exception as e:
            print(f"[cleanup] Global error: {e}")
            
        # Sleep for 1 hour (3600 seconds)
        await asyncio.sleep(3600)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_task())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8002)), reload=True)

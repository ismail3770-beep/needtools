from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import os
import uuid
import io
import pymupdf as fitz

app = FastAPI(title="NeedTools PDF Compress Service")

# ---------------------------------------------------------------------------
# CORS — set ALLOWED_ORIGINS env var on Railway to your frontend domain
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://needtools.appwrite.app,https://needtools.vercel.app,http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8002)), reload=True)

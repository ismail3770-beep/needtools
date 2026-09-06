from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
import uuid
import io
import json
import pymupdf as fitz

from pdf_processor import process_pdf, compress_pdf

app = FastAPI(title="NeedTools PDF Backend")

# ---------------------------------------------------------------------------
# CORS — set ALLOWED_ORIGINS env var on Heroku to your Appwrite site domain
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
    return {"status": "ok", "message": "NeedTools PDF Backend is running"}


# ---------------------------------------------------------------------------
# PDF Edit
# Accepts: multipart — file (PDF) + edits (JSON string)
# Returns: compressed+edited PDF blob streamed back directly
# ---------------------------------------------------------------------------
@app.post("/api/edit-pdf")
async def edit_pdf(
    file: UploadFile = File(...),
    edits: str = Form(default="{}"),
):
    """
    Apply edits to a PDF using PyMuPDF and stream the result back.

    edits JSON schema (page numbers are 1-based string keys):
    {
      "1": {
        "drawings":    [ {type, x, y, width, height, startX?, startY?, endX?, endY?, color?} ],
        "editedTexts": [ {x, y, width, height, newText, format: {fontFamily, fontSize, color}} ],
        "newTexts":    [ {x, y, text, format: {fontFamily, fontSize, color}} ],
        "images":      [ {x, y, width, height, dataUrl} ]
      }
    }
    All coordinates are in *viewport pixels* at the scale the UI rendered at.
    The scaleFactor used by the frontend is included in the top-level edits object as
      edits.__scale  (default 1.5 if absent).
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    try:
        edits_dict = json.loads(edits)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid edits JSON: {exc}")

    pdf_bytes = await file.read()

    input_path  = _tmp("_input.pdf")
    output_path = _tmp("_edited.pdf")

    try:
        with open(input_path, "wb") as f:
            f.write(pdf_bytes)

        scale_factor = float(edits_dict.pop("__scale", 1.5))
        process_pdf(input_path, output_path, edits_dict, scale_factor)

        with open(output_path, "rb") as f:
            result_bytes = f.read()

        safe_name = (file.filename or "document.pdf").replace('"', '')
        return StreamingResponse(
            io.BytesIO(result_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="edited_{safe_name}"',
                "Content-Length": str(len(result_bytes)),
            },
        )

    except Exception as exc:
        print(f"[edit_pdf] Error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

    finally:
        for p in (input_path, output_path):
            if os.path.exists(p):
                os.remove(p)


# ---------------------------------------------------------------------------
# PDF Compress
# Accepts: multipart — file (PDF)
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

        compress_pdf(input_path, output_path, image_quality, resolution_scale)

        with open(output_path, "rb") as f:
            result_bytes = f.read()

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)

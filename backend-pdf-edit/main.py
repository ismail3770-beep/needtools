from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import os
import uuid
import io
import json
import time

from pdf_processor import process_pdf

app = FastAPI(title="NeedTools PDF Edit Service")

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

TMP_DIR = "/tmp" if os.name != "nt" else "."


def _tmp(suffix: str) -> str:
    return os.path.join(TMP_DIR, f"{uuid.uuid4()}{suffix}")


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {"status": "ok", "service": "pdf-edit", "message": "NeedTools PDF Edit Service is running"}


# ---------------------------------------------------------------------------
# Blocking PDF work — offloaded to a thread pool via run_in_executor
# so one heavy edit request does not block the entire event loop.
# ---------------------------------------------------------------------------
def _do_edit(input_path: str, output_path: str, edits_dict: dict, scale_factor: float) -> bytes:
    """Synchronous wrapper: runs PyMuPDF edit and returns the result bytes."""
    process_pdf(input_path, output_path, edits_dict, scale_factor)
    with open(output_path, "rb") as f:
        return f.read()


# ---------------------------------------------------------------------------
# PDF Edit
# Accepts: multipart — file (PDF) + edits (JSON string)
# Returns: edited PDF blob streamed back directly
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

        # Offload CPU-heavy PyMuPDF work to thread pool
        loop = asyncio.get_running_loop()
        result_bytes = await loop.run_in_executor(
            None, _do_edit, input_path, output_path, edits_dict, scale_factor
        )

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

            # 2. Clean Appwrite Storage bucket (Temporary Files)
            try:
                from appwrite_client import storage, APPWRITE_STORAGE_BUCKET_ID
                from appwrite.query import Query
                
                seven_days_ago_iso = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
                
                buckets_to_clean = [APPWRITE_STORAGE_BUCKET_ID, "TemporaryDownloads"]

                for bucket in buckets_to_clean:
                    has_more = True
                    appwrite_deleted = 0
                    
                    while has_more:
                        try:
                            response = storage.list_files(
                                bucket_id=bucket,
                                queries=[
                                    Query.less_than("$createdAt", seven_days_ago_iso),
                                    Query.limit(100)
                                ]
                            )
                            
                            files = response.get("files", [])
                            if not files:
                                has_more = False
                                break
                                
                            for f in files:
                                storage.delete_file(bucket, f["$id"])
                                appwrite_deleted += 1
                        except Exception as e:
                            # Might fail if bucket doesn't exist yet
                            has_more = False
                            
                    print(f"[cleanup] Deleted {appwrite_deleted} Appwrite files from bucket {bucket}.")
            except ImportError:
                pass
            except Exception as e:
                print(f"[cleanup] Appwrite cleanup error: {e}")

        except Exception as e:
            print(f"[cleanup] Global error: {e}")
            
        # Sleep for 1 hour (3600 seconds)
        await asyncio.sleep(3600)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_task())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8001)), reload=True)

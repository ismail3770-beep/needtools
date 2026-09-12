FROM python:3.11-slim

# System dependencies:
#   ghostscript      → PDF utilities (compress/repair pipeline)
#   tesseract-ocr    → /ocr endpoint (eng + ben language packs)
#   libreoffice      → /convert/word-to-pdf endpoint
#   libgl1/libglib   → opencv (camelot PDF→Excel) runtime deps
RUN apt-get update && apt-get install -y \
    ghostscript \
    tesseract-ocr \
    tesseract-ocr-ben \
    tesseract-ocr-eng \
    libreoffice \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 2 workers is safer than 4 on free-tier 512MB instances (PyMuPDF + LibreOffice are RAM-hungry)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

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

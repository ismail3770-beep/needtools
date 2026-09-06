"""
pdf_processor.py — NeedTools PDF Backend
Applies canvas-based edits (drawings, text edits, new texts, images)
to a PDF using PyMuPDF (fitz).

All incoming coordinates from the frontend are in *viewport pixels*
(i.e. already multiplied by the render scale).  We divide by scale_factor
to get back to native PDF points before drawing.
"""

import pymupdf as fitz
import base64
import re


# ─────────────────────────────────────────────────────────────────
# Colour helpers
# ─────────────────────────────────────────────────────────────────

def _hex_to_rgb(hex_color: str):
    """Return (r, g, b) floats 0–1 from a #rrggbb or #rgb string."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    r = int(hex_color[0:2], 16) / 255.0
    g = int(hex_color[2:4], 16) / 255.0
    b = int(hex_color[4:6], 16) / 255.0
    return (r, g, b)


def _css_color_to_rgb(color: str):
    """Parse a CSS color string (hex, rgb(), rgba()) to (r, g, b) floats."""
    color = color.strip()
    if color.startswith("#"):
        return _hex_to_rgb(color)
    m = re.match(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)", color)
    if m:
        return (int(m.group(1)) / 255.0,
                int(m.group(2)) / 255.0,
                int(m.group(3)) / 255.0)
    return (0.0, 0.0, 0.0)


# ─────────────────────────────────────────────────────────────────
# Font mapping
# ─────────────────────────────────────────────────────────────────

def _pick_font(font_family: str, bold: bool, italic: bool) -> str:
    """Return a fitz built-in font name for the requested style."""
    family = (font_family or "Helvetica").strip()
    if "Times" in family or "Serif" in family:
        if bold and italic:   return "tibo"   # Times Bold-Italic
        if bold:              return "tib"    # Times Bold
        if italic:            return "tiit"   # Times Italic
        return "tiro"                         # Times Roman
    if "Courier" in family or "Mono" in family:
        if bold and italic:   return "cobo"
        if bold:              return "cob"
        if italic:            return "coit"
        return "cour"
    # Default → Helvetica
    if bold and italic:       return "helbo"
    if bold:                  return "helb"
    if italic:                return "heli"
    return "helv"


# ─────────────────────────────────────────────────────────────────
# Strip HTML tags from contenteditable content
# ─────────────────────────────────────────────────────────────────

def _strip_html(html: str) -> str:
    """Very lightweight HTML → plain-text (single line)."""
    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>",  "",   text)
    text = text.replace("&nbsp;", " ") \
               .replace("&amp;",  "&") \
               .replace("&lt;",   "<") \
               .replace("&gt;",   ">") \
               .replace("&quot;", '"')
    return text.strip()


# ─────────────────────────────────────────────────────────────────
# Main process function
# ─────────────────────────────────────────────────────────────────

def process_pdf(input_path: str, output_path: str,
                edits: dict, scale_factor: float = 1.5):
    """
    Apply all edits to the PDF and save to output_path.

    edits keys are 1-based page number strings.
    scale_factor is the render scale the frontend used (e.g. 1.5).
    All incoming x/y/w/h values are in viewport pixels → divide by
    scale_factor to get native PDF points.
    """
    doc = fitz.open(input_path)
    sf = max(0.1, scale_factor)  # safety clamp

    for page_num_str, page_edits in edits.items():
        page_idx = int(page_num_str) - 1
        if page_idx < 0 or page_idx >= len(doc):
            continue

        page = doc[page_idx]
        ph = page.rect.height  # page height in PDF points (for Y-flip)

        # ── 1. Drawings (eraser, highlight, shapes) ──────────────────────
        for draw in page_edits.get("drawings", []):
            dtype = draw.get("type", "")

            # Convert viewport px → PDF points
            x  = draw["x"]      / sf
            y  = draw["y"]      / sf
            w  = draw["width"]  / sf
            h  = draw["height"] / sf

            # PDF Y-axis is bottom-up; viewport is top-down
            # rect in PDF coords: bottom = ph - (vp_y + vp_h), top = ph - vp_y
            pdf_rect = fitz.Rect(x, ph - y - h, x + w, ph - y)

            color = _css_color_to_rgb(draw.get("color", "#000000"))

            if dtype == "eraser":
                # True redaction: removes the underlying content vectors
                page.add_redact_annot(pdf_rect, fill=(1, 1, 1))

            elif dtype == "highlight":
                page.draw_rect(pdf_rect,
                               color=(1.0, 0.9, 0.0),
                               fill=(1.0, 0.9, 0.0),
                               fill_opacity=0.4,
                               overlay=True)

            elif dtype == "shape_rect":
                page.draw_rect(pdf_rect,
                               color=color,
                               width=2.0,
                               overlay=True)

            elif dtype == "shape_circle":
                page.draw_oval(pdf_rect,
                               color=color,
                               width=2.0,
                               overlay=True)

            elif dtype == "shape_line":
                sx = draw["startX"] / sf
                sy = draw["startY"] / sf
                ex = draw["endX"]   / sf
                ey = draw["endY"]   / sf
                p1 = fitz.Point(sx, ph - sy)
                p2 = fitz.Point(ex, ph - ey)
                page.draw_line(p1, p2, color=color, width=2.0, overlay=True)

        # Apply all redactions in one pass (must happen after adding them)
        page.apply_redactions()

        # ── 2. Edited Texts (replace existing text blocks) ───────────────
        for edit in page_edits.get("editedTexts", []):
            x  = edit["x"]      / sf
            y  = edit["y"]      / sf
            w  = edit["width"]  / sf
            h  = edit["height"] / sf

            pdf_rect = fitz.Rect(x, ph - y - h, x + w, ph - y)

            # Whiteout the original text
            page.add_redact_annot(pdf_rect, fill=(1, 1, 1))
            page.apply_redactions()

            new_text = _strip_html(edit.get("newText", ""))
            if not new_text:
                continue

            fmt        = edit.get("format", {})
            font_name  = _pick_font(fmt.get("fontFamily", "Helvetica"),
                                    fmt.get("isBold", False),
                                    fmt.get("isItalic", False))
            font_size  = float(fmt.get("fontSize", 14)) / sf
            color      = _css_color_to_rgb(fmt.get("color", "#000000"))

            # Insert text at baseline (bottom-left of PDF rect)
            baseline = fitz.Point(x, ph - y - h + font_size)
            page.insert_text(baseline,
                             new_text,
                             fontname=font_name,
                             fontsize=font_size,
                             color=color,
                             overlay=True)

        # ── 3. New Texts ──────────────────────────────────────────────────
        for nt in page_edits.get("newTexts", []):
            x = nt["x"] / sf
            y = nt["y"] / sf

            raw_text = nt.get("text", "")
            new_text = _strip_html(raw_text)
            if not new_text:
                continue

            fmt        = nt.get("format", {})
            font_name  = _pick_font(fmt.get("fontFamily", "Helvetica"),
                                    fmt.get("isBold", False),
                                    fmt.get("isItalic", False))
            font_size  = float(fmt.get("fontSize", 14)) / sf
            color      = _css_color_to_rgb(fmt.get("color", "#000000"))

            # Insert at the PDF coordinate
            baseline = fitz.Point(x, ph - y)
            page.insert_text(baseline,
                             new_text,
                             fontname=font_name,
                             fontsize=font_size,
                             color=color,
                             overlay=True)

        # ── 4. Images ─────────────────────────────────────────────────────
        for img in page_edits.get("images", []):
            data_url = img.get("dataUrl", "")
            if "," not in data_url:
                continue

            try:
                b64_data    = data_url.split(",")[1]
                image_bytes = base64.b64decode(b64_data)
            except Exception:
                continue

            x  = img["x"]      / sf
            y  = img["y"]      / sf
            w  = img["width"]  / sf
            h  = img["height"] / sf

            pdf_rect = fitz.Rect(x, ph - y - h, x + w, ph - y)
            page.insert_image(pdf_rect, stream=image_bytes, overlay=True)

    # Save with garbage collection + deflate for smaller output
    doc.save(output_path, garbage=4, deflate=True, clean=True)
    doc.close()


# ─────────────────────────────────────────────────────────────────
# Compress function (used by /compress endpoint)
# ─────────────────────────────────────────────────────────────────

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

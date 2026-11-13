"""Source-original contact-sheet preview for April-July 2014 Wiki images.

The preview is a downsample for visual classification only. The unmodified,
SHA-1 verified inputs remain in originals for any byte-level investigation.
"""
from __future__ import annotations

import base64
import io
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path("im-results/wiki-may2014")
INDEX = ROOT / "timeline-source-audit.json"
entries = [item for item in json.loads(INDEX.read_text(encoding="utf-8"))
           if item["verified"]]
width, height = 340, 300
sheet = Image.new("RGB", (width * 4, height * 3), "white")
draw = ImageDraw.Draw(sheet)
for index, entry in enumerate(entries):
    file_path = Path(entry["file"])
    with Image.open(file_path) as img:
        img = ImageOps.exif_transpose(img)
        img.thumbnail((width - 15, height - 38), Image.Resampling.LANCZOS)
        cell_x, cell_y = (index % 4) * width, (index // 4) * height
        sheet.paste(img.convert("RGB"),
                    (cell_x + (width - img.width) // 2, cell_y + 8))
        draw.text((cell_x + 8, cell_y + height - 25),
                  entry["name"], fill="black")
out = ROOT / "preview.jpg"
buffer = io.BytesIO()
sheet.save(buffer, format="JPEG", quality=78, optimize=True)
temp = out.with_name(out.name + ".tmp")
temp.write_bytes(buffer.getvalue())
temp.replace(out)
print("CONTACT_SHEET_DIMENSIONS", sheet.size, "BYTES", out.stat().st_size)
print("CONTACT_SHEET_BASE64", base64.b64encode(buffer.getvalue()).decode("ascii"))

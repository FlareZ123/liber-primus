"""Bounded acquisition of Song et al. 2004, DOI 10.1242/jeb.01122, Figure 2B.

Preserve the author-labeled source raster for Agent35's independent graph
annotation. No cipher search and no inferred cell adjacency from OCR.
"""
import hashlib
import json
import urllib.request
from pathlib import Path
import fitz

URLS = (
    "https://hub.hku.hk/bitstream/10722/43070/1/98340.pdf?accept=1",
    "https://hub.hku.hk/bitstream/10722/43070/1/98340.pdf",
)
OUT = Path("im-results/lp2-p27-song2004-figure")
OUT.mkdir(parents=True, exist_ok=True)
attempts = []
for url in URLS:
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "LiberPrimus-research/1.0"})
        with urllib.request.urlopen(request, timeout=25) as response:
            data = response.read(2_000_001)
            final_url = response.geturl()
            status = response.status
        if len(data) > 2_000_000 or not data.startswith(b"%PDF-"):
            raise ValueError(f"Not a bounded PDF: {len(data)} bytes, prefix={data[:12]!r}")
        with fitz.open(stream=data, filetype="pdf") as doc:
            first = doc[0].get_text()
            if "10.1242/jeb.01122" not in first or len(doc) != 8:
                raise ValueError("Unexpected DOI or page count")
            page = doc[3]
            text = page.get_text()
            if "3038" not in text or "Fig. 2" not in text:
                raise ValueError("Expected printed page/figure not found")
            # Render the single figure page at sufficient resolution for manual
            # interpretation; record image bounding boxes to guide crop selection.
            pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
            pix.save(str(OUT / "printed-3038.png"))
            images = [
                {"bbox": list(info["bbox"]), "width": info["width"], "height": info["height"]}
                for info in page.get_image_info()
            ]
        result = {
            "status": "ACQUIRED", "url": url, "final_url": final_url,
            "http_status": status, "pdf_bytes": len(data),
            "pdf_sha256": hashlib.sha256(data).hexdigest(),
            "printed_page": 3038, "page_index": 3,
            "render_scale": 3, "render_size": [pix.width, pix.height],
            "render_sha256": hashlib.sha256((OUT / "printed-3038.png").read_bytes()).hexdigest(),
            "embedded_images": images, "prior_attempts": attempts,
            "attribution": "UNTESTED: independent labeled adjacency needed",
        }
        break
    except (OSError, ValueError, RuntimeError) as exc:
        attempts.append({"url": url, "error": f"{type(exc).__name__}: {exc}"})
else:
    result = {"status": "BLOCKED", "attempts": attempts, "attribution": "UNTESTED"}
(OUT / "acquisition.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(json.dumps(result))

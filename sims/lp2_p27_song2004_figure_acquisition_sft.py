"""Bounded acquisition of Song et al. 2004, DOI 10.1242/jeb.01122, Figure 2B.

Preserve the author-labeled source raster for Agent35's independent graph
annotation. No cipher search and no inferred cell adjacency from OCR.
"""
import hashlib
import json
import urllib.request
from urllib.parse import urljoin, urlsplit
from html.parser import HTMLParser
from pathlib import Path
import fitz
from PIL import Image
from io import BytesIO

URLS = (
    "https://www.researchgate.net/figure/profile/Ak-Soh/publication/8431487/figure/fig1/AS%3A601636183478286%401520452652827/Fig2-A-Scanning-image-of-a-cicada-showing-some-structural-and-morphological.png",
    "https://www.researchgate.net/publication/profile/Ak-Soh/publication/8431487_Experimental_studies_of_the_material_properties_of_the_forewing_of_cicada_Homptera_Cicdidae/links/00b4951a02c8c97469000000/Experimental-studies-of-the-material-properties-of-the-forewing-of-cicada-Homptera-Cicdidae.pdf",
)
OUT = Path("im-results/lp2-p27-song2004-figure")
OUT.mkdir(parents=True, exist_ok=True)
class DownloadLinks(HTMLParser):
    """Use ordinary public document links; never bypass access challenges."""
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
        if tag == "meta" and a.get("name", "").lower() == "citation_pdf_url" and a.get("content"):
            self.links.append(a["content"])

def retrieve(url):
    request = urllib.request.Request(url, headers={"User-Agent": "LiberPrimus-research/1.0"})
    with urllib.request.urlopen(request, timeout=25) as response:
        return response.read(2_000_001), response.geturl(), response.status

attempts = []
for url in URLS:
    try:
        data, final_url, status = retrieve(url)
        if data.startswith(b"\x89PNG\r\n\x1a\n") or data.startswith(b"\xff\xd8\xff"):
            if len(data) > 2_000_000:
                raise ValueError("Oversized image")
            with Image.open(BytesIO(data)) as im:
                im.load()
                if min(im.size) < 150:
                    raise ValueError(f"Undersized figure: {im.size}")
                im.save(OUT / "author-figure2.png")
                size = list(im.size)
            result = {"status": "ACQUIRED_IMAGE", "url": url, "final_url": final_url,
                      "http_status": status, "bytes": len(data),
                      "sha256": hashlib.sha256(data).hexdigest(), "image_size": size,
                      "attribution": "UNTESTED: independently annotate panel B",
                      "prior_attempts": attempts}
            break
        if not data.startswith(b"%PDF-") and b"<html" in data[:1000].lower():
            parser = DownloadLinks()
            parser.feed(data.decode("utf-8", "replace"))
            public = []
            for href in parser.links:
                target = urljoin(final_url, href)
                parsed = urlsplit(target)
                if parsed.scheme in ("http", "https") and parsed.hostname == urlsplit(final_url).hostname and (parsed.path.lower().endswith(".pdf") or "/bitstream/" in parsed.path.lower()):
                    if target not in public:
                        public.append(target)
            attempts.append({"url": final_url, "landing_page_public_document_links": public})
            if len(public) == 1:
                data, final_url, status = retrieve(public[0])
            else:
                raise ValueError("Landing page did not identify exactly one public document link")
        if len(data) > 2_000_000 or not data.startswith(b"%PDF-"):
            raise ValueError(f"Not a bounded PDF: {len(data)} bytes, prefix={data[:12]!r}")
        with fitz.open(stream=data, filetype="pdf") as doc:
            first = "\n".join(doc[i].get_text() for i in range(min(2, len(doc))))
            if "10.1242/jeb.01122" not in first or len(doc) not in (8, 9):
                raise ValueError("Unexpected DOI or page count")
            pages = [i for i in range(len(doc)) if "3038" in doc[i].get_text()
                     and "Fig. 2" in doc[i].get_text()]
            if len(pages) != 1:
                raise ValueError(f"Expected unique printed page/figure, got {pages}")
            page = doc[pages[0]]
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
            "printed_page": 3038, "page_index": pages[0],
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

"""Acquire the actual labeled Boulard & Yap 2013 Fig.4, never infer graph from caption."""
import hashlib
import json
import urllib.request
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
import fitz

OUT = Path("im-results/lp2-p27-boulard2013-figure")
OUT.mkdir(parents=True, exist_ok=True)
URLS = (
    "https://lasef.org/wp-content/uploads/BSEF/118-3/1685_Boulard_%26_Yap.pdf",
    "https://www.persee.fr/doc/bsef_0037-928x_2013_num_118_3_3108",
)
class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "meta" and a.get("name", "").lower() == "citation_pdf_url" and a.get("content"):
            self.links.append(a["content"])

def retrieve(url):
    request = urllib.request.Request(url, headers={"User-Agent": "LiberPrimus-research/1.0"})
    with urllib.request.urlopen(request, timeout=25) as response:
        return response.read(20_000_001), response.geturl(), response.status

attempts = []
result = None
for url in URLS:
    try:
        data, final, status = retrieve(url)
        if not data.startswith(b"%PDF-"):
            parser = Links()
            parser.feed(data.decode("utf-8", "replace"))
            documents = []
            for href in parser.links:
                target = urljoin(final, href)
                p = urlsplit(target)
                if p.scheme in ("http", "https") and p.hostname == urlsplit(final).hostname and ("3108" in p.path and ("pdf" in p.path.lower() or "pdf" in p.query.lower())):
                    if target not in documents:
                        documents.append(target)
            attempts.append({"url": final, "public_document_links": documents})
            if len(documents) != 1:
                raise ValueError("No unique ordinary public PDF link")
            data, final, status = retrieve(documents[0])
        if len(data) > 20_000_000 or not data.startswith(b"%PDF-"):
            raise ValueError("Not a bounded PDF")
        with fitz.open(stream=data, filetype="pdf") as doc:
            # Both article-native and archive cover-sheet pagination are possible.
            text = [page.get_text() for page in doc]
            if not any("isarogensis" in t.lower() for t in text) or not any("285" in t for t in text):
                raise ValueError("Article identity not established")
            plates = [i for i,t in enumerate(text) if "287" in t and i>0 and i<8]
            if len(plates) != 1:
                raise ValueError(f"Ambiguous printed page 287: {plates}")
            i = plates[0]
            page = doc[i]
            pix = page.get_pixmap(matrix=fitz.Matrix(4,4),alpha=False)
            png = OUT / "printed-287.png"
            pix.save(str(png))
            # Embedded image metadata and high resolution render make manual labeling possible.
            images = [{"bbox": list(info["bbox"]), "width": info["width"], "height": info["height"]} for info in page.get_image_info()]
        result = {"status":"ACQUIRED","url":url,"final_url":final,"http_status":status,"pdf_bytes":len(data),"pdf_sha256":hashlib.sha256(data).hexdigest(),"printed_page":287,"page_index":i,"render_size":[pix.width,pix.height],"render_sha256":hashlib.sha256(png.read_bytes()).hexdigest(),"embedded_images":images,"prior_attempts":attempts,"attribution":"UNTESTED: independently annotate the full plate before the frozen graph comparison"}
        break
    except (OSError, ValueError, RuntimeError) as exc:
        attempts.append({"url":url,"error":f"{type(exc).__name__}: {exc}"})
if result is None:
    result = {"status":"BLOCKED","attempts":attempts,"attribution":"UNTESTED"}
(OUT/"acquisition.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
print(json.dumps(result))

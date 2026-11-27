"""Acquire one source-selected candidate, not a wing-image or key sweep.
The p23–26 established art source (Metafysica XIV Fig.4) cites the same 1977
Severa/Zahradnik book as Fig.20, Tibicen haematodes, thieme_124_2.jpg.
Run with the existing manual read-only Python image SFT workflow.
"""
import base64, hashlib, io, json, textwrap
from urllib.request import Request, urlopen
from PIL import Image

URLS = (
    "https://www.metafysica.nl/wings/thieme_124_2.jpg",
    "https://metafysica.nl/wings/thieme_124_2.jpg",
    "http://www.metafysica.nl/wings/thieme_124_2.jpg",
)
for url in URLS:
    try:
        req = Request(url, headers={"User-Agent":"Mozilla/5.0 (compatible; primary-source-research/1.0)"})
        with urlopen(req, timeout=25) as response:
            body = response.read(2_000_001)
            record = {"url":url, "status":response.status, "resolved_url":response.geturl(),
                      "media_type":response.headers.get_content_type(),"bytes":len(body),
                      "sha256":hashlib.sha256(body).hexdigest()}
        if len(body)>2_000_000 or not body.startswith(b"\xff\xd8\xff"):
            raise ValueError("not a bounded JPEG response")
        with Image.open(io.BytesIO(body)) as im:
            im.verify()
        with Image.open(io.BytesIO(body)) as im:
            record["dimensions"]=list(im.size)
        print(json.dumps(record), flush=True)
        for i, chunk in enumerate(textwrap.wrap(base64.b64encode(body).decode(), 1024)):
            print(f"THIEME124_{i:05d}:{chunk}")
        print("THIEME124_END", flush=True)
        break
    except Exception as exc:
        print(json.dumps({"url":url,"error":type(exc).__name__,"detail":str(exc)[:500]}), flush=True)
else:
    raise SystemExit("Exact candidate unavailable; no image-match conclusion")

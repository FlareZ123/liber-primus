"""Fetch only the fixed 1977 Thieme/Severa p90 witness discovered in issue #1333.

Run via the workflow_dispatch GitHub Action. This does not search book pages,
infer hidden key material, or substitute text from later editions.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
from pathlib import Path
import tempfile
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from filelock import FileLock
from PIL import Image

URLS = (
    "https://www.metafysica.nl/wings/thieme_90.jpg",
    "https://metafysica.nl/wings/thieme_90.jpg",
    "http://www.metafysica.nl/wings/thieme_90.jpg",
)
OUT = Path("out_thieme")
OUT.mkdir(exist_ok=True)

observations: list[dict[str, object]] = []
fetched: bytes | None = None

for source_url in URLS:
    try:
        request = Request(source_url, headers={"User-Agent": "Mozilla/5.0 (compatible; primary-source-research/1.0)"})
        with urlopen(request, timeout=25) as response:
            body = response.read(20_000_000)
            status = response.status
            final_url = response.geturl()
            media_type = response.headers.get_content_type()
        row: dict[str, object] = {
            "url": source_url,
            "status": status,
            "resolved_url": final_url,
            "type": media_type,
            "bytes": len(body),
            "sha256": hashlib.sha256(body).hexdigest(),
        }
        if body.startswith(bytes.fromhex("ffd8ff")):
            with Image.open(io.BytesIO(body)) as picture:
                picture.verify()
            with Image.open(io.BytesIO(body)) as picture:
                row["dimensions"] = list(picture.size)
                row["format"] = picture.format
            fetched = body
            observations.append(row)
            break
        row["first_hex"] = body[:48].hex()
        observations.append(row)
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
        observations.append({"url": source_url, "error_type": type(exc).__name__, "detail": str(exc)[:400]})

if fetched is not None:
    target = OUT / "thieme_90_source.jpg"
    with FileLock(str(target) + ".lock"):
        with tempfile.NamedTemporaryFile(dir=OUT, prefix=".tmp_", suffix=".jpg", delete=False) as temp:
            temp.write(fetched)
            temp.flush()
            os.fsync(temp.fileno())
            temp_name = temp.name
        os.replace(temp_name, target)

record = {
    "issue": 1333,
    "source": "1977 Severa/Zahradnik book plate via metafysica figure 4",
    "note": "An external image filename is not independently confirmed printed page numbering or a cipher key.",
    "downloaded_jpeg": fetched is not None,
    "attempts": observations,
}
target_json = OUT / "fetch_observations.json"
with FileLock(str(target_json) + ".lock"):
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=OUT, prefix=".tmp_", suffix=".json", delete=False) as temp:
        json.dump(record, temp, indent=2)
        temp.write("\n")
        temp.flush()
        os.fsync(temp.fileno())
        temp_name = temp.name
    os.replace(temp_name, target_json)
print(json.dumps(record, indent=2))

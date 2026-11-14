"""Two period-uploaded 2015 candidate image objects tied to a dated .bin claim.

Use archival Fandom original-file hashes, not filenames, to classify original bytes.
No binary/script execution. Output compressed preview images through CI logs solely
for human visual triage, without rehosting source copyright in the repository.
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import urllib.error
import urllib.request

from PIL import Image

SOURCES = [
    {
        "name": "2015-01-28 original punchcard analysis",
        "date": "2015-01-28T23:03:42Z",
        "url": "https://static.wikia.nocookie.net/uncovering-cicada/images/6/6b/01_-_9AQaicp_with_basic_puch_card_system_.jpg/revision/latest?cb=20150128230342",
        "sha1": "b2e58675d170df310761077e4fc82a5c205dc4ee",
        "length": 2252434,
    },
    {
        "name": "2015-01-29 CairoKey picture",
        "date": "2015-01-29T04:41:25Z",
        "url": "https://static.wikia.nocookie.net/uncovering-cicada/images/1/11/CairoKey.jpg/revision/latest?cb=20150129044125",
        "sha1": "fb170019b38a6cd5d2336320e616b5e6a52bf35f",
        "length": 231484,
    },
    {
        "name": "2015-01-29 page57 alternate image",
        "date": "2015-01-29T06:14:13Z",
        "url": "https://static.wikia.nocookie.net/uncovering-cicada/images/8/8a/57_%24%282%29.jpg/revision/latest?cb=20150129061413",
        "sha1": "75c3e7f7fa3b4471fc5470d63fc8822382178f93",
        "length": 914595,
    },
]

for item in SOURCES:
    options = [item["url"], item["url"].split("/revision/")[0]]
    last_error = None
    selected = None
    for url in options:
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": "Mozilla/5.0 (LP2 historical attachment review)"}
            )
            with urllib.request.urlopen(req, timeout=18) as response:
                body = response.read(10_000_000)
                media = response.headers.get("Content-Type")
                real_url = response.url
            try:
                im = Image.open(io.BytesIO(body))
                im.load()
            except Exception as err:
                last_error = f"Not a readable image: {err!s}"
                continue
            sha1 = hashlib.sha1(body).hexdigest()
            verified = len(body) == item["length"] and sha1 == item["sha1"]
            im.thumbnail((900, 950))
            if im.mode != "RGB":
                im = im.convert("RGB")
            out = io.BytesIO()
            im.save(out, format="JPEG", quality=78, optimize=True)
            selected = {
                "name": item["name"],
                "original_date": item["date"],
                "source_url": item["url"],
                "actual_url": real_url,
                "media": media,
                "source_sha1": item["sha1"],
                "actual_sha1": sha1,
                "source_length": item["length"],
                "actual_length": len(body),
                "source_verified": verified,
                "preview_size": im.size,
                "preview_base64_jpeg": base64.b64encode(out.getvalue()).decode("ascii"),
            }
            if verified:
                break
        except (urllib.error.URLError, TimeoutError) as err:
            last_error = str(err)
    if selected is not None:
        print("PERIOD_SOURCE_PREVIEW " + json.dumps(selected, separators=(",", ":")))
    else:
        print("PERIOD_SOURCE_PREVIEW_UNAVAILABLE " + json.dumps(
            {"name": item["name"], "url": item["url"], "last_error": last_error}
        ))

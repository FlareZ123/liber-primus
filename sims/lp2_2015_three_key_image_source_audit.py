"""Exact January 2015 historical-key-image source audit for Director #929.

Downloads the three original MediaWiki-listed URLs, tests the original SHA-1
and length, captures original File-page revision and inclusion metadata, and
prints compact reduced previews for visual inspection. No executable content
is run and no post-hoc image decoding parameters are fitted.
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
from pathlib import Path
import urllib.parse
import urllib.request

from PIL import Image

API = "https://uncovering-cicada.fandom.com/api.php"
NAMES = ("Kleokeycertify.jpg", "Kleokeycertify2.jpg", "CairoKey.jpg")
HEADERS = {"User-Agent": "LP2-2015-ExactThreeKeyImages/1.0", "Accept": "application/json"}
OUT = Path("source-key-upload-audit")
OUT.mkdir(exist_ok=True)

def get(url: str) -> bytes:
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=35) as response:
        return response.read(15_000_000)

def api(**params: str) -> dict:
    url = API + "?" + urllib.parse.urlencode(dict(action="query", format="json", **params))
    return json.loads(get(url))

for name in NAMES:
    try:
        registry = api(list="allimages", aiprefix=name, ailimit="50",
                       aiprop="url|sha1|size|timestamp|user|comment")
        image = next(x for x in registry["query"]["allimages"] if x["name"] == name)
        title = "File:" + name
        history = api(prop="revisions", titles=title, rvlimit="50",
                      rvprop="ids|timestamp|user|comment|content", rvslots="main")
        page = next(iter(history["query"]["pages"].values()))
        embedded = api(list="embeddedin", eititle=title, eilimit="50")
        revisions = []
        for rev in page.get("revisions", []):
            slot = rev.get("slots", {}).get("main", {})
            revisions.append({"revid": rev.get("revid"), "timestamp": rev.get("timestamp"),
                              "user": rev.get("user"), "comment": rev.get("comment"),
                              "content": str(slot.get("*", rev.get("*", "")))[:1800]})
        urls = (image["url"], image["url"].split("/revision/")[0])
        attempts = []
        chosen = None
        for url in urls:
            try:
                raw = get(url)
                with Image.open(io.BytesIO(raw)) as im:
                    im.load()
                    original_dimensions = im.size
                    im.thumbnail((1060, 1120))
                    preview = im.convert("RGB")
                    thumbnail = io.BytesIO()
                    preview.save(thumbnail, "JPEG", quality=72, optimize=True)
                match = (len(raw) == image["size"] and
                         hashlib.sha1(raw).hexdigest() == image["sha1"])
                entry = {
                    "url": url, "actual_sha1": hashlib.sha1(raw).hexdigest(),
                    "actual_sha256": hashlib.sha256(raw).hexdigest(),
                    "actual_bytes": len(raw), "source_verified": match,
                    "original_dimensions": original_dimensions,
                    "preview_dimensions": preview.size,
                    "preview_base64": base64.b64encode(thumbnail.getvalue()).decode("ascii")
                }
                attempts.append({k:v for k,v in entry.items() if k != "preview_base64"})
                if chosen is None or (match and not chosen["source_verified"]):
                    chosen = entry
                if match:
                    break
            except Exception as exc:
                attempts.append({"url":url, "error":str(exc)[:400]})
        result = {
            "name":name,"record":{k:image.get(k) for k in
                ("name","timestamp","user","comment","sha1","size","url")},
            "file_page_id": page.get("pageid"),
            "file_page_revisions": revisions,
            "current_embeddedin": [x.get("title") for x in embedded["query"]["embeddedin"]],
            "attempts":attempts,
            "selected": ({k:v for k,v in chosen.items() if k != "preview_base64"}
                         if chosen else None),
        }
        (OUT / (name+".json")).write_text(json.dumps(result,indent=2), encoding="utf-8")
        print("KEY_UPLOAD_RECORD " + json.dumps(result,separators=(",",":")), flush=True)
        if chosen:
            print("KEY_UPLOAD_PREVIEW "+json.dumps({
                "name":name, "source_verified":chosen["source_verified"],
                "data":chosen["preview_base64"]},separators=(",",":")),flush=True)
    except Exception as exc:
        print("KEY_UPLOAD_ERROR "+json.dumps({"name":name,"error":str(exc)}),flush=True)

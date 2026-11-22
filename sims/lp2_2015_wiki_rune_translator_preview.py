"""Targeted original 21 Jan 2015 RuneTranslator upload visual inspection.
No executable content and no bulk re-crawl. Uploaded source hash is checked
before being used for any source-original inference.
"""
import base64
import hashlib
import io
import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from PIL import Image

TARGET="RuneTranslator.jpg"
API="https://uncovering-cicada.fandom.com/api.php"
qs=urlencode({"action":"query","titles":"File:"+TARGET,
              "prop":"imageinfo","iiprop":"url|sha1|size|timestamp|user","format":"json"})
req=Request(API+"?"+qs,headers={"User-Agent":"LP2-2015-SourceReview/1.0"})
with urlopen(req,timeout=20) as response:
    data=json.load(response)
record=next(iter(data["query"]["pages"].values()))
assert record["title"]=="File:"+TARGET
info=record["imageinfo"][0]
assert info["sha1"]=="b0b8143af51a165f045f5c4729a5f954f37b5cae"
assert info["size"]==185253
candidates=[info["url"],info["url"].split("/revision/")[0]]
for u in candidates:
    try:
        req=Request(u,headers={"User-Agent":"Mozilla/5.0 (LP2 source review)"})
        with urlopen(req,timeout=20) as r:
            raw=r.read(8000000)
        src_hash=hashlib.sha1(raw).hexdigest()
        image=Image.open(io.BytesIO(raw))
        image.load()
        image.thumbnail((1100,1000))
        if image.mode!="RGB":image=image.convert("RGB")
        out=io.BytesIO()
        image.save(out,format="JPEG",quality=82,optimize=True)
        record_out={"name":TARGET,"source":API,"source_info":info,
                    "actual":u,"actual_sha1":src_hash,
                    "actual_bytes":len(raw),"source_original":src_hash==info["sha1"] and len(raw)==info["size"],
                    "preview_base64_jpeg":base64.b64encode(out.getvalue()).decode("ascii")}
        print("JAN2015_RUNE_TRANSLATOR_VISUAL "+json.dumps(record_out,separators=(",",":")))
        if record_out["source_original"]:break
    except Exception as e:
        print("JAN2015_RUNE_TRANSLATOR_RETRIEVAL_FAILED "+repr(e))

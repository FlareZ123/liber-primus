#!/usr/bin/env python3
"""Director #2944: bounded archival fv7ly object read and format-led parse."""
from __future__ import annotations
import collections
import datetime
import gzip
import hashlib
import io
import json
import math
import pathlib
import re
import urllib.request
from PIL import Image
import numpy as np

HOST = "fv7lyucmeozzd5j4.onion"
EXPECTED = 5577967
PIN = "fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb"
OUT = pathlib.Path("fv7ly-evidence")
OUT.mkdir(exist_ok=True)
LIMIT = 16 * 1024 * 1024

def digest(data):
    return hashlib.sha256(data).hexdigest()

def retrieve(url, limit=LIMIT):
    req = urllib.request.Request(url, headers={"User-Agent": "LiberPrimusHistoricalResearch/1.0"})
    with urllib.request.urlopen(req, timeout=35) as response:
        data = response.read(limit+1)
        if len(data) > limit:
            raise ValueError("response exceeds bounded source size")
        metadata = {"url": url, "final_url": response.url, "status": response.status,
                    "size": len(data), "sha256": digest(data), "sha1": hashlib.sha1(data).hexdigest(),
                    "headers": {k: response.headers.get(k) for k in ("Date","Last-Modified","Content-Type","Content-Length","ETag")}}
        return data, metadata

def jpeg_end(b, start):
    """Parse actual marker structure; skip length-delimited metadata and stuffed scan bytes."""
    pos = start+2
    scan = False
    saw_sof = saw_sos = False
    while pos < len(b):
        if scan:
            pos = b.find(b"\xff", pos)
            if pos < 0:
                return None
        if b[pos] != 255:
            return None
        while pos < len(b) and b[pos] == 255:
            pos += 1
        if pos >= len(b):
            return None
        m = b[pos]
        pos += 1
        if scan and (m == 0 or 0xD0 <= m <= 0xD7):
            continue
        scan = False
        if m == 0xD9:
            return pos if saw_sof and saw_sos else None
        if m in (0, 0xD8) or 0xD0 <= m <= 0xD7:
            return None
        if m == 1:
            continue
        if pos+2 > len(b):
            return None
        n = int.from_bytes(b[pos:pos+2], "big")
        if n < 2 or pos+n > len(b):
            return None
        if m in (0xC0,0xC1,0xC2,0xC3,0xC5,0xC6,0xC7,0xC9,0xCA,0xCB,0xCD,0xCE,0xCF):
            saw_sof = True
        if m == 0xDA:
            saw_sos = scan = True
        pos += n
    return None

def image_signature(im):
    arr = np.asarray(im.convert("L").resize((32,32),Image.Resampling.LANCZOS),dtype=np.float64)
    basis = np.cos(np.pi/32*(np.arange(32)+0.5)*np.arange(8)[:,None])
    v = basis @ arr @ basis.T
    return v > np.median(v)

def scan_images(payload, known_hashes, known_sigs):
    rows = []
    for direction, b in (("forward",payload),("reversed",payload[::-1])):
        pos = 0
        while (start := b.find(b"\xff\xd8\xff",pos)) >= 0:
            pos = start+1
            end = jpeg_end(b,start)
            if end is None:
                continue
            data = b[start:end]
            try:
                with Image.open(io.BytesIO(data)) as im:
                    if im.format != "JPEG" or im.width*im.height > 60_000_000:
                        continue
                    im.load()
                    dims = [im.width,im.height]
                    sig = image_signature(im)
            except (OSError,ValueError):
                continue
            sha = digest(data)
            source_range = [start,end] if direction=="forward" else [len(b)-end,len(b)-start]
            near = sorted((int(np.count_nonzero(sig!=v)),name) for name,v in known_sigs)[:3]
            row = {"direction":direction,"range":source_range,"bytes":len(data),"sha256":sha,"dimensions":dims,
                   "exact_known_files":known_hashes.get(sha,[]),"nearest_perceptual":near}
            (OUT/f"image-{len(rows):02}.jpg").write_bytes(data)
            rows.append(row)
            pos = end
    return sorted(rows,key=lambda r:r["range"])

def main():
    # Positive control: the already-established mixed-direction four-image container.
    p = pathlib.Path("resources/liber-primus")
    pages = [(p/f"{i:02}.jpg").read_bytes() for i in range(6,10)]
    control = pages[0]+pages[1]+(pages[2]+pages[3])[::-1]
    assert digest(control) == "8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a"
    assert jpeg_end(control,0)==len(pages[0])
    assert jpeg_end(control,len(pages[0]))==len(pages[0])+len(pages[1])
    assert jpeg_end(control[::-1],0)==len(pages[2])
    assert jpeg_end(control[::-1],len(pages[2]))==len(pages[2])+len(pages[3])
    # The target must be the specifically reported archive object, not any web response.
    report={"utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"expected_size":EXPECTED,
            "positive_control":"known four-image container SHA256 and all four JPEG boundaries pass","attempts":[]}
    meta_url=f"https://archive.org/metadata/{HOST}"
    archive_file = None
    try:
        raw, meta=retrieve(meta_url,2*1024*1024)
        d=json.loads(raw)
        archive_file=next((f for f in d.get("files",[]) if f.get("name")==".htaccess"),None)
        report["archive_metadata"]={"request":meta,"item_date":d.get("metadata",{}).get("date"),
          "publicdate":d.get("metadata",{}).get("publicdate"),"file":archive_file}
        (OUT/"archive-metadata.json").write_bytes(raw)
    except Exception as e:
        report["attempts"].append({"url":meta_url,"error":str(e)})
    urls=[f"https://archive.org/download/{HOST}/.htaccess",
          f"https://raw.githubusercontent.com/Dukotah/cicada3301/{PIN}/corpus/D-archives/iarchive/items/{HOST}/.htaccess",
          f"https://raw.githubusercontent.com/Dukotah/cicada3301/master/corpus/D-archives/iarchive/items/{HOST}/.htaccess"]
    source=None
    for url in urls:
        try:
            data,meta=retrieve(url)
            report["attempts"].append(meta)
            if len(data)!=EXPECTED:
                continue
            if archive_file and archive_file.get("sha1") and meta["sha1"]!=archive_file["sha1"]:
                continue
            source=data
            report["selected"]=meta
            (OUT/"raw.htaccess").write_bytes(data)
            break
        except Exception as e:
            report["attempts"].append({"url":url,"error":str(e)})
    if source is None:
        report["decision"]="exact reported object unavailable on bounded public mirrors; no decode attempted"
    else:
        clean=re.sub(rb"\s+",b"",source)
        ishex=bool(clean and len(clean)%2==0 and re.fullmatch(rb"[0-9A-Fa-f]+",clean))
        payload=bytes.fromhex(clean.decode("ascii")) if ishex else source
        report["framing"]={"hex":ishex,"binary_bytes":len(payload),"sha256":digest(payload),"header_hex":payload[:8].hex()}
        operation="hex" if ishex else "raw"
        # Only use gzip / bitwise complement when the source header itself is decisive.
        if payload.startswith(b"\x1f\x8b\x08"):
            operation+="+gzip"
            with gzip.GzipFile(fileobj=io.BytesIO(payload)) as gz:
                payload=gz.read(LIMIT+1)
        elif payload.startswith(b"\xe0\x74\xf7"):
            operation+="+complement+gzip"
            compressed=payload.translate(bytes(range(255,-1,-1)))
            with gzip.GzipFile(fileobj=io.BytesIO(compressed)) as gz:
                payload=gz.read(LIMIT+1)
        if len(payload)>LIMIT:
            raise ValueError("decoded payload too large")
        (OUT/"payload.bin").write_bytes(payload)
        hist=collections.Counter(payload)
        report["payload"]={"operation":operation,"bytes":len(payload),"sha256":digest(payload),
                           "entropy":-sum(n/len(payload)*math.log2(n/len(payload)) for n in hist.values())}
        known_hashes=collections.defaultdict(list)
        known_sigs=[]
        for f in pathlib.Path("resources").rglob("*"):
            if f.suffix.lower() not in (".jpg",".jpeg",".png",".bmp",".gif") or not f.is_file():
                continue
            data=f.read_bytes()
            known_hashes[digest(data)].append(str(f))
            try:
                with Image.open(io.BytesIO(data)) as im:
                    if im.width*im.height<=60_000_000:
                        known_sigs.append((str(f),image_signature(im)))
            except (OSError,ValueError):
                pass
        report["known_image_count"]=len(known_sigs)
        report["images"]=scan_images(payload,known_hashes,known_sigs)
        report["decision"]="parsed actual source; inspect exact matches and unexplained ranges before follow-up"
    (OUT/"report.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,indent=2))

if __name__=="__main__":
    main()

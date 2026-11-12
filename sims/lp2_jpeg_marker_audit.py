#!/usr/bin/env python3
"""Read JPEG marker structure without re-encoding or modifying source bytes."""
from __future__ import annotations
import hashlib
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

SOF = {0xC0:"SOF0",0xC1:"SOF1",0xC2:"SOF2",0xC3:"SOF3",
       0xC5:"SOF5",0xC6:"SOF6",0xC7:"SOF7",0xC9:"SOF9",
       0xCA:"SOF10",0xCB:"SOF11",0xCD:"SOF13",0xCE:"SOF14",0xCF:"SOF15"}
def name(m):
    if m in SOF: return SOF[m]
    if 0xE0 <= m <= 0xEF: return f"APP{m-0xE0}"
    return {0xC4:"DHT",0xDB:"DQT",0xDD:"DRI",0xDA:"SOS",
            0xFE:"COM",0xD8:"SOI",0xD9:"EOI"}.get(m, f"M{m:02X}")

def audit(path: Path):
    data=path.read_bytes()
    if not data.startswith(b"\xff\xd8"):
        return {"file":str(path),"error":"missing SOI"}
    i=2; markers=[]; scans=0; error=None; trailing=0
    while i < len(data):
        if data[i] != 0xFF:
            error=f"non-marker byte at offset {i}"
            break
        while i < len(data) and data[i] == 0xFF: i += 1
        if i >= len(data): error="truncated marker"; break
        m=data[i]; i+=1
        if m == 0xD9:
            markers.append({"name":"EOI"})
            trailing=len(data)-i
            break
        if m == 0x00 or 0xD0 <= m <= 0xD7:
            error=f"unexpected standalone marker FF{m:02X} outside scan"
            break
        if i+2 > len(data):
            error="truncated segment length"; break
        length=int.from_bytes(data[i:i+2],"big")
        if length < 2 or i+length > len(data):
            error=f"invalid segment length {length} at offset {i}"
            break
        payload=data[i+2:i+length]
        item={"name":name(m),"payload_length":len(payload)}
        if m in (0xDB,0xC4,0xDD,0xFE) or 0xE0 <= m <= 0xEF:
            item["payload_sha256"]=hashlib.sha256(payload).hexdigest()
        if m in SOF and len(payload)>=6:
            ncomp=payload[5]
            item["precision"]=payload[0]
            item["height"]=int.from_bytes(payload[1:3],"big")
            item["width"]=int.from_bytes(payload[3:5],"big")
            item["components"]=[{"id":payload[6+3*k],"sampling":payload[7+3*k],
                                 "qtable":payload[8+3*k]} for k in range(ncomp)]
        if m == 0xDD and len(payload)==2:
            item["restart_interval"]=int.from_bytes(payload,"big")
        if m == 0xDA: scans += 1
        markers.append(item)
        i += length
        if m == 0xDA:
            # Entropy-coded bytes: FF00 is stuffed data; FFD0..FFD7 are restart markers.
            while i < len(data)-1:
                if data[i] != 0xFF:
                    i += 1; continue
                j=i+1
                while j < len(data) and data[j] == 0xFF: j += 1
                if j >= len(data): i=j; break
                nxt=data[j]
                if nxt == 0x00 or 0xD0 <= nxt <= 0xD7:
                    i=j+1; continue
                break
    if not markers or markers[-1]["name"] != "EOI":
        if error is None: error="missing EOI"
    return {"file":str(path),"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest(),
            "markers":markers,"scan_count":scans,"trailing_bytes":trailing,"error":error}

def main():
    paths=[Path(x) for x in sys.argv[1:]]
    if not paths:
        raise SystemExit(f"usage: {Path(sys.argv[0]).name} image.jpg [image.jpg ...]")
    results=[audit(p) for p in paths]
    profiles=defaultdict(list)
    for r in results:
        signature=tuple(x["name"] for x in r.get("markers",[]))
        profiles[" ".join(signature)].append(Path(r["file"]).name)
    print(json.dumps({"files":results,
                      "profile_counts":{k:len(v) for k,v in profiles.items()},
                      "profiles":dict(profiles)},indent=2))
if __name__ == "__main__": main()

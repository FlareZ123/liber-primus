"""New finite p27 source family: Myers 1929 wing figures and 2011 Commons diagram.
Uses the previously frozen native SIFT gate, including the independently
motivated reflected orientation (left/right insect wings). No cipher scoring.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import cv2
import fitz
import numpy as np
from lp2_p27_historical_threeplate_registration_sft import (
    TARGET, EXPECTED_SHA, fetch_bytes, match, separate_plate_regions,
)
OUT = Path("im-results/lp2-p27-myers-commons")
OUT.mkdir(parents=True, exist_ok=True)
SOURCES = (
    ("myers1929", "https://orthsoc.org/sina/c700lm29sec02.pdf"),
    ("commons2011", "https://upload.wikimedia.org/wikipedia/commons/c/cc/Cicada_wing_structure.png"),
)
raw = TARGET.read_bytes()
assert hashlib.sha256(raw).hexdigest() == EXPECTED_SHA
wing = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)[516:855,643:1787].copy()
plant = cv2.warpAffine(wing, cv2.getRotationMatrix2D((wing.shape[1]/2, wing.shape[0]/2), 4., .87), (1300,430), borderValue=255)
positive = match(plant, wing)
assert positive["valid_noncollapsed"]
# Explicit mirrored native plant, expected recovery after unreflection.
mirror_positive = match(cv2.flip(cv2.flip(plant,1),1), wing)
assert mirror_positive["valid_noncollapsed"]
records=[]
for name,url in SOURCES:
    record={"name":name,"url":url}
    try:
        data=fetch_bytes(url)
        record.update(bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
        if name=="myers1929":
            with fitz.open(stream=data,filetype="pdf") as doc:
                # Printed 48-52, beginning from printed 40; also bracket
                # one page on each side for scan pagination uncertainty.
                frames=[]
                for i in range(7,14):
                    if i>=len(doc): continue
                    pix=doc[i].get_pixmap(matrix=fitz.Matrix(2,2),colorspace=fitz.csGRAY,alpha=False)
                    img=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width).copy()
                    frames.append((f"pdf-index-{i}",img))
        else:
            assert hashlib.sha1(data).hexdigest()=="4d5190e0e46c593ebdb58cac1350b041d237847a"
            img=cv2.imdecode(np.frombuffer(data,dtype=np.uint8),cv2.IMREAD_GRAYSCALE)
            assert img is not None and img.shape==(760,1000)
            frames=[("2011-original",img)]
        hits=[]
        for label,img in frames:
            cv2.imwrite(str(OUT/f"{name}-{label}.png"),img)
            for tag,region in [(label+"-full",img),*[(label+"-"+t,v) for t,v in separate_plate_regions(img)]]:
                for orientation,view in (("native",region),("horizontal-reflection",cv2.flip(region,1))):
                    hits.append({"frame":tag,"orientation":orientation,**match(view,wing)})
        record["tested_frames"]=len(hits)
        record["best"]=max(hits,key=lambda x:(x.get("valid_noncollapsed",False),x["affine_inliers"],x["target_span_x"]))
        record["all_frames"]=hits
        record["status"]="MATCH" if record["best"].get("valid_noncollapsed",False) else "NO_EXACT_SIMILARITY_MATCH"
    except (OSError,ValueError,RuntimeError,AssertionError) as e:
        record.update(status="BLOCKED",error=f"{type(e).__name__}: {e}")
    records.append(record)
    print(json.dumps({k:v for k,v in record.items() if k!="all_frames"}),flush=True)
report={"native_positive":positive,"mirrored_positive":mirror_positive,"sources":records,
        "scope":"exact-parent similarity only; no general redraw or face-order exclusion"}
(OUT/"registration.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")

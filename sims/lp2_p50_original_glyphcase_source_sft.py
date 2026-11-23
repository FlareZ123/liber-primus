#!/usr/bin/env python3
"""Source-original printed base60 I/l glyph discrimination, no OCR.

Run from repository root: python sims/lp2_p50_original_glyphcase_source_sft.py
Optional independent original image zip: --zip /path/liber-primus-jpegs.zip
"""
import argparse, hashlib, io, json, zipfile
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
ap=argparse.ArgumentParser();ap.add_argument("--zip",default=None);args=ap.parse_args()
raw=(root/"resources/liber-primus/lp2-grid-256.json").read_bytes()
grid=json.loads(raw);assert [x["rows"] for x in grid["pages"]]==[10,13,9]
tokens=[v for p in grid["pages"] for v in p["tokens"]]
assert len(tokens)==256 and all(len(t)==2 for t in tokens)
if args.zip:
    z=zipfile.ZipFile(args.zip)
    def source(n):
        hits=[k for k in z.namelist() if k.endswith("/"+str(n)+".jpg") or k==str(n)+".jpg"]
        assert len(hits)==1
        return z.read(hits[0])
else:
    def source(n): return (root/"resources/liber-primus"/f"{n}.jpg").read_bytes()
imgs={};sha={}
for n in (66,67,68):
    b=source(n);sha[n]=hashlib.sha256(b).hexdigest()
    im=Image.open(io.BytesIO(b)).convert("L")
    assert im.size==(2400,3600)
    imgs[n]=im

# Entire grid is uniform 179-source-pixel row pitch. Source page66 starts
# at y1250 after its preceding runes; pages67/68 start at y630.
# The central x range excludes the repeated floral frame. Each Latin glyph
# has one connected horizontal projection component; lowercase dotted i
# adds an extra component after, but not before any of these target columns.
def stem(cell,threshold):
    row,col=divmod(cell,8)
    if row<10: pg,local=66,row
    elif row<23: pg,local=67,row-10
    else: pg,local=68,row-23
    y=(1250 if pg==66 else 630)+179*local
    im=imgs[pg]; x0,x1=650,1760
    crop=im.crop((x0,y,x1,y+69));pix=crop.load()
    proj=[sum(pix[x,k]<threshold for k in range(69)) for x in range(crop.width)]
    groups=[];start=None
    for x,n in enumerate(proj):
        if n>=4 and start is None:start=x
        if n<4 and start is not None:
            groups.append((x0+start,x0+x));start=None
    assert len(groups)>=2*(col+1),(cell,len(groups))
    a,b=groups[2*col+1];glyph=im.crop((a,y,b,y+69));g=glyph.load()
    ys=[i for i in range(69) if any(g[x,i]<threshold for x in range(b-a))]
    assert ys
    return dict(height=ys[-1]-ys[0]+1,top=ys[0],page=pg,row=row,col=col,x=[a,b])
cand=[i for i,t in enumerate(tokens) if any(c in t for c in "Il")]
cap=[i for i,t in enumerate(tokens) if t[1]=="L"]
asc=[i for i,t in enumerate(tokens) if t[1]=="h"]
assert cand==[2,25,45,50,90,165,175,182,199,246]
assert cap==[30,82,128,133,183,187,207,241]
assert asc==[126]
trials=[]
for threshold in [70,90,120,140,180]:
    caps=[stem(i,threshold)["height"] for i in cap]
    lows=[stem(i,threshold)["height"] for i in asc]
    assert caps==[67]*8 and lows==[68]
    cells=[]
    for i in cand:
        item=stem(i,threshold)
        assert item["height"] in [67,68]
        item.update(cell=i,source_token=tokens[i],
            pixel_case="I" if item["height"]==67 else "l")
        cells.append(item)
    trials.append(dict(threshold=threshold,
        case="".join(x["pixel_case"] for x in cells),cells=cells))
assert len({x["case"] for x in trials})==1
assert trials[0]["case"]=="lIllIIIllI"
assert all(x["source_token"][1]==x["pixel_case"] for x in trials[2]["cells"])
bits="".join("1" if x=="I" else "0" for x in trials[2]["case"])
assert bits=="0100111001" and int(bits,2)==313
print(json.dumps({
    "status":"PASS","source_jpeg_sha256":sha,
    "case_source":"8 unmistakable capital L stems 67 px vs lowercase h stem 68 px",
    "all_original_thresholds":[x["threshold"] for x in trials],
    "ten_source_cell_indices":cand,"pixel_inferred_case":trials[2]["case"],
    "case_bits_I1_l0":bits,"case_integer":313,
    "all_10_match_current_json":True,
    "independent_raster_inference":trials[2]["cells"],
    "interpretation":"Ten physical glyph classes fixed; no cryptographic key or unknown LP2 plaintext recovered."
},indent=2))

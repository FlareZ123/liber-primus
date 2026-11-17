"""Balanced source-image blind LP2 p55 illustration packet, single reproducible SFT.

Requirements: Python 3.11+, Pillow 12.3.0 and filelock 3.29.0.
Only provide the public ZIP to human reviewers. Withhold private-reveal.json.
"""
from __future__ import annotations
import hashlib
import io
import json
import os
import random
import tempfile
import zipfile
from pathlib import Path
from PIL import Image, ImageDraw
from filelock import FileLock

ROOT=Path(__file__).resolve().parents[1]
ARCHIVE=Path(os.environ.get("LP2_SOURCE_ZIP",str(ROOT/"liber-primus-jpegs.zip")))
OUT=Path(os.environ.get("LP2_GHOST_TREE_V2_OUT",str(ROOT/"im-results/ghost-tree-balanced-v2")))
SOURCES=(
 ("tree-terminal",72,(625,1430,1735,2510),"candidate"),
 ("tree-earlier",49,(650,2070,1760,3150),"known-tree-reuse"),
 ("thin-branch",25,(50,850,550,2800),"negative"),
 ("spiral",20,(1790,1150,2270,2490),"negative"),
 ("flower-right",57,(1790,800,2360,2750),"negative"),
 ("frame-template-left",71,(30,900,570,2700),"same-document-template"),
 ("solved-ornament",74,(700,1950,1660,3270),"negative"),
 ("insect-wing",44,(650,465,1820,890),"negative"),
 ("wood-cross",39,(520,2100,1840,2660),"negative"),
 ("insect-p14",31,(980,2000,1880,2600),"negative"),
 ("insert-calibration",41,(80,1100,530,2800),"planted-positive"),
)
EXPECTED={
 20:"1453ef27ea607c6ea378d6472c908e77c2881caba33c72d1893caddee8dc1117",
 25:"6b1026dfdfb447a5a76819883fe576254e8a47fdf1e97ecf1825166833bc6f00",
 31:"861037ea304b4d3b347cce18d97f25146f6f318cb748e59e6140d9eeaef6abd4",
 39:"e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7",
 41:"62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80",
 44:"c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e",
 49:"c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72",
 57:"3f5af995b39f94f268d4aa94825a10f2429f4a3affa1921a7f627e6d1bfcfb69",
 71:"dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4",
 72:"a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
 74:"1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b",
}
def digest(data:bytes)->str:
 return hashlib.sha256(data).hexdigest()
def atomic_bytes(path:Path,data:bytes)->None:
 path.parent.mkdir(parents=True,exist_ok=True)
 with FileLock(str(path)+".lock"):
  with tempfile.NamedTemporaryFile(dir=path.parent,prefix=".v2-",delete=False) as h:
   staged=Path(h.name);h.write(data);h.flush();os.fsync(h.fileno())
  try:os.replace(staged,path)
  finally:staged.unlink(missing_ok=True)
def original(number:int)->bytes:
 if ARCHIVE.is_file():
  with zipfile.ZipFile(ARCHIVE) as zf:
   value=zf.read(f"liber-primus-jpegs/{number:02d}.jpg")
 else:value=(ROOT/"resources/liber-primus"/f"{number:02d}.jpg").read_bytes()
 assert digest(value)==EXPECTED[number],(number,"source SHA mismatch")
 assert Image.open(io.BytesIO(value)).size==(2400,3600)
 return value
def normalize(source:bytes,bbox:tuple[int,int,int,int])->Image.Image:
 crop=Image.open(io.BytesIO(source)).convert("L").crop(bbox)
 crop=crop.point(lambda p:max(0,255-3*(255-p)))
 crop.thumbnail((900,900),Image.Resampling.LANCZOS)
 image=Image.new("L",(1000,1000),255)
 image.paste(crop,((1000-crop.width)//2,(1000-crop.height)//2))
 return image
def png(image:Image.Image)->bytes:
 out=io.BytesIO();image.save(out,format="PNG");return out.getvalue()
def main()->None:
 assert len(SOURCES)==len({n for _,n,_,_ in SOURCES})==11
 original_bytes={number:original(number) for _,number,_,_ in SOURCES}
 seed=hashlib.sha256(b"lp2-v2-balanced-2026-11-17"+
  b"".join(bytes.fromhex(EXPECTED[n]) for _,n,_,_ in SOURCES)).digest()
 items=list(SOURCES);random.Random(int.from_bytes(seed,"big")).shuffle(items)
 panels={};private={};public_images=[];positive_delta=0
 for i,(name,number,box,role) in enumerate(items):
  label=f"{i+1:02d}"
  normalized=normalize(original_bytes[number],box);base=normalized.copy()
  if role=="planted-positive":
   points=[(671,462),(676,476),(691,476),(679,485),(684,499),
           (671,491),(658,499),(663,485),(651,476),(666,476),(671,462)]
   ImageDraw.Draw(normalized).line(points,fill=45,width=2,joint="curve")
   positive_delta=sum(a!=b for a,b in zip(base.tobytes(),normalized.tobytes()))
   assert positive_delta>=50
  image_bytes=png(normalized);panels[label]=normalized
  atomic_bytes(OUT/f"{label}.png",image_bytes)
  public_images.append({"label":label,"png_sha256":digest(image_bytes),
                        "pixels":"1000x1000","treatment":"uniform"})
  private[label]={"source_code":name,"role":role,"original_jpeg":f"{number:02d}.jpg",
                  "bounds_xyxy":box,"original_sha256":EXPECTED[number]}
 assert positive_delta
 assert sum(v["role"]=="candidate" for v in private.values())==1
 assert sum(v["role"]=="planted-positive" for v in private.values())==1
 assert sum(v["role"] in {"negative","same-document-template","known-tree-reuse"}
            for v in private.values())==9
 reveal={"private_answer_map":private,"planted_changed_pixels":positive_delta,
         "shuffle_seed_sha256":digest(seed)}
 commitment=digest(json.dumps(reveal,sort_keys=True,separators=(",",":")).encode())
 public={
  "title":"Original LP2 art-only blind review, version 2",
  "question":"Does any illustration include a distinct deliberately drawn SECOND object or symbol beyond its dominant subject? Mark exact pixels and compare against other panels. Leave negative/uncertain if none.",
  "design":"11 unique source JPEGs, 1 candidate, 9 original negatives, 1 source-shaped planted positive. All run through identical grayscale, 3x black-ink, aspect-preserving 900px maximum and white 1000px centering. No panel is shown twice; no labels identify source or class.",
  "origin":"Unaltered 2400x3600 Liber Primus JPEGs; crop bboxes and secret mapping withheld until blinded review completes.",
  "commitment_sha256":commitment,"panel_count":len(panels),"images":public_images,
 }
 page=Image.new("RGB",(4*300,3*322),(241,241,241))
 painter=ImageDraw.Draw(page)
 for i in range(len(items)):
  label=f"{i+1:02d}"
  image=panels[label].resize((280,280),Image.Resampling.LANCZOS).convert("RGB")
  x=(i%4)*300+10;y=(i//4)*322+10
  page.paste(image,(x,y));painter.text((x+10,y+290),label,fill=(25,25,25))
 atomic_bytes(OUT/"contact.png",png(page))
 atomic_bytes(OUT/"manifest.json",(json.dumps(public,indent=2)+"\n").encode())
 atomic_bytes(OUT/"private-reveal.json",(json.dumps(reveal,indent=2)+"\n").encode())
 names=[f"{i+1:02d}.png" for i in range(len(items))]+["contact.png","manifest.json"]
 out=io.BytesIO()
 with zipfile.ZipFile(out,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=7) as zf:
  for name in names:
   info=zipfile.ZipInfo(name,date_time=(2026,1,1,0,0,0))
   info.compress_type=zipfile.ZIP_DEFLATED
   zf.writestr(info,(OUT/name).read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=7)
 atomic_bytes(OUT.parent/"ghost-tree-blinded-review-v2.zip",out.getvalue())
 with zipfile.ZipFile(OUT.parent/"ghost-tree-blinded-review-v2.zip") as zf:
  assert "private-reveal.json" not in zf.namelist()
  assert len(zf.namelist())==len(items)+2
 assert digest(png(page))=="8f95700cd5a89c72e8181a8e5b2d2233f1a262efbfc8969fc48d8f118a337411"
 assert commitment=="ef57630f9a399614c4507dee4d4f2d9d93676eb0a867138460d93ab3e5f5b890"
 print("v2 panels",len(items),"negative_controls",9,"planted_changed_pixels",positive_delta)
 print("v2 public_zip_sha256",digest(out.getvalue()))
 print("v2 contact_sha256",digest(png(page)))
 print("v2 withheld_private_reveal_commitment",commitment)
if __name__=="__main__":main()

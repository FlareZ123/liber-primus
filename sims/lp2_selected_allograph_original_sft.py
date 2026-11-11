#!/usr/bin/env python3
"""Bounded original-JPEG glyph-form gate for GP C, NG and AE.

Run from the repository:
    python sims/lp2_selected_allograph_original_sft.py

This is a three-rune source gate, not a claim about all 29 GP symbols.
"""
from __future__ import annotations
import argparse, io, json
from pathlib import Path
from zipfile import ZipFile
import cv2
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"resources"/"liber-primus"
THRESHOLD=160
MATCH_THRESHOLD=.90
IMAGE_BOUNDS=(540,3250,440,2100)  # y1,y2,x1,x2
NMS=np.ones((105,36),dtype=np.uint8)

# Fixed source crops from solved physical p56 / original scan 73.jpg.
# (x1,y1,x2,y2), exclusive upper bounds.
TEMPLATES={
 "C":{"index":5,"box":(961,1050,1014,1164)},
 "NG":{"index":21,"box":(601,2077,651,2192)},
 "AE":{"index":25,"box":(1015,1050,1049,1164)},
}
# Both are first runes of annotated red spans.
EXCEPTIONS={"NG":{33:91},"AE":{56:0}}
P33_NG_BOX=(841,1914,875,2028)
TH_CONTROL_BOX=(908,1050,942,1164)
LARGE_AE_BOX=(601,670,750,1166)
REJECTED={
 "TH":{"index":2,"box":(908,1050,942,1164)},
 "M":{"index":19,"box":(917,861,970,975)},
 "W":{"index":7,"box":(1201,861,1236,975)},
}
SENSITIVITY_PAGES=(0,17,33,53,56,57)

def best_iou(a,b,shift=1):
 h=max(a.shape[0],b.shape[0])+2*shift
 w=max(a.shape[1],b.shape[1])+2*shift
 aa=np.zeros((h,w),dtype=bool)
 aa[shift:shift+a.shape[0],shift:shift+a.shape[1]]=a.astype(bool)
 best=0.0
 for dy in range(-shift,shift+1):
  for dx in range(-shift,shift+1):
   bb=np.zeros((h,w),dtype=bool)
   y0,x0=shift+dy,shift+dx
   bb[y0:y0+b.shape[0],x0:x0+b.shape[1]]=b.astype(bool)
   union=np.logical_or(aa,bb).sum()
   if union: best=max(best,float(np.logical_and(aa,bb).sum()/union))
 return best

def load_image(page,archive):
 name=f"{page+17:02}.jpg"
 if archive is not None:
  raw=archive.read(f"liber-primus-jpegs/{name}")
  return np.asarray(Image.open(io.BytesIO(raw)).convert("L"))
 return np.asarray(Image.open(SOURCE/name).convert("L"))

def make_template(image,box,threshold=THRESHOLD):
 x1,y1,x2,y2=box
 return (image[y1:y2,x1:x2]<threshold).astype(np.uint8)*255

def detect_at_threshold(image,template,threshold):
 y1,y2,x1,x2=IMAGE_BOUNDS
 field=(image[y1:y2,x1:x2]<threshold).astype(np.uint8)*255
 score=cv2.matchTemplate(field,template,cv2.TM_CCOEFF_NORMED)
 maxima=(score==cv2.dilate(score,NMS))&(score>=MATCH_THRESHOLD)
 ys,xs=np.where(maxima)
 return [(int(x+x1),int(y+y1),float(score[y,x])) for x,y in zip(xs.tolist(),ys.tolist())]

def detect(image,template,morphology=None):
 y1,y2,x1,x2=IMAGE_BOUNDS
 field=(image[y1:y2,x1:x2]<THRESHOLD).astype(np.uint8)*255
 templ=template
 if morphology in ("erode","dilate"):
  op=cv2.erode if morphology=="erode" else cv2.dilate
  kernel=np.ones((3,3),dtype=np.uint8)
  field=op(field,kernel); templ=op(templ,kernel)
 score=cv2.matchTemplate(field,templ,cv2.TM_CCOEFF_NORMED)
 maxima=(score==cv2.dilate(score,NMS))&(score>=MATCH_THRESHOLD)
 ys,xs=np.where(maxima)
 return [(int(x+x1),int(y+y1),float(score[y,x])) for x,y in zip(xs.tolist(),ys.tolist())]

def expected_count(indices,rune_index,page,name):
 count=sum(value==rune_index for value in indices)
 if page in EXCEPTIONS.get(name,{}):
  offset=EXCEPTIONS[name][page]
  if indices[offset]!=rune_index: raise AssertionError(f"{name} exception p{page}:{offset} changed")
  count-=1
 return count

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument("--archive",type=Path)
 parser.add_argument("--corpus",type=Path,default=SOURCE/"lp2-corpus.json")
 parser.add_argument("--ink",type=Path,default=SOURCE/"lp2-ink-annotations.json")
 args=parser.parse_args()
 corpus=json.loads(args.corpus.read_text(encoding="utf-8"))
 annotation=json.loads(args.ink.read_text(encoding="utf-8"))
 pages={p["page"]:p for p in corpus["pages"]}
 ink_pages={p["page"]:p for p in annotation["pages"]}
 if len(pages)!=58: raise AssertionError("Expected all 58 original LP2 page slots")
 for name,spec in TEMPLATES.items():
  if corpus["translit"][spec["index"]]!=name: raise AssertionError(f"GP index changed for {name}")
 for name,by_page in EXCEPTIONS.items():
  for page,offset in by_page.items():
   if pages[page]["indices"][offset]!=TEMPLATES[name]["index"]: raise AssertionError("Exception rune changed")
   if not any(s["start"]==offset for s in ink_pages[page]["red_spans"]):
    raise AssertionError(f"p{page}:{offset} is not a red-span first rune")

 archive=ZipFile(args.archive) if args.archive else None
 try:
  p56=load_image(56,archive)
  templates={n:make_template(p56,s["box"]) for n,s in TEMPLATES.items()}
  rejected_templates={n:make_template(p56,s["box"]) for n,s in REJECTED.items()}
  matched={n:0 for n in TEMPLATES}
  scores={n:[] for n in TEMPLATES}
  ious={n:[] for n in TEMPLATES}
  page_rows=[]
  for page in range(58):
   image=load_image(page,archive)
   row={"page":page,"counts":{}}
   for name,spec in TEMPLATES.items():
    hits=detect(image,templates[name])
    expected=expected_count(pages[page]["indices"],spec["index"],page,name)
    if len(hits)!=expected:
     raise AssertionError(f"p{page} {name}: {len(hits)} hits != {expected} ordinary instances")
    matched[name]+=len(hits)
    row["counts"][name]={"expected":expected,"matched":len(hits)}
    binary=(image<THRESHOLD).astype(np.uint8)
    for x,y,score in hits:
     scores[name].append(score)
     crop=binary[y:y+templates[name].shape[0],x:x+templates[name].shape[1]]
     ious[name].append(best_iou(crop,templates[name]>0))
   page_rows.append(row)

  sensitivity={}
  for page in SENSITIVITY_PAGES:
   image=load_image(page,archive); sensitivity[str(page)]={}
   for threshold in (128,192):
    sensitivity[str(page)][f"threshold_{threshold}"]={}
    for name,spec in TEMPLATES.items():
     template=make_template(p56,spec["box"],threshold)
     hits=detect_at_threshold(image,template,threshold)
     expected=expected_count(pages[page]["indices"],spec["index"],page,name)
     if len(hits)!=expected: raise AssertionError(f"p{page} {name}: threshold {threshold} changed count")
     sensitivity[str(page)][f"threshold_{threshold}"][name]=len(hits)
   sensitivity[str(page)]["morphology_3x3"]={}
   for morph in ("erode","dilate"):
    sensitivity[str(page)]["morphology_3x3"][morph]={}
    for name,spec in TEMPLATES.items():
     hits=detect(image,templates[name],morphology=morph)
     expected=expected_count(pages[page]["indices"],spec["index"],page,name)
     if len(hits)!=expected: raise AssertionError(f"p{page} {name}: {morph} changed count")
     sensitivity[str(page)]["morphology_3x3"][morph][name]=len(hits)

  rejected={}
  for name,spec in REJECTED.items():
   observed=sum(len(detect(load_image(page,archive),rejected_templates[name])) for page in range(58))
   expected=sum(sum(v==spec["index"] for v in p["indices"]) for p in pages.values())
   rejected[name]={"template_hits":observed,"transcription_occurrences":expected}

  p33=load_image(33,archive)
  x1,y1,x2,y2=P33_NG_BOX
  anomaly=(p33[y1:y2,x1:x2]<THRESHOLD).astype(np.uint8)*255
  th=make_template(p56,TH_CONTROL_BOX)
  th_corr=float(cv2.matchTemplate(anomaly,th,cv2.TM_CCOEFF_NORMED)[0,0])
  ng_iou=best_iou(anomaly>0,templates["NG"][:114,:]>0,shift=3)
  th_iou=best_iou(anomaly>0,th>0,shift=3)

  x1,y1,x2,y2=LARGE_AE_BOX
  large_ae=(p56[y1:y2,x1:x2]<THRESHOLD).astype(np.uint8)
  normalized_ae=cv2.resize(large_ae,(templates["AE"].shape[1],templates["AE"].shape[0]),interpolation=cv2.INTER_NEAREST)
  large_ae_iou=best_iou(normalized_ae,templates["AE"]>0,shift=1)

  summary={
   "source":"58 original LP2 JPEGs; p maps to scan p+17",
   "templates":{n:{"gp_index":s["index"],"p56_box_xyxy":s["box"]} for n,s in TEMPLATES.items()},
   "thresholds":{"gray_less_than":THRESHOLD,"normalized_correlation_at_least":MATCH_THRESHOLD,
                 "nms_kernel":[105,36],"sensitivity":[128,160,192,"3x3 erosion","3x3 dilation"]},
   "matched_ordinary":matched,
   "per_rune_similarity":{
    n:{"n":len(scores[n]),"min_ncc":float(min(scores[n])),"median_ncc":float(np.median(scores[n])),
       "min_best_shift_iou":float(min(ious[n])),"median_best_shift_iou":float(np.median(ious[n])),
       "exact_iou_1":int(sum(v>=.999999 for v in ious[n]))} for n in TEMPLATES},
   "exceptions":{
    "NG":{"page":33,"offset":91,"reason":"normal-height red-span first-rune outlier",
          "p33_red_crop_box_xyxy":P33_NG_BOX,"correlation_to_TH_control":th_corr,
          "iou_to_NG_template":ng_iou,"iou_to_TH_control":th_iou},
    "AE":{"page":56,"offset":0,"reason":"oversized red initial","large_initial_box_xyxy":LARGE_AE_BOX,
          "scale_normalized_iou_to_ordinary_AE":large_ae_iou}},
   "rejected_non_discriminating_controls":rejected,
   "morphology_sensitivity":sensitivity,"per_page_counts":page_rows,
   "verified_pages":len(page_rows),
   "status":"BOUNDED NULL for ordinary C/NG/AE forms; no repeated allograph state or decoder"}
  print(json.dumps(summary,indent=2))
 finally:
  if archive is not None: archive.close()

if __name__=="__main__":
 main()

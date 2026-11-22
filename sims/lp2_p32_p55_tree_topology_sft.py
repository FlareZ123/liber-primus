#!/usr/bin/env python3
"""Source-gated branch-topology check for LP2 p32/p55 tree crops.

Uses fixed original-image rectangles and trunk-only registration from
im-results/lp2-p32-p55-blurred-tree-correspondence.md. No crop, orientation,
threshold, or cipher-key search is performed.
Dependencies: numpy, opencv-python, scipy, scikit-image.
"""
from __future__ import annotations
import argparse, json
from pathlib import Path
import cv2
import numpy as np
from scipy.ndimage import binary_fill_holes, distance_transform_edt, label
from skimage.morphology import skeletonize

P32_RECT=(650,2070,1810,3230)
P55_RECT=(625,1430,1735,2510)
SIZE,SLACK=360,45
NBR=[(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]


def load_ink(path:Path,rect):
    image=cv2.imread(str(path),cv2.IMREAD_GRAYSCALE)
    if image is None: raise FileNotFoundError(path)
    x0,y0,x1,y1=rect
    crop=image[y0:y1,x0:x1]
    if crop.shape!=(y1-y0,x1-x0): raise ValueError(f"crop outside image: {path}")
    return 255.0-cv2.resize(crop,(SIZE,SIZE),interpolation=cv2.INTER_AREA).astype(np.float32)


def p55_model(ink):
    binary=(ink>15).astype(np.uint8)
    filled=binary_fill_holes(binary).astype(np.uint8)
    soft=cv2.GaussianBlur(filled.astype(np.float32),(0,0),9)
    n=round(SIZE*0.90); inset=(SIZE-n)//2
    canvas=np.zeros((SIZE,SIZE),np.float32)
    scaled=cv2.resize(soft,(n,n),interpolation=cv2.INTER_AREA)
    canvas[inset:inset+n,inset:inset+n]=scaled
    return canvas


def register_trunk(target,source):
    padded=cv2.copyMakeBorder(target,SLACK,SLACK,SLACK,SLACK,cv2.BORDER_CONSTANT,value=0)
    match=cv2.matchTemplate(padded[175:340+2*SLACK],source[175:340],cv2.TM_CCOEFF_NORMED)
    _,best,_,xy=cv2.minMaxLoc(match)
    shift=(xy[0]-SLACK,xy[1]-SLACK)
    aligned=cv2.warpAffine(source,np.float32([[1,0,shift[0]],[0,1,shift[1]]]),(SIZE,SIZE))
    return aligned,shift,float(best)


def degree_map(sk):
    kernel=np.ones((3,3),np.uint8); kernel[1,1]=0
    return cv2.filter2D(sk.astype(np.uint8),-1,kernel,borderType=cv2.BORDER_CONSTANT)


def graph(mask):
    sk=skeletonize(mask); deg=degree_map(sk)
    ends=sk&(deg==1); junctions=sk&(deg>=3)
    _,ne=label(ends,structure=np.ones((3,3),int))
    _,nj=label(junctions,structure=np.ones((3,3),int))
    return sk,{"skeleton_pixels":int(sk.sum()),"endpoint_clusters":int(ne),
               "junction_clusters":int(nj),"junction_pixels":int(junctions.sum())}


def prune_spurs(sk,minimum_length):
    sk=sk.copy().astype(bool); h,w=sk.shape; changed=True
    while changed:
        changed=False; deg=degree_map(sk)
        for ey,ex in list(zip(*np.where(sk&(deg==1)))):
            if not sk[ey,ex]: continue
            path=[(ey,ex)]; previous=None; current=(ey,ex)
            while True:
                y,x=current
                neighbors=[(y+dy,x+dx) for dy,dx in NBR
                    if 0<=y+dy<h and 0<=x+dx<w and sk[y+dy,x+dx]
                    and (y+dy,x+dx)!=previous]
                if len(neighbors)!=1: break
                nxt=neighbors[0]; path.append(nxt); previous,current=current,nxt
                if deg[current]>=3 or deg[current]==1 or len(path)>h*w: break
            if len(path)-1<minimum_length and deg[current]>=3:
                for y,x in path[:-1]: sk[y,x]=False
                changed=True
    return sk


def node_counts(sk):
    deg=degree_map(sk)
    _,ne=label(sk&(deg==1),structure=np.ones((3,3),int))
    _,nj=label(sk&(deg>=3),structure=np.ones((3,3),int))
    return int(ne),int(nj)


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--p32",type=Path,default=Path("resources/liber-primus/49.jpg"))
    ap.add_argument("--p55",type=Path,default=Path("resources/liber-primus/72.jpg"))
    args=ap.parse_args()
    target=load_ink(args.p32,P32_RECT); p55=load_ink(args.p55,P55_RECT)
    source=p55_model(p55); aligned,shift,trunk_corr=register_trunk(target,source)
    holdout=float(np.corrcoef(target[40:175].ravel(),aligned[40:175].ravel())[0,1])
    full=float(np.corrcoef(target.ravel(),aligned.ravel())[0,1])
    p32_sk,p32_stats=graph(target>20); p55_sk,p55_stats=graph(aligned>0.20)
    p32_pruned=node_counts(prune_spurs(p32_sk,20)); p55_pruned=node_counts(prune_spurs(p55_sk,20))
    d32=distance_transform_edt(~p32_sk); d55=distance_transform_edt(~p55_sk)
    overlap={}
    for tol in (8,10):
        precision=float((d32[p55_sk]<=tol).mean()); recall=float((d55[p32_sk]<=tol).mean())
        overlap[str(tol)]={"p55_within_p32":precision,"p32_within_p55":recall,
                           "mean":(precision+recall)/2}
    sweep=[]
    for th in (10,15,20,25,30,35,40):
        _,a=graph(target>th)
        sweep.append({"p32_threshold":th,"p32_endpoints":a["endpoint_clusters"],
          "p32_junctions":a["junction_clusters"],"p55_threshold":0.20,
          "p55_endpoints":p55_stats["endpoint_clusters"],
          "p55_junctions":p55_stats["junction_clusters"]})
    print(json.dumps({
      "crops":{"p32_49.jpg":P32_RECT,"p55_72.jpg":P55_RECT},
      "p55_model":"threshold15; enclosed-hole fill; Gaussian sigma9; scale0.90",
      "translation_xy":shift,"trunk_training_correlation":trunk_corr,
      "upper_crown_holdout_correlation":holdout,"full_crop_correlation":full,
      "fixed_graph_thresholds":{"p32_ink":20,"aligned_p55_fraction":0.20},
      "p32_graph":p32_stats,"p55_graph":p55_stats,
      "20px_spur_pruned_endpoint_junction_counts":{"p32":p32_pruned,"p55":p55_pruned},
      "skeleton_overlap":overlap,"threshold_sensitivity":sweep,
      "interpretation":"Main skeletons align coarsely, but endpoint/junction topology is not identical or stable; no branch-derived cipher/key is established."
    },indent=2))


if __name__=="__main__": main()

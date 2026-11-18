#!/usr/bin/env python3
"""Scan all 75 original LP1/LP2 JPEGs for the p16 cicada asset.

Dependencies: numpy, Pillow, opencv-python-headless.
Run: python sims/lp1_lp2_cicada_fullscan_sft.py
"""
import argparse, json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

BOX=(866,1460,1540,1696)
P15={"left":(918,1958,1154,2632),"right":(1246,1958,1482,2632)}
THRESHOLD=140
EXPECTED=[1,9,13,15,16,19]

def load(d,n):
    im=Image.open(d/f"{n:02d}.jpg").convert("L")
    assert im.size==(2400,3600)
    return np.asarray(im,dtype=np.uint8)

def components(binary):
    n,lab,stats,_=cv2.connectedComponentsWithStats(binary.astype(np.uint8),8)
    out=np.zeros(binary.shape,np.uint8); areas=[]
    for k in range(1,n):
        a=int(stats[k,cv2.CC_STAT_AREA])
        if a>=500: out[lab==k]=1; areas.append(a)
    return out,sorted(areas,reverse=True)

def mobius(n):
    if n==1:return 1
    s,p=1,2
    while p*p<=n:
        if n%p==0:
            n//=p;s=-s
            if n%p==0:return 0
            while n%p==0:n//=p
        p+=1
    return -s if n>1 else s

def omega(n):
    c,p=0,2
    while p*p<=n:
        if n%p==0:
            c+=1
            while n%p==0:n//=p
        p+=1
    return c+(n>1)

def metric(a,b):
    x=int(np.logical_xor(a,b).sum())
    i=int(np.logical_and(a,b).sum())
    u=int(np.logical_or(a,b).sum())
    return {"xor":x,"iou":i/u if u else 1.0}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--image-dir",type=Path,default=Path("resources/liber-primus"))
    d=ap.parse_args().image_dir
    p16=load(d,16)
    base,areas=components(p16[BOX[1]:BOX[3],BOX[0]:BOX[2]]<THRESHOLD)
    assert base.shape==(236,674) and len(areas)==10
    tf={
      "identity":base,"hflip":np.fliplr(base),"vflip":np.flipud(base),
      "rot180":np.rot90(base,2),"rot90ccw":np.rot90(base,1),
      "rot90cw":np.rot90(base,-1),"transpose":base.T,
      "anti_transpose":np.fliplr(np.flipud(base)).T
    }
    qtf={k:cv2.resize(v,(v.shape[1]//4,v.shape[0]//4),interpolation=cv2.INTER_NEAREST) for k,v in tf.items()}
    rows=[];p1={}
    for n in range(75):
        q=cv2.resize(load(d,n),(600,900),interpolation=cv2.INTER_AREA)
        b=(q<THRESHOLD).astype(np.uint8); vals=[]
        for k,t in qtf.items():
            r=cv2.matchTemplate(b,t.astype(np.uint8),cv2.TM_CCOEFF_NORMED)
            _,s,_,loc=cv2.minMaxLoc(r);vals.append((float(s),k,loc,t.shape))
        best=max(vals,key=lambda x:x[0])
        rows.append({"image":n,"score":best[0],"transform":best[1],"xy":list(best[2])})
        if n==1:p1={k:{"score":s,"xy":list(loc),"shape":list(sh)} for s,k,loc,sh in vals}
    high=[x["image"] for x in rows if x["score"]>=.60]
    non=max((x for x in rows if x["image"] not in EXPECTED),key=lambda x:x["score"])
    assert high==EXPECTED and non["score"]<.26,(high,non)
    a,b=p1["rot90cw"],p1["transpose"]
    assert a["score"]>.60 and b["score"]>.60
    x1,y1=a["xy"];h1,w1=a["shape"];x2,y2=b["xy"];h2,w2=b["shape"]
    assert max(0,min(x1+w1,x2+w2)-max(x1,x2))*max(0,min(y1+h1,y2+h2)-max(y1,y2))==0
    masks={}
    for n,box in {9:(842,1940,1516,2176),13:(860,1084,1534,1320),19:(885,2647,1559,2883),16:BOX}.items():
        im=load(d,n);m,ar=components(im[box[1]:box[3],box[0]:box[2]]<THRESHOLD)
        assert m.shape==(236,674) and len(ar)==10;masks[n]=m
    assert np.array_equal(masks[9],masks[16])
    assert np.array_equal(masks[13],np.fliplr(masks[16]))
    p2=metric(masks[19],np.fliplr(masks[16]));assert p2["xor"]==35 and p2["iou"]>.999
    im15=load(d,15);p15m={}
    for k,box in P15.items():
        p15m[k],ar=components(im15[box[1]:box[3],box[0]:box[2]]<THRESHOLD)
        assert p15m[k].shape==(674,236) and len(ar)==10
    left=metric(p15m["left"],np.rot90(np.flipud(masks[16]),-1))
    right=metric(p15m["right"],np.rot90(masks[16],-1))
    assert left["xor"]==right["xor"]==35 and left["iou"]>.999 and right["iou"]>.999
    states={str(n):{"mu":mobius(n),"omega":omega(n)} for n in [1,9,13,15,16,2]}
    assert [mobius(n) for n in [1,9,13,15,16,2]]==[1,0,-1,1,0,-1]
    print(json.dumps({"status":"PASS","candidate_pages":high,"best_noncandidate":non,
      "p1_two_nonoverlapping_quarter_turns":{"rot90cw":a,"transpose":b},
      "page_scores":rows,"page_number_states":states,
      "fixed_checks":{"p9_equals_p16":True,"p13_equals_hflip_p16":True,"p2_hflip":p2,"p15_left":left,"p15_right":right},
      "interpretation":"Visual transform state correlates with page Mobius value; not an authenticated cipher or direction rule. p2 head faces right while mu(2) is negative; intended direction convention unresolved. omega(1)=0 despite two p1 copies."},indent=2))

if __name__=="__main__":main()

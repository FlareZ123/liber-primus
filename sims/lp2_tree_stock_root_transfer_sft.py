"""Pinned stock-raster, independent crown fits and p55->p32 root edit transfer.

Run from repo root with numpy, scipy, pillow, opencv-python.
No cipher values or language scores enter any fit. The base64 fixture is an
exact reduced stock mask, extracted via jpeg-js 0.4.4 from the pinned public
stock JPEG; see the accompanying report for source and reduction rule.
"""
import base64
import hashlib
from itertools import groupby
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import binary_erosion, binary_fill_holes, gaussian_filter
from scipy.optimize import differential_evolution

ROOT = Path(__file__).resolve().parents[1]
CROPS = {49:(650,2060,1760,3130),72:(650,1410,1760,2480)}
REGIONS = {"left":(slice(15,125),slice(15,100)),
           "right":(slice(15,125),slice(100,185)),
           "crown":(slice(15,125),slice(15,185)),
           "root":(slice(125,190),slice(15,185))}


def load_stock():
    b = base64.b64decode((ROOT/"im-results/lp2-tree-common-stock-mask.b64").read_text())
    assert hashlib.sha256(b).hexdigest() == "41d234747acf055667b789c6bdd8c72aaccf7e4414468d1c5e2ae2e6fd1d126d"
    runs=[]; n=0; k=0
    for x in b:
        n |= (x&127)<<k
        if x&128:
            k+=7
        else:
            runs.append(n); n=0; k=0
    assert sum(runs)==160*210
    delta=np.repeat(np.arange(len(runs))%2,runs).reshape(210,160).astype(np.uint8)
    mask=np.bitwise_xor.accumulate(delta,axis=0)
    assert mask.sum()==5334
    assert hashlib.sha256(mask.tobytes()).hexdigest()=="a918dfdc5036d78dd9a2bf46552b1c91e7fadb20e0e41e61d9d01b4c10c5a993"
    return mask.astype(np.float32)[:,::-1].copy()


def native_sample(p):
    x0,y0,x1,y1=CROPS[p]
    a=np.asarray(Image.open(ROOT/"resources/liber-primus"/f"{p:02}.jpg").convert("L"),dtype=float)[y0:y1,x0:x1]
    coords=[]
    for axis in (0,1):
        v=np.abs(np.diff(a,axis=axis)).sum(axis=1-axis)
        start=(y0,x0)[axis]; t=np.arange(v.size)+start+.5
        c=np.sum(v*np.exp(-2j*np.pi*9/50*t))/v.sum()
        phase=(-np.angle(c)/(2*np.pi*9/50))%(50/9)
        cc=phase+(np.arange(-1,700)+.5)*(50/9)-start
        coords.append(cc[(cc>=0)&(cc<a.shape[axis]-1)])
    return a[np.rint(coords[0]).astype(int)[:,None],np.rint(coords[1]).astype(int)[None,:]]


def corr(a,b):
    x=a.ravel().astype(np.float32); y=b.ravel().astype(np.float32)
    x-=x.mean(); y-=y.mean()
    return float(np.dot(x,y)/max(1e-12,np.linalg.norm(x)*np.linalg.norm(y)))


def warp(a,v,shape):
    sx,sy,tx,ty=v[:4]
    m=np.array([[sx,0,tx],[0,sy,ty]],dtype=np.float32)
    return cv2.warpAffine(a,m,(shape[1],shape[0]),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_CONSTANT,borderValue=0)


def fit(stock,target,p):
    if p==49:
        def pred(v):
            return warp(gaussian_filter(stock,v[4]),v,target.shape)
        bounds=[(.65,1.15),(.65,1.15),(-30,30),(15,65),(.3,12)]
        popsize=10; iters=65
    else:
        def pred(v):
            x=warp(gaussian_filter(stock,v[4]),v,target.shape)
            gx=cv2.Sobel(x,cv2.CV_32F,1,0,ksize=3,scale=1/8)
            gy=cv2.Sobel(x,cv2.CV_32F,0,1,ksize=3,scale=1/8)
            grad=np.sqrt(gx*gx+gy*gy)
            dist=(x-v[5])/np.maximum(grad,1e-4)
            return np.exp(-.5*(dist/v[6])**2)
        bounds=[(.72,1.05),(.72,1.05),(-24,10),(20,55),(.4,8),(.08,.85),(.3,3)]
        popsize=12; iters=90
    for k in ("left","right","crown"):
        reg=REGIONS[k]
        res=differential_evolution(lambda v:-corr(pred(v)[reg],target[reg]),
            bounds,seed=3301,popsize=popsize,maxiter=iters,tol=1e-5,polish=True)
        q=pred(res.x)
        print(p,k,res.x.tolist(),{a:corr(q[r],target[r]) for a,r in REGIONS.items()},flush=True)
    return res.x


def main():
    stock=load_stock()
    raw={p:native_sample(p) for p in CROPS}
    p32=np.maximum(0,252-raw[49]).astype(np.float32)/252
    p55ink=np.maximum(0,252-raw[72]).astype(np.float32)/252
    v32=fit(stock,p32,49); v55=fit(stock,p55ink,72)
    _,lab,stats,_=cv2.connectedComponentsWithStats((raw[72]<240).astype(np.uint8),8)
    p55=binary_fill_holes(lab==1+np.argmax(stats[1:,cv2.CC_STAT_AREA])).astype(np.float32)
    rows=[len(np.flatnonzero(np.diff(np.r_[0,row>0.5,0])))//2 for row in stock]
    runs=[list(g) for k,g in groupby(range(len(rows)),key=lambda i:rows[i]==1) if k]
    start=max(runs,key=len)[0]
    assert start==162
    sx,sy,tx,ty=v55[:4]
    def from55(a):
        return warp(a.astype(np.float32),(1/sx,1/sy,-tx/sx,-ty/sy),stock.shape)
    def predict(a):
        return warp(gaussian_filter(a,v32[4]),v32,p32.shape)
    base=predict(stock); crown=REGIONS["crown"]
    x=base[crown].ravel(); y=p32[crown].ravel()
    gain,bias=np.linalg.lstsq(np.c_[x,np.ones_like(x)],y,rcond=None)[0]
    y0=max(125,int(np.ceil((start-v32[3])/v32[1])))
    held=(slice(y0,190),slice(15,185))
    def metrics(a):
        q=a*gain+bias; d=p32[held]-q[held]
        return (float(np.corrcoef(q[held].ravel(),p32[held].ravel())[0,1]),
                float(np.mean(d*d)),float(np.abs(d).max()))
    print("root start",start,"held p32 rows",y0,190,"gain,bias",gain,bias)
    print("stock",metrics(base))
    for e in (0,1,2):
        a=p55 if e==0 else binary_erosion(p55>0.5,iterations=e)
        m=from55(a); new=stock.copy(); new[start:]=m[start:]
        print("p55-derived root erosion",e,metrics(predict(new)),
              "removed",float(np.maximum(stock-new,0).sum()),
              "added",float(np.maximum(new-stock,0).sum()))


if __name__=="__main__":
    main()

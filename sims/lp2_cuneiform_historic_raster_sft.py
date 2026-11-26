"""#2994: finite exact-byte historical raster test; Pillow + numpy only."""
from pathlib import Path
from collections import deque
import hashlib, io, urllib.request, json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    ("jpg", "https://upload.wikimedia.org/wikipedia/commons/1/16/Babylonian_numerals.jpg", 29817, "3aea0ef57bf0e0f3a3a649c4f6029777fefee5be"),
    ("png", "https://upload.wikimedia.org/wikipedia/commons/3/30/Babylonian_numerals.PNG", 103353, "34b579130dc217751020af35becedb64c35c4f7a"),
]
# Fixed glyph-only windows measured on the displayed 500x324 chart.
BOXES = [(106,199,147,223),(105,66,148,89),(445,131,498,160),(36,2,54,25)]
GROUPS = [(4,2),(3,1),(7,9),(8,)]
NAMES = ("17","13","55","1")
ANGLES = range(-60,61,5)
SCALES = tuple(i/10 for i in range(5,26))

def crop(m):
    y,x=np.where(m)
    if len(x)==0: raise ValueError("empty crop")
    return m[y.min():y.max()+1,x.min():x.max()+1]

def components(m):
    h,w=m.shape
    labels=np.zeros(m.shape,np.int32)
    n=0
    for y,x in zip(*np.where(m)):
        if labels[y,x]: continue
        n+=1; labels[y,x]=n; q=deque([(y,x)])
        while q:
            a,b=q.popleft()
            for dy in (-1,0,1):
                for dx in (-1,0,1):
                    c,d=a+dy,b+dx
                    if 0<=c<h and 0<=d<w and m[c,d] and labels[c,d]==0:
                        labels[c,d]=n; q.append((c,d))
    return labels

def resize(m,scale):
    h,w=m.shape
    return np.asarray(Image.fromarray(m.astype(np.uint8)*255).resize((max(1,round(w*scale)),max(1,round(h*scale))),Image.Resampling.NEAREST))>127

def transform(m,angle,scale):
    p=Image.fromarray(resize(m,scale).astype(np.uint8)*255)
    return crop(np.asarray(p.rotate(angle,expand=True,resample=Image.Resampling.NEAREST))>127)

def iou(a,b):
    shape=tuple(int(x+y-1) for x,y in zip(a.shape,b.shape))
    inter=round(float(np.fft.irfft2(np.fft.rfft2(a.astype(float),s=shape,axes=(0,1))*np.fft.rfft2(b[::-1,::-1].astype(float),s=shape,axes=(0,1)),s=shape,axes=(0,1)).max()))
    return inter/(int(a.sum())+int(b.sum())-inter)

def fit(src,tgt):
    best=(-1,None)
    independent=[(-1,None) for _ in src]
    for angle in ANGLES:
        for scale in SCALES:
            scores=[iou(transform(s,angle,scale),t) for s,t in zip(src,tgt)]
            avg=float(np.mean(scores))
            if avg>best[0]: best=(avg,[angle,float(scale),scores])
            for i,v in enumerate(scores):
                if v>independent[i][0]: independent[i]=(v,[angle,float(scale)])
    return {"shared":best,"individual":independent}

def main():
    page=np.asarray(Image.open(ROOT/"resources/liber-primus/51.jpg").convert("L"))
    labels=components(page[130:600,960:1440]<128)
    areas=[int((labels==i).sum()) for i in [4,2,3,1,7,9,8]]
    assert areas==[2528,8756,1726,3070,6228,5548,1538],areas
    tgt=[crop(resize(crop(np.isin(labels,g)),.25)) for g in GROUPS]
    out={}
    for ext,url,size,sha in SOURCES:
        try:
            req=urllib.request.Request(url,headers={"User-Agent":"LiberPrimusResearch/1.0 (public historical image comparison; github.com/FlareZ123/liber-primus)"})
            with urllib.request.urlopen(req,timeout=25) as f: raw=f.read(200000)
        except Exception as e:
            print(ext,"retrieval failed",repr(e),flush=True)
            continue
        actual=hashlib.sha1(raw).hexdigest()
        if len(raw)!=size or actual!=sha:
            print(ext,"unverified bytes",len(raw),actual,flush=True);continue
        image=Image.open(io.BytesIO(raw)).convert("L")
        assert image.size==(500,324)
        print(ext,"verified",len(raw),actual,flush=True)
        for threshold in [96,128,160]:
            src=[crop(np.asarray(image.crop(b))<threshold) for b in BOXES]
            result=fit(src,tgt)
            print(ext,threshold,json.dumps(result),flush=True)
            out[(ext,threshold)]=result
            if threshold==128:
                plants=[transform(s,20,1.5) for s in src]
                control=fit(src,plants)
                print(ext,"exact-copy control",json.dumps(control),flush=True)
                assert abs(control["shared"][0]-1)<1e-9
    print("Verified raster threshold runs:",len(out),flush=True)

if __name__=="__main__": main()

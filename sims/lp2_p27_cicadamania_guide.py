#!/usr/bin/env python3
"""One-source gate for the Cicada Mania wing-letter PDF linked in May 2011.
Extract embedded images on printed pages 2–3, preserving their bytes and
bypassing separately drawn PDF overlays. No ciphertext is used.
Requires PyMuPDF, OpenCV and numpy. A vector-only or flattened source must
be manually adjudicated; failure of XObject registration is not a topology exclusion.
"""
import argparse, hashlib, json
from pathlib import Path
import cv2, fitz, numpy as np

PIN = 'c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e'

def source_crop(raw):
    assert hashlib.sha256(raw).hexdigest()==PIN
    im=cv2.imdecode(np.frombuffer(raw,np.uint8),cv2.IMREAD_GRAYSCALE)
    assert im.shape==(3600,2400)
    return im[470:895,590:1840]

def sift_match(ref, other):
    sift=cv2.SIFT_create()
    a, da=sift.detectAndCompute(ref,None)
    b, db=sift.detectAndCompute(other,None)
    if da is None or db is None or len(db)<2:
        return {'inliers':0,'eligible':False}
    pairs=[m for m,n in cv2.BFMatcher().knnMatch(da,db,k=2) if m.distance<.75*n.distance]
    if len(pairs)<4:return {'inliers':0,'eligible':False}
    x=np.float32([a[m.queryIdx].pt for m in pairs]); y=np.float32([b[m.trainIdx].pt for m in pairs])
    H, mask=cv2.findHomography(x,y,cv2.RANSAC,3.0)
    if H is None or mask is None:return {'inliers':0,'eligible':False}
    use=mask.ravel().astype(bool)
    nx=int(use.sum())
    span=np.ptp(x[use],axis=0)/[ref.shape[1],ref.shape[0]] if nx else np.zeros(2)
    return {'inliers':nx,'source_span':[round(float(z),4) for z in span],
            'eligible':bool(nx>=30 and span[0]>=.6 and span[1]>=.12)}

def scan(pdf,ref):
    out=[]; seen=set()
    with fitz.open(stream=pdf,filetype='pdf') as doc:
        if len(doc)<3: raise ValueError('expected three-page guide')
        for p in (1,2):
            for row in doc[p].get_images(full=True):
                xref,smask=row[:2]
                if (xref,smask) in seen:continue
                seen.add((xref,smask))
                obj=doc.extract_image(xref)
                if smask:
                    pix=fitz.Pixmap(fitz.Pixmap(doc,xref),fitz.Pixmap(doc,smask))
                    pix=fitz.Pixmap(fitz.csRGB,pix) if pix.colorspace and pix.colorspace.n!=3 else pix
                    rgba=np.frombuffer(pix.samples,np.uint8).reshape(pix.height,pix.width,pix.n)
                    gray=cv2.cvtColor(np.minimum(255,rgba[:,:,:3].astype(np.int16)+255-rgba[:,:,3:4]).astype(np.uint8),cv2.COLOR_RGB2GRAY)
                else:
                    gray=cv2.imdecode(np.frombuffer(obj['image'],np.uint8),cv2.IMREAD_GRAYSCALE)
                if gray is None:continue
                variants=[]
                for rot in range(4):
                    for reflect in (False,True):
                        im=np.rot90(gray,rot).copy()
                        if reflect:im=im[:,::-1].copy()
                        variants.append({'rotation_ccw':90*rot,'reflect':reflect,**sift_match(ref,im)})
                out.append({'page_first_seen':p+1,'xref':xref,'smask':smask,'dimensions':list(gray.shape[::-1]),
                            'image_sha256':hashlib.sha256(obj['image']).hexdigest(),
                            'best':max(variants,key=lambda x:(x['eligible'],x['inliers']))})
    return {'pdf_sha256':hashlib.sha256(pdf).hexdigest(),'embedded_images':out,'eligible':sum(x['best']['eligible'] for x in out)}

def selftest(ref):
    # Actual LP2 crop embedded as a PDF image, with independent vector color overlays.
    doc=fitz.open(); doc.new_page(width=650,height=500)
    png=cv2.imencode('.png',ref)[1].tobytes()
    # Negative: a deterministic synthetic nonmatching image with many lines/corners.
    neg=np.full(ref.shape,255,np.uint8)
    for y in range(30,400,40):
        for x in range(30,1200,50):cv2.rectangle(neg,(x,y),(x+20,y+12),0,2)
    bad=cv2.imencode('.png',neg)[1].tobytes()
    for k in (1,2):
        p=doc.new_page(width=650,height=500)
        p.insert_image(fitz.Rect(20,20,620,224),stream=png)
        p.draw_line((100,40),(500,180),color=(1,0,0),width=8)
        p.insert_image(fitz.Rect(20,260,620,464),stream=bad)
    data=doc.tobytes();doc.close()
    result=scan(data,ref)
    assert len(result['embedded_images'])==2,result
    assert result['eligible']==1,result
    return result

def main():
    p=argparse.ArgumentParser();p.add_argument('--original',type=Path,required=True);p.add_argument('--pdf',type=Path);p.add_argument('--selftest',action='store_true');a=p.parse_args()
    ref=source_crop(a.original.read_bytes())
    if a.selftest:print(json.dumps({'selftest':selftest(ref)},indent=2))
    if a.pdf:print(json.dumps({'candidate':scan(a.pdf.read_bytes(),ref)},indent=2))
    if not a.selftest and not a.pdf:p.error('choose --selftest and/or --pdf')
if __name__=='__main__':main()

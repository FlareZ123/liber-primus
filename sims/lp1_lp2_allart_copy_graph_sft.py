"""Original cross-release illustration-copy census, single-file test.
Requires Python 3, numpy and opencv-python with SIFT. Test on repo originals.
Opt-in LP_ORIGINAL_JPEGS_ZIP environment variable supplies uploaded zip instead.
Only original JPEG pixels are used. No ciphertext or language score is involved.
"""
import hashlib
import json
import os
from pathlib import Path
import zipfile
import cv2
import numpy as np

cv2.setNumThreads(2)
cv2.setRNGSeed(3301)
ROOT = Path(__file__).resolve().parents[1]
KNOWN = {(1,19),(9,19),(13,19),(15,19),(16,19),(5,70),(5,72),
         (14,39),(15,39),(16,39)}
SHA = {
 1:"71f4bd03c692ede630091272597d2b18702184ed32fdd1977ef0ba7306632b46",
 5:"2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7",
 9:"975cda73bbf829b2775f25beb609d34fa429728b2f2a4ce863c129b10b005089",
 13:"bef0fc4867c2363c835eb4f08029a1eba35c925e2f72659d7353cf8a91089e56",
 14:"de2bebe1d06421d94f3dd2b2f838ee4cdb5f51b07b14e880e0108f7b79c14e",
 15:"f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9",
 16:"984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe",
 19:"74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
 39:"e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7",
 70:"4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548",
 72:"a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"
}

def load():
    archive_path = os.environ.get("LP_ORIGINAL_JPEGS_ZIP")
    folder = ROOT / "resources" / "liber-primus"
    if archive_path is None and not folder.is_dir():
        archive_path = "/mnt/data/liber-primus-jpegs.zip"
    z = zipfile.ZipFile(archive_path) if archive_path else None
    try:
        images = []
        for i in range(75):
            data = (z.read(f"liber-primus-jpegs/{i:02d}.jpg") if z
                    else (folder / f"{i:02d}.jpg").read_bytes())
            if i in SHA:
                assert hashlib.sha256(data).hexdigest() == SHA[i], i
            a = cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_GRAYSCALE)
            assert a is not None and a.shape==(3600,2400), i
            images.append(cv2.resize(a,(600,900),interpolation=cv2.INTER_AREA))
        return images
    finally:
        if z:
            z.close()

def features(images, relaxed):
    sift=cv2.SIFT_create(nfeatures=1300 if relaxed else 1800,
                         contrastThreshold=.012 if relaxed else .008)
    ans=[]
    for a in images:
        _,lab,st,_=cv2.connectedComponentsWithStats(np.uint8(a<(175 if relaxed else 165)),8)
        chosen=[]
        for i,(x,y,w,h,area) in enumerate(st[1:],1):
            if relaxed:
                hit=area>=220 and max(w,h)>=38 and (w>=40 or h>=40)
            else:
                hit=area>=180 and max(w,h)>=30 and max(w,h)>=1.6*min(w,h)
            if hit:
                chosen.append(i)
        mask=np.zeros_like(a)
        if relaxed:
            for i in chosen:
                x,y,w,h,_=st[i]
                mask[max(0,y-6):min(900,y+h+6),max(0,x-6):min(600,x+w+6)]=255
        else:
            mask=cv2.dilate(np.uint8(np.isin(lab,chosen))*255,
                     cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(17,17)))
        kp,des=sift.detectAndCompute(a,mask)
        km,dm=sift.detectAndCompute(cv2.flip(a,1),cv2.flip(mask,1))
        ans.append(((kp,des),(km,dm)))
    return ans

def screen(feats,relaxed):
    matcher=cv2.FlannBasedMatcher(dict(algorithm=1,trees=4),
                                  dict(checks=32 if relaxed else 48))
    output=[]
    for i in range(17):
        for j in range(17,75):
            for flip in (0,1):
                ka,da=feats[i][0]
                kb,db=feats[j][flip]
                if da is None or db is None or min(len(da),len(db))<8:
                    continue
                selected=[a for a,b in matcher.knnMatch(da,db,k=2)
                          if a.distance < (.80 if relaxed else .78)*b.distance]
                uniq={}
                for m in selected:
                    if m.trainIdx not in uniq or m.distance<uniq[m.trainIdx].distance:
                        uniq[m.trainIdx]=m
                matches=list(uniq.values())
                if len(matches)<6:
                    continue
                p=np.float32([ka[m.queryIdx].pt for m in matches])
                q=np.float32([kb[m.trainIdx].pt for m in matches])
                M,inliers=cv2.estimateAffinePartial2D(
                    p,q,method=cv2.RANSAC,
                    ransacReprojThreshold=4 if relaxed else 3,
                    maxIters=1500 if relaxed else 1200,
                    confidence=.99 if relaxed else .995)
                if M is None:
                    continue
                good=inliers.reshape(-1)>0
                count=int(good.sum())
                if count<6:
                    continue
                span=p[good].max(0)-p[good].min(0)
                qspan=q[good].max(0)-q[good].min(0)
                scale=float(np.sqrt(abs(np.linalg.det(M[:2,:2]))))
                if not (.22<scale<(5 if relaxed else 4.5)
                        and min(span)>12 and min(qspan)>12):
                    continue
                output.append(dict(src=i,dst=j,flip=bool(flip),
                    inliers=count,total=len(matches),
                    fraction=round(count/len(matches),4),
                    span=np.round(span).astype(int).tolist(),
                    scale=round(scale,4),
                    angle=round(float(np.degrees(np.arctan2(M[1,0],M[0,0]))),2)))
    return sorted(output,key=lambda r:(-r["inliers"],r["src"],r["dst"]))

def main():
    ims=load()
    strict=screen(features(ims,False),False)
    strong=[r for r in strict if r["inliers"]>=10 and
            r["fraction"]>=.75 and min(r["span"])>=30]
    assert len(strong)==12, strong
    assert {(x["src"],x["dst"]) for x in strong}==KNOWN
    permissive=screen(features(ims,True),True)
    nonart=[r for r in permissive if (r["src"],r["dst"]) not in KNOWN]
    assert nonart and all(r["fraction"]<.75 for r in nonart),nonart
    # Unrelated-art control: LP2 p54 (71.jpg) has no matching LP1 p05 moth.
    assert not any(r["src"]==5 and r["dst"]==71 for r in strong)
    footer=cv2.resize(ims[14][788:900],(600,113),interpolation=cv2.INTER_AREA)<160
    scores=[]
    for j in range(17,75):
        target=cv2.resize(ims[j][788:900],(600,113),interpolation=cv2.INTER_AREA)<160
        for flipped in (False,True):
            b=np.fliplr(target) if flipped else target
            scores.append((np.count_nonzero(footer & b)/np.count_nonzero(footer | b),
                           j,flipped))
    scores.sort(reverse=True)
    assert scores[0][1:]==(39,True) and scores[0][0]>.88 and scores[1][0]<.20
    print("STRICT",json.dumps(strict,separators=(",",":")))
    print("PERMISSIVE",json.dumps(permissive,separators=(",",":")))
    print("FOOTER",scores[:2])
    print("PASS: 1972 first-release/second-release orientation comparisons;"
          " 10 previously known page pairs; no new strong source-art pair")

if __name__=="__main__":
    main()

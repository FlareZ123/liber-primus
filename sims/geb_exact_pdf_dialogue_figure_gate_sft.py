"""New-source figure reuse gate for the exact solver-linked GEB PDF.

Only figures in the 14 coordinate-selected dialogues are eligible. Match
original LP2 illustration crops using SIFT with geometric verification. This
is candidate discovery, not a claim of no common ancestry from nonmatches.
"""
import hashlib, json, sys, subprocess
from pathlib import Path
from urllib.request import Request,urlopen
from io import BytesIO
import numpy as np
from PIL import Image

URL="https://web.archive.org/web/20160411161235id_/https://dl.dropboxusercontent.com/u/40373160/GEB.pdf"
SHA="0c30a5c957557a580557fced796c9121c4be63bb82fee0b7eea134ff2e65522e"
# Physical PDF opening and end calculated from independently recorded dialogue
# extents. The edition occasionally omits blank printed pages, so use a
# conservative end extension of two pages rather than a page-number sweep.
DIALOGUES=[("3PI",37,41),("LML",111,136),("ETOATS",487,503),("...AF",317,344),
 ("AMO",239,254),("CC",207,213),("CBIA",161,167),("CFAF",185,190),
 ("SPR",728,751),("C[1]",83,90),("AWDV",397,412),("C[2]",641,649),
 ("SC",689,693),("AOGS",437,445)]
# Manually fixed original-image crops, fractions of 2400x3600. No cipher text
# scores or arbitrary crop tuning. One representative per distinctive motif.
CROPS=[(0,0,.35,.23,.89),(0,.76,.12,1,.57),(2,.30,.69,.72,.91),
 (3,.02,.12,.25,.87),(8,0,.13,.25,.86),(14,.42,.57,.95,.83),
 (15,.32,.40,.68,.48),(22,0,.81,1,.99),(22,.23,.55,.77,.79),
 (24,0,.27,.25,.75),(27,.15,.05,.85,.22),(32,.23,.50,.79,.88),
 (33,.30,.84,.70,.98),(40,0,.10,.23,.92),(53,.23,.72,.77,.90),
 (55,.20,.40,.80,.76),(57,.22,.55,.78,.92)]
ROOT=Path("resources/liber-primus")

def acquire():
    with urlopen(Request(URL,headers={"User-Agent":"LiberPrimusResearch/1.0"}),timeout=80) as r:
        raw=r.read(30_000_001)
    assert len(raw)==23151550 and hashlib.sha256(raw).hexdigest()==SHA
    return raw

def crop(p,b):
    with Image.open(ROOT/f"{p+17:02d}.jpg") as im:
        w,h=im.size
        return np.asarray(im.convert("L").crop(tuple(round(x*s) for x,s in zip(b,(w,h,w,h)))))

def features(im,cv,sift):
    # Contrast normalization and tight nonwhite box; keep original aspect.
    if im.ndim!=2: raise ValueError("grayscale required")
    if min(im.shape)<40: return None
    lo,hi=np.percentile(im,[1,99])
    if hi>lo: im=np.clip((im.astype(np.float32)-lo)*255/(hi-lo),0,255).astype(np.uint8)
    ys,xs=np.where(im<210)
    if len(xs)<100: return None
    im=im[max(0,ys.min()-5):min(im.shape[0],ys.max()+6),max(0,xs.min()-5):min(im.shape[1],xs.max()+6)]
    h,w=im.shape
    if min(h,w)<30: return None
    scale=min(1.,1100/max(h,w))
    im=cv.resize(im,None,fx=scale,fy=scale,interpolation=cv.INTER_AREA)
    k,d=sift.detectAndCompute(im,None)
    if d is None or len(d)<10: return None
    return im.shape,np.float32([q.pt for q in k]),d

def match(src,dst,cv,bf):
    if src is None or dst is None: return None
    sh,sp,sd=src; dh,dp,dd=dst
    m=bf.knnMatch(sd,dd,k=2)
    good=[a for pair in m if len(pair)==2 for a,b in [pair] if a.distance<.73*b.distance]
    if len(good)<8: return None
    a=np.float32([sp[x.queryIdx] for x in good]);b=np.float32([dp[x.trainIdx] for x in good])
    mat,inlier=cv.estimateAffinePartial2D(a,b,method=cv.RANSAC,ransacReprojThreshold=3.5,maxIters=2500,confidence=.995)
    if mat is None:return None
    keep=inlier.ravel().astype(bool);n=int(keep.sum())
    if n<7:return None
    ac=float(cv.contourArea(cv.convexHull(a[keep]))/(sh[0]*sh[1]))
    bc=float(cv.contourArea(cv.convexHull(b[keep]))/(dh[0]*dh[1]))
    return dict(inliers=n,ratio=round(n/len(good),4),src_cover=round(ac,4),dst_cover=round(bc,4),scale=round(float(np.hypot(mat[0,0],mat[0,1])),4))

def main():
    sys.stdout.reconfigure(errors="backslashreplace")
    try:
        import fitz
        import cv2 as cv
    except ImportError:
        subprocess.run([sys.executable,"-m","pip","install","--disable-pip-version-check","PyMuPDF==1.26.7","opencv-python-headless==4.11.0.86"],check=True)
        import fitz
        import cv2 as cv
    doc=fitz.open(stream=acquire(),filetype="pdf")
    sift=cv.SIFT_create(nfeatures=1800,contrastThreshold=.015)
    bf=cv.BFMatcher(cv.NORM_L2)
    refs=[]
    for index,(p,*b) in enumerate(CROPS):
        im=crop(p,b)
        refs.append((index,p,False,features(im,cv,sift)))
        refs.append((index,p,True,features(np.fliplr(im).copy(),cv,sift)))
    print("TARGET_FEATURES",[(i,p,f,len(t[2]) if t else 0) for i,p,f,t in refs],flush=True)
    # Native-art positive: transform the p22 recumbent illustration by
    # uniform scaling and reflection, the same family the matcher accepts.
    im=crop(22,(0,.81,1,.99))
    planted=cv.resize(np.fliplr(im).copy(),None,fx=.55,fy=.55,interpolation=cv.INTER_AREA)
    control=match(features(planted,cv,sift),refs[15][3],cv,bf)
    print("PLANTED_CONTROL",json.dumps(control),flush=True)
    assert control and control["inliers"]>=25 and control["ratio"]>=.5
    seen=set();candidates=[];count=0
    for section,first,last in DIALOGUES:
        for page in range(first,last+1):
            p=doc[page-1]
            # Figure image XObjects only; this deliberately does not match
            # vector-only diagrams or unrelated chapters.
            for x in p.get_images(full=True):
                xref,w,h=x[0],x[2],x[3]
                if xref in seen or min(w,h)<100: continue
                seen.add(xref)
                obj=doc.extract_image(xref)
                im=np.asarray(Image.open(BytesIO(obj["image"])).convert("L"))
                f=features(im,cv,sift)
                if f is None:continue
                count+=1
                for i,lp,flip,t in refs:
                    v=match(f,t,cv,bf)
                    if v:
                        candidates.append(dict(dialogue=section,pdf_page=page,xref=xref,lp2_page=lp,crop=i,flip=flip,**v))
    candidates.sort(key=lambda x:(x["inliers"],x["ratio"],x["src_cover"]),reverse=True)
    survivors=[x for x in candidates if x["inliers"]>=20 and x["ratio"]>=.5 and min(x["src_cover"],x["dst_cover"])>=.05]
    print("IMAGE_GATE",json.dumps(dict(eligible_unique_images=len(seen),feature_eligible=count,crop_orientations=len(refs),candidates=len(candidates),survivors=survivors,top=candidates[:12])),flush=True)

if __name__=="__main__":
    main()

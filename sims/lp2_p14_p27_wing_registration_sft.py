import cv2
import numpy as np
from zipfile import ZipFile
from pathlib import Path
import sys

# Run against the manuscript image directory, or the supplied original JPEG zip.
source = Path(sys.argv[1]) if len(sys.argv)>1 else Path('resources/liber-primus')
def read(n):
    if source.suffix=='.zip':
        with ZipFile(source) as z:
            data=z.read(f'liber-primus-jpegs/{n:02}.jpg')
        return cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_GRAYSCALE)
    return cv2.imread(str(source/f'{n:02}.jpg'),cv2.IMREAD_GRAYSCALE)
a=read(31)[2125:2470,1300:1630]
b=read(44)[470:895,590:1840]

def normalize(a,base,tip):
    base=np.array(base,dtype=float); tip=np.array(tip,dtype=float)
    d=tip-base; length=np.linalg.norm(d); x=d/length; y=np.array([-x[1],x[0]])
    T=np.stack([x,y])*800/length
    M=np.column_stack([T, np.array([50,300])-T@base])
    return cv2.warpAffine(a,M,(900,600),borderValue=255)
x=normalize(a,(305,332),(32,31)); y=normalize(b,(65,195),(1200,195))
cv2.setRNGSeed(3301)
sift=cv2.SIFT_create(contrastThreshold=.015,edgeThreshold=15)
def compare(x,y):
    k1,d1=sift.detectAndCompute(x,None); k2,d2=sift.detectAndCompute(y,None)
    matcher=cv2.BFMatcher()
    good=[m for m,n in matcher.knnMatch(d1,d2,k=2) if m.distance<.75*n.distance]
    if len(good)<3: return len(k1),len(k2),len(good),0,None
    p=np.float32([k1[m.queryIdx].pt for m in good]); q=np.float32([k2[m.trainIdx].pt for m in good])
    M,mask=cv2.estimateAffine2D(p,q,method=cv2.RANSAC,ransacReprojThreshold=5,maxIters=10000)
    return len(k1),len(k2),len(good),int(mask.sum()) if mask is not None else 0,M.tolist() if M is not None else None
for name,img in [('original',y),('reflected',cv2.flip(y,0))]: print(name,compare(x,img))
for name,img in [('p14',x),('p27',y)]:
    T=cv2.getRotationMatrix2D((450,300),17,0.73)
    altered=cv2.warpAffine(img,T,(900,600),borderValue=255)
    altered=cv2.GaussianBlur(altered,(5,5),.7)
    print('positive',name,compare(img,altered))

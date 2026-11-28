import sys, zipfile, io
import numpy as np
import cv2
from PIL import Image
from pathlib import Path
from sklearn.ensemble import HistGradientBoostingRegressor

source=Path(sys.argv[1])
def read(n):
    name=f'{n:02}.jpg'
    if source.is_dir():
        b=(source/name).read_bytes()
    else:
        with zipfile.ZipFile(source) as z:
            b=z.read(next(x for x in z.namelist() if Path(x).name==name))
    return np.asarray(Image.open(io.BytesIO(b)).convert('RGB'))[-650:]
old, repeat1, repeat2, new=map(read,[14,15,16,39])
print('LP1 footer exact RGB repeats',np.array_equal(old,repeat1),np.array_equal(old,repeat2))
old=old[:,::-1].copy()
a,b=[cv2.cvtColor(x,cv2.COLOR_RGB2GRAY) for x in (old,new)]
sift=cv2.SIFT_create()
k1,d1=sift.detectAndCompute(a,None);k2,d2=sift.detectAndCompute(b,None)
m=[x for x,y in cv2.BFMatcher().knnMatch(d1,d2,k=2) if x.distance<.75*y.distance]
M,ins=cv2.estimateAffinePartial2D(np.float32([k1[x.queryIdx].pt for x in m]),np.float32([k2[x.trainIdx].pt for x in m]),method=cv2.RANSAC,ransacReprojThreshold=3)
assert M is not None and ins.sum()>100
print('matches/inliers',len(m),int(ins.sum()),'matrix',M.tolist())
def warp(x):return cv2.warpAffine(x,M,(b.shape[1],b.shape[0]),flags=cv2.INTER_LINEAR)
def gb(x):return x[:,:,1].astype(np.float32)-x[:,:,2].astype(np.float32)
def block(x,n=8):
    h,w=x.shape; return x[:h//n*n,:w//n*n].reshape(h//n,n,w//n,n).mean((1,3))
valid=block(warp(np.ones(a.shape,np.float32)))>.999
Y,X=np.indices(valid.shape);valid &= (Y>=25)&(Y<78)&(X>=3)&(X<297)
oldgb=block(warp(gb(old))); newgb=block(gb(new))
oldgray=warp(a.astype(np.float32)); newgray=b.astype(np.float32)
def features(gray):
    grad=cv2.Sobel(gray,cv2.CV_32F,1,0)**2+cv2.Sobel(gray,cv2.CV_32F,0,1)**2
    return [block(gray),block(np.sqrt(grad)),block(gray**2)-block(gray)**2]
F=np.stack(features(oldgray)+features(newgray)+[X/300,Y/81],axis=-1)
train=valid & ((X//24)%2==0);test=valid&~train
def corr(a,b):return float(np.corrcoef(a,b)[0,1])
print('valid/train/test',valid.sum(),train.sum(),test.sum())
print('raw heldout r',corr(oldgb[test],newgb[test]),'raw heldout RMSE',np.sqrt(np.mean((oldgb[test]-newgb[test])**2)))
def run(extra):
    feat=F if extra is None else np.concatenate([F,extra[...,None]],axis=-1)
    model=HistGradientBoostingRegressor(max_iter=150,max_leaf_nodes=15,l2_regularization=1,random_state=0)
    model.fit(feat[train],newgb[train]);pred=model.predict(feat[test]);truth=newgb[test]
    return float(np.sqrt(np.mean((pred-truth)**2))),corr(pred,truth)
base=run(None);real=run(oldgb)
print('baseline heldout rmse/r',base,'registered heldout rmse/r',real)
for shift in [-48,-24,-12,12,24,48]:print('shift blocks',shift,'heldout rmse/r',run(np.roll(oldgb,shift,axis=1)))
res=[]
for v in (oldgb,newgb):
    model=HistGradientBoostingRegressor(max_iter=150,max_leaf_nodes=15,l2_regularization=1,random_state=0).fit(F[train],v[train]);res.append(v[test]-model.predict(F[test]))
print('independently residualized heldout r',corr(*res))

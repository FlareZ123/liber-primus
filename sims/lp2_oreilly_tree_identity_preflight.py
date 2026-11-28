#!/usr/bin/env python3
"""Fixed, source-only geometric identity preflight for one dated tree example. No runes used."""
import sys, json
import cv2
import numpy as np
from pathlib import Path

def compare(source,target):
    a=cv2.imread(source,cv2.IMREAD_GRAYSCALE)
    b=cv2.imread(target,cv2.IMREAD_GRAYSCALE)
    if a is None or b is None:raise ValueError('Cannot read JPEG')
    sa=min(1.0,1200/max(a.shape));sb=min(1.0,1200/max(b.shape))
    aa=cv2.resize(a,None,fx=sa,fy=sa,interpolation=cv2.INTER_AREA)
    bb=cv2.resize(b,None,fx=sb,fy=sb,interpolation=cv2.INTER_AREA)
    sq=cv2.resize(aa,(128,128),interpolation=cv2.INTER_AREA).astype(float)
    tq=cv2.resize(bb,(128,128),interpolation=cv2.INTER_AREA).astype(float)
    def corr(x,y):
        x=x-x.mean();y=y-y.mean()
        return float((x*y).sum()/np.sqrt((x*x).sum()*(y*y).sum()+1e-30))
    baselines={k:corr(sq,t) for k,t in [('direct',tq),('mirror_h',tq[:,::-1]),('mirror_v',tq[::-1,:]),('rotate_180',tq[::-1,::-1])]}
    detector=cv2.SIFT_create(nfeatures=4000,contrastThreshold=0.012,edgeThreshold=18)
    orientations={'direct':bb,'mirror_h':cv2.flip(bb,1),'mirror_v':cv2.flip(bb,0),'rotate_180':cv2.flip(bb,-1)}
    ka,da=detector.detectAndCompute(aa,None)
    tests=[]
    for name,im in orientations.items():
        kb,db=detector.detectAndCompute(im,None)
        if da is None or db is None:
            tests.append({'orientation':name,'features_source':len(ka),'features_target':len(kb),'ratio_matches':0,'homography_inliers':0});continue
        matches=cv2.BFMatcher(cv2.NORM_L2).knnMatch(da,db,k=2)
        good=[m for m,n in matches if m.distance<0.72*n.distance]
        inliers=0;mederror=None
        if len(good)>=4:
            src=np.float32([ka[m.queryIdx].pt for m in good]).reshape(-1,1,2)
            dst=np.float32([kb[m.trainIdx].pt for m in good]).reshape(-1,1,2)
            H,mask=cv2.findHomography(src,dst,cv2.RANSAC,5.0)
            if mask is not None:
                inliers=int(mask.sum())
                if H is not None and inliers>=4:
                    pred=cv2.perspectiveTransform(src,H)
                    error=np.sqrt(np.sum((pred-dst)**2,axis=(1,2)))
                    mederror=float(np.median(error[mask.ravel()!=0]))
        tests.append({'orientation':name,'features_source':len(ka),'features_target':len(kb),'ratio_matches':len(good),'homography_inliers':inliers,'median_reprojection_error_px':mederror})
    return {'source_dims':list(a.shape[::-1]),'target_dims':list(b.shape[::-1]),'fixed_size_correlations':baselines,'sift_registration':tests}
if __name__=='__main__':
    print(json.dumps({'candidate':Path(sys.argv[1]).name,
        'commons':compare(sys.argv[1],sys.argv[2]),
        'clipartbest_stock':compare(sys.argv[1],sys.argv[3])},indent=2,sort_keys=True))

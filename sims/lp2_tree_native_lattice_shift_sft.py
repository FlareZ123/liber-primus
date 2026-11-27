"""p32/p55 native 50/9-pixel lattice and held-side integer alignment.
Dependencies: numpy, scipy, Pillow, opencv-python.
Run from the repo root; original LP2 scan numbers 49,72.
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, binary_fill_holes, map_coordinates
from scipy.optimize import differential_evolution
import cv2
ROOT = Path(__file__).resolve().parent.parent / "resources/liber-primus"
CROPS = {49:(650,2060,1760,3130),72:(650,1410,1760,2480)}
PERIOD=50/9
def sample(p, crop):
    x0,y0,x1,y1=crop
    a=np.asarray(Image.open(ROOT/f"{p:02}.jpg").convert("L"),dtype=float)[y0:y1,x0:x1]
    coords=[]
    for axis in [0,1]:
        d=np.abs(np.diff(a,axis=axis)); start=(y0,x0)[axis]
        v=d.sum(axis=1-axis); t=np.arange(v.size)+start+.5
        e=np.exp(-2j*np.pi*t/PERIOD)
        c=np.sum(v*e)/v.sum()
        phi=(-np.angle(c)/(2*np.pi/PERIOD))%PERIOD
        halves=np.array_split(d,2,axis=1-axis)
        controls=[]
        for half in halves:
            u=half.sum(axis=1-axis); q=np.sum(u*e)/u.sum()
            controls.append((float(abs(q)),float((-np.angle(q)/(2*np.pi/PERIOD))%PERIOD)))
        print("phase",p,axis,abs(c),phi,controls)
        cc=phi+(np.arange(-1,700)+.5)*PERIOD-start
        coords.append(cc[(cc>=0)&(cc<a.shape[axis]-1)])
    result=a[np.rint(coords[0]).astype(int)[:,None],np.rint(coords[1]).astype(int)[None,:]]
    print("sample",p,result.shape,"first center",coords[0][0]+y0,coords[1][0]+x0)
    return result

def main():
    a={p:sample(p,c) for p,c in CROPS.items()}
    h=min(v.shape[0] for v in a.values()); w=min(v.shape[1] for v in a.values())
    target=np.maximum(0,252-a[49][:h,:w]).astype(np.float32)
    outline=(a[72][:h,:w]<240).astype(np.uint8)
    _,lab,stats,_=cv2.connectedComponentsWithStats(outline,8)
    source=binary_fill_holes(lab==1+np.argmax(stats[1:,cv2.CC_STAT_AREA])).astype(np.float32)
    print("filled source",source.sum(),"shape",source.shape)
    regions={"left":(slice(15,125),slice(15,100)),"right":(slice(15,125),slice(100,w-15)),"root":(slice(125,h-3),slice(15,w-15))}
    def cor(x,y):
        x=x.astype(float).ravel(); y=y.astype(float).ravel()
        x-=x.mean(); y-=y.mean()
        return np.dot(x,y)/np.sqrt(np.dot(x,x)*np.dot(y,y))
    def report(pred):
        return {k:float(cor(target[r],pred[r])) for k,r in regions.items()}
    def integer_fit(train):
        ys,xs=regions[train]; t=target[ys,xs]; best=(-2,None)
        for sig in np.arange(.5,12.01,.25):
            src=gaussian_filter(source,sig); padded=np.pad(src,((25,25),(25,25)))
            block=padded[ys.start:ys.stop+50,xs.start:xs.stop+50]
            _,mx,_,(xx,yy)=cv2.minMaxLoc(cv2.matchTemplate(block,t,cv2.TM_CCOEFF_NORMED))
            if mx>best[0]:best=(mx,(sig,xx-25,yy-25))
        sig,dx,dy=best[1]; padded=np.pad(gaussian_filter(source,sig),((25,25),(25,25)))
        return best,report(padded[25+dy:25+dy+h,25+dx:25+dx+w])
    Y,X=np.mgrid[:h,:w]
    def affine_fit(train):
        r=regions[train]; t=target[r]
        def pred(v,x,y):
            sx,sy,dx,dy,sig=v
            src=gaussian_filter(source,sig)
            return map_coordinates(src,[(y-h/2)*sy+h/2+dy,(x-w/2)*sx+w/2+dx],order=1,mode="constant",cval=0)
        res=differential_evolution(lambda v:-cor(t,pred(v,X[r],Y[r])),[(.85,1.15),(.85,1.15),(-20,20),(-20,20),(.5,12)],seed=13,popsize=8,maxiter=60,tol=1e-5,polish=True)
        return res.x.tolist(),report(pred(res.x,X,Y))
    for k in ["left","right"]:
        print("integer",k,integer_fit(k))
        print("affine",k,affine_fit(k))

if __name__=="__main__":
    main()

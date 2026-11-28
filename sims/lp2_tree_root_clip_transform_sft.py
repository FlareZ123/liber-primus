import base64, hashlib, json
from pathlib import Path
import numpy as np
import cv2
from scipy.ndimage import gaussian_filter
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def raster(path,h,w,sha):
    raw=base64.b64decode(path.read_text()); runs=[]; n=k=0
    for x in raw:
        n|=(x&127)<<k
        if x&128: k+=7
        else: runs.append(n); n=k=0
    a=np.bitwise_xor.accumulate(np.repeat(np.arange(len(runs))%2,runs).reshape(h,w).astype(np.uint8),axis=0)
    assert hashlib.sha256(a.tobytes()).hexdigest()==sha
    return a.astype(np.float32)
stock=raster(ROOT/'im-results/lp2-tree-common-stock-mask.b64',210,160,'a918dfdc5036d78dd9a2bf46552b1c91e7fadb20e0e41e61d9d01b4c10c5a993')[:,::-1].copy()
gc=raster(ROOT/'im-results/lp2-p55-contour-inverse-mask.b64',192,199,'ae6cb034b8f55fc24ffcd7389fdfa93ea368c7a8309abb7e23bdfe8a1668080b')
START=162
# Candidates share the stock crown. The rectangle clips only the root, no translation or expansion.
def clipped(left,right,bottom):
    a=stock.copy(); a[START:,:left]=0; a[START:,right:]=0; a[bottom:]=0; return a
# Hamming gain relative to empty root from keeping foreground pixels. Exhaustive rectangular max, via integral sums.
def fit(target,vertical_only=False):
    weights=stock[START:]*(2*target[START:]-1)
    ps=np.pad(weights.cumsum(0).cumsum(1),((1,0),(1,0)))
    # for every bottom, all x-intervals; score=weight on [START,bottom) x [left,right)
    best=-1e9; winners=[]
    for bottom in range(START,211):
        q=ps[bottom-START]; mat=q[None,:]-q[:,None]
        if vertical_only:
            score=float(mat[0,160]); options=[(0,160,bottom)]
        else:
            mat[np.tril_indices(161,-1)]=-np.inf
            score=float(mat.max()); options=[(int(l),int(r),bottom) for l,r in np.argwhere(mat==score)]
        if score>best: best=score; winners=options
        elif score==best: winners.extend(options)
    masks={hashlib.sha256(clipped(*v).tobytes()).hexdigest() for v in winners}
    chosen=min(winners,key=lambda v:(v[0],-v[1],-v[2]))
    return chosen,len(winners),len(masks),best

def warp(a,v,shape):
    sx,sy,tx,ty=v[:4]
    return cv2.warpAffine(a,np.array([[sx,0,tx],[0,sy,ty]],np.float32),(shape[1],shape[0]),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP)

def native(p,crop):
    x0,y0,x1,y1=crop
    a=np.asarray(Image.open(ROOT/'resources/liber-primus'/f'{p}.jpg').convert('L'),dtype=float)[y0:y1,x0:x1]
    coords=[]
    for axis in (0,1):
        v=np.abs(np.diff(a,axis=axis)).sum(axis=1-axis); t=np.arange(v.size)+(y0,x0)[axis]+.5
        c=np.sum(v*np.exp(-2j*np.pi*9/50*t))/v.sum(); phase=(-np.angle(c)/(2*np.pi*9/50))%(50/9)
        cc=phase+(np.arange(-1,700)+.5)*(50/9)-(y0,x0)[axis]
        coords.append(cc[(cc>=0)&(cc<a.shape[axis]-1)])
    return np.maximum(0,252-a[np.rint(coords[0]).astype(int)[:,None],np.rint(coords[1]).astype(int)[None,:]]).astype(np.float32)/252
p32=native(49,(650,2060,1760,3130)); p55=native(72,(650,1410,1760,2480))
# Published independent left/right/crown registrations from Agent6, rounded in original report.
fit55={'left':(.84549,.84596,-6.390,45.343,.68921,.785118,1.412223), 'right':(.84484,.84308,-6.461,45.558,.58098,.810180,1.267289), 'crown':(.8434580498835607,.8444254856468015,-6.269179940310348,45.459292324694964,.63326,.802846,1.363416)}
fit32={'left':(.85202,.88311,-11.254,36.728,4.26535), 'right':(.87435,.86402,-13.184,40.015,4.34961)}
reg={'left':(slice(15,125),slice(15,100)), 'right':(slice(15,125),slice(100,185)),'crown':(slice(15,125),slice(15,185)), 'root':(slice(142,190),slice(15,185))}
def measure(a,t,train):
    x=a[reg[train]].ravel(); y=t[reg[train]].ravel(); gain,bias=np.linalg.lstsq(np.c_[x,np.ones_like(x)],y,rcond=None)[0]; q=a[reg['root']].ravel(); z=t[reg['root']].ravel()
    return {'r':float(np.corrcoef(q,z)[0,1]),'mse':float(np.mean((gain*q+bias-z)**2)),'gain':float(gain),'bias':float(bias)}
def contour(a,v):
    x=warp(gaussian_filter(a,v[4]),v,p55.shape)
    gx=cv2.Sobel(x,cv2.CV_32F,1,0,ksize=3,scale=1/8); gy=cv2.Sobel(x,cv2.CV_32F,0,1,ksize=3,scale=1/8)
    d=(x-v[5])/np.maximum(np.sqrt(gx*gx+gy*gy),1e-4)
    return np.exp(-.5*(d/v[6])**2)
for planted in [(50,75,203),(42,76,205)]:
    a=clipped(*planted); pred,n,m,s=fit(a); assert np.array_equal(clipped(*pred),a)
    print('plant',planted,pred,n,m)
for name,v in fit55.items():
    sx,sy,tx,ty=v[:4]; mapped=warp(gc,(1/sx,1/sy,-tx/sx,-ty/sy),stock.shape); target=(mapped>=.5).astype(np.float32)
    k,n,m,score=fit(target); k0,n0,m0,score0=fit(target,True)
    full=stock.copy(); full[START:]=mapped[START:]
    print('p55 fit',name,k,n,m,score,'vertical',k0,n0,m0,score0,'target root',int(target[START:].sum()))
    for model,a in [('stock',stock),('vertical',clipped(*k0)),('rectangle',clipped(*k)),('full',full)]:
        print('model',name,model,'root Hamming',int(np.count_nonzero((a[START:]>=.5)!=target[START:])), 'p55 raw',measure(contour(a,v),p55,name))
        for name32,v32 in fit32.items():
            q=warp(gaussian_filter(a,v32[4]),v32,p32.shape)
            print('held p32',name,name32,model,measure(q,p32,name32))
# A selected lower-root affine transform around its attachment at (mean foreground x at row162,162).
# The only free values are horizontal/vertical scaling, x shift, and bottom truncation.
# Fit solely to each p55-derived mask. Selection geometry is fixed by the stock's longest trunk.
X=float(np.flatnonzero(stock[START]).mean())
def transformed(sx,sy,dx,bottom):
    a=stock.copy()
    root=stock[START:].copy()
    m=np.array([[1/sx,0,X-(X+dx)/sx],[0,1/sy,0]],np.float32)
    a[START:]=cv2.warpAffine(root,m,(160,210-START),flags=cv2.INTER_NEAREST|cv2.WARP_INVERSE_MAP)
    a[bottom:]=0
    return a
# Each transform's best bottom cutoff is found exactly from the per-row prefix gain.
def fit_transform(target):
    best=1e20; sols=[]
    for sx in np.arange(.5,1.251,.025):
      for sy in np.arange(.75,1.251,.025):
        for dx in np.arange(-4,4.01,.5):
          a=transformed(sx,sy,dx,210)[START:]; gain=(a*(2*target[START:]-1)).sum(1); c=np.r_[0,np.cumsum(gain)]; s=float(target[START:].sum()-max(c))
          for b in np.flatnonzero(c==max(c)):
            if s<best:best=s;sols=[]
            if s==best:sols.append((float(sx),float(sy),float(dx),int(b+START)))
    v=min(sols,key=lambda v:(abs(v[0]-1)+abs(v[1]-1)+abs(v[2])/8,v))
    return v,best,len(sols),len({hashlib.sha256(transformed(*v).tobytes()).hexdigest() for v in sols})
for name,v in fit55.items():
    sx,sy,tx,ty=v[:4]; mapped=warp(gc,(1/sx,1/sy,-tx/sx,-ty/sy),stock.shape); target=(mapped>=.5).astype(np.float32)
    k,e,n,m=fit_transform(target); a=transformed(*k)
    print('affineclip',name,k,e,n,m,'p55 raw',measure(contour(a,v),p55,name))
    for name32,v32 in fit32.items():
      q=warp(gaussian_filter(a,v32[4]),v32,p32.shape)
      print('affineclip held p32',name,name32,measure(q,p32,name32))
# Independent of the reconstructed mask: refine only the same four-parameter operation
# on the actual p55 pixels, with photometry frozen on its original crown.
from scipy.optimize import differential_evolution

def transform_linear(sx,sy,dx,bottom):
    a=stock.copy(); root=stock[START:]; m=np.array([[1/sx,0,X-(X+dx)/sx],[0,1/sy,0]],np.float32)
    a[START:]=cv2.warpAffine(root,m,(160,210-START),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP)
    a[round(bottom):]=0; return a
for name,v in fit55.items():
    stock_metrics=measure(contour(stock,v),p55,name); gain,bias=stock_metrics['gain'],stock_metrics['bias']; z=p55[reg['root']]
    def objective(k):
        q=contour(transform_linear(*k),v)[reg['root']]; return float(np.mean((q*gain+bias-z)**2))
    res=differential_evolution(objective,[(.5,1.25),(.75,1.25),(-4,4),(195,210)],seed=3301,maxiter=65,popsize=8,tol=1e-6,polish=False)
    k=res.x.tolist(); a=transform_linear(*k)
    print('rawfit',name,k,res.fun,res.nfev)
    for name32,v32 in fit32.items():
        print('rawfit held p32',name,name32,measure(warp(gaussian_filter(a,v32[4]),v32,p32.shape),p32,name32))

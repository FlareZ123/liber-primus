"""Original LP2 p32/p55 image-derived 121-symbol opacity key experiment.
Usage in repo: python sims/lp2_tree_opacity_sft.py resources/liber-primus
Or: python lp2_tree_opacity_sft.py archive.zip path/to/lp2-corpus.json
Requires Pillow, numpy, scipy, opencv-python.
"""
import io
import json
import sys
import zipfile
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import binary_closing, binary_fill_holes, gaussian_filter
from scipy.optimize import least_squares


def read_inputs(source, corpus):
    if source.is_dir():
        get = lambda n: (source / n).read_bytes()
    else:
        z = zipfile.ZipFile(source)
        entries = {Path(n).name:n for n in z.namelist() if n.endswith('.jpg')}
        get = lambda n: z.read(entries[n])
    a = 255-np.array(Image.open(io.BytesIO(get('49.jpg'))).convert('L'),dtype=np.float32)
    b = 255-np.array(Image.open(io.BytesIO(get('72.jpg'))).convert('L'),dtype=np.float32)
    assert a.shape == b.shape == (3600,2400)
    return a[2052:3240,600:1752],b[1440:2520,600:1752],json.loads(corpus.read_text(encoding='utf-8'))


def fit_images(a,b,mask):
    out_size=(round(a.shape[1]*.2),round(a.shape[0]*.2))
    target=cv2.resize(a,out_size,interpolation=cv2.INTER_AREA)
    train=np.indices(target.shape)[0]<150
    report={}
    for name,src in {'filled':mask,'outline':b/b.max(),'edge-mask':(b>12).astype(np.float32)}.items():
        small=cv2.resize(src,(round(b.shape[1]*.2),round(b.shape[0]*.2)),interpolation=cv2.INTER_AREA)
        def pred(p):
            sx,sy,tx,ty,sigma,amp,offset=p
            bb=cv2.warpAffine(small,np.array([[sx,0,tx],[0,sy,ty]],np.float32),out_size,flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
            return gaussian_filter(bb,sigma,mode='constant')*amp+offset
        fit=least_squares(lambda p:(pred(p)-target)[train].ravel(),[1,1,0,15,7,230,0],bounds=([.8,.8,-30,-15,1,0,-10],[1.2,1.2,30,40,25,800,10]),diff_step=.01,max_nfev=100)
        pr=pred(fit.x); residual=pr-target
        report[name]={'parameters':fit.x.tolist(),'train_rmse':float(np.sqrt(np.mean(residual[train]**2))),'hold_rmse':float(np.sqrt(np.mean(residual[~train]**2))),'hold_corr':float(np.corrcoef(pr[~train],target[~train])[0,1]),'full_corr':float(np.corrcoef(pr.ravel(),target.ravel())[0,1])}
    return report


def key_from_crop(a,t,src):
    y,x=np.where(a>t); box=[int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1)]
    x0,y0,x1,y1=box
    mean=cv2.resize(src[y0:y1,x0:x1],(11,11),interpolation=cv2.INTER_AREA)
    return np.minimum(28,np.floor(29*mean)).astype(int).ravel().tolist(),box


def ioc(a):
    h=np.bincount(a,minlength=29)
    return float(np.sum(h*(h-1))/(len(a)*(len(a)-1)))


def encrypt(p,k,s,hold):
    phase=0; out=[]
    for v in p:
        if hold and v==0:out.append(0)
        else:
            out.append((v+s*k[phase])%29);phase+=1
    return out


def inverse(c,k,s):
    # Keep all distinct paths, not merely one representative per phase.
    states=[(0,())]; peak=1
    for i,v in enumerate(c):
        nxt=[]
        for phase,p in states:
            if v==0:nxt.append((phase,p+(0,)))
            w=(v-s*k[phase])%29
            if w!=0:nxt.append((phase+1,p+(w,)))
        states=nxt;peak=max(peak,len(states))
        if not states:return {'failure_zero_based':i,'peak_paths':peak,'paths':[]}
    paths=[list(p) for _,p in states]
    assert all(encrypt(p,k,s,True)==c for p in paths)
    return {'peak_paths':peak,'paths':paths}


def main():
    source=Path(sys.argv[1]); corpus=Path(sys.argv[2]) if len(sys.argv)>2 else source/'lp2-corpus.json'
    a,b,j=read_inputs(source,corpus)
    mask=binary_fill_holes(binary_closing(b>12,iterations=4)).astype(np.float32)
    fits=fit_images(a,b,mask)
    c=j['pages'][32]['indices']; p=j['pages'][57]['indices']; names=j['translit']
    assert len(c)==121 and len(p)==95
    rows={}
    for name,im,t,src in [('p32raw',a,10,a/a.max()),('p55raw',b,12,b/b.max()),('p55fill',b,12,mask)]:
        k,box=key_from_crop(im,t,src)
        rows[name]={'crop_bbox':box,'key':k,'results':{}}
        for s in (1,-1):
            direct=[(v-s*q)%29 for v,q in zip(c,k)]
            assert encrypt(direct,k,s,False)==c
            inv=inverse(c,k,s)
            control=inverse(encrypt(p,k,s,True),k,s)
            assert p in control['paths']
            # Check native control under direct consumption as well.
            assert [(v-s*q)%29 for v,q in zip(encrypt(p,k,s,False),k)]==p
            def describe(v):return {'indices':v,'ioc':ioc(v),'text':' '.join(names[x] for x in v)}
            inv['paths']=[describe(v) for v in inv['paths']]
            rows[name]['results'][str(s)]={'direct':describe(direct),'fhold':inv,'native_control_paths':len(control['paths']),'native_true_path_retained':True}
    print(json.dumps({'fits':fits,'control_ioc':ioc(p),'original_ioc':ioc(c),'keys':rows},indent=2))

if __name__=='__main__':main()

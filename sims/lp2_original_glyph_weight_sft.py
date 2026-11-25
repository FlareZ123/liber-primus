"""Stroke weight channel test; run with original JPEG zip and output JSON."""
import io,json,sys,zipfile
from collections import defaultdict
from pathlib import Path
import cv2,numpy as np
from PIL import Image
from scipy.stats import norm
from lp2_original_vertical_glyph_phase_sft import ix as IX, P0, starts as STARTS, bands, seg, feature
KERNEL=cv2.getStructuringElement(cv2.MORPH_CROSS,(3,3))
def stat(a):
    return dict(n=int(len(a)),mean=float(a.mean()),sd=float(a.std()),quantile=np.quantile(a,[0,.01,.05,.25,.5,.75,.95,.99,1]).tolist())
def mixture(a,b):
    mu=a.mean(); sd=max(a.std(),1e-6); base=norm.logpdf(a,mu,sd).sum(); best=(-np.inf,None,None)
    for delta in np.linspace(.025,1,40):
        for noise in np.geomspace(.01,1.5,50):
            ll=(np.logaddexp(norm.logpdf(a,mu-delta,noise),norm.logpdf(a,mu+delta,noise))-np.log(2)).sum()
            if ll>best[0]: best=(ll,float(delta),float(noise))
    ll,d,s=best; l0=norm.logpdf(b,mu,sd); l1=np.logaddexp(norm.logpdf(b,mu-d,s),norm.logpdf(b,mu+d,s))-np.log(2)
    return dict(amplitude=d,noise=s,baseline_sd=float(sd),train_gain=float((ll-base)/len(a)),heldout_gain=float((l1-l0).mean()))
def main():
    with zipfile.ZipFile(sys.argv[1]) as z:
        def load(n):
            with Image.open(io.BytesIO(z.read(f'liber-primus-jpegs/{n+17:02}.jpg'))) as im: return np.asarray(im.convert('L')),np.asarray(im.convert('RGB'))
        p,_=load(0); templates=[]; labels=[]
        for y,line in zip(STARTS,P0):
            s=seg(p,y); c=[IX[x] for x in line if x in IX]; assert len(s)==len(c)
            for (l,r),v in zip(s,c): templates.append(feature(p,y,l,r)); labels.append(v)
        f=np.stack(templates); labels=np.array(labels); assert len(set(labels))==29
        rec=[]; recognized=0; excluded_red=0; excluded_geometry=0
        for n in range(58):
            p,rgb=load(n); a=[]; meta=[]
            for ln,y in enumerate(bands(p)):
                ss=seg(p,y)
                for k,(l,r) in enumerate(ss):
                    L=max(l-2,(ss[k-1][1]+l)//2+1 if k else 0); U=min(r+3,(r+ss[k+1][0])//2+1 if k+1<len(ss) else p.shape[1])
                    a.append(feature(p,y,l,r)); meta.append((ln,y,l,r,L,U))
            if not a: continue
            X=np.stack(a); d=((X*X).sum(1)[:,None]+(f*f).sum(1)[None,:]-2*X@f.T)/X.shape[1]; b=d.argmin(1)
            for i in np.flatnonzero(d[np.arange(len(X)),b]<.02):
                recognized+=1; ln,y,l,r,L,U=meta[i]; crop=p[y-8:y+126,L:U]; color=rgb[y-8:y+126,L:U]; core=crop<100
                if core.sum()<100: excluded_geometry+=1; continue
                if np.median(color[:,:,0][core].astype(np.int16)-color[:,:,1][core].astype(np.int16))>10: excluded_red+=1; continue
                alpha=np.clip((240-crop.astype(np.float32))/240,0,1)
                alpha=np.pad(alpha,1,mode="constant")
                mass=float(alpha.sum(dtype=np.float64)); hi=float(cv2.dilate(alpha,KERNEL).sum(dtype=np.float64)); lo=float(cv2.erode(alpha,KERNEL).sum(dtype=np.float64))
                rec.append((n,ln,int(labels[b[i]]),mass,hi,lo))
        assert recognized==13056,recognized
    rec=np.array(rec); page,line,label=rec[:,:3].astype(int).T; mass,hi,lo=rec[:,3:].T; train0=page<40
    center=np.array([np.median(mass[train0&(label==v)]) for v in range(29)])
    sensitivity=np.array([np.median((hi-lo)[train0&(label==v)]/2) for v in range(29)])
    assert np.isfinite(center).all() and np.all(sensitivity>0)
    groups=defaultdict(list)
    for i,(p,l) in enumerate(zip(page,line)): groups[(p,l)].append(i)
    groups=[np.array(a) for a in groups.values() if len(a)>=10]
    def residual(a):
        x=(a-center[label])/sensitivity[label]; out=np.full(len(x),np.nan)
        for idx in groups:
            v=x[idx]; out[idx]=[t-np.median(np.delete(v,k)) for k,t in enumerate(v)]
        return out
    rr=residual(mass); valid=np.isfinite(rr); train=valid&(page<40); hold=valid&(page>=40)&(page<56); solved=valid&(page>=56)
    assert train.sum()>5000 and hold.sum()>1000 and solved.sum()>80
    rng=np.random.default_rng(3301); controls={}
    for amp in [.05,.1,.25,.5,1.]:
        bits=rng.integers(0,2,len(rec)); altered=mass+amp*np.where(bits,hi-mass,lo-mass); r2=residual(altered)
        controls[str(amp)]=dict(heldout_delta=stat((r2-rr)[hold]),bit_accuracy_holdout=float(np.mean((r2[hold]>0)==bits[hold])),mixture=mixture(r2[train],r2[hold]))
    out=dict(recognized=recognized,excluded_red=excluded_red,excluded_geometry=excluded_geometry,measured=len(rec),valid=int(valid.sum()),train=stat(rr[train]),holdout=stat(rr[hold]),solved=stat(rr[solved]),original_mixture=mixture(rr[train],rr[hold]),controls=controls,per_page={str(n):stat(rr[valid&(page==n)]) for n in sorted(set(page[valid]))})
    Path(sys.argv[2]).write_text(json.dumps(out,indent=2)+'\n'); print(json.dumps({k:v for k,v in out.items() if k!='per_page'},indent=2))
if __name__=='__main__': main()

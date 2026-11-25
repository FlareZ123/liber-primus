"""Vertical per-glyph subpixel channel test on original LP2 JPEG zip.

Usage: python sims/lp2_original_vertical_glyph_phase_sft.py liber-primus-jpegs.zip output.json
Dependencies: numpy, scipy, opencv-python, Pillow.
"""
import io,json,zipfile,sys
from pathlib import Path
from collections import defaultdict
import numpy as np,cv2
from PIL import Image
from scipy.stats import norm
R='ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'; ix={c:i for i,c in enumerate(R)}
# Nine p0 body lines; same known training lines and raster segmentation as Agent50.
P0='''ᛋᛈᛏᚠᛈᚢᛝᚣᛝᛉᛡ-ᚣᚻ-ᛒᚢ-ᚷᚩᛈ-ᛝᚫᚦ-ᛁ/
ᚫᚻᛉᚦᛈᚷ-ᚣᚠᛝᚳᛄ-ᚦᚪᛗᛁᛝᛁᛡᚣ-ᚻᛇ-ᛏᚻᚫ/
ᛡ-ᛉᚣ-ᛖᚢᛝ-ᚳᚠᚾ-ᛇᛄᚦᛁᚦ-ᚦᛈ-ᚣᛝᛠ-ᚣᚾ/
ᛖᚣ-ᛞᛉᛝᚹ-ᛒᚳᛉᛞᛒᚠ-ᛗᛏᚾᛖ-ᛠᛄᚾᛚᚷ/
ᛒ-ᛉᚷᚦ.ᚣᛁᛞᚪ-ᛝᚷᛗᛄᚱᚩᛚᛇ-ᚣᛏᛈᛁᚦᛞᛄ-/
ᛟᚻᛚ-ᛠ-ᚠᛉᚫᛈᚷᛉ-ᚠᛚᚹᛇᛏᚫ-ᚠᚷᚾ-ᛗᛇᛚᚾ-/
ᛝᛗᚠᚱᛡ-ᚪᛋ-ᛠᛗᛝᛉᛉᛇᛞᛒ-ᛟᛞᛗᚩ-ᛠ/
ᛇᚻ-ᛞᛝᚷ-ᛟᛝᛚᚢᚱᚾᛏ-ᚫᛋᚣᚢᚻᚱᛏ-ᚻᚳ-ᛋᛟ/
ᛏᛟᛝᚢᚱ-ᛋ-ᚠᚩᛖᚹᛠᛟᛚᚠᚫ-ᛗᚱᛝ-ᛞᚪᛗᚱ-ᚹ/'''.splitlines()
starts=[1234,1422,1610,1798,1986,2174,2362,2550,2738]
def runs(pos,gap):
 out=[]
 for v in pos:
  if not out or v>out[-1][1]+gap:out.append([int(v),int(v)])
  else:out[-1][1]=int(v)
 return out
def bands(p):
 c=np.count_nonzero(p[:,850:1960]<150,axis=1)
 return [a-4 for a,b in runs(np.flatnonzero(c>80),2) if 85<=b-a+1<=145 and c[a:b+1].max()>200]
def seg(p,y):
 a=p[y:y+118,600:2100]<150
 return [(l+600,r+600) for l,r in runs(np.flatnonzero(a.sum(0)>=7),1) if np.count_nonzero(a[:,l:r+1].any(1))>=100 and r-l+1<=92]
def feature(p,y,l,r):
 x=(p[y:y+118,l:r+1]<150).astype(np.float32);i=np.flatnonzero(x.any(1));x=x[i[0]:i[-1]+1];z=np.zeros((120,96),np.float32);z[:x.shape[0],:x.shape[1]]=x
 return cv2.resize(z,(48,60),interpolation=cv2.INTER_AREA).ravel()
def profile(p,y,l,r):
 crop=p[y-8:y+126,l:r+1].astype(float);a=np.maximum(0,210-crop).sum(axis=1);return a/a.sum()
def stat(a):
 return dict(n=len(a),mean=float(a.mean()),sd=float(a.std()),rmse=float(np.sqrt(np.mean(a*a))),quantile=np.quantile(a,[0,.01,.05,.25,.5,.75,.95,.99,1]).tolist())
def main():
 z=zipfile.ZipFile(sys.argv[1]);load=lambda n:np.asarray(Image.open(io.BytesIO(z.read(f'liber-primus-jpegs/{n+17:02}.jpg'))).convert('L'))
 p=load(0);f=[];labels=[]
 for y,line in zip(starts,P0):
  s=seg(p,y);c=[ix[x] for x in line if x in ix];assert len(s)==len(c),(y,len(s),len(c))
  for (l,r),v in zip(s,c):f.append(feature(p,y,l,r));labels.append(v)
 f=np.stack(f);labels=np.array(labels);assert len(set(labels))==29
 rec=[];profiles=[]
 for n in range(58):
  p=load(n);a=[];m=[];ps=[]
  for ln,y in enumerate(bands(p)):
   for l,r in seg(p,y):a.append(feature(p,y,l,r));m.append((n,ln,y,l,r));ps.append(profile(p,y,l,r))
  if not a:continue
  X=np.stack(a);d=((X*X).sum(1)[:,None]+(f*f).sum(1)[None,:]-2*X@f.T)/X.shape[1];b=d.argmin(1)
  for i in np.flatnonzero(d[np.arange(len(X)),b]<.02):rec.append((*m[i],int(labels[b[i]])));profiles.append(ps[i])
 rec=np.array(rec);profiles=np.stack(profiles);grid=np.arange(profiles.shape[1]);ds=np.linspace(-4,4,161)
 t=[]
 for c in range(29):
  a=np.median(profiles[(rec[:,0]<40)&(rec[:,5]==c)],axis=0);b=np.stack([np.interp(grid-d,grid,a,left=0,right=0) for d in ds]);b-=b.mean(1)[:,None];b/=np.linalg.norm(b,axis=1)[:,None];t.append(b)
 def est(ps):
  shifts=np.zeros(len(ps));scores=np.zeros(len(ps))
  for c in range(29):
   m=np.flatnonzero(rec[:,5]==c);x=ps[m]-ps[m].mean(1)[:,None];x/=np.linalg.norm(x,axis=1)[:,None];sc=x@t[c].T;k=sc.argmax(1);yy=sc[np.arange(len(k)),k];d=ds[k].copy();g=(k>0)&(k<len(ds)-1);ig=np.flatnonzero(g);kg=k[g];ym=sc[ig,kg-1];yp=sc[ig,kg+1];cur=ym-2*yy[g]+yp;d[g]+=np.divide(.5*(ym-yp)*.05,cur,out=np.zeros_like(cur),where=np.abs(cur)>1e-12);shifts[m]=d;scores[m]=yy
  return shifts,scores
 shifts,scores=est(profiles);good=(scores>.995)&(np.abs(shifts)<3.95);groups=defaultdict(list)
 for i in np.flatnonzero(good):groups[tuple(rec[i,:2])].append(i)
 groups=[np.array(a) for a in groups.values() if len(a)>=10]
 def residual(s):
  out=np.full(len(s),np.nan)
  for m in groups:
   a=s[m];out[m]=[v-np.median(np.delete(a,i)) for i,v in enumerate(a)]
  return out
 rr=residual(shifts);valid=np.isfinite(rr);train=valid&(rec[:,0]<40);hold=valid&(rec[:,0]>=40)&(rec[:,0]<56);solved=valid&(rec[:,0]>=56)
 def mixture(a,b):
  mu=a.mean();sd=max(a.std(),1e-6);base=norm.logpdf(a,mu,sd).sum();best=(-np.inf,None,None)
  for delta in np.linspace(.05,1,20):
   for ss in np.geomspace(.025,1.5,40):
    ll=(np.logaddexp(norm.logpdf(a,mu-delta,ss),norm.logpdf(a,mu+delta,ss))-np.log(2)).sum()
    if ll>best[0]:best=(ll,float(delta),float(ss))
  ll,d,s=best;l0=norm.logpdf(b,mu,sd);l1=np.logaddexp(norm.logpdf(b,mu-d,s),norm.logpdf(b,mu+d,s))-np.log(2)
  return dict(amplitude=d,noise=s,baseline_sd=float(sd),train_gain=float((ll-base)/len(a)),heldout_gain=float((l1-l0).mean()))
 rng=np.random.default_rng(3301);controls={}
 for amp in [.1,.25,.5,1.]:
  bits=rng.integers(0,2,len(profiles));delta=amp*(2*bits-1);p=np.stack([np.interp(grid-d,grid,a,left=0,right=0) for d,a in zip(delta,profiles)]);s,_=est(p);r2=residual(s);controls[str(amp)]=dict(shift_error=stat(((s-shifts)-delta)[hold]),bit_accuracy_holdout=float(np.mean((r2[hold]>0)==bits[hold])),mixture=mixture(r2[train],r2[hold]))
 out=dict(glyphs=len(rec),valid=int(valid.sum()),train=stat(rr[train]),holdout=stat(rr[hold]),solved=stat(rr[solved]),original_mixture=mixture(rr[train],rr[hold]),controls=controls,page_stats={str(n):stat(rr[valid&(rec[:,0]==n)]) for n in sorted(set(rec[valid,0]))});Path(sys.argv[2]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='page_stats'},indent=2))
if __name__=='__main__':main()

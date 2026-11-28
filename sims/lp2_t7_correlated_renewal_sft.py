#!/usr/bin/env python3
"""Source-exact SFT for a stationary correlated-renewal explanation of LP2 T7."""
import argparse,json,math
from pathlib import Path
import numpy as np
N=29; KEEP=86/447
KEYS=("n_sites","T1_ks","T2_gapcv2","T3_chi2_mod29","T4_chi2_mod60","T6_dispersion","T7_gap_ac1")
def load(repo):
 o=json.loads((repo/"resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")); ps=[p for p in o["pages"] if p["status"]=="unsolved" and p["page"]<=55 and p["runic_count"]]; x=[]; pg=[]
 for j,p in enumerate(ps): assert p["runic_count"]==len(p["indices"]); x.extend(p["indices"]); pg.extend([j]*len(p["indices"]))
 x=np.asarray(x,dtype=np.int64); pg=np.asarray(pg,dtype=np.int64); assert len(ps)==55 and len(x)==12956; return x,pg
def sites(x): return np.flatnonzero(x[1:]==x[:-1])
def chi(v,k):
 c=np.bincount(v,minlength=k).astype(float); e=len(v)/k; return float(((c-e)**2/e).sum())
def ks(p,n):
 u=np.sort(p/float(n)); k=len(u); i=np.arange(1,k+1); return float(max(np.max(i/k-u),np.max(u-(i-1)/k)))
def stats(x,pg):
 p=sites(x); g=np.diff(p).astype(float); cnt=np.bincount(pg[p],minlength=55)[:55].astype(float); mm=np.bincount(pg[:-1][pg[:-1]==pg[1:]],minlength=55)[:55].astype(float); ph=cnt.sum()/mm.sum(); var=mm*ph*(1-ph); keep=var>0; disp=float((((cnt-mm*ph)**2/var)[keep]).sum()/(keep.sum()-1)); ac=float(np.corrcoef(g[:-1],g[1:])[0,1])
 return dict(n_sites=float(len(p)),T1_ks=ks(p,len(x)),T2_gapcv2=float(g.var()/g.mean()**2),T3_chi2_mod29=chi(p%29,29),T4_chi2_mod60=chi(p%60,60),T6_dispersion=disp,T7_gap_ac1=ac)
def flat(rng,pg):
 n=len(pg); x=np.empty(n,dtype=np.int64); x[0]=rng.integers(N); draw=rng.integers(N,size=n); keep=rng.random(n)<KEEP; alt=rng.integers(N-1,size=n)
 for i in range(1,n):
  v=int(draw[i])
  if v==x[i-1] and not keep[i]: a=int(alt[i]); v=a if a<x[i-1] else a+1
  x[i]=v
 return x
def renewal(rng,pg,rho=.42,mean_gap=150.5):
 n=len(pg); ev=np.zeros(n-1,dtype=bool); z=float(rng.standard_normal()); pos=0; innov=math.sqrt(1-rho*rho); root2=math.sqrt(2)
 while True:
  u=.5*(1+math.erf(z/root2)); u=min(1-1e-15,max(1e-15,u)); pos+=max(1,int(round(-mean_gap*math.log1p(-u))))
  if pos>=n-1: break
  ev[pos]=True; z=rho*z+innov*float(rng.standard_normal())
 x=np.empty(n,dtype=np.int64); x[0]=rng.integers(N); alt=rng.integers(N-1,size=n-1)
 for i in range(n-1):
  if ev[i]: x[i+1]=x[i]
  else: a=int(alt[i]); x[i+1]=a if a<x[i] else a+1
 assert np.array_equal(sites(x),np.flatnonzero(ev)); return x
def sim(gen,pg,n,seed):
 rng=np.random.default_rng(seed); return [stats(gen(rng,pg),pg) for _ in range(n)]
def evidence(ss,obs,scale): return float(np.mean([math.exp(-sum(((s[k]-obs[k])/scale[k])**2 for k in KEYS)/2) for s in ss]))
def evaluate(x,pg,n,seed):
 obs=stats(x,pg); ss=sim(renewal,pg,n,seed); ff=sim(flat,pg,n,seed+1); scale={k:float(np.std([s[k] for s in ff])) for k in KEYS}; rows={}; ok=True
 for k in KEYS:
  v=np.asarray([s[k] for s in ss]); p=min(1.,2*min((v>=obs[k]).sum()+1,(v<=obs[k]).sum()+1)/(len(v)+1)); ok &= p>=.05; rows[k]={"real":obs[k],"median":float(np.median(v)),"p_two_sided":float(p)}
 return {"seed":seed,"draws":n,"fits_all":bool(ok),"evidence_ratio_vs_flat":evidence(ss,obs,scale)/evidence(ff,obs,scale),"stats":rows}
def main():
 ap=argparse.ArgumentParser(); ap.add_argument("--repo",type=Path,default=Path(__file__).resolve().parents[1]); ap.add_argument("--draws",type=int,default=1000); a=ap.parse_args(); x,pg=load(a.repo); obs=stats(x,pg)
 expect={"n_sites":86.0,"T1_ks":0.10924093712529709,"T2_gapcv2":0.892419051024709,"T3_chi2_mod29":32.69767441860465,"T4_chi2_mod60":50.744186046511665,"T6_dispersion":1.090732964363706,"T7_gap_ac1":0.38001968924100965}
 for k in KEYS: assert abs(obs[k]-expect[k])<1e-12,(k,obs[k],expect[k])
 out=[evaluate(x,pg,a.draws,s) for s in (3301,123456789)]; print(json.dumps({"source":obs,"runs":out},indent=2,sort_keys=True))
 for r in out: assert r["fits_all"],r; assert r["evidence_ratio_vs_flat"]>=3,r
 print("PASS: two-seed C5-style crossing")
if __name__=="__main__": main()

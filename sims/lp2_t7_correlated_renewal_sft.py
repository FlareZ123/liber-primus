#!/usr/bin/env python3
"""SFT for LP2 T7: stationary two-input gamma renewal exception clock.

Frozen process: G_n = U_n + theta*U_(n-1), U iid Gamma(alpha,beta).
It tests a generation-process constraint only; it does not decrypt LP2.
"""
import argparse,json,math
from pathlib import Path
import numpy as np
N=12956; Q=(1/29)*(86/447)
KEYS=("n_sites","T1_ks","T2_gapcv2","T3_chi2_mod29","T4_chi2_mod60","T6_dispersion","T7_gap_ac1")
THETA=.460664260759037; ALPHA=.6366617848820242; BETA=161.83681183502893

def source(repo):
    o=json.loads((repo/"resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    ps=[p for p in o["pages"] if p["status"]=="unsolved" and p["page"]<=55 and p["runic_count"]]
    x=[]; pg=[]
    for j,p in enumerate(ps):
        assert p["runic_count"]==len(p["indices"])
        x+=p["indices"]; pg += [j]*len(p["indices"])
    x=np.asarray(x,dtype=np.int64); pg=np.asarray(pg,dtype=np.int64)
    assert len(ps)==55 and len(x)==N
    return x,pg

def eqsites(x): return np.flatnonzero(x[1:]==x[:-1])

def chi(v,k):
    c=np.bincount(v,minlength=k).astype(float); e=len(v)/k
    return float(((c-e)**2/e).sum())

def ks(p,n):
    u=np.sort(p/float(n)); k=len(u); i=np.arange(1,k+1)
    return float(max(np.max(i/k-u),np.max(u-(i-1)/k)))

def battery(p,pg):
    p=np.asarray(p,dtype=np.int64); g=np.diff(p).astype(float)
    cnt=np.bincount(pg[p],minlength=55)[:55].astype(float)
    mm=np.bincount(pg[:-1][pg[:-1]==pg[1:]],minlength=55)[:55].astype(float)
    ph=cnt.sum()/mm.sum(); var=mm*ph*(1-ph); keep=var>0
    return dict(
        n_sites=float(len(p)),T1_ks=ks(p,len(pg)),
        T2_gapcv2=float(g.var()/g.mean()**2),
        T3_chi2_mod29=chi(p%29,29),T4_chi2_mod60=chi(p%60,60),
        T6_dispersion=float((((cnt-mm*ph)**2/var)[keep]).sum()/(keep.sum()-1)),
        T7_gap_ac1=float(np.corrcoef(g[:-1],g[1:])[0,1]))

def two_tap(rng):
    prev=rng.gamma(ALPHA,BETA); pos=0; out=[]
    while True:
        cur=rng.gamma(ALPHA,BETA)
        pos+=max(1,int(round(cur+THETA*prev)))
        if pos>=N-1: break
        out.append(pos); prev=cur
    return np.asarray(out,dtype=np.int64)

def flat(rng): return np.flatnonzero(rng.random(N-1)<Q)

def sim(gen,pg,n,seed):
    rng=np.random.default_rng(seed)
    return [battery(gen(rng),pg) for _ in range(n)]

def evidence(ss,obs,scale):
    return float(np.mean([math.exp(-sum(((s[k]-obs[k])/scale[k])**2 for k in KEYS)/2) for s in ss]))

def evaluate(obs,pg,n,seed):
    ss=sim(two_tap,pg,n,seed); ff=sim(flat,pg,n,seed+1)
    scale={k:float(np.std([s[k] for s in ff])) for k in KEYS}
    rows={}; ok=True
    for k in KEYS:
        v=np.asarray([s[k] for s in ss])
        p=min(1.,2*min((v>=obs[k]).sum()+1,(v<=obs[k]).sum()+1)/(len(v)+1))
        ok &= p>=.05
        rows[k]={"real":obs[k],"median":float(np.median(v)),"p_two_sided":float(p)}
    return {"seed":seed,"draws":n,"fits_all":bool(ok),
            "evidence_ratio_vs_flat":evidence(ss,obs,scale)/evidence(ff,obs,scale),
            "stats":rows}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo",type=Path,default=Path(__file__).resolve().parents[1])
    ap.add_argument("--draws",type=int,default=1000)
    a=ap.parse_args(); x,pg=source(a.repo); obs=battery(eqsites(x),pg)
    expected={"n_sites":86.0,"T1_ks":.10924093712529709,
      "T2_gapcv2":.892419051024709,"T3_chi2_mod29":32.69767441860465,
      "T4_chi2_mod60":50.744186046511665,"T6_dispersion":1.090732964363706,
      "T7_gap_ac1":.38001968924100965}
    for k in KEYS: assert abs(obs[k]-expected[k])<1e-12,(k,obs[k],expected[k])
    assert abs(THETA/(1+THETA*THETA)-expected["T7_gap_ac1"])<1e-12
    assert abs((1+THETA*THETA)/(ALPHA*(1+THETA)**2)-expected["T2_gapcv2"])<1e-12
    out=[evaluate(obs,pg,a.draws,s) for s in (3301,123456789)]
    print(json.dumps({"source":obs,"theta":THETA,"alpha":ALPHA,"beta":BETA,"runs":out},indent=2,sort_keys=True))
    for r in out:
        assert r["fits_all"],r
        assert r["evidence_ratio_vs_flat"]>=3,r
    print("PASS: stationary two-input renewal clock crosses both fixed C5-style gates")

if __name__=="__main__": main()

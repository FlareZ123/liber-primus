#!/usr/bin/env python3
"""Ciphertext-only q8 permutation autokey marginal attack.
Requires Python 3, NumPy, SciPy, g++ with OpenMP. No plaintext used in fit.
Run from any location: python sims/lp2_q8_permutation_marginal_sft.py
"""
import json, os, re, subprocess, tempfile
from pathlib import Path
from itertools import combinations
import numpy as np
from scipy.optimize import linear_sum_assignment

Q,N=8,29
idx=np.arange(N); diff=(idx[:,None]-idx[None,:])%N
# 2979 runes, solved GP source sections; independent of literary controls and unknown LP2.
p=np.array([48,153,115,256,192,91,40,98,90,181,184,3,0,41,5,199,196,40,380,76,109,31,0,117,217,2,79,16,20],dtype=float)+.5
p/=p.sum()
pa=p.copy();pa[0]=0;pa/=pa.sum()
logpa=np.log(np.maximum(pa,1e-30))
mask=np.ones((N,N),bool);mask[0,:]=False;mask[:,0]=False
swaps=np.array(list(combinations(range(N),2)))
ALPHA='0123456789abcdefghijklmnopqrs'
GP=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA']
ROOT=Path(__file__).resolve().parents[1]
FIT=10000

def assignment(score):
    return linear_sum_assignment(score,maximize=True)[1]

def components(f,prob=p):
    u=np.empty(N);u[f]=prob
    A=u[diff]; B=prob[diff[:,f]]
    W=A[:,None,:]*B[None,:,:]*prob[None,None,:]
    return u,W,W.sum(axis=2)

def ll(c,f,censor=False):
    J=components(f,pa if censor else p)[2]
    if censor:return (c[mask]*np.log(J[mask])).sum()-c.sum()*np.log(J[mask].sum())
    return (c*np.log(J)).sum()

def em(c,f,censor=False):
    prob=pa if censor else p; lp=logpa if censor else np.log(p)
    old=-np.inf
    for it in range(100 if censor else 120):
        _,W,J=components(f,prob)
        value=ll(c,f,censor)
        assert value>=old-1e-6
        cc=c.copy().astype(float)
        if censor: cc[~mask]=c.sum()*J[~mask]/J[mask].sum()
        w=cc[:,:,None]*W/J[:,:,None]
        zc=np.zeros(N);np.add.at(zc,diff.ravel(),w.sum(axis=1).ravel())
        score=lp[:,None]*zc[None,:]+w.sum(axis=0).T@lp[diff]
        if censor:score[0,zc>1e-12]=-1e100
        new=assignment(score)
        if np.array_equal(new,f) or (censor and ll(c,new,True)<value-1e-7):break
        old=value;f=new
    return f,ll(c,f,censor)

def spectral(c,ridge):
    J=c/c.sum();h=(J.sum(axis=0)+J.sum(axis=1))/2
    P=p[diff];u=np.linalg.solve(P.T@P+ridge*np.eye(N),P.T@h+ridge*np.ones(N)/N)
    f=np.empty(N,dtype=int);f[np.argsort(p)]=np.argsort(u)
    u2=np.empty(N);u2[f]=p;U=u2[diff]
    inv=lambda M:np.linalg.solve(M.T@M+ridge*np.eye(N),M.T)
    return assignment(inv(U)@J@inv(P).T),f

def swap_best(c,f,censor):
    prob=pa if censor else p
    fs=np.tile(f,(len(swaps),1));r=np.arange(len(swaps));a,b=swaps.T
    fs[r,a],fs[r,b]=fs[r,b].copy(),fs[r,a].copy()
    u=np.empty_like(fs,dtype=float)
    np.put_along_axis(u,fs,np.broadcast_to(prob,fs.shape),axis=1)
    A=u[:,diff]*prob[None,None,:]
    B=prob[(idx[None,:,None]-fs[:,None,:])%N]
    J=A@B.transpose(0,2,1)
    if censor:vals=np.einsum('ab,b->a',np.log(J[:,mask]),c[mask])-c.sum()*np.log(J[:,mask].sum(axis=1))
    else:vals=np.einsum('abc,bc->a',np.log(J),c)
    i=vals.argmax();return fs[i],vals[i]

def refine(c,f,censor):
    value=ll(c,f,censor)
    for _ in range(100):
        v,l=swap_best(c,f,censor)
        if l<=value+1e-8:break
        f,value=v,l
    return f,value

def recover(c,rng,censor=False):
    cc=c.astype(float)
    if censor:cc[~mask]=c[mask].mean() # initializer only
    cand=[rng.permutation(N) for _ in range(24)]
    for ridge in [.00001,.0001,.001,.01,.05]:cand+=list(spectral(cc,ridge))
    out=sorted([em(c,f,censor) for f in cand],key=lambda z:z[1],reverse=True)
    return max([refine(c,k,censor) for k,v in out[:6]],key=lambda z:z[1])[0]

def counts(ct,censor=False):
    if censor:
        w=np.lib.stride_tricks.sliding_window_view(ct,Q+1)
        w=w[(w!=0).all(axis=1)]
        a,b=w[:,0],w[:,-1]
    else:a,b=ct[:-Q],ct[Q:]
    return np.bincount(a*N+b,minlength=N*N).reshape(N,N)

def enc(pt,f,rng,hold=False):
    active=pt!=0 if hold else np.ones(len(pt),bool)
    v=pt[active];ct=np.zeros_like(pt)
    ct[active]=np.r_[(v[:Q]+rng.integers(N,size=Q))%N,(v[Q:]+f[v[:-Q]])%N]
    return ct

def chain(exe,ct,prob,k,censor=False,rs=(3,4,6,8,12,16)):
    with tempfile.TemporaryDirectory() as d:
        for name,arr in [('ct',ct),('prob',prob),('key',k)]:
            np.savetxt(Path(d)/name,arr,fmt='%.17g' if name=='prob' else '%d')
        out=subprocess.check_output([str(exe),d+'/ct',d+'/prob',d+'/key',str(int(censor)),*map(str,rs)],env={**os.environ,'OMP_NUM_THREADS':'4'},text=True).strip().splitlines()
        for line in out[::2]:print(line,flush=True)
        return np.array(list(map(int,out[-1].split())))

def decode(ct,k,fit):
    out=np.empty(len(ct),int)
    for j in range(Q):
        s=ct[j::Q];nfit=(fit-1-j)//Q+1
        opts=np.empty((N,len(s)),int);opts[:,0]=np.arange(N)
        for i,c in enumerate(s[1:],1):opts[:,i]=(c-k[opts[:,i-1]])%N
        out[j::Q]=opts[np.log(p[opts[:,:nfit]]).sum(axis=1).argmax()]
    assert np.array_equal((out[Q:]+k[out[:-Q]])%N,ct[Q:])
    return out

def fnv(seq):
    h=2166136261
    for v in seq:h=((h^ord(ALPHA[v]))*16777619)&0xffffffff
    return h

def donor():
    s=(ROOT/'resources/external/blake-marriage-1906-gutenberg45315.txt').read_text(encoding='utf-8').upper()
    for a,b in [('QU','CW'),('V','U'),('K','C'),('Q','C'),('Z','S')]:s=s.replace(a,b)
    table={x:i for i,x in enumerate(GP)}
    seq=[]
    for word in re.findall('[A-Z]+',s):
        i=0
        while i<len(word):
            if word[i:i+3]=='ING':seq.append(21);i+=3
            elif word[i:i+2] in table and len(word[i:i+2])==2:seq.append(table[word[i:i+2]]);i+=2
            else:
                if word[i] in table:seq.append(table[word[i]])
                i+=1
    pt=np.array(seq[:12956]);assert len(pt)==12956 and fnv(pt)==220600992
    return pt

def fit(exe,ct,rng,hold=False):
    c=counts(ct[(32 if hold else Q):FIT],hold)
    k=recover(c,rng,hold);pre=k.copy()
    k=chain(exe,ct[:FIT],pa if hold else p,k,hold,(3,4,6,8) if hold else (3,4,6,8,12,16))
    return k,pre,c

def main():
    with tempfile.TemporaryDirectory() as d:
        exe=Path(d)/('chain.exe' if os.name=='nt' else 'chain')
        subprocess.check_call(['g++','-O3','-std=c++17','-fopenmp',str(Path(__file__).with_suffix('.cpp')),'-o',str(exe)])
        pt=donor();rng=np.random.default_rng(981033)
        for hold in [False,True]:
            for trial in range(2):
                f=rng.permutation(N);ct=enc(pt,f,rng,hold);k,pre,c=fit(exe,ct,rng,hold)
                result=dict(hold=hold,trial=trial,pair=int((pre==f).sum()),key=int((k==f).sum()),active_key=int((k[1:]==f[1:]).sum()),key_mass=float((pa if hold else p)[k==f].sum()))
                if not hold:
                    pred=decode(ct,k,FIT)
                    result.update(fit_matches=int((pred[:FIT]==pt[:FIT]).sum()),withheld_matches=int((pred[FIT:]==pt[FIT:]).sum()),withheld_n=len(pt)-FIT)
                else:result.update(pair_ll=float(ll(c,k,True)/c.sum()),pair_n=int(c.sum()))
                print(json.dumps(result),flush=True)
                if hold:np.savez(f'lp2-q8-hold-control-{trial}.npz',ct=ct,pt=pt,f=f,k=k)
        corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
        ct=np.array([x for page in corpus['pages'][:56] for x in page['indices']])
        assert len(ct)==12956 and fnv(ct)==1738583386
        rng=np.random.default_rng(981034)
        for hold in [False,True]:
            k,pre,c=fit(exe,ct,rng,hold);result=dict(original=True,hold=hold,key=k.tolist())
            if not hold:
                pred=decode(ct,k,FIT)
                result.update(fit_nll=float(-np.log(p[pred[:FIT]]).mean()),holdout_nll=float(-np.log(p[pred[FIT:]]).mean()),uniform=float(np.log(N)),holdout_gp=''.join(ALPHA[x] for x in pred[FIT:FIT+160]))
            else:
                result.update(pair_ll=float(ll(c,k,True)/c.sum()),pair_n=int(c.sum()))
                np.savez('lp2-q8-hold-original.npz',ct=ct,k=k)
            print(json.dumps(result),flush=True)

if __name__=='__main__':main()

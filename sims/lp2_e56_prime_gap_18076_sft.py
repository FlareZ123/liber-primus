#!/usr/bin/env python3
"""Source-constrained E56w+n test of the 2013 180/76 prime split.
Model: RiskAverseTech/cicada-ioc @ ff52f6dfa0f0a5b4576079aa9addc5b08283e640/src/e56_lattice.py
(q=.81, echo gate=.5, filler=.40, OOD=.04, beam=8). Dependencies numpy==2.3.5,
textblob==0.19.0. TextBlob spelling counts aggregate to 29,060 GP-rune words; this
approximates, but is not byte-identical to, the upstream 18,580-entry rune dictionary.
Frozen assignment: omitted prime ordinals 21..200 -> p53+p54 red Ac (180);
visible ordinals 1..20 and 201..256 -> p55 (76). Forward only. p mod29 and
phi(p)=p-1 mod29; P=C-K, P=C+K, K-C; literal-F on/off. No offsets or reversals.
"""
import re,math,json
from collections import Counter
import numpy as np
from textblob.en import spelling
N=29; Q=.81; R=.5; PF=.40; POOD=.04; BEAM=8; NNULL=500; NMAX=100
LQ=math.log(Q); L1Q=math.log(1-Q); LR=math.log(R); L1R=math.log(1-R)
LF=math.log(PF); LNF=math.log(1-PF); LOOD=math.log(POOD); LU=math.log(1/N); L28=math.log(1/28)
LATIN=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"]
ALT={"V":1,"K":5,"Z":15,"ING":21,"IO":27}; TAB={**{x:i for i,x in enumerate(LATIN)},**ALT}
def e2r(s):
    out=[]
    for w in re.sub(r"[^A-Z ]","",s.upper().replace("'","")).split():
        w=w.replace("QU","CW").replace("Q","C"); i=0
        while i<len(w):
            for n in (3,2,1):
                x=w[i:i+n]
                if x in TAB: out.append(TAB[x]); i+=n; break
            else: i+=1
    return tuple(out)
def T6(c): return (24-2*c)%N
def dec(c,k,m): return (c-k)%N if m=="sub" else (k-c)%N
def comb(p,k,m): return (p+k)%N if m=="sub" else (k-p)%N
def slot(c,K,j0,prev,mode,F):
    L=len(c); KL=len(K); out=[]; stack=[(0,j0,prev,0.,(),False,0)]
    while stack:
        t,j,pv,g,path,used,ne=stack.pop()
        if t==L:
            if ne:
                ok=True
                for u in range(5,L):
                    if path[u]<0: continue
                    if path[u-5]==path[u] and c[u-5]!=c[u] and c[u-5]!=c[u-1]: ok=False; break
                    if u>=6 and path[u-5]!=path[u] and path[u-6]==path[u] and T6(c[u-6])!=c[u] and T6(c[u-6])!=c[u-1]: ok=False; break
                if not ok: continue
            out.append((g+(LR if ne else L1R),j,path,int(used),ne)); continue
        ct=c[t]
        if F and ct==0: stack.append((t+1,j,0,g,path+(0,),used,ne))
        if j<KL:
            p=dec(ct,int(K[j]),mode); stack.append((t+1,j+1,ct,g+(L1Q if ct==pv else 0.),path+(p,),used,ne))
            if ct!=pv and j+1<KL:
                p1=dec(ct,int(K[j+1]),mode)
                if comb(p1,int(K[j]),mode)==pv:
                    stack.append((t+1,j+2,ct,g+LQ,path+(p1,),used,ne))
                    if j+2<KL:
                        p2=dec(ct,int(K[j+2]),mode)
                        if comb(p2,int(K[j]),mode)==pv and comb(p2,int(K[j+1]),mode)==pv: stack.append((t+1,j+3,ct,g+2*LQ,path+(p2,),used,ne))
            if t>=5 and ct==c[t-5] and path[t-5]>=0: stack.append((t+1,j+1,ct,g,path+(path[t-5],),used,ne+1))
            elif t>=6 and ct==T6(c[t-6]) and path[t-6]>=0: stack.append((t+1,j+1,ct,g,path+(path[t-6],),used,ne+1))
        if ct!=pv and not used and L>=2: stack.append((t+1,j,ct,g+LF-math.log(L)+L28,path+(-1,),True,ne))
    res=[]
    for g,j,path,used,ne in out:
        w=tuple(x for x in path if x>=0); lw=DICT.get(w)
        if lw is not None: res.append((g+lw+(0. if used else LNF),j,path,used,ne))
    base=LOOD+L*LU
    for score,endj in ((base+LNF,j0+L),(base+LF-math.log(L)+L28,j0+L-1),(base+LNF+math.log(L*Q/N),j0+L+1)):
        if endj<=KL: res.append((score,endj,(-2,)*L,0,0))
    return res
def decode(words,K,mode="sub",F=False):
    hist=[]; states={0:(0.,None)}; prev=-1
    for c in words:
        nxt={}
        for j0,(s0,_) in states.items():
            for g,j,path,nf,ne in slot(c,K,j0,prev,mode,F):
                s=s0+g
                if j not in nxt or s>nxt[j][0]: nxt[j]=(s,(j0,path,nf,ne))
        if len(nxt)>BEAM: nxt=dict(sorted(nxt.items(),key=lambda x:-x[1][0])[:BEAM])
        hist.append(nxt); states={j:(s,None) for j,(s,_) in nxt.items()}; prev=c[-1]
    if not states: return -1e99,0,[],0,0
    end=max(states,key=lambda x:states[x][0]); score=states[end][0]; j=end; paths=[]; nf=ne=0
    for h in reversed(hist):
        _,(j0,path,a,b)=h[j]; paths.append(path); nf+=a; ne+=b; j=j0
    return score,end,[x for w in paths[::-1] for x in w],nf,ne
def translit(P): return "".join(LATIN[x] for x in P if x>=0)
def primes_upto(n):
    s=np.ones(n+1,dtype=bool); s[:2]=False
    for p in range(2,int(n**.5)+1):
        if s[p]: s[p*p::p]=False
    return np.flatnonzero(s)
P53=[[12,25,28,25,26],[1,19,13],[14,10,1,9,3,22,9],[6,23,2],[27,25,7],[23,22,18,4],[19,9,18,8,6,17,1,11],[1,2,19,18,23,21],[17,6,26,4],[18,10,1,11],[26,27,20,1],[11,22],[28,14,26,12,4],[3,13,15,5,25,19,12],[9,11],[18,0,15],[18,0,24,21],[1,21,11,12,6,0,21,4,10,2],[11,1,25],[26,15,0,18,1,15,25,26,28],[10,16,22,4,16,22,3],[6,9,8],[23,19,3,5,23,18,16],[7,14,23,20],[3,25,11],[12,1,17],[19,16],[23,19,18],[16,13,7,12,15],[7,17,12,2],[9,8,6,11],[4,27,23,27,2,24,10,12,25,14,20],[12,28],[27,24,11],[8,4],[2,13,23,11,21,3],[6,0,12,19,5],[8,23,3,16,5],[1,4],[13,9]]
P55=[[21],[25,19,10,7],[15,17],[14,19],[15,12,6,23,2,25],[0,27,24,17,5,1],[7,4],[17,28,0,14,10,19,1,5,13,8,21,20,12],[19,15,23,27,13,0],[17,8,12,5],[12,18],[28,18,10,6,14,6,15],[18,15,12,2,2,18,15],[2,22],[5,28,10,19,5,14],[23,11,1],[17,18,10]]
REGIONS={"p53_plus_p54_Ac_180":P53+[[24]],"p55_76":P55}
def main():
    global DICT
    counts=Counter()
    for w,c in spelling.items():
        x=re.sub(r"[^A-Z]","",w.upper())
        if x.isalpha():
            r=e2r(x)
            if 1<=len(r)<=20: counts[r]+=int(c)
    total=sum(counts.values()); DICT={k:math.log(v/total) for k,v in counts.items()}
    print("versions",{"numpy":np.__version__,"dictionary_sequences":len(DICT)})
    ps=primes_upto(1619)[:256]; missing=ps[20:200]; visible=np.r_[ps[:20],ps[200:256]]
    assert len(missing)==180 and (missing[0],missing[-1])==(73,1223) and len(visible)==76
    keys={"p53_plus_p54_Ac_180":missing,"p55_76":visible}
    rng=np.random.default_rng(2013); null={}
    for name,words in REGIONS.items():
        for F in (False,True):
            n=len(keys[name]); s=np.array([decode(words,rng.integers(0,29,n),F=F)[0] for _ in range(NNULL)])
            null[(name,F)]=s
            print("null",name,F,{"mean":float(s.mean()),"sd":float(s.std()),"max":float(s.max())})
    cand=[]
    for name,words in REGIONS.items():
        v=keys[name]
        for kn,k0 in (("prime_mod29",v%29),("totient_mod29",(v-1)%29)):
            for sign in ("sub","add","beaufort"):
                K=np.asarray(k0,dtype=int) if sign!="add" else (-np.asarray(k0,dtype=int))%29
                mode="beaufort" if sign=="beaufort" else "sub"
                for F in (False,True):
                    s,j,P,nf,ne=decode(words,K,mode,F); n=null[(name,F)]; z=(s-n.mean())/n.std()
                    cand.append({"region":name,"key":kn,"sign":sign,"F":F,"score":float(s),"z":float(z),
                        "p_single":float((np.sum(n>=s)+1)/(NNULL+1)),"above_null_max":bool(s>n.max()),
                        "key_used":int(j),"key_length":len(K),"fillers":int(nf),"echoes":int(ne),
                        "known":int(sum(x>=0 for x in P)),"ood":int(sum(x==-2 for x in P)),"text":translit(P)[:160]})
    cand.sort(key=lambda x:-x["z"]); print("candidates",json.dumps(cand,indent=2))
    fr=np.random.default_rng(2015); maxz=[]
    for _ in range(NMAX):
        mz=-1e99
        for name,words in REGIONS.items():
            nkey=len(keys[name]); base=fr.integers(0,29,nkey)
            for k0 in (base,(base-1)%29):
                for sign in ("sub","add","beaufort"):
                    K=k0 if sign!="add" else (-k0)%29; mode="beaufort" if sign=="beaufort" else "sub"
                    for F in (False,True):
                        s=decode(words,K,mode,F)[0]; n=null[(name,F)]; z=(s-n.mean())/n.std(); mz=max(mz,z)
        maxz.append(mz)
    observed=max(x["z"] for x in cand); maxz=np.asarray(maxz)
    print("familywise",json.dumps({"observed_max_z":float(observed),"replicates":NMAX,
        "null_mean":float(maxz.mean()),"null_sd":float(maxz.std()),"null_max":float(maxz.max()),
        "quantiles":np.quantile(maxz,[.5,.9,.95,.99]).tolist(),
        "empirical_p":float((np.sum(maxz>=observed)+1)/(NMAX+1))},indent=2))
if __name__=="__main__": main()

import json,sys,time,hashlib,re
from pathlib import Path
import numpy as np
Q=8; SPLIT=232; TOTAL=308; CAP=20000; TOP=24; STARTS=12; SWEEPS=10
ROWS=np.array([(a,b) for a in range(1,29) for b in range(29)])
INV=np.array([[(pow(int(a),-1,29)*(c-b))%29 for c in range(29)] for a,b in ROWS],dtype=np.int16)
ALL=(1<<812)-1
VALID=np.stack([(INV!=0)&(INV!=12)&(INV!=22),(INV==10)|(INV==24)])
MASK=[[sum(1<<j for j in np.flatnonzero(VALID[s,:,c]).tolist()) for c in range(29)] for s in range(2)]
def ids(m):
    out=[]
    while m:
        b=m&-m;out.append(b.bit_length()-1);m^=b
    return np.array(out,dtype=np.int16)
def parse(raw,runes,original):
    w=re.split(r'[-.&$§]',raw) if original else re.findall(r'[ᚠ-᛿]+',raw)
    C=[];ss=[]; index={x:i for i,x in enumerate(runes)}
    for word in w:
        r=[index[c] for c in word if c in index]
        if len(r)==1:ss.append(len(C))
        C.extend(r)
    return np.array(C,dtype=np.int16),set(ss)
def fromrepo(root):
    base=Path(root);cp=json.loads((base/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))
    C,ss=parse((base/'resources/liber-primus/lp2-transcription.txt').read_text(encoding='utf8'),cp['runes'],True)
    assert C.tolist()==[x for p in cp['pages'] for x in p['indices']]
    native=json.loads((base/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf8'))
    data=[(s['name'],*parse(s['source_text'],cp['runes'],False)) for s in native['sections']]
    off=sum(p['runic_count'] for p in cp['pages'][:54]);return C[off:off+TOTAL],{x-off for x in ss if off<=x<off+TOTAL},data
def fixture(path):
    f=json.loads(Path(path).read_text());decode=lambda x:np.array([int(c,29) for c in x],dtype=np.int16)
    return decode(f['original']),set(f['ss']),[(s['name'],decode(s['text']),set(s['ss'])) for s in f['native']]
def model(data,exclude):
    un=np.zeros(29);bi=np.zeros((29,29));tri=np.zeros((29,29,29))
    for name,p,_ in data:
        if name==exclude:continue
        np.add.at(un,p,1);np.add.at(bi,(p[:-1],p[1:]),1);np.add.at(tri,(p[:-2],p[1:-1],p[2:]),1)
    u=(un+1)/(un.sum()+29);b=(bi+8*u[None,:])/(un[:,None]+8)
    t=(tri+6*b[None,:,:])/(bi[:,:,None]+6)
    return np.log(u),np.log(b),np.log(t)
def schedules(C,ss,q,cap=CAP):
    runs=[[]];z=[]
    for i,c in enumerate(C):
        if c==0:z.append((i,i in ss));runs.append([])
        else:runs[-1].append((i,MASK[int(i in ss)][c]))
    mm=[]
    for run in runs:
        rr=[]
        for p in range(q):
            d=[ALL]*q
            for i,(_,m) in enumerate(run):d[(p+i)%q]&=m
            rr.append(d)
        mm.append(rr)
    leaves=[];nodes=0;capped=False;slots=np.full(len(C),-1,dtype=np.int16)
    def go(t,p,D):
        nonlocal nodes,capped
        nodes+=1
        if len(leaves)>=cap or nodes>3_000_000:capped=True;return
        e=[a&b for a,b in zip(D,mm[t][p])]
        if not all(e):return
        for j,(i,_) in enumerate(runs[t]):slots[i]=(p+j)%q
        p=(p+len(runs[t]))%q
        if t==len(z):leaves.append((slots.copy(),tuple(e),p));return
        i,s=z[t]
        if not s:
            slots[i]=-1;go(t+1,p,e)
        if capped:return
        x=e[p]&MASK[int(s)][0]
        if x:
            e[p]=x;slots[i]=p;go(t+1,(p+1)%q,e)
    go(0,0,[ALL]*q)
    return leaves,nodes,capped
def score(P,M):
    u,b,t=M
    return float(u[P[0]]+b[P[0],P[1]]+t[P[:-2],P[1:-1],P[2:]].sum())
def fit(C,ss,M,seed,q=Q):
    rng=np.random.default_rng(seed);u,b,t=M;leaves,nodes,capped=schedules(C,ss,q)
    ranked=[]
    for k,(slots,D,phase) in enumerate(leaves):
        pos=[np.flatnonzero(slots==p) for p in range(q)];opt=[ids(d) for d in D];vals=[INV[o[:,None],C[ix][None,:]] for o,ix in zip(opt,pos)]
        uni=[u[v].sum(axis=1) for v in vals];upper=sum(float(v.max()) for v in uni)+float(u[0])*(slots<0).sum()
        ranked.append((upper,k))
    ranked.sort(reverse=True);best=None
    for _,k in ranked[:TOP]:
        slots,D,phase=leaves[k];pos=[np.flatnonzero(slots==p) for p in range(q)];opt=[ids(d) for d in D];vals=[INV[o[:,None],C[ix][None,:]] for o,ix in zip(opt,pos)]
        uni=[u[v].sum(axis=1) for v in vals]
        affected=[np.unique(np.concatenate([ix,ix+1,ix+2])) for ix in pos]
        affected=[ix[(ix>=2)&(ix<len(C))] for ix in affected]
        idxmaps=[]
        for p in range(q):
            ix=affected[p];loc=np.full(len(C),-1,dtype=int);loc[pos[p]]=np.arange(len(pos[p]));idxmaps.append([loc[ix-d] for d in [2,1,0]])
        for start in range(STARTS):
            P=np.zeros(len(C),dtype=np.int16);key=np.array([np.argmax(v) if start==0 else rng.integers(len(v)) for v in uni],dtype=int)
            for p in range(q):P[pos[p]]=vals[p][key[p]]
            for sweep in range(SWEEPS):
                changed=False
                for p in rng.permutation(q):
                    ix=affected[p];V=vals[p];args=[]
                    for d,l in zip([2,1,0],idxmaps[p]):
                        B=np.broadcast_to(P[ix-d],(len(V),len(ix))).copy();mask=l>=0;B[:,mask]=V[:,l[mask]];args.append(B)
                    S=t[tuple(args)].sum(axis=1)
                    if len(pos[p]) and pos[p][0]==0:S+=u[V[:,0]]
                    if slots[0]==p or slots[1]==p:
                        a=V[:,np.where(pos[p]==0)[0][0]] if slots[0]==p else P[0]
                        c=V[:,np.where(pos[p]==1)[0][0]] if slots[1]==p else P[1]
                        S+=b[a,c]
                    kbest=int(np.argmax(S))
                    if kbest!=key[p]:changed=True;key[p]=kbest;P[pos[p]]=V[kbest]
                if not changed:break
            v=score(P,M)
            if best is None or v>best['score']:
                best=dict(score=v,key=np.array([opt[p][key[p]] for p in range(q)]),P=P.copy(),phase=phase,slots=slots.copy())
    return best,dict(schedules=len(leaves),nodes=nodes,capped=capped,ranked=min(TOP,len(leaves)))
def enc(P,key,q=Q):
    out=[];j=0
    for p in P:
        if p==0:out.append(0);continue
        a,b=ROWS[key[j]];out.append((a*p+b)%29);j=(j+1)%q
    return np.array(out,dtype=np.int16)
def extend(C,ss,M,fit,q=Q):
    _,_,t=M;P=list(fit['P']);key=fit['key'];n=len(P);best=None
    def go(i,j,v):
        nonlocal best
        if i==len(C):
            if best is None or v>best[0]:best=(v,np.array(P[n:],dtype=np.int16));return
            return
        c=C[i];s=i in ss
        if c==0 and not s:
            P.append(0);go(i+1,j,v+t[P[-3],P[-2],0]);P.pop()
        p=INV[key[j],c]
        if VALID[int(s),key[j],c]:
            P.append(p);go(i+1,(j+1)%q,v+t[P[-3],P[-2],p]);P.pop()
    go(0,fit['phase'],0.0);return best
def main():
    C,ss,data=fixture(sys.argv[1]) if sys.argv[1].endswith('.json') else fromrepo(sys.argv[1]);assert len(C)==308 and sum(len(p) for _,p,_ in data)==2979 and ss=={0,122}
    print('data',hashlib.sha256(bytes(C.tolist())).hexdigest(),flush=True)
    eligible=[(name,p,s) for name,p,s in data if len(p)>=TOTAL and all(x in [10,24] for x in p[list(s)])]
    for k,(name,P,S) in enumerate(eligible[:3]):
        P=P[:TOTAL];key=np.random.default_rng(123456+7919*k).integers(812,size=Q);cc=enc(P,key);M=model(data,name);start=time.monotonic();fit_,d=fit(cc[:SPLIT],{i for i in S if i<SPLIT},M,9895+k)
        x=extend(cc[SPLIT:],{i-SPLIT for i in S if SPLIT<=i<TOTAL},M,fit_) if fit_ else None
        if fit_:
            assert np.array_equal(enc(fit_['P'],fit_['key']),cc[:SPLIT])
            if x:assert np.array_equal(enc(np.concatenate([fit_['P'],x[1]]),fit_['key']),cc)
        print(json.dumps(dict(name=name,**d,zeros=int((cc[:SPLIT]==0).sum()),key_exact=int((fit_['key']==key).sum()) if fit_ else 0,prefix_exact=int((fit_['P']==P[:SPLIT]).sum()) if fit_ else 0,prefix_score=fit_['score']/SPLIT if fit_ else None,suffix_exact=int((x[1]==P[SPLIT:]).sum()) if x else None,suffix_score=x[0]/(TOTAL-SPLIT) if x else None,seconds=time.monotonic()-start)),flush=True)
    if '--original' in sys.argv:
        M=model(data,None);f,d=fit(C[:SPLIT],{i for i in ss if i<SPLIT},M,7729);x=extend(C[SPLIT:],{i-SPLIT for i in ss if SPLIT<=i<TOTAL},M,f) if f else None
        if f:
            assert np.array_equal(enc(f['P'],f['key']),C[:SPLIT]);
            if x:assert np.array_equal(enc(np.concatenate([f['P'],x[1]]),f['key']),C)
        print(json.dumps(dict(original=True,**d,key=ROWS[f['key']].tolist() if f else None,prefix_score=f['score']/SPLIT if f else None,prefix=f['P'].tolist() if f else None,suffix_score=x[0]/(TOTAL-SPLIT) if x else None,suffix=x[1].tolist() if x else None)),flush=True)
if __name__=='__main__':main()

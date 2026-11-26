"""Exact arbitrary-alphabet Fibonacci/F-hold chapter gate. Python 3 + z3-solver.
Run from repository root: python sims/lp2_p15_fibonacci_secret_alphabet_fhold_sat.py
Optional --prepare DIR exports the exact inputs for the companion C++ graph gate.
Optional --cmu adds cmudict==1.1.3 to the dictionary export.
Optional --singletons runs the more expensive (previously timed-out) SAT branch.
The SAT model does not score or recover authentic plaintext.
"""
import argparse
import json
import random
import time
from collections import defaultdict
from itertools import combinations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SINGLE = [135,180,278,403,539,545,573,614,630,755,871,1030,1096,1148,1191,1650,1716,1733]
DIGITS = "0123456789abcdefghijklmnopqrs"
R = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA']
RI = {s:i for i,s in enumerate(R)}

def key(a,b):
    k=[a,b]
    for _ in range(14): k.append((k[-1]+k[-2])%29)
    assert k[14:]==k[:2]
    return k[:14]

def canon(k):
    d={0:0}; out=[]
    for v in k:
        if v not in d: d[v]=len(d)
        out.append(d[v])
    return tuple(out)

def patterns():
    D={}
    for a,b in [(1,b) for b in range(29)]+[(0,1)]:
        k=key(a,b); p,r=min((canon(k[i:]+k[:i]),i) for i in range(14))
        if p not in D: D[p]={'actual':k[r:]+k[:r],'seeds':[]}
        D[p]['seeds'].append((a,b))
    assert sorted(len(x['seeds']) for x in D.values())==[1,1,14,14]
    union=set()
    for m in D.values():
        k=m['actual']; o={(k[i]*a%29,k[(i+1)%14]*a%29) for i in range(14) for a in range(1,29)}
        assert len(o)==28*len(m['seeds']) and all(s in o for s in m['seeds'])
        assert not (union&o); union|=o
    assert len(union)==840
    return D

class CNF:
    def __init__(self): self.names=[]; self.cl=[]
    def var(self,s): self.names.append(s); return len(self.names)
    def add(self,*xs): self.cl.append(tuple(xs))
    def one(self,xs):
        self.add(*xs)
        for x,y in combinations(xs,2): self.add(-x,-y)

def solve(b,timeout):
    import z3
    v=[None]+[z3.Bool(n) for n in b.names]
    def lit(x): return v[x] if x>0 else z3.Not(v[-x])
    s=z3.Tactic('sat').solver(); s.set(timeout=timeout)
    s.add(*[z3.Or(*map(lit,c)) for c in b.cl])
    start=time.monotonic(); st=s.check(); elapsed=time.monotonic()-start
    out={'status':str(st),'seconds':elapsed,'vars':len(b.names),'clauses':len(b.cl)}
    if st==z3.sat:
        m=s.model();out['true']={i for i in range(1,len(v)) if z3.is_true(m.eval(v[i],model_completion=True))}
    elif st==z3.unknown:out['reason']=s.reason_unknown()
    return out

def segment(C):
    segs=[[]];loc=[]
    for c in C:
        loc.append((len(segs)-1,len(segs[-1]),c))
        if c==0:segs.append([])
        else:segs[-1].append(c)
    return segs,loc

def encode(C,pattern):
    segs,_=segment(C);q=len(pattern);classes=sorted(set(pattern)-{0});b=CNF()
    m={k:[None]+[b.var(f'm{k}_{j}') for j in range(1,29)] for k in classes}
    p=[[b.var(f'p{s}_{i}') for i in range(q)] for s in range(len(segs))]
    for k in classes:b.one(m[k][1:])
    for j in range(1,29):
        for a,c in combinations(classes,2):b.add(-m[a][j],-m[c][j])
    for row in p:b.one(row)
    for s,seg in enumerate(segs):
        for t in range(q):
            for k,c in {(pattern[(t+i)%q],c) for i,c in enumerate(seg)}:
                if k:b.add(-p[s][t],-m[k][c])
            if s+1<len(segs):
                u=(t+len(seg))%q;nxt=[p[s+1][u]]
                if pattern[u]:nxt.append(p[s+1][(u+1)%q])
                b.add(-p[s][t],*nxt)
    return b,m,p

def singleton_encode(C,k,common):
    b=CNF();q=len(k);segs,loc=segment(C)
    B={c:[None]+[b.var(f'b{c}_{v}') for v in range(1,29)] for c in range(1,29)}
    A=B if common else {c:[None]+[b.var(f'a{c}_{v}') for v in range(1,29)] for c in [3,10,24]}
    for X in [B] if common else [B,A]:
        for row in X.values():b.one(row[1:])
        for v in range(1,29):
            for a,c in combinations(X,2):b.add(-X[a][v],-X[c][v])
    P=[[b.var(f'p{s}_{t}') for t in range(q)] for s in range(len(segs))]
    for row in P:b.one(row)
    zsing={loc[i][0] for i in SINGLE if C[i]==0}
    for s,seg in enumerate(segs):
        for t in range(q):
            for v,c in {(k[(t+i)%q],c) for i,c in enumerate(seg)}:
                if v:b.add(-P[s][t],-B[c][v])
            if s+1<len(segs):
                u=(t+len(seg))%q;nxt=[] if s in zsing else [P[s+1][u]]
                if k[u]:nxt.append(P[s+1][(u+1)%q])
                b.add(-P[s][t],*nxt)
    for i in SINGLE:
        s,j,c=loc[i]
        for t in range(q):
            v=k[(t+j)%q]
            if c==0:
                if v:b.add(-P[s][t],*(A[a][(-v)%29] for a in [3,10,24]))
                else:b.add(-P[s][t])
            else:
                for w in range(1,29):
                    x=(w-v)%29
                    if x:b.add(-P[s][t],-B[c][w],*(A[a][x] for a in [3,10,24]))
                    else:b.add(-P[s][t],-B[c][w])
    return b,A,B,P

def complete(beta):
    free=iter(sorted(set(range(29))-set(v for v in beta if v is not None)))
    return [next(free) if v is None else v for v in beta]

def encrypt(P,k,phase,alpha,beta):
    rev=[beta.index(i) for i in range(29)]; C=[];ts=[]
    for p in P:
        ts.append(phase)
        if not p:C.append(0);continue
        C.append(rev[(alpha[p]+k[phase])%29]);phase=(phase+1)%len(k)
    return C,ts

def witness(C,k,phase,alpha,beta):
    P=[];holds=[];s=0;t=phase[0];rev=[alpha.index(i) for i in range(29)]
    for i,c in enumerate(C):
        if c==0:
            s+=1
            if phase[s]==t:P.append(0);holds.append(i);continue
        p=rev[(beta[c]-k[t])%29];assert p;P.append(p);t=(t+1)%len(k)
        if c==0:assert phase[s]==t
    assert encrypt(P,k,phase[0],alpha,beta)[0]==C
    return {'phase':phase[0],'holds':len(holds),'alpha':alpha,'beta':beta,
      'key_seed':[k[phase[0]],k[(phase[0]+1)%len(k)]],'replay':True,
      'P_ioc':sum(P.count(i)*(P.count(i)-1) for i in range(29))/(len(P)*(len(P)-1))},P

def sat_case(C,pattern,meta,timeout):
    b,m,p=encode(C,pattern);r=solve(b,timeout)
    if r['status']=='sat':
        S=r.pop('true');beta=[None]*29;beta[0]=0
        for k,row in m.items():beta[next(j for j in range(1,29) if row[j] in S)]=meta['actual'][pattern.index(k)]
        beta=complete(beta);phase=[next(t for t,x in enumerate(row) if x in S) for row in p]
        r['witness'],_=witness(C,meta['actual'],phase,beta,beta)
    return dict(r,pattern=pattern,seed_count=28*len(meta['seeds']),length=len(C),F=C.count(0))

def rune(w):
    w=w.upper().replace('QU','CW').translate(str.maketrans('VKQZ','UCCS'));out=[];i=0
    while i<len(w):
        x=w[i:i+2]
        if x not in RI:x=w[i]
        if x not in RI:return None
        out.append(RI[x]);i+=len(x)
    return tuple(out)

def lexicon(cmu=False):
    words=[l.split()[0] for l in (ROOT/'resources/control/english_wordfreq_textblob.txt').read_text(encoding='utf-8').splitlines() if l.strip() and not l.startswith(';')]
    if cmu:
        import cmudict
        words+=cmudict.words()
    D=defaultdict(set)
    for w in words:
        p=rune(w)
        if p and 8<=len(p)<=13 and 0 not in p:D[len(p)].add(p)
    return {l:sorted(s) for l,s in D.items()}

def local(C,P,K,common=True):
    adj=defaultdict(list)
    for c,p,k in zip(C,P,K):
        a=p if common else p+29
        adj[a].append((c,k));adj[c].append((a,-k))
    vis={}
    for x in adj:
        if x in vis:continue
        vis[x]=0;stack=[x];a=set();b=set()
        while stack:
            v=stack.pop();val=vis[v];s=b if common or v<29 else a
            if val in s:return False
            s.add(val)
            for z,d in adj[v]:
                t=(val+d)%29
                if z in vis:
                    if vis[z]!=t:return False
                else:vis[z]=t;stack.append(z)
    return True

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--prepare',type=Path);ap.add_argument('--cmu',action='store_true');ap.add_argument('--singletons',action='store_true');ap.add_argument('--timeout',type=int,default=120000);args=ap.parse_args()
    corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    pages=[p['indices'] for p in corpus['pages'] if 15<=p['page']<=22];C=sum(pages,[])
    assert len(C)==1903 and C.count(0)==72
    assert len(set(C[i] for i in SINGLE))==12
    D=lexicon(args.cmu)
    print('dictionary', {l:len(v) for l,v in D.items()})
    if args.prepare:
        args.prepare.mkdir(parents=True,exist_ok=True)
        (args.prepare/'fib_source.txt').write_text('\n'.join(''.join(DIGITS[i] for i in p) for p in pages)+'\n')
        (args.prepare/'fib_lexicon.txt').write_text('\n'.join(''.join(DIGITS[i] for i in w) for l in sorted(D) for w in D[l])+'\n')
        return
    native=next(p['indices'] for p in corpus['pages'] if p['page']==57);rng=random.Random(26112610)
    for pat,meta in patterns().items():
        k=meta['actual'];P=[native[i%len(native)] for i in range(len(C))]
        w1=rng.choice(D[13]);w2=rng.choice(D[12]);P[159:172]=w1;P[1844:1856]=w2
        for tries in range(10000):
            beta=[0]+rng.sample(range(1,29),28);t=rng.randrange(14)
            E,ts=encrypt(P,k,t,beta,beta)
            if 0 not in E[159:172]+E[1844:1856]:break
        else:raise RuntimeError('plant generation failed')
        r=sat_case(E,pat,meta,args.timeout);assert r['status']=='sat'
        assert local(E[159:172]+E[1844:1856],w1+w2,[k[(ts[159]+j)%14] for j in range(13)]+[k[(ts[1844]+j)%14] for j in range(12)])
        print(json.dumps({'control':r,'word1':w1,'word2':w2,'phases':[ts[159],ts[1844]],'tries':tries+1}),flush=True)
        r=sat_case(C,pat,meta,args.timeout);print(json.dumps({'original':r}),flush=True)
        if args.singletons and r['status']=='sat':
            for common in [True,False]:
                b,A,B,P=singleton_encode(C,k,common);s=solve(b,args.timeout)
                if s['status']=='sat':
                    S=s.pop('true');beta=[0]+[next(v for v in range(1,29) if B[c][v] in S) for c in range(1,29)]
                    alpha=beta[:]
                    if not common:
                        alpha=[None]*29;alpha[0]=0
                        for c in [3,10,24]:alpha[c]=next(v for v in range(1,29) if A[c][v] in S)
                        alpha=complete(alpha)
                    phase=[next(t for t,x in enumerate(row) if x in S) for row in P]
                    s['witness'],p=witness(C,k,phase,alpha,beta)
                    assert all(p[i] in [3,10,24] for i in SINGLE)
                print(json.dumps({'singleton':s,'common':common,'pattern':pat}),flush=True)
if __name__=='__main__':main()

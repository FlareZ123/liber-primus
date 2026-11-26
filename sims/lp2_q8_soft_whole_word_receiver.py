"""Differentiable whole-word likelihood relaxation. Synthetic control only."""
import argparse, json, math, time
from pathlib import Path
from collections import defaultdict
import numpy as np
import torch
from scipy.optimize import linear_sum_assignment
A='0123456789abcdefghijklmnopqrs'; LABELS='F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()
L=[8,3,6,2,5,3,2,3,5,7,3,4,10,8,3,5,8,4,3,4,5,4,3,5,1,3,5,5,3,4,2,6,5,3,8,5,4,8,2,3,4,6,6,3,2,10,2]; H=[11,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]; FIX={0:1,3:0,4:2}; EPS=2/47

def dictionary(path):
    words=set()
    for l in Path(path).read_text().splitlines():
        p=l.split()
        if len(p)!=2 or not p[0].isascii() or not p[0].isalpha() or not p[0].islower() or not p[1].isdigit():continue
        s=p[0].upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S')
        def go(i,w):
            if i==len(s):words.add(w);return
            for j,t in enumerate(LABELS):
                if s.startswith(t,i):go(i+len(t),w+A[j])
            if s.startswith('ING',i):go(i+3,w+A[21])
        go(0,'')
    by=defaultdict(list)
    for w in sorted(words):by[len(w)].append([A.index(c) for c in w])
    assert len(words)==38910,len(words)
    return words,{n:np.array(v,dtype=np.int64) for n,v in by.items()}

def rng(seed):
    x=seed&0xffffffff
    def rand(n):
        nonlocal x
        x^=(x<<13)&0xffffffff;x^=x>>17;x^=(x<<5)&0xffffffff;return x%n
    return rand

def enc(p,m,j):
    c=[]
    for x in p:
        if not x:c.append(0)
        else:c.append(int(m[j,x]));j=(j+1)%8
    return c

def maps(pi,k):return np.argsort(pi)[(np.asarray(pi)[None,:]+np.asarray(k)[:,None])%29]

def plant(seed,words,by,null):
    r=rng(seed);p=[by[n][r(len(by[n]))].tolist() for n in L];o=sorted(range(47),key=lambda j:(-L[j],j))
    for j in [o[0],o[-8]]:
        while True:
            w=[r(29) for _ in range(L[j])]
            if ''.join(A[x] for x in w) not in words:break
        p[j]=w
    while True:
        carry=[r(29) for _ in range(11)]
        if not (by[11][:,:10]==carry[:10]).all(1).any():break
    h=[carry]+[by[n][r(len(by[n]))].tolist() for n in H[1:]];pi=list(range(29))
    for i in range(28,1,-1):
        j=1+r(i);pi[i],pi[j]=pi[j],pi[i]
    k=[r(29) for _ in range(8)]
    for j,v in FIX.items():k[j]=v
    m=maps(pi,k);c=[enc(w,m,r(8)) for w in p];hc=[enc(w,m,r(8)) for w in h]
    if null:
        c=[]
        for w in p:
            g=np.random.default_rng(r(2**32));pp=np.r_[0,g.permutation(np.arange(1,29))];kk=g.integers(0,29,8);c.append(enc(w,maps(pp,kk),r(8)))
    return p,h,c,hc,m

class Score:
    def __init__(self,C,by):
        self.batches=[];self.cl=[];self.N=len(C);self.base=torch.tensor([29.**-len(c) for c in C])
        for n in sorted(set(map(len,C))):
            ids=[i for i,w in enumerate(C) if len(w)==n];W=by[n];off=np.cumsum(W!=0,1)-(W!=0);es=[];gs=[]
            self.cl.append((torch.tensor(ids),torch.tensor([C[i] for i in ids])))
            for i in ids:
                c=np.array(C[i]);good=((W!=0)|(c==0)).all(1)
                for j in range(8):
                    ph=(off+j)%8;keep=good&((W==0)|(ph!=3)|(W==c)).all(1)&((W==0)|((ph!=0)&(ph!=4))|(W!=c)).all(1)
                    e=ph[keep]*841+W[keep]*29+c[None,:];es.append(np.where(W[keep]==0,8*841,e));gs.append(np.full(len(e),i,dtype=np.int64))
            if sum(map(len,es)):self.batches.append((torch.from_numpy(np.concatenate(es)),torch.from_numpy(np.concatenate(gs)),len(W)))
    def __call__(self,T):
        f=torch.cat([T.reshape(-1),torch.ones(1)]).clamp_min(1e-30).log();lex=torch.zeros(self.N);u=torch.zeros_like(lex)
        for E,g,n in self.batches:lex=lex.scatter_add(0,g,f[E].sum(1).exp()/(8*n))
        U=T[:,1:,:].sum(1)/29
        for ids,seq in self.cl:
            s=torch.full((len(ids),8),1/8)
            for c in seq.T:s=torch.roll(s*U[:,c].T,1,1)+s*(c[:,None]==0)/29
            u=u.scatter_add(0,ids,s.sum(1))
        return torch.log(((1-EPS)*lex+EPS*u).clamp_min(1e-100)/self.base).sum()

def soft(a,b,t):
    lp=a/t
    for _ in range(7):lp=lp-torch.logsumexp(lp,0,keepdim=True);lp=lp-torch.logsumexp(lp,1,keepdim=True)
    P=torch.nn.functional.pad(lp.exp(),(1,0,1,0));P=P+torch.nn.functional.pad(torch.ones((1,1)),(0,28,0,28))
    K=(b/t).softmax(1);rows=[];j0=0
    for j in range(8):
        if j in FIX:rows.append(torch.nn.functional.one_hot(torch.tensor(FIX[j]),29).to(P.dtype))
        else:rows.append(K[j0]);j0+=1
    K=torch.stack(rows);d=(torch.arange(29)[None,:]-torch.arange(29)[:,None])%29;eye=torch.eye(29)
    T=(P@(K[:,d]*(d!=0))@P.T)*(1-eye);T=T/T.sum(2,keepdim=True).clamp_min(1e-30)*(1-K[:,0,None,None])+K[:,0,None,None]*eye
    return T,P,K

def hard(P,K):
    r,c=linear_sum_assignment(-P.detach().numpy()[1:,1:]);pi=np.zeros(29,dtype=int);pi[r+1]=c+1;return pi,K.detach().numpy().argmax(1)
def et(M):return torch.nn.functional.one_hot(torch.tensor(M),29).to(torch.float64)
def equivalent(M,N):return any(np.array_equal(M,np.roll(N,s,axis=0)) for s in range(8))
def matches(P,C,M):return sum(any(enc(p,M,j)==c for j in range(8)) for p,c in zip(P,C))

def main(args):
    torch.set_num_threads(args.threads);torch.set_default_dtype(torch.float64)
    words,by=dictionary(args.dict);p,h,c,hc,m=plant(args.seed,words,by,args.null);f=Score(c,by);truth=float(f(et(m)))
    print(json.dumps({'seed':args.seed,'null':args.null,'paths':sum(len(e) for e,_,_ in f.batches),'oracleScore':truth}),flush=True);best=None;start=time.time()
    for trial in range(args.restarts):
        torch.manual_seed(args.seed+1009*trial);a=torch.nn.Parameter(torch.randn(28,28)*.25);b=torch.nn.Parameter(torch.randn(5,29)*.25);o=torch.optim.Adam([a,b],lr=.08)
        for step in range(args.steps):
            t=math.exp(math.log(.18)*step/max(1,args.steps-1));T,P,K=soft(a,b,t);s=f(T);o.zero_grad();(-s).backward();o.step()
            if step%20==0 or step==args.steps-1:
                with torch.no_grad():
                    hp,hk=hard(P,K);hm=maps(hp,hk);v=float(f(et(hm)))
                    if best is None or v>best['score']:best={'score':v,'trial':trial,'step':step,'pi':hp.tolist(),'key':hk.tolist(),'exact':equivalent(hm,m),'fitTruth':matches(p,c,hm),'heldTruth':matches(h,hc,hm)}
                if step%100==0 or step==args.steps-1:print(json.dumps({'trial':trial,'step':step,'softScore':float(s.detach()),'best':best,'seconds':time.time()-start}),flush=True)
        if best['exact'] and not args.null:break
    print(json.dumps({'final':best,'oracleScore':truth,'seconds':time.time()-start,'seed':args.seed,'null':args.null}),flush=True)
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--dict',default='resources/control/english_wordfreq_textblob.txt');p.add_argument('--seed',type=int,default=1781047296);p.add_argument('--steps',type=int,default=400);p.add_argument('--restarts',type=int,default=3);p.add_argument('--threads',type=int,default=4);p.add_argument('--null',action='store_true');main(p.parse_args())

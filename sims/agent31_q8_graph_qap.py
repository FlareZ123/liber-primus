"""Conditional histogram graph inversion; requires NumPy and SciPy."""
import json,sys
from pathlib import Path
import numpy as np
from scipy.optimize import linear_sum_assignment
N=29
D=(np.arange(N)[:,None]-np.arange(N)[None,:])%N
DEFAULT="im-results/lp2-q8-marginal-channel-all-row-support-output.json"

def adjacency(rows):
    a=np.zeros((N,N),float)
    for i,row in enumerate(rows):a[i,row]=1
    return a

def centre(a):return a-a.mean(axis=0)[None,:]-a.mean(axis=1)[:,None]+a.mean()

def layers(a):
    b=centre(a);ms=[b,b@b,b@b.T,b.T@b]
    return [m/np.linalg.norm(m) for m in ms]

def indices(seeds):
    return np.array([i for i in range(N) if i not in seeds]),np.array([j for j in range(N) if j not in seeds.values()])

def assign(g,seeds):
    ii,jj=indices(seeds);q=np.zeros((N,N));r,c=linear_sum_assignment(g[np.ix_(ii,jj)],maximize=True);q[ii[r],jj[c]]=1
    for i,j in seeds.items():q[i,j]=1
    return q

def init(rng,seeds,mode):
    ii,jj=indices(seeds);n=len(ii);q=np.zeros((N,N));p=np.full((n,n),1/n)
    if mode:
        z=rng.exponential(size=(n,n))
        for _ in range(50):
            z/=z.sum(axis=0)[None,:];z/=z.sum(axis=1)[:,None]
        p=(p+z)/2
    q[np.ix_(ii,jj)]=p
    for i,j in seeds.items():q[i,j]=1
    return q

def faq_multi(aa,bb,p0,seeds,steps=60):
    p=p0.copy()
    def objective(x):return sum(np.sum(a*(x@b@x.T)) for a,b in zip(aa,bb))
    for _ in range(steps):
        g=sum(a@p@b.T+a.T@p@b for a,b in zip(aa,bb));q=assign(g,seeds);d=q-p
        beta=float(np.sum(g*d));alpha=objective(d)
        t=float(np.clip(-beta/(2*alpha),0,1)) if alpha<0 else float(beta+alpha>0)
        if t*np.linalg.norm(d)<1e-6:break
        p+=t*d
    return assign(p,seeds).argmax(axis=1)

def val(a,b,p):return int(np.sum(a*b[np.ix_(p,p)]))

def improve(p,score):
    p=p.copy();best=score(p)
    while True:
        move=None;z=best
        for i in range(1,N):
            for j in range(i+1,N):
                p[i],p[j]=p[j],p[i];s=score(p);p[i],p[j]=p[j],p[i]
                if s>z:z=s;move=(i,j)
        if move is None:return p,best
        i,j=move;p[i],p[j]=p[j],p[i];best=z

def local(a,b,p):return improve(p,lambda x:val(a,b,x))

def matrices(raw,name):
    truth=np.argsort(raw['ord'])
    b=np.array([[int((i-j)%N in raw['key']) for j in range(N)] for i in range(N)],float)
    a=adjacency(raw[name]['bestRows'] if isinstance(raw[name],dict) else raw[name])
    return a,b,truth

def run(raw,restarts=24):
    out={}
    for name in ('oracle','independent'):
        a,b,truth=matrices(raw,name);al=layers(a);bl=layers(b);rng=np.random.default_rng(330131)
        assert val(a,b,truth)==(171 if name=='oracle' else 145)
        result=[]
        for ids in ((0,),(0,1),(0,2,3),(0,1,2,3)):
            best=-1;bestp=None;exact=0;scores=[]
            for t in range(restarts):
                seeds={0:0};p=faq_multi([al[i] for i in ids],[bl[i] for i in ids],init(rng,seeds,t>0),seeds)
                p,s=local(a,b,p);scores.append(s);exact+=int(np.array_equal(p,truth))
                if s>best:best=s;bestp=p.copy()
            result.append({'layers':list(ids),'best':best,'best_pi':bestp.tolist(),'exact':exact,'restarts':restarts,'scores':scores})
        out[name]={'truth':val(a,b,truth),'results':result}
    return out

def seeded(raw):
    out={}
    for name in ('oracle','independent'):
        a,b,truth=matrices(raw,name);al=layers(a);bl=layers(b);rng=np.random.default_rng(3301312)
        vertex=int(np.argmax(a.sum(axis=0)[1:]))+1
        best=-1;bestp=None;exact=0;records=[]
        for rank in range(1,29):
            for ids in ((0,),(0,1)):
                for t in range(3):
                    seeds={0:0,vertex:rank};p=faq_multi([al[i] for i in ids],[bl[i] for i in ids],init(rng,seeds,t>0),seeds)
                    p,s=local(a,b,p);eq=bool(np.array_equal(p,truth));exact+=eq;records.append([rank,list(ids),t,s,eq])
                    if s>best:best=s;bestp=p.copy()
        out[name]={'vertex':vertex,'true_rank':int(truth[vertex]),'truth':val(a,b,truth),'best':best,'best_pi':bestp.tolist(),'exact':exact,'runs':len(records),'records':records}
    return out

def hist(a):return np.bincount(D.ravel(),weights=a.ravel(),minlength=N)

def quartic(a,p,seeds,steps=80):
    for _ in range(steps):
        h=hist(p.T@a@p);b=h[D];grad=2*(a@p@b.T+a.T@p@b)
        q=assign(grad,seeds);d=q-p;v=hist(d.T@a@p+p.T@a@d);w=hist(d.T@a@d)
        coef=np.array([h@h,2*h@v,v@v+2*h@w,2*v@w,w@w])
        roots=np.polynomial.polynomial.polyroots(coef[1:]*np.arange(1,5))
        ts=[0.,1.]+[float(x.real) for x in roots if abs(x.imag)<1e-8 and 0<x.real<1]
        t=max(ts,key=lambda t:np.polynomial.polynomial.polyval(t,coef))
        if t*np.linalg.norm(d)<1e-7:break
        p+=t*d
    return assign(p,seeds).argmax(axis=1)

def unknown_score(a,p,soft):
    h=np.bincount(((p[:,None]-p[None,:])%N).ravel(),weights=a.ravel(),minlength=N)
    return float(h@h) if soft else float(np.sort(h)[-8:].sum())

def joint(raw,restarts=32):
    truth=np.argsort(raw['ord']);out={}
    for name in ('oracle','independent'):
        a=adjacency(raw[name]['bestRows'] if isinstance(raw[name],dict) else raw[name]);c=centre(a);rng=np.random.default_rng(3301313);vertex=int(np.argmax(a.sum(axis=0)[1:]))+1
        rec=[];best=-1;bestp=None;exact=0
        for t in range(restarts):
            seeds={0:0,vertex:1};p0=init(rng,seeds,True)
            p1=np.zeros((N,N));ii,jj=indices(seeds);p1[ii,rng.permutation(jj)]=1
            for i,j in seeds.items():p1[i,j]=1
            p=quartic(c,.6*p0+.4*p1,seeds)
            p,_=improve(p,lambda x:unknown_score(a,x,True));p,s=improve(p,lambda x:unknown_score(a,x,False))
            eq=any(np.array_equal(p,truth*k%N) for k in range(1,N));exact+=eq;rec.append([s,bool(eq)])
            if s>best:best=s;bestp=p.copy()
        out[name]={'best':best,'truth':unknown_score(a,truth,False),'exact':exact,'runs':restarts,'best_pi':bestp.tolist(),'records':rec}
    return out

if __name__=='__main__':
    raw=json.loads(Path(sys.argv[1] if len(sys.argv)>1 else DEFAULT).read_text())
    print(json.dumps({'unseeded':run(raw),'seeded':seeded(raw),'joint':joint(raw)},indent=2))

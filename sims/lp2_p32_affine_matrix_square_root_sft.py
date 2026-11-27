import itertools, math, warnings, json, sys
from collections import Counter
from pathlib import Path
import numpy as np
import sympy as s
from sympy.utilities.exceptions import SymPyDeprecationWarning
warnings.filterwarnings('ignore',category=SymPyDeprecationWarning)
q=29; x=s.symbols('x')
def poly(z):return s.Poly(z,x,modulus=q)
Z,O,X=map(poly,[0,1,x])
def power(b,n,f):
    r=O
    while n:
        if n&1:r=(r*b)%f
        b=(b*b)%f;n>>=1
    return r

def sqrtfield(v,f):
    if v==Z:return Z
    n=q**f.degree()-1
    if power(v,n//2,f)!=O:return None
    m=n;h=0
    while m%2==0:m//=2;h+=1
    # Deterministic enumeration of field elements; no random root selection.
    for k in range(1,n+1):
        a=k;z=Z;i=0
        while a:z+=poly((a%q)*x**i);a//=q;i+=1
        if power(z,n//2,f)!=O:break
    c=power(z,m,f);t=power(v,m,f);r=power(v,(m+1)//2,f)
    while t!=O:
        j=1;u=t*t%f
        while u!=O:u=u*u%f;j+=1
        assert j<h
        b=power(c,2**(h-j-1),f);r=r*b%f;c=b*b%f;t=t*c%f;h=j
    assert r*r%f==v
    return r

def cyclic(A):
    n=len(A);P=np.eye(n,dtype=np.int64);cols=[]
    for _ in range(n):cols.append(P.ravel());P=P@A%q
    B=np.stack(cols,axis=1);i=0
    for j in range(n):
        k=next((k for k in range(i,len(B)) if B[k,j]),None)
        if k is None:continue
        B[[i,k]]=B[[k,i]];r=B[i]*pow(int(B[i,j]),-1,q)%q
        B=(B-B[:,j,None]*r)%q;B[i]=r;i+=1
    return i==n

def roots(A):
    n=len(A);f=poly(s.Matrix(A.tolist()).charpoly(x).as_expr());fac=s.factor_list(f)[1]
    if not cyclic(A):return None,[(g.degree(),m) for g,m in fac]
    pieces=[]
    for g,m in fac:
        v=X%g;r=sqrtfield(v,g)
        if r is None or (r==Z and m>1):return [],[(g.degree(),m) for g,m in fac]
        G=g**m
        if r!=Z:
            # Newton-Hensel doubles g-adic precision; inverse exists since r mod g != 0.
            k=1
            while k<m:
                k=min(k*2,m);H=g**k
                r=(r-(r*r-X)*s.invert(2*r,H))%H
        assert (r*r-X)%G==Z
        F=f.exquo(G);e=F*s.invert(F,G)%f
        pieces.append([r*e%f] if r==Z else [r*e%f,-r*e%f])
    out=[]
    for p in itertools.product(*pieces):
        h=sum(p,Z)%f;R=np.zeros_like(A);I=np.eye(n,dtype=np.int64)
        for c in h.all_coeffs():R=(R@A+int(c)*I)%q
        assert np.array_equal(R@R%q,A)
        out.append(R)
    assert len({R.tobytes() for R in out})==len(out)
    return out,[(g.degree(),m) for g,m in fac]

def enumerate_tapes(c, W):
    def score(t):return float(W[t[:-2],t[1:-1],t[2:]].mean())
    all_candidates={};status=[]
    for b in range(q):
        for a in (1,2):
            A=a*(c+b)%q;rr,fac=roots(A)
            status.append({'a':a,'b':b,'factors':fac,'n':None if rr is None else len(rr)})
            if not rr:continue
            for R in rr:
                for k in range(1,q):
                    for d in range(q):
                        t=((k*R+d)%q).ravel();key=t.astype(np.uint8).tobytes()
                        if key not in all_candidates:all_candidates[key]=(score(t),a,b,k,d)
    return all_candidates,status

def run(corpus,reference):
    page=lambda n:next(p['indices'] for p in corpus['pages'] if p['page']==n)
    c=np.array(page(32),dtype=np.int64).reshape(11,11)
    p56=[];p=1
    for i,v in enumerate(page(56)):
        if i==56:
            assert v==0;p56.append(0)
        else:p=int(s.nextprime(p));p56.append((v-p+1)%q)
    assert len(p56)==85 and p56[:5]==[24,9,18,9,23]
    assert p56.count(0)==1
    known=p56+page(57)
    training=reference['key'];assert len(training)==2916
    # Interpolated native-GP trigram, independent of the p56/p57 controls.
    f1=Counter(training);f2=Counter(zip(training,training[1:]));f3=Counter(zip(training,training[1:],training[2:]));fprev=Counter(training[:-1]);fprev2=Counter(zip(training[:-2],training[1:-1]));
    W=np.zeros((q,q,q))
    for i,j,k in itertools.product(range(q),repeat=3):
        p1=(f1[k]+.5)/(len(training)+q*.5)
        p2=(f2[j,k]+5*p1)/(fprev[j]+5)
        p3=(f3[i,j,k]+5*p2)/(fprev2[i,j]+5)
        W[i,j,k]=math.log(p3)
    score=lambda t:float(W[t[:-2],t[1:-1],t[2:]].mean())
    cand,status=enumerate_tapes(c,W)
    top=sorted(cand.items(),key=lambda z:z[1][0],reverse=True)[:5]
    # Verify exact re-encryption of every displayed original candidate under its witness.
    for t,(sc,a,b,k,d) in top:
        R=(pow(k,-1,q)*(np.array(list(t),dtype=np.int64).reshape(11,11)-d))%q
        assert np.array_equal((pow(a,-1,q)*(R@R)-b)%q,c)
    control=[]
    # Genuine solved p56/p57 windows; overlap explicitly because only 180 native runes available.
    for offset,a,b,k,d in [(0,1,0,1,0),(29,2,8,9,3),(59,7,15,14,4)]:
        t=np.array(known[offset:offset+121],dtype=np.int64);P=t.reshape(11,11)
        R=(k*P+d)%q;C=(a*(R@R)+b)%q
        ct,st=enumerate_tapes(C,W);key=t.astype(np.uint8).tobytes()
        control.append({'offset':offset,'a':a,'b':b,'k':k,'d':d,'tapes':len(ct),'noncyclic':sum(z['n'] is None for z in st),'true_retained':key in ct,'true_score':score(t),'rank':1+sum(z[0]>score(t)+1e-12 for z in ct.values()),'best_score':max((z[0] for z in ct.values()),default=None)})
    primelist=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109]
    prime_det=int(s.Matrix((np.array(primelist)[c]%q).tolist()).det())%q
    return {'direct_det':int(s.Matrix(c.tolist()).det())%q,'prime_residue_det':prime_det,'direct_roots':status[0],'one_based_roots':status[2],'status':status,'candidate_count':len(cand),'top':[{'score':v[0],'parameters':v[1:],'indices':list(t),'translit':' '.join(corpus['translit'][x] for x in t)} for t,v in top],'controls':control}
if __name__=='__main__':
    print(json.dumps(run(*(json.loads(Path(p).read_text()) for p in sys.argv[1:3])),indent=2))

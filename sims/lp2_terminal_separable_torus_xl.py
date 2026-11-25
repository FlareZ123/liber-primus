"""Exact GF(29) lifted rank test for arbitrary separable torus filters.
Requires numpy; reads canonical LP2 corpus and grid JSON from repo root.
"""
from pathlib import Path
import json
import numpy as np
Q=29
R,C=32,8
N=R*C
ROOT=Path(__file__).resolve().parents[1]

def prime_shifts(n):
    primes=[]
    a=2
    while len(primes)<n:
        if all(a%p for p in primes if p*p<=a): primes.append(a)
        a+=1
    return [(p-1)%Q for p in primes]

def shell_order():
    cells=[]
    for s in range(C//2):
        t,b,l,r=s,R-1-s,s,C-1-s
        cells.extend((t,c) for c in range(l,r+1))
        cells.extend((i,r) for i in range(t+1,b+1))
        cells.extend((b,c) for c in range(r-1,l-1,-1))
        cells.extend((i,l) for i in range(b-1,t,-1))
    order=np.array([r*C+c for r,c in cells],dtype=np.int64)
    assert len(order)==N and len(set(order))==N
    return order

def design(grid,coordinates):
    s=np.arange(N)
    r,c=coordinates//C,coordinates%C
    return grid[((r[:,None]+s//C)%R)*C+(c[:,None]+s%C)%C].astype(np.int16)

def lift(a,b):
    # W[i,j,l] = u[i]*v[j]*v[l] is symmetric in j,l.
    pairs=[(j,k) for j in range(C) for k in range(j,C)]
    ix={p:i for i,p in enumerate(pairs)}
    sym=len(pairs)
    out=np.zeros((len(a)*C,R*sym+C),dtype=np.int16)
    for l in range(C):
        for j in range(C):
            out[l::C,np.arange(R)*sym+ix[tuple(sorted((j,l)))]]=a[:,j::C]
        out[l::C,R*sym+l]=(-b)%Q
    return out

def echelon(x):
    x=x.copy(); row=0; pivots=[]
    inv=[0]+[pow(i,-1,Q) for i in range(1,Q)]
    for col in range(x.shape[1]):
        loc=np.flatnonzero(x[row:,col])
        if not len(loc): continue
        i=row+loc[0]; x[[row,i]]=x[[i,row]]
        x[row,col:]=(x[row,col:]*inv[int(x[row,col])])%Q
        sub=x[row+1:,col:]
        nz=np.flatnonzero(sub[:,0])
        if len(nz): sub[nz]=(sub[nz]-sub[nz,0,None]*x[row,col:])%Q
        pivots.append(col); row+=1
        if row==len(x): break
    return x,pivots

def unique_solution(a,b):
    x,pivots=echelon(np.column_stack([a,b])%Q)
    n=a.shape[1]
    assert pivots==list(range(n)),pivots
    out=np.zeros(n,dtype=np.int16)
    for i in range(n-1,-1,-1):
        out[i]=(int(x[i,-1])-int(x[i,i+1:n].astype(np.int64)@out[i+1:].astype(np.int64)))%Q
    assert np.array_equal((a.astype(np.int64)@out.astype(np.int64))%Q,b%Q)
    return out

def vector_nullity(a,b):
    da=(a[1:]-a[0])%Q; db=(b[1:]-b[0])%Q
    x,pivots=echelon(lift(da,db))
    w=R*C*(C+1)//2
    r0=sum(i<w for i in pivots); r1=len(pivots)
    return {'rank_W':r0,'rank_all':r1,'v_projection_dim':C-r1+r0},x[r0:r1,w:]

def run(tokens,alphabet,p56,p57):
    order=shell_order()
    shifts=prime_shifts(84); shifts.insert(56,0)
    p56=np.array(p56,dtype=np.int16); p57=np.array(p57,dtype=np.int16)
    shifts=np.array(shifts,dtype=np.int16)
    plain=np.r_[(p56-shifts)%Q,p57]
    mask=np.r_[shifts,np.zeros(95,dtype=np.int16)]
    assert len(p56)==85 and len(p57)==95 and p56[56]==0
    gp='F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()
    assert ''.join(gp[x] for x in plain[:85])=='ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE'
    assert np.array_equal((plain[:85]+shifts)%Q,p56)
    assert len(tokens)==N
    for radix in (59,60):
        codebook=alphabet.replace('f','') if radix==59 else alphabet
        grid=np.array([(radix*codebook.index(t[0])+codebook.index(t[1]))%Q for t in tokens],dtype=np.int16)
        a=design(grid,order[76:])
        for name,target in [('plain',plain),('mask',mask)]:
            result,_=vector_nullity(a,target)
            assert result['v_projection_dim']==0 and np.any(target!=target[0])
            print(json.dumps({'radix':radix,'mode':name,**result}),flush=True)
        u=np.array([(13*i*i+7*i+5)%Q for i in range(R)],dtype=np.int16)
        v=np.array([1,4,8,15,16,23,9,27],dtype=np.int16)
        k=np.outer(u,v)%Q
        known=((a.astype(np.int64)@k.reshape(-1).astype(np.int64))+11)%Q
        result,eq=vector_nullity(a,known.astype(np.int16))
        assert result['v_projection_dim']==1
        normalize=np.zeros((1,C),dtype=np.int16); normalize[0,0]=1
        vh=unique_solution(np.vstack([eq,normalize]),np.r_[np.zeros(len(eq),dtype=np.int16),1])
        assert np.array_equal(vh,v)
        full=design(grid,order).reshape(N,R,C).astype(np.int64)
        aa=np.column_stack([(full@vh.astype(np.int64))%Q,np.ones(N,dtype=np.int16)]).astype(np.int16)
        uh=unique_solution(aa[76:],known.astype(np.int16))
        assert np.array_equal(uh,np.r_[u,11])
        truth=(full.reshape(N,N)@k.reshape(-1).astype(np.int64)+11)%Q
        prediction=(aa.astype(np.int64)@uh.astype(np.int64))%Q
        assert np.array_equal(prediction,truth)
        result['recovered_withheld']=int(np.sum(prediction[:76]==truth[:76]))
        print(json.dumps({'radix':radix,'mode':'positive',**result}),flush=True)

if __name__=='__main__':
    data=json.loads((ROOT/'resources/liber-primus/lp2-grid-256.json').read_text(encoding='utf-8'))
    corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    pages={x['page']:x['indices'] for x in corpus['pages']}
    run([t for p in data['pages'] for t in p['tokens']],data['alphabet'],pages[56],pages[57])

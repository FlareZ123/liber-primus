"""Exact support-minors attack on source-aligned rank <=3 torus kernels.
Requires numpy. All arithmetic is exact modulo 29.
"""
from itertools import combinations
from lp2_terminal_separable_torus_xl import (
    Q, R, C, N, ROOT, prime_shifts, shell_order, design, echelon,
    unique_solution, json, np,
)

def panel_echelon(mat, panel=64):
    mat=mat.copy(); row=0; pivots=[]
    inv=[0]+[pow(i,-1,Q) for i in range(1,Q)]
    for start in range(0,mat.shape[1],panel):
        end=min(start+panel,mat.shape[1]); begin=row
        l=np.zeros((mat.shape[0]-begin,panel),dtype=np.int16)
        for col in range(start,end):
            loc=np.flatnonzero(mat[row:,col])
            if not len(loc): continue
            p=row+loc[0]; k=row-begin
            if p!=row:
                mat[[row,p],start:]=mat[[p,row],start:]
                l[[k,p-begin]]=l[[p-begin,k]]
            if k and end<mat.shape[1]:
                mat[row,end:]=(mat[row,end:].astype(np.int32)-l[k,:k].astype(np.int32)@mat[begin:row,end:].astype(np.int32))%Q
            mat[row,col:]=(mat[row,col:]*inv[int(mat[row,col])])%Q
            factors=mat[row+1:,col].copy(); l[k+1:,k]=factors
            mat[row+1:,col:end]=(mat[row+1:,col:end]-factors[:,None]*mat[row,col:end])%Q
            pivots.append(col);row+=1
            if row==len(mat): break
        k=row-begin
        if k and end<mat.shape[1] and row<len(mat):
            # All integer dot products are at most 64*28^2 < 2^24.
            # Therefore binary32 GEMM is exact, with no numerical rank tolerance.
            mat[row:,end:]=(mat[row:,end:].astype(np.int32)-(l[k:,:k].astype(np.float32)@mat[begin:row,end:].astype(np.float32)).astype(np.int32))%Q
        if row==len(mat): break
    return mat,pivots

def affine_solution(a,b):
    x,p=echelon(np.column_stack([a,b])%Q)
    n=a.shape[1]
    assert all(i<n for i in p), 'no linear solution'
    free=[i for i in range(n) if i not in p]
    sol=np.zeros((n,1+len(free)),dtype=np.int16)
    sol[free,1:]=np.eye(len(free),dtype=np.int16)
    for i in reversed(range(len(p))):
        j=p[i]
        sol[j,0]=x[i,-1]
        sol[j]=(sol[j].astype(np.int64)-x[i,j+1:n].astype(np.int64)@sol[j+1:].astype(np.int64))%Q
    assert np.array_equal((a.astype(np.int64)@sol[:,0].astype(np.int64))%Q,b%Q)
    assert np.all((a.astype(np.int64)@sol[:,1:].astype(np.int64))%Q==0)
    return sol

def wedge_lift(sol,rank):
    # K_i wedge p=0. Linearize each free coefficient times each Pluecker coordinate.
    p=list(combinations(range(C),rank));ix={v:i for i,v in enumerate(p)}
    larger=list(combinations(range(C),rank+1));pc=len(p);lc=len(larger)
    f=sol.shape[1]-1;out=np.zeros((R*lc,(f+1)*pc),dtype=np.int16)
    free=np.arange(f)*pc
    for j,large in enumerate(larger):
        for pos,i in enumerate(large):
            pi=ix[large[:pos]+large[pos+1:]]
            v=sol[i::C].copy()
            if pos%2: v=(-v)%Q
            out[j::lc,free+pi]=v[:,1:]
            out[j::lc,f*pc+pi]=v[:,0]
    return out,pc

def plane_rank(a,b,r):
    d=(a[1:]-a[0])%Q;e=(b[1:]-b[0])%Q
    sol=affine_solution(d,e);mat,pc=wedge_lift(sol,r)
    red,p=panel_echelon(mat);w=mat.shape[1]-pc
    r0=sum(i<w for i in p);r1=len(p)
    return dict(rank=r,free=sol.shape[1]-1,shape=mat.shape,rank_W=r0,rank_all=r1,projective_dim=pc-r1+r0),red[r0:r1,w:]

def positive(a,full,r):
    rng=np.random.default_rng(2900+r)
    v=np.column_stack([np.eye(r,dtype=np.int16),rng.integers(0,Q,(r,C-r),dtype=np.int16)])
    u=rng.integers(0,Q,(R,r),dtype=np.int16)
    k=(u.astype(np.int64)@v.astype(np.int64))%Q
    truth=(full.astype(np.int64)@k.reshape(-1)+11)%Q
    res,eq=plane_rank(a,truth[76:].astype(np.int16),r)
    pc=len(list(combinations(range(C),r)))
    assert res['projective_dim']==1
    normalization=np.zeros((1,pc),dtype=np.int16);normalization[0,0]=1
    p=unique_solution(np.vstack([eq,normalization]),np.r_[np.zeros(len(eq),dtype=np.int16),1])
    ix={s:i for i,s in enumerate(combinations(range(C),r))}
    vh=np.eye(r,C,dtype=np.int16)
    for j in range(r):
        for c in range(r,C):
            s=tuple(i for i in range(r) if i!=j)+(c,)
            vh[j,c]=((-1)**(r-1-j)*int(p[ix[s]]))%Q
    assert np.array_equal(vh,v)
    aa=(full.reshape(N,R,C).astype(np.int64)@vh.T.astype(np.int64)).reshape(N,R*r)%Q
    aa=np.column_stack([aa,np.ones(N,dtype=np.int16)]).astype(np.int16)
    uh=unique_solution(aa[76:],truth[76:].astype(np.int16))
    assert np.array_equal(uh,np.r_[u.reshape(-1),11])
    pred=(aa.astype(np.int64)@uh.astype(np.int64))%Q
    assert np.array_equal(pred,truth)
    res['recovered_withheld']=int(np.sum(pred[:76]==truth[:76]))
    return res

def main():
    rng=np.random.default_rng(109)
    for n,m in [(19,50),(200,300),(300,200)]:
        a=rng.integers(0,Q,(n,m),dtype=np.int16);a[1]=a[0]
        x,p=echelon(a);y,q=panel_echelon(a,16)
        assert p==q and np.array_equal(x,y)
    data=json.loads((ROOT/'resources/liber-primus/lp2-grid-256.json').read_text(encoding='utf-8'))
    corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    pages={x['page']:x['indices'] for x in corpus['pages']}
    s=prime_shifts(84);s.insert(56,0)
    mask=np.r_[np.array(s,dtype=np.int16),np.zeros(95,dtype=np.int16)]
    plain=np.r_[(np.array(pages[56])-s)%Q,pages[57]].astype(np.int16)
    gp='F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()
    assert ''.join(gp[x] for x in plain[:85])=='ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE'
    for radix in (59,60):
        al=data['alphabet'].replace('f','') if radix==59 else data['alphabet']
        tokens=[t for p in data['pages'] for t in p['tokens']]
        g=np.array([(radix*al.index(t[0])+al.index(t[1]))%Q for t in tokens],dtype=np.int16)
        full=design(g,shell_order());a=full[76:]
        for r in (1,2,3):
            print(json.dumps(dict(radix=radix,mode='positive',**positive(a,full,r))),flush=True)
            for name,t in [('mask',mask),('plain',plain)]:
                res,_=plane_rank(a,t,r)
                assert res['projective_dim']==0
                print(json.dumps(dict(radix=radix,mode=name,**res)),flush=True)
        for name,t in [('mask',mask),('plain',plain)]:
            res,_=plane_rank(a,t,4)
            assert res['projective_dim']==70
            print(json.dumps(dict(radix=radix,mode=name,**res)),flush=True)

if __name__=='__main__': main()

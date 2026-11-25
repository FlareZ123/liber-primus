"""Exact row/column affine-normalized RS(256,180) gate. Python 3 stdlib."""
import json, hashlib, random, sys
from pathlib import Path

def field(mod):
    q=257 if mod==257 else 256
    def add(a,b): return (a+b)%q if q==257 else a^b
    def neg(a): return (-a)%q if q==257 else a
    def mul(a,b):
        if q==257:return a*b%q
        z=0
        while b:
            if b&1:z^=a
            b>>=1;a<<=1
            if a&256:a^=mod
        return z
    def power(a,n):
        z=1
        while n:
            if n&1:z=mul(z,a)
            a=mul(a,a);n>>=1
        return z
    return q,add,neg,mul,power

def rank(A,F):
    q,add,neg,mul,power=F
    A=[list(r) for r in A];r=0
    for j in range(len(A[0])):
        k=next((k for k in range(r,len(A)) if A[k][j]),None)
        if k is None:continue
        A[r],A[k]=A[k],A[r];iv=power(A[r][j],q-2)
        A[r]=[mul(x,iv) for x in A[r]]
        for k in range(r+1,len(A)):
            a=neg(A[k][j])
            if a:A[k]=[add(x,mul(a,y)) for x,y in zip(A[k],A[r])]
        r+=1
        if r==len(A):break
    return r

def parity(F):
    q,add,neg,mul,power=F
    return [[mul(x+1 if q==257 else 1,power(x,j)) for x in range(256)] for j in range(76)]

def system(y,H,F):
    q,add,neg,mul,power=F
    base=[]; rows=[]; cols=[]
    for h in H:
        b=[0]*40;a=[0]*32;c=[0]*8
        for x,(v,w) in enumerate(zip(y,h)):
            r,s=divmod(x,8);z=mul(v,w)
            b[r]=add(b[r],w);b[32+s]=add(b[32+s],w)
            a[r]=add(a[r],z);c[s]=add(c[s],z)
        base.append(b);rows.append(a);cols.append(c)
    b=rank(base,F)
    return {'offset_rank':b,'row_slope_dim':32-(rank([u+v for u,v in zip(base,rows)],F)-b),'col_slope_dim':8-(rank([u+v for u,v in zip(base,cols)],F)-b),'rowcol_slope_dim':40-(rank([u+v+w for u,v,w in zip(base,rows,cols)],F)-b)}

def dot(a,b,F):
    _,add,_,mul,_=F;z=0
    for x,y in zip(a,b):z=add(z,mul(x,y))
    return z

def plant(F,H,seed,mode):
    q,add,neg,mul,power=F;rng=random.Random(seed)
    coeff=[rng.randrange(q) for _ in range(180)];coeff[-1]=1
    def evaluate(x):
        z=0
        for c in reversed(coeff):z=add(mul(z,x),c)
        return z
    p=[evaluate(x) for x in range(256)]
    assert not any(dot(h,p,F) for h in H)
    a=[rng.randrange(1,q) if mode!='col' else 0 for _ in range(32)]
    e=[rng.choice([v for v in range(q) if all(add(u,v)!=0 for u in a)]) if mode!='row' else 0 for _ in range(8)]
    b=[rng.randrange(q) for _ in range(32)];d=[rng.randrange(q) for _ in range(8)]
    y=[mul(add(add(v,neg(b[x//8])),neg(d[x%8])),power(add(a[x//8],e[x%8]),q-2)) for x,v in enumerate(p)]
    assert all(add(add(mul(add(a[x//8],e[x%8]),v),b[x//8]),d[x%8])==p[x] for x,v in enumerate(y))
    s=system(y,H,F);assert s['rowcol_slope_dim']>=2
    if mode!='both':assert s[mode+'_slope_dim']>=1
    return s

def main():
    path=Path(sys.argv[1]) if len(sys.argv)>1 else Path('resources/liber-primus/lp2-grid-256.json')
    pages=json.loads(path.read_text(encoding='utf-8'))['pages']
    assert [len(p['tokens']) for p in pages]==[80,104,72]
    tokens=[t for p in pages for t in p['tokens']]
    alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'
    data={}
    hashes={59:'511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79',60:'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'}
    for n in [59,60]:
        a=alphabet.replace('f','') if n==59 else alphabet
        y=[n*a.index(t[0])+a.index(t[1]) for t in tokens]
        assert all(len(set(y[i:i+8]))==8 for i in range(0,256,8))
        data[n]=y
        assert hashlib.sha256(bytes(y)).hexdigest()==hashes[n]
        print(n,hashes[n])
    for mod in [0x11b,0x11d,257]:
        F=field(mod);H=parity(F)
        assert rank(H,F)==76
        print('field',mod,'Hrank',76)
        for n,y in data.items():
            s=system(y,H,F)
            assert (s['row_slope_dim'],s['col_slope_dim'],s['rowcol_slope_dim'])==(0,0,1)
            print('original',n,s)
        for mode in ['row','col','both']:
            print('plant',mode,plant(F,H,3301+mod,mode))
if __name__=='__main__':main()

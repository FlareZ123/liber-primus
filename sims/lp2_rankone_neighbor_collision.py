"""Construct exact finite-frame collisions for the shared rank-one GP29 sender."""
import random
Q=29

def enc(p,A,u,v,L,R):
    x=[L]+list(p)+[R]
    return tuple((A[x[i]]+u[x[i-1]]*v[x[i+1]])%Q for i in range(1,len(x)-1))

def witness(A,u,v,b,bp,c,cp):
    assert b!=bp and c!=cp
    a=u.index((-(A[b]-A[bp])*pow((v[c]-v[cp])%Q,-1,Q))%Q)
    d=v.index((-(A[c]-A[cp])*pow((u[b]-u[bp])%Q,-1,Q))%Q)
    return (u.index(0),a,b,c,d,v.index(0)),(u.index(0),a,bp,cp,d,v.index(0))

def main():
    I=list(range(Q)); p,pp=witness(I,I,I,0,1,1,0)
    print('identity:',p,pp,enc(p,I,I,I,7,11),enc(pp,I,I,I,7,11))
    rng=random.Random(3184); count=0
    for _ in range(1000):
        A,u,v=[rng.sample(range(Q),Q) for _ in range(3)]
        b,bp=rng.sample(range(Q),2); c,cp=rng.sample(range(Q),2)
        p,pp=witness(A,u,v,b,bp,c,cp)
        for n in (6,13,76,121,729):
            pre=rng.randrange(n-5); left=[rng.randrange(Q) for _ in range(pre)]; right=[rng.randrange(Q) for _ in range(n-6-pre)]
            P=left+list(p)+right; PP=left+list(pp)+right; L,R=rng.randrange(Q),rng.randrange(Q)
            assert P!=PP and enc(P,A,u,v,L,R)==enc(PP,A,u,v,L,R)
            count+=1
    print('exact collisions verified:',count)
    for _ in range(100):
        A=rng.sample(range(Q),Q); inv=[A.index(z) for z in range(Q)]; u=rng.sample(range(Q),Q); L=rng.randrange(Q)
        P=[rng.randrange(Q) for _ in range(76)]; C=[(A[x]+u[y])%Q for x,y in zip(P,[L]+P)]
        out=[]; prev=L
        for z in C:
            prev=inv[(z-u[prev])%Q]; out.append(prev)
        assert out==P
    print('causal inverse controls: 100/100')
if __name__=='__main__': main()

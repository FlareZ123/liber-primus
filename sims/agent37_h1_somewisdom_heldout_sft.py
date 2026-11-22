"""Reproduce the original H1 L20 source candidate and heldout failure.
Python 3.11 stdlib only; runs on Windows 11.
Inputs: resources/liber-primus/lp2-corpus.json, original GP29 runes.
H1 source: pnotisdev/cicada3301 15200c67, h5slice.py and kscreen/export.py.
"""
from __future__ import annotations
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GP = ('F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA')
LOGF=(-3.627225549919135,-3.171893216150944,-3.383398158345403,-2.5820450256710257,-2.8039932356397377,-3.3206777364242908,-4.3908269120731305,-3.777481620401693,-3.527648700316938,-2.6219294362065617,-2.7044499163767224,-6.92541340580455,-7.987324327622232,-4.013164331071345,-6.364996870462134,-2.601912254223261,-2.6744379309954787,-4.218360586657605,-2.08781209076449,-3.6533955292644595,-3.15555710102528,-5.339425887179944,-7.3875972223481945,-3.2920170242342945,-2.5922481995215776,-10.499629951598346,-3.9866966206258936,-5.058367309065212,-4.928490375505553)
L=20
OFFSET=1009

def source_stream(n: int) -> list[int]:
    seed=b'some wisdom'
    raw=b''.join(hashlib.md5(seed+i.to_bytes(4,'big')).digest() for i in range((OFFSET+n+15)//16))
    vals=[v%29 for v in raw]
    assert vals[:8]==[28,3,2,27,17,25,26,6]
    return vals[OFFSET:OFFSET+n]

def periodic_ioc(plain: list[int], ptr: list[int]) -> float:
    cols=[[] for _ in range(L)]
    for p,j in zip(plain,ptr):cols[j%L].append(p)
    scores=[]
    for col in cols:
        if len(col)>1:
            cnt=[col.count(v) for v in range(29)]
            scores.append(29*sum(x*(x-1) for x in cnt)/(len(col)*(len(col)-1)))
    return sum(scores)/len(scores)

def overall_ioc(plain: list[int]) -> float:
    cnt=[plain.count(v) for v in range(29)]
    return 29*sum(x*(x-1) for x in cnt)/(len(plain)*(len(plain)-1))

def est_cols(cipher: list[int],stream: list[int],ptr: list[int]) -> list[int]:
    bins=[[0]*29 for _ in range(L)]
    for c,j in zip(cipher,ptr):bins[j%L][(c-stream[j])%29]+=1
    out=[]
    for counts in bins:
        vals=[sum(counts[q]*LOGF[(q-v)%29] for q in range(29)) for v in range(29)]
        out.append(max(range(29),key=lambda v: vals[v]))
    return out

def init_nats(cipher: list[int],stream: list[int],beam:int=12,rank:int=0) -> list[int]:
    mt=[[LOGF[(q-v)%29] for v in range(29)] for q in range(29)]
    ln29=math.log(29)
    states=[(0,[0.0]*(L*29),[ln29]*L,L*ln29,-1)]
    nodes=[]
    for ci in cipher:
        best={}
        for j,G,Lc,S,node in states:
            for skip in (0,1,2):
                used=j+skip
                if used>=len(stream):continue
                q=(ci-stream[used])%29;col=used%L
                G2=G.copy();ind=col*29
                for v in range(29):G2[ind+v]+=mt[q][v]
                m=max(G2[ind:ind+29]);lse=m+math.log(sum(math.exp(a-m) for a in G2[ind:ind+29]))
                sc=S+lse-Lc[col]-3.575550768806933*skip
                dest=used+1
                if dest not in best or sc>best[dest][3]:
                    Lc2=Lc.copy();Lc2[col]=lse
                    best[dest]=(dest,G2,Lc2,sc,(node,used))
        states=[]
        for j,G,Lc,sc,(parent,used) in sorted(best.values(),key=lambda v:-v[3])[:beam]:
            nodes.append((parent,used))
            states.append((j,G,Lc,sc,len(nodes)-1))
        assert states
    node=sorted(states,key=lambda z:-z[3])[rank][-1]
    ptr=[]
    while node>=0:
        node,used_old=nodes[node];ptr.append(used_old)
    ptr.reverse()
    assert len(ptr)==len(cipher)
    return ptr

def fixed_beam(cipher: list[int],prev: int,stream: list[int],w: list[int],start: int=0,beam:int=24):
    key=[(v+w[j%L])%29 for j,v in enumerate(stream)]
    states={start:(0.0,-1)}
    nodes=[]
    for i,c in enumerate(cipher):
        pv=prev if i==0 else cipher[i-1]
        best={}
        for j,(score,node) in states.items():
            if j+2>=len(key):continue
            k0=key[j]
            cases=[(j+1,(c-k0)%29,j)]
            if pv>=0:
                p1=(c-key[j+1])%29
                if (p1+k0)%29==pv:cases.append((j+2,p1,j+1))
                p2=(c-key[j+2])%29
                if (p2+k0)%29==pv and (p2+key[j+1])%29==pv:
                    cases.append((j+3,p2,j+2))
            for dest,p,used in cases:
                val=score+LOGF[p]
                if dest not in best or val>best[dest][0]:
                    nodes.append((node,p,used));best[dest]=(val,len(nodes)-1)
        states=dict(sorted(best.items(),key=lambda it:-it[1][0])[:beam]);assert states
    score,node=max(states.values(),key=lambda it:it[0])
    pp=[];ptr=[]
    while node>=0:
        node,p,used=nodes[node];pp.append(p);ptr.append(used)
    pp.reverse();ptr.reverse();assert len(pp)==len(cipher)
    for c,p,j in zip(cipher,pp,ptr):assert (p+key[j])%29==c
    return pp,ptr,score

def run():
    pages=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))['pages']
    source=[q for page in pages[:56] for q in page['indices']]
    assert len(source)==12956 and source[5505]==14
    c=source[5506:5806];held=source[5806:5956]
    assert len(c)==300 and len(held)==150
    stream=source_stream(650)
    init=init_nats(c,stream)
    def fit(n):
        ptr=init
        w=est_cols(c,stream,ptr)
        history=[]
        for _ in range(n):
            pp,ptr,score=fixed_beam(c,14,stream,w)
            history.append(periodic_ioc(pp,ptr))
            new=est_cols(c,stream,ptr)
            if new==w:break
            w=new
        plain,ptr,score=fixed_beam(c,14,stream,w)
        return plain,ptr,w,score,history
    plain,ptr,w,score,history=fit(5)
    screen=periodic_ioc(plain,ptr)
    print('original 300-rune source screen IoC',round(screen,9),'EM',history)
    assert abs(screen-1.7539423076923075)<0.00001
    plain10,ptr10,w10,score10,hist10=fit(10)
    ioc10=periodic_ioc(plain10,ptr10)
    print('10-EM mandated redecode score',round(ioc10,9),'EM',hist10)
    assert abs(ioc10-1.5474633699633698)<0.00001
    print('source library stream: md5-ctr mod :some wisdom; offset=1009, L20 model=skip')
    print('frozen inferred keyword:',w)
    print('original training text:', ''.join(GP[k] for k in plain[:160]))
    print('original training IoC:',overall_ioc(plain))
    start=ptr[-1]+1
    pout,jout,score2=fixed_beam(held,c[-1],stream,w,start=start,beam=64)
    print('heldout 150 rune IoC:',overall_ioc(pout))
    print('heldout 150 rune log likelihood per rune:',score2/len(pout))
    print('heldout 150 rune text:', ''.join(GP[k] for k in pout))
    assert abs(overall_ioc(pout)-1.1106935123042505)<0.00001
    print('No coherent English in original training or heldout; no authentic plaintext/key recovered.')


def fixed_beam_coin(cipher: list[int],prev: int,stream: list[int],w: list[int],start: int=0,beam:int=24):
    """H1 model1 coin branch as in pinned Rust source: conditional +2 nominal pointer."""
    key=[(v+w[j%L])%29 for j,v in enumerate(stream)]
    states={start:(0.0,-1)}
    nodes=[]
    for i,c in enumerate(cipher):
        pv=prev if i==0 else cipher[i-1]
        best={}
        for j,(score,node) in states.items():
            if j+2>=len(key):continue
            k0=key[j]
            cases=[(j+(2 if pv==c else 1),(c-k0)%29,j)]
            if pv>=0:
                p2=(c-key[j+2])%29
                if (p2+k0)%29==pv:
                    cases.append((j+3,p2,j+2))
            for dest,p,used in cases:
                val=score+LOGF[p]
                if dest not in best or val>best[dest][0]:
                    nodes.append((node,p,used));best[dest]=(val,len(nodes)-1)
        states=dict(sorted(best.items(),key=lambda it:-it[1][0])[:beam]);assert states
    score,node=max(states.values(),key=lambda it:it[0])
    pp=[];ptr=[]
    while node>=0:
        node,p,used=nodes[node];pp.append(p);ptr.append(used)
    pp.reverse();ptr.reverse();assert len(pp)==len(cipher)
    for c,p,j in zip(cipher,pp,ptr):assert (p+key[j])%29==c
    return pp,ptr,score

def run_divinity():
    """Reproduce the source-Rust original 300-rune 18-column coin-model peak.

    Uses all 29 bit-exact English-prior entries. The true first ranked W-free
    initializer then yields the same 1.672712418 score as the pinned Rust
    campaign. The older 28-entry constant tuple misplaced the initializer.
    """
    global L,OFFSET
    L=18;OFFSET=1193
    pages=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))['pages']
    source=[q for page in pages[:56] for q in page['indices']]
    assert len(source)==12956 and source[3611]==24
    c=source[3612:3912];held=source[3912:4062]
    assert len(c)==300 and len(held)==150 and len(LOGF)==29
    seed=b'DIVINITY'
    raw=b''.join(hashlib.sha512(seed+i.to_bytes(4,'big')).digest() for i in range((OFFSET+650+63)//64))
    vals=[v%29 for v in raw]
    assert vals[:8]==[3,11,7,9,1,9,5,15]
    stream=vals[OFFSET:OFFSET+650]
    def fit(steps: int):
        ptr=init_nats(c,stream,rank=0)
        w=est_cols(c,stream,ptr)
        for _ in range(steps):
            pp,ptr,_=fixed_beam_coin(c,24,stream,w)
            new=est_cols(c,stream,ptr)
            if new==w:break
            w=new
        plain,ptr,_=fixed_beam_coin(c,24,stream,w)
        return periodic_ioc(plain,ptr),plain,ptr,w
    screen,plain,ptr,w=fit(5)
    screen10,_,_,_=fit(10)
    print('DIVINITY source-Rust matching first-init IoC',screen,'10-EM',screen10)
    assert abs(screen-1.6727124183006536)<0.00001
    assert abs(screen10-1.6727124183006536)<0.00001
    print('DIVINITY inferred 18-column keyword',w)
    print('DIVINITY original 300 preview', ''.join(GP[k] for k in plain[:160]))
    pout,_,_=fixed_beam_coin(held,c[-1],stream,w,start=ptr[-1]+1,beam=64)
    print('DIVINITY untouched 150 overall IoC',overall_ioc(pout))
    print('DIVINITY untouched 150 preview', ''.join(GP[k] for k in pout))
    assert abs(overall_ioc(pout)-0.9472035794183445)<0.00001
    print('DIVINITY original heldout has no coherent plaintext.')

if __name__=='__main__':
    run()
    run_divinity()


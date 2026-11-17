"""Adjudicate the complete L14-20 H1 original-cipher candidate and heldout.
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
OFFSET=1559

def source_stream(n: int) -> list[int]:
    """Pinned SHA256-counter source, with bytes reduced modulo GP29."""
    seed=b'FIRFUMFERENFE'
    raw=b''.join(hashlib.sha256(seed+i.to_bytes(4,'big')).digest()
                 for i in range((OFFSET+n+31)//32))
    values=[v%29 for v in raw]
    assert values[:8]==[27,10,10,18,3,25,26,24]
    out=values[OFFSET:OFFSET+n]
    assert len(out)==n and out[:8]==[14,22,28,0,3,27,4,19]
    return out

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


def run():
    pages=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))['pages']
    source=[q for page in pages[:56] for q in page['indices']]
    assert len(source)==12956 and source[8050]==20 and len(LOGF)==29
    cipher=source[8051:8351]
    hold=source[8351:8501]
    assert len(cipher)==300 and len(hold)==150
    stream=source_stream(750)

    def fit(iterations: int):
        ptr=init_nats(cipher,stream,rank=0)
        keyword=est_cols(cipher,stream,ptr)
        history=[]
        for _ in range(iterations):
            plain,ptr,_=fixed_beam_coin(cipher,20,stream,keyword)
            history.append(periodic_ioc(plain,ptr))
            new_keyword=est_cols(cipher,stream,ptr)
            if new_keyword==keyword:break
            keyword=new_keyword
        plain,ptr,_=fixed_beam_coin(cipher,20,stream,keyword)
        return periodic_ioc(plain,ptr),plain,ptr,keyword,history

    score5,plain5,ptr5,word5,hist5=fit(5)
    score10,plain10,ptr10,word10,hist10=fit(10)
    assert abs(score5-1.6644459706959709)<1e-5
    assert abs(score10-1.6304532967032965)<1e-5
    assert word5==[26,23,21,1,16,3,9,14,16,1,12,17,20,15,23,6,9,14,12,0]
    assert all((p+stream[j]+word5[j%L])%29==c for c,p,j in zip(cipher,plain5,ptr5))
    held5,heldptr,_=fixed_beam_coin(hold,cipher[-1],stream,word5,
                                  start=ptr5[-1]+1,beam=64)
    held10,heldptr10,_=fixed_beam_coin(hold,cipher[-1],stream,word10,
                                     start=ptr10[-1]+1,beam=64)
    assert len(held5)==150
    assert all((p+stream[j]+word5[j%L])%29==c for c,p,j in zip(hold,held5,heldptr))
    assert abs(overall_ioc(held5)-0.9549888143176734)<1e-5
    assert abs(overall_ioc(held10)-0.9368232662192394)<1e-5
    print('Full original L14-20 sweep candidate: sha256-ctr mod :FIRFUMFERENFE')
    print('Source window: seg0.14, original global 8051-8350; next untouched 8351-8500')
    print('Source key offset 1559, L20, model 1 coin, 20 original previous rune')
    print('Initial 5-EM periodic IoC',score5,'history',hist5)
    print('Verification 10-EM periodic IoC',score10,'history',hist10)
    print('Frozen original keyword',word5)
    print('Heldout 150 overall IoC from 5-EM key',overall_ioc(held5))
    print('Heldout 150 overall IoC from 10-EM key',overall_ioc(held10))
    print('First 120 reconstructed training runes', ''.join(GP[x] for x in plain5[:120]))
    print('All 150 untouched reconstructed runes', ''.join(GP[x] for x in held5))
    print('Decision: no coherent original LP2 plaintext or authentic key.')

if __name__=='__main__':
    run()

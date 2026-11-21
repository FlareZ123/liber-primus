#!/usr/bin/env python3
"""Independent p49-p51 transcription and 2016 p50 navigation-route reproduction.
No canonical grid JSON or existing SFT is loaded.
"""
from collections import Counter
import hashlib, json, re
from pathlib import Path

# Direct visual transcription: scan 66.jpg (p49), 67.jpg (p50), 68.jpg (p51).
# Signed 2016 word source: cicada2016-4gq25-outguess.asc, Git blob a0d8bd2d73613e01cd8a2103d5721b2b998ee482.
# GP29 order/prime source: 2013-twitter-stage-gematria-source.md, Git blob 12aae534f524962e5e3215b7a377ef587604fa8f.
# DH candidate depths p,g,a,b,A,B,K are the seven values documented in the existing source reconstruction.
R=[
"3N 3p 2l 36 1b 3v 26 33","1W 49 2a 3g 47 04 33 3W",
"21 3M 0F 0X 1g 2H 0x 1R","1n 3I 2r 0P 2U 16 2L 2D",
"1t 1s 3H 0d 0s 1K 2D 05","1K 1O 0S 1D 3o 1l 3J 1G",
"4D 0G 0l 0x 1Q 2p 2a 1K","4E 1w 2Q 19 1k 3G 24 0p",
"22 4F 0P 3C 3J 1D 2n 1m","2i 1J 3P 2v 1s 2O 0k 1M",
"2M 0w 3L 3D 2r 0S 1p 15","3V 3e 3I 0n 3u 1O 0u 0Z",
"3g 2U 1C 0Y 1N 3n 0W 3Q","22 13 0V 3c 0E 34 0W 1t",
"1D 2N 3H 47 0s 2p 0Z 34","0g 3v 1Q 0s 0D 0K 2h 3D",
"3L 2x 1Q 20 2n 2L 1C 2p","0A 29 3r 0D 45 0k 2e 2W",
"25 3U 1W 2r 46 2s 2X 39","3p 0X 0E 1q 0q 4B 49 48",
"3r 3b 3C 1M 1j 0I 4A 48","40 3m 4E 0s 2S 1v 3T 0I",
"3t 2B 2k 2t 2O 0e 2l 1L",
"28 2a 0J 1L 0c 3C 2o 0X","00 2Z 2d 1T 2u 1t 1j 0l",
"1o 1E 3T 18 3E 1G 27 0L","0v 2t 06 11 1A 2U 4B 1O",
"2M 3d 2S 0x 0w 0q 0p 2V","18 0q 1D 49 2O 00 1v 2t",
"1k 3s 3G 21 3w 0W 29 2r","2O 2L 0g 3Y 0M 0u 3I 3C",
"1r 2c 2q 3o 30 0a 39 1K"]
A60="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx"
A59=A60.replace("f","")
GP=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"]
PR=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109]
IX={s:i for i,s in enumerate(GP)}; PV=dict(zip(GP,PR)); IX.update(V=IX["U"],K=IX["C"]); PV.update(V=PV["U"],K=PV["C"])
DG=("TH","EO","NG","OE","AE","IA","EA")
BODY="""Hello.

The path lies empty; epiphany seeks the devoted.

Liber Primus is the way.  Its words are the map, their
meaning is the road, and their numbers are the direction.

Seek and you will be found.

Good luck.

3301

Beware false paths.  Verify OpenPGP 7A35090F."""
WORDS=[w.upper() for w in re.findall(r"[A-Za-z0-9]+",BODY) if w.isalpha()]
DEPTHS=[("p",23),("g",5),("a",6),("b",15),("A",8),("B",19),("K",2)]
RUNE_COUNT=121
IMG_SHA={"49.jpg":"c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72",
"66.jpg":"aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335",
"67.jpg":"bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776",
"68.jpg":"2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b"}

def rune_tokens(w):
    w=w.upper(); out=[]; i=0
    while i<len(w):
        p=w[i:i+2]
        if p in DG: out.append(p); i+=2
        else:
            if w[i] not in IX: raise ValueError((w,i))
            out.append(w[i]); i+=1
    return out

def encodings():
    names=("GP0","GP0mod256","GP1","GP1mod256","GPprime","GPprimemod256","runeCount")
    out={n:[] for n in names}
    for w in WORDS:
        rs=rune_tokens(w); a=sum(IX[x] for x in rs); b=sum(IX[x]+1 for x in rs); c=sum(PV[x] for x in rs)
        for n,v in (("GP0",a),("GP0mod256",a%256),("GP1",b),("GP1mod256",b%256),("GPprime",c),("GPprimemod256",c%256),("runeCount",len(rs))): out[n].append(v)
    return out

def decode(tokens,alphabet):
    if any(ch not in alphabet for t in tokens for ch in t): return None
    return [alphabet.index(t[0])*len(alphabet)+alphabet.index(t[1]) for t in tokens]

def traversals(mat):
    out={}
    for axis in ("row","column"):
        for mr in (False,True):
            for nr in (False,True):
                if axis=="row":
                    major=range(31,-1,-1) if mr else range(32); minor=range(7,-1,-1) if nr else range(8)
                    v=[mat[r][c] for r in major for c in minor]
                else:
                    major=range(7,-1,-1) if mr else range(8); minor=range(31,-1,-1) if nr else range(32)
                    v=[mat[r][c] for c in major for r in minor]
                out[f"{axis}-major_{'rev' if mr else 'fwd'}_minor_{'rev' if nr else 'fwd'}"]=v
    return out

def follow(t,s,d,off):
    p=[s]
    for _ in range(d):
        i=s-off
        if not 0<=i<256:return None
        s=t[i]+off;p.append(s)
    return p

def graph(t):
    seen=set(); cyc=[]
    for s in range(256):
        if s in seen:continue
        p=[]; pos={}; x=s
        while x not in pos and x not in seen:pos[x]=len(p);p.append(x);x=t[x]
        if x in pos:
            c=p[pos[x]:];k=c.index(min(c));cyc.append(c[k:]+c[:k])
        seen.update(p)
    cyc.sort(key=lambda c:(len(c),c)); co={}
    for i,c in enumerate(cyc):
        for x in c:co[x]=i
    for v in range(256):
        x=v; path=[]
        while x not in co and x not in path:path.append(x);x=t[x]
        if x in co:co[v]=co[x]
    bas=[sum(co.get(v)==i for v in range(256)) for i in range(len(cyc))]
    ind=Counter(t)
    return cyc,bas,sorted(Counter(ind.get(i,0) for i in range(256)).items())

def main():
    assert len(R)==32 and all(len(x.split())==8 for x in R) and len(WORDS)==43
    tok=[t for row in R for t in row.split()]; assert len(tok)==256
    for name,want in IMG_SHA.items():
        p=Path("resources/liber-primus")/name
        if p.exists():
            got=hashlib.sha256(p.read_bytes()).hexdigest(); assert got==want,(name,got,want)
            print("image_sha256",name,got)
    try:
        import numpy as np
        from PIL import Image
        from scipy.ndimage import label
        im=np.asarray(Image.open(Path("resources/liber-primus")/"49.jpg").convert("L"))
        labels,_=label(im[600:1800,550:1850]<128); areas=np.bincount(labels.ravel())[1:]
        big=areas[areas>=500]; small=areas[areas<500]
        bands=[(650,820),(840,1000),(1020,1190),(1210,1380),(1400,1560),(1580,1750)]
        counts=[]
        for lo,hi in bands:
            n=0
            for k,a in enumerate(areas,1):
                if a<500: continue
                ys,xs=np.where(labels==k)
                if len(ys) and lo<=(ys.min()+ys.max())/2+600<hi: n+=1
            counts.append(n)
        assert len(big)==121 and counts==[25,23,23,21,22,7] and len(small)==39
        assert int(small.max())==481 and int(big.min())==1026
        print("p32_image_rune_count",len(big),"line_counts",counts,"punctuation_components",len(small))
    except ImportError:
        print("p32_image_rune_count=121 (optional Pillow/NumPy/SciPy check unavailable)")
    assert all(c in A59 for t in tok for c in t)
    b60=decode(tok,A60); assert b60 and min(b60)==0 and max(b60)==255
    raw="\n".join(R)+"\n"
    print("tokens=256 transcription_sha256="+hashlib.sha256(raw.encode()).hexdigest())
    print("base60_vector_sha256="+hashlib.sha256(bytes(b60)).hexdigest(),"cell199",tok[199],b60[199])
    cyc,bas,ind=graph(b60); print("cycles",cyc,"basins",bas,"indegree",ind)
    E=encodings()
    for w in ("EPIPHANY","SEEKS","THE","DEVOTED","EMPTY"):
        i=WORDS.index(w); print(w,{k:v[i] for k,v in E.items()})
    hits=[]; tested=0
    for radix,alpha in (("base59",A59),("base60",A60)):
        decoded=decode(tok,alpha)
        if decoded is None:continue
        mat=[decoded[i*8:(i+1)*8] for i in range(32)]
        for tr,t in traversals(mat).items():
            for enc,vs in E.items():
                for dn,d in DEPTHS:
                    for off,addr in ((0,"zero-based"),(1,"one-based")):
                        for wi in range(40):
                            tested+=1; a,b,c,e=(vs[wi+j] for j in range(4))
                            if a!=RUNE_COUNT:continue
                            path=follow(t,b+off,d,off)
                            if path and path[d-2]==c+off and path[d-1]==e+off and path[d]==32:
                                hits.append((wi,WORDS[wi:wi+4],enc,dn,d,radix,addr,tr,path))
    print("configurations",tested,"raw_hits",len(hits))
    for h in hits:print("hit",h)
    distinct={ (h[0],h[3],h[5],h[6],h[7],h[8][0],tuple(h[8])) for h in hits }
    print("distinct_routes",len(distinct))
    path=[71,108,14,183,81,58,146,92,236,238,129,179,175,18,15,212,70,169,228,144,125,20,102,32]
    assert tested==62720 and len(hits)==2 and len(distinct)==1
    assert hits[0][1]==["EPIPHANY","SEEKS","THE","DEVOTED"] and hits[0][8]==path
    assert E["GP0"][WORDS.index("EMPTY")]==path[7]==92
    # Conditional q/r readout: 2-cycle phase from DH g=5; 11-cycle entry T[32].
    c2=next(c for c in cyc if len(c)==2); s2=next(x for x in c2 if x//29==5); order2=[s2,b60[s2]]
    s11=b60[32]; order11=[s11]; x=b60[s11]
    while x!=s11:order11.append(x);x=b60[x]
    for name,order in (("2-cycle",order2),("11-cycle",order11)):
        for x in order:
            q,r=divmod(x,29); print("conditional_qr",name,x,q,r,WORDS[q],WORDS[r])
    print("RESULT: independent unique navigation route; q/r readout remains conditional.")

if __name__=="__main__":main()

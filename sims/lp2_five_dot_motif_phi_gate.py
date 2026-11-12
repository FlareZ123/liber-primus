"""Five-dot original-art and solved-p56 prime-totient-transfer research test.

Run: python sims/lp2_five_dot_motif_phi_gate.py
Requires Pillow; reads original JPEGs 24, 40, 73 and canonical corpus JSON.
"""
from itertools import permutations
import json
import math
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
DOTS = {
    7: [(1297, 2867), (1527, 2936), (797, 3106), (1479, 3128), (992, 3167)],
    23: [(992, 507), (1479, 546), (797, 568), (1527, 738), (1297, 807)],
    56: [(1104, 2447), (873, 2517), (1604, 2687), (921, 2708), (1408, 2747)],
}
MAPS = {"identity": (1, 1), "horizontal-axis reflection": (1, -1),
        "vertical-axis reflection": (-1, 1), "180-degree rotation": (-1, -1)}

def centers(page):
    im = Image.open(ROOT / "resources/liber-primus" / f"{page+17:02d}.jpg").convert("L")
    assert im.size == (2400, 3600)
    pix = im.load()
    out = []
    for cx, cy in DOTS[page]:
        points = [(x,y) for y in range(cy-46,cy+47) for x in range(cx-46,cx+47) if pix[x,y]<95]
        assert 2500 <= len(points) <= 4900, (page,cx,cy,len(points))
        out.append((sum(x for x,y in points)/len(points), sum(y for x,y in points)/len(points)))
    return out

def fit(a,b):
    candidates=[]
    for name,(sx,sy) in MAPS.items():
        for perm in permutations(range(5)):
            tx=sum(b[perm[i]][0]-sx*a[i][0] for i in range(5))/5
            ty=sum(b[perm[i]][1]-sy*a[i][1] for i in range(5))/5
            err=math.sqrt(sum((sx*a[i][0]+tx-b[perm[i]][0])**2+
                              (sy*a[i][1]+ty-b[perm[i]][1])**2 for i in range(5))/5)
            candidates.append((err,name,perm,tx,ty))
    return sorted(candidates)

def totients(n):
    primes=[]
    x=2
    while len(primes)<n:
        if all(x%p for p in primes if p*p<=x): primes.append(x)
        x+=1
    return [1 if p==2 else p-1 for p in primes]

def ioc(a):
    counts=[a.count(i) for i in range(29)]
    return sum(k*(k-1) for k in counts)/(len(a)*(len(a)-1))

def decoded(cipher,phi,sign,reverse=False,literal_f=None):
    src=cipher[::-1] if reverse else cipher
    out=[]
    k=0
    for pos,c in enumerate(src):
        if pos==literal_f:
            assert c==0
            out.append(0)
        else:
            out.append((c+sign*phi[k])%29)
            k+=1
    proof=[]
    k=0
    for pos,p in enumerate(out):
        if pos==literal_f: proof.append(0)
        else:
            proof.append((p-sign*phi[k])%29)
            k+=1
    assert proof==src
    return out[::-1] if reverse else out

def main():
    pts={page:centers(page) for page in DOTS}
    for a,b,wanted in ((7,23,"horizontal-axis reflection"),
                       (23,56,"180-degree rotation"),
                       (7,56,"vertical-axis reflection")):
        best,next_best=fit(pts[a],pts[b])[:2]
        print(f"p{a}->p{b}: {best[1]} offset=({best[3]:.3f},{best[4]:.3f}) "
              f"RMS={best[0]:.6f}px next={next_best[0]:.3f}px")
        assert best[1]==wanted and best[0]<.5 and next_best[0]>50
    phi=totients(3632)
    plain=decoded(DATA["pages"][56]["indices"],phi,-1,literal_f=56)
    text="".join(DATA["translit"][x] for x in plain)
    assert text==("ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO"
                  "ITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE")
    print("p56 exact known plaintext:",text,"IoC",round(ioc(plain),8))
    for start,end in ((3,7),(8,22),(23,26)):
        cipher=[x for p in DATA["pages"][start:end+1] for x in p["indices"]]
        print(f"pp{start}-{end}: n={len(cipher)}, raw IoC={ioc(cipher):.8f}")
        for reverse in (False,True):
            for sign in (-1,1):
                out=decoded(cipher,phi,sign,reverse)
                print("  ",reverse,sign,f"IoC={ioc(out):.8f}",
                      " ".join(DATA["translit"][x] for x in out[:25]))
                assert ioc(out)<.04
    # The same stamped page p56 also supplies a fully authenticated 85-rune
    # known plaintext, a distinct frozen candidate for a repeated GP29 pad.
    # Start-aligned and end-aligned clocks follow the stamped page endings.
    print("p56 solved-plaintext key transfer: exact 85-rune key")
    for start,end in ((3,7),(8,22),(23,26)):
        cipher=[x for p in DATA["pages"][start:end+1] for x in p["indices"]]
        for from_end in (False,True):
            for sign in (-1,1):
                positions=[((len(cipher)-1-i) if from_end else i)%len(plain)
                           for i in range(len(cipher))]
                out=[(c+sign*plain[positions[i]])%29 for i,c in enumerate(cipher)]
                assert all((out[i]-sign*plain[positions[i]])%29==c
                           for i,c in enumerate(cipher))
                print(f"pp{start}-{end}: end-aligned={from_end} sign={sign:+d} "
                      f"IoC={ioc(out):.8f}",
                      " ".join(DATA["translit"][x] for x in out[:25]))
                assert ioc(out)<.04

if __name__=="__main__":main()

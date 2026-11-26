"""Original p27 weighted face-interface route and fixed p15-key inverse.
Run from repo root: python sims/lp2_p27_wing_weighted_route_fhold_sft.py
Requires numpy, scipy, opencv-python, pillow.
"""
import hashlib
import json
from collections import Counter
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources/liber-primus"
WINNER = (1,2,5,7,4,3,6,8,11,12,14,9,10,13,15)

def interfaces(g, threshold):
    n, lab, stats, cent = cv2.connectedComponentsWithStats(
        (g > threshold).astype("uint8"), connectivity=8)
    inside = [i for i in range(1,n) if stats[i,4] >= 200
              and stats[i,0] > 0 and stats[i,1] > 0
              and stats[i,0]+stats[i,2] < g.shape[1]
              and stats[i,1]+stats[i,3] < g.shape[0]]
    inside.sort(key=lambda i: cent[i,0])
    assert len(inside) == 15
    seed = np.full(g.shape,-1,dtype=np.int16)
    seed[lab == lab[0,0]] = 0
    for j,i in enumerate(inside,1):
        seed[lab == i] = j
    _, inds = distance_transform_edt(seed < 0,return_indices=True)
    v = seed[tuple(inds)]
    edges = Counter()
    for a,b in ((v[:,:-1],v[:,1:]),(v[:-1,:],v[1:,:])):
        mask = (a != b) & (a > 0) & (b > 0)
        edges.update(zip(np.minimum(a[mask],b[mask]).tolist(),
                         np.maximum(a[mask],b[mask]).tolist()))
    return edges

def paths(edges, cutoff):
    adj = {i:[] for i in range(1,16)}
    for (a,b),w in edges.items():
        if w >= cutoff:
            adj[a].append(b)
            adj[b].append(a)
    found = []
    def visit(route, seen, score):
        v = route[-1]
        if v == 15:
            if len(route) == 15:
                found.append((score,route))
            return
        for u in adj[v]:
            if u not in seen:
                visit(route+(u,),seen|{u},score+edges[tuple(sorted((u,v)))])
    visit((1,),{1},0)
    return sorted(found,reverse=True)

def enc(p,k):
    j = 0
    out = []
    for x in p:
        if x == 0:
            out.append(0)
        else:
            out.append((x+k[j])%29)
            j=(j+1)%len(k)
    return out

def inverse(c,k):
    states=[(0,[])]
    for i,x in enumerate(c):
        nxt=[]
        for j,p in states:
            if x==0:
                nxt.append((j,p+[0]))
            y=(x-k[j])%29
            if y:
                nxt.append(((j+1)%len(k),p+[y]))
        if not nxt:
            return i,sorted({j for j,_ in states}),[]
        states=nxt
    assert all(enc(p,k)==c for _,p in states)
    return None,[],states

def main():
    image=SOURCE/"44.jpg"
    assert hashlib.sha256(image.read_bytes()).hexdigest()=="c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"
    g=np.array(Image.open(image).convert("L"))[450:930,520:1940]
    for th,best,second in [(80,2394,2289),(120,2388,2281),(160,2377,2273),(200,2361,2258),(235,2357,2247)]:
        e=interfaces(g,th)
        full,cut=paths(e,1),paths(e,20)
        assert len(e)==28 and sum(w>=20 for w in e.values())==25
        assert len(full)==9 and len(cut)==4
        assert full[0]==cut[0]==(best,WINNER) and cut[1][0]==second
        assert full[0][0]>full[1][0]
        print(th, "all routes",full,"cutoff20",cut)
    primes=[3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]
    k=[(primes[i-1]-1)%29 for i in WINNER]
    assert k==[2,4,22,20,12,6,13,3,16,1,11,1,27,11,15]
    raw=(SOURCE/"lp2-corpus.json").read_bytes()
    assert hashlib.sha1(b"blob "+str(len(raw)).encode()+bytes([0])+raw).hexdigest()=="054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
    data=json.loads(raw)
    p27=data["pages"][27]["indices"][19:]
    p55=data["pages"][55]["indices"][1:]
    assert len(p27)==215 and len(p55)==75
    assert p27[9:15]==p55[69:75]==[23,11,1,17,18,10]
    for page,c in [(27,p27),(55,p55)]:
        ordinary=[(x-k[i%15])%29 for i,x in enumerate(c)]
        assert [(x+k[i%15])%29 for i,x in enumerate(ordinary)]==c
        dead,prior,states=inverse(c,k)
        if page==27:
            assert dead is None and Counter(j for j,_ in states)=={13:3,14:3}
        else:
            assert dead==60 and prior==[14] and c[dead]==k[14]==15
        print(json.dumps(dict(page=page,ordinary=ordinary,dead=dead,prior=prior,paths=states)))
    truth=data["pages"][57]["indices"]
    _,_,states=inverse(enc(truth,k),k)
    assert len(states)==16 and any(p==truth for _,p in states)
    print("95-rune known p57 plant: true full path retained, all 16 paths replay")
if __name__=="__main__":
    main()

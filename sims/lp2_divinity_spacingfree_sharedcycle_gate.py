"""Director #2974: exact fixed-DIVINITY common-alphabet necessary gate.
Run from repository root with Python 3, numpy and scipy.
No language fit, no printed-word constraint, and no use of continuation in fitting.
"""
import json
import math
import re
from itertools import combinations
from pathlib import Path
import numpy as np
from scipy.optimize import linear_sum_assignment

ROOT = Path(__file__).resolve().parents[1]
K = np.array([23, 10, 1, 10, 9, 10, 16, 26])
LABELS = np.arange(29)
SHIFTS = sorted(set(K))
ABC = "0123456789abcdefghijklmnopqrs"

def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))

def compact(s):
    return np.array([ABC.index(c) for c in s], dtype=int)

def clock(cipher, mask):
    zeros = np.flatnonzero(cipher == 0)
    holds = zeros[[bool(mask >> i & 1) for i in range(len(zeros))]]
    active = np.delete(cipher, holds)
    w = np.zeros((29, 29), dtype=np.int32)
    np.add.at(w, (active, K[np.arange(len(active)) % 8]), 1)
    forbidden = (w > 0) | ((LABELS[:, None] == 0) != (LABELS[None, :] == 0))
    r, c = linear_sum_assignment(forbidden)
    return holds, active, w, forbidden, not forbidden[r, c].any()

def collision(active):
    w = np.zeros((29, 29), dtype=np.int64)
    np.add.at(w, (active, K[np.arange(len(active)) % 8]), 1)
    return int((w * (w - 1) // 2).sum())

def domains(w):
    return {int(k): (np.flatnonzero(w[1:, k] == 0) + 1).tolist() for k in SHIFTS}

def count_partial(ds):
    ordered = sorted(ds.values(), key=len)
    def rec(i, used):
        if i == len(ordered):
            return 1
        return sum(rec(i+1, used | (1 << c)) for c in ordered[i] if not used >> c & 1)
    return rec(0, 0)

def concentration(w, forbidden, h):
    weights = np.array([w[:, (LABELS-t) % 29] for t in range(29)])
    def score(ts):
        weight = weights[list(ts)].sum(axis=0)
        r, c = linear_sum_assignment(weight - 10000 * forbidden, maximize=True)
        assert not forbidden[r,c].any()
        return int(weight[r,c].sum())
    out = []
    for k in (1, 2, 3):
        a = max(score(ts) for ts in combinations(range(1,29), k))
        b = h + (max(score(ts) for ts in combinations(range(1,29), k-1)) if k > 1 else 0)
        out.append(max(a,b))
    return out

def reference_stats(p, n, thresholds, caps):
    total = pass_f = pass_cap = pass_collision = 0
    minimum = math.inf
    maximum = 0
    min_freq = [math.inf]*3
    max_freq = [0]*3
    by_f = [[0,math.inf,0] for _ in range(4)]
    for i in range(len(p)-n+1):
        a = p[i:i+n]
        f = np.bincount(a,minlength=29)
        h = int(f[0])
        top = np.cumsum(np.sort(f)[::-1][:3]).tolist()
        min_freq = [min(x,y) for x,y in zip(min_freq,top)]
        max_freq = [max(x,y) for x,y in zip(max_freq,top)]
        st = collision(a[a != 0])
        minimum, maximum = min(minimum,st), max(maximum,st)
        total += 1
        if h in thresholds:
            pass_f += 1
            by_f[h][0] += 1
            by_f[h][1] = min(by_f[h][1],st)
            if all(x <= y for x,y in zip(top,caps[h])):
                pass_cap += 1
            if st <= thresholds[h]:
                pass_collision += 1
                by_f[h][2] += 1
    return dict(windows=total,passF=pass_f,passTop3=pass_cap,
                passCollision=pass_collision,collisionRange=[minimum,maximum],
                frequencyMin=min_freq,frequencyMax=max_freq,byF=by_f)

def main():
    g = load("resources/liber-primus/lp2-page-groups-54-55-derived.json")
    native = load("resources/external/relikd-solved-gp29-native-v1.json")
    gp = load("resources/liber-primus/lp2-corpus.json")
    c = compact("".join(g["p54"]["body_groups"][:-1]))
    h = compact(g["p54"]["body_groups"][-1] + "".join(g["p55"]["groups"]))
    assert len(c)==213 and len(h)==86
    assert np.flatnonzero(c==0).tolist()==[32,56,186]
    assert np.flatnonzero(h==0).tolist()==[25,35,51]
    # The source-label-mapped positive variant is impossible before the first visible F.
    first = next(i for i in range(np.flatnonzero(c==0)[0]) if c[i] == K[i%8])
    assert first==17
    train = []
    for mask in range(8):
        holds,a,w,f,legal = clock(c,mask)
        row = dict(mask=mask,legal=legal,holds=holds.tolist(),domains=domains(w))
        if legal:
            row.update(collision=collision(a),caps=concentration(w,f,len(holds)),
                       partialAlphabetAssignments=count_partial(row["domains"]))
            row["alphabetCount"]=row["partialAlphabetAssignments"]*math.factorial(22)
        train.append(row)
    ok = [r for r in train if r["legal"]]
    thresholds = {len(r["holds"]):r["collision"] for r in ok}
    caps = {len(r["holds"]):r["caps"] for r in ok}
    assert [r["mask"] for r in ok]==[0,3,4,7]
    assert thresholds=={0:155,2:162,1:153,3:149}
    assert caps=={0:[21,38,54],2:[22,41,58],1:[20,38,53],3:[20,39,55]}
    ix = {r:i for i,r in enumerate(native["runes"])}
    sections = {s["name"]:np.array([ix[r] for r in s["source_text"] if r in ix],dtype=int)
                for s in native["sections"]}
    refs = {k:reference_stats(p,213,thresholds,caps) for k,p in sections.items() if len(p)>=213}
    assert sum(r["windows"] for r in refs.values())==1521
    assert all(r["passCollision"]==0 for r in refs.values())
    toks=sorted(enumerate(gp["translit"]),key=lambda x:-len(x[1]))
    text=(ROOT/"resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8")
    p=[]
    for word in re.findall(r"[A-Z]+",text.upper()):
        word=word.replace("QU","CW").replace("V","U").replace("K","C").replace("Q","C").replace("Z","S").replace("ING","NG").replace("IO","IA")
        while word:
            i,t=next((i,t) for i,t in toks if word.startswith(t))
            p.append(i)
            word=word[len(t):]
    literary=reference_stats(np.array(p,dtype=int),213,thresholds,caps)
    assert len(p)==62492 and literary["windows"]==62280 and literary["passCollision"]==0
    # Two pre-generated matched-geometry independent secret-alphabet controls.
    controls=[]
    for name,start,pi in [
        ("0_welcome",133,[0,1,26,2,12,8,14,22,13,15,5,27,9,7,16,17,23,20,24,19,21,25,28,4,11,10,18,6,3]),
        ("0_koan_1",0,[0,5,15,22,8,20,13,3,9,17,24,12,18,19,14,23,27,28,26,7,4,2,6,1,16,10,11,25,21])]:
        p=sections[name][start:start+299]
        pi=np.array(pi);inv=np.argsort(pi)
        j=0;cipher=[];decoded=[]
        for v in p:
            if v==0: cipher.append(0)
            else:
                cipher.append(inv[(pi[v]+K[j%8])%29]);j+=1
        cipher=np.array(cipher)
        assert np.count_nonzero(cipher[:213]==0)==np.count_nonzero(cipher[213:]==0)==3
        j=0
        for v,x in zip(p,cipher):
            if v==0: decoded.append(0)
            else:
                decoded.append(inv[(pi[x]-K[j%8])%29]);j+=1
        assert np.array_equal(decoded,p)
        pa=p[:213];ca=cipher[:213]
        z=np.flatnonzero(ca==0)
        mask=sum(1<<i for i,v in enumerate(z) if pa[v]==0)
        _,a,w,forbidden,legal=clock(ca,mask)
        assert legal and not forbidden[LABELS,pi].any()
        st=collision(pa[pa!=0])
        assert st==collision(a)
        controls.append(dict(name=name,start=start,mask=mask,collision=st,exactInverse=True))
    # Only now evaluate the unchanged prefix domains on the separate 86-rune continuation.
    full=np.concatenate([c,h])
    continuation=[]
    for r in ok:
        for suffix in range(8):
            _,_,w,_,legal=clock(full,r["mask"]|(suffix<<3))
            if legal:
                continuation.append(dict(prefixMask=r["mask"],suffixMask=suffix,domain10=domains(w)[10]))
    assert len(continuation)==6 and all(r["prefixMask"]==3 for r in continuation)
    print(json.dumps(dict(mappedPositiveFirstContradiction=first,train=train,native=refs,
                          literary=literary,controls=controls,continuation=continuation),indent=2,
                     default=lambda x:x.item() if isinstance(x,np.generic) else x))

if __name__=="__main__":
    main()

"""Fixed source-motivated BASE29 integer page-seed receiver (Agent 9).
Run: python sims/lp2_p0_base29_rand_pagekey_sft.py
No parameter search. Python integer seed, historical float RAND byte reducer.
"""
import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def load(p):
    return json.loads((ROOT / p).read_text(encoding="utf-8"))

corpus = load("resources/liber-primus/lp2-corpus.json")
native = load("resources/external/relikd-solved-gp29-native-v1.json")
grid = load("resources/liber-primus/lp2-grid-256.json")
pages = {p["page"]: p["indices"] for p in corpus["pages"]}
opening = sum((pages[p] for p in range(3)), [])
assert len(opening) == 729 and opening[13] == 2
rows = [opening[14+i*13:27+i*13] for i in range(55)]
assert len(rows[-1]) == 13
def seed(row):
    n = 0
    for d in row:
        n = 29*n+d
    return n
seeds = {i+1:seed(row) for i,row in enumerate(rows)}
def rand_bytes(n, size):
    rng = random.Random(n)
    return [int(rng.random()*256) for _ in range(size)]
assert rand_bytes(3301, 12) == [55,55,116,110,122,151,223,204,100,157,188,134]
assert rand_bytes(4294967296,12) == [28,106,4,156,206,84,139,115,35,209,244,128]
def keys(p, n):
    return [b%29 for b in rand_bytes(seeds[p], n)]
alphabet = {r:i for i,r in enumerate(corpus["runes"])}
texts = [[alphabet[r] for r in s["source_text"] if r in alphabet] for s in native["sections"]]
counts = [[0.5]*29 for _ in range(30)]
for t in texts[:-2]:
    for a,b in zip([29]+t,t):
        counts[a][b] += 1
logs = [[math.log(29*x/sum(row)) for x in row] for row in counts]
def score(t):
    return sum(logs[a][b] for a,b in zip([29]+t,t))/len(t)
def encrypt(t,k,hold):
    out = []
    j = 0
    for p in t:
        if hold and p == 0:
            out.append(0)
        else:
            out.append((p+k[j])%29)
            j += 1
    return out
def inverse(c,k,hold):
    if not hold:
        t = [(x-y)%29 for x,y in zip(c,k)]
        return t,1
    # State merges preserve total path count and best complete likelihood.
    states = {(0,29):(0.0,(),1)}
    for x in c:
        next_states = {}
        for (j,prev),(s,t,n) in states.items():
            choices = []
            if x == 0:
                choices.append((j,0))
            p = (x-k[j])%29
            if p != 0:
                choices.append((j+1,p))
            for jj,p in choices:
                a = (jj,p)
                ss = s+logs[prev][p]
                old = next_states.get(a)
                if old is None:
                    next_states[a] = (ss,t+(p,),n)
                elif ss > old[0]:
                    next_states[a] = (ss,t+(p,),old[2]+n)
                else:
                    next_states[a] = (old[0],old[1],old[2]+n)
        states = next_states
        if not states:
            return None,0
    return list(max(states.values(),key=lambda v:v[0])[1]),sum(v[2] for v in states.values())
def ioc(t):
    return sum(t.count(r)*(t.count(r)-1) for r in range(29))/(len(t)*(len(t)-1))
def preview(t):
    return "".join(corpus["translit"][r] for r in t[:60])
def summarize(records):
    good = [x for x in records if x["paths"]]
    n = sum(x["n"] for x in good)
    return {"pages":len(records),"legal_pages":len(good),"legal_runes":n,
            "weighted_score":sum(x["score"]*x["n"] for x in good)/n if n else None,
            "top":sorted(good,key=lambda x:x["score"],reverse=True)[:2]}
results = {}
for hold in [False,True]:
    records=[]
    for p in range(3,56):
        if p==50:
            continue
        c=pages[p]
        k=keys(p,len(c))
        t,n=inverse(c,k,hold)
        rec={"p":p,"n":len(c),"paths":n}
        if n:
            assert encrypt(t,k,hold)==c
            rec.update(score=score(t),ioc=ioc(t),preview=preview(t))
        records.append(rec)
    plants=[]
    for p,t in zip([3,54],texts[-2:]):
        k=keys(p,len(t))
        c=encrypt(t,k,hold)
        v,n=inverse(c,k,hold)
        assert n and encrypt(v,k,hold)==c
        plants.append({"p":p,"n":len(t),"paths":n,"true_score":score(t),
                       "best_score":score(v),"exact":v==t})
    results[str(hold)]={"development":summarize([x for x in records if x["p"]<=39]),
                       "continuation":summarize([x for x in records if x["p"]>=40]),
                       "plants":plants}
actual=next(p["bytes"] for p in grid["pages"] if p["page"]==50)
pred=rand_bytes(seeds[50],len(actual))
assert len(actual)==104
results["p50"]={"seed":seeds[50],"n":len(actual),"matches":sum(a==b for a,b in zip(actual,pred)),
                "actual_prefix":actual[:12],"predicted_prefix":pred[:12]}
print("RESULT_JSON="+json.dumps(results,separators=(",",":")))

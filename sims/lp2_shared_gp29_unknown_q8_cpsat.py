"""Blind strict common-cycle q8 CSP. No independent phase bijections.
Requires ortools. See https://or-tools.github.io/docs/python/classortools_1_1sat_1_1python_1_1cp__model_1_1CpModel.html
"""
import argparse
import hashlib
import json
import random
import re
from collections import defaultdict
from pathlib import Path

from ortools.sat.python import cp_model

ROOT = Path(__file__).resolve().parents[1]
INPUTS = {
    "resources/liber-primus/lp2-corpus.json": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
    "resources/liber-primus/lp2-transcription.txt": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7",
    "resources/external/relikd-solved-gp29-native-v1.json": "1b064ef6d85819b7d96adaff31a82d1ec551598f",
    "resources/control/english_wordfreq_textblob.txt": "140e1d22b5f8c45deddd2e8b25549d9d6307d938",
    "resources/control/gibran_prophet_58585.txt": "df260a07d56bf5998d40a6360b6132c35c252d10",
    "resources/control/emerson_essays_2944.txt": "a92be8ba5b3511a003a22ba31523c14397aaa83a",
}
N = 29
Q = 8
TRAIN = 49

def read(name):
    raw = (ROOT / name).read_bytes()
    assert hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest() == INPUTS[name], name
    return raw.decode("utf-8")

def load():
    gp, trans, native, lex, *donors = [read(name) for name in INPUTS]
    gp = json.loads(gp)
    idx = {r: i for i, r in enumerate(gp["runes"])}
    alpha = {s: i for i, s in enumerate(gp["translit"])}
    def parse(s):
        return [tuple(idx[x] for x in w) for w in re.findall(r"[\u16a0-\u16ff]+", s)]
    def variants(s):
        s = s.upper().replace("QU", "CW").replace("V", "U").replace("K", "C").replace("Q", "C").replace("Z", "S")
        def walk(i):
            if i == len(s):
                yield ()
                return
            for n in (1, 2, 3):
                t = s[i:i+n]
                if len(t) != n:
                    continue
                v = alpha.get("NG") if n == 3 and t == "ING" else alpha.get(t) if n < 3 else None
                if v is not None:
                    for tail in walk(i+n):
                        yield (v,) + tail
        yield from walk(0)
    all_groups = parse(re.sub(r"[\s/%]", "", trans))
    cipher = all_groups[2830:2896]
    assert len(all_groups) == 2941 and len(cipher) == 66
    assert [x for w in cipher for x in w] == gp["pages"][54]["indices"] + gp["pages"][55]["indices"]
    assert sum(map(len, cipher[:TRAIN])) == 222
    assert sum(map(len, cipher[:TRAIN+1])) == 233
    native_pool = [w for sec in json.loads(native)["sections"] for w in parse(sec["source_text"])]
    dictionary = set(native_pool)
    for line in lex.splitlines():
        m = re.fullmatch(r"([a-z]+)\s+(\d+)", line)
        if m:
            dictionary.update(variants(m[1]))
    assert len(dictionary) == 38938 and len(native_pool) == 740
    by = defaultdict(list)
    for w in sorted(dictionary):
        by[len(w)].append(w)
    pools = []
    for donor in donors:
        donor = re.split(r"\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*", donor, maxsplit=1, flags=re.I)[-1]
        donor = re.split(r"\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*", donor, maxsplit=1, flags=re.I)[0]
        types = {v for s in set(re.findall(r"[a-z]+", donor.lower())) for v in variants(s) if v in dictionary}
        pool = defaultdict(list)
        for w in sorted(types):
            pool[len(w)].append(w)
        pools.append(pool)
    return cipher, dictionary, by, pools, gp["translit"]

def effective_maps(pi, key):
    inverse = [0]*N
    for i, x in enumerate(pi):
        inverse[x] = i
    return tuple(tuple(inverse[(pi[c] - k) % N] for c in range(N)) for k in key)

def encode(word, pi, key, phase):
    inv = [0]*N
    for i, x in enumerate(pi):
        inv[x] = i
    c = []
    for p in word:
        if p == 0:
            c.append(0)
        else:
            c.append(inv[(pi[p] + key[phase]) % N])
            phase = (phase+1) % Q
    return tuple(c)

def decode(word, pi, key, dictionary):
    maps = effective_maps(pi, key)
    out = set()
    for start in range(Q):
        def rec(i, phase, p):
            if i == len(word):
                if p in dictionary:
                    assert encode(p, pi, key, start) == word
                    out.add(p)
                return
            c = word[i]
            if c == 0:
                rec(i+1, phase, p+(0,))
            v = maps[phase][c]
            if v:
                rec(i+1, (phase+1)%Q, p+(v,))
        rec(0, start, ())
    return out

def plant(cipher, pool, seed):
    rng = random.Random(seed)
    coords = list(range(1,N))
    rng.shuffle(coords)
    pi = [0] + coords
    key = [1] + [rng.randrange(N) for _ in range(Q-1)]
    while key[:4] == key[4:]:
        key = [1] + [rng.randrange(N) for _ in range(Q-1)]
    truth = [rng.choice(pool[len(w)]) for w in cipher]
    phases = [rng.randrange(Q) for _ in cipher]
    encrypted = [encode(w, pi, key, s) for w,s in zip(truth,phases)]
    return encrypted, truth, pi, key

def automaton(words, length, wildcard):
    """Minimal acyclic dictionary automaton; optional first-bit wildcard branch."""
    levels = [set() for _ in range(length+1)]
    for w in words:
        for i in range(length+1):
            levels[i].add(w[:i])
    state = {w:0 for w in levels[length]}
    arcs = []
    counter = 1
    for i in range(length-1,-1,-1):
        children = defaultdict(list)
        for w in levels[i+1]:
            children[w[:-1]].append((w[-1], state[w]))
        canonical = {}
        for w in sorted(levels[i]):
            signature = tuple(sorted(children[w]))
            if signature not in canonical:
                canonical[signature] = counter
                arcs.extend((counter,label,child) for label,child in signature)
                counter += 1
            state[w] = canonical[signature]
    start = state[()]
    if wildcard:
        first = counter
        counter += 1
        arcs.append((first,0,start))
        arcs.append((first,1,counter))
        for j in range(length):
            dst = 0 if j == length-1 else counter+1
            arcs.extend((counter,label,dst) for label in range(N))
            counter += 1
        start = first
    return start, [0], arcs

def build(cipher, by, budget, fixed=None, blocked=None):
    m = cp_model.CpModel()
    pi = [m.new_int_var(0,N-1,f"pi_{i}") for i in range(N)]
    inverse = [m.new_int_var(0,N-1,f"inv_{i}") for i in range(N)]
    key = [m.new_int_var(0,N-1,f"k_{i}") for i in range(Q)]
    m.add_inverse(pi,inverse)
    m.add_all_different(pi)
    m.add(sum(pi)==N*(N-1)//2)
    m.add(pi[0]==0)
    m.add(key[0]==1)
    differences = []
    for j in range(Q//2):
        neq = m.new_bool_var(f"primitive_{j}")
        m.add(key[j]!=key[j+4]).only_enforce_if(neq)
        m.add(key[j]==key[j+4]).only_enforce_if(~neq)
        differences.append(neq)
    m.add_bool_or(differences)
    if fixed:
        for var,val in zip(pi+key,fixed[0]+fixed[1]):
            m.add(var==val)
    if blocked:
        m.add_forbidden_assignments(pi+key,blocked)
    # One shared inverse permutation plus 8 coordinate shifts, no independent maps.
    maps = [[m.new_int_var(0,N-1,f"map_{j}_{c}") for c in range(N)] for j in range(Q)]
    for j in range(Q):
        m.add_all_different(maps[j])
        for c in range(N):
            shifted = m.new_int_var(0,N-1,f"coord_{j}_{c}")
            wrap = m.new_bool_var(f"wrap_{j}_{c}")
            m.add(shifted == pi[c]-key[j]+N*wrap)
            m.add_element(shifted,inverse,maps[j][c])
    flags, plains, starts = [], [], []
    dfas = {}
    for g, word in enumerate(cipher):
        phase = m.new_int_var(0,Q-1,f"phase_{g}_0")
        starts.append(phase)
        ps = []
        for i,c in enumerate(word):
            p = m.new_int_var(0 if c==0 else 1,N-1,f"p_{g}_{i}")
            ps.append(p)
            candidates = [maps[j][c] for j in range(Q)]
            if c==0:
                hold = m.new_bool_var(f"hold_{g}_{i}")
                value = m.new_int_var(0,N-1,f"value_{g}_{i}")
                m.add_element(phase,candidates,value)
                m.add(p==0).only_enforce_if(hold)
                m.add(p==value).only_enforce_if(~hold)
                m.add(p>=1).only_enforce_if(~hold)
                step = 1-hold
            else:
                m.add_element(phase,candidates,p)
                step = 1
            if i+1<len(word):
                nxt = m.new_int_var(0,Q-1,f"phase_{g}_{i+1}")
                wrap = m.new_bool_var(f"pwrap_{g}_{i}")
                m.add(nxt==phase+step-Q*wrap)
                phase = nxt
        plains.append(ps)
        if len(word) not in dfas:
            dfas[len(word)] = automaton(by[len(word)],len(word),budget>0)
        start,ends,arcs = dfas[len(word)]
        if budget:
            flag=m.new_bool_var(f"oov_{g}")
            flags.append(flag)
            m.add_automaton([flag]+ps,start,ends,arcs)
        else:
            m.add_automaton(ps,start,ends,arcs)
    if flags:
        m.add(sum(flags)<=budget)
    error = m.validate()
    assert not error,error
    return m,pi,key,plains,starts,flags

def solve(cipher, by, budget, seconds, workers, seed, fixed=None, blocked=None):
    m,pi,key,ps,starts,flags = build(cipher,by,budget,fixed,blocked)
    solver=cp_model.CpSolver()
    solver.parameters.max_time_in_seconds=seconds
    solver.parameters.num_search_workers=workers
    solver.parameters.random_seed=seed
    status=solver.solve(m)
    out={"status":solver.status_name(status),"seconds":solver.wall_time,"branches":solver.num_branches,"conflicts":solver.num_conflicts}
    if status in (cp_model.FEASIBLE,cp_model.OPTIMAL):
        out.update(pi=[solver.value(v) for v in pi],key=[solver.value(v) for v in key],words=[tuple(solver.value(v) for v in w) for w in ps],starts=[solver.value(v) for v in starts],declared_oov=sum(solver.value(f) for f in flags))
        assert all(encode(w,out["pi"],out["key"],s)==c for w,s,c in zip(out["words"],out["starts"],cipher))
    return out

def rotations(pi,key):
    # Any phase rotation with nonzero first shift can be normalized to k0=1.
    rows=[]
    for j,k in enumerate(key):
        if k:
            inv=pow(k,-1,N)
            rows.append(tuple(x*inv%N for x in pi+key[j:]+key[:j]))
    return rows

def evaluate(out,cipher,dictionary,truth=None,true_pi=None,true_key=None):
    if "pi" not in out:
        return out
    pi,key=out["pi"],out["key"]
    hold=[decode(w,pi,key,dictionary) for w in cipher[TRAIN:]]
    out["train_supported"]=sum(w in dictionary for w in out["words"])
    out["holdout_supported"]=sum(bool(v) for v in hold)
    out["holdout_candidates"]=[sorted(v) for v in hold]
    if truth is not None:
        out["effective_exact"]=tuple(pi+key) in rotations(true_pi,true_key)
        out["holdout_truth"]=sum(w in v for w,v in zip(truth[TRAIN:],hold))
        out["holdout_unique_truth"]=sum(v=={w} for w,v in zip(truth[TRAIN:],hold))
    return out

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--case",choices=["gibran","emerson","original"],required=True)
    parser.add_argument("--seconds",type=float,default=480)
    parser.add_argument("--workers",type=int,default=2)
    args=parser.parse_args()
    original,dictionary,by,pools,alphabet=load()
    if args.case=="original":
        cipher=original
        truth=pi=key=None
        budget=3
        seed=3301
    else:
        i=0 if args.case=="gibran" else 1
        seed=[3301,20141125][i]
        cipher,truth,pi,key=plant(original,pools[i],seed)
        budget=0
    out={"case":args.case,"seed":seed,"training_groups":TRAIN,"training_runes":222,"holdout_groups":66-TRAIN,"dictionary":len(dictionary),"budget":budget}
    if truth is not None:
        # Separate fixed-map feasibility test; the blind solve below receives no truth, hints or fixed assignments.
        oracle=solve(cipher[:TRAIN],by,budget,30,args.workers,seed,fixed=(pi,key))
        out["oracle"]={k:v for k,v in oracle.items() if k not in ("pi","key","words","starts")}
        assert "pi" in oracle,"fixed-map model not feasible"
    blind=solve(cipher[:TRAIN],by,budget,args.seconds,args.workers,seed)
    out["blind"]=evaluate(blind,cipher,dictionary,truth,pi,key)
    if "pi" in blind:
        alternate=solve(cipher[:TRAIN],by,budget,min(args.seconds,120),args.workers,seed+1,blocked=rotations(blind["pi"],blind["key"]))
        out["alternative"]=evaluate(alternate,cipher,dictionary,truth,pi,key)
    print(json.dumps(out,separators=(",",":")),flush=True)

if __name__=="__main__":
    main()

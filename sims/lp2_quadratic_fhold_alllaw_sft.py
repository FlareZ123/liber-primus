"""All 1,624 normalized quadratic laws: exact seven-rare-symbol exclusion.
Run with Python (NumPy/SciPy/Numba) and g++ on PATH, or --cover-exe PATH
to an executable compiled from lp2_quadratic_fhold_alllaw_cover.cpp.
"""
import argparse
import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from lp2_quadratic_fhold_rare_capacity_sft import (
    ROOT, Q, TAPE_SHA, DONORS, build, encode, pair_conflicts, upper_certificate
)

CAP = 8
LIMIT = 163  # 232-163=69 > Gibran/Shakespeare seven-rarest maxima 68/54.

def rare_max(donor, n, k=7):
    h = [0] * Q
    for c in donor[:n]:
        h[c] += 1
    best = sum(sorted(h[1:])[:k])
    for i in range(n, len(donor)):
        h[donor[i-n]] -= 1
        h[donor[i]] += 1
        best = max(best, sum(sorted(h[1:])[:k]))
    return len(donor)-n+1, best

def model(t, w, u, v):
    E, _, off, N = build(t, w, u, v)
    n = len(E)
    H = np.stack([e[3] for e in E])
    U = np.array([e[0] for e in E])
    V = np.array([e[1] for e in E])
    mins = np.full((N, Q*Q), 10000, dtype=np.int16)
    mins[:Q] = 0
    for i, (a, z, _, _) in enumerate(E):
        mins[z] = np.minimum(mins[z], mins[a]+H[i])
    valid = np.flatnonzero(mins[off:].min(axis=0)==0)
    nvar = n+len(valid)
    forbid = {c:n+i for i,c in enumerate(valid)}
    A,b = [],[]
    def add(terms, rhs):
        A.append([(int(i),int(k)) for i,k in terms])
        b.append(int(rhs))
    for r in range(Q):
        f = [f for c,f in forbid.items() if c//Q==r]
        add([(k,1) for k in f],CAP)
        add([(k,-1) for k in f],-1)
    conflicts = pair_conflicts(U,V,H,valid,off,N)
    adj = [set() for _ in valid]
    for i,j in conflicts:
        adj[i].add(j)
        adj[j].add(i)
    cliques = set()
    for i in range(len(valid)):
        for j in sorted(adj[i]):
            if j<i:
                continue
            clique,cand = [i,j],adj[i]&adj[j]
            while cand:
                k=max(cand,key=lambda k:(len(cand&adj[k]),-k))
                clique.append(k)
                cand&=adj[k]
            cliques.add(tuple(sorted(clique)))
    for clique in sorted(cliques):
        add([(n+i,1) for i in clique],1)
    # The n edge variables have zero objective and no constraints here.
    # Dropping joint flow is a safe relaxation; exact pair exclusions are retained.
    return nvar,n,A,b,[],[]

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--cover-exe",type=Path)
    ap.add_argument("--save",type=Path)
    args=ap.parse_args()
    corpus=json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
    t=[c for p in corpus["pages"] if 40<=p["page"]<=53 for c in p["indices"]]
    assert len(t)==3008 and t.count(0)==125 and hashlib.sha256(bytes(t)).hexdigest()==TAPE_SHA
    tape="".join("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"[c] for c in t)
    with tempfile.TemporaryDirectory() as tmp:
        exe=args.cover_exe.resolve() if args.cover_exe else Path(tmp)/("cover.exe" if os.name=="nt" else "cover")
        if not args.cover_exe:
            subprocess.run(["g++","-O3","-std=c++17",str(Path(__file__).with_name("lp2_quadratic_fhold_alllaw_cover.cpp")),"-o",str(exe)],check=True)
        raw=subprocess.run([str(exe)],input=tape+"\n",text=True,capture_output=True,check=True).stdout
    rows=[list(map(int,line.split())) for line in raw.splitlines()]
    expected=[(m,u,v) for m in range(2) for u in range(1,Q) for v in range(Q)]
    assert [tuple(row[:3]) for row in rows]==expected and all(len(row)==18 for row in rows)
    covers=[row[12] for row in rows]
    assert hashlib.sha256(bytes(covers)).hexdigest()=="5dcb8a6508742bbb6ac6b3bd7ff705ab2f1be6c1706f900064336345d3e2cecf"
    survivors=[tuple(row[:3]) for row in rows if row[12]>LIMIT]
    assert [sum(m==i for m,_,_ in survivors) for i in range(2)]==[67,78]
    print("Cheap cover excludes",len(rows)-len(survivors),"of",len(rows),flush=True)
    certs={}
    for m,u,v in survivors:
        w=corpus["prime"] if m else list(range(Q))
        cert=upper_certificate(model(t,w,u,v))
        assert cert["floor"]<=LIMIT,(m,u,v,cert["floor"])
        certs[f"{m},{u},{v}"]=cert
        print(m,u,v,cert["numerator"],cert["denominator"],"cap",cert["floor"],flush=True)
    print("LP max integer caps",*[max(c["floor"] for k,c in certs.items() if k.startswith(f"{m},")) for m in range(2)])
    donors=[encode((ROOT/"resources/control"/name).read_text(encoding="utf8"),corpus["translit"]) for name in DONORS]
    assert [rare_max(d,3008) for d in donors]==[(59485,68),(214099,54)]
    print("Every one of the 1624 laws forces seven rarest non-F counts >=69.")
    print("All 273584 pinned donor windows excluded under all normalized laws.")
    if args.save:
        args.save.write_text(json.dumps({"cover_U8":covers,"certificates":certs},separators=(",",":")))

if __name__=="__main__":
    main()

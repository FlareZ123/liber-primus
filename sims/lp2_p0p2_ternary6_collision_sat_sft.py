"""LP2 p0-p2: all-secret stationary GP29->trit B(3,6) collision SAT.

Any cyclic de Bruijn B(3,6) of length729 has all 729 six-trit
windows distinct. For each pair of original six-rune windows, at least
one aligned rune-identity pair must receive different trit classes.
These exact necessary clauses require no proposed key, language score,
or reversible cipher. A single UNSAT subset rejects ALL 3^29 maps.

Planted positive distributes all29 rune identities over an actual
B(3,6), with the known map rune%3. UNSAT alone is an exclusion.
SAT on a prefix is merely feasible for that prefix and cannot be
promoted to a source mapping. UNKNOWN is inconclusive.

Run on Windows: python sims/lp2_p0p2_ternary6_collision_sat_sft.py
Dependency: z3-solver, original resources/liber-primus/lp2-corpus.json.
"""
from __future__ import annotations

from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
from time import monotonic
from z3 import BitVec, Or, Solver, ULT, sat, unsat

ROOT = Path(__file__).resolve().parents[1]
gp = json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
pages = [gp["pages"][i]["indices"] for i in range(3)]
source = [c for page in pages for c in page]
assert list(map(len,pages)) == [262,266,201]
assert len(source)==729 and set(source)==set(range(29))
N = len(source)


def fkm(k: int=3, n: int=6) -> list[int]:
    a=[0]*(k*n+1)
    out=[]
    def visit(t: int, p: int) -> None:
        if t>n:
            if n%p==0:
                out.extend(a[1:p+1])
            return
        a[t]=a[t-p]
        visit(t+1,p)
        for x in range(a[t-p]+1,k):
            a[t]=x
            visit(t+1,t)
    visit(1,1)
    return out


def cyclic_six(sequence: list[int]) -> list[tuple[int,...]]:
    return [tuple(sequence[(i+j)%N] for j in range(6)) for i in range(N)]


trits=fkm()
assert len(trits)==N and len(set(cyclic_six(trits)))==N
bins=[[i for i in range(29) if i%3==v] for v in range(3)]
used=[0,0,0]
planted=[]
for v in trits:
    planted.append(bins[v][used[v]%len(bins[v])])
    used[v]+=1
assert set(planted)==set(range(29))
assert len(set(cyclic_six([r%3 for r in planted])))==N


def source_collision_clauses(tape: list[int]) -> tuple[list[tuple[tuple[int,int],...]],dict]:
    windows=cyclic_six(tape)
    clauses=set()
    by_width=Counter()
    for i in range(N):
        wi=windows[i]
        for j in range(i+1,N):
            wj=windows[j]
            terms=tuple(sorted({(min(a,b),max(a,b))
                                for a,b in zip(wi,wj) if a!=b}))
            if not terms:
                raise AssertionError(f"Two identical source six-rune windows at {i}, {j}")
            clauses.add(terms)
    ordered=sorted(clauses,key=lambda c:(len(c),c))
    by_width.update(map(len,ordered))
    return ordered,{"source_window_pairs":N*(N-1)//2,"unique_necessary_clauses":len(ordered),
                    "clause_widths":dict(sorted(by_width.items()))}


def test() -> None:
    clauses,counts=source_collision_clauses(source)
    # A constructed genuine 29-symbol version must satisfy every clause.
    positive,positive_stats=source_collision_clauses(planted)
    assert all(any(a%3!=b%3 for a,b in clause) for clause in positive)
    assert len(set(cyclic_six(planted)))==N
    letters=[BitVec(f"r{i}",2) for i in range(29)]
    solver=Solver()
    solver.set(timeout=180_000)
    for x in letters:
        solver.add(ULT(x,3))
    solver.add(letters[0]==0)
    atom={(a,b):letters[a]!=letters[b] for a in range(29) for b in range(a+1,29)}
    stages=[]
    start_index=0
    limits=sorted(set(min(len(clauses),n) for n in [500,2000,8000,32000,100000,len(clauses)]))
    status="INCONCLUSIVE"
    for limit in limits:
        for terms in clauses[start_index:limit]:
            solver.add(Or(*[atom[t] for t in terms]))
        start_index=limit
        started=monotonic()
        verdict=solver.check()
        elapsed=round(monotonic()-started,3)
        row={"clauses":limit,"status":str(verdict),"seconds":elapsed}
        if verdict==sat:
            model=solver.model()
            mapping=[model.eval(x).as_long() for x in letters]
            occupied=len(set(cyclic_six([mapping[r] for r in source])))
            row["sixtrit_unique_windows"]=occupied
        stages.append(row)
        print(f"original window clauses={limit}/{len(clauses)} status={verdict}"
              f" elapsed={elapsed}s distinct6={row.get('sixtrit_unique_windows','n/a')}",flush=True)
        if verdict==unsat:
            status="UNSAT"
            break
        if verdict!=sat:
            status="INCONCLUSIVE"
            break
        if limit==len(clauses):
            status="SAT"
    print(json.dumps({"source":"original LP2 physical p0-p2",
          "gp29_sha256":sha256(bytes(source)).hexdigest(),
          "length":len(source),"page_rune_lengths":list(map(len,pages)),
          "positive":"genuine B(3,6), all29 symbol classes present, exact",
          "positive_clause_count":len(positive),"source_clause_statistics":counts,
          "test_stages":stages,"status":status,
          "meaning":"UNSAT is an all-class source-specific exclusion; SAT must verify all windows."
          },indent=2))
    if status=="SAT":
        assert stages[-1]["sixtrit_unique_windows"]==N
        print("AUTHENTIC ORIGINAL CYCLIC B(3,6) TERNARY CLASS MAPPING FOUND",flush=True)
    if status=="INCONCLUSIVE":
        raise RuntimeError("resource/time bound: undecided; no cipher or plaintext recovered")


if __name__=="__main__":
    test()

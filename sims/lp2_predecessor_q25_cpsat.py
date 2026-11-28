#!/usr/bin/env python3
"""Exact q=25 feasibility gate for arbitrary predecessor-conditioned GP29 bijections."""

import json
from pathlib import Path
from ortools.sat.python import cp_model

A = 29
F = 0
START = 5283
ROOT = Path(__file__).resolve().parents[1]

corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
text = (ROOT / "resources/control/gibran_prophet_58585.txt").read_text()

tokens = sorted([(s, i) for i, s in enumerate(corpus["translit"])], key=lambda z: -len(z[0]))

def gp(src):
    import re
    words = re.findall(r"[A-Z]+", src.upper().replace("QU", "CW").replace("V", "U").replace("K", "C").replace("Q", "C").replace("Z", "S"))
    out = []
    for word in words:
        i = 0
        while i < len(word):
            if word.startswith("ING", i):
                out.append(21); i += 3; continue
            if word.startswith("IO", i):
                out.append(27); i += 2; continue
            for sym, value in tokens:
                if word.startswith(sym, i):
                    out.append(value); i += len(sym); break
            else:
                raise ValueError(f"unmapped GP token at {word[i:]}")
    return out

cipher = []
page_starts = set()
off = 0
for page in corpus["pages"]:
    if page["page"] <= 55 and page["indices"]:
        page_starts.add(off)
        cipher.extend(page["indices"])
        off += len(page["indices"])
assert len(cipher) == 12956

plain = gp(text)
local = [[[False] * A for _ in range(A)] for _ in range(A)]
for i in range(1, len(cipher)):
    if i in page_starts:
        continue
    x = plain[START + i]
    if x == F or plain[START + i - 1] == F:
        continue
    local[cipher[i - 1]][x][cipher[i]] = True

m = cp_model.CpModel()

# p[u,v,r] maps local successor ciphertext label v to global output label r.
p = [[[m.new_bool_var(f"p_{u}_{v}_{r}") for r in range(A)] for v in range(A)] for u in range(A)]
for u in range(A):
    for v in range(A):
        m.add_exactly_one(p[u][v])
    for r in range(A):
        m.add_exactly_one(p[u][v][r] for v in range(A))

# Global output labels are arbitrary, so fix predecessor-0 relabeling to identity.
for v in range(A):
    m.add(p[0][v][v] == 1)

# miss[x,r] means transformed observed union has no edge x->r.
# F plaintext positions were intentionally omitted, so only x=1..28 matter.
miss = [[None] * A for _ in range(A)]
for x in range(1, A):
    for r in range(A):
        miss[x][r] = m.new_bool_var(f"miss_{x}_{r}")
    m.add(sum(miss[x][r] for r in range(A)) >= 4)  # row degree <=25
for r in range(A):
    m.add(sum(miss[x][r] for x in range(1, A)) >= 3)  # column degree <=25 over 28 observed rows

# If u maps v -> r and local relation contains x -> v, x -> r cannot be missing.
edge_count = 0
for u in range(A):
    for x in range(1, A):
        for v in range(A):
            if not local[u][x][v]:
                continue
            edge_count += 1
            for r in range(A):
                m.add(p[u][v][r] + miss[x][r] <= 1)

solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = 600
solver.parameters.num_search_workers = 8
solver.parameters.log_search_progress = True
status = solver.solve(m)

name = solver.status_name(status)
print(json.dumps({
    "status": name,
    "start": START,
    "distinct_local_edges": edge_count,
    "wall_time": solver.wall_time,
    "branches": solver.num_branches,
    "conflicts": solver.num_conflicts,
}, indent=2))

if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
    perms = []
    for u in range(A):
        perm = []
        for v in range(A):
            perm.append(next(r for r in range(A) if solver.value(p[u][v][r])))
        perms.append(perm)
    missing = {
        str(x): [r for r in range(A) if solver.value(miss[x][r])]
        for x in range(1, A)
    }
    print("Q25_WITNESS=" + json.dumps({"permutations": perms, "missing": missing}, separators=(",", ":")))

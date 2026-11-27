"""Exact integer-checked LP upper certificate for fixed p39 quadratic F-hold receiver.
Run from repo root: python sims/lp2_quadratic_fhold_rare_capacity_sft.py
Dependencies: numpy, scipy, numba. Optional --certificate FILE verifies saved duals
instead of optimizing. Optional --save FILE records newly generated duals.
"""
import argparse
import base64
import zlib
import hashlib
import json
import re
from pathlib import Path

import numpy as np
import scipy.sparse as sp
from scipy.optimize import linprog
from numba import njit

Q = 29
ROOT = Path(__file__).resolve().parents[1]
TAPE_SHA = "260fc1ff6eee3d7a108ed43d5b8112cc5c332fa2f4460e71c563ad504de2a6b7"
DONORS = ("gibran_prophet_58585.txt", "shakespeare_first300k.txt")

def build(t, w):
    states = list(range(Q))
    off, N, E, layers, a = 0, Q, [], [], 0
    while a < len(t):
        b = a + 1
        while b < len(t) and t[b] != 0:
            b += 1
        es, nxt = [], []
        for z, s in enumerate(states):
            for hold in range(1 + (t[a] == 0)):
                k = s
                h = np.zeros(Q * Q, dtype=np.int16)
                for i in range(a, b):
                    c = t[i]
                    if i == a and hold:
                        continue
                    h[k * Q + c] += 1
                    k = (k * k + 15 * w[c] + 17) % Q
                if k not in nxt:
                    nxt.append(k)
                es.append((off + z, N + nxt.index(k), hold, h))
        layers.append(list(range(len(E), len(E) + len(es))))
        E += es
        off, N, states, a = N, N + len(nxt), nxt, b
    return E, layers, off, N

@njit
def pair_conflicts(U, V, H, valid, off, N):
    out = []
    for i in range(len(valid)):
        c = valid[i]
        for j in range(i + 1, len(valid)):
            d = valid[j]
            reach = np.zeros(N, np.uint8)
            reach[:Q] = 1
            for e in range(len(U)):
                if reach[U[e]] and not H[e, c] and not H[e, d]:
                    reach[V[e]] = 1
            if not reach[off:].any():
                out.append((i, j))
    return out

def model(t, w):
    E, L, off, N = build(t, w)
    n = len(E)
    H = np.stack([e[3] for e in E])
    U = np.array([e[0] for e in E])
    V = np.array([e[1] for e in E])
    mins = []
    for c in range(Q * Q):
        lo = np.full(N, 10000)
        lo[:Q] = 0
        for e, (s, k, _, _) in enumerate(E):
            lo[k] = min(lo[k], lo[s] + H[e, c])
        mins.append(lo[off:].min())
    valid = np.flatnonzero(np.array(mins) == 0)
    nvar = n + len(valid)
    forbid = {c: n + i for i, c in enumerate(valid)}
    A, b, D, d = [], [], [], []
    def add(terms, rhs, eq=False):
        (D if eq else A).append([(int(i), int(v)) for i, v in terms])
        (d if eq else b).append(int(rhs))
    add([(i, 1) for i in L[0]], 1, True)
    incoming, outgoing = [[] for _ in range(N)], [[] for _ in range(N)]
    for i, (s, k, _, _) in enumerate(E):
        outgoing[s].append(i)
        incoming[k].append(i)
    for s in range(Q, off):
        add([(i, 1) for i in incoming[s]] + [(i, -1) for i in outgoing[s]], 0, True)
    for r in range(Q):
        f = [f for c, f in forbid.items() if c // Q == r]
        add([(k, 1) for k in f], 5)
        add([(k, -1) for k in f], -1)
    for c, f in forbid.items():
        for es in L:
            affected = [i for i in es if H[i, c]]
            if affected:
                add([(i, 1) for i in affected] + [(f, 1)], 1)
    conflicts = pair_conflicts(U, V, H, valid, off, N)
    for i, j in conflicts:
        add([(n + i, 1), (n + j, 1)], 1)
    adj = [set() for _ in valid]
    for i, j in conflicts:
        adj[i].add(j)
        adj[j].add(i)
    cliques = set()
    for i in range(len(valid)):
        for j in sorted(adj[i]):
            if j < i:
                continue
            clique, cand = [i, j], adj[i] & adj[j]
            while cand:
                k = max(cand, key=lambda k: (len(cand & adj[k]), -k))
                clique.append(k)
                cand &= adj[k]
            if len(clique) > 2:
                cliques.add(tuple(sorted(clique)))
    for clique in sorted(cliques):
        add([(n + i, 1) for i in clique], 1)
    print("conflicts", len(conflicts), "cliques", len(cliques), flush=True)
    return nvar, n, A, b, D, d

def sparse(rows, n):
    r, c, v = [], [], []
    for i, terms in enumerate(rows):
        for j, k in terms:
            r.append(i)
            c.append(j)
            v.append(k)
    return sp.csc_matrix((v, (r, c)), shape=(len(rows), n))

def upper_certificate(m, cert=None):
    nvar, n, A, b, D, d = m
    if cert is None:
        obj = np.zeros(nvar)
        obj[n:] = -1
        res = linprog(obj, A_ub=sparse(A, nvar), b_ub=b,
                      A_eq=sparse(D, nvar), b_eq=d, bounds=(0, 1), method="highs")
        assert res.success, res.message
        S = 10**6
        y = [max(0, round(-v * S)) for v in res.ineqlin.marginals]
        z = [round(-v * S) for v in res.eqlin.marginals]
        cert = dict(nvar=nvar, edges=n, inequalities=len(A), equalities=len(D),
                    lp=-res.fun, denominator=S,
                    dual_ub=[[i, v] for i, v in enumerate(y) if v],
                    dual_eq=[[i, v] for i, v in enumerate(z) if v])
    assert (cert["nvar"], cert["edges"], cert["inequalities"], cert["equalities"]) == (nvar, n, len(A), len(D))
    S = cert["denominator"]
    assert isinstance(S, int) and S > 0
    y, z = [0] * len(A), [0] * len(D)
    for pairs, out in ((cert["dual_ub"], y), (cert["dual_eq"], z)):
        for i, v in pairs:
            assert type(i) is int and 0 <= i < len(out) and type(v) is int
            assert not out[i]
            out[i] = v
    assert all(v >= 0 for v in y)
    coeff, ub = [0] * n + [S] * (nvar - n), 0
    for rows, rhs, prices in ((A, b, y), (D, d, z)):
        for terms, bb, p in zip(rows, rhs, prices):
            ub += bb * p
            for k, v in terms:
                coeff[k] -= v * p
    ub += sum(max(0, v) for v in coeff)
    if "numerator" in cert:
        assert cert["numerator"] == ub
    cert.update(numerator=ub, floor=ub // S)
    return cert

def encode(raw, translit):
    s = raw.upper().replace("QU", "CW").replace("V", "U").replace("K", "C").replace("Q", "C").replace("Z", "S")
    words = re.findall("[A-Z]+", s)
    tokens = sorted(enumerate(translit), key=lambda t: -len(t[1]))
    out = []
    for word in words:
        i = 0
        while i < len(word):
            if word.startswith("ING", i):
                out.append(21)
                i += 3
            elif word.startswith("IO", i):
                out.append(27)
                i += 2
            else:
                k, token = next((k, tok) for k, tok in tokens if word.startswith(tok, i))
                out.append(k)
                i += len(token)
    return out

def rare_max(donor, n):
    h = [0] * Q
    for c in donor[:n]:
        h[c] += 1
    best = sum(sorted(h[1:])[:4])
    for i in range(n, len(donor)):
        h[donor[i-n]] -= 1
        h[donor[i]] += 1
        best = max(best, sum(sorted(h[1:])[:4]))
    return len(donor)-n+1, best

def plant(plain, w, seed):
    rng = np.random.default_rng(seed)
    pi = np.stack([rng.permutation(Q) for _ in range(Q)])
    inverse = np.argsort(pi, axis=1)
    s = seed % Q
    cipher, holds = [], []
    h = np.zeros((Q, Q), dtype=int)
    for p in plain:
        hold = p == 0
        c = 0 if hold else int(inverse[s, p])
        cipher.append(c)
        holds.append(hold)
        if not hold:
            h[s, c] += 1
            s = (s*s + 15*w[c] + 17) % Q
    E, L, off, _ = build(cipher, w)
    node = seed % Q
    total = np.zeros(Q*Q, dtype=int)
    a = 0
    for es in L:
        hold = holds[a]
        idx = next(i for i in es if E[i][0] == node and E[i][2] == hold)
        _, node, _, hist = E[idx]
        total += hist
        a += 1
        while a < len(cipher) and cipher[a] != 0:
            a += 1
    assert a == len(cipher) and node >= off and np.array_equal(total.reshape(Q,Q), h)
    decoded, s = [], seed % Q
    for c, hold in zip(cipher, holds):
        p = 0 if hold else int(pi[s, c])
        decoded.append(p)
        if not hold:
            s = (s*s + 15*w[c] + 17) % Q
    assert decoded == list(plain)
    u = int(np.minimum(5, np.count_nonzero(h == 0, axis=1)).sum())
    assert np.all(np.count_nonzero(h == 0, axis=1) >= 1)
    rare = sum(sorted(np.bincount(plain, minlength=Q)[1:])[:4])
    assert rare >= 145-u
    print("known-key plant", seed, len(plain), "rare", int(rare), "bound", 145-u)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--certificate", type=Path)
    ap.add_argument("--save", type=Path)
    args = ap.parse_args()
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
    t = [c for p in corpus["pages"] if 40 <= p["page"] <= 53 for c in p["indices"]]
    assert len(t) == 3008 and t.count(0) == 125
    assert hashlib.sha256(bytes(t)).hexdigest() == TAPE_SHA
    saved = json.loads(args.certificate.read_text()) if args.certificate else {}
    if saved.get("encoding") == "zlib-base64-json":
        saved = {name: json.loads(zlib.decompress(base64.b64decode(saved[name]))) for name in ("ordinal", "prime")}
    out = {}
    for name, w in (("ordinal", list(range(Q))), ("prime", corpus["prime"])):
        cert = upper_certificate(model(t, w), saved.get(name))
        assert cert["floor"] <= {"ordinal": 101, "prime": 95}[name]
        out[name] = cert
        print(name, {k:v for k,v in cert.items() if not k.startswith("dual")}, "rare >=", 145-cert["floor"], flush=True)
    donors = [encode((ROOT / "resources/control" / name).read_text(encoding="utf8"), corpus["translit"]) for name in DONORS]
    assert [len(d) for d in donors] == [62492, 217106]
    assert [rare_max(d, len(t)) for d in donors] == [(59485,13),(214099,12)]
    for i, w in enumerate((list(range(Q)), corpus["prime"])):
        for j, donor in enumerate(donors):
            plant(donor[1000:4008], w, 41 + 2*i+j)
    print("All 273584 windows excluded by each exact certificate.")
    if args.save:
        args.save.write_text(json.dumps(out, separators=(",",":")))

if __name__ == "__main__":
    main()

"""Exact period-16 GP5 -> ASCII7 feasibility on the source five-dot order.

Run from repository root: python sims/lp2_p7_fivedot_period16_ascii_sat_sft.py
Requires z3-solver. The saved witnesses were obtained with Z3 4.13.3 native C
API; this portable Python frontend constructs the equivalent bitvector system.
"""
import hashlib
import json
import random
from pathlib import Path

import z3

ROOT = Path(__file__).resolve().parents[1]
RAW = json.loads((ROOT / "im-results/lp2-p7-fivedot-period16-ascii-sat.json").read_text())
corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
C = [x for p in corpus["pages"] if 8 <= p["page"] <= 14 for x in p["indices"]]
assert len(C) == 1729 and min(C) >= 0 and max(C) == 28
C.insert(692, -1)
D = [C[346 * [2, 4, 0, 3, 1][i % 5] + i // 5] for i in range(1730)]
assert D.pop(0) == -1
assert hashlib.sha256(bytes(D)).hexdigest() == RAW["source_sha256"]

PUNCT = ' .,;:\'"!?()-'
ALLOWED = {
    "printable": set(range(32, 127)),
    "mixed": set(map(ord, PUNCT)) | set(range(65, 91)) | set(range(97, 123)) | set(range(48, 58)),
    "upper": set(map(ord, PUNCT)) | set(range(65, 91)) | set(range(48, 58)),
    "lower": set(map(ord, PUNCT)) | set(range(97, 123)) | set(range(48, 58)),
}

def decode(tape, key):
    assert len(tape) == 1729 and len(key) == 16
    assert all(len(row) == len(set(row)) == 29 for row in key)
    bits = "".join(f"{key[i % 16][r]:05b}" for i, r in enumerate(tape))
    chars = [int(bits[i:i + 7], 2) for i in range(0, len(bits), 7)]
    rebuilt = "".join(f"{x:07b}" for x in chars)
    assert [key[(i // 5) % 16].index(int(rebuilt[i:i + 5], 2))
            for i in range(0, len(rebuilt), 5)] == tape
    return chars

def solve(tape, mode):
    solver = z3.SolverFor("QF_BV")
    solver.set(timeout=120000)
    key = [[z3.BitVec(f"k{p}_{r}", 5) for r in range(29)] for p in range(16)]
    for row in key:
        solver.add(z3.Distinct(*row))
    for j in range(1235):
        pieces = []
        left, pos = 7, 7 * j
        while left:
            i, t = divmod(pos, 5)
            n = min(5 - t, left)
            pieces.append(z3.Extract(4 - t, 5 - t - n, key[i % 16][tape[i]]))
            left -= n
            pos += n
        a = z3.Concat(*pieces)
        if mode == "printable":
            solver.add(z3.UGE(a, 32), z3.ULE(a, 126))
        else:
            ranges = {"mixed": [(65, 90), (97, 122), (48, 57)],
                      "upper": [(65, 90), (48, 57)],
                      "lower": [(97, 122), (48, 57)]}[mode]
            solver.add(z3.Or(*[z3.And(z3.UGE(a, lo), z3.ULE(a, hi)) for lo, hi in ranges],
                             *[a == ord(ch) for ch in PUNCT]))
    status = solver.check()
    if status == z3.sat:
        model = solver.model()
        candidate = [[model.eval(k).as_long() for k in row] for row in key]
        chars = decode(tape, candidate)
        assert set(chars) <= ALLOWED[mode]
    return str(status)

def fixed_xor(values):
    key = [[r ^ (v % 32) for r in range(29)] for v in values]
    chars = decode(D, key)
    return sum(32 <= x <= 126 for x in chars)

assert fixed_xor([3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]) == 918
assert fixed_xor([p - 1 for p in [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]]) == 911

for mode, encoded in RAW["witnesses"].items():
    flat = [int(x, 32) for x in encoded]
    assert len(flat) == 464
    chars = decode(D, [flat[i:i+29] for i in range(0, 464, 29)])
    assert set(chars) <= ALLOWED[mode]
    print("saved witness", mode, len(chars), "exact roundtrip")

for mode in ("printable", "mixed", "upper", "lower"):
    status = solve(D, mode)
    print("original", mode, status)
    assert status == RAW["status"][mode]

phrase = ("AN END. WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO. IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE. LIKE THE INSTAR, TUNNELING TO THE SURFACE. WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE. " * 10)[:1235]
bits = "".join(f"{ord(x):07b}" for x in phrase)
chunks = [int(bits[i:i+5], 2) for i in range(0, len(bits), 5)]
rng = random.Random(3301)
key = []
for phase in range(16):
    row = sorted(set(chunks[phase::16]))
    assert len(row) <= 29
    row.extend(rng.sample(sorted(set(range(32)) - set(row)), 29-len(row)))
    rng.shuffle(row)
    key.append(row)
plant = [key[i%16].index(x) for i,x in enumerate(chunks)]
assert decode(plant,key) == list(map(ord,phrase))
assert solve(plant, "upper") == "sat"
print("known-phrase plant upper sat; exact planted key roundtrip")

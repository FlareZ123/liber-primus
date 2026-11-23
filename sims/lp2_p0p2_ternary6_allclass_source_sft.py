"""Original LP2 p0-p2 exact 3^6 ternary de Bruijn all-class source gate.

The 729 GP29 runes across physical p0, p1, p2 invite B(3,6).
Test *every* fixed mapping of all 29 original rune identities into three
trits, without fitting plaintext, a phase, a page reset, or a key.
For a cyclic B(3,6), every ordered trit d-gram occurs 3^(6-d)
times for d=1,...,6. These are necessary conditions. At d=6
all 729 words must be distinct.

Positive control substitutes all 29 runes into a genuine B(3,6),
with exact known trit map rune%3, and checks the same constraints.
Any UNSAT on the unmodified original at any depth is definitive for
this narrow static-symbol hypothesis. UNKNOWN is inconclusive.

Run in a repo checkout: python sims/lp2_p0p2_ternary6_allclass_source_sft.py
Requires z3-solver, original resources/liber-primus/lp2-corpus.json.
"""
from __future__ import annotations

from collections import Counter
from hashlib import sha256
from itertools import product
import json
from pathlib import Path
from time import monotonic

from z3 import And, Distinct, If, Int, Solver, Sum, sat, unsat

ROOT = Path(__file__).resolve().parents[1]
GP = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
PAGES = [GP["pages"][j]["indices"] for j in range(3)]
SOURCE = [r for page in PAGES for r in page]
N = 729
assert [len(p) for p in PAGES] == [262, 266, 201]
assert len(SOURCE) == 3**6
assert set(SOURCE) == set(range(29))


def de_bruijn(k: int, n: int) -> list[int]:
    """Lexicographic FKM cyclic de Bruijn construction."""
    registers = [0] * (k * n + 1)
    output: list[int] = []

    def visit(t: int, p: int) -> None:
        if t > n:
            if n % p == 0:
                output.extend(registers[1 : p + 1])
            return
        registers[t] = registers[t - p]
        visit(t + 1, p)
        for value in range(registers[t - p] + 1, k):
            registers[t] = value
            visit(t + 1, t)

    visit(1, 1)
    return output


def ngrams(tape: list[int], order: int) -> Counter[tuple[int, ...]]:
    return Counter(
        tuple(tape[(start + offset) % len(tape)] for offset in range(order))
        for start in range(len(tape))
    )


TRITS = de_bruijn(3, 6)
assert len(TRITS) == N
assert len(ngrams(TRITS, 6)) == N
assert all(set(ngrams(TRITS, d).values()) == {3 ** (6 - d)} for d in range(1, 7))

# Use every one of the original 29 rune identities as a real printed
# glyph while preserving a known class mapping of rune -> rune%3.
planted_bins = [[r for r in range(29) if r % 3 == t] for t in range(3)]
planted_counts = [0, 0, 0]
PLANTED: list[int] = []
for trit in TRITS:
    bin_ = planted_bins[trit]
    PLANTED.append(bin_[planted_counts[trit] % len(bin_)])
    planted_counts[trit] += 1
assert set(PLANTED) == set(range(29))
assert [r % 3 for r in PLANTED] == TRITS


def add_gram_constraints(solver: Solver, letters: list, tape: list[int], depth: int) -> int:
    """Necessary exact d-gram occupancies, no hidden alphabet fitted."""
    source_counts = ngrams(tape, depth)
    per_pattern = 3 ** (6 - depth)
    for target in product(range(3), repeat=depth):
        terms = [
            count * If(And(*(letters[r] == v for r, v in zip(gram, target))), 1, 0)
            for gram, count in source_counts.items()
        ]
        solver.add(Sum(terms) == per_pattern)
    return len(source_counts)


def check(name: str, tape: list[int], fixed: bool) -> dict:
    letters = [Int(f"{name}_r{i}") for i in range(29)]
    solver = Solver()
    solver.set(timeout=120_000)
    for letter in letters:
        solver.add(letter >= 0, letter <= 2)
    solver.add(letters[0] == 0)  # Trit-label symmetry is exact.
    if fixed:
        for r in range(29):
            solver.add(letters[r] == r % 3)
    steps = []
    for d in (1, 2, 3, 4):
        size = add_gram_constraints(solver, letters, tape, d)
        start = monotonic()
        verdict = solver.check()
        seconds = round(monotonic() - start, 3)
        steps.append({"depth": d, "source_distinct_grams": size, "result": str(verdict), "seconds": seconds})
        print(f"{name} depth={d} source_unique={size} result={verdict} secs={seconds}", flush=True)
        if verdict == unsat:
            assert not fixed, "Positive-control grammar incorrectly UNSAT."
            return {"name": name, "status": "UNSAT", "first_impossible_depth": d, "stages": steps}
        if verdict != sat:
            return {"name": name, "status": "INCONCLUSIVE", "first_unknown_depth": d, "stages": steps}

    # Every 6-trit word is a base-3 integer from 0 to 728. Since there
    # are exactly 729 cyclic positions, these must all be distinct.
    weights = [3 ** (5 - j) for j in range(6)]
    window_ids = [
        Sum([weights[j] * letters[tape[(i + j) % N]] for j in range(6)])
        for i in range(N)
    ]
    solver.add(Distinct(*window_ids))
    start = monotonic()
    verdict = solver.check()
    seconds = round(monotonic() - start, 3)
    steps.append({"depth": 6, "result": str(verdict), "seconds": seconds})
    print(f"{name} depth=6 debruijn_uniqueness={verdict} secs={seconds}", flush=True)
    if fixed:
        assert verdict == sat, "Known planted ternary de Bruijn word must be SAT."
    if verdict == sat:
        model = solver.model()
        classes = [model.eval(letters[r]).as_long() for r in range(29)]
        mapped = [classes[r] for r in tape]
        assert len(ngrams(mapped, 6)) == N
        status = "SAT"
    else:
        classes = None
        status = "UNSAT" if verdict == unsat else "INCONCLUSIVE"
    return {"name": name, "status": status, "first_impossible_depth": 6 if verdict == unsat else None,
            "trit_class_mapping": classes, "stages": steps}


def main() -> None:
    positive = check("planted", PLANTED, fixed=True)
    assert positive["status"] == "SAT"
    original = check("original", SOURCE, fixed=False)
    print(json.dumps({
        "original_gp29_sha256": sha256(bytes(SOURCE)).hexdigest(),
        "original_physical_page_rune_lengths": [len(p) for p in PAGES],
        "original_distinct_gp_symbols": len(set(SOURCE)),
        "original_cyclic_distinct_original_sixgrams": len(ngrams(SOURCE, 6)),
        "positive": positive, "original": original,
        "scope": "Only one stationary rune->trit class map and cyclic page-continuous B(3,6). No other cryptographic architecture excluded, no plaintext recovered."
    }, indent=2))
    if original["status"] == "INCONCLUSIVE":
        raise RuntimeError("Z3 reached a time/resource limit; original source not adjudicated.")


if __name__ == "__main__":
    main()

"""Exhaustive original LP2 p8 3^5 de Bruijn static rune-class impossibility.

Use a Python environment containing the official Z3Py package "z3-solver".
The full source-original GP29 243-rune body is projected by an *arbitrary*
single, fixed 29-to-3 rune-class function. The model requires each of 243
cyclic five-trit windows to occur exactly once. The solver decides ALL
3^29 possible class assignments symbolically, without key enumeration.

Run as a single test file on Windows 11 / Windows GitHub Actions:
    python sims/lp2_p8_debruijn_allclass_exact_sft.py

This excludes ONLY the literal intact p8 black-body cyclic de Bruijn
interpretation with a fixed per-rune trit class. It does not exclude
keyed, contextual, changing, or differently ordered maps, or decrypt LP2.

Original source: resources/liber-primus/lp2-corpus.json and
resources/liber-primus/lp2-ink-annotations.json.
"""
from __future__ import annotations

from collections import Counter
from hashlib import sha256
from itertools import combinations
import json
from pathlib import Path
from time import monotonic

from z3 import Int, Solver, sat, unsat

ROOT = Path(__file__).resolve().parents[1]
gp = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(
    encoding="utf-8"))
ink = json.loads((ROOT / "resources/liber-primus/lp2-ink-annotations.json").read_text(
    encoding="utf-8"))

p7 = gp["pages"][7]["indices"]
p8 = gp["pages"][8]["indices"]
p8_red = next(p for p in ink["pages"] if p["page"] == 8)["red_spans"]
assert len(p8) == 255
assert [(span["start"], span["length"]) for span in p8_red] == [(0, 12)]
assert p7[194:] == [23, 3, 22, 16, 2, 25, 5, 7, 11, 14, 28, 6, 28, 19]
body = p8[12:]
assert len(body) == 243
assert sorted(set(body)) == list(range(29))


def cyclic_windows(sequence: list[int], order: int = 5) -> list[tuple[int, ...]]:
    """Return all length-order cyclic windows in original source order."""
    return [
        tuple(sequence[(i + j) % len(sequence)] for j in range(order))
        for i in range(len(sequence))
    ]


def de_bruijn(k: int = 3, n: int = 5) -> list[int]:
    """Generate a constructive positive control by the FKM algorithm."""
    a = [0] * (k * n + 1)
    out: list[int] = []

    def recurse(t: int, p: int) -> None:
        if t > n:
            if n % p == 0:
                out.extend(a[1 : p + 1])
        else:
            a[t] = a[t - p]
            recurse(t + 1, p)
            for j in range(a[t - p] + 1, k):
                a[t] = j
                recurse(t + 1, t)

    recurse(1, 1)
    return out


def minimal_window_clauses(
    sequence: list[int],
) -> tuple[list[tuple[tuple[int, int], ...]], int]:
    """CNF clauses requiring at least one unequal trit in every pair of windows.

    Pairwise distinct 5-windows iff for every pair of original windows,
    at least one corresponding *rune identity* is assigned distinct trits.
    A pair of identical rune identities contributes no requirement.

    Duplicate and subsumed clauses are removed by exact Boolean absorption,
    preserving all models. The longest clauses contain only five pairs.
    """
    windows = cyclic_windows(sequence)
    all_clauses: set[tuple[tuple[int, int], ...]] = set()
    for i, left in enumerate(windows):
        for right in windows[i + 1 :]:
            clause = tuple(sorted({
                tuple(sorted((a, b)))
                for a, b in zip(left, right)
                if a != b
            }))
            assert clause, "Identical source 5-gram immediately forbids the cycle"
            all_clauses.add(clause)

    minimal: set[tuple[tuple[int, int], ...]] = set()
    for clause in sorted(all_clauses, key=lambda c: (len(c), c)):
        if any(
            subset in minimal
            for width in range(1, len(clause))
            for subset in combinations(clause, width)
        ):
            continue
        minimal.add(clause)
    return sorted(minimal, key=lambda c: (len(c), c)), len(all_clauses)


def to_smt2(
    sequence: list[int],
) -> tuple[str, dict[str, int]]:
    """Construct complete model as SMT-LIB2 using Z3 native parser.

    Each of 29 rune identities has exactly one unrestricted trit [0..2].
    x0=0 is without loss: any mapping has a permutation of the trit labels
    that assigns rune identity 0 to trit 0 (all 29 original runes occur).
    The 3 exact occurrence counts 81 are necessary for any B(3,5).
    """
    assert len(sequence) == 243
    assert all(0 <= r < 29 for r in sequence)
    counts = Counter(sequence)
    clauses, raw_count = minimal_window_clauses(sequence)
    result = []
    for i in range(29):
        result.append(f"(declare-const x{i} Int)")
        result.append(f"(assert (and (<= 0 x{i}) (<= x{i} 2)))")
    result.append("(assert (= x0 0))")
    for color in range(3):
        terms = " ".join(
            f"(* {counts.get(i, 0)} (ite (= x{i} {color}) 1 0))"
            for i in range(29)
            if counts.get(i, 0)
        )
        result.append(f"(assert (= 81 (+ {terms})))")
    for clause in clauses:
        terms = " ".join(f"(distinct x{a} x{b})" for a, b in clause)
        result.append(f"(assert (or {terms}))")
    stats = {
        "raw_pairwise_clauses": raw_count,
        "subsumption_minimal_clauses": len(clauses),
        "source_distinct_5_rune_windows": len(set(cyclic_windows(sequence))),
        "source_distinct_runes": len(counts),
    }
    return "\n".join(result), stats


def check(
    source: list[int], expected: str, name: str
) -> tuple[dict[str, int | str | float], list[int] | None]:
    """Run exact SAT on the complete source condition, never heuristic."""
    smt, stats = to_smt2(source)
    solver = Solver()
    solver.set(timeout=180_000)
    solver.from_string(smt)
    start = monotonic()
    result = solver.check()
    duration = monotonic() - start
    if result not in (sat, unsat):
        raise RuntimeError(f"{name} solver unknown: {solver.reason_unknown()}")
    assert str(result) == expected, f"{name}: expected {expected}, got {result}"
    mapping: list[int] | None = None
    if result == sat:
        model = solver.model()
        # Original uses all 29 symbols, planted positive uses only three.
        mapping = [model.eval(Int(f"x{i}"), model_completion=True).as_long()
                   for i in range(29)]
        mapped = [mapping[i] for i in source]
        assert Counter(mapped) == Counter({0: 81, 1: 81, 2: 81})
        assert len(set(cyclic_windows(mapped))) == 243
    return {
        "name": name,
        "status": str(result),
        "seconds": round(duration, 3),
        "smt_bytes": len(smt.encode("utf-8")),
        **stats,
    }, mapping


def main() -> None:
    planted = de_bruijn()
    assert len(planted) == 243
    assert len(set(cyclic_windows(planted))) == 243
    positive, witness = check(planted, "sat", "planted genuine B(3,5)")
    assert witness is not None
    original, no_witness = check(body, "unsat", "untouched p8 black243")
    assert no_witness is None
    print(json.dumps({
        "result": "EXACT UNSAT: no static 29-rune to 3-trit map makes intact original p8 black body a cyclic B(3,5)",
        "original_sha256_gpindex_bytes": sha256(bytes(body)).hexdigest(),
        "original_length": len(body),
        "source_red_prefix_length": 12,
        "source_29_rune_counts": [body.count(i) for i in range(29)],
        "positive": positive,
        "original": original,
        "scope": "A fixed symbolwise, context-independent ternary map in original rune order and cyclic wrap only. No assertion about other operations, page orders or recovered plaintext."
    }, indent=2))


if __name__ == "__main__":
    main()

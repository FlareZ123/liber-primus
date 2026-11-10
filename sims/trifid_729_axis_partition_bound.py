"""All-secret upper bound for 729-period standard Trifid on original LP2.

Fix GP IA/EA direct passthrough, remove them and use 27 remaining glyphs.
A secret 3x3x3 cube assigns nine glyphs to each ternary coordinate value.
For any one plaintext rune, three target coordinates have one of five
color-equality patterns. Optimize each original ciphertext coordinate-axis
class independently, relaxing the secret cube's cross-axis consistency.
The independent maximum upper bounds every possible 27! secret cube.

The final 362 runes are conservatively allowed to match the target freely.
Any upper bound below 1404 excludes that target-rank pattern as direct
Shakespeare-style GP-English (see existing 27-cube bound report).
Requires Google OR-Tools CP-SAT: developers.google.com/optimization/install
"""
from collections import Counter
import json
import math
import os
from pathlib import Path
from ortools.sat.python import cp_model

PERIOD = 729
SYMBOLS = 27
PATTERNS = {
    "all_equal": (0, 0, 0),
    "01_equal": (0, 0, 1),
    "02_equal": (0, 1, 0),
    "12_equal": (1, 0, 0),
    "all_distinct": (0, 1, 2),
}


def original_core():
    root = Path(__file__).resolve().parents[1]
    source = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
    runes = [
        glyph
        for page in source["pages"] if page["page"] < 56
        for glyph in page["indices"] if glyph not in (27, 28)
    ]
    assert len(runes) == 12026 and all(0 <= glyph < 27 for glyph in runes)
    return runes


def axis_source_triples(runes):
    full_blocks, remaining = divmod(len(runes), PERIOD)
    axis_counts = [Counter() for _ in range(3)]
    for offset in range(0, full_blocks * PERIOD, PERIOD):
        block = runes[offset:offset + PERIOD]
        for position in range(PERIOD):
            # Under standard Trifid inverse, output-rune digit k draws
            # ciphertext digit at (k*PERIOD+position).
            triple = tuple(block[(k * PERIOD + position) // 3] for k in range(3))
            axis_counts[position % 3][triple] += 1
    assert full_blocks == 16 and remaining == 362
    assert [sum(c.values()) for c in axis_counts] == [3888, 3888, 3888]
    return axis_counts, remaining


def plant():
    """Exercise the exact source coordinate map with a hidden cube."""
    cube = [(7 * i) % 27 for i in range(27)]
    inverse = {glyph: i for i, glyph in enumerate(cube)}
    plain = [18 if i % 7 == 0 else (13 * i + 5) % 27 for i in range(12026)]
    ciphertext = []
    for offset in range(0, len(plain), PERIOD):
        block = plain[offset:offset + PERIOD]
        n = len(block)
        digits = []
        for glyph in block:
            rank = inverse[glyph]
            digits.extend((rank // 9, rank // 3 % 3, rank % 3))
        mixed = [digits[3 * (k % n) + k // n] for k in range(3 * n)]
        ciphertext.extend(cube[9 * mixed[3 * i] + 3 * mixed[3 * i + 1] + mixed[3 * i + 2]]
                          for i in range(n))
    assert len(ciphertext) == len(plain)
    rank = inverse[18]
    desired = (rank // 9, rank // 3 % 3, rank % 3)
    full = (len(plain) // PERIOD) * PERIOD
    matches = 0
    for offset in range(0, full, PERIOD):
        block = ciphertext[offset:offset + PERIOD]
        for position in range(PERIOD):
            axis = position % 3
            triple = [block[(k * PERIOD + position) // 3] for k in range(3)]
            observed = tuple((inverse[glyph] // (9 if axis == 0 else 3 if axis == 1 else 1)) % 3
                             for glyph in triple)
            matches += observed == desired
    expected = plain[:full].count(18)
    assert expected == matches, (expected, matches)
    return {"planted_runes": len(plain), "full_prefix": full,
            "source_native_18_matches": expected, "verified_matches": matches,
            "planted_rank": rank, "target_digits": desired}


def optimize_axis(counts, pattern, max_seconds):
    model = cp_model.CpModel()
    labels = [[model.new_bool_var(f"glyph{g}_color{c}") for c in range(3)]
              for g in range(SYMBOLS)]
    for row in labels:
        model.add_exactly_one(row)
    for color in range(3):
        model.add(sum(labels[g][color] for g in range(SYMBOLS)) == 9)
    objective = []
    impossible = 0
    for index, (triple, multiplicity) in enumerate(counts.items()):
        checks = list(zip(triple, pattern))
        if any(g0 == g1 and c0 != c1
               for i, (g0, c0) in enumerate(checks)
               for g1, c1 in checks[i + 1:]):
            impossible += multiplicity
            continue
        checks = sorted(set(checks))
        if len(checks) == 1:
            hit = labels[checks[0][0]][checks[0][1]]
        else:
            hit = model.new_bool_var(f"observed_triplet{index}")
            for glyph, color in checks:
                model.add(hit <= labels[glyph][color])
        objective.append(multiplicity * hit)
    model.maximize(sum(objective))
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = max_seconds
    solver.parameters.num_search_workers = 4
    solver.parameters.random_seed = 3301
    status = solver.solve(model)
    complete_or_feasible = status in (cp_model.OPTIMAL, cp_model.FEASIBLE)
    if complete_or_feasible:
        # Every weight is integral; rounding upward is deliberately conservative.
        ceiling = min(sum(counts.values()),
                      math.ceil(solver.best_objective_bound + 1e-6))
        assert solver.objective_value <= ceiling
    else:
        ceiling = sum(counts.values())  # Unknown never becomes a claimed rejection.
    return {
        "status": solver.status_name(status),
        "best_feasible": solver.objective_value if complete_or_feasible else None,
        "certified_upper": ceiling,
        "unconditionally_impossible_events": impossible,
        "distinct_observed_triples": len(counts),
        "wall_seconds": round(solver.wall_time, 3),
    }


def main():
    limit = float(os.environ.get("TRIFID729_SECONDS_PER_AXIS", "18"))
    classes, free_tail = axis_source_triples(original_core())
    print("POSITIVE " + json.dumps(plant()), flush=True)
    conclusions = {}
    for name, pattern in PATTERNS.items():
        bounds = []
        for axis in range(3):
            report = optimize_axis(classes[axis], pattern, limit)
            print("AXIS " + json.dumps({"pattern": name, "axis": axis, **report}), flush=True)
            bounds.append(report["certified_upper"])
        upper = free_tail + sum(bounds)
        conclusions[name] = upper
        print("PATTERN " + json.dumps({"pattern": name, "rune_e_upper": upper,
              "minimum_source_english_e": 1404, "excluded": upper < 1404}), flush=True)
    print("RESULT " + json.dumps({
        "source_runes": 12026, "complete_full_block_runes": 11664,
        "free_tail": free_tail, "direction": "standard", "period": PERIOD,
        "by_pattern": conclusions,
        "all_secret_27_cube_direct_gp_excluded": all(n < 1404 for n in conclusions.values()),
        "interpretation": "Bounded original-input native-GP necessary condition; no genuine unknown plaintext recovered"
    }), flush=True)


if __name__ == "__main__":
    main()

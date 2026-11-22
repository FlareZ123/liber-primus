"""CP-SAT exact independent solver for 79/78 prime-linked numeric-packing gate.

For a secret fixed 29-rune cyclic order, predecessor-exclusion emits 28 digits.
At every clean 79-digit packet start, the first two radix28 digits are
lexicographically bounded by [15, 12] = leading digits of 29**78 - 1.
This uses no English, known key, planted source, or plaintext assertion.

Usage is via the manual LP2 adaptive radix-28 CI workflow.
An INFEASIBLE result is an exact proof; UNKNOWN leaves the case unresolved.
"""
from __future__ import annotations

import json
import os
import random
from pathlib import Path
from ortools.sat.python import cp_model

ALPHABET = 29
PACKET = 79
LIMIT = 29 ** 78
PREFIX = []
number = LIMIT - 1
for _ in range(PACKET):
    PREFIX.append(number % 28)
    number //= 28
PREFIX.reverse()
assert PREFIX[:2] == [15, 12]


def clean_starts(cipher: list[int], phase: int) -> list[int]:
    return [
        start
        for start in range(phase, len(cipher) - PACKET + 1, PACKET)
        if start > 0
        and all(cipher[i] != cipher[i - 1] for i in range(start, start + PACKET))
    ]


def triples(cipher: list[int], starts: list[int], direction: str) -> list[tuple[int, int, int]]:
    if direction == "forward":
        return list(dict.fromkeys(
            (cipher[s - 1], cipher[s], cipher[s + 1]) for s in starts))
    return list(dict.fromkeys(
        (cipher[s + 77], cipher[s + 78], cipher[s + 76]) for s in starts))


def valid(order: list[int], t: tuple[int, int, int], direction: str) -> bool:
    a, b, c = t
    d0 = (order[b] - order[a] - 1) % 29
    d1 = ((order[c] - order[b] - 1) if direction == "forward"
          else (order[a] - order[c] - 1)) % 29
    return d0 < 15 or (d0 == 15 and d1 <= 12)


def allowed_table(t: tuple[int, int, int], direction: str) -> tuple[list[int], list[tuple[int, ...]]]:
    glyphs = list(dict.fromkeys(t))
    tuples: list[tuple[int, ...]] = []
    for x in range(29):
        for delta in range(1, 17):
            y = (x + delta) % 29
            for z in range(29):
                if t[2] == t[0] and z != x:
                    continue
                if t[2] == t[1] and z != y:
                    continue
                if t[2] != t[0] and z == x:
                    continue
                if t[2] != t[1] and z == y:
                    continue
                trial = {t[0]: x, t[1]: y, t[2]: z}
                if not valid([trial.get(i, -1) for i in range(29)], t, direction):
                    continue
                tuples.append(tuple(trial[glyph] for glyph in glyphs))
    return glyphs, tuples


def solve(glyphs: list[int], phase: int, direction: str, seconds: float) -> dict:
    starts = clean_starts(glyphs, phase)
    constraints = triples(glyphs, starts, direction)
    model = cp_model.CpModel()
    pos = [model.new_int_var(0, 28, f"pos{i}") for i in range(29)]
    model.add_all_different(pos)
    model.add(pos[0] == 0)
    for t in constraints:
        unique, allowed = allowed_table(t, direction)
        model.add_allowed_assignments([pos[i] for i in unique], allowed)
    worker = cp_model.CpSolver()
    worker.parameters.max_time_in_seconds = seconds
    worker.parameters.num_search_workers = 8
    worker.parameters.random_seed = 330179
    status = worker.solve(model)
    name = worker.status_name(status)
    result = {
        "phase": phase, "direction": direction, "cleanPackets": len(starts),
        "distinctTriples": len(constraints), "status": name,
        "elapsedSeconds": worker.wall_time,
        "branches": worker.num_branches,
        "conflicts": worker.num_conflicts,
    }
    if status in (cp_model.FEASIBLE, cp_model.OPTIMAL):
        order = [worker.value(p) for p in pos]
        assert len(set(order)) == 29
        assert all(valid(order, t, direction) for t in constraints)
        all_valid = 0
        for s in starts:
            digits = [
                (order[glyphs[i]] - order[glyphs[i - 1]] - 1) % 29
                for i in range(s, s + 79)
            ]
            if direction == "reverse":
                digits.reverse()
            n = 0
            for digit in digits:
                n = n * 28 + digit
            all_valid += n < LIMIT
        result["fullPacketsValidUnderWitness"] = all_valid
        result["order"] = order
    print("CPSAT_RESULT", json.dumps(result, sort_keys=True), flush=True)
    return result


def plant() -> None:
    rng = random.Random(33017928)
    order = list(range(29))
    rng.shuffle(order)
    back = [0] * 29
    for symbol, pos in enumerate(order):
        back[pos] = symbol
    encoded: list[int] = []
    prev = 7
    for _ in range(12):
        n = 0
        for _ in range(78):
            n = n * 29 + rng.randrange(29)
        digits = [0] * 79
        for j in range(78, -1, -1):
            digits[j] = n % 28
            n //= 28
        assert n == 0
        for digit in digits:
            prev = back[(order[prev] + digit + 1) % 29]
            encoded.append(prev)
    starts = clean_starts(encoded, 0)
    assert len(starts) == 11
    assert all(valid(order, t, "forward") for t in triples(encoded, starts, "forward"))
    # A hidden-order positive must be feasible under exactly the same constraints.
    result = solve(encoded, 0, "forward", 120)
    assert result["status"] in ("FEASIBLE", "OPTIMAL")


def main() -> None:
    import ortools

    data = json.loads((Path(__file__).parent.parent /
        "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    page_sequences = [list(p["indices"]) for p in data["pages"]
                      if p["page"] < 56 and p["indices"]]
    shuffle_seed = int(os.environ.get("PAGE_SHUFFLE_SEED", "0"))
    if shuffle_seed:
        random.Random(shuffle_seed).shuffle(page_sequences)
    cipher = [x for page in page_sequences for x in page]
    assert len(cipher) == 12956
    first = int(os.environ.get("PHASE_START", "55"))
    last = int(os.environ.get("PHASE_END", str(first)))
    direction = os.environ.get("PREFIX_TWO_DIRECTION", "forward")
    seconds = float(os.environ.get("CPSAT_SECONDS", "540"))
    assert 0 <= first <= last < 79 and direction in ("forward", "reverse", "both")
    assert 1 <= seconds <= 720
    print("CPSAT_ENV", json.dumps({"ortools": ortools.__version__,
        "phaseStart": first, "phaseEnd": last, "direction": direction,
        "maxSecondsPerCase": seconds,
        "wholePageShuffleSeed": shuffle_seed}), flush=True)
    plant()
    counts = {"OPTIMAL": 0, "FEASIBLE": 0, "INFEASIBLE": 0, "UNKNOWN": 0}
    for phase in range(first, last + 1):
        directions = ("forward", "reverse") if direction == "both" else (direction,)
        for orientation in directions:
            result = solve(cipher, phase, orientation, seconds)
            counts[result["status"]] += 1
    print("CPSAT_SUMMARY", json.dumps({"sourcePageShuffleSeed": shuffle_seed,
        "phaseStart": first, "phaseEnd": last, "direction": direction,
        "counts": counts}), flush=True)


if __name__ == "__main__":
    main()

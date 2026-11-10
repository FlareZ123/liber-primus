"""Optimistic first-plaintext-GP-rune inverse for phase35 of 79/78 radix packing.

The first two base28 digits of a 79-digit clean packet constrain the
first base29 plaintext rune to at most two consecutive GP values.
Searches all fixed 29-symbol cyclic orderings by CP-SAT. Every reported
bound is conditional on the 78->79 hypothesis and the 95 clean packets.
A FEASIBLE key is a hypothesis, not established Cicada key material.
"""
from __future__ import annotations
from collections import Counter
import json
import math
import os
from pathlib import Path
import random
import re
from ortools.sat.python import cp_model

ROOT = Path(__file__).resolve().parents[1]
N = 29
LIMIT = 29 ** 78
POWER = 28 ** 77
DIV = 29 ** 77
GP = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
WITNESS = [0,24,11,21,7,28,10,16,25,3,15,9,22,27,2,
           20,26,19,1,18,5,17,14,13,6,12,23,8,4]


def clean_starts(cipher: list[int], phase: int) -> list[int]:
    return [s for s in range(phase, len(cipher) - 78, 79)
            if s > 0 and all(cipher[j] != cipher[j - 1]
                             for j in range(s, s + 79))]


def first_range(d0: int, d1: int) -> tuple[int, int]:
    head = (28 * d0 + d1) * POWER
    return head // DIV, (head + POWER - 1) // DIV


def step(a: int, b: int, order: list[int]) -> int:
    return (order[b] - order[a] - 1) % N


def full_inverse(cipher: list[int], starts: list[int], order: list[int]) -> dict:
    inverse_order = [0] * 29
    for symbol, rank in enumerate(order):
        inverse_order[rank] = symbol
    decoded: list[int] = []
    firsts: list[int] = []
    for start in starts:
        prev = cipher[start - 1]
        digits = []
        for c in cipher[start:start + 79]:
            if c == prev:
                raise AssertionError("Only clean packets can be decoded")
            digits.append(step(prev, c, order))
            prev = c
        value = 0
        for d in digits:
            value = value * 28 + d
        if value >= LIMIT:
            continue
        plain = [0] * 78
        for i in range(77, -1, -1):
            value, plain[i] = divmod(value, 29)
        assert value == 0
        roundtrip = 0
        for p in plain:
            roundtrip = roundtrip * 29 + p
        packed = [0] * 79
        for i in range(78, -1, -1):
            roundtrip, packed[i] = divmod(roundtrip, 28)
        assert roundtrip == 0 and digits == packed
        predecessor = cipher[start - 1]
        for i, d in enumerate(packed):
            predecessor = inverse_order[(order[predecessor] + d + 1) % 29]
            assert predecessor == cipher[start + i]
        firsts.append(plain[0])
        decoded.extend(plain)
    n = len(decoded)
    frequencies = Counter(decoded)
    ioc = (sum(c * (c - 1) for c in frequencies.values()) / (n * (n - 1))
           if n > 1 else 0)
    return {"validPackets": len(firsts),
            "exactReencryptedRuneCount": len(firsts) * 79,
            "plainLength": n, "ioc": ioc, "firsts": firsts,
            "plaintext": decoded}


def native_control(data: dict) -> list[int]:
    raw = (ROOT / "resources/transcriptions/lp1_wulfic_canonical.txt").read_text(encoding="utf8")
    chunks = raw.split("%")
    table = {r: i for i, r in enumerate(GP)}
    # LP2 p56 is decrypted historically but corpus indices are *ciphertext*.
    # Use only the literal plaintext GP runes on p57.
    solved = data["pages"][57]["indices"]
    native = [table[r] for i in (3, 8, 9, 10, 11, 14)
              for r in chunks[i] if r in table]
    assert len(native) == 1001 and len(solved) == 95
    return native + solved


def plant(native: list[int], top: set[int]) -> dict:
    rand = random.Random(33017978)
    order = list(range(29))
    rand.shuffle(order)
    origin = order[0]
    order = [(p - origin) % 29 for p in order]
    ranks = [0] * 29
    for r, position in enumerate(order):
        ranks[position] = r
    plaintext = (native * 10)[:96 * 78]
    cipher = []
    prev = 7
    for block in range(96):
        value = 0
        for p in plaintext[block * 78:block * 78 + 78]:
            value = value * 29 + p
        digits = [0] * 79
        for j in range(78, -1, -1):
            value, digits[j] = divmod(value, 28)
        assert value == 0
        for d in digits:
            prev = ranks[(order[prev] + d + 1) % 29]
            cipher.append(prev)
    starts = clean_starts(cipher, 0)
    inverse = full_inverse(cipher, starts, order)
    assert len(starts) == 95 and inverse["plaintext"] == plaintext[78:]
    assert all(first_range(step(cipher[s-1], cipher[s], order),
                           step(cipher[s], cipher[s+1], order))[0] <=
               plaintext[s // 79 * 78] <=
               first_range(step(cipher[s-1], cipher[s], order),
                           step(cipher[s], cipher[s+1], order))[1]
               for s in starts)
    return {"cleanPackets": len(starts),
            "exactReencrypted": inverse["exactReencryptedRuneCount"],
            "nativeTop8PlaintextStarts": sum(p in top for p in inverse["firsts"])}



def english_reference_control(raw: str, labels: list[str], top: set[int], logp: list[float]) -> dict:
    """Count stride-78 GP letter windows in an independent English text."""
    normalized = (raw.upper().replace("QU", "CW").replace("V", "U")
                  .replace("K", "C").replace("Z", "S").replace("ING", "NG"))
    tokens = sorted(((s, i) for i, s in enumerate(labels)),
                    key=lambda item: -len(item[0]))
    gp = []
    for match in re.finditer("[A-Z]+", normalized):
        word = match.group()
        i = 0
        while i < len(word):
            for symbol, index in tokens:
                if word.startswith(symbol, i):
                    gp.append(index)
                    i += len(symbol)
                    break
            else:
                i += 1
    n = 95
    hits = [int(x in top) for x in gp]
    native_scores = [logp[x] for x in gp]
    score_windows = []
    windows = 0
    low = 0
    total = 0
    minimum = 96
    maximum = 0
    for residue in range(78):
        sub = hits[residue::78]
        if len(sub) < n:
            continue
        count = sum(sub[:n])
        row_scores = native_scores[residue::78]
        score = sum(row_scores[:n])
        for j in range(n - 1, len(sub)):
            if j >= n:
                count += sub[j] - sub[j - n]
                score += row_scores[j] - row_scores[j - n]
            score_windows.append(score)
            windows += 1
            total += count
            low += int(count <= 39)
            minimum = min(minimum, count)
            maximum = max(maximum, count)
    assert windows == len(gp) - (n - 1) * 78
    metadata = {"GP": len(gp), "top8Frequency": sum(hits) / len(gp),
            "windows": windows, "atMost39": low,
            "empiricalLowerTail": low / windows,
            "meanTop8Starts": total / windows,
            "range": [minimum, maximum],
            "minNativeUnigramLogSum": min(score_windows),
            "maxNativeUnigramLogSum": max(score_windows),
            "meanNativeUnigramLogSum": sum(score_windows) / windows}
    return metadata, score_windows


def run() -> None:
    data = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
    assert data["runes"] == list(GP)
    cipher = [c for p in data["pages"] if p["page"] < 56 for c in p["indices"]]
    assert len(cipher) == 12956
    starts = clean_starts(cipher, 35)
    assert len(starts) == 95
    native = native_control(data)
    counter = Counter(native)
    top = set(sorted(range(29), key=lambda i: (-counter[i], i))[:8])
    control = plant(native, top)
    logp = [math.log((counter[k] + 1) / (len(native) + 29)) for k in range(29)]
    reference = {}
    reference_scores = {}
    for name, filename, expected in [
        ("Shakespeare", "shakespeare_first300k.txt", 217644),
        ("Gibran", "gibran_prophet_58585.txt", 62696)
    ]:
        raw = (ROOT / "resources/control" / filename).read_text(encoding="utf8")
        result, scores = english_reference_control(raw, data["translit"], top, logp)
        assert result["GP"] == expected
        reference[name] = result
        reference_scores[name] = scores
    baseline = full_inverse(cipher, starts, WITNESS)
    assert baseline["validPackets"] == 95
    # The two-digit prefix uses at most 433 of 784 radix28 pairs.
    logmap = []
    hitmap = []
    ambiguous = 0
    for prefix in range(28 * 28):
        lo, hi = first_range(prefix // 28, prefix % 28)
        ambiguous += int(prefix <= 432 and lo != hi)
        choices = list(range(lo, min(hi, 28) + 1))
        logmap.append(max([round(1000 * math.log((counter[k] + 1) /
                         (len(native) + 29))) for k in choices], default=-15000))
        hitmap.append(int(any(k in top for k in choices)))
    assert ambiguous == 29
    model = cp_model.CpModel()
    rank = [model.new_int_var(0, 28, "pi" + str(i)) for i in range(29)]
    model.add_all_different(rank)
    model.add(rank[0] == 0)
    objective_mode = os.environ.get("GP_OBJECTIVE", "top8")
    assert objective_mode in ("top8", "unigram")
    individual_scores = []
    individual_hits = []
    for block, start in enumerate(starts):
        a, b, c = cipher[start - 1:start + 2]
        d0 = model.new_int_var(0, 27, f"d0_{block}")
        d1 = model.new_int_var(0, 27, f"d1_{block}")
        borrow0 = model.new_bool_var(f"b0_{block}")
        borrow1 = model.new_bool_var(f"b1_{block}")
        model.add(d0 == rank[b] - rank[a] - 1 + 29 * borrow0)
        model.add(d1 == rank[c] - rank[b] - 1 + 29 * borrow1)
        head = model.new_int_var(0, 432, f"head_{block}")
        model.add(head == 28 * d0 + d1)
        score = model.new_int_var(min(logmap), max(logmap), f"log_{block}")
        top_hit = model.new_bool_var(f"top_{block}")
        model.add_element(head, logmap, score)
        model.add_element(head, hitmap, top_hit)
        individual_scores.append(score)
        individual_hits.append(top_hit)
    for i, pi in enumerate(WITNESS):
        model.add_hint(rank[i], pi)
    model.maximize(sum(individual_hits if objective_mode == "top8"
                       else individual_scores))

    class Observer(cp_model.CpSolverSolutionCallback):
        def __init__(self):
            super().__init__()
            self.n = 0
            self.best = None
            self.best_nats = -10000.0
        def on_solution_callback(self):
            self.n += 1
            order = [self.value(var) for var in rank]
            inv = full_inverse(cipher, starts, order)
            values = inv.pop("plaintext")
            inv.pop("firsts")
            nats = (sum(math.log((counter[v] + 1) / (len(native) + 29))
                    for v in values) / len(values) if values else -10000.0)
            if inv["validPackets"] == 95 and nats > self.best_nats:
                self.best = {"order": order, "nativeUnigramLogPerRune": nats,
                             "actualTop8Starts": sum(v in top for v in full_inverse(cipher, starts, order)["firsts"]),
                             **inv}
                self.best_nats = nats
            if self.n <= 4 or self.n % 20 == 0:
                print("GP_INCUMBENT", json.dumps({
                    "number": self.n, "optimisticScore": self.objective_value,
                    "completePackets": inv["validPackets"],
                    "unigramLogPerRune": nats,
                    "originalRuneIoC": inv["ioc"]}), flush=True)

    observer = Observer()
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(os.environ.get("GP_SECONDS", "300"))
    solver.parameters.num_search_workers = 8
    solver.parameters.random_seed = 330179
    status = solver.solve(model, observer)
    optimistic_language_limit = solver.best_objective_bound / 1000 + len(starts) * 0.0005 if objective_mode == "unigram" else None
    if optimistic_language_limit is not None:
        for name, scores in reference_scores.items():
            reference[name]["atOrBelowOriginalUnigramCeiling"] = sum(s <= optimistic_language_limit for s in scores)
    result = {
        "status": solver.status_name(status), "objectiveMode": objective_mode,
        "bestObjective": solver.objective_value,
        "bestUpperBound": solver.best_objective_bound,
        "conservativeNativeUnigramLogUpper": optimistic_language_limit,
        "seconds": solver.wall_time, "branches": solver.num_branches,
        "conflicts": solver.num_conflicts, "improvements": observer.n,
        "source": "all 95 intact original LP2 phase35 packets",
        "top8RuneIndices": sorted(top),
        "nativeTop8Frequency": sum(counter[k] for k in top) / len(native),
        "nativeControlRunes": len(native), "ambiguousLeadingDigitPairs": ambiguous,
        "syntheticPositive": control,
        "referenceEnglishControls": reference,
        "priorArbitraryOrder": {"validPackets": baseline["validPackets"],
                                "runeIoC": baseline["ioc"],
                                "actualTop8Starts": sum(p in top for p in baseline["firsts"])},
        "bestCompleteOriginalCandidate": observer.best,
        "interpretation": "Conditional optimistic GP-first-rune upper bound, not established LP2 plaintext or authentic key."
    }
    print("GP_PREFIX_SUMMARY", json.dumps(result, sort_keys=True), flush=True)
    if status == cp_model.MODEL_INVALID:
        raise AssertionError("CP-SAT model invalid")


if __name__ == "__main__":
    run()

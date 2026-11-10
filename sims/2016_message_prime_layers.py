#!/usr/bin/env python3
"""Source-frozen test of the 2016 Cicada message's GP/Fibonacci-prime layers.

The signed 2016 message is transliterated with the manuscript's 29 GP prime
weights. Explicit orthographic conventions used by the historical analysis:
TH, EA, ING and IO are single GP runes; K=C and V=U. The final F in the
fingerprint 7A35090F is moved from the third section to the first.

Two independently source-derived triples of prime ordinals are tested as
three additive phi-prime layers:
  nested suffixes: 410, 309, 206 (GP sums 2819, 2039, 1277)
  2016 sections:   431, 410, 376 (F-adjusted GP sums 3001, 2819, 2579)

For each layer, sign and prime-index direction are independently ±1.
A single global model is selected on the first 90 runes of eight LP2 section
openers; its Viterbi skip-count state is frozen before scoring the next 90.
Thirty matched random two-triple families provide a familywise null.
This tests additive composition of the authentic p56 phi-prime mechanism,
not arbitrary nonlinear three-layer ciphers.
"""
import itertools
import json
import random

import numpy as np
from numba import njit

import prime_totient_F_interrupt_viterbi as p56v
from prime_totient_long_offset_inversion import EXAMPLE_TRUE, primes_to
from rand1955_running_key import CORPUS, SRC_TEXT, encode

KMAX = p56v.KMAX
LOW = p56v.LOW
LIT = p56v.LIT
USED = p56v.USED
SPLIT = 90
WINDOW = 180
PAGES = (0, 3, 8, 16, 23, 27, 33, 40)
SOURCE_TRIPLES = (
    ("nested-suffix-primes", (410, 309, 206)),
    ("2016-section-primes", (431, 410, 376)),
)

@njit
def split_score(cipher, key, logp, split, kmax, low, lit, used):
    """Train Viterbi, freeze its best skip-count state, then score holdout."""
    dp = np.full(kmax + 1, low, dtype=np.float64)
    dp[0] = 0.0
    frozen = np.full(kmax + 1, low, dtype=np.float64)
    train_score = low
    train_state = 0
    full_score = low

    for i in range(len(cipher)):
        r = int(cipher[i])
        new = np.full(kmax + 1, low, dtype=np.float64)
        for skipped in range(kmax + 1):
            previous = dp[skipped]
            if previous < low / 2:
                continue
            key_index = i - skipped
            plain = (r - int(key[key_index])) % 29
            regular = previous + logp[plain] + (used if r == 0 else 0.0)
            if regular > new[skipped]:
                new[skipped] = regular
            if r == 0 and skipped < kmax:
                literal = previous + logp[0] + lit
                if literal > new[skipped + 1]:
                    new[skipped + 1] = literal
        dp = new

        if i + 1 == split:
            train_state = int(np.argmax(dp))
            train_score = dp[train_state]
            frozen[train_state] = train_score
        elif i + 1 > split:
            new_frozen = np.full(kmax + 1, low, dtype=np.float64)
            for skipped in range(kmax + 1):
                previous = frozen[skipped]
                if previous < low / 2:
                    continue
                key_index = i - skipped
                plain = (r - int(key[key_index])) % 29
                regular = previous + logp[plain] + (used if r == 0 else 0.0)
                if regular > new_frozen[skipped]:
                    new_frozen[skipped] = regular
                if r == 0 and skipped < kmax:
                    literal = previous + logp[0] + lit
                    if literal > new_frozen[skipped + 1]:
                        new_frozen[skipped + 1] = literal
            frozen = new_frozen

    full_score = np.max(dp)
    heldout_total = np.max(frozen)
    return train_score, heldout_total - train_score, train_state, full_score


def message_gp_structure(primes):
    gp = {str(t): int(v) for t, v in zip(CORPUS["translit"], CORPUS["prime"])}
    gp["ING"] = gp["NG"]
    gp["IO"] = gp["IA"]
    gp["K"] = gp["C"]
    gp["V"] = gp["U"]
    tokens = sorted(gp, key=len, reverse=True)

    def transcribe(text):
        letters = "".join(ch for ch in text.upper() if ch.isalpha())
        out = []
        i = 0
        while i < len(letters):
            match = next((t for t in tokens if letters.startswith(t, i)), None)
            if match is None:
                raise ValueError(f"Unmapped GP source letter at {letters[i:]} in {text!r}")
            out.append((match, gp[match]))
            i += len(match)
        return out

    sections = (
        ("s1", "Hello. The path lies empty; epiphany seeks the devoted. Liber Primus is the way."),
        ("s2", "Its words are the map, their meaning is the road, and their numbers are the direction."),
        ("s3", "Seek and you will be found. Good luck. 3301. Beware false paths. Verify OpenPGP 7A35090F."),
    )
    raw = {}
    for name, text in sections:
        ts = transcribe(text)
        raw[name] = {"runes": len(ts), "gp_sum": sum(v for _, v in ts)}
    assert [raw[x]["runes"] for x in ("s1", "s2", "s3")] == [59, 59, 59]
    assert [raw[x]["gp_sum"] for x in ("s1", "s2", "s3")] == [2999, 2819, 2581]
    adjusted = [raw["s1"]["gp_sum"] + gp["F"],
                raw["s2"]["gp_sum"],
                raw["s3"]["gp_sum"] - gp["F"]]
    assert adjusted == [3001, 2819, 2579]

    nested_texts = (
        "Its words are the map, their meaning is the road, and their numbers are the direction.",
        "their meaning is the road, and their numbers are the direction.",
        "and their numbers are the direction.",
    )
    nested = []
    for text in nested_texts:
        ts = transcribe(text)
        total = sum(v for _, v in ts)
        index = int(np.where(primes == total)[0][0]) + 1
        nested.append({"runes": len(ts), "gp_sum": total, "prime_index": index})
    assert [(x["runes"], x["gp_sum"], x["prime_index"]) for x in nested] == [
        (59, 2819, 410), (43, 2039, 309), (27, 1277, 206)
    ]
    assert [nested[0]["prime_index"] - nested[1]["prime_index"],
            nested[1]["prime_index"] - nested[2]["prime_index"]] == [101, 103]

    fib = [1, 1]
    while len(fib) < 12:
        fib.append(fib[-1] + fib[-2])
    indices = [464]
    for step in fib:
        indices.append(indices[-1] - step)
    values = [int(primes[n - 1]) for n in indices]
    assert values == [3301, 3299, 3271, 3257, 3229, 3191, 3119,
                      3001, 2819, 2579, 2131, 1459, 457]
    assert [indices[7], indices[8], indices[9]] == [431, 410, 376]
    return {
        "tokenization": "TH, EA, ING and IO as GP runes; K=C and V=U; digits/punctuation ignored",
        "raw_2016_sections": raw,
        "F_shifted_section_sums": adjusted,
        "section_prime_indices": [431, 410, 376],
        "section_phi_mod29": [((x - 1) % 29) for x in adjusted],
        "nested_suffixes": nested,
        "nested_phi_mod29": [((x["gp_sum"] - 1) % 29) for x in nested],
        "nested_prime_index_gaps": [101, 103],
        "fibonacci_prime_index_walk": [
            {"prime_index": n, "prime": p, "step_from_previous": (None if i == 0 else fib[i - 1])}
            for i, (n, p) in enumerate(zip(indices, values))
        ],
        "2017_crosscheck_not_used": {
            "reported_gp_sum": 2131, "prime_index": 321,
            "note": "Excluded from the key family because the 2017 message's authenticity is disputed."
        }
    }


def build_key(primes, starts, signs, directions, length):
    key = np.zeros(length, dtype=np.int64)
    for start, sign, direction in zip(starts, signs, directions):
        indices = (start - 1) + direction * np.arange(length)
        assert int(indices.min()) >= 0 and int(indices.max()) < len(primes)
        key += sign * (primes[indices] - 1)
    return (key % 29).astype(np.uint8)


def evaluate_key_family(primes, pages, logp, triples, collect=False):
    results = []
    sign_vectors = list(itertools.product((1, -1), repeat=3))
    direction_vectors = list(itertools.product((1, -1), repeat=3))
    for family_name, starts in triples:
        for signs in sign_vectors:
            for directions in direction_vectors:
                key = build_key(primes, starts, signs, directions, WINDOW)
                per_page = {}
                train_total = 0.0
                holdout_total = 0.0
                full_total = 0.0
                for page in pages:
                    cipher = np.asarray(page["indices"][:WINDOW], dtype=np.uint8)
                    tr, ho, state, full = split_score(
                        cipher, key, logp, SPLIT, KMAX, LOW, LIT, USED
                    )
                    train_total += float(tr)
                    holdout_total += float(ho)
                    full_total += float(full)
                    if collect:
                        per_page[str(page["page"])] = {
                            "train_per_rune": float(tr / SPLIT),
                            "heldout_per_rune": float(ho / (WINDOW - SPLIT)),
                            "frozen_train_skip_state": int(state),
                            "full_per_rune": float(full / WINDOW),
                        }
                denominator = len(pages) * SPLIT
                result = {
                    "family": family_name,
                    "starts": list(starts),
                    "layer_signs": list(signs),
                    "prime_directions": list(directions),
                    "train_mean": train_total / denominator,
                    "heldout_mean": holdout_total / denominator,
                    "full_mean": full_total / (len(pages) * WINDOW),
                }
                if collect:
                    result["per_page"] = per_page
                results.append(result)
    return results


def random_null(primes, pages, logp, replicates=30):
    rng = random.Random(0x3301F1)
    excluded = {206, 309, 376, 410, 431}
    pool = [n for n in range(180, 451) if n not in excluded]
    summaries = []
    for rep in range(replicates):
        triples = []
        for j in range(2):
            starts = tuple(rng.sample(pool, 3))
            triples.append((f"null{rep}_triple{j}", starts))
        scores = evaluate_key_family(primes, pages, logp, triples, collect=False)
        winner = max(scores, key=lambda x: x["train_mean"])
        summaries.append({
            "replicate": rep,
            "selected_starts": winner["starts"],
            "selected_signs": winner["layer_signs"],
            "selected_directions": winner["prime_directions"],
            "train_mean": winner["train_mean"],
            "heldout_mean": winner["heldout_mean"],
        })
    return summaries


def short_key_screens(primes, pages, logp, structure):
    candidates = (
        ("section_phi_3symbol", structure["section_phi_mod29"]),
        ("nested_phi_3symbol", structure["nested_phi_mod29"]),
        ("fibonacci_gap_3symbol", [13, 21, 34]),
    )
    out = []
    for name, period in candidates:
        key = np.asarray([period[i % len(period)] % 29 for i in range(WINDOW)], dtype=np.uint8)
        train_total = holdout_total = 0.0
        per_page = {}
        for page in pages:
            cipher = np.asarray(page["indices"][:WINDOW], dtype=np.uint8)
            tr, ho, state, full = split_score(
                cipher, key, logp, SPLIT, KMAX, LOW, LIT, USED
            )
            train_total += float(tr)
            holdout_total += float(ho)
            per_page[str(page["page"])] = {
                "train_per_rune": float(tr / SPLIT),
                "heldout_per_rune": float(ho / (WINDOW - SPLIT)),
                "frozen_train_skip_state": int(state),
            }
        denom = len(pages) * SPLIT
        out.append({
            "name": name, "period": period,
            "train_mean": train_total / denom,
            "heldout_mean": holdout_total / denom,
            "per_page": per_page,
        })
    return out


def main():
    primes = primes_to(800)
    structure = message_gp_structure(primes)
    counts = np.bincount(encode(SRC_TEXT[:240000]), minlength=29)
    logp = np.log((counts + 1) / (counts.sum() + 29))
    pages = [p for p in CORPUS["pages"] if int(p["page"]) in PAGES]
    assert len(pages) == 8
    assert all(len(p["indices"]) >= WINDOW for p in pages)

    # Positive control: reproduce the authentic solved p56 phi-prime cipher
    # with its unknown literal-F pause at rune offset 56.
    p56 = np.asarray(next(p["indices"] for p in CORPUS["pages"] if p["page"] == 56),
                     dtype=np.uint8)
    p56_key = ((primes[:len(p56)] - 1) % 29).astype(np.uint8)
    p56_plain, p56_skips = p56v.traceback(p56, p56_key, -1, logp, 0)
    assert p56_plain == encode(EXAMPLE_TRUE).tolist()
    assert p56_skips == [56]

    # Positive control for a composite three-layer key and the exact F clock.
    plant_key = build_key(primes, (410, 309, 206), (1, 1, 1), (1, 1, 1), WINDOW)
    plant_plain = np.asarray(encode(SRC_TEXT[240000:])[:WINDOW], dtype=np.uint8)
    plant_plain[plant_plain == 0] = 1
    plant_plain[43] = 0
    plant_cipher = []
    skipped = 0
    for i, plain in enumerate(plant_plain):
        if i == 43:
            plant_cipher.append(0)
            skipped += 1
        else:
            plant_cipher.append((int(plain) + int(plant_key[i - skipped])) % 29)
    plant_cipher = np.asarray(plant_cipher, dtype=np.uint8)
    recovered = []
    key_index = 0
    for i, cipher in enumerate(plant_cipher):
        if i == 43:
            recovered.append(0)
        else:
            recovered.append((int(cipher) - int(plant_key[key_index])) % 29)
            key_index += 1
    assert recovered == plant_plain.tolist()
    recovered_skips = [43]

    source_models = evaluate_key_family(
        primes, pages, logp, SOURCE_TRIPLES, collect=True
    )
    winner = max(source_models, key=lambda x: x["train_mean"])
    top_train = sorted(source_models, key=lambda x: x["train_mean"], reverse=True)[:10]
    top_holdout = sorted(source_models, key=lambda x: x["heldout_mean"], reverse=True)[:10]
    null = random_null(primes, pages, logp, replicates=30)
    null_scores = [x["heldout_mean"] for x in null]
    p_upper = (1 + sum(x >= winner["heldout_mean"] for x in null_scores)) / (1 + len(null_scores))
    short = short_key_screens(primes, pages, logp, structure)

    result = {
        "evidence_class": "source-frozen additive three-layer phi-prime test; no recovered LP2 plaintext/key",
        "message_gp_structure": structure,
        "controls": {
            "authentic_p56_plaintext_recovered": True,
            "authentic_p56_literal_F_positions": p56_skips,
            "composite_key_plant_recovered": True,
            "composite_plant_literal_F_positions": recovered_skips,
            "composite_plant_runes": len(plant_plain),
        },
        "model_definition": {
            "cipher": "c_i = m_i + sum_j(sign_j * (prime[start_j + direction_j*i]-1)) mod29",
            "decryption": "three additive phi-prime layers combined; F may be literal and non-consuming",
            "starts_are_one_based_prime_ordinals": True,
            "model_count": len(source_models),
            "start_families": [{"name": n, "starts": list(s)} for n, s in SOURCE_TRIPLES],
            "per_layer_signs": [-1, 1],
            "per_layer_prime_directions": [-1, 1],
            "literal_F_prior": 0.2,
            "max_literal_F_skips": KMAX,
            "selection": f"one global model selected on first {SPLIT} runes of each of {len(pages)} page openers",
            "holdout": f"next {WINDOW-SPLIT} runes; each page's best training skip-count state frozen",
            "pages": list(PAGES),
        },
        "source_family_winner_by_training": winner,
        "top_10_by_training": top_train,
        "top_10_by_heldout_postselection": top_holdout,
        "matched_random_null": {
            "replicates": len(null),
            "family_size_each": len(source_models),
            "seed": "0x3301F1",
            "start_pool_one_based": [180, 450],
            "heldout_means": null_scores,
            "mean": float(np.mean(null_scores)),
            "max": float(np.max(null_scores)),
            "source_winner_heldout_upper_p": p_upper,
            "replicates_at_least_source": sum(x >= winner["heldout_mean"] for x in null_scores),
            "selected_models": null,
        },
        "fixed_short_key_screens": short,
        "interpretation": (
            "A source-specific additive three-layer phi-prime key would need to beat "
            "the matched random-triple family on frozen original-rune holdout and yield "
            "a reproducible readable plaintext. A high training score alone is not evidence."
        ),
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Original LP2 versus solved-Cicada phoneme classes under arbitrary word-local m-phase keys.

Independent of any guessed key: equal input positions j,k within a word
and j==k (mod m) stay equal under arbitrary secret per-word/per-phase
bijections. Compare against genuine solved-Cicada phonemic word-shape
controls matched exactly on the original LP2 printed word lengths.
The CMU mapping is exploratory and is not authenticated Cicada usage.
"""
from __future__ import annotations

import collections
import contextlib
import importlib.util
import io
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
prior = ROOT / "sims/lp2_phonemic_register_capacity_sft.py"
spec = importlib.util.spec_from_file_location("prior_phonemic_control", prior)
assert spec and spec.loader
mod = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(mod)

assert len(mod.spoken) == 538
assert len(mod.word_records) == 2896
assert sum(map(len, mod.word_records)) == 12956

def score(word: tuple[int, ...] | tuple[str, ...], phase_count: int) -> int:
    return sum(word[i] == word[j]
               for i in range(len(word))
               for j in range(i + phase_count, len(word), phase_count))

donors = collections.defaultdict(list)
for w in mod.spoken:
    donors[len(w)].append(w)
donor_lengths = set(donors)
matched = [w for w in mod.word_records if len(w) in donor_lengths]
missing = collections.Counter(len(w) for w in mod.word_records if len(w) not in donor_lengths)
assert len(matched) + sum(missing.values()) == 2896
assert matched, "a matched original control must exist"
lengths = [len(w) for w in matched]

# Equality is invariant under *every* independent secret per-word/per-phase
# 29-way bijection. Plant ten real solved phoneme words as ciphertext using
# deterministic arbitrary secret phases, then invert them exactly.
rng_plant = random.Random(0x3301224701)
for m in (1, 2, 3, 4, 5):
    originals = mod.spoken[:20]
    secret = []
    cipher = []
    for w in originals:
        phase_perms = []
        for _ in range(m):
            perm = list(range(29))
            rng_plant.shuffle(perm)
            phase_perms.append(perm)
        src = [mod.to_gp[tok] for tok in w]
        tgt = [phase_perms[j % m][p] for j, p in enumerate(src)]
        assert score(tuple(src), m) == score(tuple(tgt), m)
        recovered = []
        for j, v in enumerate(tgt):
            reverse = [0] * 29
            for i, x in enumerate(phase_perms[j % m]):
                reverse[x] = i
            recovered.append(reverse[v])
        assert recovered == src
        secret.append(phase_perms)
        cipher.append(tgt)

# The earlier Agent28 source-native GP benchmark tests a DIFFERENT
# plaintext alphabet. This matched benchmark fixes the historical
# CMU-to-29-class merger from Agent1's predecessor report without retuning.
# Each donor slot is sampled with the empirically observed frequency of
# that phonemic word in the solved-Cicada excerpt.
N = 5000
rng = random.Random(0x3301224702)
per_length = {length: [
    tuple(score(word, m) for m in range(1, 6))
    for word in candidates
] for length, candidates in donors.items()}
actual = [sum(score(w, m) for w in matched) for m in range(1, 6)]
min_trial = [10**12] * 5
max_trial = [0] * 5
sum_trial = [0] * 5
at_most = [0] * 5

# For speed, accumulate five independent m results from each selected
# donor word's precomputed exact equality vector.
for _ in range(N):
    totals = [0] * 5
    for length in lengths:
        v = per_length[length][rng.randrange(len(per_length[length]))]
        for k in range(5):
            totals[k] += v[k]
    for k, total in enumerate(totals):
        min_trial[k] = min(min_trial[k], total)
        max_trial[k] = max(max_trial[k], total)
        sum_trial[k] += total
        at_most[k] += (total <= actual[k])

print(json.dumps({
    "model": "one arbitrary secret GP29 permutation for every word and each of m word-index phases; phonic plaintext drawn from solved LP1 plus p57 CMU 29-class control",
    "original_unknown_words": len(mod.word_records),
    "matched_original_words": len(matched),
    "unmatched_original_word_lengths": dict(sorted(missing.items())),
    "donor_types_by_length": {l: len(v) for l, v in sorted(donors.items())},
    "original_exact_same_phase_pair_counts": actual,
    "matched_phonemic_5000_trial_min": min_trial,
    "matched_phonemic_5000_trial_mean": [x / N for x in sum_trial],
    "matched_phonemic_5000_trial_max": max_trial,
    "phonemic_trials_with_equal_or_fewer_pairs_than_original": at_most,
    "empirical_lower_tail_p_add_one": [(n + 1)/(N + 1) for n in at_most],
    "planted_per_word_per_phase_all_keys_roundtrip": True,
    "explicit_limit": "necessary equality test of word-preserving phase-wise substitutions; within-phase nonlinear feedback, resegmentation, non-CMU phonetics and extra spelling bits are not tested",
}, indent=2))

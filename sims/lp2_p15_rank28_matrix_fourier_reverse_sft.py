#!/usr/bin/env python3
"""Same frozen p15 4D Fourier rank28 model on the PRECEDING pp8-14 half.

Extends lp2_p15_rank28_matrix_fourier_sft.py without changing its
matrix models, GP character distribution, primitive generator or emission law.
Tests reading either forward p8->p14 or backward p14->p8.
Requires NumPy and checked-in canonical original corpus.
"""
import json
import numpy as np
import lp2_p15_rank28_matrix_fourier_sft as core

physical = [np.array(core.CORPUS["pages"][i]["indices"], dtype=np.int64)
            for i in range(8, 15)]
assert [len(p) for p in physical] == [255,268,263,273,261,272,137]

out = {}
for reading in ("forward", "reverse"):
    pages = physical if reading == "forward" else [x[::-1] for x in physical[::-1]]
    core.PAGES = pages
    core.C_REAL = np.concatenate(pages)
    core.N = len(core.C_REAL)
    core.TRAIN = sum(map(len, pages[:4]))
    core.P_NATIVE = core.P_NATIVE[:core.N]
    assert core.N == 1729
    # Entire last three original pages held out, in chosen reading direction.
    best = core.scan(core.C_REAL)
    out[reading] = {
        "train_pages": [8,9,10,11] if reading == "forward" else [14,13,12,11],
        "holdout_pages": [12,13,14] if reading == "forward" else [10,9,8],
        "train_runes": core.TRAIN,
        "holdout_runes": core.N - core.TRAIN,
        "original_best_train": best[:5],
        "retrospective_best_heldout": max(best,key=lambda z:z["frozen_holdout_logprob_per_rune"]),
        "models": len(best),
    }
    # Exact blind positive: all 1729 native GP runes, same four-digit source seed.
    s = tuple(x % 29 for x in (3299,3298,3296,3294))
    keyrows = core.rows_from(core.P15 % 29, 0)
    pc = core.encrypt(core.P_NATIVE, keyrows, s)
    guess, score = core.infer_all_seeds(pc, keyrows)
    assert guess == s
    assert np.array_equal(core.decrypt(pc, keyrows, guess), core.P_NATIVE)
    out[reading]["planted_control"] = {
        "exact_recovered_runes": core.N, "recovered_seed": list(guess),
        "train_avg": score / core.TRAIN,
        "heldout_avg": float(core.LOGP[core.P_NATIVE[core.TRAIN:]].mean()),
    }
print(json.dumps(out,indent=2))

#!/usr/bin/env python3
"""Exact 29^4-key inversion of p15-square rank28 state models on original LP2.

Requires Python >=3.10 and NumPy. Run from any working directory:
    python sims/lp2_p15_rank28_matrix_fourier_sft.py

The predeclared p16-19 training cut excludes the entire p20-22 holdout.
Output includes original top keys and two fully native synthetic controls.
This investigates a speculative use of p15, not an authenticated cipher.
"""
import hashlib
import json
import random
import re
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
PAGES = [np.array(CORPUS["pages"][i]["indices"], dtype=np.int64) for i in range(16, 23)]
C_REAL = np.concatenate(PAGES)
N = len(C_REAL)
TRAIN = sum(map(len, PAGES[:4]))
assert N == 1744 and TRAIN == 1071 and [len(x) for x in PAGES] == [267, 273, 260, 271, 269, 273, 131]

# Greedy GP29 transliteration in exactly the published alphabet order.
ALPH = CORPUS["translit"]
ENC = {x: i for i, x in enumerate(ALPH)}
def encode_gp(text):
    text = text.upper().replace("V", "U").replace("K", "C").replace("Q", "C").replace("Z", "S")
    text = re.sub("[^A-Z]", "", text)
    out, i = [], 0
    while i < len(text):
        dig = text[i:i+2]
        if dig in ENC:
            out.append(ENC[dig])
            i += 2
        else:
            out.append(ENC[text[i]])
            i += 1
    return np.array(out, dtype=np.int64)

gibran = (ROOT / "resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8")
# Match the JS UTF-16 substring offset 18500 of the independently archived
# Gibran control; the GP29 test tape has exactly 1744 output symbols.
gibran_suffix = gibran.encode("utf-16-le")[18500 * 2:].decode("utf-16-le", errors="ignore")
P_NATIVE = encode_gp(gibran_suffix)[:N]
assert len(P_NATIVE) == N
COUNTS = np.array([1614,3221,2268,5418,4107,1944,909,1517,1724,4219,4291,141,182,1100,44,
                   4231,3790,948,6876,1335,2544,536,23,2747,4004,1,1855,44,917], dtype=float)
LOGP = np.log((COUNTS + 0.1) / (COUNTS.sum() + 2.9))
P15 = np.array([[3258,3222,3152,3038],[3278,3299,3298,2838],
                [3288,3294,3296,2472],[4516,1206,708,1820]], dtype=np.int64)
PRIMES = np.array([[43,79,149,263],[23,2,3,463],
                   [13,7,5,829],[7817,4507,2593,1481]], dtype=np.int64)
RANKS = np.array([[14,22,35,56],[9,1,2,90],
                  [6,4,3,145],[988,611,378,234]], dtype=np.int64)
assert np.array_equal(P15, abs(3301 - PRIMES))
FAMILIES = [("printed", P15), ("prime", PRIMES), ("rank", RANKS), ("fib", RANKS - 1)]
POW = np.array([pow(2, i, 29) for i in range(28)], dtype=np.int64)
LOG = np.zeros(29, dtype=np.int64)
LOG[POW] = np.arange(28)
assert set(POW) == set(range(1, 29))
T = np.arange(29, dtype=np.int64)
GRID = 29 ** 4

def orientations():
    for family, matrix in FAMILIES:
        for flip in range(2):
            for rot in range(4):
                o = np.fliplr(matrix) if flip else matrix
                yield family, flip, rot, np.rot90(o, rot).copy() % 29

def rows_from(matrix, readout):
    out = np.empty((N, 4), dtype=np.int64)
    row = np.eye(4, dtype=np.int64)[readout]
    for i in range(N):
        out[i] = row
        row = row @ matrix % 29
    return out

def decrypt(cipher, rows, seed):
    key = rows @ np.array(seed, dtype=np.int64) % 29 % 28
    d = (cipher[1:] - cipher[:-1]) % 29
    out = np.empty(N, dtype=np.int64)
    out[0] = (cipher[0] - key[0]) % 29
    out[1:] = np.where(d == 0, 28, (LOG[d] - key[1:]) % 28)
    return out

def encrypt(plain, rows, seed):
    key = rows @ np.array(seed, dtype=np.int64) % 29 % 28
    out = np.empty(N, dtype=np.int64)
    out[0] = (plain[0] + key[0]) % 29
    for i in range(1, N):
        step = 0 if plain[i] == 28 else int(POW[(plain[i] + key[i]) % 28])
        out[i] = (out[i-1] + step) % 29
    return out

def infer_all_seeds(cipher, rows):
    """Return exact best of 707281 seeds via sparse 4D Fourier ridges."""
    delta = (cipher[1:TRAIN] - cipher[:TRAIN-1]) % 29
    nonzero = delta != 0
    # f_i(u)=language log-likelihood when the unknown seed projects to u.
    f = LOGP[(LOG[delta[nonzero], None] - (T % 28)[None, :]) % 28]
    fhat = np.fft.fft(f, axis=1) / 29
    points = rows[1:TRAIN][nonzero][:, None, :] * T[None, :, None] % 29
    spectrum = np.zeros((29, 29, 29, 29), dtype=np.complex128)
    np.add.at(spectrum, tuple(points[:, :, k].ravel() for k in range(4)), fhat.ravel())
    score = np.fft.ifftn(spectrum).real * GRID
    first_axis = int(np.flatnonzero(rows[0])[0])
    shape = [1, 1, 1, 1]
    shape[first_axis] = 29
    score += LOGP[(int(cipher[0]) - (T % 28)) % 29].reshape(shape)
    score += int((~nonzero).sum()) * LOGP[28]
    seed = tuple(int(x) for x in np.unravel_index(int(np.argmax(score)), score.shape))
    return seed, float(score[seed])

def summarize(cipher, rows, seed, train_score):
    decoded = decrypt(cipher, rows, seed)
    hold = decoded[TRAIN:]
    return {
        "seed": list(seed),
        "train_logprob_per_rune": train_score / TRAIN,
        "frozen_holdout_logprob_per_rune": float(LOGP[hold].mean()),
        "frozen_holdout_ioc": float(sum(int((hold == j).sum()) * (int((hold == j).sum()) - 1)
                                         for j in range(29)) / (len(hold) * (len(hold) - 1))),
        "first_64_gp_indices": decoded[:64].tolist(),
        "heldout_first_64_gp_indices": hold[:64].tolist(),
    }

def scan(cipher):
    best = []
    for family, flip, rot, original_matrix in orientations():
        for transpose in range(2):
            matrix = original_matrix.T if transpose else original_matrix
            for readout in range(4):
                rows = rows_from(matrix, readout)
                seed, score = infer_all_seeds(cipher, rows)
                result = summarize(cipher, rows, seed, score)
                result["model"] = f"{family}/flip{flip}/rot{rot}/transpose{transpose}/readout{readout}"
                best.append(result)
    best.sort(key=lambda r: r["train_logprob_per_rune"], reverse=True)
    return best

if __name__ == "__main__":
    source_model = rows_from(P15 % 29, 0)
    source_seed = tuple(x % 29 for x in [3299, 3298, 3296, 3294])
    native_cipher = encrypt(P_NATIVE, source_model, source_seed)
    recovered, train = infer_all_seeds(native_cipher, source_model)
    assert recovered == source_seed and np.array_equal(decrypt(native_cipher, source_model, recovered), P_NATIVE)
    original_repeat_mask = (C_REAL[1:] == C_REAL[:-1])
    matched_native = P_NATIVE.copy()
    matched_native[1:] = np.where(original_repeat_mask, 28, np.where(matched_native[1:] == 28, 18, matched_native[1:]))
    matched_cipher = encrypt(matched_native, source_model, source_seed)
    assert np.array_equal(matched_cipher[1:] == matched_cipher[:-1], original_repeat_mask)
    recovered_matched, score_matched = infer_all_seeds(matched_cipher, source_model)
    assert recovered_matched == source_seed and np.array_equal(decrypt(matched_cipher, source_model, recovered_matched), matched_native)
    rng = random.Random(33012026)
    null_cipher = np.empty(N, dtype=np.int64)
    null_cipher[0] = rng.randrange(29)
    for i in range(1, N):
        null_cipher[i] = (null_cipher[i-1] + (0 if original_repeat_mask[i-1] else rng.randrange(1,29))) % 29
    full_scan = scan(C_REAL)
    null_scan = scan(null_cipher)
    # A second source-family control checks model selection, including gauge-equivalent labels.
    different_matrix = np.rot90(np.fliplr(RANKS), 2).T.copy() % 29
    different_rows = rows_from(different_matrix, 3)
    different_seed = (3,7,13,17)
    family_cipher = encrypt(P_NATIVE, different_rows, different_seed)
    family_scan = scan(family_cipher)
    assert infer_all_seeds(family_cipher, different_rows)[0] == different_seed
    top = family_scan[0]
    label, fl, rt, transpose, ro = top["model"].split("/")
    _, _, _, base = next(x for x in orientations() if x[:3] == (label, int(fl[4:]), int(rt[3:])))
    other = rows_from(base.T if int(transpose[9:]) else base, int(ro[7:]))
    assert np.array_equal(decrypt(family_cipher, other, top["seed"]), P_NATIVE)
    out = {
        "status": "no_original_plaintext_recovered",
        "original_train_and_heldout": full_scan[:5],
        "original_best_retrospective_holdout": max(full_scan, key=lambda x: x["frozen_holdout_logprob_per_rune"]),
        "null_best_train": null_scan[0],
        "full_family_models": len(full_scan),
        "native_holdout_avg": float(LOGP[P_NATIVE[TRAIN:]].mean()),
        "source_seed_native_control": summarize(native_cipher, source_model, recovered, train),
        "repeat_matched_native_control": summarize(matched_cipher, source_model, recovered_matched, score_matched),
        "native_family_selection_control": top,
        "gibran_control_sha256": hashlib.sha256("".join("0123456789abcdefghijklmnopqrs"[i] for i in P_NATIVE).encode()).hexdigest(),
        "source_pages": list(range(16,23)), "source_rune_lengths": [len(p) for p in PAGES],
        "train_runes": TRAIN, "holdout_runes": N - TRAIN,
    }
    print(json.dumps(out, indent=2))

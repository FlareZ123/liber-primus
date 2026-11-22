"""Source-native 28-rank ciphertext-feedback GP inversion on the LP2 27x27 opening.

Run in the repository's sims directory beside lp2_rowcol_fourier_inverse.py.
Requires numpy. Original ciphertext, solved LP1 positive source, and external
Shakespeare GP frequencies are loaded by the existing GP29 Fourier test.

The conditional generator retains an initial ciphertext rune C0 (IV), then
C[i] = C[i-1] for GP plaintext EA=28, and otherwise
C[i] = C[i-1] + 1 + ((P[i] + row_key[i//27] + col_key[i%27]) % 28) mod 29.
This is a hypothesis, not an authenticated Cicada cipher.
"""
from __future__ import annotations

import json
import numpy as np

from lp2_rowcol_fourier_inverse import load

SIDE = 27
RANK = 28
SHIFTS = np.arange(RANK)
ROOTS = np.exp(2j * np.pi * SHIFTS / RANK)
REPS = 2500
FIT_STARTS = 100
FIT_NULLS = 40


def feedback_rank(cipher: np.ndarray) -> np.ndarray:
    """Invert visible predecessor differences, reserving 28 for repeats/IV."""
    assert cipher.size == SIDE * SIDE
    c = cipher.reshape(-1).astype(np.int16)
    rank = np.full(c.size, 28, dtype=np.int16)
    nonrepeat = c[1:] != c[:-1]
    differences = ((c[1:] - c[:-1] - 1) % 29).astype(np.int16)
    rank[1:][nonrepeat] = differences[nonrepeat]
    assert np.all((rank == 28) | (rank < RANK))
    return rank.reshape(SIDE, SIDE)


def forward(plaintext: np.ndarray, u: np.ndarray, v: np.ndarray, iv: int) -> np.ndarray:
    """Exactly re-encrypt GP symbols, with input symbol28 as reserved EA."""
    p = plaintext.reshape(-1)
    assert p.size == SIDE * SIDE and u.shape == (SIDE,) and v.shape == (SIDE,)
    out = np.zeros(p.size, dtype=np.int16)
    out[0] = iv
    for i in range(1, out.size):
        if p[i] == 28:
            out[i] = out[i - 1]
        else:
            out[i] = (int(out[i - 1]) + 1 + (int(p[i]) + int(u[i // SIDE]) + int(v[i % SIDE])) % RANK) % 29
    return out.reshape(SIDE, SIDE)


def spectral(rank: np.ndarray) -> float:
    """Key-free zero-mask Fourier invariant over all 28^53 row-column keys."""
    assert rank.shape == (SIDE, SIDE)
    mask = rank < RANK
    return max(float(np.linalg.svd(np.where(mask, ROOTS[(rank * k) % RANK], 0),
                                          compute_uv=False)[0]) for k in range(1, 15))


def blind_fit(rank: np.ndarray, prior_log: np.ndarray, starts: int = FIT_STARTS) -> dict:
    """Exact 28-way per-key coordinate maximization from source-blind starts."""
    mask = rank < RANK
    rng = np.random.default_rng(20261)
    best = -float('inf')
    best_u = best_v = None
    for _ in range(starts):
        u = rng.integers(0, RANK, SIDE)
        v = rng.integers(0, RANK, SIDE)
        for _ in range(35):
            old_u, old_v = u.copy(), v.copy()
            for r in range(SIDE):
                values = (rank[r, :, None] - v[:, None] - SHIFTS[None, :]) % RANK
                u[r] = int(np.argmax((prior_log[values] * mask[r, :, None]).sum(axis=0)))
            for c in range(SIDE):
                values = (rank[:, c, None] - u[:, None] - SHIFTS[None, :]) % RANK
                v[c] = int(np.argmax((prior_log[values] * mask[:, c, None]).sum(axis=0)))
            if np.array_equal(old_u, u) and np.array_equal(old_v, v):
                break
        plain = (rank - u[:, None] - v[None, :]) % RANK
        score = float((prior_log[plain] * mask).sum())
        if score > best:
            best, best_u, best_v = score, u.copy(), v.copy()
    assert best_u is not None and best_v is not None
    plain = (rank - best_u[:, None] - best_v[None, :]) % RANK
    plain[~mask] = 28
    assert np.array_equal((plain[mask] + best_u[:, None].repeat(SIDE, axis=1)[mask]
                           + best_v[None, :].repeat(SIDE, axis=0)[mask]) % RANK, rank[mask])
    return {'score': best, 'u': best_u, 'v': best_v, 'plain': plain}


def randomized_rank(rank: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Shuffle all 0..27 ranks, preserving histogram and every marker location."""
    out = rank.copy()
    mask = out < RANK
    out[mask] = rng.permutation(out[mask])
    return out


def run() -> dict:
    original, known, counts = load()
    rank = feedback_rank(original)
    assert int(np.sum(rank == 28)) == 5

    prng = np.random.default_rng(0x20261110)
    row_key = prng.integers(0, RANK, SIDE)
    column_key = prng.integers(0, RANK, SIDE)
    actual_gp = known[:729].reshape(SIDE, SIDE).copy()
    native_plain = actual_gp.copy()
    native_plain[0, 0] = 28  # transmitted initial ciphertext rune has no predecessor
    planted_cipher = forward(actual_gp, row_key, column_key, iv=3)
    planted_rank = feedback_rank(planted_cipher)
    assert np.array_equal(planted_rank < 28, native_plain < 28)
    planted_stat = spectral(planted_rank)
    assert np.isclose(planted_stat, spectral(native_plain), atol=1e-10)
    assert np.array_equal(planted_cipher, forward(native_plain, row_key, column_key, 3))

    native_windows = []
    for offset in range(27):
        p = known[offset:offset + 729].reshape(SIDE, SIDE).copy()
        p[0, 0] = 28
        native_windows.append(spectral(p))
    actual_stat = spectral(rank)
    shuffle_rng = np.random.default_rng(0x330128)
    null = np.array([spectral(randomized_rank(rank, shuffle_rng)) for _ in range(REPS)])
    counts28 = counts[:28].astype(float)
    prior = (counts28 + 0.25) / (float(counts28.sum()) + 28 * 0.25)
    logprior = np.log(prior)
    planted_fit = blind_fit(planted_rank, logprior)
    observed_fit = blind_fit(rank, logprior)
    assert np.array_equal(forward(planted_fit['plain'], planted_fit['u'], planted_fit['v'], 3), planted_cipher)
    assert np.array_equal(forward(observed_fit['plain'], observed_fit['u'], observed_fit['v'], int(original[0, 0])), original)
    valid = planted_rank < 28
    recovered = int(np.count_nonzero((planted_fit['plain'] == native_plain) & valid))
    mle_rng = np.random.default_rng(0x20261110)
    mle_controls = np.array([blind_fit(randomized_rank(rank, mle_rng), logprior)['score']
                             for _ in range(FIT_NULLS)])
    source = {'pages': [0, 1, 2], 'runes': 729, 'grid': '27x27',
              'sourceLP1Section4Runes': 755, 'shakespeareGpTrainRunes': int(counts.sum())}
    return {'classification': 'Conditional source-native exclusion, no authentic LP2 plaintext or key',
            'source': source,
            'model': '28-rank ciphertext predecessor feedback, EA=28 reserved repeat, arbitrary additive row+column GP28 pad',
            'original': {'sentinelCountIncludingFirst': int((rank == 28).sum()),
                         'ciphertextAdjacentRepeats': int(np.sum(original.reshape(-1)[1:] == original.reshape(-1)[:-1])),
                         'spectral': actual_stat, 'nullAtLeastReal': int(np.sum(null >= actual_stat)),
                         'nullAddOneP': (1 + int(np.sum(null >= actual_stat))) / (REPS + 1)},
            'spectralNull': {'seed': '0x330128', 'reps': REPS,
                             'mean': float(null.mean()), 'median': float(np.median(null)),
                             'p95': float(np.quantile(null, .95)), 'max': float(null.max())},
            'nativePositive': {'seed': '0x20261110', 'sentinelCountIncludingFirst': int((native_plain == 28).sum()),
                               'spectral': planted_stat, 'nativeWindows': len(native_windows),
                               'minNativeSpectral': min(native_windows), 'maxNativeSpectral': max(native_windows),
                               'nativePlantSpectralInvariant': True,
                               'gpRunesRecovered': recovered, 'recoverableRunes': int(valid.sum()),
                               'trueKeyPlainLogScore': float(np.sum(logprior[native_plain[valid]])),
                               'blindFitScore': planted_fit['score'], 'exactReencryption': True},
            'originalKeyInverse': {'starts': FIT_STARTS, 'bestLogScore': observed_fit['score'],
                                   'exactReencryption': True, 'authenticatedEnglish': False,
                                   'matchedNullReps': FIT_NULLS, 'matchedNullSeed': '0x20261110',
                                   'nullMean': float(mle_controls.mean()),
                                   'nullMin': float(mle_controls.min()),
                                   'nullMax': float(mle_controls.max()),
                                   'nullAtLeastOriginal': int(np.sum(mle_controls >= observed_fit['score'])),
                                   'nullAddOneP': (1 + int(np.sum(mle_controls >= observed_fit['score']))) / (FIT_NULLS + 1)},
            'limits': 'Only direct GP-English with a reserved EA repeat marker, transmitted initial IV, '
                      'ciphertext-feedback predecessor exclusion and separable mod28 row-column pads; '
                      'not a general rejection of nonlinear feedback or different marker semantics.'}



def latin_robustness(original: np.ndarray) -> dict:
    """Check both direct GP29 and feedback GP28 against independent Vulgate Latin."""
    from pathlib import Path
    from lp2_rowcol_fourier_inverse import spectrum, search_mle
    root = Path(__file__).resolve().parents[1]
    counts_data = json.loads((root / 'resources/control/latin-vulgate-gp-trigrams.json').read_text(encoding='utf8'))
    held = json.loads((root / 'resources/control/latin-vulgate-heldout-gp.json').read_text(encoding='utf8'))
    assert counts_data['n'] == 203357 and len(held['runes']) == 2400
    latin = np.array(held['runes'][:729], dtype=np.int16).reshape(27, 27)
    counts29 = np.array(counts_data['u'], dtype=np.float64)
    assert counts29.shape == (29,) and int(counts29.sum()) == 203357
    log29 = np.log((counts29 + 0.25) / (counts29.sum() + 29 * 0.25))
    direct = search_mle(original, log29, starts=100)
    rng = np.random.default_rng(0x99)
    direct_null = [search_mle(rng.permutation(original.reshape(-1)).reshape(27, 27),
                             log29, starts=100)['score'] for _ in range(20)]

    p28 = latin.copy()
    p28[0, 0] = 28
    ranks = feedback_rank(original)
    log28 = np.log((counts29[:28] + 0.25) / (counts29[:28].sum() + 28 * 0.25))
    feedback = blind_fit(ranks, log28, starts=100)
    rng = np.random.default_rng(0x99)
    feedback_null = [blind_fit(randomized_rank(ranks, rng), log28, starts=100)['score']
                     for _ in range(20)]
    return {
        'source': 'Independent Latin Vulgate heldout Revelation GP; 203357 separate Latin GP training runes',
        'directGP29': {
            'authenticLatinFourier': float(spectrum(latin).max()),
            'originalFourier': float(spectrum(original).max()),
            'originalBestLogScore': direct['score'],
            'nullMeanBestScore': float(np.mean(direct_null)),
            'shufflesAtLeastOriginal': sum(v >= direct['score'] for v in direct_null),
            'addOneP': (1 + sum(v >= direct['score'] for v in direct_null)) / 21
        },
        'feedbackGP28': {
            'authenticLatinFourier': spectral(p28),
            'originalFourier': spectral(ranks),
            'originalBestLogScore': feedback['score'],
            'nullMeanBestScore': float(np.mean(feedback_null)),
            'shufflesAtLeastOriginal': sum(v >= feedback['score'] for v in feedback_null),
            'addOneP': (1 + sum(v >= feedback['score'] for v in feedback_null)) / 21
        },
        'limits': 'Twenty source-matched full-key-refit controls per Latin architecture; conditional register check only.'
    }


if __name__ == '__main__':
    print(json.dumps({**run(), 'latinRobustness': latin_robustness(load()[0])}, indent=2))

"""Original LP2 27x27 additive row+column cipher invariant and GP inverse.

Run from a checkout containing resources/liber-primus/lp2-corpus.json,
resources/transcriptions/liber_primus_master.txt, and
resources/control/shakespeare_first300k.txt. Requires NumPy.

For any C[r,c] = P[r,c] + a[r] + b[c] (mod 29), the singular values
of exp(2*pi*i*k*C/29) equal those of exp(2*pi*i*k*P/29) exactly.
This tests all 29**53 different source-independent row/column pads at once.
The key-recovery control also attempts full GP plaintext inversion.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

os.environ['OPENBLAS_NUM_THREADS'] = '1'
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RUNES = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
RUNE_MAP = {r: i for i, r in enumerate(RUNES)}
DI = {'TH': 2, 'NG': 21, 'EO': 12, 'OE': 22, 'AE': 25, 'IA': 27, 'EA': 28}
LET = {'A': 24, 'B': 17, 'C': 5, 'D': 23, 'E': 18, 'F': 0, 'G': 6,
       'H': 8, 'I': 10, 'J': 11, 'K': 5, 'L': 20, 'M': 19, 'N': 9,
       'O': 3, 'P': 13, 'Q': 5, 'R': 4, 'S': 15, 'T': 16, 'U': 1,
       'V': 1, 'W': 7, 'X': 14, 'Y': 26, 'Z': 15}
ROOTS = np.exp(2j * np.pi * np.arange(29) / 29)
SHIFTS = np.arange(29)
REP = 2500
MLET = 40
MLES = 100
SEED = 0x3301


def gp_word(word: str) -> list[int]:
    """The existing canonical bigram-first GP Latin transliteration."""
    encoded = []
    i = 0
    while i < len(word):
        pair = DI.get(word[i:i + 2])
        encoded.append(LET[word[i]] if pair is None else pair)
        i += 1 if pair is None else 2
    return encoded


def load() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Original LP2 section p0..2; authentic plain LP1 section4; Shakespeare GP prior."""
    c = json.loads((ROOT / 'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))
    pages = c['pages'][:3]
    assert [p['runic_count'] for p in pages] == [262, 266, 201]
    original = np.array([v for p in pages for v in p['indices']], dtype=np.int16).reshape(27, 27)
    master = (ROOT / 'resources/transcriptions/liber_primus_master.txt').read_text(encoding='utf8')
    sections = [s for s in re.split(r'\s*\$\s*', master.split('\n\n', 1)[1])
                if any(r in RUNE_MAP for r in s)]
    assert len(sections) == 18
    solved = [RUNE_MAP[r] for r in sections[4] if r in RUNE_MAP]
    assert len(solved) == 755 and solved[:11] == [2, 18, 20, 3, 15, 15, 3, 0, 23, 10, 1]
    known = np.array(solved, dtype=np.int16)
    text = (ROOT / 'resources/control/shakespeare_first300k.txt').read_text(encoding='utf8')
    counts = np.zeros(29, dtype=np.int64)
    for word in re.findall(r'[A-Z]+', text.upper()):
        counts += np.bincount(gp_word(word), minlength=29)
    assert counts.sum() == 218800
    return original, known, counts


def spectrum(matrix: np.ndarray) -> np.ndarray:
    """Max singular value for all 14 non-conjugate mod29 Fourier characters."""
    assert matrix.shape == (27, 27)
    return np.array([np.linalg.svd(ROOTS[(matrix * k) % 29], compute_uv=False)[0]
                     for k in range(1, 15)])


def search_mle(cipher: np.ndarray, logq: np.ndarray, starts: int = 100) -> dict:
    """Source-blind row/column mod29 keys, unigram likelihood coordinate ascent."""
    rng = np.random.default_rng(20261)
    best_score = -float('inf')
    best_u = best_v = None
    scores = []
    for _ in range(starts):
        u = rng.integers(0, 29, size=27)
        v = rng.integers(0, 29, size=27)
        for _ in range(35):
            old_u, old_v = u.copy(), v.copy()
            for row in range(27):
                candidates = (cipher[row, :, None] - v[:, None] - SHIFTS[None, :]) % 29
                u[row] = int(np.argmax(logq[candidates].sum(axis=0)))
            for col in range(27):
                candidates = (cipher[:, col, None] - u[:, None] - SHIFTS[None, :]) % 29
                v[col] = int(np.argmax(logq[candidates].sum(axis=0)))
            if np.array_equal(old_u, u) and np.array_equal(old_v, v):
                break
        plain = (cipher - u[:, None] - v[None, :]) % 29
        score = float(logq[plain].sum())
        scores.append(score)
        if score > best_score:
            best_score, best_u, best_v = score, u.copy(), v.copy()
    assert best_u is not None and best_v is not None
    plain = (cipher - best_u[:, None] - best_v[None, :]) % 29
    assert np.array_equal((plain + best_u[:, None] + best_v[None, :]) % 29, cipher)
    return {'score': best_score, 'medianStartScore': float(np.median(scores)),
            'u': best_u, 'v': best_v, 'plain': plain}


def run() -> dict:
    original, known, counts = load()
    frozen = [known[j:j + 729].reshape(27, 27) for j in range(27)]
    reference_scores = [float(spectrum(m).max()) for m in frozen]
    seed = np.random.default_rng(SEED)
    row = seed.integers(0, 29, size=27)
    col = seed.integers(0, 29, size=27)
    planted = (frozen[0] + row[:, None] + col[None, :]) % 29
    assert np.allclose(spectrum(planted), spectrum(frozen[0]), atol=1e-10)
    real = float(spectrum(original).max())
    null_rng = np.random.default_rng(SEED)
    null = [float(spectrum(null_rng.permutation(original.reshape(-1)).reshape(27, 27)).max())
            for _ in range(REP)]
    null = np.array(null)
    null_sorted = np.sort(null)
    threshold = float(null_sorted[int(0.95 * REP)])
    q = (counts.astype(float) + 0.25) / (float(counts.sum()) + 29 * 0.25)
    logq = np.log(q)
    inverse_positive = search_mle(planted, logq, MLES)
    inverse_original = search_mle(original, logq, MLES)
    mle_rng = np.random.default_rng(0x20261110)
    mle_null = [search_mle(mle_rng.permutation(original.reshape(-1)).reshape(27, 27),
                           logq, MLES)['score'] for _ in range(MLET)]
    actual_recovery = int(np.count_nonzero(inverse_positive['plain'] == frozen[0]))
    best = inverse_original['plain'].reshape(-1)
    report = {
        'source': 'LP2 physical p0..2 729 original GP runes, 27x27; GP LP1 section4 755 known plaintext runes',
        'model': 'C[r,c]=(P[r,c]+u[r]+v[c]) mod29, any 27 row and 27 column keys; 29-fold gauge equivalence',
        'invariant': 'max over Fourier characters k=1..14 of top singular value of exp(2pi i k C/29)',
        'original': {'statistic': real, 'nullAtLeastReal': int(np.count_nonzero(null >= real)),
                     'nullAddOneUpperP': (1 + int(np.count_nonzero(null >= real))) / (REP + 1)},
        'null': {'seed': SEED, 'replicates': REP, 'originalRuneHistogramPreserved': True,
                 'median': float(np.median(null)), 'p95': threshold, 'max': float(null_sorted[-1])},
        'nativeLP1Windows': {'overlappingWindows': len(frozen), 'minimumStatistic': min(reference_scores),
                             'maximumStatistic': max(reference_scores),
                             'aboveShuffled95thPercentile': sum(v > threshold for v in reference_scores),
                             'plantExactFourierInvariance': True},
        'independentEnglishPrior': {'source': 'First 300,000 Shakespeare characters, GP word encoder',
                                     'runicTrainingSymbols': int(counts.sum()), 'smoothingPerSymbol': 0.25},
        'nativeKeyRecovery': {'source': 'LP1 section4, additive independent 27+27 keys',
                              'seed': SEED, 'searchStarts': MLES,
                              'runesRecovered': actual_recovery,
                              'totalRunes': 729,
                              'sourceNativeTrueKeyLogScore': float(logq[frozen[0]].sum()),
                              'bestInverseLogScore': inverse_positive['score'],
                              'exactReencryption': True},
        'originalKeySearch': {'searchStarts': MLES, 'bestInverseLogScore': inverse_original['score'],
                              'matchedShuffledControls': MLET,
                              'matchedShuffledMean': float(np.mean(mle_null)),
                              'matchedShuffledAtLeastOriginal': sum(v >= inverse_original['score'] for v in mle_null),
                              'matchedShuffledAddOneUpperP': (1 + sum(v >= inverse_original['score'] for v in mle_null)) / (MLET + 1),
                              'medianStartScore': inverse_original['medianStartScore'],
                              'decodedFirst80RuneIndices': best[:80].tolist(),
                              'sourceExactReencryption': True,
                              'authenticPlaintext': False},
        'limits': 'Requires genuine GP-English direct plaintext and row+column additive mod29 keys, GP rune order as printed; no unknown global alphabet permutation, binary encoding, transposition, or separate cipher layer. Source-language native windows overlap; no discovery-wide significance assigned.'
    }
    assert report['nativeLP1Windows']['aboveShuffled95thPercentile'] == 27
    assert report['original']['nullAddOneUpperP'] > 0.05
    assert report['originalKeySearch']['matchedShuffledAddOneUpperP'] > 0.05
    return report


if __name__ == '__main__':
    print(json.dumps(run(), indent=2))

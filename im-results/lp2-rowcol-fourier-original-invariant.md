# LP2 27×27 row-column cipher: a key-free Fourier invariant and original-source inverse

**Evidence:** Original-input, source-native negative result for a fully specified additive GP29 family, Agent 4, 10 November 2026. No unknown-page plaintext, authentic key or destination recovered.

## Why the opening 729 runes matter

The original LP2 physical pages 0, 1 and 2 contain exactly **262 + 266 + 201 = 729** GP runes. This makes a 27×27 row-major layout an unusually concrete source-defined hypothesis. The external 27×27-key-node route has already been independently tested and remains nonpredictive; this study investigates a **different cipher architecture** in which the printed row and column determine independent key contributions.

The proposed family is

\[
C_{r,c}=(P_{r,c}+u_r+v_c)\bmod 29,\quad 1\le r,c\le27.
\]

Every row has a secret additive rune key and every column has another. After fixing the one global gauge ambiguity this is **29^53 distinct pads**. The model permits entirely arbitrary row and column key values, so failure cannot be attributed to guessing the wrong key string, starting phase or source-grid key.

## Exact key-independent invariant

Let \(\omega=\exp(2\pi i/29)\), and for each nonzero \(k\) form the 27×27 complex matrix \(M_k(X)\) with entry \(\omega^{kX_{r,c}}\). Under the row-plus-column cipher,

\[
M_k(C)=D_k(u)M_k(P)D_k(v),
\]

where both diagonal factors are unitary. **All singular values are preserved exactly**, for any unknown row and column keys. Because \(k\) and \(29-k\) are complex conjugates, search just **k=1,...,14**. The fixed score is the maximum largest singular value over these fourteen Fourier characters. This test uses no decryption-key optimization and is sensitive to distributional GP-English structure.

Inputs are the original LP2 indices in resources/liber-primus/lp2-corpus.json and a separate actual solved Liber Primus control: LP1 section 4 (the GP-rune passage beginning “THE LOSS OF DIVINITY”), which has **755 original runes** in resources/transcriptions/liber_primus_master.txt. Its **27 overlapping 729-rune windows** are reference language controls, not independent trials. The synthetic encryption adds independent random modulo-29 row and column keys and verifies the Fourier score is exactly preserved.

## Original result and power

Every permutation null reshuffles the **729 actual LP2 indices**, retaining their exact 29-rune histogram and recomputing the complete fourteen-character statistic. Deterministic NumPy seed 0x3301 gives **2,500** independently shuffled controls.

| Comparison | Fourier maximum |
| --- | ---: |
| Actual LP2 pages 0–2 | **10.0199311092** |
| Shuffled original, median | **10.0786479029** |
| Shuffled original, 95th percentile | **10.3851581245** |
| Shuffled original, maximum | **10.7616996503** |
| Native solved LP1 windows, minimum | **10.9266470879** |
| Native solved LP1 windows, maximum | **11.3932084856** |

**1,630/2,500** permutation nulls match or exceed the original, giving add-one upper-tail **1631/2501 ≈ 0.652139**. The observed opening ciphertext is ordinary under this key-free GP-English detector. All 27 overlapping known-LP1 windows exceed the 95th percentile of the same control distribution, and their scores remain exactly invariant under arbitrary planted row and column keys.

This specifically disfavors **literal GP-English plaintext hidden by any additive row/column mod29 pad** on the natural 27×27 opening arrangement. It does not exclude unknown outer substitutions, binary encodings, layer permutations, other languages or a different geometry. Permutation-null results are conditional on this selected hypothesis, not a universal cipher p-value.

## Direct attempted key and plaintext recovery

The same original-cipher family permits an independent inverse by fitting all 54 key parameters. Build a GP unigram reference from the **first 300,000 characters of the separate Shakespeare corpus**, using the existing bigram-first Gematria Primus mapping. It gives **218,800 training runes**. Add 0.25 pseudo-count per rune, then perform 100 seeded random-start rounds of exact per-row and per-column 29-way maximization, up to 35 coordinate-ascent sweeps each. The fitted decryption exactly reproduces its ciphertext upon re-encryption, but re-encryption alone is not evidence of authentic plaintext because any chosen row/column key does so.

| Fit | Best GP unigram log likelihood | Independent recovery |
| --- | ---: | --- |
| Planted LP1 GP-English under actual row/column masks | **−2187.5441** | **675/729** exact original rune values recovered |
| Original LP2 p0–2, same fully blind search | **−2385.4853** | No authentic text or key |
| Forty histogram-preserving shuffled originals, same full 100-start search | Mean **−2380.5198** | **30/40** scores at least as good as original |

The original model's fitted score is **worse than the shuffled-input mean**; add-one upper-tail **31/41 ≈ 0.75610**. The planted model is simultaneously detected by the independent Fourier invariant and practically inverted from GP-English statistics, while the original fails both. The original source can always be re-encrypted exactly from its fitted arbitrary pads; that trivial property must not be confused with a solution.

## Interpretation and next useful experiment

The result rejects an otherwise vast keyspace **without selecting any key or plaintext hypothesis on the original**. Unlike a search over a few table offsets, it covers **every** 27-row-plus-27-column additive mask under the specified physical layout. Its independent solved-LP1 plant establishes that the test has power on authentic manuscript-style GP-English, and its source-blind MLE also establishes that the inversion implementation can recover the majority of a true hidden message.

A next productive attack would require a source-defined cipher transformation outside this family, such as a cryptographically justified nonlinear alphabet map or a specific, independently determined position permutation. Blindly searching more row/column key strings cannot rescue this model. The external 27×27 geometric route and its existing full block-39 enumeration have already been explored; do not duplicate them.

**Reproduce** with the single source-reading Python/NumPy program at [sims/lp2_rowcol_fourier_inverse.py](../sims/lp2_rowcol_fourier_inverse.py). It asserts exact original page lengths, the native solved-LP1 source and Shakespeare training count, synthetic Fourier invariance, real-code re-encryption, and matched permutation-calibrated results. All original data and control resources are already in this repository.
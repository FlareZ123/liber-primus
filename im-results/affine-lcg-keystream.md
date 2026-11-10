# Correlated additive keystreams: affine-LCG attack and a necessary correction

**Status:** negative result under a bounded, calibrated model; no plaintext or key recovered. Executed 2026-11-10 by Agent 11.

## Why this family matters

Across LP2 pages 0–55 the 55 rune-bearing pages contain **12,956 ciphertext runes** and **2,896 rune words**. Only 86 of the 12,901 within-page adjacent pairs repeat the same rune (0.6666%). The unusual deficit motivates stateful enciphering, but **does not mathematically exclude every additive keystream independent of the plaintext**.

For a 29-symbol additive cipher `C_i = P_i + K_i (mod 29)`:

`C_i = C_(i-1)` exactly when `P_i - P_(i-1) = -(K_i-K_(i-1)) (mod 29)`.

A uniformly sampled, independent key difference makes the expected equality rate `1/29`. A correlated or deterministic key difference does **not** have that implication. As an explicit counterexample, `P_i=0` and `K_i=i (mod 29)` produce perfectly balanced ciphertext symbols with **zero** equal adjacent symbols. This is a construction-level counterexample, not a claim about LP2 plaintext. For a natural-language check using the Wulfic canonical solved-English text, the additive counter `K_i=6*i mod29`, with A..Z mapped to 0..25 and the counter reset at each line, gives **41 repeated ciphertext neighbors among 3,007 within-line pairs (1.363%)**. The effect is real for an English register, though it remains above LP2's 0.666%.

Some prior public prose describes the LP2 doublet deficit as *excluding all plaintext-independent additive keystreams*; see [Dukotah Campaign VII, section 0](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md). That universal wording requires an additional independence or uniform-increment condition. The present result corrects that overreach without rescuing any particular key hypothesis.

## New local attack: all affine-LCG trajectories modulo 29

Consider keys satisfying `K_(i+1)=a*K_i+b (mod 29)`, decoded by `P_i=C_i-K_i (mod 29)`. Test counter resets at (1) LP2 rune-stream start, (2) each manuscript page, and (3) each transcription rune word. Line and page breaks are correctly treated as possible continuations of words. As the printed grid-only page 50 contains no runes, it is excluded from the rune stream, while manuscript page numbers are preserved.

Over the finite field of size 29, the affine recurrence can be written `K_i=q+(s-q)*a^i` for `a != 1`, with `q=b/(1-a)`. The constant term `q` only rotates the decoded histogram and cannot affect its Pearson chi-square against a flat 29-symbol distribution. This reduces the exact family to **813 distinctive sequences**: 756 nonconstant multiplicative orbits (`a=2..28`, nonzero amplitudes), 28 arithmetic counters (`a=1`, nonzero increments), one constant trajectory, and 28 first-position impulse trajectories (`a=0`).

Each class and three reset modes is scored by the decoded 29-symbol unigram chi-square. Under a genuine one-rune-per-plaintext-symbol English decryption, a strong nonuniform profile is expected. The statistic deliberately cannot detect a decryption whose 29 plaintext symbols themselves have nearly flat frequencies.

To account for searching all keys and reset conventions, use **200 independent page-local cyclic rune rotations** as surrogate corpora, fixed PRNG seed 3301. Each surrogate retains the exact per-page rune multiset and all but one adjacent pair of its circular order, but breaks alignment with the proposed key phases. The family-wise null score is the **maximum** over the same 813 classes and three modes for each surrogate.

| Quantity | Observed / calibration |
|---|---:|
| Strongest observed class | global, `a=2,b=0,s=5`, period 28 |
| Strongest chi-square | **66.907070** |
| Decoded rune counts for that class | 381–522 |
| Null median of maximum | 60.133838 |
| Null 95th percentile | 69.566224 |
| Null 99th percentile | 77.060204 |
| Surrogate maxima meeting/exceeding observed | 20 / 200 |
| Family-wise p-value, add-one | **21 / 201 = 0.104478** |

**Interpretation:** no significant deviation from the calibrated null. The strongest candidate has an almost-flat decoded marginal distribution, unlike the solved English register. This is evidence against a *direct, no-skip one-rune English decoding* by an affine-LCG keystream with the tested resets. It cannot exclude nonlinear correlated keys, symbol skipping, variable-length decoding, a different target register, or an external key.

## Reproduction and positive control

- [Complete source](../sims/lcg_keystream_scan.cjs): `node sims/lcg_keystream_scan.cjs --selftest` and `node sims/lcg_keystream_scan.cjs --trials 200`.
- [On-demand GitHub Actions execution](https://github.com/FlareZ123/liber-primus/actions/runs/42740319773), successful on Node 22.23.4.
- Self-test plants an affine-LCG-generated ciphertext from 3,825 English letters. The scanned correct class `a=2,b=0,s=5` is recovered at a chi-square of **4,576.470588**, and exact ciphertext-to-plaintext inversion is asserted.
- Corpus invariant checks cover 55 rune-bearing pages, **12,956 runes**, **2,896 words**, and each page's rune indices. The page/word boundaries are from the shared transcription (a derived witness, not independent evidence from scans).

**Remaining opportunity:** test *specific* non-LCG correlations of `K_i-K_(i-1)` that predict the doublet deficit while supplying strong held-out English likelihood. Avoid treating the doublet deficit as a blanket exclusion of additive streams.

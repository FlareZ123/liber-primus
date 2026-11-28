# LP2 lag-1 repeat suppression: reproduced ciphertext-generation constraint

**Agent 8 — 2026-11-28. Status: established structural observation; mechanism unresolved.**

This report reproduces, on this repository's own image-corrected LP2 stream, a high-consequence structural result that was absent from the current `results/README.md` but had been independently developed in the external `Dukotah/cicada3301` research corpus. It constrains any viable generation/decryption model before language scoring: the unknown LP2 stream is marginally near-uniform, yet adjacent equal runes are suppressed about fivefold.

It does **not** recover plaintext and does **not** identify a particular rejection-sampling implementation. The robust result is the ciphertext transition structure and its non-stationary leakage.

## Scope and source

Input: `resources/transcriptions/lp2-image-corrected.txt`.

The first 55 rune-bearing blocks correspond to the 56 unresolved physical pages p0–p55, with physical p50 rune-free. Keeping only Runic Unicode codepoints gives exactly **12,956 runes**, **29 symbols**, and **12,955 adjacent pairs**.

## Core measurement: a depleted lag-1 diagonal

Observed equal-adjacent pairs:

- **86 / 12,955 = 0.66384%**

Random-permutation reference from the actual rune marginals:

- **3.44784%**
- expected count ≈ **446.668**

A binomial scale reference is z≈**−17.37** (log10 lower tail ≈−98.62). Adjacent pairs are dependent, so that is descriptive scale rather than the inferential basis.

Equality immediately returns near the random floor after lag 1: lag2 441/12954=3.4044%, lag3 3.3892%, lag4 3.5439%, lag5 3.6986%; lags 6–20 likewise cluster around ~3.45% (lag11 is 2.9818%). The dominant anomaly is therefore specific to lag 1.

## The rest of the first-order matrix is ordinary

Let `T[a,b]` be the 29×29 adjacent-rune table. Remove the 29 diagonal cells and, within each source-rune row, compare the remaining destination counts with observed destination marginals renormalized to exclude the source rune.

Across the **812 off-diagonal cells**:

- Pearson χ² = **784.252928**
- approximate df = **783**
- Wilson–Hilferty χ² survival approximation p = **0.48066**

So once equality is excluded, this test sees no broad first-order digraphic structure.

Condition on the 86 surviving diagonal events and allocate them across rune identities in proportion to each rune's random-permutation opportunity `n_r(n_r-1)`:

- χ² = **27.775872** on 28 df
- asymptotic p≈0.476
- independent 500,000-draw multinomial Monte Carlo p≈0.472

The residual doublets are compatible with a common suppression factor across rune identities. The signature is one depleted diagonal, not a collection of favored pairs.

## The suppression crosses printed boundaries

| class | pairs | doublets | rate |
|---|---:|---:|---:|
| within one printed group | 9,640 | 60 | **0.6224%** |
| across a printed group boundary | 3,261 | 26 | **0.7973%** |
| across a printed line break | 539 | 4 | **0.7421%** |
| across a printed period | 162 | 1 | **0.6173%** |
| across rune-bearing page blocks | 54 | 0 | **0%** |

The page-boundary sample is too small to interpret alone. The larger within/across-group samples show the lag-1 hole is not a word-separator or within-word artifact.

## The leakage is non-stationary

Sequential 1,000-rune block doublet counts (last block 956 runes):

`[8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]`

The 85 gaps between 86 doublet positions have mean **150.7882** and lag-1 gap autocorrelation **+0.380019689**.

A fresh null conditioned on exactly 86 event positions, sampled uniformly without replacement among the 12,955 pair positions with Python `random.Random(3301)`, gives:

- 200,000 null draws
- **82** gap-autocorrelations ≥ observed
- add-one one-sided Monte Carlo p = **0.000414998**

A coarse Pearson test of block counts alone is not significant (χ²≈15.71 on 12 df, p≈0.205); the evidence is in the **ordering/autocorrelation**, not simple overdispersion. A stationary independent “keep a repeat with one fixed probability” leak is therefore inadequate.


## Top-level chapter cuts do not explain T7

The normalized `# LP2 lag-1 repeat suppression: reproduced ciphertext-generation constraint

**Agent 8 — 2026-11-28. Status: established structural observation; mechanism unresolved.**

This report reproduces, on this repository's own image-corrected LP2 stream, a high-consequence structural result that was absent from the current `results/README.md` but had been independently developed in the external `Dukotah/cicada3301` research corpus. It constrains any viable generation/decryption model before language scoring: the unknown LP2 stream is marginally near-uniform, yet adjacent equal runes are suppressed about fivefold.

It does **not** recover plaintext and does **not** identify a particular rejection-sampling implementation. The robust result is the ciphertext transition structure and its non-stationary leakage.

## Scope and source

Input: `resources/transcriptions/lp2-image-corrected.txt`.

The first 55 rune-bearing blocks correspond to the 56 unresolved physical pages p0–p55, with physical p50 rune-free. Keeping only Runic Unicode codepoints gives exactly **12,956 runes**, **29 symbols**, and **12,955 adjacent pairs**.

## Core measurement: a depleted lag-1 diagonal

Observed equal-adjacent pairs:

- **86 / 12,955 = 0.66384%**

Random-permutation reference from the actual rune marginals:

- **3.44784%**
- expected count ≈ **446.668**

A binomial scale reference is z≈**−17.37** (log10 lower tail ≈−98.62). Adjacent pairs are dependent, so that is descriptive scale rather than the inferential basis.

Equality immediately returns near the random floor after lag 1: lag2 441/12954=3.4044%, lag3 3.3892%, lag4 3.5439%, lag5 3.6986%; lags 6–20 likewise cluster around ~3.45% (lag11 is 2.9818%). The dominant anomaly is therefore specific to lag 1.

## The rest of the first-order matrix is ordinary

Let `T[a,b]` be the 29×29 adjacent-rune table. Remove the 29 diagonal cells and, within each source-rune row, compare the remaining destination counts with observed destination marginals renormalized to exclude the source rune.

Across the **812 off-diagonal cells**:

- Pearson χ² = **784.252928**
- approximate df = **783**
- Wilson–Hilferty χ² survival approximation p = **0.48066**

So once equality is excluded, this test sees no broad first-order digraphic structure.

Condition on the 86 surviving diagonal events and allocate them across rune identities in proportion to each rune's random-permutation opportunity `n_r(n_r-1)`:

- χ² = **27.775872** on 28 df
- asymptotic p≈0.476
- independent 500,000-draw multinomial Monte Carlo p≈0.472

The residual doublets are compatible with a common suppression factor across rune identities. The signature is one depleted diagonal, not a collection of favored pairs.

## The suppression crosses printed boundaries

| class | pairs | doublets | rate |
|---|---:|---:|---:|
| within one printed group | 9,640 | 60 | **0.6224%** |
| across a printed group boundary | 3,261 | 26 | **0.7973%** |
| across a printed line break | 539 | 4 | **0.7421%** |
| across a printed period | 162 | 1 | **0.6173%** |
| across rune-bearing page blocks | 54 | 0 | **0%** |

The page-boundary sample is too small to interpret alone. The larger within/across-group samples show the lag-1 hole is not a word-separator or within-word artifact.

## The leakage is non-stationary

Sequential 1,000-rune block doublet counts (last block 956 runes):

`[8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]`

The 85 gaps between 86 doublet positions have mean **150.7882** and lag-1 gap autocorrelation **+0.380019689**.

A fresh null conditioned on exactly 86 event positions, sampled uniformly without replacement among the 12,955 pair positions with Python `random.Random(3301)`, gives:

- 200,000 null draws
- **82** gap-autocorrelations ≥ observed
- add-one one-sided Monte Carlo p = **0.000414998**

A coarse Pearson test of block counts alone is not significant (χ²≈15.71 on 12 df, p≈0.205); the evidence is in the **ordering/autocorrelation**, not simple overdispersion. A stationary independent “keep a repeat with one fixed probability” leak is therefore inadequate.
 top-level boundaries occur at unknown-rune offsets
`729, 1874, 3612, 5506, 6527, 7960, 9640`, partitioning the 12,956-rune tape into eight sections. Their within-section doublet counts/rates are:

| section runes | doublets / pairs | rate |
|---:|---:|---:|
| 729 | 4 / 728 | 0.5495% |
| 1,145 | 6 / 1,144 | 0.5245% |
| 1,738 | 9 / 1,737 | 0.5181% |
| 1,894 | 10 / 1,893 | 0.5283% |
| 1,021 | 11 / 1,020 | 1.0784% |
| 1,433 | 13 / 1,432 | 0.9078% |
| 1,680 | 12 / 1,679 | 0.7147% |
| 3,316 | 21 / 3,315 | 0.6335% |

A common-rate Pearson test is χ²≈**5.629** on 7 df (p≈**0.584**), so section count heterogeneity is not significant. None of the seven section-crossing pairs is a doublet, but seven trials have negligible power.

A separate unrestricted one-step rate scan (minimum 250 pairs on each side) finds its best cut at pair offset **4,579**: 21/4,579 = 0.4586% before and 65/8,376 = 0.7760% after, likelihood-ratio statistic 4.797. Under 100,000 count-conditioned random placements of the same 86 events (seed 3301), the scan-corrected exceedance rate is **0.4993**. Thus T7 is not explained by one hidden global rate step either.

## Current q8 controls miss the structural target

The common-cycle q8 family remains algebraically open, but its current calibrated controls do not reproduce LP2's defining lag-1 property.

The two frozen plants in `im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json` contain 299 runes each and have:

- plant 0: **9/298 = 3.0201%** adjacent equality;
- plant 1: **8/298 = 2.6846%**.

A larger deterministic calibration used all nine pinned solved-native GP29 records (`resources/external/relikd-solved-gp29-native-v1.json`), parsed into 740 words / 2,979 runes. For each of 10,000 plants, the SFT draws a fresh common alphabet permutation fixing F, a primitive gauge-normalized q8 shift vector with `k0=1`, and independent word-start phases using a pinned 32-bit LCG. The resulting 2,978-pair repeat-count distribution is:

- minimum: **53/2,978 = 1.7797%**;
- 1st percentile: **75/2,978 = 2.5185%**;
- median: **107/2,978 = 3.5930%**;
- 95th percentile: **134/2,978 = 4.4997%**;
- maximum: **167/2,978 = 5.6078%**;
- plants ≤1%: **0/10,000**;
- plants ≤LP2's 0.66384%: **0/10,000**.

This is a **generative-calibration failure, not an algebraic exclusion of q8**. The q8 action space is large enough that a deliberately selected chart/key/phase schedule might suppress repeats, and the original plaintext is unknown. The result says the current “matched native” q8 plants are not actually matched to a first-order property that is now known to dominate original LP2. Further expensive q8 receiver work should first demonstrate a planted q8 construction that reproduces the lag-1 hole (including across word boundaries) without selecting its secret parameters by looking at the original ciphertext statistic after the fact.

Reproduce:

```
python sims/lp2_q8_lag1_structural_calibration_sft.py
```

## What is established

1. LP2 has an extreme lag-1 identity deficit.
2. Lags ≥2 immediately return near the marginal random floor.
3. Off-diagonal lag-1 transitions are ordinary under the row-conditioned marginal test.
4. The suppression crosses printed group and line boundaries.
5. Residual repeat events have order-correlated/non-stationary spacing at the measured scale.

This strongly favors an **adjacent-identity-avoidance process or equivalent state-dependent construction** over a memoryless random-looking output model. The statistic alone does not locate the process: encryption, key generation, plaintext/ciphertext transformation, or another stateful stage remain possible.

The operational consequence is concrete: **every proposed generator/decryptor should reproduce both the lag-1 diagonal hole and the measured leakage structure as a pre-language control.** A model emitting ordinary ≈1/29 adjacent equality is structurally wrong even if a tuned key makes a short interval look linguistic.

## Independent prior work

After independently measuring the statistic locally, Agent 8 located the external `Dukotah/cicada3301` research program, pinned here at commit
[`b271334d9718bf68187f7a1e6362731159c36a2a`](https://github.com/Dukotah/cicada3301/tree/b271334d9718bf68187f7a1e6362731159c36a2a).

Relevant prior files:

- [DOUBLET-INVESTIGATION.md](https://github.com/Dukotah/cicada3301/blob/b271334d9718bf68187f7a1e6362731159c36a2a/liber-primus/analysis/DOUBLET-INVESTIGATION.md)
- [Round 18 L2 filter-leak results](https://github.com/Dukotah/cicada3301/blob/b271334d9718bf68187f7a1e6362731159c36a2a/liber-primus/analysis/round18/L2-filter-leak/RESULTS.md)
- [Round 44 synthesis](https://github.com/Dukotah/cicada3301/blob/b271334d9718bf68187f7a1e6362731159c36a2a/liber-primus/analysis/round44/SYNTHESIS.md)
- [Round 48 independent pass](https://github.com/Dukotah/cicada3301/blob/b271334d9718bf68187f7a1e6362731159c36a2a/liber-primus/analysis/round48/M1-INDEPENDENT-PASS.md)

That corpus had already found the same 86/12,955 deficit and the same 1,000-rune block sequence. This report therefore does **not** claim global novelty. The material advance for this shared repository is to import a previously absent high-consequence constraint only after reproducing it from the local canonical stream, preserve the independent prior at a pinned commit, and place the constraint in the authoritative frontier.

External claims about the exact filter implementation, OTP class, generator family, or decoder are **not imported as established facts** here.

## Reproduction

Core deterministic check:

```
python sims/lp2_lag1_repeat_structure_sft.py
```

Full ordering null:

```
python sims/lp2_lag1_repeat_structure_sft.py --permutations 200000 --seed 3301
```

The pinned standard-library RNG path reports 82/200,000 exceedances.

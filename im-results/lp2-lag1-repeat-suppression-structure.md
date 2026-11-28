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

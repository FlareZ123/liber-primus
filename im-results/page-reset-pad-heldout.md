# Held-out page-reset additive pad and independent key-skip probe

**Status:** Completed negative experiment (Agent 30, 2026-11-10). No decrypted text, real key, or validated encryption architecture was recovered. The tested model is narrowly specified.

## Actual cryptanalytic question

Could all 55 rune-bearing unsolved LP2 pages restart the **same** mod-29 additive keystream at the beginning of each physical page, with independent losses of synchronization when a duplicate output rune is avoided? This would explain how exact page-aligned matching can fail despite keystream reuse.

The model is C(page,i) = (P(page,i) + K(j(page,i))) mod 29. The key index starts at zero on each page, advances at least once per plaintext rune, and may advance additional times to skip keys that would create a repeated ciphertext rune. The same key symbols and same rune ordering are used on every page. The test does not cover page-dependent permutations, different key offsets or initial states, or long drifting section-based key schedules.

## Out-of-page test

Input: resources/liber-primus/lp2-corpus.json, all 55 unsolved rune-containing pages (LP2 0–49, 51–55). Each has at least 64 runes. Model the plaintext rune distribution using the **180 actual rune indices** from previously solved LP2 pages 56–57, with Laplace smoothing of one count per rune.

For each of seven fixed-seed approximately half-and-half page splits, estimate **each candidate key rune independently** from only the training pages. Maximize the product of the 29-element smoothed reference frequencies evaluated at (C-K) mod 29. Score the held-out pages under that training-selected key, using log-likelihood ratios relative to uniform ciphertext. Average the held-out score over seven splits at cumulative windows of 16, 32, and 64 runes.

Calibrate the **same complete fit-and-holdout procedure** against 350 independent page-wise circular rotations (preserving within-page runes and local structure), then independently against 350 page-wise additive rune-label shifts (preserving all positional structure and no-repeat behavior). The familywise comparison takes the maximum standardized score across the three windows in each replicate. Seed: 0x13011995, generator: xorshift32.

## Executed results

[Manual GitHub Actions run 42742397757](https://github.com/FlareZ123/liber-primus/actions/runs/42742397757) succeeded and reproduces these values:

| Model window | Held-out log LR | Rotation z | Rotation p | Label-shift z | Label-shift p |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 16 | -56.121 | +1.727 | 0.0370 | +1.520 | 0.0826 |
| 32 | -125.487 | +1.096 | 0.1254 | +0.953 | 0.1795 |
| 64 | -266.574 | +0.349 | 0.3761 | +0.298 | 0.3818 |

Familywise maximum-z p-value: **0.09687** under rotated pages and **0.13105** under rune-label shifts. The nominal 16-rune rotation p-value does **not** survive this correction; it is also not significant under the rune-label shift null. These results provide no statistically convincing evidence of a common page-reset key.

An earlier exploratory in-sample fit to windows 8–128, using 51 pages (those at least 128 runes long), had nominal rotation p-values near 0.01 at windows 8 and 32. These apparent effects diminished under out-of-page prediction and the broader inclusion/stronger controls. They must not be promoted to a recovery claim.

## Positive and negative controls

Sixty simulated runs were generated for each control: independent plaintext draws from the smoothed solved-page rune distribution, a random uniform 29-symbol keystream, and an **83% probability of skipping a proposed key symbol when it would repeat the previous ciphertext rune**. The planted positive case shared the key across all pages; the negative used independent page keys. Each control used the real 55 page lengths.

At windows 16, 32 and 64, **60/60** planted shared-key simulations exceeded the corresponding 95th percentile of the rotated-page null. Independently keyed false-positive fractions were 0.050, 0.033 and 0.083. This establishes useful simulated sensitivity to a particular page-reset shared-pad and key-skip mechanism. It does not establish power against all shared-key mechanisms or prove arbitrary keystream independence.

## Implication and next attacks

A single shared additive page-reset keystream is an unpromising explanation of all 55 pages under the tested plaintext register and key-skip model. The evidence does not exclude key reuse within a *subset* of pages, section resets, unknown initial key offsets, per-page substitutions, non-additive combiners, or a single independently seeded keystream per page. A future shared-keystream search should specify one of those changes and demonstrate a planted positive control before investing in a full scan. Avoid using a fitted score on the same pages as evidence of recovered key material.

Executable: [sims/page_start_pad_cv.cjs](../sims/page_start_pad_cv.cjs). Manual workflow: [page-start-pad.yml](../.github/workflows/page-start-pad.yml).

# Unknown outer rune permutation over base60-grid pad

**Status:** Calibrated negative search, Agent 30, 2026-11-10. No plaintext, recovered authentic alphabet, or recovered key.

## What new cryptographic assumption is tested?

The numeric table spanning LP2 pages 49–51 contains 256 base60-encoded bytes. This experiment asks whether those bytes, reduced modulo 29 in their documented row-major order, form a page-reset additive keystream hidden by **one unknown arbitrary permutation of all 29 ciphertext rune labels**.

For every unsolved rune page (55 pages), the model is:

    C(page,t) = sigma((P(page,t) + K[(offset+t) mod 256]) mod 29)

where sigma can be any permutation, offset is one of 256 positions, and P is a plaintext rune drawn from the smoothed empirical distribution of the 180 solved LP2 runes. The key is directly prescribed from the grid's byte values; its order and mod-29 interpretation are assumptions, not discoveries.

This is a bounded nonlinear-sigma attack absent from earlier direct grid-key sweeps. It does not cover alternate byte order, per-page sigma, ciphertext-driven key skips with unknown positions, other byte mappings, or composite transposition.

## Exact method and independence

Each offset uses only half of the pages to estimate sigma by maximizing a **29×29 linear assignment** of ciphertext rune labels to hidden additive-alphabet labels. The exact maximum-weight assignment is computed with the Hungarian method. The other pages measure held-out log likelihood ratio against uniform output. Three cumulative beginning-of-page windows are used: 16, 32, and 64 runes. The search takes the best held-out score over all 256 offsets per window.

Training/test pages are determined by one seeded shuffle (seed 0x10299391). This division is held fixed when comparing the original key with **100 independently reshuffled grid keys**, preserving the exact 256-value histogram. The familywise null calibrates the maximum standardized score across the three searched window sizes. The search includes both key offset fitting and all 29! candidate alphabet permutations through exact optimization.

## Executed results

[GitHub Actions run 42744858874](https://github.com/FlareZ123/liber-primus/actions/runs/42744858874) succeeded and exactly reproduced:

| Window | Best grid-key offset | Held-out score | Shuffled-grid mean | z | Upper-tail p |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 16 | 255 | -33.4834 | -34.7309 | +0.3099 | 0.3663 |
| 32 | 27 | -84.7839 | -83.1387 | -0.2744 | 0.6139 |
| 64 | 89 | -208.6643 | -201.0766 | -0.7820 | 0.8119 |

**Familywise p = 0.7822** over the searched windows. There is no evidence for this prescribed grid-pad / global nonlinear-rune-relabeling mechanism.

## Planted-power checks

Twenty-four synthetic experiments per control were constructed with **random outer alphabet permutations** and a grid-aligned additive keystream shared across pages. In the first group, there was no intentional anti-repeat repair. In the second, a repeated output rune triggered an independent additional keystream advance with probability 0.83. Positive detection fractions at the corresponding 95th percentile of the shuffled-grid null were:

| Window | No-skip plants | Skip-repair plants |
| ---: | ---: | ---: |
| 16 | 24/24 | 24/24 |
| 32 | 24/24 | 21/24 |
| 64 | 24/24 | 18/24 |

Thus the method detects the specified hidden-permutation key if it is genuinely present and retains some power with key-skip drift, particularly at the first 16 runes. Recovery under other language distributions, changing outer permutations, or non-row-major key formation remains untested.

## Source and reproduction

Program: [sims/grid_outer_permutation_cv.cjs](../sims/grid_outer_permutation_cv.cjs). On-demand runner: [grid-outer-permutation.yml](../.github/workflows/grid-outer-permutation.yml). Inputs: [page-addressed LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) and [the derived base60-byte grid](../resources/liber-primus/base60-grid.json). Source note: disputed grid token readings exist across transcriptions; this program uses the current shared byte grid and is a test of that exact input.

Do not treat the fitted permutation for the best noise score as a discovery or reuse its fitted labels as authentic plaintext. A genuine claim requires a held-out score well beyond matched permutations and independently decoded language.

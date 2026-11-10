# LP2 affine order of separated rune triplets (Agent 13, 2026-11-10)

**Status:** bounded negative. No recovered LP2 plaintext, key, or cipher mechanism. The test targets a new hypothesis distinct from affine feedback decoding: **a modular three-rune relation visible after direct numeric interpretation of the ciphertext**. A passing positive control checks that the screen can recognize an injected modular recurrence.

## Input and candidate structure

Input: `resources/liber-primus/lp2-corpus.json`, all 55 rune-bearing unsolved LP2 pages (0–49, 51–55), totaling **12,956** numeric ciphertext symbols. The runeless physical p50 grid is excluded from the triplets without renumbering pages. Triplets may cross words and printed lines, as arithmetic might operate on a continuous page stream; they **never cross physical pages**.

For each stride `s=1,...,8`, take `x=C[i-2s]`, `y=C[i-s]`, `z=C[i]`, retaining **only** triples with all three rune identities distinct. With canonical GP rune indices in the field `F_29`, compute the slope

`r = (z-x) * inverse(y-x) mod 29`.

The restriction to three distinct labels ensures slopes `2..28`. A fixed recurrence `z = x + a(y-x) mod 29` for an `a` in that range would increase one bin; less rigid formula families could produce other nonuniformities. The statistic is Pearson chi-square over these 27 bins.

**Null and search correction:** relabel the **29 ciphertext symbols by one random global permutation**, then recompute all eight stride scores. The permutation is applied consistently to every page, so the null preserves the complete equality pattern, page lengths, all ordered triple counts, and any anti-doublet deficit. A different mapping to the numeric GP alphabet is the precise nuisance variable. The search statistic is **the maximum across all eight strides**, recomputed for every null. Deterministic xorshift32 seed `0x332ea01d`, **1,000** label permutations; add-one empirical p-values. This measures anomalous dependence on the *specified GP numeric assignment*, relative to other rune labelings. It does not reproduce an independent random-key null, nor demonstrate that all finite-field functions are absent.

## Executed results

GitHub Actions [successful opt-in run 42744399513](https://github.com/FlareZ123/liber-primus/actions/runs/42744399513) executed the committed CommonJS script and recorded:

| Stride | Distinct triples | Chi-square (26 df nominal) | Single-stride permutation p |
|---:|---:|---:|---:|
| 1 | 12,241 | 24.524 | 0.5305 |
| 2 | 11,466 | 35.308 | 0.1219 |
| 3 | 11,360 | 21.779 | 0.7083 |
| 4 | 11,235 | 14.926 | 0.9600 |
| 5 | 11,109 | 25.507 | 0.4625 |
| 6 | 11,051 | 22.990 | 0.6454 |
| 7 | 10,946 | 20.736 | 0.7502 |
| 8 | 10,880 | 30.730 | 0.2268 |

Maximum actual score: **35.307692** at stride 2. Matched permutation-null maximum median **36.364699**, 95th percentile **47.019118**, 99th percentile **52.563579**. **Family-wise p=591/1001=0.5904096**.

The strongest observed numeric relation is weaker than the median maximum obtained simply by permuting the labels. The test discovers **no positive GP-index affine-triplet structure** at these strides.

## Positive control and meaning

The script plants 55 synthetic 240-rune pages where, independently at each position from the third onward, the generator selects the exact slope-2 recurrence with probability 0.20; otherwise it emits a random rune. Immediate repeats are rerouted (anti-repeat-like filter). The same scan, with 150 permutation nulls and seed `0x33011209`, reports:

- Planted stride-1 slope 2: **2,951** of **12,699** distinct triples;
- Maximum chi-square **13,601.9192**;
- Family-wise empirical p=**1/151=0.0066225**;
- The planted slope is recovered as the most frequent bin.

This is a deliberately strong plant showing detectability of substantial recurrence bias under the tested anti-repeat-like construction; it does **not** quantify detection power for low-duty-cycle recurrences, ciphertext-dependent resets, varying coefficients, unknown relabelings, or key-driven near-uniform ciphertext.

**Interpretation:** a direct, frequent low-stride affine ordering tied to the canonical GP rune values lacks support. The open task is still to obtain plaintext or key material; a cipher could be nonlinear, sparse, page-dependent, filtered in a way this statistic does not detect, or deliberately one-time-pad-like.

**Reproduce:** `node sims/affine_triplet_order.cjs`. Exact source [sims/affine_triplet_order.cjs](../sims/affine_triplet_order.cjs); optional workflow [.github/workflows/affine-triplet-order.yml](../.github/workflows/affine-triplet-order.yml). Both the observed statistics and planted control are logged in one on-demand CI run. No per-commit workflows were introduced.

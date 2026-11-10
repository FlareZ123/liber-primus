# Unknown outer rune permutation over source-defined base60 grid pads and feedback

**Status:** Two bounded source-key inversions, Agent 30 and Agent 17, 2026-11-10. Both fail original LP2 holdouts despite independently constructed source-true planted positives. No authentic plaintext, outer alphabet, key, or destination recovered.

## Model A: direct row-major grid keystream behind an unknown alphabet

### Cryptographic assumption

The numeric table spanning LP2 pages 49–51 contains 256 base60-encoded bytes. This experiment asks whether those bytes, reduced modulo 29 in their documented row-major order, form a page-reset additive keystream hidden by **one unknown arbitrary permutation of all 29 ciphertext rune labels**.

For every unsolved rune page (55 pages), the model is:

    C(page,t) = sigma((P(page,t) + K[(offset+t) mod 256]) mod 29)

where sigma can be any permutation, offset is one of 256 positions, and P is a plaintext rune drawn from the smoothed empirical distribution of the 180 solved LP2 runes. The key is directly prescribed from the grid's byte values; its order and mod-29 interpretation are assumptions, not discoveries.

This is a bounded nonlinear-sigma attack absent from earlier direct grid-key sweeps. It does not cover alternate byte order, per-page sigma, ciphertext-driven key skips with unknown positions, other byte mappings, or composite transposition.

### Exact method and independence

Each offset uses only half of the pages to estimate sigma by maximizing a **29×29 linear assignment** of ciphertext rune labels to hidden additive-alphabet labels. The exact maximum-weight assignment is computed with the Hungarian method. The other pages measure held-out log likelihood ratio against uniform output. Three cumulative beginning-of-page windows are used: 16, 32, and 64 runes. The search takes the best held-out score over all 256 offsets per window.

Training/test pages are determined by one seeded shuffle (seed 0x10299391). This division is held fixed when comparing the original key with **100 independently reshuffled grid keys**, preserving the exact 256-value histogram. The familywise null calibrates the maximum standardized score across the three searched window sizes. The search includes both key offset fitting and all 29! candidate alphabet permutations through exact optimization.

### Executed results

[GitHub Actions run 42744858874](https://github.com/FlareZ123/liber-primus/actions/runs/42744858874) succeeded and exactly reproduced:

| Window | Best grid-key offset | Held-out score | Shuffled-grid mean | z | Upper-tail p |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 16 | 255 | -33.4834 | -34.7309 | +0.3099 | 0.3663 |
| 32 | 27 | -84.7839 | -83.1387 | -0.2744 | 0.6139 |
| 64 | 89 | -208.6643 | -201.0766 | -0.7820 | 0.8119 |

**Familywise p = 0.7822** over the searched windows. There is no evidence for this prescribed grid-pad / global nonlinear-rune-relabeling mechanism.

### Planted-power checks

Twenty-four synthetic experiments per control were constructed with **random outer alphabet permutations** and a grid-aligned additive keystream shared across pages. In the first group, there was no intentional anti-repeat repair. In the second, a repeated output rune triggered an independent additional keystream advance with probability 0.83. Positive detection fractions at the corresponding 95th percentile of the shuffled-grid null were:

| Window | No-skip plants | Skip-repair plants |
| ---: | ---: | ---: |
| 16 | 24/24 | 24/24 |
| 32 | 24/24 | 21/24 |
| 64 | 24/24 | 18/24 |

Thus the method detects the specified hidden-permutation key if it is genuinely present and retains some power with key-skip drift, particularly at the first 16 runes. Recovery under other language distributions, changing outer permutations, or non-row-major key formation remains untested.

## Model B: ciphertext-feedback grid lookup behind an unknown alphabet

A distinct literal interpretation of the **32 × 8** source table treats its 32 rows as possible cipher states (29 runes and 3 reserved rows) and its eight columns as clock phases. The preceding **published ciphertext rune** determines the table row. This is a state-dependent key, whereas Model A derives a position-only keystream. Under the explicitly testable encryption hypothesis,

\[
C_i=\sigma\left(P_i+s\,G_{r(C_{i-1}),\,\phi(i)}\bmod29\right),
\]

\(G\) is the original printed byte table reduced modulo 29, \(s\in\{-1,+1\}\), and \(\sigma\) is any **one shared bijective 29-symbol output alphabet**. Inverting uses the original \(C_{i-1}\) directly as known state and therefore needs no guessed plaintext before learning \(\sigma\). The manuscript's first rune has no predecessor and is excluded.

Four source-row mappings allocate the 29 previous-rune values to 29 of 32 rows: r=c, r=c+3, r=28−c and r=31−c. Four clocks use absolute rune position, physical-page rune position, section rune position, and intact word-local rune position; eight column phases, both column directions and both signs complete **512 fixed models**. The three extra rows are otherwise uninterpreted. No independently sourced text or cipher instruction establishes this lookup architecture.

**Exact inversion and frozen holdout.** For each configuration, fit all \(29!\) possible shared output alphabets **globally and exactly** by a 29×29 Hungarian maximum-likelihood assignment, using GP-English rune unigrams from the first 160,000 characters of the committed Shakespeare fixture. The fit uses **6,760 original LP2 runes** from physical pages 0–27. Freeze the assigned alphabet and configuration, then score **6,195 unfitted runes** from physical pages 28–55 (excluding the runeless grid page 50). The largest held-out log probability per rune across all 512 configurations is **−4.1953518819**; its source rules are r=c, section-rune position, column phase 2, forward column order and negative sign. Runner-up: **−4.2015681158** for r=c+3, absolute position and positive sign. The winning fitted alphabet and decoded sequence do not recover any readable original passage.

**Powered synthetic positive with output doublet suppression.** Encrypt 12,956 GP-encoded Shakespeare source runes from *after* the unigram training window using the **same printed source grid**, rule r=c+3, word-local phase 4, reversed columns, positive sign and a randomly shuffled 29-symbol outer alphabet. On 81% of newly generated adjacent ciphertext doublets, overwrite the latest output with a random different rune. This makes **321 actual ciphertext overwrites** and retains the exact feedback rule for subsequent positions because row selection always uses the emitted ciphertext. Repeating the **full blind 512-model sweep**, the actual planted rule ranks **first**, recovers the **entire hidden outer alphabet (29/29 symbols)** and achieves held-out **−2.9969012669** log probability/rune. The synthetic true source's English unigram cross-entropy on those heldout symbols is approximately −2.9645. The detector therefore recovers the declared hidden model even with substantial anti-repeat overwrites.

**Source-order control.** Independently shuffle the table's actual 256 byte entries with deterministic seed 0x88210310, refit every alphabet and rescan all 512 configurations per shuffle; over **20** independent shuffled tables, **19** produce a best held-out log score at least as high as the actual grid (add-one \(p=20/21=0.95238\); shuffled-table maximum −4.1639456168 and mean −4.1835611845). These are finite-sample comparisons. The 1.2-nat-per-rune separation from the source-true planted control and the lack of grid-order advantage disfavor this particular simple lookup hypothesis.

**Scope.** This evidence applies to these four source-defined row mappings, four positional clocks, shared fixed output alphabet, printed grid order, additive mod-29 lookup and this Shakespeare-like source register. It does not eliminate alternate table readings, plaintext-selected rows, key skips/holds, an evolving output alphabet, positional transposition or an encoded intermediate register. Because the manuscript's actual encryptor has not been identified, the synthetic doublet repair is solely a powered control. No unknown original LP2 glyph has been authenticated as plaintext.

**Reproducer:** [exact held-out lookup inversion and full positive](../sims/grid_cprev_lookup_sigma.cjs), reusable [29×29 Hungarian optimizer](../sims/outer_permutation_assignment.cjs), original [LP2 transcript](../resources/lp2-transcription.txt), [base-60 source table](../resources/liber-primus/base60-grid.json), [GP Shakespeare fixture](../resources/control/shakespeare_first300k.txt). The JS implementation and its data were executed directly with the shared repository source and exact optimizer. Under Node 22, the environmental option LP2_GRID_LOOKUP_NULLS=20 requests the stated 20-shuffle comparison.

## Synthesis

Both Model A's running pad and Model B's ciphertext-row feedback grid table fail held-out original plaintext recovery despite well-powered hidden-alphabet optimizers and source-true plants. The models differ in key dependence and validation window, so their individual exclusions remain distinct. A new explanation needs stronger independent key/state clues or a different source encoding; a high-fitting noise alphabet should never be promoted to authentic plaintext.

### Model A source and reproduction

Program: [sims/grid_outer_permutation_cv.cjs](../sims/grid_outer_permutation_cv.cjs). On-demand runner: [grid-outer-permutation.yml](../.github/workflows/grid-outer-permutation.yml). Inputs: [page-addressed LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) and [the derived base60-byte grid](../resources/liber-primus/base60-grid.json). Source note: disputed grid token readings exist across transcriptions; this program uses the current shared byte grid and is a test of that exact input.

Do not treat the fitted permutation of either family's best noise score as a discovered alphabet. A genuine solution requires a source-derived key/state, exact forward/inverse transformation, independently predicted readable LP2 plaintext and successful re-encryption.

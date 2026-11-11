# LP2 word-boundary delta alignment under an exact first-order conditional null

**Status:** reproducible negative for a simple word-reset additive clock. This does not recover plaintext, key material, or a complete cipher.

## Question and source-defined feature

The 2016 signed Cicada message says “words are the map.” A concrete, falsifiable interpretation is that printed word boundaries may select a different state transition from within-word positions. The 86 adjacent equalities alone do not settle this: Agent36's exact partition is 63/10,060 within-word and 23/2,895 cross-word (Fisher exact p≈0.363).

I tested the full GP29 first-difference class at each source-visible word boundary, not just equality. For each adjacent pair inside one physical page, define

- \(B_i=1\) if the edge ends a printed word, otherwise \(0\);
- \(\Delta_i=(C_{i+1}-C_i)\bmod 29\).

The sole statistic is the mutual information \(I(B;\Delta)\) in nats. Page-boundary edges are excluded, matching the per-page null. This asks whether word boundaries select a distinct GP29 step-size distribution after conditioning on each page's exact first-order transition counts.

## Conditional null and controls

The canonical inputs are resources/liber-primus/lp2-corpus.json and resources/lp2-transcription.txt, parsed with the repository's existing sims/lp2_word_pages.cjs word contract. Invariants: 55 rune-bearing pages, 12,956 runes, 2,896 words, 32 cross-page words, 12,901 page-internal adjacent pairs, 2,873 word-boundary edges, and 10,028 within-word edges.

For each null sample, independently shuffle outgoing edge order within each physical page and reconstruct an Eulerian trail. This preserves that page's exact 29×29 bigram table, rune counts, first rune, last rune, and length. The original word-boundary positions remain fixed. It therefore tests whether the original placement of bigram differences at word boundaries is unusual, conditional on every page's complete first-order transition counts. As in the existing im-results/bigram-conditioned-higher-order.md study, this is a reproducible conditional randomization ensemble, not a claim of uniform sampling over all distinct Eulerian trails.

The test uses 1,000 original null samples. Two synthetic controls use the first 12,956 GP29 tokens of resources/control/shakespeare_first300k.txt, cut by the exact LP2 word-length sequence:

1. **Word-reset additive positive control:** one independent uniform additive shift per LP2 word.
2. **Independent per-symbol additive control:** one independent uniform additive shift per rune.

Each control is calibrated against 250 Eulerian null samples preserving its own page bigram tables and endpoints. These are synthetic power/negative controls, not claims about Cicada plaintext.

## Results

| Measurement | Original LP2 | Word-reset additive plant | Per-symbol additive plant |
|---|---:|---:|---:|
| Observed \(I(B;\Delta)\), nats | **0.000997608** | **0.016056345** | **0.001334633** |
| Null mean | 0.001075606 | 0.001085104 | 0.001084887 |
| Null SD | 0.000287736 | 0.000292961 | 0.000304242 |
| Null median | 0.001039240 | 0.001061658 | 0.001067982 |
| Null 95th percentile | 0.001577643 | 0.001588396 | 0.001610637 |
| Null samples ≥ observed | 565/1000 | 0/250 | 45/250 |
| Upper-tail add-one p | **0.5654** | **0.0040** | **0.1833** |

For the original, the lower-tail add-one probability is 0.4356. The observed statistic is near the conditional-null center, not an upper- or lower-tail departure. The word-reset plant is far above every null replicate, demonstrating that this statistic detects a simple per-word additive shift clock at the stated sample size. The independent per-symbol pad remains compatible with its conditional null.

## Cryptanalytic consequence and limits

The original ciphertext provides **no evidence that printed word boundaries align a special GP29 first-difference distribution beyond the page-specific bigram tables**. The tested simple per-word additive reset is absent under a control with the exact original word lengths. This is a bounded negative for that clock family, not for all word-local or stateful ciphers.

Combined with the existing reproducible higher-order work:

- im-results/bigram-conditioned-higher-order.md tests 102 lag/block statistics under exact page-wise bigram conditioning; its family-wise upper-tail estimate is 128/321≈0.39875, while a planted lag-11 signal is detected.
- im-results/lp2-ciphertext-linear-complexity-gate.md excludes direct GF29 LFSR output of order ≤256 (original Berlekamp–Massey complexity 6,478).
- im-results/lag5-lag6-heldout-conditional-prediction.md finds small held-out predictive dependencies for previously selected motifs, but the predictor is autoregressive over ciphertext and is not an encoder/decryptor or a source-selected clock.
- sims/longlag_label_invariant_mi.cjs tests the exact 6,395-rune bookend separation with label-invariant MI and planted controls.
- im-results/lp2-repeated-wordpair-structure.md and the word-boundary equality partition cover the repeated-pair and doublet structure.

No statistically robust, source-selected, reversible higher-order clock emerges from these families. The residual uncertainty is not “one more generic lag scan”: nonlinear or variable-state ciphers, hidden transposition/fractionation, external key material, and non-English or binary intermediates remain possible. The decisive missing input is still an independently source-selected key/state and its reversible role.

## Reproduction

Run from the repository root:

    node sims/lp2_word_boundary_delta_mi.cjs

The script uses Node built-ins and the existing sims/lp2_word_pages.cjs parser. All random seeds and sample counts are fixed in the script. It asserts the source counts and the positive-control detection.

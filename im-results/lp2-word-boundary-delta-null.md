# LP2 printed-boundary first-difference tests under conditional nulls

**Status:** reproducible negative for simple line- and word-reset additive clocks; page-boundary diagnostic is low-powered. No plaintext, key, or reversible cipher was recovered.

## Question and source-defined features

The 2016 signed Cicada message says “words are the map.” Printed word boundaries are therefore a motivated candidate state clock. The manuscript also exposes line ends and page boundaries. I tested whether these three source-visible boundary types select a distinct GP29 first-difference distribution, rather than repeating generic lag or period scans.

For each adjacent rune pair, define \(\Delta_i=(C_{i+1}-C_i)\bmod 29\). For a chosen boundary flag \(B_i\), the sole statistic is mutual information \(I(B;\Delta)\) in nats. The word and line tests include only edges within physical pages. The separate page test includes all 12,955 edges and marks the 54 transitions between the 55 rune-bearing page records.

The exact canonical word contract comes from sims/lp2_word_pages.cjs. Printed line ends are the slash markers in resources/lp2-transcription.txt.

## Conditional nulls and controls

### Word and line boundaries

For each null sample, independently shuffle outgoing edge order within each physical page and reconstruct an Eulerian trail. This preserves that page's exact 29×29 bigram table, rune counts, first rune, last rune, and length. The original word/line boundary positions remain fixed. It tests whether the placement of the original bigram differences at those boundaries is unusual after conditioning on every page's complete first-order transition counts. The ensemble is reproducible but is not claimed to sample uniformly from all distinct Eulerian trails.

There are 55 rune-bearing pages, 12,956 runes, 2,896 words, 32 cross-page words, and 594 printed lines. The page-internal edge counts are 12,901 total, 2,873 word-boundary edges, 10,028 within-word edges, 539 line-boundary edges, and 12,362 within-line edges. The 22 word boundaries and 55 line ends that coincide with physical page boundaries are excluded from these within-page tests.

The original uses 1,000 Eulerian null samples. Positive controls use the first 12,956 GP29 tokens encoded from resources/control/shakespeare_first300k.txt, cut by the exact LP2 segment lengths:
- one independent uniform additive shift per word;
- one independent uniform additive shift per printed line.

A negative control applies independent uniform additive shifts per rune. Each control uses 250 Eulerian null samples.

### Page boundaries

There are only 54 transitions between the 55 rune-bearing page records (the blank physical p50 is absent from the rune stream). The diagnostic computes I(page-boundary; delta) over all 12,955 adjacent pairs and compares it to 1,000 permutations that randomly place exactly 54 boundary labels among those pairs. This does not preserve page-endpoint distributions and is intentionally weaker than the word/line null.

A page-reset positive control applies one independent additive shift per page; an independent per-rune pad is the negative control. Each uses 250 fixed-count label-permutation null samples. The page test is underpowered: the page-reset control is not separated from its null, so this diagnostic cannot exclude page-reset ciphers.

## Results

### Original LP2

| Boundary | Observed MI (nats) | Null mean ± SD | Upper-tail add-one p | Lower-tail add-one p |
|---|---:|---:|---:|---:|
| Word | 0.000997608 | 0.001075606 ± 0.000287736 | 0.5654 | 0.4356 |
| Line | 0.000871570 | 0.001082698 ± 0.000288057 | 0.7642 | 0.2368 |
| Page | 0.001603457 | 0.001229690 ± 0.000299640 | 0.1079 | 0.8931 |

The two-test max-|z| familywise result for word and line is 700/1001 exceedances (add-one p=0.7003). The page test is separate; its two-sided add-one estimate is about 0.216, and it is not significant after a three-test Bonferroni correction.

### Synthetic controls

| Control | Observed MI (nats) | Null mean ± SD | Null samples ≥ observed | Upper-tail add-one p |
|---|---:|---:|---:|---:|
| Word-reset additive plant | 0.016056345 | 0.001085104 ± 0.000292961 | 0/250 | 0.0040 |
| Line-reset additive plant | 0.003109837 | 0.001074462 ± 0.000288929 | 0/250 | 0.0040 |
| Per-rune additive pad, word statistic | 0.001334633 | 0.001084887 ± 0.000304242 | 45/250 | 0.1833 |
| Page-reset additive plant, page statistic | 0.001602953 | 0.001242416 ± 0.000299912 | 30/250 | 0.1235 |
| Per-rune additive pad, page statistic | 0.001258228 | 0.001200434 ± 0.000290005 | 106/250 | 0.4263 |

The word- and line-reset positive controls are far above every null replicate, showing that these statistics detect simple additive reset clocks at the stated sample size. The page-reset control is not detected; with only 54 page transitions, the page diagnostic has inadequate demonstrated power.

## Cryptanalytic consequence and residual uncertainty

### The 2014 trailing-9133 coordinate candidate does not select a clock

Agent13 raised the contemporaneous January 2014 OutGuess suffix 9133 as a possible coordinate [91 preceding runes][physical page 33]. It does uniquely point to the p33:91 red heading among the seven internal red-span starts, but the interpretation is not source-fixed: the historical 56-character seven-column output consists of a 36-character phrase plus a 16-character onion address, leaving exactly four cells for padding. Nothing in the preserved OutGuess format selects offset-before-page parsing or establishes that the four padding characters are coordinates. The p33 heading words (lengths 3,5) also do not align with the historical phrase's opening words (2,7).

The source-specific follow-up is already reproduced in workplace/lp2-section-clock-ambiguity.md and sims/2014_9133_p33_internal_heading_source_sft.cjs. Starting the solved p56 running-phi(prime) operation at prime 9133, and the fixed combinations of that stream with the historical seven-column inverse, leave the 1,468-rune illustrated p33–p39 passage at GP29 IoCs around 0.0343 with no language. Thus 9133 remains a provisional coordinate association, not a source-selected reset, key, or reversible operation. It does not change the higher-order conclusion.


The original ciphertext shows **no word- or line-boundary alignment of GP29 first differences beyond each page's exact bigram table**. The tested simple additive reset per word or per printed line is absent. This is a bounded negative for those clock families, not for all word-/line-local or nonlinear stateful ciphers.

The page-boundary diagnostic is inconclusive, not a negative: only 54 edges are available and its simple page-reset positive control is not detected. Cross-page state remains unresolved.

The broader reproducible higher-order evidence is consistent with no currently actionable clock:

- im-results/bigram-conditioned-higher-order.md tests 102 lag/block statistics under exact page-wise bigram conditioning; its family-wise upper-tail estimate is 128/321≈0.39875, while a planted lag-11 signal is detected.
- im-results/lp2-ciphertext-linear-complexity-gate.md excludes direct GF29 LFSR output of order ≤256 (original Berlekamp–Massey complexity 6,478).
- im-results/lag5-lag6-heldout-conditional-prediction.md finds small held-out predictive dependencies for previously selected motifs, but the predictor is autoregressive over ciphertext and is not an encoder/decryptor or a source-selected clock.
- sims/longlag_label_invariant_mi.cjs tests the exact 6,395-rune bookend separation with label-invariant MI and planted controls.
- im-results/lp2-repeated-wordpair-structure.md and the word-boundary equality partition cover repeated-pair and doublet structure.

No statistically robust, source-selected, reversible higher-order clock emerges from these tested families. The exact remaining uncertainty is: cross-page state, nonlinear or variable-state ciphers, hidden transposition/fractionation, external key material, and non-English or binary intermediates. A generic higher-order statistic cannot resolve those without an independently selected key/state and its reversible role.

## Reproduction

Run from the repository root:

    node sims/lp2_word_boundary_delta_mi.cjs

The script uses Node built-ins and the existing sims/lp2_word_pages.cjs parser. All random seeds and sample counts are fixed. It asserts the corpus counts and both word/line positive-control detections.

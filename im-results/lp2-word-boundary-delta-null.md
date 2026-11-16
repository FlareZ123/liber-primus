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

### Directed numeric word-to-word boundary gate (Agent29, 16 November 2026)

The PGP-signed 2016 words/numbers/direction clue suggests a more specific, testable operator than merely a different distribution at separators: **the complete preceding printed word's numeric value selects the next interword GP29 difference**. Fix a canonical original punctuation span by printed `.`, `&`, `# LP2 printed-boundary first-difference tests under conditional nulls

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

, `§` and omit page/line wraps; take every genuine internal printed hyphen and form `D = (first rune of next word − last rune of previous word) mod 29`. There are **2,721** such directed transitions over **2,896** source words in 175 punctuated spans. This same test includes the 32 words continued across physical pages, preserving the 12,956-rune source exactly.

The independently visible numeric selectors are the preceding complete word's **rune length** or **sum of its original GP prime weights modulo 29**. A stronger **key-free impossibility witness is already contained entirely within the first 35 source runes of p0**, so any secret fixed lookup is ruled out even if it resets at every physical page, chapter or punctuated paragraph:

| Exact original p0 GP boundary | Preceding complete word (native transliteration) | Preceding length | Preceding GP-prime sum mod29 | Observed first-to-last GP29 delta |
| --- | --- | ---: | ---: | ---: |
| Rune offsets **19→20** | F-J-OE (offsets 17–19) | 3 | 6 | **10** |
| Rune offsets **22→23** | O-N-TH (offsets 20–22) | 3 | **12** | **7** |
| Rune offsets **33→34** | N-E-W-B-A-S-OE-EO-ING-U (offsets 23–33) | 11 | **12** | **8** |

The first two complete words of length **3** would demand **the same** deterministic output from `lookup(3)`, yet require deltas **10** and **7**. The latter two preceding words have identical GP-prime-sum residue **12** but demand deltas **7** and **8**. Because these three original differences are within the same p0 prose paragraph, no secret value of either lookup, however chosen, can satisfy its declared exact source rule. This is an algebraic contradiction on unmodified original ciphertext, independent of any statistical model, null, or proposed plaintext. It remains scoped to **fixed one-step lookups with only that single public numeric input**.

The same source admits a stronger **full-population, every-secret-key theorem** even after granting three public inputs and an independent secret table per *physical page*. For each observed edge, the secret table may assign any of 29 deltas to the combination `(physical page, previous word length, previous GP-prime sum mod29, previous last GP rune)`. Count the exact observed output distribution for each full state, then sum `state occurrences − maximal consistent output count`. This is the sharp minimum number of original edges that every such deterministic table must mispredict:

| Inputs granted to an otherwise arbitrary page-specific secret table | Distinct observed table states | Conflicting states | Unavoidable wrong boundary deltas |
| --- | ---: | ---: | ---: |
| Page + preceding length | 523 | 427 | **1,988** |
| Page + preceding GP-prime sum mod29 | 1,258 | 780 | **1,376** |
| Page + preceding length and GP-prime sum | 2,400 | 279 | **309** |
| Page + preceding length, GP-prime sum, and final ciphertext rune | 2,709 | 12 | **12** |

Two exact source witnesses illustrate the extra context failures. On p0, the length-2 preceding words **B-U** (global positions 75–76, GP-prime sum64 ≡6) and **H-EO** (positions 103–104, also sum64 ≡6) lead into different next-word deltas **5** and **4** at global boundaries 77 and105. Thus even a joint `(length, sum)` lookup cannot satisfy all original p0 edges. More decisively, p5 ciphertext words **Y-NG-F-Y** (global offsets1281–1284, sum287 ≡26) and **X-A-R-Y** (offsets1454–1457, sum258 ≡26) both have length4 and final rune **Y** (GP index26), but their next-word deltas at offsets1285 and1458 are **3** and **27**. No hidden 29-entry output selection for that exact `(page, length, sum, finalRune)` state can satisfy both. A per-paragraph changing secret, longer context, plaintext-dependent state or nonlocal framing is outside the theorem.

With pages 0–39 as training and all 626 eligible boundary transitions on untouched pages 40–53 as one fixed holdout, fit an otherwise **completely secret 29-output deterministic lookup** for each selector by the most frequent training difference (ties choose lowest index, unseen inputs revert to the global training majority). No unknown plaintext, guessed key or trained English model enters the test.

| Prediction rule | Training correct / 2,031 | Blind pp40–53 correct / 626 |
| --- | ---: | ---: |
| Arbitrary lookup from previous-word length mod 29 | 131 | **21** |
| Arbitrary lookup from previous-word GP-prime sum mod 29 | 176 | **17** |
| Fixed global-majority difference | 94 | **29** |

Four simpler fully source-fixed direction rules also fail on the same 626 transitions: `D=+length` **22**, `D=−length` **23**, `D=+primeSum` **24**, and `D=−primeSum` **14** correct. Both arbitrary-lookup learners **underperform** the unconditioned rule on the independent source. Explicit same-family synthetic positives with `D=(3*selector+7) mod29` recover **626/626** withheld boundaries for either selector. This gives a real original-input and positive-controlled **negative for any one-step fixed previous-number-to-boundary-difference lookup**, even with all 29 outputs granted freely; it does not exclude a value-changing receiver within words, evolving secret state, different ciphertext segmentation, or a map operating across multiple words.

**Reproducer:** [read-only original source SFT](../sims/lp2_wordnumber_boundary_delta_holdout_sft.cjs), [successful manual Windows-independent Node22 Actions run 43920179287](https://github.com/FlareZ123/liber-primus/actions/runs/43920179287). It performs exact corpus-count assertions, frozen original holdout scoring, and two 626/626 positive controls. No unknown-page plaintext, authentic LP2 key, or full cipher mechanism is recovered. The next causal question remains an independently authored *reversible value-changing* mapping that can use original punctuation/word numbers to recover coherent text, rather than extra secret lookup tables fit to source differences.

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

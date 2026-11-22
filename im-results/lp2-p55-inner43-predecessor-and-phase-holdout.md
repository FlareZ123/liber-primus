# LP2 p55 inner-43 reversible no-repeat register and held-out doublet-phase gate

**Disposition, 11 November 2026:** one original-source, exactly reversible 29-symbol predecessor transport fails to recover language from the 12,956 unknown LP2 runes. An exploratory global-phase doublet concentration at period 43 survives one internal page split, but lacks an author-selected clock/instruction and loses familywise strength across source-plausible periods. **No unknown LP2 plaintext, authenticated LP2 key, actual cipher mechanism or destination is recovered.**

**Reproduce:** [single-file original-input CommonJS SFT](../sims/lp2_p55_inner43_predecessor_transport_sft.cjs), [successful on-demand CI run 43123000201](https://github.com/FlareZ123/liber-primus/actions/runs/43123000201). The existing manual workflow option is p55-inner43. The SFT can emit the *entire* original-input decoded candidate with the --full argument. No plaintext was postselected.

## Exact sourced key and full inverse

Original physical p55 has 76 runes. Its printed-word layout yields 17 local pieces, the first a single rune completing a word from the preceding page. Take all the *strictly interior* glyphs from those visible words in order. The result is **43 GP29 key indices**:

[19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18].

The signed 2016 message independently has 43 alphabetic words, and the original printed number table has 256 cells, which motivate bounded 43- and 256-clock checks. These coincidences do **not** authorize using p55 as a book-wide key, picking period43 from the manuscript, or turning ciphertext doublets into plaintext.

One concrete full-alphabet encoder uses this 43-key to **reserve a special plaintext symbol at each global book-clock phase**. Let K_i be the p55 key at i mod43, with i counting all original GP rune positions and skipping runeless p50. The initial rune of each physical page is transmitted directly. For subsequent runes with previous ciphertext a and plaintext p:

- When p=K_i, output c=a, an identical printed ciphertext successor.
- Otherwise remove K_i from sorted GP29 order. Its rank among the 28 remaining symbols is r=p−[p>K_i]; output c=(a+1+r) mod29.

Inverse: when c=a, recover p=K_i; otherwise r=(c−a−1) mod29 and p=r+[r≥K_i]. For any fixed predecessor and phase, all 29 plaintext symbols have **distinct** outputs, hence the rule is lossless with no sidecar. This differs from lossy collision overwrites, a constant special-rune marker and the earlier Q238/p36 keyed rank transport. It is an explicit finite conjecture; no historical instruction authenticates the encoding.

## Original ciphertext and independent English plant

The unchanged canonical LP2 corpus has **55 rune-bearing unknown physical pages, 12,956 runes and 86 adjacent equal successors within pages**. The exact 43-key is reconstructed from the canonical master transcription. All 12,956 original candidate decoded symbols reencrypt to the original. This round-trip checks implementation, regardless of whether any key hypothesis is right.

The independent original source Gibran *The Prophet* transliterates to 63,114 GP symbols. Its first 12,956 are packed into the same 55 physical page lengths and **genuinely encrypted under this exact fixed source-derived transport**; decrypting recovers **12,956/12,956** correct native-language symbols. This positive encryption produces **433** repeated printed outputs because the exceptional plaintext symbol occurs at the matching key phase. The manuscript has only **86**.

| Measure | Original ciphertext | Proposed inverse | Native-GP plaintext plant |
| --- | ---: | ---: | ---: |
| GP29 IoC | 0.0344783978645 | **0.0345309106057** | **0.0604207048671** |
| Repeated printed outputs | **86** | 86 marker positions retained | **433** |
| Exact source-aligned original/full planted reconstruction | 12,956 / 12,956 | 12,956 / 12,956 | 12,956 / 12,956 |

The original decoded candidate starts with the first 100 GP transliteration tokens:

S.OE.N.X.TH.P.W.U.X.J.L.O.EO.Y.H.A.M.O.J.I.N.C.NG.G.H.E.N.G.L.W.M.IA.I.H.H.T.N.O.NG.C.N.NG.B.X.O.NG.TH.EA.L.NG.Y.R.B.TH.G.M.R.H.TH.X.NG.D.X.IA.TH.EO.EO.B.L.R.A.OE.P.EA.J.H.P.C.Y.N.W.O.C.H.S.J.C.B.I.OE.M.O.L.EO.C.L.NG.A.L.J

No readable source-register plaintext emerges. The 86 printed doublets would disclose their phase-specific special glyphs only **if this source-unselected cipher were authentic**. They are *hypothetical decoded letters*, not recovered genuine LP2 plaintext.

## Independently bounded clock anomaly

Extract all 86 original within-page doublet successors at global rune positions g. For each period m, the event concentration score is the sum over phases r of binomial(n_r,2), where n_r counts events with g mod m = r. Exactly eleven source-plausible periods {8,16,28,29,32,43,64,79,128,238,256} and both global and page-local phases were tested. A null independently rotates each page's event positions among its valid successor positions; it preserves the page count and cyclic interevent gaps. Another null resamples the same per-page event counts. Both rerun all 22 candidate scores.

In 12,000 replicates per null, global m256 has 27 colliding event-phase pairs versus rotation mean 13.921, nominal upper-tail p=0.00250. Global m43 has 115 versus mean85.453, nominal p=0.00467. Familywise calibration of the **largest standardized deviation over all 22 tests** gives p≈0.0430 for rotations, p≈0.0495 for independent resampling. These are local exploratory family controls, **not historical discovery-wide probabilities**.

An internal split uses physical pages 0–27 (45 events) to select top-three phases and pages 28–55 (41 events) to score them:

| Source clock | Train-frozen most frequent three phase cells | Held-out events landing there | 40,000 page-rotation null, held-out upper-tail p |
| --- | --- | ---: | ---: |
| **43** | [1,6,0], train counts [5,4,3] | **7/41** | **0.02405** |
| 256 | [141,193,211], train counts [3,3,3] | **1/41** | 0.37682 |

A Dirichlet-½ score for the entire held-out phase distribution gives p≈0.00830 (43) and p≈0.13345 (256), with identical train-only fitting in each rotated null. However, the periods and the split were investigated after seeing whole-book behavior, so this is *internal* evidence rather than a truly untouched pre-registered continuation.

A distinct five-fold block crossfit gives global m43 nominal rotation p≈0.00658, but taking the **maximum among all 22 choices** raises p≈**0.13216**. The strongest interpretation is a weak, apparently global event-period clue that remains vulnerable to broader look-elsewhere correction. Source p55 provides 43 **characters**, yet does not provide a 43-step clock anchor or a phase-to-plaintext map; the 256-period discovery fails the half-page replication outright.

## Decision for Director Issue #413

The **specific p55-derived 43-position, fully reversible predecessor-exclusion transport** is rejected for native GP-English: it predicts many more original-layout doublets than printed, and its complete original inverse stays statistically random-like. The separate observed m43 event-phase association should be retained as **exploratory evidence only**, with explicit negative source-key consumer. A genuine successor requires an independently sourced 43-state/key instruction and a locked prediction on untouched original rune text. Arbitrary extra permutations, phase shifts, alternative alphabet maps or guessed plaintext cannot turn this result into a decipherment.

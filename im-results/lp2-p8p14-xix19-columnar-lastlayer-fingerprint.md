# P8 red XIX and the complete 19×91 chapter: is columnar transposition the final cipher layer?

**Agent10, 22 November 2026. Evidence class:** a source-selected 19-column original-rune operation with a strong *direction-of-processing* discriminator. A final columnar permutation of an ordinary low-doublet chain ciphertext fails under four natural layouts. **No plaintext, key or URL was recovered.**

## An executable human clue, separate from numerical archaeology

The original first four red runes on physical p8 are **X I X M** in Gematria Primus transliteration. The initial **XIX** spells Roman **19**; the fourth rune M also has the GP zero-based index 19. That 19 is especially pertinent to a 2014 Cicada solver, since the contemporaneous signed Stage11 message has eleven conspicuous whitespace-run prime lengths **2,3,5,7,11,13,17,23,29,31,37**, omitting 19. The latter runs are *mostly trailing whitespace and not PGP-authenticated* by canonical clear-signature verification, so this is a possible historical clue, not an authenticated author instruction.

The visually bounded p8–14 chapter contains **1,729 printed GP runes** in seven physical pages, **exactly 19 × 91**, beginning with that p8 Roman title. Cicada historically used columnar transposition in its 2014 puzzle; treating width19 as a proposed chapter-wide rectangular layout is an independently writable operation, although the manuscript does not give a 19-letter column key or state that any transposition applies here.

The unknown p8–14 source runes, in original reading order, contain only **9 adjacent equal-rune pairs among 1,728 adjacent positions**. These low-doublet statistics characterize the unknown LP2 ciphertext extensively and are not produced by generic GP29 uniformly keyed streams after arbitrary permutations. Therefore a candidate **last** columnar transposition applied to a low-doublet inner stream has a falsifiable directional prediction: in general it would destroy that suppression at the original output.

## Four frozen complete inverse permutations

For the exact original 19 columns × 91 rows, decode all runes, including the p8 12-rune red heading, under the following standard ways of writing/reading a rectangular array:

| Proposed final operation, inverted on the actual source | Equal pairs after inverse | Fraction of 1,728 |
| --- | ---: | ---: |
| Unfill columns, then read rows | **61** | 3.5301% |
| Unfill rows, then read columns | **51** | 2.9514% |
| Reverse alternating rows before columnar read | **55** | 3.1829% |
| Read columns in reversed natural order | **61** | 3.5301% |
| Unmodified actual printed p8–14 ciphertext | **9** | 0.5208% |

This is the opposite direction from that predicted by a final columnar shuffle of an anti-repeat plaintext-independent chain cipher: the *already printed* source has suppressed self-transitions, while each proposed unshuffled inner stream has ordinary near-random GP29 doublet frequency. Index of coincidence remains **0.03446048** under any pure permutation, so none recovers native-GP linguistic symbol concentration or continuous plaintext. Source page boundaries are preserved for counting original runes; none of the nine original equal pairs occurs at a physical-page seam.

## Source-frequency-matched counterfactual

Generate **2,000** deterministic synthetic 1,729-rune *inner* streams using exactly the source's 29 GP-rune marginal frequencies, prohibiting adjacent equality except at the **nine exact repeat positions** observed in the original chapter. Thus every simulated inner stream has exactly nine repeats, a conservative approximation to the page's observed anti-repeat fingerprint. Freeze seed **0x33011914** and use the same four named forward permutations. This directly tests the question: what repeat counts are expected *after a final 19-column permutation*, if the prior inner string has the original low-repeat property?

| Proposed final permutation | Mean output repeats | Smallest over 2,000 | Cases with at most nine |
| --- | ---: | ---: | ---: |
| Row write / column read | **60.377** | 34 | 0 |
| Column write / row read | **60.636** | 38 | 0 |
| Alternating-row snake / column read | **58.267** | 36 | 0 |
| Row write / reversed-column read | **60.325** | 33 | 0 |

All outputs retain 1,729 original-like runes and marginal distribution, differing only by a fixed known 19-column permutation. Each of the four modes independently exactly round-trips genuine solved **95-rune p57 English-GP text** after a corresponding 19-column encryption, as well as all 1,729 untouched original runes. Consequently the original-vs-control mismatch is not a decoder inversion bug.

A simple independent uniform-pair binomial approximation gives **P(X≤9 | n=1728, p=1/29) ≈ 1.89×10⁻¹⁶**, but the independent-pair model does not exactly describe the source's structured pairs. The stronger case-specific statement is the explicit 2,000-draw source-shaped comparison above, where the smallest output count is over three times the original. This does not assign discovery-adjusted author-intent probability to the Roman19 or chapter-length coincidence.

## Decision and remaining plausible path

**Reject ordinary last-layer 19-column transposition after a generic low-doublet stream** as an explanation of the original p8–14 anti-repeat ciphertext under the four specified source-native orders. The source's nine doublets appear in the form one would expect **after** a final anti-repeat stage, rather than after an ordinary column shuffle.

This is a *conditional processing-order discriminator*, not an algebraic exclusion of all columnar systems. An **earlier** 19-column permutation followed by a separate final anti-repeat encoder could preserve the exact source fingerprint, as could an independently sourced keyed order or exotic nonrectangular transform. Those alternatives need a physical key or readout rule and a plaintext-predicting test. The red XIX and 19×91 dimensions by themselves do not recover any words.

The direct p8–14 chapter-wide width19 test is distinct from the older [19-column + solved-p56 φ-prime inverse](lp2-2014-prime19-columnar-phiF-original-gate.md), which covered different chapters (p0–2, p3–7, p40–53 and p55). It does not contradict those bounded negatives.

**Complete reproducible original-source test:** [sims/lp2_p8_14_xix19_column_finalorder_original_sft.cjs](../sims/lp2_p8_14_xix19_column_finalorder_original_sft.cjs), Windows Node22, **[CI PASS run 45077231850](https://github.com/FlareZ123/liber-primus/actions/runs/45077231850)**. Inputs are the canonical original-source rune arrays, source-selected red Roman title, original 19×91 extent, and genuine solved p57 95-rune round-trip control.

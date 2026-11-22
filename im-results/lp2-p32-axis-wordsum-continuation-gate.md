# p32 prime-axis dimensions: does the word-sum address extend beyond the opening pair?

**Agent 7, 13 November 2026. Source-constrained continuation decision; no new plaintext or key.** The signed 2016 tree image is 563×569 pixels. The original p32 runes form an 11×11 source arithmetic square whose first row and first column have those GP prime-weight sums. Independently, the opening LP2 pages carry exactly one complete printed word of sum 563 (p0 word 6, 11 runes) and sum 569 (p1 word 33, 10 runes), respectively. This opening link was already established in [the width/height word report](lp2-2016-image-first-two-wordsum-gate.md); it is not a discovery of this test.

## One prospective continuation

A player given the two image dimensions and the original p32 11×11 square could ask whether **every row and column sum addresses one complete word elsewhere in LP2, by exact equality of GP-prime sums**. The first two matches appear to provide a precedent for this rule. The strong, cheaply falsifiable prediction is that all 22 axis sums should select a *single* printed word before any semantic or cipher interpretation is fitted. This requires no candidate plaintext, shift, substitution, date, arbitrary page starting position or invented key.

Apply the identical exact-word matching operation to all 11 row sums and 11 column sums, searching all 2,928 original page-local printed segments on unknown pp0–55. The original p50 has no runes. The original physical page and word numbering is unchanged; a typographical word carried across a page is page-local at each visible break, consistent with the opening 563/569 witnesses.

| p32 axis | Prime sums in source order | Number of complete LP2 word matches for each sum |
| --- | --- | --- |
| Rows 1–11 | 563, 617, 287, 540, 743, 513, 577, 579, 603, 537, 486 | **1, 0, 5, 2, 0, 1, 1, 0, 1, 1, 1** |
| Columns 1–11 | 569, 429, 641, 669, 518, 611, 463, 690, 378, 578, 499 | **1, 3, 0, 0, 2, 0, 3, 1, 3, 0, 2** |

Only **8 of 22 axes** have unique matches; **7 have no matching printed word at all**, while the other **7 have two or more**. In particular, the second row (617) has no exact-word target. So the two impressive opening matches cannot simply be iterated as a complete, unambiguous 22-word decoder: the mechanism halts immediately after the first axis without additional unprovided instructions.

This **rejects only that direct total-and-unique mapping interpretation**. A different source-selected sparse reading or a partial clue could still use the two opening values; this experiment does not discount those independently visible source matches. No operator transforms any unknown ciphertext to authenticated language, and no suggested missing target is filled by guesswork.

## Executable original-input witness

[The standalone Node22 CommonJS SFT](../sims/lp2_p32_axis_wordsum_continuation_sft.cjs) reads [the original corpus](../resources/liber-primus/lp2-corpus.json) and [its printed segmentation](../resources/liber-primus/lp2-transcription.txt), asserts all 12,956 rune identities across 2,928 source page-local words, computes all 22 p32 axis sums, lists every corresponding word address, and asserts the 7/8/7 no-match/unique/ambiguous result. It requires no external key, control corpus or language scoring. The opening 563/569 pair remains source evidence; further word-sum hops are retired unless a source instruction explains zero and multiple matches.

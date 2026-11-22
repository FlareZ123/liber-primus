# LP2 H-shell line-length navigation map

**Status: conditional navigation hypothesis; not a recovered LP2 plaintext, key, or validated cipher.** The p0/p7 marker-selected rows are reproducible, but no first-party instruction explicitly selects printed-line rune counts as H operands or specifies the outside-in odd-width extension. The line-length H-shell is a plausible experiment, not an authenticated operation.

## Why this operation is motivated

The authenticated 2016 signed message says:

> The path lies empty; epiphany seeks the devoted. Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.

Its zero-based word positions include PATH=2, DEVOTED=8, WAY=13, MAP=18, ROAD=23 and DIRECTION=29. The same message explicitly warns, “Beware false paths.” The exact source is [resources/cicada2016-4gq25.md](../resources/cicada2016-4gq25.md); the existing source-position and p50 direction analysis is [the signed-2016 direction scaffold](lp2-p28-the-signed2016-direction-scaffold.md).

The p28 DH clue supplies the pair transform H(x,y)=(x−y, x+y) mod 29. For an odd-width row, the tested extension pairs opposite entries outside-in and preserves the middle entry:

- width 3: (a,b,c) → (a−c, a+c, b);
- width 5: (a,b,c,d,e) → (a−e, a+e, b−d, b+d, c).

This combination gives a plausible human experiment: take the 2016 instruction to use numbers as direction, reuse the known p28 H operation, and ask whether visible dot artwork selects groups of original printed-line counts. But the first-party text does **not** say to count runes per printed line, pair those counts outside-in, or preserve the odd-width center. The H operation is source-derived for the p28 DH state; its use on line lengths is an extrapolation. The resulting residues happen to lie in 0–28, the LP2 page-index range, but range compatibility alone does not authenticate the operand or page-index conversion.

## Reproducible map outputs

The p0 and p7 selectors are the focus of Issue #1938: p0's red 13-dot marker has three visible columns and sits at the top, fixing width 3 and the top row; p7's five black dots sit below the last printed line, fixing width 5 and the bottom row. p23's top five-dot emblem and p56's bottom five-dot emblem likewise fix width-5 rows. p18 is different: its row was chosen because it contains the desired WAY/ROAD indices, so it is output-conditioned and is not an independent selector.

| Page | Width and row selector | Original line-rune counts | H-shell rows | Selected output |
|---|---|---|---|---|
| p0 | 3; top red 13-dot marker | [20,23,19,22,24,21,21,23,23,20,23,23] | [1,10,23] / [1,14,24] / [27,15,23] / [26,14,23] | **[1,10,23]** |
| p7 | 5; bottom five-dot emblem | [20,21,21,22,22,23,21,23,21,14] | [27,13,28,14,21] / [9,8,0,13,23] | **[9,8,0,13,23]** |
| p18 | 3; MAP page, source-word match | [22,23,22,21,23,21,22,22,22,20,22,20] | [0,15,23] / [0,13,23] / [0,15,22] / [0,11,22] | **[0,13,23]** |
| p23 | 5; top five-dot emblem | [20,17,17,23,23,23,22,22,25,21] | [26,14,23,11,17] / [2,15,26,18,22] | **[26,14,23,11,17]** |
| p56 | 5; bottom five-dot emblem, solved page | [20,19,6,22,18] | [2,9,26,12,6] | **[2,9,26,12,6]** |

The corpus control establishes vector uniqueness conditional on the chosen H-shell and widths; it does not authenticate that operation. p0's [1,10,23] occurs once among 153 width-3 rows; p7's [9,8,0,13,23] occurs once among seven width-5 rows; p23 and p56 vectors also each occur once among seven width-5 rows. p18's [0,13,23] occurs once among 153 width-3 rows, but p18 was selected by matching WAY/ROAD after the outputs were visible and is not independent evidence. The word-count control does not reproduce it.

Two exact cross-page echoes are retained only as diagnostics, not corroboration:

1. p7's selected row ends in [0,13,23], equal to p18's output; p18's row is output-conditioned and is not an independent selector.
2. p0 row 4, [26,14,23], equals the first three entries of p23's selected row; p0 row 4 is not selected by its top marker and must not be promoted.

Neither echo licenses another H-shell branch.

## Issue #1938: original p0/p7 marker gate

The original p0 scan `17.jpg` (SHA-256 `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`) shows the red 13-dot mark arranged in three columns after the top red heading. It fixes the first width-3 row (printed lines 1–3) before the H-shell output is read. The original p7 scan `24.jpg` (SHA-256 `91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c`) shows five black dots below the final printed line; it fixes the bottom width-5 row (printed lines 6–10). Thus **2/2 row locations** are fixed independently of their output:

| Page | Fixed row | Original line-rune counts | H-shell output | Center |
|---|---|---|---|---:|
| p0 | top row, width 3 | [20,23,19] | **[1,10,23]** | 23 |
| p7 | bottom row, width 5 | [23,21,23,21,14] | **[9,8,0,13,23]** | 23 |

The existing all-page SFT verifies that p0's vector occurs once among 153 compatible width-3 rows and p7's vector once among seven compatible width-5 rows. Both centers are signed-source word index 23, **ROAD**. The p18 output and p0 row-4 echo are excluded as corroboration exactly as specified in the Issue. These observations pass the finite marker/row/convergence test.

They do **not** pass the source-selected-operation test. The 2016 text makes numeric navigation plausible and p28 supplies H, but neither source specifies printed-line rune counts as operands or the outside-in odd-width extension. The marker widths are also read from different geometric properties (p0's three columns versus p7's five-dot count); no general first-party marker-to-width grammar is stated. Finally, interpreting signed-source word index 23 as physical page label p23 is a separate conversion, not an identity supplied by H.

**Issue #1938 disposition:** negative for an authenticated/source-selected H-shell route, while preserving the two marker observations and their conditional ROAD convergence. No plaintext, key, or original-cipher receiver is obtained. Do not search other widths, rows, pages, or target words to rescue this branch.

## What the conditional selected centers say

The final entry of each H-shell row is its unchanged middle line length modulo 29. The conditional center observations are:

| Map page | Center index | Word at that zero-based position in the signed 2016 message | Selector status |
|---|---:|---|---|
| p56 | 6 | seeks | bottom five-dot emblem |
| p23 | 17 | the | top five-dot emblem |
| p0 | 23 | road | top 13-dot marker |
| p7 | 23 | road | bottom five-dot emblem |
| p18 | 23 | road | output-conditioned; not independent |

The p0/p7 markers independently converge on signed-source word index 23, **ROAD**. The p56/p23 markers separately give **SEEKS/THE**. This is a conditional navigation observation, not LP2 plaintext. Interpreting a signed-source word index as a physical page label (for example, 23 → p23) is an additional map convention, not a consequence of H.

The later selector gates have now bounded these continuations. The p56 → p6 → p24 test is **conditional positive for navigation only**: the p56/p6/p24 artwork fixes a finite row or band family and the ordered p24 two-row packet is unique among 112 compatible pairs, but the report explicitly finds no first-party instruction selecting H on line lengths or the outside-in extension; p6's two width-5 rows also share center 24. See [the p56/p6/p24 selector gate](lp2-hshell-p56-p6-p24-selector-gate.md). The p23 ↔ p26 loop is **negative**: p26's exact selected vector occurs three times, center 23 occurs in 55/153 compatible width-3 rows, and p17 has center 23 in three of four rows. See [the p23/p26 loop gate](lp2-hshell-p23-p26-selector-loop-gate.md). Issue #1938 independently fixes p0/p7 row selectors and their ROAD convergence, but not the line-length H operation itself. These are not grounds to extend the H-shell graph.

## Rejected direct-key interpretations

The 12-symbol p18 packet is not a direct period-12 additive key for p18: both signs leave the page's index of coincidence near the raw-ciphertext baseline (approximately 0.034). The map should not be treated as a recovered Vigenere key.

The five-dot geometry also motivated a source-specific p23 test: vertically reverse the printed-line order of p23, or rotate p23 by 180 degrees, then apply the known p56 prime-totient stream to the p23–26 chapter, forward or reversed, with every admissible literal-F bypass state allowed. All four variants hit a forced non-F-to-plaintext-F contradiction at offsets 0, 67, 17 and 143 respectively. This rejects these particular direct prime-totient consumers, not the emblem or the navigation-map hypothesis. The p23 handoff report has been updated with this result.

## Interpretation and next decisive work

The best current interpretation is a **conditional navigation hypothesis**, not a validated cipher. The human solve-path idea is intelligible: a solver sees the authenticated 2016 “numbers are the direction” instruction, already knows the p28 H operation, and notices original dot markers that can suggest row widths/locations. But the specific choice of printed-line rune counts and the outside-in odd-width serialization is not fixed by a first-party instruction. Exact vector uniqueness is conditional on those choices and cannot substitute for a source-selected operand/operation.

The p0/p7 marker observations are worth preserving: two independently located rows yield the same signed-source center index 23. The p56/p6/p24 and p23/p26 follow-ups are already bounded and do not establish a rune-value decoder. The separate source-word-index → physical-page-label conversion also remains a hypothesis.

The next high-value work is not another H-shell page/row search. It is an independently source-selected reversible operation on original ciphertext rune values, with an exact forward inverse and a previously untouched consequence. Do not recursively apply H-shell to arbitrary pages, choose whichever row gives an attractive word, or treat a matching page index as proof. Require a source clue that selects both the operand type and the operation before opening a new unknown-page receiver.

**Reproduction:** [lp2_hshell_line_length_navigation_sft.cjs](../sims/lp2_hshell_line_length_navigation_sft.cjs). The script validates every page's line-rune sum against the canonical corpus, searches all width-compatible rows for exact target uniqueness, checks the cross-page echoes and word-count negative control, and reproduces the p23 pagewise prime-totient gate.

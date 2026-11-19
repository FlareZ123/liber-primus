# LP2 H-shell line-length navigation map

**Status: strong, source-constrained navigation hypothesis; not a recovered LP2 plaintext or a validated cipher.** The original printed-line layout appears to encode a small network of page/word indices when line lengths are processed with the H operation already identified from the p28 Diffie–Hellman clue.

## Why this operation is motivated

The authenticated 2016 signed message says:

> The path lies empty; epiphany seeks the devoted. Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.

Its zero-based word positions include PATH=2, DEVOTED=8, WAY=13, MAP=18, ROAD=23 and DIRECTION=29. The same message explicitly warns, “Beware false paths.” The exact source is [resources/cicada2016-4gq25.md](../resources/cicada2016-4gq25.md); the existing source-position and p50 direction analysis is [the signed-2016 direction scaffold](lp2-p28-the-signed2016-direction-scaffold.md).

The p28 DH clue supplies the pair transform H(x,y)=(x−y, x+y) mod 29. For an odd-width row, the natural outside-in extension pairs opposite entries, moving inward, and preserves the middle entry:

- width 3: (a,b,c) → (a−c, a+c, b);
- width 5: (a,b,c,d,e) → (a−e, a+e, b−d, b+d, c).

The inputs are **counts of original printed-line runes**, not ciphertext rune values, word counts, or OCR pixel estimates. The page's visible marker or source-selected word motivates the row width. The resulting values are residues 0–28, the LP2 page-index range.

## Reproducible map outputs

The widths are fixed by visible/source clues: p0's 13-dot marker has three columns; p7, p23 and p56 share the original five-dot emblem; p18 is selected by MAP at signed-message position 18 and MAP has three letters. The marker-adjacent row is selected on p0, p7, p23 and p56. On p18, the selected row is the unique row that contains the signed-message WAY and ROAD indices in order.

| Page | Width and row selector | Original line-rune counts | H-shell rows | Selected output |
|---|---|---|---|---|
| p0 | 3; top red 13-dot marker | [20,23,19,22,24,21,21,23,23,20,23,23] | [1,10,23] / [1,14,24] / [27,15,23] / [26,14,23] | **[1,10,23]** |
| p7 | 5; bottom five-dot emblem | [20,21,21,22,22,23,21,23,21,14] | [27,13,28,14,21] / [9,8,0,13,23] | **[9,8,0,13,23]** |
| p18 | 3; MAP page, source-word match | [22,23,22,21,23,21,22,22,22,20,22,20] | [0,15,23] / [0,13,23] / [0,15,22] / [0,11,22] | **[0,13,23]** |
| p23 | 5; top five-dot emblem | [20,17,17,23,23,23,22,22,25,21] | [26,14,23,11,17] / [2,15,26,18,22] | **[26,14,23,11,17]** |
| p56 | 5; bottom five-dot emblem, solved page | [20,19,6,22,18] | [2,9,26,12,6] | **[2,9,26,12,6]** |

The complete corpus control is important. The five selected output vectors each occur **exactly once** among all original pages with line counts compatible with their respective widths. In particular, [0,13,23] occurs once among all width-3 rows, on p18 row 2. The word-count control does not reproduce it.

Two exact cross-page echoes strengthen the map interpretation:

1. p7's selected row ends in [0,13,23], exactly equal to p18's selected row.
2. p0 row 4, [26,14,23], is exactly the first three entries of p23's selected row.

The second echo is not the selected p0 row; it may be a false branch. Do not promote it merely because it matches.

## What the selected centers say

The final entry of each H-shell row is its unchanged middle line length modulo 29. The selected centers include:

| Map page | Center index | Word at that zero-based position in the signed 2016 message |
|---|---:|---|
| p56 | 6 | seeks |
| p23 | 17 | the |
| p0, p7, p18 | 23 | road |

These independently selected centers spell the source-message subsequence **“seeks the road”** at positions 6, 17 and 23. This is not LP2 plaintext; it is a source-derived navigation phrase. The convergence of three distinct maps on center 23 makes p23 a strong candidate hub.

There is a constrained continuation worth testing. The p56 center 6 selects p6; p6 has ten printed lines, and its five-wide H-shell map has rows [2,9,21,27,24] and [26,12,27,13,24]. Its red 13-dot marker at rune offset 71 selects row 1, whose center is 24, the signed-message word AND. Thus p56 → p6 → p24 is a plausible next branch. p24 has two mirrored dragonflies; its width-3 map has two middle rows whose centers are 23, potentially returning to ROAD, but the row selector on p24 is not yet established.

Other reciprocal candidates deserve bounded follow-up, not automatic promotion: p23's selected row includes p26 and p17; p26's bottom red-marker row maps back to center 23, while p17 has three of four width-3 row centers at 23. These suggest a road-centered graph, but the precise human selection rule for every branch remains unresolved.

## Rejected direct-key interpretations

The 12-symbol p18 packet is not a direct period-12 additive key for p18: both signs leave the page's index of coincidence near the raw-ciphertext baseline (approximately 0.034). The map should not be treated as a recovered Vigenere key.

The five-dot geometry also motivated a source-specific p23 test: vertically reverse the printed-line order of p23, or rotate p23 by 180 degrees, then apply the known p56 prime-totient stream to the p23–26 chapter, forward or reversed, with every admissible literal-F bypass state allowed. All four variants hit a forced non-F-to-plaintext-F contradiction at offsets 0, 67, 17 and 143 respectively. This rejects these particular direct prime-totient consumers, not the emblem or the navigation-map hypothesis. The p23 handoff report has been updated with this result.

## Interpretation and next decisive work

The best current interpretation is a **navigation layer**: original line breaks supply numbers; the p28 H operation supplies a fixed reversible arithmetic; marker geometry or the signed message selects row width and orientation; and the outputs point into the first 29 LP2 pages and the 2016 message's indexed words. The p0/p7/p18 maps converge on ROAD=23, while p56 and p23 produce the source words SEEKS=6 and THE=17.

A plausible human solve path is: read the 2016 signed message's map instruction; notice the 13-dot and five-dot structures; use the already-clued H operation on the original printed-line counts; follow marker-adjacent rows; then investigate the convergent destination pages rather than trying arbitrary key families. The strongest next tests are independent original-image confirmation of the row selectors, and a bounded study of the p6→p24, p23→p26 and p23→p17 branches for an operation that produces source-native plaintext or an authenticated destination.

Do **not** recursively apply H-shell to arbitrary pages, choose whichever row gives an attractive word, or treat a matching page index as proof. Require a selector fixed before reading the result and seek at least 40 contiguous source-native plaintext runes, an authentic key, or a signed instruction before promoting a cryptographic claim.

**Reproduction:** [lp2_hshell_line_length_navigation_sft.cjs](../sims/lp2_hshell_line_length_navigation_sft.cjs). The script validates every page's line-rune sum against the canonical corpus, searches all width-compatible rows for exact target uniqueness, checks the cross-page echoes and word-count negative control, and reproduces the p23 pagewise prime-totient gate.

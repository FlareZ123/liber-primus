# Original glyph enclosure count as a direct ternary channel

**Decision:** The original rune font has a reproducible, non-arbitrary three-class visual invariant, but it does not yield readable text with the direct, source-shaped p8 or p55 ternary receiver. No new plaintext, key, or author-selected opcode.

## Human-visible premise and scope

Solved p57 says to shed one's own circumferences. In addition to whole-word circumference (already investigated), actual glyphs possess enclosed white regions. The five-dot ornament following p7 and the 243 (=3^5) black runes after p8's 12-red-rune heading make a fixed three-valued glyph representation a conceivable secondary channel. The 75 runes of the 16 complete p55 printed groups also form exactly 25 triplets. The incoming NG is retained in the full-page binary observation, rather than silently discarded from a purported full-page cipher. Neither the p57 instruction nor the dot ornament explicitly selects glyph topology, ternary arithmetic, or this receiver; treat this as an exploratory source-shaped test.

## Source geometry

On exact original 72.jpg, use all 76 inclusive pixel rectangles in the existing p55 source-coordinate JSON. Threshold grayscale at 64, 128 and 192 independently; pad the white background by one pixel, label its four-connected components, discard the outside component and any enclosed region smaller than 20 pixels. Every repeated glyph agrees across occurrences and thresholds. Four identities absent from p55 (O,N,T,Y) are read directly at the fixed original p57 crop coordinates in the SFT. Y has one enclosed white region, the other three have none.

The GP0-indexed class table is:

    0 0 1 0 1 0 0 1 1 0 0 2 0 0 0 0 0 2 0 2 0 1 1 2 0 0 1 0 0

Class sizes are 18,7,4. These are properties of the actual original typeface, not Unicode font assumptions or learned symbol assignments. The 76 p55 glyphs have 50 zero-enclosure, 12 single-enclosure and 14 double-enclosure occurrences, giving 40 total enclosed regions.

## Direct original-input receivers

Take consecutive triples of enclosure counts in printed order, big-endian, using A=0 through Z=25 and an explicit reserved symbol for 26. No fitting, shifts, reversals, keys, phase selection, or insertion.

| Original receiver | Trit counts (0,1,2) | Output |
|---|---|---|
| p8 black body, 243 runes | 156,59,28 | AAMCJBATAUBVWJJFDDBBNBJAKADMJDAAASSBBYAODSAMGAIDDGAJANBAJBCABTPJAJACKGBVUJYDNAGAJ |
| p55 16 complete groups, 75 runes | 50,11,14 | GLGCJCBPASECGCJAAAAMEASYS |
| p56 full encrypted control, 85 runes | 53,20,12 | HFJJDMACYDTSAAJGAAMBSPECDJOA (1 trit remains) |
| p57 full clear control, 95 runes | 70,17,8 | BGABAAJADDBADSBGDJDGDAAHGABKAGT (2 trits remain) |

The p55 full 76-rune direct binary enclosure-presence projection, MSB first, yields aa8c2708ca30003313 with four remaining bits 0100. No ASCII message or natural exact framing appears.

These projections are many-to-one; even a readable secondary message would not constitute an inverse of the original cipher. The source-fixed map is strongly unbalanced, and the direct outputs reflect that bias. Retire these precise direct projections. Do not fit alternate color/threshold, bit assignment, or ternary permutation to these outputs absent an independent instruction. A potential future use of the stable geometry map would require a concrete typed receiver or a frozen independent prediction, not another palette sweep.

**Reproducer:** [sims/lp2_glyph_enclosure_ternary_sft.py](../sims/lp2_glyph_enclosure_ternary_sft.py), with Pillow, NumPy and SciPy. Source: [p55 original coordinates](../resources/liber-primus/lp2-p55-source-glyph-coordinates.json), original 72.jpg and 74.jpg, and [canonical corpus](../resources/liber-primus/lp2-corpus.json). The geometry was executed locally on the supplied original JPEGs; the original corpus projections were executed on the repository canonical indices. No new CI workflow is needed.

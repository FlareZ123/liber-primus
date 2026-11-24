# Original glyph enclosure count as a direct ternary channel

**Decision:** The original rune font has a reproducible, non-arbitrary three-class visual invariant, but it does not yield readable text with the direct, source-shaped p8 or p55 ternary receiver. No new plaintext, key, or author-selected opcode.

## Human-visible premise and scope

Solved p57 says to shed one's own circumferences. In addition to whole-word circumference (already investigated), actual glyphs possess enclosed white regions. The five-dot ornament following p7 and the 243 (=3^5) black runes after p8's 12-red-rune heading make a fixed three-valued glyph representation a conceivable secondary channel. The 75 runes of the 16 complete p55 printed groups also form exactly 25 triplets. The incoming NG is retained in the full-page binary observation, rather than silently discarded from a purported full-page cipher. Neither the p57 instruction nor the dot ornament explicitly selects glyph topology, ternary arithmetic, or this receiver; treat this as an exploratory source-shaped test.

## Source geometry

On exact original 72.jpg, use all 76 inclusive pixel rectangles in the existing p55 source-coordinate JSON. Threshold grayscale at 64, 128 and 192 independently; pad the white background by one pixel, label its four-connected components, discard the outside component and any enclosed region smaller than 20 pixels. Every repeated glyph agrees across occurrences and thresholds. Four identities absent from p55 (O,N,T,Y) are read directly at the fixed original p57 crop coordinates in the SFT. All four have no enclosed regions. The Y crop is at (932,1725)–(983,1839), ending the clear DIUINITY word; the initial (1058,1725)–(1091,1839) crop was the TH of WITHIN and has been corrected. The p55 observations do not involve Y and remain unchanged.

The GP0-indexed class table is:

    0 0 1 0 1 0 0 1 1 0 0 2 0 0 0 0 0 2 0 2 0 1 1 2 0 0 0 0 0

Class sizes are 19,6,4. These are properties of the actual original typeface, not Unicode font assumptions or learned symbol assignments. The 76 p55 glyphs have 50 zero-enclosure, 12 single-enclosure and 14 double-enclosure occurrences, giving 40 total enclosed regions.

## Direct original-input receivers

Take consecutive triples of enclosure counts in printed order, big-endian, using A=0 through Z=25 and an explicit reserved symbol for 26. No fitting, shifts, reversals, keys, phase selection, or insertion.

| Original receiver | Trit counts (0,1,2) | Output |
|---|---|---|
| p8 black body, 243 runes | 165,50,28 | AAJCJBATAUBVVJAFDDBBNBAAKADJJAAAASSBBYAOASAMGAIDDGAJANBAJBCABSPJAJACKGBVUJYDNAGAA |
| p55 16 complete groups, 75 runes | 50,11,14 | GLGCJCBPASECGCJAAAAMEASYS |
| p56 full encrypted control, 85 runes | 56,17,12 | HFAJDMACYDSSAAJGAAMBSGECDJOA (1 trit remains) |
| p57 full clear control, 95 runes | 71,16,8 | BGABAAJADDBADSBGDJDGDAAHGAAKAGT (2 trits remain) |

The p55 full 76-rune direct binary enclosure-presence projection, MSB first, yields aa8c2708ca30003313 with four remaining bits 0100. No ASCII message or natural exact framing appears.

These projections are many-to-one; even a readable secondary message would not constitute an inverse of the original cipher. The source-fixed map is strongly unbalanced, and the direct outputs reflect that bias. Retire these precise direct projections. Do not fit alternate color/threshold, bit assignment, or ternary permutation to these outputs absent an independent instruction. A potential future use of the stable geometry map would require a concrete typed receiver or a frozen independent prediction, not another palette sweep.

## Reversible receiver with the new physical trit map

The direct projection is lossy, but the same independent map can address the actual 243-rune p8 black-body table in an invertible cipher. This tests the missing physically motivated address class of the earlier [p8 nonlinear lookup study](lp2-p7-p8-243-trit-nonlinear-original-consumer.md), which used GP index or prime residues rather than actual font topology. No keys are optimized.

Use the established five p7 red-word GP0 products [11,26,8,15,2] as the initial register, and p8 body in printed order as T. At each rune of the complete p9–14 continuation, convert the five register symbols to enclosure counts, read the big-endian base-three address, and apply P = C ± T[address] mod29. Shift in either C or recovered P and carry state continuously across physical pages. This defines four fixed, genuinely invertible source candidates.

| Feedback | Sign | Original decoded IoC |
|---|---:|---:|
| P | − | 0.03448228216444163 |
| P | + | 0.034405826818508824 |
| C | − | 0.03452281270927348 |
| C | + | 0.03447951871820309500 |

All four replay **1,474/1,474** original ciphertext runes. All four also encrypt and recover **1,474/1,474** p57-native repeated known-source runes, with plant IoC 0.07170221840252543. Raw original IoC is 0.034440830470863604. No original output is coherent prose, and the strongest IoC is essentially unchanged from ciphertext. Exact replay is a correctness invariant only. Retire this precise topology-addressed direct receiver, while preserving the independently determined class map.

**Reproducer:** [sims/lp2_glyph_enclosure_ternary_sft.py](../sims/lp2_glyph_enclosure_ternary_sft.py), with Pillow, NumPy and SciPy. Source: [p55 original coordinates](../resources/liber-primus/lp2-p55-source-glyph-coordinates.json), original 72.jpg and 74.jpg, and [canonical corpus](../resources/liber-primus/lp2-corpus.json). The geometry was executed locally on the supplied original JPEGs; the original corpus projections were executed on the repository canonical indices. No new CI workflow is needed.

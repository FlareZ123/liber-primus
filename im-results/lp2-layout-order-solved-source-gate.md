# Native source layout order: solved ciphertext predicts wraps, plaintext does not

**Decision (#2452, 24 November 2026):** retire the ordinary proportional-font, plaintext-first greedy wrapping channel. Independently calibrated native glyph advances contradict the printed wraps on solved LP1 p6 and solved LP2 p56. The same original transitions are consistent with a common right edge when ciphertext widths are used. This does not prove every unknown page uses the identical typesetter, or rule out an undocumented fixed-width pre-layout, manual hard breaks, or different plaintext register. It supplies no unknown plaintext or new key.

## Independent calibration

Use the original 2400×3600 JPEGs in resources/liber-primus, archive 74.jpg (physical LP2 p57, already clear) and 11.jpg (clear LP1 preservation heading). The black/red ink mask is min(R,G,B)<100; project columns within the five p57 text rows and label nonempty column runs. All 124 projected groups across the five rows (25+23+22+22+32) align exactly to the known rune and delimiter sequences when the ornamental first P is omitted and the multi-column punctuation is grouped. Advance is the difference in consecutive x starts, not just glyph ink width. Median observed advances: I=16 (range 14–17), TH=37 (37–38), A=38 (37–39), E=59 (59–61), U=57.5 (57–58), word dot=16 (15–18), multi-dot sentence mark=46.5 (45–48) pixels. Small P is calibrated independently from clear LP1 p11 at x645→700 (55 px). Glyph height is approximately 114–115 px on all four scans. The font is strongly proportional.

## Held-out original controls and inequalities

LP1 p6 native ciphertext and physical line boundaries are from resources/transcriptions/lp1_wulfic_canonical.txt; decode the solved shifted reverse alphabet P=(2−C) mod29. LP2 p56 ciphertext from resources/liber-primus/lp2-transcription.txt and its known 85-rune plaintext from resources/external/relikd-solved-gp29-native-v1.json are aligned by unchanged rune positions. No candidate unknown plaintext, key or original unknown-page width was used in calibration.

For each nonparagraph mid-word wrap, let x be the first small glyph's observed x coordinate, e its row's rightmost original ink pixel, w the next row's first ciphertext glyph ink width. A proportional plaintext-first greedy wrap at common right edge T requires approximately x+sum(adv(P_line)) <= T < x+sum(adv(P_line+P_next)). We overrelax independently to minimum measured advances for the lower bound and maximum measured advances (including the **entire** next advance) for the upper bound. These are empirical envelopes, not universal font bounds. Ciphertext-first greedy wrap requires e <= T < e+g+w, with ordinary measured inter-glyph gutter g around 5 pixels (3–7 sensitivity). The right edge must accommodate all actual selected ink.

| Source transition (one-based physical rune-text rows) | Plaintext next | Plaintext threshold envelope, px | Original ink end | Next cipher ink width | Cipher next right, g=5 | Conservative remaining plaintext room using actual ink lower bound |
|---|---|---:|---:|---:|---:|---:|
| LP2 p56 4→5 (PILGR / IM) | I | [1667,1731] | 1765 | 50 | 1820 | 52 |
| LP1 p6 2→3 (MASTE / R) | R | [1693,1773] | 1760 | 52 | 1817 | 14 |
| LP1 p6 5→6 (HER / E) | E | [1601,1700] | 1787 | 53 | 1845 | 87 |
| LP1 p6 9→10 (CAL / LED) | L | [1554,1639] | 1750 | 44 | 1799 | 148 |
| LP1 p6 10→11 (WISH / ES) | E | [1542,1640] | 1787 | 53 | 1845 | 147 |

The LP2 p56 held-out plaintext next-I upper edge 1731 is already 52 pixels short of actual ink x1783 in another row of the same page; its median prediction is x1700. The LP1 p6 line2 has a physically observed dropcap indent; lines5,9,10 have the full left margin. Across those four LP1 transitions, even allowing an unknown common plaintext right edge independent of the observed one, the relaxed envelopes have **empty intersection** (required T>=1693 but T<1639). For ciphertext, there is a common feasible interval [1787,1799) at the nominal gutter, and [1787,1797) at gutter3, compatible with the original ~1800 right margin. P56 allows [1783,1820), with the same margin. The LP1 lines9/10 discrepancies remain large even if every estimated advance were shifted by several pixels. The narrow line2 comparison is supplementary; the large margins are the important witnesses. The result is about ordinary proportional GP typography and fixed greedy wrapping, not an exhaustive reconstruction of a particular graphics application.

## Research consequence

Printed breaks and cross-page carries should remain physical ciphertext coordinates. Ordinary same-font plaintext-first wrapping is unsupported as a source of plaintext word-width inequalities. Do not use these line breaks as an independent plaintext width oracle for the unknown pages, and do not perform another whitespace-key search on this premise. The experiment does not resolve whether spaces represent plaintext spaces or a separate reversible segmentation transform. A newly source-authenticated alternate layout engine or original unencrypted document could reopen the question.

Reproducer: [sims/lp2_layout_order_sft.py](../sims/lp2_layout_order_sft.py). Run with Python 3/Pillow/NumPy/SciPy against the four original JPEGs; local execution on original owner-supplied scans passed. No network or model score required. Exact physical line sequences, pixel crops and threshold assertions are embedded.

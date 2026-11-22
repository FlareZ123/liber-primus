# Agent8 correction: p23/p56 enlarged U→O +2 bridge is false

The five-dot stencil relation remains real, but the claimed enlarged glyph pair does not.

Original-image line alignment shows:
- p23 scan40 large initial [601,1155,230,498] fills first-line rune0 = U/index1 (20 transcription runes,19 ordinary-sized components).
- p56 scan73 large initial [601,668,150,498] fills first-line rune0 = AE/index25 (20 runes,19 ordinary-sized components).
- p56 O/index3 is the first rune of line2, which has 19 runes and 19 ordinary-sized components. It is not enlarged and has no matching stencil-selected status.

Same-page shape comparisons confirm the labels: p56 large glyph is much closer to small AE than small O. The full census finds15 comparable large red components on13 pages; p7 is the third stencil page but has no large red initial. The p23/p56 large-initial index delta is24 mod29, not+2. Other +2 pairs exist elsewhere in the large-initial family.

The p23/p56 dot patterns still form an exact half-turn; p7 is the third dihedral member. But the large glyphs stay on the left margin and do not follow the half-turn. The stencil selects a page-art family, not a U/O pair.

Do not use p23/p56 U→O as evidence for the p33/p35 +2 route. No p35 ciphertext or FOUND feedback was used in this audit.

Updated report: im-results/lp2-p23-one-rise-u-o-bridge.md
Reproducer: sims/lp2_p23_p56_large_red_initial_census_sft.py
Issue #1798: closed as completed/negative.

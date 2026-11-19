# P23/p56 enlarged-initial bridge: the claimed U → O rise is rejected

**Agent8, 19 November 2026. Classification: source-image correction.** The five-dot stencil relation is real, but the proposed enlarged-glyph pair U/index1 → O/index3 is not. The large p56 glyph is AE/index25. No p35 ciphertext or FOUND feedback was loaded or used in this adjudication.

## Correct source alignment

The original scans are [p23, 40.jpg](../resources/liber-primus/40.jpg), [solved p56, 73.jpg](../resources/liber-primus/73.jpg), and [p7 control, 24.jpg](../resources/liber-primus/24.jpg).

The fixed image procedure in [the census SFT](../sims/lp2_p23_p56_large_red_initial_census_sft.py) finds the large red components and independently recovers the ordinary text rows. For p23 and p56, the first text row has **20 transcription runes but only 19 ordinary-sized connected components**. The large red initial occupies the missing first-rune position:

| Page | Large red component bbox (x,y,w,h) | Text row | Ordinary components / transcription runes | First rune supplied by large component |
|---:|---|---:|---:|---|
| 23 | [601,1155,230,498] | 0 | 19 / 20 | **U, index 1** |
| 56 | [601,668,150,498] | 0 | 19 / 20 | **AE, index 25** |

The p56 transcription begins with AE on line 0. Its second line begins with O/index3, but that line has **19 ordinary-sized components for 19 transcription runes** and no enlarged red component. The O is therefore not the enlarged p56 initial and is not the visual counterpart of p23's enlarged U.

The shape comparison independently agrees. After fitting binary masks to a centered 128×128 canvas, the p23 large glyph scores IoU 0.915 / cosine 0.955 against a small same-page U, versus 0.815 / 0.899 against a small O. The p56 large glyph scores 0.854 / 0.921 against each of two small same-page AE instances, versus 0.746 / 0.855 and 0.777 / 0.875 against two small O instances. This is a scale-normalized shape check, not a language-model label.

The proposed pair is consequently:

`U_1 \rightarrow AE_{25}`

not `U_1 \rightarrow O_3`. Its zero-based index difference is (25-1=24\equiv-5\pmod{29}), not +2. Under GP prime values, U maps to 3 and AE to 101, a difference of 98. Even the unselected U→O reading would give prime difference (7-3=4), not 2.

## Full comparable large-red-initial census

A fixed red mask (R>70, R>1.35G, R>1.35B), followed by 8-connected components with height at least120, width at least35 and area at least1000, finds **15 components on 13 pages**. The text-row alignment maps 13 unambiguously to the first rune of their corresponding line; two remain ambiguous because their component deficits are two.

| LP2 page | Row | First rune inferred from line alignment |
|---:|---:|---|
| 0 | 0 | S / 15 |
| 3 | 0 | L / 20 |
| 3 | 6 | P / 13 |
| 6 | 4 | A / 24 |
| 8 | 0 | X / 14 |
| 15 | 1 | L / 20 |
| 23 | 0 | **U / 1** |
| 27 | 0 | M / 19 |
| 33 | 0 | D / 23 |
| 33 | 5 | ambiguous |
| 39 | 6 | IA / 27 |
| 40 | 0 | F / 0 |
| 54 | 0 | A / 24 |
| 56 | 0 | **AE / 25** |
| 57 | 0 | ambiguous |

The p7 five-dot page has **zero** components under the same large-red-initial filter. It is a third stencil page, not a third member of a large-initial rune pair.

Among the 13 unambiguous large initials, the other ordered +2 index pairs are p33 D/23 → p56 AE/25 and p39 IA/27 → p40 F/0 (mod29). Thus +2 is not a unique family-wide relation; importantly, neither pair is p23 U → p56 AE.

## What remains true, and what is rejected

The original five-dot geometry remains established: p7↔p23 is a vertical reflection, p7↔p56 a horizontal reflection, and p23↔p56 a 180° rotation. See the [three-page original-image handoff](lp2-p23-p56-halfturn-five-dot-handoff.md) and [dihedral-triad report](lp2-p7-p23-p56-five-dot-dihedral-triad.md).

But the dot transformation does not transform the large initials with it. The p23 large glyph is on the left margin at x=601; a 180° rotation sends its bounding box to the right half of the page, whereas the p56 large glyph is again at x=601. The stencil selects a three-page artwork family; it does not select the alleged U/O rune pair.

**Retire the U→O = +2 visual bridge.** The p23 red-heading reading and the separate p33 local RISE observation are not adjudicated here. The p23/p56 page-number relation (56-23=33) in the separate THEIR RISE report is also unaffected. None of these surviving observations authenticates a new cipher or plaintext.

## Reproduction and scope

Run from repository root:

`python sims/lp2_p23_p56_large_red_initial_census_sft.py`

The SFT uses only the original LP2 JPEGs, canonical corpus/transcription and fixed connected-component rules. It asserts the p23 U and p56 AE line alignments, the ordinary-sized p56 second-line O, the p7 negative control, the 15-component family count, and the alternative family-wide +2 pairs. It does not load p35 ciphertext or FOUND feedback.

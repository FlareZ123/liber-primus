# Original p27 wing: thirteen perimeter faces and two unnumbered internal faces

**Agent5, 15 November 2026. New original-image structural observation and one bounded cipher-negative; zero recovered unknown LP2 plaintext or historical key.**

## Source-visible result

Original physical p27 is archive 44.jpg, 2400x3600 pixels, SHA-256 c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e. Prior source work proved **15 true enclosed pale membrane compartments**, including a 29x24-pixel small triangular face omitted by the old 500-pixel minimum. The present test asks how those **same fifteen** components relate to the wing's actual exterior contour, rather than using arbitrary proximity edges to infer a full 15-node traversal.

Apply the pre-existing fixed crop x520..1939/y450..929, 8-connected pale components, threshold 160 and 200-pixel area minimum, then number all 15 component centroids by increasing x. Follow the longest exterior black contour, label each point by its closest enclosed pale face if within 50 source pixels, and retain perimeter label runs at least twelve pixels long. That yields **thirteen** actual margin-visible face labels in perimeter order, from the left root along the lower edge to the right tip and back along the upper edge:

**1, 2, 5, 7, 4, 8, 11, 12, 14, 15, 13, 10, 3**

Exactly **two** components are wholly enclosed from that exterior reading: **6** (centroid x1221,y698) and **9** (centroid x1379,y647). The previously missed small triangular face **7** is **on the lower rim**, not one of the two enclosed central faces.

This precise 13+2 decomposition and the complete thirteen-face perimeter order recur unchanged at original grayscale thresholds **80, 120, 160, 200, 235**. Original contour run counts are **14, 14, 16, 14, 14** before omitting the exterior gap and threshold200's short contact fragments. The corresponding original labeled 15 components are unchanged. The single-file image and corpus reproduction verifies all five independent pixel thresholds. This is a fixed image-analysis contract, not a claimed author's parsing rule; contour proximity cutoffs are still analyst choices.

## Cipher consequence and bounded test

The original p27 is **234 GP29 runes = 18x13**, and the original title ends with the common red 13-dot punctuation. These are exact source numbers but not an independent instruction to transpose thirteen columns. The red 13-dot mark also appears throughout the book, so correspondence with thirteen perimeter compartments is not a unique key selector.

Anatomical rim traversal offers a unique order for those thirteen exterior faces **once one chooses a start and direction**, but the picture does not tell a 2014 solver where the two central faces belong in a 15-cell key, how to turn face identities into GP29 numbers, or which original page should receive them. The previously suggested fifteen-p15-prime-gap correspondence therefore remains without a source-appointed operand.

One deliberately simple and bounded consumer uses the 2014-original p27↔p55 repeated two-word bookend as a conditional link: append inner faces 6,9 to the exterior list, use the resulting 15-element ordering for a five-row/fifteen-column transposition of p55's actual **75-rune body** (excluding its first, cross-page carry rune). Test column-fill/row-read and row-write/column-read, each with the fixed shell order and its reversal. The four original-runic readouts begin respectively:

- AEBSWGIIAXJSPMG...
- AEIAPEOSMAHETHS...
- JIGGSBSEOAEIAF...
- SEAIASXBWMGI...

All four are opaque and no original GP-native prose is recovered. Every inverse is tested by exact round-trip reconstruction of the unchanged 75 original rune indices. The native IoC is **0.038558558559** for the input and all four transpositions, exactly as required because a transposition only reorders runes. The entire p27 page similarly has IoC **0.033931257107**. Thus **no pure permutation** of its existing runes, whether thirteen columns, fifteen wing faces or an unknown ordering, can change its cipher-like rune-frequency profile. This is a statistical objection to direct GP-native English under a pure rearrangement, not proof against all possible 234-rune English samples, later substitutions or other plaintext registers.

The chosen shell append/columnar rule is explicitly an investigator attempt, **not** a source-authenticated decipherment. The original repeated p27/p55 two-word motif and page55's 75-rune body were already documented by previous agents; neither fact is newly claimed here.

## Decision

**Preserve the exact 13-rim/2-inner geometry as a new candidate clue; retire the literal fixed shell transposition of p55 and any claim that bare wing-cell count supplies a unique fifteen-step key.** A dated source plate with labels registered unambiguously onto the original graphic would be needed to fix the interior placement and labels. A separately period-authenticated operation must then explain which text stream to decrypt, its clock and how the labels become key material. There is currently **no such selector**, so extending the test by arbitrary winding starts, substitutions or matched language scores would overfit.

**Reproducer:** sims/lp2_p27_wing_perimeter_sft.py, reading resources/liber-primus/44.jpg and resources/liber-primus/lp2-corpus.json. Prior face audit: im-results/lp2-p27-fifteenth-wing-face-source-gate.md; prior fifteen-transition graph ambiguity: im-results/lp2-p27-p15-fifteen-transition-order-gate.md.

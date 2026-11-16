# Original p27 wing: thirteen perimeter faces and two unnumbered internal faces

**Agent5, 15 November 2026; Agent14 16 November full-face traversal gate. Original-image structural observation and two bounded cipher/reader negatives. Zero recovered unknown LP2 plaintext or historical key.**

## Source-visible result

Original physical p27 is archive 44.jpg, 2400x3600 pixels, SHA-256 c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e. Prior source work proved **15 true enclosed pale membrane compartments**, including a 29x24-pixel small triangular face omitted by the old 500-pixel minimum. The present test asks how those **same fifteen** components relate to the wing's actual exterior contour, rather than using arbitrary proximity edges to infer a full 15-node traversal.

Apply the pre-existing fixed crop x520..1939/y450..929, 8-connected pale components, threshold 160 and 200-pixel area minimum, then number all 15 component centroids by increasing x. Follow the longest exterior black contour, label each point by its closest enclosed pale face if within 50 source pixels, and retain perimeter label runs at least twelve pixels long. That yields **thirteen** actual margin-visible face labels in perimeter order, from the left root along the lower edge to the right tip and back along the upper edge:

**1, 2, 5, 7, 4, 8, 11, 12, 14, 15, 13, 10, 3**

Exactly **two** components are wholly enclosed from that exterior reading: **6** (centroid x1221,y698) and **9** (centroid x1379,y647). The previously missed small triangular face **7** is **on the lower rim**, not one of the two enclosed central faces.

This precise 13+2 decomposition and the complete thirteen-face perimeter order recur unchanged at original grayscale thresholds **80, 120, 160, 200, 235**. Original contour run counts are **14, 14, 16, 14, 14** before omitting the exterior gap and threshold200's short contact fragments. The corresponding original labeled 15 components are unchanged. The single-file image and corpus reproduction verifies all five independent pixel thresholds. This is a fixed image-analysis contract, not a claimed author's parsing rule; contour proximity cutoffs are still analyst choices.


### Whole-wing root-to-tip routing remains nonunique

To determine whether the whole original venation network fixes one reader, retain the same fifteen native-scale faces and grant a restrictive deterministic operation: start at leftmost face 1 (812,723), end at rightmost face 15 (1711,680), visit every face exactly once, and move only between image-neighboring faces. This grants the apparent anatomical root-to-tip direction even though no arrow is printed.

The existing reciprocal-near-contour contact criterion requires at least 25 boundary pixels on each of two cells to lie within the proposed fixed radius. At source grayscale threshold160 and minimum enclosed area200px, exhaustive bitmask DP yields:

| Contact radius | Graph edges | Complete 1→15 paths |
| ---: | ---: | ---: |
| 18 px | 24 | **4** |
| 22 px | 27 | **6** |
| 26 px | 27 | **6** |
| 30 px | 28 | **13** |

For the stricter 18px graph, *both* 1,2,5,7,4,3,6,8,11,12,9,14,10,13,15 and 1,2,5,7,4,3,6,8,11,12,14,9,10,13,15 are valid distinct complete self-avoiding paths through actual neighboring face regions. Across source thresholds80,120,160,200,235 and contact radii18,22,26,30, the observed path-count minimum is **4**; only threshold235/radius22 differs from the usual six with four, still nonunique. The path algorithm detects exactly one route on a native synthetic 15-node chain and two on a complete four-node graph with specified endpoints.

Thus even selecting the endpoints, disallowing revisits and requiring local image contacts cannot specify a unique full-wing cipher reading order. The proximity radius remains an investigator's convention, and no labels select one of these alternatives or map it to a GP29 inverse. [Read-only original-JPEG reproducible test](../sims/lp2_p27_wing_15face_root_tip_nonunique_sft.py) asserts exact source hash, all 20 image settings, and two admissible rival orders. No key, unknown plaintext, or original-cipher claim is derived.


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

**Preserve the exact 13-rim/2-inner geometry as a candidate visual clue; retire the tested fixed shell transposition and any claim that the unlabeled wing supplies one unique fifteen-step key.** Full root-to-tip traversal remains nonunique even under restrictive self-avoiding graph adjacency, with at least four routes in the native-image settings tested. An independently dated plate with unambiguous registered vein labels, or a separately authored rule distinguishing these valid routes, is needed to fix the fifteen-position sequence. A second author-selected operation must establish the ciphertext receiver and GP29 key mapping. Neither exists in the current source, so another path or shift selected from language scores would fit the output after the fact.

**Reproducer:** sims/lp2_p27_wing_perimeter_sft.py, reading resources/liber-primus/44.jpg and resources/liber-primus/lp2-corpus.json. Full root-to-tip test: sims/lp2_p27_wing_15face_root_tip_nonunique_sft.py. Prior face audit: im-results/lp2-p27-fifteenth-wing-face-source-gate.md; prior fifteen-transition graph ambiguity: im-results/lp2-p27-p15-fifteen-transition-order-gate.md.

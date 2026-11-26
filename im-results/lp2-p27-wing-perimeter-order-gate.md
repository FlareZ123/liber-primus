# Original p27 wing: thirteen perimeter faces and two unnumbered internal faces

**Agent5, 15 November 2026; Agent14 16 November full-face traversal gate; Agent3 21 November inner-face order gate. Original-image structural observation and bounded cipher/reader negatives. Zero recovered unknown LP2 plaintext or historical key.**

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

Thus even selecting the endpoints, disallowing revisits and requiring local image contacts cannot specify a unique full-wing cipher reading order. The proximity radius remains an investigator's convention, and no labels select one of these alternatives or map it to a GP29 inverse.

**Specific inner-face order gate (#1986, Agent3, 21 November).** The two source-visible internal components are distinct in position and are stable across all five thresholds. Under the analyst's left-to-right component ranking, face 6 has centroid about (1221,698) and face 9 about (1379,647); their areas differ by only about 1%. A simple horizontal sort therefore gives 6 then 9, but the numbers 6/9 are analyst-assigned ranks, not printed labels. More importantly, the existing root-to-tip proximity model does not force this sequence: **all 20 combinations** of five grayscale thresholds and four contact radii admit complete paths with both face 6 before face 9 and face 9 before face 6. At threshold160/radius18, one reversed-order witness is `1,2,5,7,4,3,9,6,8,11,12,14,10,13,15`. The graph remains an investigator-defined near-contour proxy, not a physical shared-vein graph; the result shows that it cannot authenticate the left-to-right convention as the author's reading order. The updated [original-JPEG reproducer](../sims/lp2_p27_wing_15face_root_tip_nonunique_sft.py) asserts the original hash, the 13+2 partition, both pair orders in every tested setting, and the existing chain/K4 positive controls.

No key, unknown plaintext, or original-cipher claim is derived.


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

## Inner-face values and a possible competing target

The only two low-description numerical readings were considered and rejected at the source-selector gate:

- **Interior count 2 → DH shared value K=2.** The equality is exact, but no original clue identifies the number of surviving compartments with the DH shared secret rather than another state field or a simple count. It supplies no separate value for either face and no reversible receiver.
- **Analyst x-ranks 6 and 9 → GP29 indices G and N.** The x-ranks are not printed on the source image. No first-party instruction says to convert face ranks to GP29 ordinals, and `GN` does not identify a typed operation or receiver.

The p27 heading **WE MUST SHED** and solved p57's “SHED OUR OWN CIRCUMFERENCES” make the perimeter-removal interpretation plausible. They do not specify the numeric mapping or a cipher. The p57 phrase “FIND THE DIVINITY WITHIN” also has a serious competing referent in the 809-centred 5×5 square, whose recursive circumference removal leaves one centre value; no evidence uniquely transfers that instruction to the p27 wing's two remaining cells. The p22→ARE27 route selects a p27 text word and its local H readout, not the wing's face labels or a rune-key consumer.


## Weighted shared-interface candidate and fixed-key failure (Agent1, 26 November)

A different, deterministic geometric proxy resolves the earlier unweighted routing ambiguity **conditional on an analyst-selected objective**. Reuse the original crop, 15 x-ranked pale components and exterior component. Assign each intervening pixel its nearest retained region by Euclidean distance; count unit horizontal/vertical grid edges separating different positive labels. These Manhattan interface counts approximate contact strength, not verified physical vein length. There are 28 positive interfaces, 25 with length at least 20 grid edges; the latter graph admits four complete root-to-tip paths at each of the five original grayscale thresholds. The unique maximum-total-interface path, even retaining all 28 contacts and nine paths, is:

`1,2,5,7,4,3,6,8,11,12,14,9,10,13,15`

| Gray threshold | Best weight (cutoff 20) | Runner-up |
| --- | ---: | ---: |
| 80 | 2394 | 2289 |
| 120 | 2388 | 2281 |
| 160 | 2377 | 2273 |
| 200 | 2361 | 2258 |
| 235 | 2357 | 2247 |

A fresh receiver motivation is the corrected body clock: the known identical six-rune DJU BEI echo starts at p27 offset28 and p55 offset70 in the full physical pages, but at offsets **9 and 69** after excluding the red19 p27 heading and the one p55 incoming carry rune. These are congruent modulo 15. This does not establish key reuse or equal plaintext.

Freeze one candidate without language scoring: assign the 15 nonred [p15 spiral prime values](../results/lp2-p15-fibonacci-prime-spiral.md) in their established sequence to faces 1–15, read the maximum-interface route, subtract one as in solved p56 and reduce mod29. The resulting candidate key is `[2,4,22,20,12,6,13,3,16,1,11,1,27,11,15]`. Use positive additive encryption with a fresh body-reset phase zero. Ordinary consuming inversion gives opaque streams; its identical decoded echo is forced by the ciphertext/phase match. Under authentic literal plaintext-F holds, enumerate every inverse branch: p27 has six legal full-body paths (three each ending phases13 and14), none reads as coherent prose; p55 has **zero full paths**, first dead at body index60 (physical rune index61), where incoming phase14 requires consuming plaintext zero from ciphertext15/key15, which is prohibited by the F-bypass rule. The nonzero ciphertext also cannot be a held literal F. The clear 95-rune p57 planted control retains its actual full plaintext among 16 legal paths, all of which reencrypt exactly.

This is an exact rejection of this single frozen F-hold receiver, not all period15 keys, and a qualitative ordinary-consuming negative. The maximal-interface rule, x-rank assignment, mapping of p15 primes to p27, additive clock and body resets are exploratory decisions, not independent author instructions. The local Python image computation and connected JS exact inverse/control ran separately; the integrated Python reproducer is supplied but was not executed end-to-end in this invocation. Corpus Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.

[Integrated reproducer](../sims/lp2_p27_wing_weighted_route_fhold_sft.py).

## Decision

**Preserve the exact 13-rim/2-inner geometry as a candidate visual clue; retire the tested fixed shell transposition and weighted-route p15 F-hold receiver, and close the claim that the unlabeled wing supplies a unique fifteen-step key.** The two inner faces are geometrically distinguishable and can be sorted left-to-right by an ordinary reading convention, but that convention is not authored on the image; the source-derived root-to-tip proximity family admits both orders in every tested setting. Neither the face count nor analyst ranks select a GP29/DH mapping, reversible operation, or ciphertext receiver. The maximum-interface objective does select a stable exploratory route, but its single tested p15-key consumer fails exactly; it does not resolve the author-intent ambiguity. Seek an independently motivated operand or operation before further route/key variants; do not select a path or key by language score.

**Reproducer:** sims/lp2_p27_wing_perimeter_sft.py, reading resources/liber-primus/44.jpg and resources/liber-primus/lp2-corpus.json. Full root-to-tip and inner-pair order test: sims/lp2_p27_wing_15face_root_tip_nonunique_sft.py. Prior face audit: im-results/lp2-p27-fifteenth-wing-face-source-gate.md; prior fifteen-transition graph ambiguity: im-results/lp2-p27-p15-fifteen-transition-order-gate.md.

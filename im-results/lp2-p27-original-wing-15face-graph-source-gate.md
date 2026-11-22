# p27 original wing: 15 enclosed cells, four viable basal-to-tip tours, no sourced reversible reader

**17 November 2026, Agent 7; original-image source decision for Director #1414.** The source-original Cicada LP2 p27 wing (resources/liber-primus/44.jpg, SHA256 c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e) can be treated as a finite planar adjacency graph. This gives a reproducible 15-cell object and a useful negative about traversal uniqueness, but does **not** select a rune assignment, reversible opcode, plaintext key or Cicada continuation. The original p27–32 chapter remains undeciphered.

## Motivating clue, exact source extraction

The wing drawing is directly above the p27 red title and the opening text. Its evident proximal/base side is left, distal/tip side right. Using native 2400×3600 JPEG coordinates, crop x=590..1839, y=470..894. Classify grayscale pixel values below 120 as ink, label eight-connected white regions, select 200 < region area < 70000, and sort the 15 surviving enclosed regions by increasing horizontal centroid. These region IDs are *analysis labels*, **not** numbers printed by Cicada. Their centers, in that order, are:

~~~text
1 (812,723)   2 (920,736)   3 (970,591)   4 (1064,733)  5 (1114,802)
6 (1222,698)  7 (1231,839)  8 (1375,806)  9 (1379,647) 10 (1444,596)
11 (1486,785) 12 (1589,755) 13 (1633,623) 14 (1673,719) 15 (1710,680)
~~~

An image-defined dual graph connects two regions when their nearest-face pixel regions have at least 40 sampled four-neighbor interface contacts within 12 native pixels of a white face. The canonical 120-threshold image produces **24** edges. At thresholds 80,100,120,140,160,180,200, the graph contains **25,25,24,24,24,25,25** edges, respectively, including a threshold-sensitive short basal 1-4 near-contact. All seven give **15 faces and exactly four** Hamiltonian paths between the leftmost basal cell 1 and terminal cell 15. No author's entrance arrow, face label or instruction is visible. Choosing base1 and tip15 already favors one plausible orientation; it does not resolve the remaining four-way ambiguity.

The four full routes, with analysis-defined cell numbers, are:

~~~text
1 2 5 7 4 3 6 8 11 12 9 14 10 13 15
1 2 5 7 4 3 6 8 11 12 14 9 10 13 15
1 2 5 7 4 3 9 6 8 11 12 14 10 13 15
1 2 5 7 4 8 11 6 3 9 12 14 10 13 15
~~~

The paths differ on internal branch selection. No original clue says to enumerate Hamiltonian paths, use face centroids, assign runes to all faces, or resolve these branches by a linguistic score. The tiny lower edge cell7 and upper sliver cell13 are genuine enclosed regions for this tested segmentation, though any operational assignment still needs an authored reader.

## Frozen positive control, original-input consequence

We froze a minimal reversible *illustrative* grammar independent of unknown ciphertext: group fifteen runes; assign them to face IDs following one graph path; emit cells in increasing horizontal centroid order; decode by the inverse path; leave the last incomplete group unchanged. This is an ordinary permutation, not an original authored cipher claim. With each of the four independently enumerated paths:

- An authentic solved **p57 95-rune** passage artificially encoded by this grammar decodes **95/95 exactly**, and the encoded form is distinct from its source.
- The entire original untouched p27–32 chapter has physical page rune counts **234+269+277+263+269+121=1433**. It comprises 95 full 15-rune groups and an **eight-rune tail**, whose handling the drawing does not specify. With the illustrative passthrough rule, all four receiver/encoder pairs round-trip **1433/1433** correctly.
- All four transpositions conserve the exact GP29 rune histogram. The source chapter has **IoC 0.03418620154615663**, while the authenticated, clear native GP29 p57 control has **IoC 0.06270996640537514**. Every pure cell-order permutation leaves original IoC exactly unchanged. Such an ordering alone cannot restore the solved-source plaintext-like monogram distribution.

This is a *finite exclusion for source-only symbol-preserving wing rearrangements*, and a stronger practical warning against treating visually pleasing routes as a decryption. The IoC comparison is diagnostic rather than a theorem excluding unusual genuine plaintext distributions. The graph may still have a key-generation, state-machine, visual-index or other role, conditional on an independently authored input/output operation.

## Reproducer and decision

**Read-only Python SFT:** [lp2_p27_wing_original_graph_sft.py](../sims/lp2_p27_wing_original_graph_sft.py), using repository-original JPEG plus canonical GP29 corpus and the standard numpy, scipy, opencv-python packages. It verifies the immutable source-image SHA256; runs seven independent pixel thresholds; enumerates every basal-to-tip Hamiltonian traversal; checks both native p57 plants and all untouched original p27–32 ciphertext; and asserts the exact 29-symbol histograms. Local execution reproduced every stated output on the original JPEG and independently obtained canonical GP-index sequence.

**Director fork:** There is no unique image-authored entrance/branch/face value/restoration rule, despite a stable 15-node graph. Close this particular source-only planar traversal assignment. Reopen only if a new first-party selector supplies an explicit face-to-rune transition, ordering and tail clock; any proposed value-changing receiver must generate a complete independent original plaintext interval and withheld-page prediction. Do not compensate for the missing rule by brute-forcing face permutations or fitting a post-selected 15-state numerical cipher to the same source data.

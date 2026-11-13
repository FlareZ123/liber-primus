# LP2 p27 illustrated wing: bounded venation-cell clue route

**Status (Agent40, 13 November 2026):** New reproducible visual anatomy input, **unselected cryptanalytic route**. No authentic unknown plaintext, password, key, or cipher is recovered here. The wing's enclosed region count may help identify a historically nameable ordered set, but a mere cell count is not an instruction to read or decrypt the surrounding runes.

## Direct original-image observation

Physical LP2 p27 is the original archive `resources/liber-primus/44.jpg`, SHA-256 `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e`, 2400×3600. The upper drawing depicts an isolated dark-veined wing with no letter labels. The red heading below it has **19 GP29 runes**, divided into printed **3/12/4** words (see `resources/liber-primus/lp2-ink-annotations.json`). Neither wing cells nor vein names are printed in the image.

To isolate the substantial pale membrane faces bounded by original dark veins, use the padded native-scale rectangle x=520..1939, y=450..929. Label 8-connected pixels with grayscale value strictly greater than threshold. Reject any connected pale component touching the rectangular edge and all regions below **500 pixels**. This recovers **14 enclosed components** at each of original thresholds **80, 120, 160, 200, 235**. At threshold160, centroids (x,y, original image pixels) sorted left to right are:

```text
(812,723), (920,736), (970,591), (1064,733), (1114,803),
(1221,698), (1375,806), (1379,647), (1444,596),
(1486,785), (1589,755), (1633,623), (1673,719), (1711,680)
```

[Exact independent image reader](../sims/lp2_p27_wing_venation_cells_sft.py) checks five thresholds and prints all centroids and component areas. A second original-image fingerprint identifies face adjacency by requiring at least 25 boundary contour samples on **each** of two faces within 30 source pixels of the other contour. It gives **26 face-pair edges** in the left-to-right 14-node graph; the exact same 26 edges persist at all five thresholds. This gives a practical, orientation-aware shape fingerprint that can be compared with a dated anatomical plate without guessing any rune key. Contact inferred by this pixel-distance criterion can include near-touching faces at vertices, so an independent taxonomy diagram would still need proper registration. It was tested on the original JPEG. The number 14 is **a segmentation result under an explicit crop/size criterion**: extremely narrow veins, small peripheral slivers, nearby threshold-connected regions, and any unconstrained alternative crop can change the count. It is not proven to be the anatomical count recognized by the artist.

## Pre-2014 anatomical vocabulary and potential human operation

Comstock and Needham formalized insect wing venation terminology in **1898** ([contemporaneous publication](https://www.journals.uchicago.edu/doi/10.1086/276780)). A concrete pre-puzzle reference is M. S. Moulds's **2012** cicada forewing diagram, [*A review of the genera of Australian cicadas*](https://mapress.com/zootaxa/2012/f/zt03287p262.pdf), figure 5. Its annotated *Tamasa tristigma* forewing names **eight apical cells a1..a8, three ulnar cells u1..u3, one radial cell rc, one medial cell mc, and a basal cell bc**. These fourteen selected cell categories, drawn from a more extensive annotation inventory that also names cubital and other cells, are only a possible *external dictionary* for an anatomical order, independently established before LP2. The resemblance in count is at present **only a hypothesis**: this original drawing is not proven to depict *Tamasa* or match Moulds's figure topology, and the published reference also annotates other structures. Do not assign those names to the fourteen raster components on count alone.

The artist supplied a left-base/right-tip orientation and branching veins. A potentially useful next **source-first decision** is to compare branching adjacency, margin and apex positions against period taxonomic diagrams. An exact topological match to a dated published wing with author-selected references could then establish a canonical traversal (e.g. named apical cells 1..8), enabling a *locked* key/readout prediction on previously untouched p27 ciphertext. A cross-image correspondence should preserve region adjacency and order, not be tuned to English scores.

**Proposed decisive test, gated on stronger source evidence:** independently identify the exact published wing or unique vein-label convention; register face-to-face topology and define the ordered emitted value for each named cell **before touching ciphertext**; specify how that 14-value object encodes an operation or key and exactly which ciphertext bytes/runes it consumes; then require coherent plaintext across withheld text and full inverse/re-encryption. The figure currently provides **no** selected numerical encoding, GP rune mapping, ciphertext start, or way to bridge 14 cells to the printed 19-rune heading. A path requiring guessed offsets or arbitrary labels is not ready for a decoding attack.

## Prior-work boundary and decision

The repository's earlier [insect image gate](../sims/insect_wing_fold_artwork_gate.py) measured the p27 wing's axis and its relationship to p53/p55 moth ornamentation. This test adds a separate enclosed-face inventory; it does **not** revisit image-header/chroma gates, title/Instar crib rejection, MP3 XOR, existing p27/p55 bookend-key attacks or generic cipher sweeps. The 2013 MP3's known parable already explains why insect symbolism may be thematic. A new anatomical source should be treated as cipher evidence only if it yields a unique, reversible source-locked operation.

**Current decision:** preserve this indexed image route as a potential human-readable clue; no basis to change `results/README.md` or claim a breakthrough.

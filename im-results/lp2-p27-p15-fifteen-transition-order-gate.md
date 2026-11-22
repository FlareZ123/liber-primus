# P27 wing versus P15 spiral: fifteen entries do not specify a cipher clock

**Agent14, 14 November 2026. Bounded geometric uniqueness result, not plaintext recovery.**

## Original-input premises

- Physical p27 is the unmodified original `resources/liber-primus/44.jpg`, SHA-256 `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e`, 2400×3600 pixels. [Source-pixel count correction](lp2-p27-fifteenth-wing-face-source-gate.md) demonstrates 15 enclosed pale wing faces under image crop x520:1940/y450:930, grayscale threshold 160, eight-neighbour connectivity, and a 200-pixel minimum component area. A 500-pixel cutoff discards one genuine 344-pixel face. No original image marks a numbered reading order on the wing.
- Physical p15's numerical square is source-reconstructed as the sixteen numbers `abs(3301 - prime(F_n + 1))` in its [established red-origin spiral order](../results/lp2-p15-fibonacci-prime-spiral.md), with distinct Fibonacci inputs `F_n = 0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987`. Sixteen numbers have fifteen adjacent transitions by construction. Equally, the central **3299 is the sole red numeral**, leaving exactly **fifteen black printed numerical cells**. Thus even a deliberate visual 15↔15 correspondence has at least two direct source-selected candidate inventories: the fifteen *transitions* and the fifteen *unhighlighted number cells*. Their existence does not independently indicate an intended wing connection or a conversion rule.

The **fifteen successive prime gaps** in the p15 spiral are `1,2,2,6,10,20,36,70,114,200,366,652,1112,1914,3310`. Their GP29 reductions are `1,2,2,6,10,20,7,12,27,26,18,14,10,0,4`.

An alternative equally direct original-page operation, taking **signed differences of the fifteen printed positive magnitudes**, yields `-1,-2,-2,-6,-10,-20,-36,-70,-114,-200,-366,-652,-1112,+498,+3310`. The prime-gap and printed-difference streams differ especially at the crossing of 3301 because p15 prints absolute values. The source does not indicate that the positive prime gaps, absolute numeral differences, signed changes, GP29 reductions, or Fibonacci-index increments should be assigned to wing cells.

## A controlled test of whether wing geometry forces a fifteen-cell traversal

[Exact source-file SFT](../sims/lp2_p27_wing15_traversal_sft.py) locates the fifteen pale connected components directly from original p27 pixels. It labels each component by increasing centroid x, extracts its full contour, and creates a *proximity proxy* edge when **at least 25 boundary samples on each contour** lie within the selected Euclidean radius of the other contour. Three explicit contour radii are tested as a sensitivity check. This proxy can count near-corner contacts: **it is not a taxonomic or physical shared-vein graph**. It tests the narrower claim that the visible source geometry itself forces one natural proximity traversal.

An exact subset dynamic program enumerates every Hamiltonian path visiting all fifteen identified faces once. It also counts a more favorable, hypothesized **wing-base-to-tip convention**, fixing the leftmost face as the first and the rightmost as the last. Neither direction nor Hamiltonian reading is marked by the author, so these are generously imposed assumptions rather than recovered instructions. Small known three-vertex path and triangle tests exercise the path counter.

| Source contour radius (px) | Proximity edges | All oriented Hamiltonian paths | Paths with fixed leftmost start and rightmost end |
| ---: | ---: | ---: | ---: |
| 16 | 24 | 40 | **4** |
| 20 | 25 | 54 | **4** |
| 24 | 27 | 144 | **6** |

All three original-image results are executable assertions, not fitted decryptions. Even a favorable root-tip restriction leaves several valid complete orders in every tested proxy; the order is not unique. Loosening the proximity radius changes the count appreciably. Two 16px radius root-to-tip paths explicitly include these **different** complete original-face orderings (1-based, faces sorted by centroid x):

- `1 2 5 7 4 3 6 8 11 12 9 14 10 13 15`
- `1 2 5 7 4 3 6 8 11 12 14 9 10 13 15`

The disagreement appears before considering which p15 arithmetic stream to assign to those faces, how to map the sequence into a GP29 alphabet, what ciphertext offset/clock to use, or which reversible cipher operation was historically indicated. Geometry-based uniqueness in this *specific* model therefore fails. This result makes no claim that all possible original anatomical plate traversals are nonunique: source-defined external numbering or art-direction conventions may resolve the ambiguity.

## Cryptanalytic decision

The count `15 faces ↔ 15 adjacent p15 transitions` supplies **zero source-fixed rune key positions** until an independently identified historical wing plate selects an original-face ordering. A page-count coincidence is not a ciphertext decoder. Even a labeled plate is insufficient unless a genuine instruction selects the relevant arithmetic operand, alphabet mapping and reversible operation.

[Issue #796](https://github.com/FlareZ123/liber-primus/issues/796) separately seeks a specific original-period illustration whose caption or labels might provide exactly that selector. This report does **not** redo its plate comparison. Under [Director #805](https://github.com/FlareZ123/liber-primus/issues/805), an authenticated, uniquely registered illustration order plus a source-specified reversible operation would justify *one* frozen original-p27 test with independently untouched runes and exact re-encoding. With neither input, pursuing 15! mappings, selecting a graph radius that fits ciphertext, or repeating 15-key Vigenère/Hill sweeps would only overfit.

**Outcome:** no new plaintext, key, original cipher operation or final destination. The measured image supports fifteen faces while the source-supported relation from their count to the p15 spiral remains **unassigned**. This is a geometric **selection failure in an explicitly bounded model**, not a universal disproof of an artwork clue.

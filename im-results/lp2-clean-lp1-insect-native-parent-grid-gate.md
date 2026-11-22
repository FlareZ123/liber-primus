# An independently documented clean LP1 plate fails the LP2 native-JPEG coefficient grid

**Agent11, 22 November 2026, Director #2221.** One genuinely earlier illustrated page family supplies a reproducible positive control for direct native-DCT comparison, but the same artist's *encrypted LP2 receiver* shifts the copied plate across the JPEG 8×8 lattice. Thus a common-preembedded coefficient message cannot be extracted from this LP1→LP2 pair by valid native coefficient subtraction. This is a **specific comparator-gate failure**, not evidence that no image steganography exists, and it recovers no LP2 plaintext or key.

## Independent source and frozen geometry

The original 75-file Liber Primus archive includes solved first-release `09.jpg`, `13.jpg` and `16.jpg`, preceding encrypted second-release physical p2 `19.jpg`. Their independently established **690×185 insect drawing** follows the original-source crop coordinates in [the source-raster certification](lp1-lp2-crossrelease-artwork-raster-copies.md) and [its no-crib SFT](../sims/lp1_lp2_illustration_raster_reuse_sft.py):

| Art occurrence | Scan | Original crop top-left (x,y) | Relation to LP1 scan09 |
|---|---|---|---|
| Parent solved LP1 | 09.jpg | (835,1935) | reference |
| Parent solved LP1 | 13.jpg | (851,1079) | horizontal mirror |
| Independent solved LP1 positive | 16.jpg | (859,1455) | exact grayscale copy |
| Encrypted LP2 physical p2 | 19.jpg | (876,2642) | horizontal mirror of scan09 |

The image hashes are pinned in that source-raster SFT. The 09→16 copy has original-grid translation **(+24,−480)**, preserving 8×8 native JPEG phase. Original LP1 09, LP1 16 and LP2 19 share their **entire luminance DQT** (checked from their unchanged JPEG coefficient readers).

## Native coefficient control and obstructing transform

[The read-only C99/libjpeg SFT](../sims/lp2_clean_lp1_insect_native_parent_grid_sft.c) accesses quantized original Y blocks directly, without any pixel re-encoding. Every complete 8×8 source block wholly inside the 690×185 insect rectangle is compared against its exact translated partner on first-release scan16: **1,870 full blocks, 119,680 original Y coefficients, all equal**. The parent-to-parent native comparator is a real 100% positive on original published JPEGs.

For a same-size unscaled image translation, the native grid requires both shifts divisible by 8. For a horizontal reflection `x_target=t−x_source`, it requires `t mod 8=7` and a vertical shift divisible by 8. The original encrypted p2 receiver fails this geometrical *necessary condition* for every direct earlier insect copy:

| Earlier LP1 parent → encrypted p2 | Exact transform from source crops | Horizontal residue | Vertical shift residue | Comparable whole original 8×8 blocks |
|---|---|---:|---:|---|
| scan09→19 | mirror `x'=2400−x`; y shift **707** | **0**, required 7 | **3**, required 0 | **None** |
| scan13→19 | same orientation, shift `(+25,+1563)` | **1**, required 0 | **3**, required 0 | **None** |
| scan16→19 | mirror `x'=2424−x`; y shift **1187** | **0**, required 7 | **3**, required 0 | **None** |

This is a failure of source-and-target **block correspondence**. It does not mean the LP2 image contains zero nonzero coefficients or no possible pixel-based channel. Subtracting native JPEG coefficients at visually aligned *but differently phased* blocks would produce compression residuals that are mathematically unrelated to a shared coefficient payload.

The separate exact 2014 Cicada logo→p55 parent is another documented pre-LP2 graphic witness, but its original **640×389** source-to-LP2 registration scale **1.838737×** fails the same native-grid preservation prerequisite. The earlier same-art LP1 moth is scaled ≈2.33× at p53/p55; the LP1 reclining figure becomes ≈1.00568× larger on LP2 p22. Their established source-matched raster comparisons cannot be substituted for a native-grid clean JPEG cover. See [logo registration](lp2-moth-pre2014-logo-source-registration.md) and [p22 source decision](lp2-p22-corpse-source-plate-decision.md).

## Cryptanalytic decision

The original exact-pixel **LP1 scan09** is a legitimate, independently documented earlier illustration source; the intact LP1 09→16 native-grid positive proves the coefficient reader's intended comparison can succeed. Yet the encrypted LP2 p2 paste destroys its direct native-grid comparability. Therefore the proposed *LP1 clean-parent subtraction as an LP2 common native coefficient payload extractor* is blocked before any key, hidden-byte, or plaintext scoring. Do **not** resample/flip/re-encode a JPEG and call the newly computed coefficients the historical parent.

A productive reopening of this route requires one **independently authentic source** already in the *same 8×8 JPEG block geometry* as an LP2 reused plate, or a source-defined pixel-domain watermark/decoding algorithm intentionally robust to the documented transforms. No such source-selected alternative is established here. The previously measured zero page-to-page differences within seven LP2 reused-art groups remain valid within their native identical grids ([#2209 source gate](lp2-all-reused-plates-original-native-dct-payload-gate.md)).

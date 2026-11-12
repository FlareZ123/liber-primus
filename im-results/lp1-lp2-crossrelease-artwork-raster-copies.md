# Source-exact LP1→LP2 illustration copies: mirrored recumbent figure and enlarged moth

**Evidence class:** original-image correspondence with reproducible pixel tests, updated 12 November 2026. **No unknown LP2 plaintext, key, decipherment operation, or destination is recovered.** The 2014 LP2 scans preserve duplicates of LP1 insect, reclining-figure and moth artwork. A subsequent original-image SIFT audit identifies the same insect on LP1 **p01 and p15**, each rotated approximately 90 degrees. This correction removes the previously claimed unique LP1 p16 two-illustration intersection. Repeated decoration alone is not a cipher instruction.

## Independent original-JPEG results

The original archive numbering is 00–16 for LP1 and 17–74 for LP2. Physical LP2 page *p* is archive *p+17*. All focal image files are pinned by SHA-256 in [the standalone SFT](../sims/lp1_lp2_illustration_raster_reuse_sft.py), which reads original JPEG pixels rather than the transcription.

| Original solved LP1 illustration | Original LP2 reuse | Source-exact transformation and independent control |
| --- | --- | --- |
| **LP1 pp14–16, archive 14.jpg–16.jpg:** identical reclining/supine figure across the bottom band (previously noted as a mirrored LP1 footer, without this full raster census) | **LP2 p22, archive 39.jpg** | Same original composition horizontally reflected, no scale required. Across **all 17 LP1 × 58 LP2 × two orientations** of the original bottom-band illustrations, the unique three leading matches are (14,39), (15,39), (16,39), each **mirrored ink IoU 0.8890067912**; the next match is **0.1796434961** without reflection. |
| **LP1 p05, archive 05.jpg:** moth in the solved Wisdom/prime-number page | **LP2 p53, archive 70.jpg**, then again **LP2 p55, 72.jpg** | One-scale geometric duplicate, **not reflected**. A fixed source-only SIFT/RANSAC registration gives **351/369** Lowe-selected inliers and horizontal/vertical scales **2.32944734/2.32604001**, with thresholded ink IoU **0.82272835**. The exact same fixed transform against p54's non-moth crop gives **0.06675287**. LP2 p53→p55 separately has original gray NCC **0.9998952150** under the known (+66,+67) translation. |
| **LP1 pp01, 09, 13, 15 and 16:** the same segmented insect, vertical on pp01/15 and horizontal on pp09/13/16 | **LP2 p2, archive 19.jpg** | Prior same-size p09/p13/p16 source pixel checks found a mirror duplicate (IoU **0.9999723909** for p09). New original image registration also finds quarter-turn copies on p01 (IoU **0.7953**) and p15 (IoU **0.9112**), both against the identical p2 insect crop. [Extended image SFT](../sims/lp1_p2_insect_extended_sft.py). |

### Corrected insect source census: two additional quarter-turned LP1 copies

The complete original-JPEG **source-artwork match is broader than the prior three-parent claim**. LP1 archive p01 and p15 both contain large vertical insect drawings whose scale/rotation maps directly to the horizontal insect on LP2 p2 (archive 19.jpg). A fixed image-only original source scan and affine regression, independent of any ciphertext or key, finds:

| Original LP1 JPEG | Orientation relative to LP2 p2 | Unique SIFT matches / RANSAC inliers | Registered p2 insect-region ink IoU |
| --- | --- | ---: | ---: |
| `01.jpg` | approximately **+90.040°**, scale 0.9713 | 43 / 40 | **0.79534** |
| `15.jpg` | approximately **+90.032°**, scale 0.9996 | 36 / 35 | **0.91123** |
| `13.jpg` | same orientation, scale 0.9997, registration control | 41 / 39 | **0.99868** |
| `10.jpg` | wrong-source control under p01 transform | fixed transform only | **0.07173** |

The p01 ink crop overlaps decorative/text boundaries, explaining its lower full-crop IoU; both new matches retain more than 35 geometrically consistent feature points with an unmistakable quarter-turn. The fixed LP2 p2 insect crop is x=876:1566, y=2642:2827, and the script hashes every original image and registers in quarter resolution using an art-connected-component SIFT mask; it then scores original-resolution ink without knowing any plaintext. [Run the original-byte SFT](../sims/lp1_p2_insect_extended_sft.py).

The previously established **exact horizontal source copies** are unchanged:

| Original archive JPEG | Original source crop position | Relation to LP1 p09 reference |
| --- | --- | --- |
| `09.jpg`, solved LP1 p09 | (835,1935), 690×185 | identity |
| `13.jpg`, solved LP1 p13 | (851,1079), 690×185 | horizontal reflection; black-ink IoU 1.0000 |
| `16.jpg`, solved LP1 p16 | (859,1455), 690×185 | identity; exact grayscale pixel equality |
| `19.jpg`, unsolved LP2 p2 | (876,2642), 690×185 | horizontal reflection; black-ink IoU 0.9999724 |

LP1 p01 and p15 are additional source parents under quarter-turn registration; their larger vertical placements were excluded by the previous fixed horizontal 690×185 crop. This makes the copied bug a recurrent authorial illustration element, with at least five different solved-LP1 source page contexts.

### Two-illustration page intersection is **{15,16}**, not uniquely p16

The full currently known source sets are now:

- The copied LP2 p2 insect occurs on solved LP1 **pp{1,9,13,15,16}**, accounting for 90° rotations.
- The mirrored LP2 p22 reclining footer occurs on solved LP1 **pp{14,15,16}**.

The intersection is **{15,16}**. Both are legitimate cross-art image-source candidates; **the artwork itself no longer uniquely identifies p16 or its 5×5/3301 magic square**. In particular, p15 carries both copied motifs. The previously proposed p16 page selection was conditional on a *same-orientation* insect inventory and should not be cited as an original-source proof.

The prior [linked-chapter 729-rune GP29 common-key exclusion](lp1-p16-doubleart-chapter-common-bijection-gate.md) and [whole-book direct 5×5 GP29 pad/Hill negatives](openpuff-magic-square-remaining-gate.md) retain their exact finite validity as **conditional tests of p16-derived mechanisms**. They do not distinguish p15 from p16 or select a new key. Future cryptanalysis would require an independent visual or signed-text cue that fixes one of these two pages and an operation before the unknown ciphertext is scored.

### How the tests avoid incidental visual resemblance

For the reclining figure, the frozen crop is every page's original bottom band y=3150…3599, downsampled to 600×113 pixels with OpenCV INTER_AREA and thresholded at gray intensity below 160. Both unreflected and horizontally reflected matches are compared by ink intersection-over-union, across **1,972** original LP1-to-LP2 image/orientation combinations. The LP1 pp14–16 bottom bands are **exactly pixel-identical**, including JPEG-decoded gray values. This establishes a high-confidence pixel-level correspondence. The existence of the p22 mirrored-LP1 footer was previously noted in [the independent p22 illustration source gate](lp2-opening-stave-second-marker-gate.md); the exact three-source identity and exhaustive orientation census are the added measurements.

For the moth, a fixed art-only LP1 crop (original pixels y=1450:1900, x=750:1650) and LP2 p53 crop (y=2500:3250, x=450:1950) exclude runic text. OpenCV SIFT features, a 0.75 nearest-neighbor ratio gate, and a 3-pixel RANSAC homography are computed without plaintext or a cipher score. Warping the binary source ink with the recovered homography and comparing to original p53 ink gives the correspondence above. The wrong-page p54 art region is the fixed negative control. The independent within-LP2 p53/p55 moth-copy test was already in [lp2_terminal_moth_reuse_sft.py](../sims/lp2_terminal_moth_reuse_sft.py).

The source image relationships are stronger than visual similarity. They establish literal artwork reproduction in the authored book, with deliberately varied position, scale and horizontal reflection.

## Human solve-path relevance and limitation

The corresponding **solved LP1 pages** are conspicuous:

- **LP1 p05** explicitly teaches that *the primes*, *the totient function* and encryption are sacred, beside the 2014 source magic-square material. The same moth appears on LP2 p53 and p55, which bracket a final chapter transition and lie after the pp49–51 numeric grid. That makes the art a source-visible cross-reference **candidate**, though it does not tell a human to use a particular square cell, prime, clock or cipher on these two unknown pages.
- **LP1 pp14–16** discuss the **I as the voice of the circumference**, discovery inside oneself, and present the original square. The recumbent figure appears mirrored on **LP2 p22**, the terminal page of the visible **p15–22** chapter opened by the Fibonacci-prime spiral. A source-directed operation relating circumference and chapter text is conceivable, yet no inverse, start point or independent key is fixed by this artwork alone.
- **LP1 pp01, 09, 13, 15 and 16** present the same segmented insect, including rotated copies on pp01 and 15. It therefore cannot uniquely select p09's “DO FOUR UNREASONABLE THINGS EACH DAY,” p16's magic square, or one shared LP1 cipher operation. The independent [literal p2 glyph-reflection test, Issue #468](https://github.com/FlareZ123/liber-primus/issues/468), closed with nonlinguistic output.

**Decision:** cross-release art reuse is a **recurring original-source design feature**, and the new quarter-turn copies independently refute unique p16 identification. The full intersection has **two** potential LP1 source pages. The art provides no selected universal rune inverse, source key, or independently deciphered LP2 plaintext. A credible next step requires an additional player-visible cue selecting *which* cipher operation is carried across, then authentic plaintext under a frozen key with a withheld test. Existing failed direct GP29-addition, generic Vigenère, plain reversal and speculative square traversals should not be rerun on these pages absent such a cue.

## Reproduction and provenance

[SFT: lp1_lp2_illustration_raster_reuse_sft.py](../sims/lp1_lp2_illustration_raster_reuse_sft.py) and [additional quarter-turn SFT](../sims/lp1_p2_insect_extended_sft.py) use Python 3, OpenCV and NumPy. The source inputs are the original 75 repository JPEGs under `resources/liber-primus/`; the eight focal image SHA-256 values are asserted. The full source-only test, including all four independently preserved insect locations and the negative image controls, passed locally on the maintainer-provided ZIP on 12 November 2026. It prints image-pair identities, registration statistics and negative-control scores in structured JSON. The image content was not altered. Prior p22 mirror mention: [original p22 illustration gate](lp2-opening-stave-second-marker-gate.md). Prior established p2 mirror observation: [Issue #450](https://github.com/FlareZ123/liber-primus/issues/450). Prior established p53→p55 intra-book moth identity: [source SFT](../sims/lp2_terminal_moth_reuse_sft.py).

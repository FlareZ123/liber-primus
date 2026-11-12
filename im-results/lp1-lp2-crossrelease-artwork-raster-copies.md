# Source-exact LP1→LP2 illustration copies: mirrored recumbent figure and enlarged moth

**Evidence class:** established source-image correspondence with reproducible pixel tests. **No unknown LP2 plaintext, key, decipherment operation, or destination is recovered.** This extends the previously documented LP2 p22 mirrored-LP1 footer and LP2 p2 mirrored-insect observations with a source-exact corpus-wide registration and an enlarged LP1 p05 moth connection to LP2 pp53/55. Repeated decoration alone is not a cipher instruction.

## Independent original-JPEG results

The original archive numbering is 00–16 for LP1 and 17–74 for LP2. Physical LP2 page *p* is archive *p+17*. All focal image files are pinned by SHA-256 in [the standalone SFT](../sims/lp1_lp2_illustration_raster_reuse_sft.py), which reads original JPEG pixels rather than the transcription.

| Original solved LP1 illustration | Original LP2 reuse | Source-exact transformation and independent control |
| --- | --- | --- |
| **LP1 pp14–16, archive 14.jpg–16.jpg:** identical reclining/supine figure across the bottom band (previously noted as a mirrored LP1 footer, without this full raster census) | **LP2 p22, archive 39.jpg** | Same original composition horizontally reflected, no scale required. Across **all 17 LP1 × 58 LP2 × two orientations** of the original bottom-band illustrations, the unique three leading matches are (14,39), (15,39), (16,39), each **mirrored ink IoU 0.8890067912**; the next match is **0.1796434961** without reflection. |
| **LP1 p05, archive 05.jpg:** moth in the solved Wisdom/prime-number page | **LP2 p53, archive 70.jpg**, then again **LP2 p55, 72.jpg** | One-scale geometric duplicate, **not reflected**. A fixed source-only SIFT/RANSAC registration gives **351/369** Lowe-selected inliers and horizontal/vertical scales **2.32944734/2.32604001**, with thresholded ink IoU **0.82272835**. The exact same fixed transform against p54's non-moth crop gives **0.06675287**. LP2 p53→p55 separately has original gray NCC **0.9998952150** under the known (+66,+67) translation. |
| **LP1 pp09, 13 and 16, archive 09.jpg/13.jpg/16.jpg:** the same segmented insect (exact same raster after translations and one reflection) | **LP2 p2, archive 19.jpg** | Previously established horizontally reflected copy at thresholded IoU **0.9999723909** in [Director Issue #450](https://github.com/FlareZ123/liber-primus/issues/450), with script [lp2_p2_lp1_p9_mirror_sft.py](../sims/lp2_p2_lp1_p9_mirror_sft.py). Listed for context, not claimed as a new observation here. |

### Important source-attribution correction: the LP2 p2 insect has multiple solved-LP1 parents

An additional original-JPEG crop census demonstrates that **the identical 690×185 insect art appears on at least three separately numbered LP1 solved pages**, before being mirrored onto LP2 p2:

| Original archive JPEG | Position in original 2400×3600 raster | Relative orientation to LP1 p09 | Black-ink IoU against p09 crop | Grayscale MAE |
| --- | --- | --- | ---: | ---: |
| **09.jpg**, LP1 p09, solved “DO FOUR UNREASONABLE THINGS EACH DAY” | (835,1935) | source | 1.000000000 | 0 |
| **13.jpg**, LP1 p13, solved divinity / “PROGRAM YOUR MIND” material | **(851,1079)** | mirrored | **1.000000000** | 0.0308578 |
| **16.jpg**, LP1 p16, magic-square illustration | **(859,1455)** | same | **1.000000000** | 0, complete grayscale pixel equality |
| **19.jpg**, LP2 physical p2, unknown ciphertext | **(876,2642)** | mirrored | **0.999972391** | 0.8510145 |

The originally proposed LP1 **p09→LP2 p2** art match is correct, yet p09 is **not a unique reference to the source drawing**. At least LP1 p13 and p16 present exactly the same art, while selecting rather different instructions/objects if read as cross-reference pointers. No visible mark singles out which of those solved LP1 pages an LP2 p2 solver should transfer. Consequently **the art alone does not select “DO FOUR UNREASONABLE THINGS” as a privileged p2 cipher operation**. This source ambiguity is independent of #468's negative full-page mirrored-glyph decoding test.

The exact pixel windows are frozen in the same [source-only SFT](../sims/lp1_lp2_illustration_raster_reuse_sft.py), which asserts all original file SHA-256 values. Original p09, p13, p16, and p19 crop forms are all fixed 690×185 pixels with original grayscale values; ink tests use intensity below 100. The original p13 reflected crop and p16 unreflected crop have **perfect black-pixel identity** with p09, after the printed layout's translation. The minor p13 grayscale nonidentity is limited to pixel intensity. This is direct source evidence that the LP1 insect artwork is reused internally before appearing in LP2.

### A two-illustration, unique original-page intersection: LP1 p16

The **two different replicated pictures** establish source sets which a contemporary solver could independently locate without a rune-decoding guess:

- LP2 p2 insect → solved LP1 pages **{9,13,16}**, from exact repeated same-size insect artwork;
- LP2 p22 reclining footer → solved LP1 pages **{14,15,16}**, from identical full-width reclining figures on these three pages.

Their intersection is **{16}**. LP1 p16 prints the source-authentic 5×5/3301 numerical square (centre **809**), adjacent to its insect; its reclining figure occupies the same original page's bottom. This uniquely recovers **a candidate reference page**, without deciding whether the authors intended the cross-page intersection or reused common artwork for visual continuity. It is a stronger route for a human to choose LP1 p16 than selecting an arbitrary single copied insect.

A [separately executed, CI-passed linked-chapter key-independent gate](lp1-p16-doubleart-chapter-common-bijection-gate.md) now compares the illustrated pp0–2 and pp15–22 source chapters. It rules against their sharing one position-aligned GP29 bijective chapter key, including the additive-pad model with arbitrary separate chapter Caesar constants, under English-GP controls (20 original equalities / 729 positions vs 43.75 native mean; best shifted difference 34 vs native mean 45.35). No recovered plaintext or cipher-selection proof follows.

A computational consequence is intentionally restricted: **the direct use of the exact historical 5×5/3301 square as an additive GP29 pad or a five-dimensional Hill matrix has already been screened against all 12,956 unknown LP2 runes**, with no plaintext ([existing global square gate](openpuff-magic-square-remaining-gate.md)). The original artwork does not specify how to use the square differently. Thus the intersection is a **real, source-derived candidate address**, currently lacking an untested, independently selected cipher inverse. Do not rerun the old square operations on p2 or p22 or infer plaintext from the mere intersection.

### How the tests avoid incidental visual resemblance

For the reclining figure, the frozen crop is every page's original bottom band y=3150…3599, downsampled to 600×113 pixels with OpenCV INTER_AREA and thresholded at gray intensity below 160. Both unreflected and horizontally reflected matches are compared by ink intersection-over-union, across **1,972** original LP1-to-LP2 image/orientation combinations. The LP1 pp14–16 bottom bands are **exactly pixel-identical**, including JPEG-decoded gray values. This establishes a high-confidence pixel-level correspondence. The existence of the p22 mirrored-LP1 footer was previously noted in [the independent p22 illustration source gate](lp2-opening-stave-second-marker-gate.md); the exact three-source identity and exhaustive orientation census are the added measurements.

For the moth, a fixed art-only LP1 crop (original pixels y=1450:1900, x=750:1650) and LP2 p53 crop (y=2500:3250, x=450:1950) exclude runic text. OpenCV SIFT features, a 0.75 nearest-neighbor ratio gate, and a 3-pixel RANSAC homography are computed without plaintext or a cipher score. Warping the binary source ink with the recovered homography and comparing to original p53 ink gives the correspondence above. The wrong-page p54 art region is the fixed negative control. The independent within-LP2 p53/p55 moth-copy test was already in [lp2_terminal_moth_reuse_sft.py](../sims/lp2_terminal_moth_reuse_sft.py).

The source image relationships are stronger than visual similarity. They establish literal artwork reproduction in the authored book, with deliberately varied position, scale and horizontal reflection.

## Human solve-path relevance and limitation

The corresponding **solved LP1 pages** are conspicuous:

- **LP1 p05** explicitly teaches that *the primes*, *the totient function* and encryption are sacred, beside the 2014 source magic-square material. The same moth appears on LP2 p53 and p55, which bracket a final chapter transition and lie after the pp49–51 numeric grid. That makes the art a source-visible cross-reference **candidate**, though it does not tell a human to use a particular square cell, prime, clock or cipher on these two unknown pages.
- **LP1 pp14–16** discuss the **I as the voice of the circumference**, discovery inside oneself, and present the original square. The recumbent figure appears mirrored on **LP2 p22**, the terminal page of the visible **p15–22** chapter opened by the Fibonacci-prime spiral. A source-directed operation relating circumference and chapter text is conceivable, yet no inverse, start point or independent key is fixed by this artwork alone.
- **LP1 pp09, 13 and 16** contain the exact same segmented insect copied onto **LP2 p2**. Because those solved LP1 pages deliver different instructions, the image has **three independent source locations** and cannot uniquely select p09's “DO FOUR UNREASONABLE THINGS EACH DAY.” The independent [literal p2 glyph-reflection test, Issue #468](https://github.com/FlareZ123/liber-primus/issues/468), has meanwhile closed with nonlinguistic output, further limiting that proposed operation.

**Decision:** cross-release art reuse is a **recurring and newly quantifiable original-source design feature**. Treat it as a structured pointer worth considering in a human solution model. Do not infer that reflection itself is a universal rune inverse, or that a solved LP1 cipher key must transfer, solely from decoration. A credible next step requires an additional player-visible cue selecting *which* cipher operation is carried across, then authentic plaintext under a frozen key with a withheld test. Existing failed direct GP29-addition, generic Vigenère, plain reversal and speculative square traversals should not be rerun on these pages absent such a cue.

## Reproduction and provenance

[SFT: lp1_lp2_illustration_raster_reuse_sft.py](../sims/lp1_lp2_illustration_raster_reuse_sft.py) uses Python 3, OpenCV and NumPy. The source inputs are the original 75 repository JPEGs under `resources/liber-primus/`; the eight focal image SHA-256 values are asserted. The full source-only test, including all four independently preserved insect locations and the negative image controls, passed locally on the maintainer-provided ZIP on 12 November 2026. It prints image-pair identities, registration statistics and negative-control scores in structured JSON. The image content was not altered. Prior p22 mirror mention: [original p22 illustration gate](lp2-opening-stave-second-marker-gate.md). Prior established p2 mirror observation: [Issue #450](https://github.com/FlareZ123/liber-primus/issues/450). Prior established p53→p55 intra-book moth identity: [source SFT](../sims/lp2_terminal_moth_reuse_sft.py).

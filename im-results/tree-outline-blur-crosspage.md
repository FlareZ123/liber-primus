# The blurred page-32 and outlined page-55 trees share a source silhouette

**Evidence: original-image geometric correspondence, 10 November 2026.** The full manuscript still has **no recovered unknown LP2 plaintext or key**. This is an image-side relationship for investigating visual continuity across sections, not a decipherment, cryptographic key, statistically pre-specified clue, or evidence of source instructions.

## Source and method

The archive's original **49.jpg (physical LP2 page 32)** shows an intentionally blurred black tree. Original **72.jpg (physical LP2 page 55)** shows a pale, finely delineated tree over a moth. The corresponding source files are [49.jpg](../resources/liber-primus/49.jpg) and [72.jpg](../resources/liber-primus/72.jpg).

The p55 tree is transformed using **only image operations**, with no ciphertext fitting: extract grayscale, threshold intensity below 240 inside x=[650,1760), y=[1410,2480), retain the largest 8-connected component and fill its single external contour. The p32 source crop is x=[650,1760), y=[2060,3130), then source darkness is `max(0,252-gray)`. Downsample both crops to 30%, apply Gaussian smoothing with sigma=6 low-resolution pixels, and optimize four affine translation/scale parameters against Pearson image correlation (fixed SciPy differential-evolution seed 13 and declared bounds). Pearson is evaluated on an interior crop excluding 20–30 edge pixels. The original p32 blurred tree therefore appears compatible with the **filled silhouette** of the p55 outlined tree under a modest position/scale adjustment.

| Measurement | Observed |
| --- | ---: |
| Unaligned source-image correlation | **0.81454** |
| Affine-aligned source-image correlation | **0.87337** |
| Same search with horizontal reflection of p55 tree | **0.71290** |
| Aligned source-image foreground intersection-over-union (p32 gray<220) | **0.69895** |
| Fitted scales x,y | **0.9561, 0.9779** |
| Fitted shifts in original pixels x,y | **+9.18, +33.83** |
| p55 thresholded outline / filled-silhouette pixel counts | **190,118 / 311,357** |

The identity correlation is already high before optimization; reflected orientation is a **descriptive negative control**, not a formal significance test against all tree art. The two images were selected by visible similarity and the crop, thresholds, fill and Gaussian comparison are analyst-selected. Accordingly, none of the numerical scores should be assigned an independent p-value or used alone to assert Cicada's cryptographic intent.

Exact scans hashed SHA-256:

- `49.jpg`: `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`
- `72.jpg`: `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`

Run [the self-contained geometry reproducer](../sims/tree_outline_blur_registration.py) with Python, NumPy, SciPy and OpenCV; it loads the original images from `resources/liber-primus/` and reports the metrics. This source comparison has been executed locally on the original attached JPEG bytes. No new CI workflow was created.

## Independent historical context: the signed 2016 tree image

A [contemporaneous January 2016 thread](https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here) explicitly compared the background **oak tree** in 2016 image `4gq25.jpg` with Liber Primus combined archive **49.jpg**. The prior public identification of that relationship must not be presented as a discovery made in this study. The [historical signed-message archive](https://github.com/scream314/cicada3301/blob/master/2016.md) independently documents `4gq25.jpg` as carrying an OutGuess-extracted and PGP-verified message including “Liber Primus is the way” and directions to treat its words, meanings and numbers as a route. The source-image comparison here adds the previously unreported **p55 detailed tree silhouette** to this visual lineage. Neither the text nor original illustration supplies a specified mathematical function mapping tree branches to rune plaintext.

## Specific bookend-phrase OutGuess test

The original ciphertext pair `ᛞᛄᚢ ᛒᛖᛁ` is duplicated on p27 and p55. Since historical Cicada used OutGuess and these pages have source-image connections, a finite source-fixed extraction test used six literal and transliterated forms of that pair as candidate passwords across **all 58** original LP2 JPEGs: `DJUBEI`, `djubei`, `DJU-BEI`, `dju-bei`, `DJU BEI`, and `ᛞᛄᚢᛒᛖᛁ`. The existing pinned extractor passed authentic LP1 and synthetic embedded-message controls.

**Outcome:** **348** new password/image combinations produced **zero** recognizable OpenPGP, gzip, ZIP, PNG or printable-text payloads. **213** had internally consistent but unauthenticated OutGuess length/seed headers, illustrating that such headers are unreliable. These exact six passwords have no supported LP2 extraction under the tested standard OutGuess model. Reproducible [completed CI run 42801260989](https://github.com/FlareZ123/liber-primus/actions/runs/42801260989) used [branch-only key variants](https://github.com/FlareZ123/liber-primus/blob/f2a63632e90cb5b911fe21f1b169db1e68155a35/sims/outguess_lp2_keyed_probe.cjs).

## Cryptanalytic meaning and next gate

The source correspondence strengthens a **visual cross-page linkage** between the tree terminating the p27–32 wing-and-tree sequence and the tree near the final unsolved p55 text. The adjacent repeated ciphertext pair `ᛞᛄᚢ ᛒᛖᛁ` occurs on p27 and again as the final unsolved pair on p55; this independent observed recurrence is documented in [the existing bookend-phrase study](lp2-repeated-wordpair-structure.md). It could motivate a constrained test of a deliberate chapter bookend, but the previously measured physical-page-preserving recurrence null has p≈0.025. The visual and textual observations are both postselected and must not be treated as mutually independent confirmations.

A useful next step would need an **exact source-derived rule**: for example a specific branch traversal that emits a 29-symbol permutation or a key, predicts a previously unfitted LP2 interval, and re-encrypts it. Neither the blurred image nor the outlined tree currently supplies such a rule. No symbolic branch reading or arbitrary shape interpretation is promoted here.

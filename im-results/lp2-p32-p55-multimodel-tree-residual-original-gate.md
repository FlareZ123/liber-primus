# The p32/p55 tree's high-frequency residual contains branch-bound fragments, not a recovered instruction

**23 November 2026, Agent14; Director [#2418](https://github.com/FlareZ123/liber-primus/issues/2418).** Original-source, fixed-image residual decision. The known p32 (49.jpg) and p55 (72.jpg) botanical relationship remains strong; the added-ink hypothesis has **no reproducible independently readable rune or instruction in the isolated, high-frequency mark class tested here**. **No unknown LP2 plaintext, image key or final puzzle destination recovered.**

## Human-visible clue and rival

A capable solver can see one dark, blurred tree below physical LP2 p32 and a sharper, pale outlined tree on terminal p55. The prior [original tree correspondence report](lp2-p32-p55-blurred-tree-correspondence.md) registers their branches with a p55 filled-outline model and predicts a spatially withheld crown from a lower-trunk-only fit. Candidate hypothesis: deliberately added ink or a hidden sign survives the change in blur and shade and is recoverable as a **localized registration residual**. Rival: the two tree drawings are related artwork with outline filling, blur, halftoning and JPEG edge artifacts, and their image subtraction inevitably leaves branch-local differences. The independently attested 2013 signed FOREST/TREES sentence provides no actual branch-reading or differencing opcode.

## Freeze original source and two different physical models

Original 2400×3600 JPEG images, SHA-256 pinned by the reproducer:

- Target p32, original archive **49.jpg**, crop `(650,2070,1810,3230)`.
- Sharp comparator p55, original archive **72.jpg**, crop `(625,1430,1735,2510)`.
- Independent different-tree control p57, original archive **74.jpg**, crop `(650,1960,1750,3200)`.

Convert each selected source rectangle to positive-ink grayscale, resizing to exactly **360×360** using OpenCV INTER_AREA. Both models are defined **without searching for rune strings or varying the source crop**:

1. **Model A:** use the already published trunk-selected source hypothesis, threshold ink at15, binary hole-fill, blur σ9, isotropic scale0.90, translation (−12,+1) in the target coordinates.
2. **Model B:** a distinct morphological model, threshold at15, elliptical dilation with 13×13 footprint instead of fill, blur σ9, scale0.88. Optimize translation only against p32's actual lower-trunk rows175–339 within ±45pixels. Best translation (−11,−1), trunk correlation≈0.83803; crown correlation≈0.83772. Both have objective lower-trunk-only registration; the original source's upper-crown rows40–174 are disjoint from those fitted areas.

A different genuine p57 tree tested with model-A fill/blur/scale and separately optimized against the same trunk lands at (−29,+45), trunk correlation≈0.84960 but upper-crown correlation **0.57235**. For comparison, source p55 model A crown correlation **0.89860**. The botanical correspondence is specific; comparable trunks alone do not recover the same crown.

For each model, fit **only on the lower trunk** the affine grayscale gain/bias to the real target. Subtract predictions from p32; remove low-frequency spatial mismatch by subtracting Gaussian σ8 from the respective residuals. Count a bright source-only pixel only when **both different model residuals exceed +20 intensity**, inside **unchanged crown rows40–174, columns25–334**. Label 8-connected components and require area≥4. This is a deterministic **bounded high-frequency positive-ink residual screen**, not all possible visible or hidden differences.

## Actual original-source residual

The exact source yields only **four stable area≥4 components**:

| Source cropped 360px position (x,y,w,h) | Area | Approximate interpretation |
| --- | ---: | --- |
| (161,164,9,11) | 77 | Small residual at the lower crown/tree body |
| (149,125,6,6) | 21 | Fragment amid branches |
| (171,169,1,6) | 6 | Vertical one-pixel line at the lower crown |
| (220,164,1,4) | 4 | Four-pixel line near the crown base |

They are small discontinuous components lying in the tree's image-comparison field. They have no source-selected ordered rune skeleton, code, coordinate instruction or native deciphering action. Interpreting the one-pixel strips as letters would require postselected glyph completion. This supports ordinary rendering mismatch for this specifically measured feature class; it cannot certify the source image contains no other kinds of hidden mark.

## Original-JPEG-quality controlled positive

Draw one artificial, obvious three-stroke **F-shaped** glyph onto an isolated white region of a copied original p32 2400×3600 RGB raster, mapping registered coordinates x300..316 and y44..73 into the original source crop. Encode the **whole image back into JPEG using the original 49.jpg quantization tables**, then run the *identical* original crop, resize, dual-model residual and connected-component code, with model parameters unchanged.

The planted JPEG generates an additional **167-pixel stable component** at x299,y42,w18,h32; the unchanged original image has **zero** stable positive residual pixels in that same nearby x285..324,y40..79 patch. The original four components remain. This positive establishes that the detector can recover a high-contrast, freestanding added sign after original-quantization JPEG recompression. It does **not** establish power for lower-contrast markings near existing branches, exact author prepress conditions, font-level micropatterns, or a different intentionally encoded signal.

**Exact reproducible code:** [pinned original-source read-only Python SFT](../sims/lp2_p32_p55_tree_residual_source_sft.py), using Python3, Pillow, NumPy, OpenCV and SciPy. Input is the repository's original immutable JPEGs. The script asserts exact original hashes, two crown predictions, all four component areas, planted JPEG component geometry/area, and unchanged-region positive response. It makes no files in the repository.

## Decision for #2418

The hypothesis of **a clearly freestanding high-contrast rune/command visible in the high-frequency two-model p32→p55 registered residual** does not survive this source-locked original-image test; the artifact supplies no recoverable opcode for p55's 76-ciphertext-rune passage. Retire this tested scale class. Retain the independently strong p32↔p55 tree reuse and do not infer a general proof against all image steganography. For actual cryptanalytic advancement a new visible mark must first identify its own numeric/rune reading and a source-selected reversible untouched-LP2 ciphertext consumer, before further image filtering.

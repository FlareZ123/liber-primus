# Blurred p32 tree and clear p55 tree: original-raster correspondence gate

**Agent9, 16 November 2026.** The previously uninterpreted blurred tree below LP2 p32 (original scan `49.jpg`) aligns conspicuously with the pale detailed tree on terminal p55 (scan `72.jpg`) under an **upright** morphological blur/scale registration. The correspondence is unique among 75 manuscript scans under a source-conditioned whole-page search. This is an independently testable pictorial association, **not an established identical-source plate**, a source-authored reading path, an encryption key, or decrypted plaintext.

## Original images and source-locked experiment

- Source files: original 2400×3600 JPEG `49.jpg` SHA-256 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72` and `72.jpg` SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`.
- Independently cropped visually obvious tree fields: p32 original coordinates rows 2070–3229, columns 650–1809; p55 rows 1430–2509, columns 625–1734. Resize each crop to 360×360 pixels and invert intensity to positive ink.
- For the detailed p55 image, fit a tiny bounded source-image degradation grid: scale 0.84/0.88/0.92; elliptical dilation radius 4/6/9 pixels to compensate for p32's thick dark silhouette; Gaussian smoothing σ=6/9/12/15; and free 2D translation within the p32 crop. Optimize normalized cross-correlation only; use no ciphertext, rune/transliteration scores or page-specific keys.
- Optimize the same 36 transformations for an independent mirrored-tree orientation as an internal wrong-orientation control. This is a **descriptive, postselected image fit** rather than a population-calibrated significance test.

| P55 source orientation | Best image correlation | Best scale / dilation / Gaussian | Best translation in 360px crop |
| --- | ---: | --- | --- |
| Upright, unchanged | **0.790046** | 0.88 / radius6 / σ9 | (+10,+24) |
| Horizontal mirror | **0.628365** | 0.84 / radius6 / σ15 | (+0,+51) |

The upright alignment is **0.161681** higher after permitting the mirror its own optimal parameters. Using the single upright best fit, cross-correlation over the full target crop (including white background) is ~0.81. Many large branches and the trunk appear in corresponding coarse locations after blur, but p32 is a dark thick silhouette while p55 is a pale outline; no direct shared-pixel proof can survive the different rendering. Similar upright botanical silhouettes can correlate, and these results by themselves do not provide a probability of shared origin.

## Complete original-scan atlas discrimination

A second controlled test fixes a p55 tree degradation after the p32 fit, then uses it as a single 246×246 template against **all 75 original 2400×3600 JPEG scans**, scanned in full after a fixed 600×900 downsample. The p55 template uses thresholded ink (above 0.14), elliptical closing radius10 at atlas scale and Gaussian blur σ7. It scans *every location* in every page; normalized-correlation windows with near-zero source variance are excluded to prevent blank-page false scores. No rune values, words, page assignments or unknown plaintext are examined during this visual atlas comparison.

| Original combined-archive scan | LP2 relation | Best normalized coefficient |
| --- | --- | ---: |
| **49.jpg** | **blurred p32 tree** | **0.833989** |
| 72.jpg | sharp p55 source drawing itself | 0.493223 |
| 39.jpg | unrelated LP2 p22 graphics | 0.472907 |
| 31.jpg | other LP2 page | 0.365327 |
| 70.jpg | LP2 p53 artwork | 0.313328 |

**Robustness without shape fitting:** If the 246×246 p55 tree is merely Gaussian-blurred (σ7), with **no pixel threshold, dilation, or closing**, and searched over the identical full 75-image atlas, p32 remains the strongest match at **0.705856**, ahead of the p55 source page at **0.566388** and all 73 other pages (next unrelated score 0.480762). The target is localized at (176,543). This less elaborate, unfitted morphology corroborates the source-image relationship, while retaining the previously selected crop and scale.

**Result:** the intended target p32 image is the highest of all 75, with a **0.340766** coefficient gap from the runner-up, and is found at downsampled raster location (175,545), exactly its visibly printed tree region. This strengthens the claim of a specific visual relation beyond a generic upright-tree resemblance. Because the degradation/filter parameters were chosen after examining p32, the atlas ranking is *conditional* evidence, not a discovery-wide false-positive rate, and does not prove exact shared drawing provenance. The sharp p55 art has additional linework and a thin hollow trunk absent in p32's heavily blurred black silhouette.

## Source-outline-fill model and independent crown holdout (Agent8, 16 November 2026)

A distinct physical explanation of the two renderings is **filling enclosed contours in the thin-line p55 tree, then scaling and defocusing that silhouette**. Instead of selecting the transformation by matching the entire tree, a new test fits **only the lower trunk** in the original p32 crop and predicts the spatially disjoint upper branches. Crops are fixed original-image rectangles: p32 (650,2070,1810,3230) on image 49; p55 (625,1430,1735,2510) on image 72, each downsampled to 360×360. The trunk rows are 175–339 and the untouched crown rows are 40–174.

Each input undergoes the same 225 candidate descriptions: ink thresholds 15/25/35/45/55; raw outline, elliptical dilation radius 6, or binary **enclosed-hole fill**; Gaussian sigma 5/9/13; isotropic scale 0.80/0.85/0.90/0.95/1.0. Search translation ±45 pixels, maximizing Pearson/template correlation **only on the trunk rows**. Read out crown correlation at the trunk-selected translation and parameters without a second fit. Apply the *identical search* to horizontally mirrored p55, the independent p57 central plant and the earlier p8 margin sapling.

| Original model fitted to p32 trunk | Trunk correlation, trained | Upper-branch correlation, untouched holdout | Full-crop correlation under trunk fit |
| --- | ---: | ---: | ---: |
| **p55 upright outline, filled** | **0.914336** | **0.898599** | **0.893481** |
| p55 horizontally mirrored | 0.729074 | 0.733040 | 0.701847 |
| p57 independent sapling | 0.939195 | 0.583621 | 0.773941 |
| p8 marginal sapling | 0.490337 | 0.275500 | 0.281431 |

The upright p55 fit chooses (threshold15, binary hole-fill, sigma9, scale0.9, translation(-12,+1)). Notably, **p57 matches the trunk even better** after its own optimization but predicts a substantially worse upper crown, controlling for generic upright tree silhouettes. The 0.899 p55 held-region correlation is an independent spatial branch-shape correspondence *conditional on choosing this tree-pair family*. Filling enclosed outlines is physically interpretable and improves the earlier pure-dilation whole-image score (approximately 0.79–0.81). Residual inspection still shows broad mismatched branch details; this is neither an exact shared-art-source proof nor an authenticated author instruction, key or plaintext.

**Research fork:** treat p32/p55 as a substantially strengthened **specific candidate art-plate relationship**. Cryptanalytic advancement requires an original-source instruction that **consumes the relationship** to select a rune order, key or operation, plus an untouched ciphertext prediction. Image correlation alone is insufficient; additional registration parameter searches are low value.

[Single-file, original SHA-gated trunk/crown reproducer](../sims/lp2_p32_p55_outline_fill_trunk_holdout_sft.py). Tested on the four unmodified original JPEGs on 16 November 2026.

## Cryptanalytic decision

The orientation-specific full-artifact match supplies a concrete candidate human visual route: an observably blurred, earlier manuscript tree points toward a later sharper tree in an art-rich terminal sequence. **Its strongest unsupported premise** is that Cicada intended image identity/clarification to select a text transformation, rather than repeating a general tree motif; no artist-provided matching plate/branch index, unique original-p32-to-p55 rune correspondence, alphabet change, word order, key or decoding operation has been located. This does not revive the already failed p32 11×11 center-to-word modulo19 route (#1237), nor the p55 independent decoder gate (#41).

Useful next action: independently establish whether the drawings share *branch-junction topology* using features surviving p32 blur, or find an exact source artwork/caption showing one is a filtered copy. **Only if** the source gives a uniquely selected order or key should a blinded ciphertext inverse be attempted. Avoid fitting paths through p32 or p55 based on linguistic fragments.

[Original-image, SHA-gated, read-only reproducer](../sims/lp2_p32_p55_tree_blur_registration_sft.py). Related original p32 tree negative (different from the signed 2016 oak) and failed five-peel interpreter: [closed #1237](https://github.com/FlareZ123/liber-primus/issues/1237). Overall established research remains in [results/README.md](../results/README.md); this image association remains provisional and belongs only here.

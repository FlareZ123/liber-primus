# Physical p55 faint tree and signed 2016 oak: original-image registration gate

**Result:** no reliable direct p55↔2016 SIFT registration in the 13 November test. [27 November common-stock correction](lp2-tree-common-stock-source-reopening.md) withdraws the distinct-source inference: recent independent common-candidate registrations and exact stock-file identity support reopening the shared-source hypothesis. No decoder follows.

## Frozen original bytes and method

- Original p55: `resources/liber-primus/72.jpg`, 2400×3600, SHA256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`.
- Signed 2016 carrier: `resources/historical/cicada2016-4gq25.jpg`, 563×569, SHA256 `a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe`.
- Distinct marginal source tree: physical p8 `resources/liber-primus/25.jpg`, SHA256 `6b1026dfdfb447a5a76819883fe576254e8a47fdf1e97ecf1825166833bc6f00`.
- Fixed p55 faint tree crop: `x=540..1849,y=1370..2559`; 2016 oak crop `x=80..484,y=85..514`; p8 branch `x=0..529,y=650..2949`.
- The p55 and p8 foregrounds are grayscale inverted and contrast-normalized; the extremely dark 2016 image uses grayscale clipped at intensity 80 and CLAHE. A raw-2016 input is tested independently.
- SIFT descriptors, Lowe 0.70 nearest-neighbor ratio, projective RANSAC tolerance five pixels. No geometric transformation is fitted to plaintext, and all original crop coordinates are fixed.

## Original-input outcome

| Comparison | Ratio-passing matches | Projective RANSAC inliers |
| --- | ---: | ---: |
| p55 faint tree against its own affine-rotated/scaled copy (positive) | 1,314 | **1,273** |
| p55 faint tree vs p8 marginal branch (negative) | 9 | **0** |
| p55 faint tree vs contrast-enhanced 2016 tree region | 17 | **7** |
| p55 faint tree vs raw 2016 region | 8 | **5** |
| 2016 region vs its own affine copy (feature control) | 789 | **741** |

No strong, spatially consistent same-source transform emerged in this direct comparison. The 2016 crop median grayscale is 1/255 and its self-control may obtain features from white text. This bounded failure supplies no key rule and does not exclude common source under different rendering transforms. See [27 November common-stock correction](lp2-tree-common-stock-source-reopening.md).

### Reproduction and decision

[Read-only CommonJS-independent Python SFT](../sims/lp2_p55_2016_tree_crossimage_sft.py), OpenCV SIFT and NumPy, executed on Windows GitHub Actions: [successful original-image run 43407232363](https://github.com/FlareZ123/liber-primus/actions/runs/43407232363). The source images remain unchanged.

**Next action:** return effort to operations that directly select a reversible key or recover unknown text. Do not tune crop thresholds or image enhancements against coincidences. Revisit only on source-independent evidence that the two trees share an exact template or encode a specified navigation procedure.

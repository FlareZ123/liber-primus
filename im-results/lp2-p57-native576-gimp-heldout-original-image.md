# A 576×864 original raster and held-out GIMP Dissolve reconstruction of the solved p57 mayfly

**Agent44, 15 November 2026. Source-artwork result for Director #992.** The original solved LP2 p57 JPEG is an almost lossless enlargement of a **576×864 binary document raster**. Registering a faint insect on original p24 (source image `41.jpg`) to the restored p57 mayfly and thresholding with the **actual historical GIMP 2.8 paint-Dissolve random field** predicts **370 of 468 reserved original black source cells**, with held-out **F1=0.8140814**. This is a new reproducible cross-artifact source-model positive. It is **not** a decoded LP2 unknown page, ciphertext key, recovered hidden payload, or evidence that the remaining 169 held-out mismatches encode bits.

## Source image formation: full physical canvas

All three relevant original files are 2400×3600-pixel JPEGs. Original p24=`41.jpg`, p26=`43.jpg`, solved p57=`74.jpg`. Original p24 and p26 share the same faint left insect and differ in their rune text. The p57 mayfly below the text consists of individual solid, square-looking black specks, with very few antialiased edges. A vertical/horizontal decomposition of connected source speck widths gives the precise 25-pixel recurrence of a six-cell source grid. The natural 2014-era raster explanation is **72dpi at 8×12 inches = 576×864 pixels, enlarged to 300dpi = 2400×3600 pixels**, factor **25/6** on both axes.

Use native source-cell boundaries `floor((25k+q)/6)`, `k=0..576` in x and `k=0..864` in y. A finite 6×6 phase check against the independently existing 2400×3600 black/bare-surface pixels in the insect region chooses **qx=2,qy=3**, with **1474 disagreements of 1,740,800 rendered pixels** under nearest source-cell black/white majority (0.0847%). The raster is then recovered by evaluating the JPEG luminance under threshold128 at each `(left+right)//2` source-cell center. The same test gives exactly **2033** dark source cells within y460..799, and all 2033 lie in the **230×262** cell mayfly box **x178..407,y487..748**. This 2033-cell count independently matches the earlier external SECRA result; the whole-canvas 576×864 placement is the present explicit original-image reconstruction.

The four isolated source cells in the lower-left dot cluster appear at full-canvas coordinates:

| Original p57 source cell (x,y) | Historical GIMP field coordinate (x−154, y−484) | Historical GIMP threshold |
| --- | --- | ---: |
| 211,725 | 57,241 | **0** |
| 202,731 | 48,247 | **0** |
| 199,740 | 45,256 | **0** |
| 215,744 | 61,260 | **0** |

The four field coordinates and zero values were independently reported by SECRA in cropped coordinates; this table reconstructs their **absolute full-canvas** relation. The source's 158,475 crop origin and published `(+4,−9)` registration agree arithmetically with `(−154,−484)`. Every one of these four dots exists in the restored original JPEG; **none was introduced to make the source art fit**.

## Exact 2014 algorithm and original p24 -> p57 forward prediction

The [read-only reproducible Python SFT](../sims/lp2_p57_gimp_dissolve_native_holdout_sft.py) loads original repository JPEGs 41 and 74 using Pillow, reconstructs the p57 native binary source canvas and uses the **system's native GLib `g_rand_new_with_seed`/ `g_rand_int_range`** to reconstruct the documented GIMP 2.8 paint-Dissolve sequence. The GIMP master seed is hard-coded **314159265**; it generates **4096 row seeds**, then one independent GIMP `GRand(row_seed[y])` stream per row. Advance from pixel x0 and keep samples x24..253 for source rows y3..264. Assert the known first eight row seeds `3721122731,618219707,807213306,3144837749,3447982176,3230631767,755972506,1398685501`, and assert that all four isolated dots above have exact historical threshold zero.

The original p24 left insect grayscale is then sampled once per p57 source cell via a **single affine transform** followed by a 1.2-original-pixel Gaussian blur and gain0.810718. The frozen training fit maps x57,y57 to physical p24 pixel:

```
x24 = 305.2531733391564
    + 2.475652678422321 * (x57 - 288)
    - 0.004331912807886796 * (y57 - 546)
y24 = 1325.5363430764332
    - 0.021703222539651595 * (x57 - 288)
    + 2.5579697154729297 * (y57 - 546)
alpha = clip[0,255](0.8107181307630735 * (255 - blurred_luminance(x24,y24)))
predicted_black(x57,y57) = [historical_GIMP_R(x57-154,y57-484) < alpha]
```

This finite affine+gain model was optimized once by a deterministic SciPy `differential_evolution(seed=3301)` log-likelihood objective on only the **80% training set**, with bounds `cx 298..315, cy 1315..1338, ax/ay 2.36..2.59, bx/by −0.11..0.11, gain 0.62..0.92`. A fixed **10×10-cell-block spatial holdout** is `(floor(x/10)+3 floor(y/10)) mod5 == 0`. It reserves exactly **12070 of 60260 source cells**, including **468** actual dark mayfly cells, before fitting the model; training uses 48190 cells. The holdout does not include any optimization or retry with its metrics. The earlier 6×6 *raster-reconstruction* phase and four zero-threshold GIMP anchors were evaluated before this opacity fit and are not independently held out.

| Source-original p24 → p57 prediction | TP | FP | FN | TN | F1 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 80% model-fitting cells | **1279** | 308 | 286 | 46317 | **0.8115482** |
| Independent 20% spatial holdout | **370** | 71 | 98 | 11531 | **0.8140814** |
| Same opacity, historical GIMP field shifted 1 cell east | 158 | 275 | 310 | 11327 | 0.3507214 |
| Same opacity, historical GIMP field shifted 1 cell south | 155 | 289 | 313 | 11313 | 0.3399123 |

On another original with the same left insect, p26=`43.jpg`, **the unchanged** p24 affine parameters and gain predict holdout F1 **0.8131868** (370 TP,72 FP,98 FN). This is a source-art duplicate check, not a second independent portrait. For 1,000 fixed-seed cyclic shifts of the same GIMP noise field (excluding zero displacement), the held-out F1 spans 0.309–0.407 (mean0.361), with **zero approaching the original's 0.814**. These shifted-field controls reject the explanation that merely matching an approximate insect silhouette explains the held-out pixel placement. They do not prove a Cicada-authored cipher or a unique generative program.

### What this resolves and what it does not

The p57 illustration's original black pixels are **substantially predicted by a deterministic 2014-era image-generation algorithm combined with artwork already printed in unsolved p24/p26**. The exact historical source and held-out control constitute a forward source-model relationship, rather than another freely fitted cipher of random-looking runes. The remaining overall **763 mismatched native cells** (379 FP+384 FN; source 2033 actual black pixels) are credible consequences of JPEG rendering, the imperfect 7-parameter artwork geometry, blur/opacity differences, or a distinct underlying master. They have **no independently indicated bit order, authenticated framing, payload checksum, or destination**. The previously published external **31-parameter F1≈0.960096 / 166 residual** claim is stronger than the present restricted 7-parameter F1≈0.813, but it does not provide byte-complete original master parameters, and its 166 residual positions cannot be treated as a secret by assumption.

**Decision for #992:** the first feasible **full-source-canvas + native GIMP forward model** now passes a reserved original-image holdout and explains the artwork fingerprint; **no interpretable residual payload is justified**. Further source reconstruction may try recovering an original **2014 GIMP project/layer or alpha mask** or author-selected residual framing, preferably from byte-preserved artist sources, before spending compute to mine dot differences. This reproduction does **not** justify feeding the GIMP PRNG into the unsolved LP2 rune cipher; numerous prior direct GP29 pad and full field inverses already failed.

### Reproduction and provenance

- Original primary JPEGs: [p24 / 41.jpg](../resources/liber-primus/41.jpg), [p26 / 43.jpg](../resources/liber-primus/43.jpg), [solved p57 / 74.jpg](../resources/liber-primus/74.jpg).
- [New read-only SFT](../sims/lp2_p57_gimp_dissolve_native_holdout_sft.py), **[passed original-JPEG GitHub Actions run 43666627189](https://github.com/FlareZ123/liber-primus/actions/runs/43666627189)**, runs on an environment with `libglib-2.0`, Python3, NumPy, SciPy and Pillow. It asserts source dimensions, original 2033 cells, four zero-threshold source dots, historical GLib vectors, training and held-out confusion matrices, and both one-cell negative controls. Original 2014-era GIMP source pointers and prior GP rune-use negatives: [GIMP Dissolve source/key gate](gimp-dissolve-source-pad-gate.md).
- Independent reference for 2033-cell count, cropped alignment and 31-parameter master claim: [SECRA Strongest Findings](https://secra.tech/research/liber-primus-strongest-findings/), which reports details of its source art reconstruction. The numerical full-canvas coordinate transform and heldout p24-JPEG forward fit above are **this** reproduction, not a verbatim reuse of SECRA's inaccessible unpublished full fit.

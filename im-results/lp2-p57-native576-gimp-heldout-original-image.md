# A 576×864 original raster and held-out GIMP Dissolve reconstruction of the solved p57 mayfly

**Source-artwork reconstruction (Agent44 and Agent18, 15 November 2026), Director #992 established.** The lower mayfly illustration layer of the original solved LP2 p57 JPEG is an almost lossless enlargement of a **576×864-position binary raster**; the higher-resolution rune typography is separately composited. The historical GIMP 2.8 paint-Dissolve field applied to original p24's faint left insect predicts the actual p57 native source cells. The original seven-parameter affine/opacity model predicts **370/468 held-out dark cells, F1=0.8140814**. The now-reproduced **multiscale source-art refinement** predicts **428/468 held-out dark cells, F1≈0.9175** on the original Ubuntu CI run, with **317** native-cell disagreements, versus 644 for the previous 19-parameter model. This remains an exploratory image reconstruction, not a recovered embedded message. The same frozen model holds on p26's repeated insect. This is an original-artwork forward-model improvement. **No unsolved LP2 plaintext, key, historical payload, or selected bit-extraction rule has been recovered.**


## Original-source smooth multiscale reconstruction (Agent9, 16 November 2026)

The exact 2014 GIMP 2.8 row-seed field and native 576×864 source layout supply a concrete forward image transformation from the original p24 insect illustration to the clear p57 mayfly. A new [original-JPEG source reproducer](../sims/lp2_p57_gimp_multiscale_source_sft.py) starts from the pre-existing 19-parameter fit. It adds smooth radial-basis corrections to both source-coordinate mapping and positive local opacity gain. The 4×4, 8×8, and 12×12 stages have 48, 192, and 432 bounded, regularized parameters. Source-original p24 is sampled with the earlier sigma1.2 Gaussian blur for the coarse stage, and with unblurred pixels for the finer stages. Every coefficient is fitted on the previous 48,190 training cells; the fixed 12,070-cell spatial holdout, historical GLib random field, original image coordinates, and all 2,033 true black cells remain unchanged.

| Source-native forward model | Training TP/FP/FN | Held-out TP/FP/FN | Held-out F1 | All mismatched cells |
|---|---|---|---:|---:|
| Earlier 19-parameter cubic model | 1,301 / 235 / 264 | 381 / 58 / 87 | 0.840132 | 644 |
| Smooth 4×4 correction | 1,383 / 191 / 182 | 395 / 52 / 73 | 0.863388 | 498 |
| Smooth 8×8 correction | 1,418 / 131 / 147 | 418 / 42 / 50 | 0.900862 | 370 |
| Smooth 12×12 correction | 1,449 / 124 / 116 | **428 / 37 / 40** | **0.917471** | **317** |

[Original-source Ubuntu CI run 43962348023](https://github.com/FlareZ123/liber-primus/actions/runs/43962348023) completed successfully with the reproduced values above. A local Python 3.13 build yielded a slightly different model fit, 329 total residuals and held-out F1 0.919441, despite the same objective and fixed seeds. This sensitivity to numeric libraries and platform optimization reinforces that individual residual cells are not an authenticated hidden message. The CI results are the reference for the displayed table.

The Ubuntu reproduction's remaining 317 disagreements comprise 161 predicted-only cells and 156 missed true cells. Their distribution follows densely drawn central-body, limb, and wing regions; none supplies a source-selected byte stream, recognizable key, or cipher operator. The exact pre-JPEG GIMP opacity master is still unavailable. The unblurred source choice and model sizes were developed using this already examined spatial partition, so the held-out F1 is exploratory cross-check evidence rather than a sealed prospectively blind score. The 672 local adjustment parameters are substantially less constrained than the independently reported, unreplicated external 31-parameter fit. This work improves the source-art inverse reconstruction while leaving the actual LP2 decryption, key material, and deep-web destination unresolved.

## Later train-only nonlinear geometric refinement (Agent18)

The 7-parameter reconstruction below established the historic source relationship and supplied the *frozen* original 10×10-cell-block spatial holdout. A strictly conditional next test allows a smooth deformation between the original p24 faint insect and the p57 restored pointillist mayfly without using any of the same **12,070 held-out cells (468 actual dark)** in parameter fitting. This compares one independently specified, source-photo-based 19-parameter rendering family. Its improvement supports image-generation fidelity; it is not a glyph cipher or hidden-message extraction.

Keep all seven baseline parameters, raster phase, original source coordinates, historical GLib/GIMP row-seeds and threshold convention unchanged. Set `u=(x−288)/115`, `v=(y−620)/131`, and apply separate x/y displacement polynomials in the seven basis terms `[u²,uv,v²,u³,u²v,uv²,v³]`. Their **14** coefficients and **five** gain-coefficients in basis `[u,v,u²,uv,v²]` are optimized by bounded SciPy L-BFGS-B on **only the original complement 80% training cells**, minimizing smooth Bernoulli negative log-likelihood at GIMP-threshold temperature2.3. The original Gaussian sigma1.2 and baseline gain0.810718 remain unchanged, with the gain correction `max(0.12,1 + Σ θᵢ basisᵢ)`. The fitted source coefficients and exact implementation are frozen in [the read-only 19-parameter original-image SFT](../sims/lp2_p57_gimp_curved_holdout_original_sft.py).

| Original p57 raster / GIMP R field | Training dark TP / false FP / missed FN | Frozen 20% holdout TP / FP / FN | Heldout F1 | All source-cell mismatches |
| --- | --- | --- | ---: | ---: |
| Historical seven-parameter p24 model (Agent44) | 1,279 / 308 / 286 | 370 / 71 / 98 | **0.8140814** | **763** |
| Train-fitted 19-parameter cubic p24 model (Agent18) | 1,301 / 235 / 264 | **381 / 58 / 87** | **0.8401323** | **644** |
| Same 19-parameter settings against **p26**, no fitting | 1,301 / 234 / 264 | **381 / 58 / 87** | **0.8401323** | **643** |

The source duplicate p26 control is the same left insect reprinted, so it checks robustness to another JPEG rendering of essentially one artwork rather than proving an independently authored payload. The 19-parameter p24 full raster has **351 missed dark cells distributed across 269 8-connected components**, a substantial residual with no selected bit-order, checksum, endpoint or source master. It is premature to read those cells as intentional glyphs. Previously reported *external* 31-parameter F1≈0.9601 is stronger on its reported reference and is still unreplicated under this heldout partition.

The famous four isolated p57 dots at native cells (211,725), (202,731), (199,740), (215,744) **still require a native-opacity caveat**. All four coincide with historical GIMP random threshold0. Under the new continuous-opacity photo model their sampled opacity values are about **0.1164, 0.7695, 0.9071, 0.1863**, strictly positive but **all below 1 on the original 0–255 opacity scale**. A floating-point `R < alpha` predicts all four; an authentic 8-bit GIMP alpha value rounded/truncated to zero would predict none. All four dots fall on the training side of the original holdout, so these four local predictions are **not held-out evidence** of their origin. This reconstruction therefore does not dissolve the original missing-master ambiguity or provide four author-selected payload bits.

**Execution:** [successful original-JPEG Ubuntu/GLib Python CI run 43673307038](https://github.com/FlareZ123/liber-primus/actions/runs/43673307038) reproduces both the exact original seven-parameter results and the separate frozen 19-parameter results against p24 and p26; the original manual workflow can select `script=curved` or its unchanged baseline. Neither source JPEG nor original p57 is rewritten.

## Source image formation: full page-aligned illustration layer

All three relevant original files are 2400×3600-pixel JPEGs. Original p24=`41.jpg`, p26=`43.jpg`, solved p57=`74.jpg`. Original p24 and p26 share the same faint left insect and differ in their rune text. The p57 mayfly below the text consists of individual solid, square-looking black specks, with very few antialiased edges. A vertical/horizontal decomposition of connected source speck widths gives the precise 25-pixel recurrence of a six-cell source grid. The natural 2014-era image-layer explanation is **72dpi at 8×12 inches = 576×864 pixels, enlarged onto the 300dpi 2400×3600 page**, factor **25/6** on both axes. **This enlargement specifically describes the pointillist illustration, not the entire text page.** In the same original p57 image, reprojecting source-cell blacks under that identical mapping leaves **17,842/612,000 pixel disagreements (2.915%)** in a fixed rune-text crop x350..1879,y900..1299, compared with only **1474/1,740,800 (0.0847%)** in the illustrated crop x530..1889,y1900..3179. On the minority *black foreground pixels*, the same fixed native-grid reprojection has illustration **F1=0.9790601** (34,459 TP,723 FP,751 FN) versus rune-text **F1=0.9110151** (91,332 TP,8,447 FP,9,395 FN), so this distinction is not merely a mostly-white-background agreement. The large discrepancy proves that the printed runes are independently rendered at higher resolution and prevents wrongly treating this as the entire document's binary export.

Use native source-cell boundaries `floor((25k+q)/6)`, `k=0..576` in x and `k=0..864` in y. A finite 6×6 phase check against the independently existing 2400×3600 black/bare-surface pixels in the insect region chooses **qx=2,qy=3**, with **1474 disagreements of 1,740,800 rendered pixels** under nearest source-cell black/white majority (0.0847%). The raster is then recovered by evaluating the JPEG luminance under threshold128 at each `(left+right)//2` source-cell center. The same test gives exactly **2033** dark source cells within y460..799, and all 2033 lie in the **230×262** cell mayfly box **x178..407,y487..748**. This 2033-cell count independently matches the earlier external SECRA result; the **full-page-aligned 576×864 coordinate frame for the separate illustrated layer** is the present explicit original-image reconstruction.

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

### A finite source-image rival and the four-dot opacity caveat

Retaining **all** seven frozen p24-left fitted parameters, sample instead the *right-hand p24 insect reflected about the page midpoint*, `x24→2400−x24`. Its reserved-cell F1 falls to **0.2534884** (109 TP,283 FP,359 FN); testing the bottom reflection `y24→4000−y24` gives **0.0738462** (24 TP,158 FP,444 FN). These are diagnostic source-artwork alternatives, not new fitted models. Their failure shows that the match is attached to **the actual top-left printed insect and its orientation**, beyond a generic mirrored insect.

The source mayfly contains **391** isolated single dark cells under 8-neighbour connectivity, **65** of which also lie at historical GIMP random value0; altogether **91 of the 2033** black cells have GIMP value0. Consequently the four famous lower-left zero-value dots are part of a larger renderer-consistent population, and do not alone furnish four independently chosen payload bits.

One qualification matters for any proposed residual channel: although all **four** isolated p57 dots coincide with true GIMP noise value0, the fitted p24 photo model assigns predicted opacity **exactly zero** to source cells **(211,725)** and **(202,731)**. It assigns approximately **0.0122** to (199,740) and **0.7417** to (215,744), in 0–255 opacity units. Thus the GIMP zeros alone do **not** allow the actual p24 JPEG overlay to reconstruct every isolated original dot: at least two require a different or more complete alpha master. This is a concrete reason to recover the original artist source rather than declare the unexplained dots encoded text. The p24 photo is a rendered JPEG observation of the artwork, not a verified original GIMP alpha layer.

### What this resolves and what it does not

The p57 illustration's original black pixels are **substantially predicted by a deterministic 2014-era image-generation algorithm combined with artwork already printed in unsolved p24/p26**. The exact historical source and held-out control constitute a forward source-model relationship, rather than another freely fitted cipher of random-looking runes. The original seven-parameter model leaves **763 mismatched native cells** (379 FP+384 FN); the later train-only cubic refinement reduces this to **644** while retaining a pre-existing withheld source region and the unchanged GIMP field. Both residual totals are credible consequences of JPEG rendering, imperfect photo-to-master geometry, blur/opacity differences, or a distinct underlying master. They have **no independently indicated bit order, authenticated framing, payload checksum, or destination**. The previously published external **31-parameter F1≈0.960096 / 166 residual** claim is stronger than the present restricted 7-parameter F1≈0.813, but it does not provide byte-complete original master parameters, and its 166 residual positions cannot be treated as a secret by assumption.

**Decision for #992:** the full-page-registered native illustration/GIMP forward model, including the independently withheld 19-parameter cubic improvement, predicts source p57 artwork substantially beyond a generic silhouette; **no independently framed or recoverable residual payload is justified**. All four special noise-zero dots remain below unit photo opacity in the curved reconstruction; the original editable opacity layer is needed to settle their exact source. Further source reconstruction may try recovering an original **2014 GIMP project/layer or alpha mask** or author-selected residual framing, preferably from byte-preserved artist sources, before spending compute to mine dot differences. This reproduction does **not** justify feeding the GIMP PRNG into the unsolved LP2 rune cipher; numerous prior direct GP29 pad and full field inverses already failed.

### Reproduction and provenance

- Original primary JPEGs: [p24 / 41.jpg](../resources/liber-primus/41.jpg), [p26 / 43.jpg](../resources/liber-primus/43.jpg), [solved p57 / 74.jpg](../resources/liber-primus/74.jpg).
- [New read-only SFT](../sims/lp2_p57_gimp_dissolve_native_holdout_sft.py), **[passed original-JPEG GitHub Actions run 43666627189](https://github.com/FlareZ123/liber-primus/actions/runs/43666627189)**, runs on an environment with `libglib-2.0`, Python3, NumPy, SciPy and Pillow. It asserts source dimensions, original 2033 cells, four zero-threshold source dots, historical GLib vectors, training and held-out confusion matrices, and both one-cell negative controls. Original 2014-era GIMP source pointers and prior GP rune-use negatives: [GIMP Dissolve source/key gate](gimp-dissolve-source-pad-gate.md).
- Independent reference for 2033-cell count, cropped alignment and 31-parameter master claim: [SECRA Strongest Findings](https://secra.tech/research/liber-primus-strongest-findings/), which reports details of its source art reconstruction. The numerical full-canvas coordinate transform and heldout p24-JPEG forward fit above are **this** reproduction, not a verbatim reuse of SECRA's inaccessible unpublished full fit.

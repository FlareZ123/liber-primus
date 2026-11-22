# Original p57 mayfly: 31-parameter source-opacity reconstruction gate

**Agent31, 13 November 2026; Director Issue #754. Classification: exploratory source-plate reconstruction, not an original-puzzle decoder or the unpublished SECRA \`joint_k17_2\` master.** A frozen original-JPEG SFT is [\`sims/lp2_p57_source31_opacity_sft.py\`](../sims/lp2_p57_source31_opacity_sft.py). All measurements below were reproduced locally against the 2400×3600 original scans 41.jpg, 43.jpg and 74.jpg.

## Exact original-image inputs and causal question

The original p24 and p26 ornament strips (scans 41 and 43) are byte-pixel-identical in their shared 600×1600 raster crop. The original solved p57 image (scan74) contains an independently recoverable **274 rows × 293 columns** of 96-dpi logical cells, **2,033 black cells**, at the original 400-dpi source coordinates reported by [#740](lp2_p24_p57_dissolve_tone_controls.md). The original 2013-era GIMP Dissolve threshold field has seed 314159265, 4096 row seeds, and source-aligned offset **x+4, y−9**. Four isolated original p57 black cells have threshold zero, which the historical renderer can produce from near-zero positive opacity. This reproduces the source-linked software fingerprint. It supplies no cryptographic bit orientation, frame, or key.

The independent [SECRA published evidence](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html) names a separately optimized **31-parameter \`joint_k17_2\`** opacity refinement with **F1=0.960096** and **166 original target mismatches** (1997 true positive, 130 extra, 36 missing). The public evidence exposes aggregate scores but, in the sources accessible during this assignment, **neither a complete 31-parameter vector nor the actual predicted 293×274 bitmap**. Without one of those objects, the 166 published residual positions cannot be independently reconstructed, let alone interpreted as bits.

## A new constructive, source-plate 31-parameter surrogate

To test whether the historical renderer plus the **authentic p24 source art** can approach a usable opacity master without editing individual p57 dots, we fitted one 31-real-parameter differentiable family:

- A 5-parameter source-to-target affine registration, initialized at the frozen seven-parameter #740 fit.
- Twelve bounded smooth displacement coefficients, six two-dimensional Gaussian source-warp control functions for each axis (grid centers specified in SFT).
- Four global opacity/optimization controls: gain, gamma, bias and training sigmoid temperature.
- Ten fixed low-degree spatial polynomial tone coefficients, multiplied into the source darkness; no per-cell alpha lookup or residual mask.

Original p24 grayscale is Gaussian-blurred at sigma1.2, bilinearly sampled in original pixels, converted to an alpha field, and compared against the **exact original GIMP threshold for every p57 cell**. Fitting used the original fixed 16×16 cell-tile 65% training split of #740, Adam on a soft-F1 objective plus regularization, and inspected checkpoints every 150 steps through 1,800. The published vector is the checkpoint selected at step 1,650 because it scored best on the 35% spatial tile subset **during this run**. This means the reported 35% figures are *exploratory post-selection checks*, **not** an untouched confirmatory holdout or evidence of the external \`joint_k17_2\` model. The fixed vector itself is retained verbatim in the SFT and reproduces the following source-cell comparisons:

| Cells scored against original p57 | True positive | Extra black | Missing black | F1 |
| --- | ---: | ---: | ---: | ---: |
| 65% training tiles | 1,319 | 174 | 90 | **0.909028** |
| 35% spatial evaluation tiles (checkpoint selected post hoc) | 581 | 53 | 43 | **0.923688** |
| All 80,282 original cells | **1,900** | **227** | **133** | **0.913462** |

This is a constructive improvement over #740's simpler 7-parameter, same-source heldout **F1=0.674437**, but still **360 residual cells**, more than twice SECRA's 166. A second 31-parameter variant using body/wing/tail-specific spatial tone features scored no better (exploratory best heldout ~0.921). We stopped further tuning because the source does not select those parameterizations.

The residual's **three largest 8-connected extra-black components** contain **30, 18 and 15 cells**, at p57 logical column **132–137** and rows **85–132**, all aligned along the central insect body. These account for **63 of 227** false positives; they are structured source-rendering mismatches, so describing all 360 as random isolated embedded bits would be false. A small, original-source page24→page25 editorial variant, applied to the *frozen* model (unshifted), changes **320 predicted cells** despite containing no claimed authored message; a globally changed modeled opacity by +1 and −1 levels changes **393** and **40** binary cells respectively. These comparisons illustrate sensitivity to genuine plate/tonality changes; they do not prove which process caused the actual residuals or set a transferable false-positive threshold for the unpublished 166 positions.

## Decoder decision and next input

**No independently framed residual message, source-selected bit traversal, key, unknown LP2 plaintext, or reversible text-cipher mechanism was recovered.** The current 360 residual coordinates are those of a *different fitted family* and must not be substituted for SECRA's 166. Pixelwise corrections, arbitrarily sorted residual dots, or choosing a reading orientation after seeing a plausible word would be circular.

The narrow missing prerequisite is the **exact external \`joint_k17_2\` opacity master** (parameters, predicted raster, transform/alpha reference and reserved-cell mask) or a recoverable pre-Dissolve original layer. If such evidence appears, lock it *before* inspecting candidate residual messages; run original Q92 image/near-copy nulls and a source-authored frame/checksum, then attempt one GP29 ciphertext inverse. The independent [original GIMP-cell threshold regression](../sims/lp2_p57_96dpi_mayfly_dissolve_original_sft.py) and [#740 source-tone controls](../sims/lp2_p24_p57_dissolve_tone_control_sft.py) remain the positive/no-message baselines.

**Research fork:** close this exact-master acquisition/reconstruction gate as currently unsupported, preserving the new original-source fit as a diagnostic and not escalating to broad residual-bit or password searches. Reopen only on delivery of the exact independently specified master or original compositing instructions. No change to the authoritative solved-page/plaintext status is justified.

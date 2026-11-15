# SECRA p57 31-parameter public-model acquisition gate (15 November 2026)

**Decision for Director #1144:** The public [SECRA article](https://secra.tech/research/liber-primus-strongest-findings/) and its [evidence index](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html) identify the selected model and give confusion matrices, but the externally indexed material inspected does **not** publish the exact 31 coefficients, warp, source crop/orientation conventions, predicted binary raster, 166 residual coordinates, or an independently selected residual decoding rule. Its 166-cell discrepancy therefore **cannot currently be reproduced or subjected to the requested frozen residual test** from those public measurements alone. This is an acquisition/source-selection gap, not a negative result for all models or evidence of payload absence. No unknown plaintext or key recovered.

## Exact external claim and comparison with local source work

The external report, published 15 October 2026, labels its selected refinement `joint_k17_2` and reports **31 parameters** and **203 search runs**. Its source crop is described as 293×267 research cells; these are not the original 576×864 full-page illustrated-layer coordinates reconstructed independently in this repository. SECRA's GIMP-noise match and four source-dot threshold-zero observations agree with the repository's independent original-image analysis. The [local seven-/19-parameter reconstruction](lp2-p57-native576-gimp-heldout-original-image.md) has held-out F1 **0.8140814 / 0.8401323**. The article's **31-parameter** held-out F1 is **0.9390962672** and its whole-image F1 is **0.9600961538**. These are different models, splits and fits; do not attribute the local 0.814 to SECRA's 31-parameter result.

| External `joint_k17_2` partition | TP | FP | FN | Mismatches | F1 |
|---|---:|---:|---:|---:|---:|
| Published fitting cells | 1,129 | 44 | 15 | 59 | 0.97453603798 |
| Published held-out cells | 717 | 75 | 18 | 93 | 0.93909626719 |
| Published entire compared area | 1,997 | 130 | 36 | **166** | 0.96009615385 |
| **Arithmetic remainder** (whole minus train minus held-out) | **151** | **11** | **3** | **14** | **0.95569620253** |

The last row is an **arithmetic deduction only** from published totals. The source does not identify why this third subset exists, how it is positioned, or whether it belongs to a different evaluation convention. The public 166 disagreements cannot be localized by subtracting counts. The 203 searches and publication's admitted same-image exploratory holdouts also prevent presenting 0.939 as a fully independent unmined-page prediction.

## Source acquisition attempted and exact missing inputs

Inspected the article, the published evidence index (including its `selected_refinement`, eight mayfly evidence entries, associated file names and limitations), and indexed searches for `joint_k17_2`, SECRA, parameters, raster, original predicted opacity and source/public code. The article provides production explanations, four-dot positions and quantitative summaries, while the evidence index lists artifacts such as `fresh_native_audit.json`, `gimp_summary.json`, `illustration_metrics.json`, `four_dots.json` and `cells_and_thresholds.csv`. The accessible indexed text exposes **no full 31-value parameter vector, no exact predictor and no pixelwise prediction/residual list**; the 31-parameter identifier appears only as summary metadata in these inspected searches. The external page could not be directly opened/downloaded by the available browser or local runtime, so unindexed downloadable artifacts remain unverified. Do not claim exhaustiveness over the host or the author's private data.

The [original 2014 distributor master-file gate](lp2-p57-native-layer-master-archive-source-gate.md) separately found no available editable XCF/PSD/alpha source in the investigated public original-image archives. The seven-/19-parameter local held-out calculations are reproducible from [the original p24/p26/p57 JPEGs](../resources/liber-primus/) and [the local SFT](../sims/lp2_p57_gimp_curved_holdout_original_sft.py), but their residual positions **are not** the claimed SECRA 166 cells and must not be relabeled as such.

**Decision:** close #1144 as a public-input gap. Resume only if exact external parameter/raster bytes and the crop/holdout mapping become available in a public artifact, then freeze the model and test the original p57/p24/p26 sources. A steganographic claim additionally needs an original-era instruction selecting residual coordinates, order, alphabet and a held-out prediction. Generic refitting, pixel-specific correction and ad hoc residual-bit extraction would be post-selection rather than progress toward an LP2 key.

*Source links:* [SECRA article](https://secra.tech/research/liber-primus-strongest-findings/) and [supporting measurements](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html); [original-image heldout reconstruction](lp2-p57-native576-gimp-heldout-original-image.md); [original-layer acquisition gate](lp2-p57-native-layer-master-archive-source-gate.md).

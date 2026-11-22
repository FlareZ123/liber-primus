# Selected original-image glyph-form gate: C, NG and AE

**Verdict: bounded null for ordinary C/NG/AE forms; both excluded red initials are oversized, with no anomalous ordinary NG.** This does not establish a global result for all 29 GP symbols and does not recover plaintext or key material.

## Decision

Across all 58 original LP2 JPEGs, fixed templates from solved p56 identify every ordinary occurrence of **C (453/453)** and **AE (451/451)**. The AE denominator excludes p56:0, the oversized red initial. The NG template identifies **457/457 ordinary instances** after excluding the oversized red initial at p33:91. That first glyph occupies (601,1908)–(820,2406), is 219×498 pixels, and scale-normalizes to the ordinary solved-p56 NG template with binary IoU **0.885**. The previously reported TH-like box (841,1914)–(875,2028) actually contains the following p33:92 TH, which matches the solved-p56 TH with binary IoU **0.933**. The prior anomalous-NG claim was a one-glyph coordinate attribution error.

Thus **1,361/1,361 ordinary selected glyphs** match their fixed source templates. The two exclusions are source-annotated exceptions, not threshold tuning.

## Source-locked method

- LP2 page p maps to original scan p+17; all 58 source JPEGs are used.
- Templates are fixed crops from solved physical p56 / scan 73.jpg: C index 5 at (961,1050)-(1014,1164), NG index 21 at (601,2077)-(651,2192), and AE index 25 at (1015,1050)-(1049,1164).
- The main detector uses original grayscale below 160, normalized correlation at least 0.90, a fixed 105×36 local-maximum suppression window, and the text bounds used by the published A/R/E gate. Expected per-page counts come from resources/liber-primus/lp2-corpus.json.
- The two exclusions are fixed and checked against resources/liber-primus/lp2-ink-annotations.json: p56:0 is the oversized red AE initial; p33:91 is the first rune of a red span of length eight.
- A second morphology measure uses best-shift binary IoU over ±1 pixel. Sensitivity checks at luminance thresholds 128, 160 and 192, plus 3×3 erosion and dilation, were run on p0, p17, p33, p53, p56 and p57. Counts and the same two exceptions were unchanged.

## Results

| Rune | Canonical occurrences | Ordinary matches | Source exception |
|---|---:|---:|---|
| C | 453 | 453 | none |
| NG | 458 | 457 | p33:91, oversized red initial |
| AE | 452 | 451 | p56:0, oversized red initial |
| **Total** | **1,363** | **1,361** | **2 explicitly classified** |

All per-page counts match after those two exceptions; there are no additional page-level deficits or excesses. Solved p56 and p57 are included as controls: p56 C=5 and NG=3 match, while its six ordinary AE instances match; p57 C=5 and NG=1 match and AE is absent.

For the ordinary matched instances, the minimum / median best-shift IoU is **0.962 / 0.980** for C, **0.909 / 0.928** for NG, and **0.962 / 0.975** for AE. Minimum normalized correlations are 0.974, 0.920 and 0.967 respectively. These margins are stable under the stated threshold and morphology checks.

### The p56:0 exception

The p56:0 AE is the oversized red initial already inventoried in #195, not a second ordinary glyph. Its original component is 149×496 pixels; nearest-neighbor normalization to the ordinary 34×114 AE crop gives IoU **0.939**. Its scale and outline therefore agree with the ordinary AE form.

### The p33:91 oversized red initial and the following TH

The canonical corpus and red-ink annotation correctly identify **p33:91 as NG** and **p33:92 as TH**, at the start of the eight-rune heading. Reinspection of the original full page image (physical p33, scan `50.jpg`) resolves the apparent allograph anomaly. The original report used the `(841,1914)–(875,2028)` crop, which is the *second* rune and thus naturally agrees with the solved-p56 TH template (unshifted binary IoU **0.932624**). The preceding **oversized** red NG spans `(601,1908)–(820,2406)`. Nearest-neighbor scaling of its black/red grayscale mask to the solved-p56 ordinary NG template gives unshifted binary IoU **0.885135**; its shape and source placement support NG. Cropping the first glyph at the second glyph's position was the entire alleged normal-height TH-like NG exception.

The correction preserves all source rune indices, their page-local offsets and the 457/457 ordinary NG census. Both excluded instances, p33:91 NG and p56:0 AE, are **large red initials**, not suspicious alternate ordinary glyphs. It invalidates the original reported p33 wrong-class comparison as evidence of a transcription error or secondary state.

### Rejected candidate templates

TH, M and W were screened as cross-rune controls but not promoted: their same fixed-template detector yields 624/461, 587/442 and 870/409 hits/expected occurrences respectively. These are non-discriminating overmatches, not evidence of additional glyphs. The earlier p33:91 anomaly was a crop offset error, not an alternate-rune signal.

## Prior art and bounds

The independent Round-30 A1-font study in [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round30/A1-font/SUMMARY.json) reports one dominant shape cluster per rune across its p0–53 sample, with only small 2–6-member noise clusters; its NG sample has one large cluster and no second large cluster. Its negative is consistent with this selected source gate, but its sampling and extraction are not substituted for the measurements above.

This result covers only C, NG and AE as ordinary glyph classes, plus rejected TH/M/W detectors. It does **not** prove that every GP symbol has one form. The p33:91 source is an oversized ordinary-class NG and supplies no extra bit or independent key-selection rule. The selected-class allograph-channel branch is therefore closed as a bounded null; reopen only with a second independently located same-rune variant or a source-specified reading rule that predicts an unexamined page.

## Reproduction

Run from the repository:

    python sims/lp2_selected_allograph_original_sft.py

The script accepts the same optional --archive, --corpus and --ink arguments as the A/R/E gate. It prints per-page assertions, morphology sensitivity results, similarity statistics, the p33:91 scaled-NG and p33:92 following-TH comparisons, the scaled p56:0 AE comparison, and rejected-control counts. It requires OpenCV, NumPy and Pillow.

Supporting source files: resources/liber-primus/73.jpg, resources/liber-primus/50.jpg, resources/liber-primus/lp2-corpus.json and resources/liber-primus/lp2-ink-annotations.json.

The source-coordinate correction is reflected in results/README.md and the integrated research decision contract because both previously repeated the false small-glyph anomaly; it is not a recovered plaintext or cipher mechanism.

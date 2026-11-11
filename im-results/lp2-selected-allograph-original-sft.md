# Selected original-image glyph-form gate: C, NG and AE

**Verdict: bounded null for ordinary C/NG/AE forms; one isolated red-span NG outlier.** This does not establish a global result for all 29 GP symbols and does not recover plaintext or key material.

## Decision

Across all 58 original LP2 JPEGs, fixed templates from solved p56 identify every ordinary occurrence of **C (453/453)** and **AE (451/451)**. The AE denominator excludes p56:0, the oversized red initial. The NG template identifies **457/457 ordinary instances** after excluding one normal-height red-span first-rune at p33:91. That glyph is visually TH-like, but it occurs once at a red-span boundary; it does not supply a repeatable variant sequence, state rule, key or decoder.

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
| NG | 458 | 457 | p33:91, red-span first-rune outlier |
| AE | 452 | 451 | p56:0, oversized red initial |
| **Total** | **1,363** | **1,361** | **2 explicitly classified** |

All per-page counts match after those two exceptions; there are no additional page-level deficits or excesses. Solved p56 and p57 are included as controls: p56 C=5 and NG=3 match, while its six ordinary AE instances match; p57 C=5 and NG=1 match and AE is absent.

For the ordinary matched instances, the minimum / median best-shift IoU is **0.962 / 0.980** for C, **0.909 / 0.928** for NG, and **0.962 / 0.975** for AE. Minimum normalized correlations are 0.974, 0.920 and 0.967 respectively. These margins are stable under the stated threshold and morphology checks.

### The p56:0 exception

The p56:0 AE is the oversized red initial already inventoried in #195, not a second ordinary glyph. Its original component is 149×496 pixels; nearest-neighbor normalization to the ordinary 34×114 AE crop gives IoU **0.939**. Its scale and outline therefore agree with the ordinary AE form.

### The p33:91 exception

The canonical corpus and red-ink annotation identify p33:91 as NG and as the first rune of a red span. Its original 114×34 crop at (841,1914)-(875,2028) has normalized correlation **0.941** and IoU **0.933** against the p56 TH control, but IoU only **0.228** against the p56 NG template. The other 457 NG occurrences match the NG template. This is a real local glyph-reading/style anomaly worth preserving, but a single red-span initial cannot define a repeated bit channel. It may be a rubric-specific form or a transcription ambiguity; the current evidence does not decide between those explanations.

### Rejected candidate templates

TH, M and W were screened as cross-rune controls but not promoted: their same fixed-template detector yields 624/461, 587/442 and 870/409 hits/expected occurrences respectively. These are non-discriminating overmatches, not evidence of additional glyphs. In particular, the p33:91 anomaly must not be used to tune a classifier or manufacture a binary string.

## Prior art and bounds

The independent Round-30 A1-font study in [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round30/A1-font/SUMMARY.json) reports one dominant shape cluster per rune across its p0–53 sample, with only small 2–6-member noise clusters; its NG sample has one large cluster and no second large cluster. Its negative is consistent with this selected source gate, but its sampling and extraction are not substituted for the measurements above.

This result covers only C, NG and AE as ordinary glyph classes, plus rejected TH/M/W detectors. It does **not** prove that every GP symbol has one form. The p33:91 singleton is not a source-selected state sequence, and no human-readable rule explains how it could supply actionable key material. The selected-class allograph-channel branch is therefore closed as a bounded null; reopen only with a second independently located same-rune variant or a source-specified reading rule that predicts an unexamined page.

## Reproduction

Run from the repository:

    python sims/lp2_selected_allograph_original_sft.py

The script accepts the same optional --archive, --corpus and --ink arguments as the A/R/E gate. It prints per-page assertions, morphology sensitivity results, similarity statistics, the p33:91 wrong-class comparison, the scaled p56:0 AE comparison and rejected-control counts. It requires OpenCV, NumPy and Pillow.

Supporting source files: resources/liber-primus/73.jpg, resources/liber-primus/50.jpg, resources/liber-primus/lp2-corpus.json and resources/liber-primus/lp2-ink-annotations.json.

No update to results/README.md is justified: this is an intermediate, bounded source-channel negative, not a recovered plaintext or cipher mechanism.

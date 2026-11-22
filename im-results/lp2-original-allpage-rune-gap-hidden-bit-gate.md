# Original LP2 pp0–55: repeated glyph-pair spacing excludes an overt +4px key bit

**Agent18, 14 November 2026. Original-image negative, with exact source labels and planted positive controls.** No new unknown-page plaintext, original cipher, authenticated key or destination is recovered. This extends earlier **p55-only** original kerning analysis to the entire 55 rune-bearing unsolved LP2 pages, using fixed original-image segmentation and source-aligned rune labels. The source motivation is real: Cicada used whitespace steganography in earlier stages, and original LP2 typesetting could in principle carry an extra bit in a wider/narrower gap. The measured repeated pair distances offer no such conspicuous alternate class at a **4-pixel** amplitude.

## Source and distinct test

Read the unchanged 2400×3600 original JPEGs `17.jpg`–`72.jpg`, representing physical LP2 p0–55; p50 is the **rune-free numerical table** and is excluded from glyph segmentation. Fix the original numeric/transcription source `resources/liber-primus/lp2-corpus.json` (12,956 GP29 runes). Follow the existing original JPEG glyph auditor's imaging rule, rather than inventing a new image model: grayscale threshold below120, x=500..1900 row detection, x=580..1900 glyph segmentation, 110–135px text bands, component width7–92px and height at least80px, 48×96 nearest-neighbor normalized binary glyphs. The **original physical p9** supplies 268 printed runes containing all 29 authentic classes; its extra border twig is excluded. Choose a fixed within-class medoid for each rune, classify subsequent glyphs by pixel XOR Hamming ≤314, and align each classified source-glyph sequence to that page's unmodified original GP29 rune indices. Every accepted glyph receives an exact original-rune identity.

Measure the **horizontal empty pixels between the native ink bounding boxes** of only consecutive, source-aligned runes on one physical text line. Partition the observable gaps into a short (0–8px) class and ordinary word-separator-size (16–25px) class, preselected from the actual source printing; do not mix punctuation-scale or artwork-separated gaps into this model. For each class, group across all unsolved images by the **ordered pair of GP29 rune identities**. Each group repeats the same printed bigram and same gap type but can occur on unrelated pages, lines, words and chapters. A large additional inter-rune blank inserted as a bit should create distinct long and short measurements **within the same label-pair group**, after removing the natural source glyph-width confound. This is a narrower and stronger control than splitting raw all-glyph gap values by an arbitrary threshold.

## Exact original-image measurements

The Windows Node-free Python source run admits **11,822** standalone image components, classifies and source-aligns **11,715** (none of the classified labels contradict original rune order), and measures **10,927** adjacent source-aligned gaps in the two selected size ranges.

| Original printed gap class | Accepted pair events | Distinct ordered rune-bigram classes | Classes repeating ≥3 times | Events in these repeated classes | Max observed within-class gap range |
| --- | ---: | ---: | ---: | ---: | ---: |
| Short native rune gap, 0–8px | **8,601** | 836 | **814** | **8,564** | **2 px** |
| Ordinary separator-size gap, 16–25px | **2,326** | 763 | **438** | **1,813** | **2 px** |
| **Combined** | **10,927** | 1,599 class/size combinations | **1,252** | **10,377** | **2 px** |

For the 814 short-gap classes, the full source group-range histogram is **92 groups of range0px, 556 of 1px, and 166 of 2px**. For the 438 separator-size groups, the histogram is **123/272/43**, respectively. There are **zero** repeated rune-pair classes spanning 4px or more in either printed-gap category.

**Exact positive calibration:** in a separate synthetic measurement copy, insert a +4px additional gap at the maximal-gap occurrence of each of the 814+438 repeatedly observed classes, keeping the source labels and all other image measurements fixed. The same group-range detector flags **1,252/1,252 planted classes** (all acquire a span of at least4px). The positive proves 4px overt additions are detectable under the original glyph-pair inventory; it does **not** prove the natural 1–2px rendering variation cannot encode a carefully chosen subpixel or 1px bit.

## Cryptanalytic implication and scope limits

This is a **whole-book negative on an overt repeated-pair kerning bit**, independent of any hypothesis about encrypted rune identities or GP29 plaintext. It substantially expands [the original p55-only font/kerning result](lp2-p55-native-glyph-variants.md), which already rejected +3px alternating p55 gaps with a trained p43 advance model, and is separate from [the earlier 256-cell numeral-table spacing result](lp2-original-numeric-grid-typographic-spacing-gate.md). The new all-page comparison exploits the source-invariant same-ordered-bigram control rather than fitting a global 29-glyph advance table.

The data do not exclude: intentionally controlled spacing changes of 1–2px; glyphs excluded by native column segmentation; groups occurring fewer than three times; intervals obscured by punctuation or art; deliberate bit values encoded only by a page-fixed layout phase; or DCT/chroma/image channels. No author-signed original instruction selects an invisible-gap bit order, payload framing, or key derivation. Further blind thresholding of normal font raster differences would add unconstrained choices rather than plaintext.

**Source and reproducibility:** [single self-contained original-JPEG SFT](../sims/lp2_original_allpage_rune_gap_repetition_sft.py) uses Python 3.12, NumPy and Pillow. It was executed successfully on the actual repository images by the existing Windows read-only image workflow, [GitHub Actions run 43637135875](https://github.com/FlareZ123/liber-primus/actions/runs/43637135875), with all 11,715 source glyph labels, original group-range counts and all 1,252 synthetic positive gap insertions checked. The source script produces the exact full histogram; no OCR, language fitting, plaintext key or file mutations are involved.

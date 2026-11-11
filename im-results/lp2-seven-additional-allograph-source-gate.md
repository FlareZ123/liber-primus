# Seven additional original-JPEG glyph classes: a bounded allograph source gate

**Status, 11 November 2026:** Original-source negative for a hidden typographic side channel in the seven selected GP29 classes **U, G, N, Y, F, J, IA**. No unknown LP2 plaintext, independent cipher key, or reading path was recovered.

## Original-input experiment

Source: the 58 original LP2 scans (archive pages 17.jpg–74.jpg), the canonical \`resources/liber-primus/lp2-corpus.json\` transcription, and already-solved p56 scan 73.jpg. This extends the existing C/NG/AE source audit (\`im-results/lp2-selected-allograph-original-sft.md\`) to seven *different* classes. Templates are fixed, single-glyph rectangular crops at p56 y861:975, with x intervals specified in \`sims/lp2_seven_additional_allograph_sft.py\`. Grayscale threshold is 160; normalized cross-correlation threshold is 0.90; nonmaximum-suppression region is 105×36 pixels. Only exact same-glyph local maxima two pixels apart are collapsed.

The source transcription predicts **3,204** appearances of these seven rune classes across all pages. Image matching locates **3,201 ordinary occurrences**, with exact per-page class counts after removing three source-red oversized initials. The only extra raw detector maximum was a two-pixel tie for the *same* J on p20 (x1551/x1552, y1991), deduplicated as one glyph. The classes and counts are:

| Rune | Source occurrences | Ordinary matches |
| --- | ---: | ---: |
| U | 459 | 458 |
| G | 442 | 442 |
| N | 459 | 459 |
| Y | 452 | 452 |
| F | 466 | 465 |
| J | 453 | 453 |
| IA | 473 | 472 |
| **Total** | **3,204** | **3,201** |

The three exceptions are exactly original-image oversized red initials: **U at p23:0**, **IA at p39:119**, and **F at p40:0**. After 4.3–4.4× scale normalization, original red pixels agree with ordinary p56 templates at best-shift IoU **0.95183**, **0.96016**, **0.93360**, respectively. These are visually explainable font-size/style exceptions at independently source-marked title starts. The lowest accepted single-glyph normalized correlation per class in the original images is U 0.96040, G 0.91691, N 0.92927, Y 0.94034, F 0.96683, J 0.93744, IA 0.92084.

## What the test establishes

All 3,201 ordinary occurrences can be accounted for by a fixed solved-page template per class; no recurring distinct allograph or unexpected outlier remains in these selected classes at the stated image threshold and registration precision. Combined with the previous C/NG/AE audit, ten additional ordinary classes beyond the earlier A/R/E studies have source-template coverage. It does **not** prove there is no hidden font channel in the remaining unchecked classes or in subthreshold image data, glyph spacing, punctuation, or colored initials. The accepted near-identical glyph images also do not identify the unknown cipher.

**Reproducer:** \`sims/lp2_seven_additional_allograph_sft.py\` reads the 58 original scans and verifies source class counts against the canonical corpus. It also accepts the maintainer-provided original JPEG ZIP with \`--archive\` for independent reproduction. No search over candidate templates or phonetic substitutions is used. This census rules out pursuing allograph switches in these seven classes unless new source evidence alters the hypothesis.

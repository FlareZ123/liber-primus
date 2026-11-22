# Original LP2 numerical-table spacing: one proportional-font layout

**Status (12 November 2026, Agent42): original-image bounded negative.** The complete 32×8 printed numeral table on physical LP2 pp49–51 is already studied as 256 source-ordered base60 tokens and a conditional GF(29) polynomial. This experiment addresses a separate potential human-visible channel: deliberately wide or narrow gaps between the printed two-character cells. The exact cell-spacing geometry is explained at near-pixel resolution by one ordinary proportional-font cursor model, leaving no distinct, source-selected spacing-bit alphabet or decoder. No unknown rune plaintext or key was recovered.

## Independent original evidence and frozen readout

Read the three original 2400×3600 JPEGs `resources/liber-primus/{66,67,68}.jpg`, corresponding to LP2 physical p49–p51, in their printed order of **10 + 13 + 9 lines**, with **eight two-character tokens per line**. The existing [source token transcription](../resources/liber-primus/base60-grid.json) supplies exact character labels; the program does not run OCR or fit ciphertext. At original pixel resolution, fixed horizontal projections isolate **511 distinct ink runs for 512 glyphs**. The sole join is the adjacent glyph pair `0J` in global table row23, which still has visible spaces on either side. All **224** between-cell spaces have intact measured boundaries.

Raw inter-cell ink gaps range from **29 to 64 px**, which could look like deliberate short/long spacing without accounting for glyph bearings. In particular, the narrow **`1`** glyph creates several of the widest raw gaps. Rather than thresholding this confounded measurement as a hidden bit, the source-fixed typography model measures consecutive glyph-start distances within each row and assigns one shared outgoing/incoming visual bearing to each of the **59 actually printed character classes**, plus one common inter-token space. It has no per-cell or per-page offset and learns nothing from the unknown rune text. An additive constant absorbs the font cursor origin after row starts are differenced.

## Reproducible original-image test

The [single-file Python SFT](../sims/lp2_numeric_grid_typographic_spacing_sft.py) uses Pillow and NumPy and reports:

| Original-source statistic | Result |
| --- | ---: |
| Printed cells / rows / JPEGs | **256 / 32 / 3** |
| Distinct glyph runs / fused character pair | **511 / 1** |
| Inter-token gaps with visible edges | **224 / 224** |
| Measured consecutive glyph-start distances | **478** |
| Character classes present | **59** |
| Same-model training RMSE | **0.535434 px** |
| Maximum absolute training residual | **1.659683 px** |
| Leave-one-original-row-out RMSE | **1.695322 px** |
| Leave-one-original-row-out MAE | **0.675536 px** |

The leave-one-row-out fit is refitted from the other original rows for each withheld row, with one common model over the whole three-page artifact. All nonfused glyph sequences are used. The one visually fused pair removes two internal glyph-start differences but does not hide an intercell spacing measurement. The script locks the three JPEG positions, native crop, ink threshold, line pitch, image dimensions, and all counts; its printed metrics and assertions require no supplemental training corpus or cryptographic parameters.

**Interpretation.** The entire apparent 29–64 px variation is consistent with glyph metrics and ordinary whitespace at approximately 1–2 pixel resolution. A hidden channel relying on visibly distinct *extra* intercell spaces is therefore unsupported. This cannot prove that an intentionally subtle subpixel modulation, alternate text register, or other physical-pixel steganography is absent. A further spacing decoder would require a new original clue selecting its measurement and interpretation before reading the ciphertext. The numerical values themselves and their established H/G polynomial checks are untouched.

**Next decision:** prefer an original manuscript instruction that actually fixes a reversible key or transformation. Do not spend research cycles splitting these uncorrected optical gaps into guessed zeros and ones, or interpreting the typography-only fit as a cryptanalytic solution.

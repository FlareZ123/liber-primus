# Original LP2 32×8 numerical grid: no two-space bit channel in the source typography

**Original-image decision, 14 November 2026 (Agent32).** The apparent variable gaps between the two-character numerals on LP2 physical pp49–51 are explained by the ink side bearings of a single proportional printed font. In 31 safely segmented numeral rows, **217 of 224 intertoken gaps** are compatible with a fixed single space. An independently held-out scan has **54 / 56 evaluable gaps** predicted within **1.74 source-image pixels**. One complete scan row is excluded because its original adjacent `0J` glyph pair touches in projection. No two-space-width gap or readable whitespace bit stream is established. This eliminates the simple original-table **single versus double intertoken space** idea, without constraining non-spacing JPEG steganography, source numeral arithmetic, ink-color signals, or independently coded punctuation.

## Why this original source matters

The page images [66.jpg](../resources/liber-primus/66.jpg), [67.jpg](../resources/liber-primus/67.jpg), and [68.jpg](../resources/liber-primus/68.jpg) print the **32×8 table of 256 two-character numerals**. The checked-in [literal 256-token transcription](../resources/liber-primus/lp2-grid-256.json) preserves each numeral, but drops **horizontal pixel spacing**. The 2013 Cicada signed-shell material had previously used actual physical space/tab bits to carry executable ASCII, so examining an overlooked layout channel is historically plausible. The independent source does **not** instruct treating the later numerical grid as another whitespace carrier.

Source images have exactly 2400×3600 raster pixels. For each original numeric line, the [single runnable test](../sims/lp2_grid_typographic_space_sft.py) projects dark ink within the printed text area (threshold 165, three ink pixels per column, 130-pixel vertical band), locates black horizontal glyph components and aligns their 16 components with eight literal two-character tokens. This is measured **source ink**, without character OCR or a guessed cipher key.

The first eight source numeral rows on each page remain visually recognizable as proportional type. Their measured gap sizes therefore cannot be treated as zero/one bits until characters' differing left/right ink side bearings have been removed.

## Discriminating original-image measurements

- Original numeral rows: **32**, comprising 10 on p49, 13 on p50 and nine on p51.
- Exactly **31** rows segment into 16 independent glyph ink components in their unmodified source image. The first p51 numeric row has **15** in horizontal projection because original `0J` ink touches; that entire row is excluded in advance.
- The 31 included rows supply **465** adjacent-glyph gaps: **248** within two-character numerals and **217** between numerals.
- **Eight independent glyph-pair identities** occur both inside a two-character numeral and across a printed intertoken gap. Their median gap increases are: `3→3` **27**, `2→1` **27**, `1→3` **26.5**, `2→4` **27**, `4→0` **27**, `3→0` **27**, `0→0` **27.5**, and `1→1` **27** original image pixels. Thus the independently observed **ordinary space width is about 27 pixels**, despite raw glyph-pair gaps ranging widely.
- The all-secret but **glyph-identity-only** stationary font model is `gap = intercept + right_ink_bearing(left glyph) + left_ink_bearing(right glyph)` for actual intertoken gaps. Its fit on all **217** source intertoken gaps leaves maximum absolute residual **1.241 pixels**. The very small residuals follow from a source glyph-side-bearing model: a second space would contribute roughly another **27 pixels**, far outside the residual range.
- To guard against same-image overfitting, the model learned only from the 10 p49 and 13 p50 source rows (**161 gaps**) predicts the remaining p51 rows. Of the **56** p51 intertoken gaps, **54** use glyph identities present in training; the **54 blind residuals** have RMSE **0.65834** and maximum absolute error **1.73337** pixels, again far below the 27-pixel second-space signature.

The [source-image SFT](../sims/lp2_grid_typographic_space_sft.py) prints the eight paired measurements, full-sample and scan-heldout errors, asserts exact original dimensions and row counts, and refuses to map the merged `0J` pair as if it were two separated glyphs. It reads only the original table JPEGs and the checked-in literal tokens; it needs Python, Pillow and NumPy. The measured results above came from a local run on the attached unmodified JPEG files.

## Scope, alternative explanations and next action

This **excludes one complete, simple visible channel**: a separate binary bit at each numerical-cell boundary, transmitted by inserting one additional ordinary whitespace width. It also rejects treating raw gap-size variation as an intentional bit without accounting for the actual glyph identity. The small remaining pixel errors are consistent with threshold and antialiasing quantization, not a recovered signal.

A code that deliberately varies kerning by one or two pixels is still logically possible. This result does not inspect the seven gaps in the excluded row, decorative marks, left-right marginal ink, or DCT coefficient structure. Nothing here decrypts LP2 ciphertext or supplies an authenticated key.

**Research decision:** Leave the source table arithmetic, key selection, and historically appropriate steganographic extraction as distinct live hypotheses. Do **not** expend cipher-search resources on the discarded single/double-space reading unless an original first-party source selects a more precise spacing operation. A genuine decrypted payload with a source-authenticated key would immediately supersede this negative channel result.

# Independent original-image p55 glyph transcription

**Decision for Director #521:** the original 2014 LP2 physical p55 JPEG (`resources/liber-primus/72.jpg`, SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`) contains **76 conventional black GP29 rune glyphs**, **16 black interword dots**, and a **separate red 13-square terminal rubric**. All **76 source-level glyph identities agree** with the canonical physical p55 indices in `resources/liber-primus/lp2-corpus.json` after adversarial source-image adjudication. No source correction, new plaintext, or cryptographic mechanism is established.

## Blind source procedure and its decisive correction

I initially inspected original p55 72.jpg without exposing the canonical p55 indices. Four text bands, x-projection black/dark connected intervals, direct rune-shape reading, and a coordinate-indexed 75-glyph board produced a frozen first-pass JSON (local SHA-256 `f992c4b47c989d50d312f229be3eb2a17ac4bccef293362522f79442e15a356b`). Its first-pass 75 labels are preserved under `blind_initial_pass` in the [coordinate map](../resources/liber-primus/lp2-p55-source-glyph-coordinates.json). The grayscale filter incorrectly designated **all columns at or beyond x=1015** on the last row as red ornament. Colour-channel separation demonstrated that x=1019..1028 is a **black I rune**, y=1238..1349, and the first red square begins only at x=1034. The terminal **BEI** consists of three separate black glyphs: B at x=921..954, E at x=960..1012, I at x=1019..1028. Its following red mark is punctuation/rubric.

The canonical transcription was fetched only after freezing the initial 75-classification. Five ordinary-rune labels required visual adjudication against their original pixel contours and independently understood GP29 forms:

| 1-based position | Blind guess | Original glyph adjudication | Pixel x |
|---|---|---|---|
| 2, 15 | A (24) | AE (25), doubled flag strokes | 672..705; 1309..1342 |
| 17, 40 | G (6) | IA (27), additional forked-cross geometry | 1403..1454; 1398..1449 |
| 68 | D (23) | M (19), enclosed crossed-stave form | 1698..1750 |

The original image's narrow black final I, absent from the 75-body grayscale pass, supplies canonical position 76. In total 75 ordinary body positions plus this additional observed final I were fixed. After the five manual corrections, **76/76** labels match the preexisting canonical rune sequence, preserving its line transitions and word boundaries.

## Source-controlled reproduction

- [Machine-readable 76-glyph coordinate map](../resources/liber-primus/lp2-p55-source-glyph-coordinates.json) contains original-pixel rectangles for every rune and all 16 black separators, red square positions, and the blind first-pass labels.
- [Original-image SFT](../sims/lp2_p55_source_coordinates_sft.py) uses the pinned original JPEG, a fixed black/red pixel distinction, and per-column ink projection. It asserts the 76 glyph rectangles, 16 separator rectangles, 13 separately detected red components, and canonical GP29 sequence, including the final black I.
- Source `72.jpg` is unchanged. Existing source transcriptions remain unchanged. This is a positive input-integrity control that validates the source assumptions for downstream p55 cryptanalysis without supporting any proposed 76-rune decoding method.

**Next decision:** return Director #41 to its existing WAITING gate for an independently source-selected full-page decoder/key/state. There is no transcription discrepancy to prioritize or use to rescue previous failed original-cipher attempts.

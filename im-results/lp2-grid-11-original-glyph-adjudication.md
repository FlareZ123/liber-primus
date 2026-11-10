# Eleven disputed LP2 numeric-table glyphs resolved from the original JPEGs

**Evidence class:** direct original-image character adjudication; source-input correction. **No encrypted LP2 text, cipher key, or destination recovered.** Agent 19, 10 November 2026.

## Decision

The original 2400×3600 JPEGs `resources/liber-primus/66.jpg`, `67.jpg`, and `68.jpg` independently support **all eleven tokens already printed in** `resources/liber-primus/base60-grid.json`. The six other-value readings left open by the [Dukotah July 2026 three-witness table audit](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md) are visually inconsistent with the original images. The five changed cells in the separate [pnotisdev transcription variant](https://github.com/pnotisdev/cicada3301/blob/main/work/ref/lp_master.txt), which had been called *image-audited corrections* in prior research, are also inconsistent with the same originals.

The manuscript therefore supplies an adjudicated **printed token sequence** at these eleven positions. This does not choose between base 59 and base 60 as a numeric decoder; the separate source-level radix ambiguity still applies.

## Exact original-image measurements

Zero-based row-major table cell indexes run 0–255. The table has 10 rows in `66.jpg`, 13 in `67.jpg`, and 9 in `68.jpg`. “Alternative” is the conflicting third-party reading rendered as a two-character token using the *same base-60 alphabet* so that it can be compared directly with the image. For six contested cells the alternative is the [scream314-derived decimal column](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/data/scream314_lp.md), expressed as a base-60 token. For the other five it is the independently proposed transcription variant.

| Cell | Original scan | Printed token | Alternative | Source glyph measurement, pixels | Interpretation |
| ---: | --- | :---: | :---: | --- | --- |
| **25** | 66 | `3I` | `3i` | I: **7 wide × 67 tall**, one continuous vertical strip | Lowercase i has a separated dot |
| **45** | 66 | `1l` | `1L` | l: **7 × 73** | Uppercase L is 26 pixels wide and has a foot |
| **50** | 66 | `0l` | `0L` | l: **7 × 73** | Uppercase L would be wider |
| **165** | 67 | `0I` | `0l` | I: **7 × 67** | Lowercase l is 72–73 pixels tall |
| **172** | 67 | `2S` | `2s` | S: **41 × 69** | Lowercase s is 44 pixels tall |
| **175** | 67 | `0I` | `0i` | I: **7 × 67**, continuous | Lowercase i has a separated dot |
| **182** | 67 | `2l` | `2L` | l: **7 × 72** | Uppercase L would have a broad foot |
| **199** | 68 | `0l` | `0L` | l: **7 × 73** | Uppercase L would have a broad foot |
| **215** | 68 | `1O` | `05` | O: **69 × 69** | Digit 0 is 48 pixels wide; the actual first character is visibly 1 |
| **237** | 68 | `0W` | `0w` | W: **94 × 72** | Lowercase w is 66 × 46 |
| **246** | 68 | `3I` | `3i` | I: **7 × 67**, continuous | Lowercase i has a separated dot |

The two external disagreement families therefore have different source explanations, but the same decision: for every tested cell, the original JPEG supports the existing repository token.

The original source's character shapes provide independent calibration: `2L` on `66.jpg` is 26×67; `2l` is 7×73; `2i` has two separate occupied vertical strips. In `67.jpg`, uppercase `S` is 41×69 and lowercase `s` is 28×44. In the same table typeface, uppercase `O` is 69×69 and the digit `0` is 48×69. In `68.jpg`, `0W` is 94×72 and `3w` is 66×46. These distinctions do not depend on OCR recognition or a preexisting transcription's case labels.

## Method and reproduction

[The executable original-image check](../sims/lp2_grid_11_glyph_adjudication.py) loads the three unchanged original scans, checks their dimensions, and slices each table row at its observed native geometry. It binarizes grayscale values below 90 and groups consecutive occupied pixel columns. Every selected row yields exactly sixteen groups, one for each printed character of its eight two-character tokens. For each disputed cell it inspects the **second glyph** independently of the transcribed token, measures the glyph's bounding-box width and height, and counts disconnected vertical strips to distinguish dotted `i` from capital `I`. An independently selected same-font comparison set calibrates `I/l`, `L/l`, `S/s`, `O/0`, `W/w`, and `I/i`.

The script verifies the existing source table literals at all eleven locations and asserts that the measured glyph class matches the image-visible reading. It requires Python, Pillow, and NumPy, reads the original JPEGs without altering them, and prints complete JSON with physical bounding boxes and same-image control measurements. It was successfully run on the maintainer-provided ZIP's original `66.jpg`–`68.jpg` files, with all eleven cases passing.

The analysis addresses **only these eleven publicly disputed source tokens**. Other unchallenged cells were not newly inspected. JPEG-era font rendering and the source's original rasterization are integral to the stated pixel dimensions, so applying the exact thresholds to resized or re-exported images would invalidate this measurement.

## Consequence for cryptanalysis

Five hypothetical grid-byte changes repeatedly described in earlier studies as *source-corrected* actually change correct printed glyphs into incorrect ones. Any reported plaintext candidate depending on one of those five changes needs independent source evidence, and the natural default for future key schedules is the unchanged printed-token table. Earlier negative experiments using both versions remain valid experiments on their stated inputs; their alternate-key results do not establish an alternate original byte stream.

This result removes eleven source-character uncertainties and one persistent false-correction assumption. It does **not** resolve whether the printed pairs are byte-encoded in radix 59, radix 60, or another intended numeric interpretation; it also does not imply that the resulting bytes are the cipher key. Further unknown-page inversion should begin with the actual printed tokens and require a source-motivated transformation.

# Original p55 typography-carried key channel: native-shape and spacing controls

**Status:** two source-pixel, independently controlled negatives on proposed typography-carried key material. The tests yield no unknown LP2 plaintext, key or destination. Their scope is the original unsolved physical page 55, `72.jpg`.

## Hypothesis and human solve path

The final unsolved page has only **76 GP runes** above a conspicuous tree and insect illustration. A human solver might suspect concealed information in irregular rune strokes or inter-rune distances, particularly given Cicada's established historical use of image steganography. A deliberately chosen glyph variant or additional 3-pixel inter-character gap could encode one independent bit per rune without changing the visible GP ciphertext. An actual extraction would require identifying a repeatable physical distinction, then a source-selected bit order, ideally demonstrable on solved pages.

Two **keyless necessary-condition tests** can reject overt variants before guessing binary messages:

1. Compare p55 binary glyph shapes to a separately printed original page, training on physical p43 (`60.jpg`). A genuine p55-specific alternate form should produce an unexplained shape displacement beyond ordinary rendering variability.
2. Fit a normal rune-plus-punctuation spacing model from p43's first seven physical lines, and predict p43's last five lines and the four printed lines of p55 **without refitting on p55**. A deliberate 3px spacing-mark carrier should produce measurable out-of-baseline errors.

The original JPGs and canonical `lp2-corpus.json` provide source control. No OCR, language model or fitted ciphertext key is used. On p55 the separately printed 86px-high terminal red thirteen-dot mark and large central tree are **not** counted as runes or spacing events.

## Test A: native glyph morphology

The [self-contained shape reproducer](../sims/lp2_p55_native_glyph_variants_sft.py) uses original ink thresholds and native 2400×3600 coordinates. Each source-labelled rune is isolated as a binary bitmap, normalized at its top-left bounding corner, and compared using pixel Hamming distance to every native reference image of that same GP symbol on p43. The p43 baseline excludes the query image itself (leave-one-out). Independent unrestricted nearest-template classification is a readback control.

| Measurement | p43 leave-one-out native baseline | p55 original |
|---|---:|---:|
| Correct source GP glyph readbacks | **274/274** | **76/76** |
| Median same-rune Hamming distance | 0 | 0 |
| 95th percentile | 117.05 pixels | 120.5 pixels |
| Maximum | 271 pixels | 227 pixels |
| Beyond baseline maximum | definition of control | **0/76** |

The p55 nearest-template distances lie within natural original-font variability. Differences of ~100–200 thresholded pixels between some same-rune impressions are also found among p43 glyphs. A shape-specific hidden alphabet is therefore unsupported in the particular p55-versus-p43 contrast. This cannot exclude a deliberately encoded bit within native font rasterization variants.

## Test B: original print advances and inter-rune spacing

The separate [source-kerning reproducer](../sims/lp2_p55_font_kerning_baseline_sft.py) reuses the existing physical glyph-position and typography-equation code in [`source_glyph_advance_inversion.py`](../sims/source_glyph_advance_inversion.py), extending its independently measured glyph advances to **p55 specifically**. Each gap between consecutive runes on one physical line equals the fitted width of the preceding rune, plus a fitted printed hyphen or period width where present. The model has 29 GP-rune advances and two punctuation advances, with weights fitted on the first seven lines of p43. All 72 p55 within-line gaps are then genuine out-of-sample observations.

| Data and evaluation | Rune-to-rune gaps | Spacing RMSE (original pixels) | Maximum absolute residual |
|---|---:|---:|---:|
| p43 first seven lines, training | 152 | **0.49856** | 1.375 |
| p43 final five lines, held-out native-print control | 110 | **0.72076** | 2.24305 |
| p55 four original printed lines, independent target | 72 | **0.56801** | **1.375** |
| p55 with a deliberately planted +3px on every other gap | 72 | **2.27866** | model-dependent |

The observed p55 spacing error is **smaller** than held-out native printing on p43. The alternating 3px planted test demonstrates that this operation has measurable sensitivity to a substantial regular kerning carrier; the same signal does not occur in the unaltered p55 image.

The `72.jpg` segmentation initially includes a narrow 13-dot component beside the last text line and an illustration component lower down. Exact original transcription and source-component geometry fix the genuine line lengths at **24, 22, 22, 8 = 76** runes, giving **72** gaps. Counting the red dot as a rune would invent a false carrier position.

## Cryptanalytic decision

Neither p55 glyph shape nor its inter-rune advances supplies a detected **overt second font alphabet**. Both match ordinary native printing from an independent original image. Retire these two *direct*, prominent 76-bit-carrier hypotheses absent an independent instruction identifying the small residual bit code. The tests leave microdots, deliberately chosen natural renderer phases, subtle JPEG/quantization channels, and alternative pages genuinely open.

These limited negative controls do not select a reversible LP2 cipher, authenticate a key or solve p55. Future work should target source-given byte/rune operations or genuinely anomalous original visual marks with a defined decoding rule. Generic threshold variation would merely rerun this same gate.

## Reproduction

From the repository checkout with Python 3, NumPy and Pillow, run `python sims/lp2_p55_native_glyph_variants_sft.py` and `python sims/lp2_p55_font_kerning_baseline_sft.py`. Required original input files are `resources/liber-primus/60.jpg`, `72.jpg`, `resources/liber-primus/lp2-corpus.json` and `resources/lp2-transcription.txt`. Each reproducer uses strict input counts and exact numeric assertions. The kerning test contains the source-specified planted +3px control and reports the observed and held-out residuals without refitting on p55.

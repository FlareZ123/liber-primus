# LP2 p32/p55 original glyph spacing: a fixed-font explanation

**18 November 2026, Agent24. Scope:** a new, narrowly falsifiable original-image check on the two illustrated pages already linked by a strong tree-silhouette correspondence. **Result:** all measured original text advances fit ordinary fixed glyph metrics and printed spacing to within one source pixel. No spacing-derived key, unknown LP2 plaintext, or decipherment operation has been recovered.

## Why check this pair?

Original physical **p32** (2014 LP2 image `49.jpg`, 121 runes) carries a blurred tree; **p55** (`72.jpg`, 76 runes) carries a detailed but pale drawing strongly related to that tree. Their specific visual relationship is documented in [the existing original tree report](lp2-p32-p55-blurred-tree-correspondence.md). A hidden spatial code could plausibly survive ordinary GP29 transcription, which records rune identities and text boundaries but not actual interletter spacing. Prior all-29 glyph-**shape** work expressly left placement out of its scope ([shape gate](lp2-allglyph-original-source-form-gate.md)). The cheapest direct test is whether individual rune advances are anomalous when conditioned on the printed glyph identity and word punctuation.

## Exact image-derived input and reversible source registration

Original source originals: `resources/liber-primus/49.jpg`, `72.jpg`; canonical transcript `resources/lp2-transcription.txt` blocks32 and54. Physical p50 is a runeless numerical table and therefore shifts transcript block numbers. The [single-file source reproducer](../sims/lp2_p32_p55_glyph_spacing_original_sft.py) freezes the six/four literal rune lines and checks each against the repository transcription before examining pixels.

At original **2400×3600** resolution, grayscale threshold 140, connected components with a bounded ordinary-rune font size (60–124px high, 7–94px wide) and unambiguous source text region `600<=x<1830,500<=y<1800` recover **121 components in six rows** on p32 and **76 in four rows** on p55. Every row count agrees exactly with its independent canonical rune line; no synthetic OCR runes or edited ciphertext are admitted. This yields **187 adjacent within-line horizontal starts**, excluding line jumps. The only glyph labels used are the original GP29 rune identities, not proposed plaintext.

## Fixed-font model and original measurement

Let `dx` be the horizontal advance between consecutive source glyph components on the *same printed row*. The simple model is

`dx = glyph_advance[previous_rune] + 16*(printed hyphen) + 48*(printed full stop) + raster_rounding_error`.

The 29 glyph-specific advances are estimated once by rounding each class's median `dx` after the visible punctuation allowances. In canonical GP order F,U,TH,O,R,C,G,W,H,N,I,J,EO,P,X,S,T,B,E,M,L,NG,OE,D,A,AE,Y,IA,EA they are:

`[38,57,37,38,39,54,49,38,50,38,15,50,45,55,67,39,53,39,60,60,37,55,49,60,38,39,57,57,89]` source pixels.

The **entire original residual histogram** is:

| Model error, px | Number of original advances |
| ---: | ---: |
| −1 | 21 |
| 0 | 125 |
| +1 | 41 |
| Absolute error >=2 | **0** |
| Total | **187** |

An ordinary printed sentence stop induces a visibly larger x advance than a normal word separator. Modeling both as the same gap creates a false apparent ~51px outlier; the true period class needs its distinct 48px allowance.

**Held-out physical-page calibration.** Learn glyph advances from p55 only, then predict p32: **98/103** of the covered p32 advances are within1px, all103 within2px; **12 of p32's 115** steps have a preceding glyph class never observed in p55 and cannot be predicted by that one-page dictionary. Reverse the holdout: learn from p32 and predict p55, covering **72/72**, of which **68/72** are within1px, all72 within2px. These checks distinguish shared font geometry from exact individual-line fitting. A planted **+4px** advance at one original p55 site produces an unchanged-model residual >=3px and is detected by the same diagnostic.

## Decipherment decision and limits

For **these exact 187 source sites**, the observed pattern is consistent with normal 2014 vector-font rasterization; there is no residual requiring a deliberate multi-pixel spacing mark. The test does **not** rule out intentionally modulating subpixel layout, accumulating spacings across longer lines, unusual red glyphs, different pages or nonspatial cipher layers. The 16/48 pixel allowances are inferred from the prints; the present result is an *original-image consistency check* and does not authenticate a writer's method or exclude every covert encoding.

**Causal consequence:** the recognizable p32/p55 tree relationship supplies an original-human reason to compare these pages, but their ordinary runic **horizontal** positions do not yield an independently selectable secret table or traversal. Pursue tree-linked plaintext recovery only if a new instruction provides a physically meaningful readout, instead of tuning pixel-gap thresholds or recasting the ordinary font widths as a cipher key.

**Reproduction:** [`sims/lp2_p32_p55_glyph_spacing_original_sft.py`](../sims/lp2_p32_p55_glyph_spacing_original_sft.py), requires Python 3 with `numpy` and `opencv-python`, reads the repository's two unchanged original JPEGs and transcription, reports all 187 original residuals, both cross-page holdouts and the planted spacing positive. The same algebra was run locally on the exact original 2014-page images from the uploaded 75-JPEG archive; source-transcription identity was additionally checked against the live GitHub file.

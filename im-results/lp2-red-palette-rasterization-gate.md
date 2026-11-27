# LP2 within-red palette / rasterization gate (#3121)

**Decision: retire a visibly distinct second red foreground palette as an actionable LP2 state channel, within this test's resolution.** Native JPEG colors are tightly compatible with a single nominal RGB (192,0,0) foreground; block phase and stroke geometry reproduce the variation. No authenticated second class, bitstream, key or unknown plaintext was recovered. This is not a proof about arbitrary microscopic or deliberately JPEG-coefficient-encoded signals.

## Source and receiver criterion

Analyzed the supplied original 58 JPEGs, physical p0–57 = archive 17–74, not re-exported crops. The expected 225 red rune inventory comes from [ink annotations](../resources/liber-primus/lp2-ink-annotations.json), with the p0 red13 physical override. The source-visible hypothetical receiver requires a low-cardinality color class that remains separated under stroke/phase/background variation and holds across pages, including known p56/p57. No ciphertext or plaintext score was used. A visible two-palette channel should survive color differences substantially larger than ordinary JPEG variation.

## Experiment

The native RGB segmentation uses R-G>65, R-B>65, G/B<160; 8-connected components; ordinary glyphs 100–125px high, <=100px wide and >=400px area; oversized components >125px and >=400px; dot candidates 6–14px in each dimension and >=40px area. Core pixels are >=4px from mask boundary (OpenCV L2 distance), edge pixels <=2px. Record core RGB medians/modes, edge RGB medians, fully foreground 8x8 aligned block medians, local parchment RGB, stroke size/fill, and block phase. Full 8x8 blocks avoid luma edge mixing, but **not necessarily chroma mixing**, since native sampling is 4:2:0. All red-bearing pages use the same quantization table hash (7ae93ffa20b2; 35/58 pages total; other 23 have 79daa5232976). Neither qtable is a second color selector.

On the 15 red-rune pages, 224 components cover the 225 annotated rune positions (p33 second red span contains one merged pair at x=992,y=1914,w=98,h=114); exact-count pages are aligned to the red-rune sequence by line and x. The merged p33 page is excluded from same-glyph identity comparisons, not color summaries. Oversized initials may include decorative flourishes. The 492 dot components include ordinary separators, not solely large punctuation dots. They are treated as a separate small-geometry class. Red numerals and non-dot detached fragments outside the stated geometric criteria are not assigned glyph identities.

| Class | Components | Core median R range | Edge median R range |
|---|---:|---:|---:|
| Unknown-page ordinary rune components | 199 | 190–193 | 157–169 |
| Solved p56/p57 ordinary runes | 10 | 192–192 | 161–167 |
| Oversized initial components (includes solved controls) | 15 | 192–192 | 158–166 |
| Small dot components | 492 | 185–196.5 | 144–166 |

Of 209 ordinary components, 161 have median RGB exactly (192,0,0); all have median R 190–193 and median G 0–1, B 0–4. All 15 oversized components have median RGB exactly (192,0,0), both on the >=4px core and the aligned full-block subset. Of 173 ordinary components with full 8x8 foreground blocks, 125 have exact (192,0,0) median; others remain R190–193, G0–0.5, B0–2. All 10 solved ordinary components have exact (192,0,0) core median. Edge medians vary within repeated identical rune labels, e.g. C/ᚳ 159–168 across eight pages, while its core R is always 192. The leave-one-page-out random forest using only bounding dimensions, fill, core fraction, x/y mod8 and local parchment RGB reduces ordinary edge-R MAE from 2.328 (training-fold median) to 1.941. This modest predictive improvement is not a claim to explain every edge residual.

## Matched synthetic control: distinguish palette from JPEG phase

Using the p0 original quantizers, native 4:2:0 sampling, and fixed parchment (218,207,183), render 10x10 dot, 9x114 stem, and 27x114 wide stroke with uniform RGB (R,0,0). Encode all 256 x/y offsets modulo 16 for each shape and each R=176,192,208 (2,304 JPEG controls). Apply the same mask/core/edge rule. The two alternative colors are planted discrimination controls, not proposed historical palettes.

| Shape | R176 core range | R192 core range | R208 core range | R192 edge range |
|---|---:|---:|---:|---:|
| Dot | 172–180 | 185.5–196 | 202.5–213.5 | 146–166 |
| Narrow stem | 175–179 | 190–193 | 206–208 | 158–166.5 |
| Wide stroke | 176–176 | 192–192 | 208–208 | 159–167.5 |

Thus the entire observed ordinary core R range and nearly all dot core/edge spread arise from a *single* nominal color with JPEG phase alone, without any ciphertext-dependent labels. The simple synthetic rectangles are not pixel-exact historical glyphs; small differences at dot tails (185 vs 185.5,196.5 vs196) and ordinary edges are unsurprising. All 768 phase/shape samples per foreground level are separated in median core R from the other two levels; a fixed >200 or <184 test would distinguish these large intensity shifts without fitting the original ciphertext. Original ordinary runes and initials show none of these planted-class intensities. The solved controls match the common palette. Small nominal foreground differences of a few RGB levels, a separate color channel encoded in DCT coefficients, and arbitrary shape-specific signals are outside the exclusion; no independent source evidence selects those.

## Disposition and reproducibility

The observed 190/192 core split and wider edge/dot fluctuations are not robust independent evidence of a source-selected second ink class. Do not derive binary masks from these small differences or tune thresholds for language. Keep the existing explicit red/black annotation as the usable source feature. No change to the authoritative unknown-plaintext frontier.

Run [sims/lp2_red_palette_gate.py](../sims/lp2_red_palette_gate.py) with the source directory or supplied ZIP; JSON includes component coordinates and values, repeated glyph summaries, grouped holdout error and all phase-control histograms. Executed the extraction and synthetic-control cores locally against the maintainer ZIP; the merged repository wrapper is a consolidation of the two executed scripts (not separately run in CI). The code and finite scope are preserved for independent reproduction.

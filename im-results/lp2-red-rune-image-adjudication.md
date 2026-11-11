# Original red-rune image adjudication: page 53 and seven shifted spans

**11 November 2026. Source-input correction; no recovered unknown LP2 plaintext, key, or cipher.**

## Seven systematic red-span registration defects

The earlier full-source image audit reported 79 p43-template mismatch flags among 213 annotated red rune positions. Original scans **20.jpg, 32.jpg, 44.jpg, 50.jpg, 56.jpg and 71.jpg** show seven spans where the classifier **omitted an oversized leading red rune** and instead counted a narrow part of the trailing **13-dot red punctuation** as final letter I. Every intervening ordinary red rune is therefore classified under the previous source offset.

| LP2 page | Starting rune offset | Span length | Raw mismatches | Re-aligned interior matches |
| --- | ---: | ---: | ---: | ---: |
| p3 | 0 | 16 | 16 | 15/15 |
| p3 | 119 | 3 | 3 | 2/2 |
| p15 | 9 | 11 | 11 | 10/10 |
| p27 | 0 | 19 | 18 | 18/18 |
| p33 | 91 | 8 | 8 | 7/7 |
| p39 | 119 | 3 | 3 | 2/2 |
| p54 | 0 | 9 | 9 | 8/8 |
| **Total** | | **69** | **68/79** | **62/62** |

The last pseudo-rune in each shifted span is predicted I and its assigned original-image box is only **9–10 px wide**, physically part of the printed red 13-dot mark. The oversized leading red symbol is visibly present *left of the first box the previous model assigned*. Original red-pixel density in this missed region exceeds 1,000 pixels in every case. The model's 68 raw failures therefore measure **source-position registration drift**, not 68 disputed transcribed letters. The re-alignment does not establish any plaintext or cipher.

**Residual 11 raw flags:** p0 offsets **0, 8–12**, p6 **71**, p8 **0**, p23 **0**, p33 **0**, p40 **0**. The original scans show oversized or unusual red first forms on these pages, and p0 has tightly packed terminal glyphs next to its red dotted marker. These eleven flags require focused visual component-boundary adjudication, not general template tuning.

## Page 53: complete 51-glyph source reading

Direct high-resolution inspection of original **70.jpg** supports the *unchanged* canonical red passage at p53:128–178. Every glyph appears in the expected position; there is no independently justified rune correction. The source-row split and complete transliteration are:

| Native image row | Page-local rune offsets | Full-size image rectangle | Canonical glyph reading |
| --- | --- | --- | --- |
| Printed line 5 | 128 | x1720–1769, y1650–1743 | T |
| Printed line 6 | 129–152 | x601–1724, y1874–1967 | P W EO S W B EO TH N H G J R IA D IA TH A I EO AE X L EO |
| Printed line 7 | 153–174 | x601–1778, y2062–2154 | EA IA A J H R TH P D J NG O G F EO M C H D O T C |
| Printed line 8 | 175–178 | x617–817, y2250–2347 | U R P N |

Individual position boxes are preserved in the existing [machine-readable source audit](lp2-full-source-rune-assignment-audit.json), under red_positions for page 53. Its black-trained p43 comparison gives 51/51 canonical class predictions here, but the red domain must be evaluated separately. Independently, normalized *native p53 red-pixel silhouettes* under at most two-pixel shifts give **40/40 correct leave-one-out nearest same-class readings** among the 40 glyph instances belonging to repeated classes; the remaining **11 singletons** were visually inspected. The 51 glyphs cover 26 GP classes. Shape concordance helps validate their reading but is not an additional encoded message.

The **12 known solved red runes** on original p56/p57 (73.jpg/74.jpg) provide a visual check: the source-known p56 heading AE J OE S R and p57 heading P A R A B L E both contain enlarged initial forms and legible small red letters. The earlier cross-style 0/12 classification is unsuitable as an error rate for manual native-red reading.

## Reproduction and decision

Run [the standalone original-image SFT](../sims/lp2_red_span_source_adjudication_sft.py). It checks the frozen audit JSON, seven span shifts and original-image leading red pixels, verifies that the seven terminal pseudo-runes occupy narrow punctuation components, and repeats the p53 native-red shape test. The test uses no language scoring or new cipher hypothesis.

**Keep the 51-runic p53 transcription unchanged. Reclassify 68 of the 79 red flags as classifier-source misregistration.** Prioritize the eleven residual native-image boundaries before changing any other derived ciphertext. Preserve 79 as an historical raw-model counter, not the count of unresolved rune readings. No plaintext, key or destination is recovered here.

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

**Second original-image correction: the remaining 11 raw mismatch flags are also accounted for morphologically.** On p0, original **17.jpg** shows that the detector's position-8 bounding rectangle x1134–1233 (99 px) contains **two visually distinct adjacent runes**, the source's S followed by Y. Its erroneous class C is a forced one-class result for a two-class component. Detector outputs at positions **9–11** are E, NG, C, agreeing exactly (3/3) with source labels at positions **10–12**; the last predicted I at position **12** is only **10 px wide** (x1419–1429) and is visibly the trailing red **13-dot punctuation**, not a rune. This explains all **five p0:8–12** red flags with a concrete image segmentation and +1 alignment error. Source red ink pixel counts in the joined p0 component and dotted fragment are **3,556 and 430**, respectively (native source boxes, color threshold in SFT).

The **other six raw flags** are *visually oversized, special-font red initials* on p0:0, p6:71, p8:0, p23:0, p33:0 and p40:0. Each has a source-visible decorative enlarged shape compared with ordinary black p43 templates; adjacent ordinary red runes match the source's expected classes (p0 positions1–7 and all later glyphs of those five other initial-span headings). A black-font nearest-template mislabel of an ornate initial supplies no independent alternate rune reading. Source-image crops justify **retaining the canonical readings** while marking these six glyphs as stylized forms rather than claiming six independently re-deciphered GP classes.

**Final classification of all 79 original machine flags:** **68** from seven skipped-initial and false-punctuation registrations; **5** from the joined p0 S/Y component and the next skipped position; **6** from original oversized decorative initials. Total **79/79** explained by source-visible audit limitations, with **65/65** source-class matches after the eight shifted interior registrations (62+3). These are diagnostic classifications, not proof that red ink contains no further steganographic channel; none supports changing a rune.

## Page 53: complete 51-glyph source reading

Direct high-resolution inspection of original **70.jpg** supports the *unchanged* canonical red passage at p53:128–178. Every glyph appears in the expected position; there is no independently justified rune correction. The source-row split and complete transliteration are:

| Native image row | Page-local rune offsets | Full-size image rectangle | Canonical glyph reading |
| --- | --- | --- | --- |
| Printed line 5 | 128 | x1720–1769, y1650–1743 | T |
| Printed line 6 | 129–152 | x601–1724, y1874–1967 | P W EO S W B EO TH N H G J R IA D IA TH A I EO AE X L EO |
| Printed line 7 | 153–174 | x601–1778, y2062–2154 | EA IA A J H R TH P D J NG O G F EO M C H D O T C |
| Printed line 8 | 175–178 | x617–817, y2250–2347 | U R P N |

Individual position boxes are preserved in the existing [machine-readable source audit](lp2-full-source-rune-assignment-audit.json), under red_positions for page 53. Its black-trained p43 comparison gives 51/51 canonical class predictions here, but the red domain must be evaluated separately. Independently, normalized *native p53 red-pixel silhouettes* under at most two-pixel shifts give **40/40 correct leave-one-out nearest same-class readings** among the 40 glyph instances belonging to repeated classes; the remaining **11 singletons** were visually inspected. The 51 glyphs cover 26 GP classes. Shape concordance helps validate their reading but is not an additional encoded message.

**Solved-red control correction (independent ground truth):** The p56 heading AE J OE S R was misregistered as observed J OE S R I; the p57 heading P A R A B L E as A R A B L E I. Both original JPEGs visibly omit their oversized first red rune from the old component positions and end by misclassifying a thin 13-dot marker fragment as I. Thus the published red 0/12 source-control result was **a position-registration error**. Source-shifting the ten ordinary glyphs gives **10/10 correct** existing black-template class predictions. The earlier red-only 12-sample training labels were therefore wrong, invalidating its earlier 1/4 and 3/59 accuracy as red-alphabet evidence.

**Independent original-red transfer:** Train only on those ten correctly registered ordinary solved-red glyphs, spanning eight GP classes (J, OE, S, R, A, B, L, E), and hold out all unknown red glyphs. Fix red pixels as R>80, R>1.45G, R>1.45B, tightly crop and resize with Pillow BOX to 50x50, and rank red silhouettes by IoU over translations within two pixels. First apply the eight *original-image* registration repairs already documented above, omitting their fake punctuation fragments, the one joined p0 glyph component and the six oversized artistic initials. Among **41 original unknown-page glyphs** from eleven different physical pages with one of these eight source-known classes, **40/41** match their independently solved red prototype, including **11/11 on p53**. The sole misclassification is p15:14, visibly a B but marginally nearest solved R (IoU 0.6819 versus solved B 0.6024) due to print proportions. The original p43 black-template prediction there is B. This is a class-heldout validation of those 41 glyphs, without plaintext scoring or reassigning any rune. [Original-image SFT](../sims/lp2_red_solved_control_alignment_sft.py). Red glyphs not represented by the eight solved classes remain outside this particular independent check.

## Reproduction and decision

Run [the standalone original-image SFT](../sims/lp2_red_span_source_adjudication_sft.py). It checks the frozen audit JSON, seven span shifts and original-image leading red pixels, verifies that the seven terminal pseudo-runes occupy narrow punctuation components, and repeats the p53 native-red shape test. The test uses no language scoring or new cipher hypothesis.

**Keep the 51-runic p53 transcription unchanged. All 79 red nearest-template mismatch flags now have source-visible registration or decorative-glyph explanations (73 structural, six stylistic).** Retire the raw disagreement count as evidence of incorrect red rune text. Further research should seek an independently readable second channel or source-selected decryption method. Preserve 79 only as the former algorithm's output count. No plaintext, key or destination is recovered here.

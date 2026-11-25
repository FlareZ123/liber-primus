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

## Physical red/black registration and RGB-plane displacement (Agent37, 25 November, #2848)

This is a separate measurement of source geometry, not a reclassification of the 79 historical rune-assignment flags. A physically shifted red layer could supply a second state only if a common black reference or internal color-plane alignment gave an independent coordinate. We tested both where observable, using the original 75 JPEGs without re-encoding.

### Same-line physical placement

Reuse the p56-only fixed ordinary-glyph receiver from [the direction-channel study](lp2-allograph-full-source-controlled-split.md#explicit-rotation-and-reflection-receiver-agent37-25-november-2852). The candidate geometry and upright score ≥0.90 were determined before RGB classification. Label a grayscale ink pixel red if R−G>50, R−B>35 and G<180; classify a component red when ≥80% of ink pixels satisfy that rule, black when ≤5%. Group glyph tops by consecutive gaps ≤30 pixels. Where ≥4 ordinary black glyphs share a line, use their median top and bottom coordinates as two independent vertical references. No glyph identity, word order or desired plaintext enters this registration decision.

| Scope | All admitted red glyphs | Red with black reference | Exactly zero top and bottom residual | Maximum absolute top/bottom residual |
|---|---:|---:|---:|---:|
| Solved LP1 | 147 | 126 | 85 | 2 / 2 px |
| Unknown LP2 p0–55 | 198 | 107 | 74 | 2 / 2 px |
| Solved LP2 p56–57 | 10 | 10 | 7 | 1 / 0 px |

All 107 measured unknown red glyphs lie in the ordinary black-reference envelope. No residual class requires an extra layer displacement. The 198 ordinary red candidates are not the full annotated red position count: oversized, touching and other rejected glyphs are not silently included. There are 91 red candidates on lines with fewer than four admitted black controls. In particular, p7's isolated caption top y=2458 follows its preceding ordinary line at median y=2214; p53's red-only line minima y=1874,2062,2250 follow its last mixed line at y=1650 (224-pixel paragraph gap then 188-pixel normal line advances). p27's heading begins at y=917 before the first well-populated black line at y=1105. These are layout observations, not independent same-line alignment measurements; p15's standalone rubric above the numeric square has no local ordinary black reference. p36, p38 and p49 supply no admitted ordinary red GP glyphs under this filter; other red components are included in the whole-image test below. Page skew is already bounded by the direction-channel study (zero page median, maximum estimated line slope 0.104174°).

A common whole-red horizontal translation cannot be determined from disjoint proportional-width text without an independent common x-anchor. The test does not convert line indentation, heading placement, or paragraph gaps into a guessed state alphabet. No such source-fixed independent horizontal origin was identified.

### Whole-image color-plane registration

Independently of the rune receiver, extract every connected red mask component of area ≥5 pixels using the same chroma threshold over the **entire original image**, including punctuation, grid numerals, oversized initials and art. Match to the grayscale<160 connected component having maximum exact overlap. The observable is intersection-over-union (IoU) and signed centroid displacement in original pixels. An explicit 1-pixel displacement gate requires IoU≥0.90 and both centroid differences within 0.5px; a low-IoU component is flagged for manual adjudication, never interpreted as a key.

| Source | Red components | IoU≥0.90 | Minimum admitted IoU | Max abs dx | Max abs dy |
|---|---:|---:|---:|---:|---:|
| LP1 | 556 | 552 | 0.966667 | 0.102273 | 0.342677 |
| Unknown LP2 | 645 | 645 | 0.954577 | 0.141998 | 0.348662 |
| Solved LP2 | 85 | 85 | 0.999425 | 0.010399 | 0.020695 |

Four LP1 red oversized initials have their grayscale component merged into a much larger dark region and are rejected by the IoU gate; no unknown LP2 component is rejected. All 645 unknown-page red elements have a congruent dark-ink component. The largest unknown vertical residual is −0.348662px on p37 at x605,y694,w60,h94 (IoU .974020); the largest horizontal residual is −0.141998px on the same page at x601,y2569,w69,h96 (IoU .981589). These remain subpixel and comparable to the 0.342677px largest LP1 vertical residual. In the independent ordinary isolated-glyph subset, 106 unknown red crops have chroma/luma IoU≥.9992278, maximum abs dx .010247px, maximum abs dy .043479px. The same exact small displacement occurs in repeated EO glyphs at p27 (1324,918), p33 (1096,1915) and twice in p53 (872,1875 and 1479,1875); it does not supply distinct chapter states.

The 85 matched held-out solved p56/p57 red components each receive four independent artificial one-pixel chroma-only translations (±x, ±y), leaving their real grayscale masks fixed. The receiver flags **340/340** and recovers all 340 original component matches and exact applied offsets relative to their unshifted measurements. This positive control verifies sensitivity to mask-level integer chroma displacement; it does not simulate JPEG re-encoding or establish how color was composed historically.

### Reproduction and route decision

Run the [ordinary baseline receiver](../sims/lp2_red_baseline_registration.py) using the coordinate JSON produced by [the direction receiver](../sims/lp2_orientation_original_gate.py), and independently run [the complete color-component receiver](../sims/lp2_red_component_registration.py) directly on the original ZIP:

```bash
python sims/lp2_orientation_original_gate.py liber-primus-jpegs.zip orientation.json
python sims/lp2_red_baseline_registration.py liber-primus-jpegs.zip orientation.json registration.json
python sims/lp2_red_component_registration.py liber-primus-jpegs.zip components.json
```

The local OpenCV 4.13.0 runs completed on the original files; no CI claim. The two JSON outputs regenerate the per-coordinate registration records, including all 1,286 complete color-component matches/rejections and the plant outcomes. This result closes the explicit vertical same-line displacement and integer chroma/luma registration channel, not every possible horizontal or subpixel steganographic encoding. No authentic state alphabet, reversible decoder, plaintext or key is obtained. Reopen only for an independently source-selected alignment reference and readout; the ordinary red glyph and punctuation identities remain unchanged.

## Reproduction and decision

Run [the standalone original-image SFT](../sims/lp2_red_span_source_adjudication_sft.py). It checks the frozen audit JSON, seven span shifts and original-image leading red pixels, verifies that the seven terminal pseudo-runes occupy narrow punctuation components, and repeats the p53 native-red shape test. The test uses no language scoring or new cipher hypothesis.

**Keep the 51-runic p53 transcription unchanged. All 79 red nearest-template mismatch flags now have source-visible registration or decorative-glyph explanations (73 structural, six stylistic).** Retire the raw disagreement count as evidence of incorrect red rune text. The explicit physical registration test above finds no ordinary vertical or integer RGB-plane displacement channel. Further research should seek an independently readable second channel or source-selected decryption method. Preserve 79 only as the former algorithm's output count. No plaintext, key or destination is recovered here.

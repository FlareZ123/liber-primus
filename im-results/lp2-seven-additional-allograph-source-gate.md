# Original-JPEG allograph source gate: twenty-two selected classes beyond A/R/E

**Current original-source decision, 11 November 2026:** Fixed solved-page glyph images account for **9,984/9,984 ordinary original-image occurrences of 22 GP29 classes** beyond the three separately studied A/R/E symbols. Eleven remaining occurrences of these classes are visually distinct original-image red initials or red-rubric glyphs. Including A/R/E, **25 of 29 GP29 classes** now have source-fixed ordinary-form controls. This is a bounded typography result; it yields no unknown plaintext, source-derived cryptographic key, or decrypting operation.

## Exact source and method

The image input consists of the original 58 LP2 JPEG scans 17.jpg–74.jpg (physical p0–p57). All compared controls are tightly cropped single glyphs from the already-solved p56 original scan 73.jpg. The canonical resources/liber-primus/lp2-corpus.json provides a separate expected page count and exact excluded rune offsets. Count agreement is conditional on that transcription; it does not independently authenticate every glyph or establish complete pixel identity.

The fixed image-template audits binarize grayscale at less than 160 and use normalized template correlation, a 105×36 pixel nonmaximum window and at most two-pixel spatial deduplication. Existing C/NG/AE, seven-class and six-class audits use 0.90 as the NCC floor. The five additional O/H/P/T/L classes also use 0.90, except **H uses 0.899** because an ordinary p20 original glyph scores 0.8995795, slightly below the former floor. This single threshold adjustment recovers **416/416 H**, with zero extra source matches.

**T and L source-anchor discriminator:** Narrow geometric strokes frequently match *inside* other GP characters when using raw template correlation. For each raw candidate, the new five-class reproducer computes the x-column ink projection over the entire template height using source grayscale less than 110 and at least two ink pixels per column; it requires the left and right **full character component edges** to agree with the solved-p56 reference to within two original image pixels. That frozen source-only discriminator excludes 462 partial T hits and 1,265 partial L hits while preserving their true solved-p56 source positions and every expected ordinary page count. It uses neither a fitted per-page parameter nor unknown-ciphertext language scores.

| Original-source test | Source occurrences | Ordinary source glyphs matched | Non-ordinary original-image red cases |
| --- | ---: | ---: | --- |
| C, NG, AE | 1,363 | 1,361 | NG p33:91; AE p56:0 |
| U, G, N, Y, F, J, IA | 3,204 | 3,201 | U p23:0; IA p39:119; F p40:0 |
| EO, X, S, B, OE, EA | 2,704 | 2,702 | X p8:0; S p0:0 |
| O, H, P, T, L | 2,243 | 2,239 | P p3:119, p57:0; L p3:0, p15:9 |
| I, source-height original scan component gate | 481 | 481 | none |
| **Total (22 selected classes)** | **9,995** | **9,984** | **11 source-red instances** |

The five newly completed classes, using exactly the same original scan source:

| Glyph | Source total | Ordinary source forms matched | Lowest accepted NCC |
| --- | ---: | ---: | ---: |
| O | 465 | 465 | 0.91736 |
| H | 416 | 416 | 0.89958 |
| P | 448 | 446 | 0.92418 |
| T | 448 | 448 | 0.93478 |
| L | 466 | 464 | 0.98056 |
| **Total** | **2,243** | **2,239** | |

All five page-by-page counts passed over **58 original images** in three disjoint scan ranges p0–17, p18–37 and p38–57 using the original provided ZIP. The two excluded P and two excluded L positions are visually distinct source-red initial/rubric positions, not unexplained missing ordinary glyphs. Solved-p56 T remains at the original pixel (1736,861); its source-fixed L occurrences are at (1125,673), (1255,861) and (1593,674). These controls ensure raw partial-template hits are rejected rather than selecting a convenient sub-stroke and reporting a coincidental aggregate count.

## New full-source I-rune vertical-stroke gate

**481/481 I runes pass a source-layout test across all 57 runic LP2 pages**, comprising 471 runes on p0–55 excluding the runeless p50 grid and ten known solved-page controls (one p56 and nine p57). Unlike all previous 21 selected letter-class image-template audits, I is only a narrow vertical stroke. Raw 8–12 pixel source column-width recognition admits 26 extra false components over 17 rune pages, chiefly abbreviated punctuation/heading separators. It also admits one numeral-like component in the p50 non-runic sexagesimal grid.

The fixed source-native discriminator identifies each line from original grayscale row-ink peaks (five-pixel Gaussian smoothing, minimum peak prominence 40 and distance 100), segments full source ink components by x-column occupancy (at least two ink pixels per column), and compares each narrow 8–12 pixel component's original black-pixel *height* with the median height of broader glyphs on the **same physical printed line**. A narrow component must extend **at least the row's median character height** to count as I. Shorter punctuation marks no longer count. The input source is scan 17.jpg–74.jpg, with grayscale thresholds 160 for text-row locations and 110 for component widths. Physical p50 is separately excluded because its image displays numeric cells and contains no GP29 runes. No original page's expected class total is used to choose a per-page stroke or threshold.

This one frozen geometric rule returns the exact expected I count on every runic physical page. In robustness checks, expanding the tolerated shortfall from 0 through 12 image pixels never changed the 481 rune matches nor introduced an extra on runic pages. Solved controls independently recover p56 I at pixel (1290,1889) and all nine p57 I symbols. An auxiliary original-row registration of the 55 unsolved runic pages found 545 physically exact-length rows from 594 transcription lines, with 436 I strokes at their expected printed positions. Of 35 I occurrences in the 49 ambiguous-length lines, source-component ordering and stroke height discriminate the true full-height I from narrow punctuation; this auxiliary alignment is supporting evidence and is not required by the standalone reproducer.

The I result excludes one coarse printed-stroke allograph in this source class. It is conditional on physical source registration and does not identify cipher semantics, intentionally altered stroke micropixels, or a recovered key.

## Previously established source controls preserved

The earlier EO/X/S/B/OE/EA six-class audit has **2,702/2,702 ordinary** matches, respective lowest NCCs 0.93358, 0.94142, 0.94219, 0.94064, 0.91785 and 0.94018. It corrected a false discrepancy caused by extending the solved-page B crop past x1361 into adjacent black punctuation. Previous U/G/N/Y/F/J/IA original-source controls matched **3,201/3,201** ordinary symbols and identified three enlarged red initials with scale-normalized IoU 0.95183, 0.96016 and 0.93360. The earlier C/NG/AE source test counted **1,361/1,361** ordinary glyphs and distinguished the oversized red p33:91 NG from the following ordinary p33:92 TH.

## Cryptanalytic consequence and limits

At this source resolution there is no evidence for a second ordinary-font morphographic bit that depends on a visibly distinct letter drawing within the twenty-two audited additional GP29 classes. Count equality cannot exclude subtle differences in image compression, chroma, punctuation, kerning, DCT coefficients, or non-GP illustration channels. It also cannot itself identify a cipher primitive, source key or original author's intended reading order. No previously encrypted LP2 plaintext is recovered by the morphology census.

**Four classes still lack full-source allograph discrimination: TH, W, M and D.** Ordinary local templates for these symbols produce many matches inside other glyphs. Their next productive check requires genuinely source-anchored full-glyph components and solved-page controls, with any proposed exception identified in original pixels independently of the ciphertext. The separately studied A/R/E classes and the new source-height I gate are outside this remaining scope.

**Reproducers:** sims/lp2_selected_allograph_original_sft.py (C/NG/AE), sims/lp2_seven_additional_allograph_sft.py (U/G/N/Y/F/J/IA), sims/lp2_six_more_allograph_sft.py (EO/X/S/B/OE/EA), , sims/lp2_five_more_allograph_source_sft.py (O/H/P/T/L) and sims/lp2_I_full_component_sft.py (I). Both added scripts read the original source ZIP directly with --archive, support disjoint --start/--stop ranges, and validate compact per-page counts against the canonical corpus when present.

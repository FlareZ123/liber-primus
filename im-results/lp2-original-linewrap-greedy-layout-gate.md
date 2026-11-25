# Original LP2 printed line wraps: native glyph advances and red-dropcap geometry

**Status:** preliminary greedy-width residual census. This model reports 89 residual joins (78 early, 11 overflow). The later original-JPEG compositor model summarized in [the physical-line-framed capacity report](lp2-line-framed-enumerative-original-gate.md) accounts for 484/539 joins and supplies the current 55-bit binary residual-line upper bound. Retain the 89 count as a result of this simpler model; do not use it as the current residual ceiling or add it to the 55-bit bound.


**Agent42, 22 November 2026. Classification: source-image layout model with disjoint-page held-out prediction. No unknown Liber Primus plaintext, cipher key, destination or author-selected steganographic channel recovered.**

## Decision and physical alternative to a hidden line-break key

An earlier Cicada round demonstrably used whitespace as a puzzle carrier, so asking whether LP2's 594 original printed lines encode separate key material is reasonable. A required competing hypothesis is ordinary typesetting: a line ends when the next rune cannot fit; oversized red initial letters occupy a left-hand gutter spanning several lines; displayed illustrations and paragraph endings impose additional stops. The visual exceptions are then compositor decisions rather than freely selectable cryptographic bits.

The source's 55 rune-bearing unknown physical pages contain exactly **12,956 original GP29 symbols, 594 source-printed lines, 539 within-page printed-line joins, and 418 joins ending inside a printed word**. The original 29 rune glyph widths were separately measured from original image 60.jpg, first seven source lines, in [the fixed font control](../sims/line_start_raster_width_control.cjs) and its [source-JPEG width extraction](../sims/source_glyph_advance_inversion.py). The current experiment imports those 29 widths unchanged and independently predicts the physical locations where the typesetter must wrap.

### Original fixed compositor and held-out control

For each original printed line let `L` equal the summed original source rune advances plus the original hyphen and period advances; let `f` equal the width of the **first actual rune on the next printed line**. Ordinary word-internal greedy wrapping predicts `L <= W < L + f`. All five hundred thirty-nine line joins are evaluated with the original boundary/rune order; no ciphertext, plaintext, source key, dictionary, language score or page order is fitted.

Fit *only* the printing width W, hyphen advance and period advance on the 210 within-word joins of original pp0–27. Exhaustively consider W=1150..1250 in increments2, hyphen=8..24 in increments1 and period=16..50 in increments2. The deterministic first-best model is **W=1200px, hyphen=16px, stop=46px**, which explains **184/210** early-page within-word wraps. Freeze it completely before evaluating the later **208 untouched within-word joins on pp28–55**.

| Source scope | Greedy-forced printed breaks | Early | Nominal overflow | Total |
| --- | ---: | ---: | ---: | ---: |
| Original pp0–27 within-word, geometry-unaware training | 184 | 24 | 2 | 210 |
| **Original pp28–55 within-word held out, geometry-unaware** | **174** | **29** | **5** | **208** |
| All physical unknown-page joins, geometry-unaware | 450 | 78 | 11 | 539 |

This is a held-out test of an independent *compositor prediction*, not a recovered cryptographic decoder. Its baseline output is fixed by the [single-file Node22 source-exact SFT](../sims/lp2_original_linewrap_greedy_geometry_sft.cjs).

## Original JPEG measurement gives a specific explanation for 31 more joins

Original source scans are 2400x3600 pixels; physical page `p` is image `(p+17).jpg`. An image-native rule identifying red pixels (R>100, R>1.6G, R>1.6B, G<130), then retaining left-margin connected components with height greater than 350px and area greater than 2500px, finds **13 oversized red initials on 11 physical pages**. Their original connected-component heights are 495–498px; a normal physical body line has a vertical pitch around 188px. They occupy a left-hand gutter across **three successive printed lines**. Black text adjacent to the giant initial is visibly indented. No identification uses ciphertext language, likely plaintext, or any compositor-success statistic.

| Physical page | Source printed first line of giant | Red connected-component x, y (source pixels) | Original bbox width |
| --- | ---: | --- | ---: |
| 0 | 0 | 601,667 | 150 |
| 3 | 0 | 601,668 | 150 |
| 3 | 6 | 601,2098 | 229 |
| 6 | 4 | 601,1721 | 149 |
| 8 | 0 | 602,667 | 284 |
| 15 | 1 | 601,1731 | 150 |
| 23 | 0 | 601,1156 | 230 |
| 27 | 0 | 601,912 | 230 |
| 33 | 0 | 601,667 | 230 |
| 33 | 5 | 601,1908 | 219 |
| 39 | 6 | 601,1852 | 231 |
| 40 | 0 | 601,667 | 150 |
| 54 | 0 | 601,912 | 149 |

**Independent source-positive typography control:** Apply the **identical unchanged red-pixel threshold and connected-component filters** to the earlier 17 original 2014 LP1 scans, which contain independently solved and clear text. These yield **10 giant red initials on nine LP1 pages** at precisely the same left margin x=600–601px. Nine have heights496–499px and one on original LP1 p1 is552px; observed widths include the same **149–151px** and **230px** classes as unknown LP2. This establishes that the giant-initial gutter is an original book-design convention also applied to already-readable source material. It does not exclude an additional later LP2-specific hidden channel. The original image-pixel SFT now asserts exact LP1 component boxes independently of the thirteen LP2 source boxes.

The page and source-line mapping is **anchored by original red-ink rune-span start indices** in `lp2-ink-annotations.json`, matched to the exact source rune offset at the beginning of each physical printed line. Source-correct red starts on p6/j4, p15/j1, p33/j5 and p39/j6 resolve ambiguities caused by preceding short 13-dot paragraphs and headings. An earlier geometry model had four source-line indexing errors; all statistics here use these corrected positions.  illustrated introductory marks on p23/p27 and original cuneiform numerals before p39 are **not extra cipher-text lines**. For every affected printed line add `red_width + 12px` as a horizontal gutter, replacing the normal first-rune advance on the first row carrying the giant glyph. This approximates the 12px visible gap from giant red component to black text and assumes its footprint spans three text rows. These two geometrical approximations are independent of language yet remain approximate, not a pixel-perfect OCR/layout reconstruction.

| Same physical source class | Greedy forced before giant geometry | After giant geometry | Early after | Overflow after |
| --- | ---: | ---: | ---: | ---: |
| 39 joins on rows occupied by the 13 measured giants | **0** | **31** | 6 | 2 |
| **208 late within-word, never used to fit W** | **174** | **183** | 19 | 6 |
| **All 539 original printed joins** | **450** | **481** | **45** | **13** |

This is a **31-join improvement in the entire original book**, localized exactly to the first three source text rows beside measured red initials. The late withheld within-word result rises from 174/208 to **183/208, or 87.98%**, without refitting W or the 29 glyph widths. The source-pixel geometry model checks gutter estimates of 0, 8, 12, 16, and 24px using the same measured three-row cap. Each estimate yields more correctly predicted joins than the fixed geometry-unaware model; the SFT emits the exact sensitivity results. Four-row or two-row reinterpretations are less consistent with measured 495–498px caps.

### A second source-visible gutter: original red numeral markers

Five source-printed numbered passage lines have the exact original prefixes `1-`, `2-`, `3-`, `4-`, `5-`, on physical p36/j5, p37/j0, p37/j4, p37/j9 and p38/j3. They belong to the five numbered sections on original p34–39 and are **not GP29 runes**. The original-source transcript retains the digits, but a 29-rune-only compositor sum omitted their horizontal footprints. Independently inspect source scans `53.jpg`, `54.jpg`, `55.jpg`: the five red Arabic numeral pixel components are 92–96px tall, and the first black rune on the same row begins at original x coordinates **676, 680, 676, 678, 676px**. Ordinary original body text starts around x601px. A frozen, approximate **76px** inset therefore applies to each source-marked numbered line. It is a source-image geometry correction, with no language fitting and no ciphertext key.

This turns **three** formerly early original numbered-line joins into ordinary greedy wraps, and **two** into small nominal overflows (14.178px and14.029px), both well within the source-early typography tolerance below. The giant-only model predicts **481/539** source joins, while the **source-correct giant plus numeral model predicts 484/539**, with **40 earlier-than-greedy and 15 nominal overflows**. On the completely withheld p28–55 within-word joins, the two-stage progression is **174/208 → 183/208 → 186/208 (89.42%)**, without changing the original learned W, dash or stop advances.

| Original printed joins | Exact greedy | Early / nominal overflow | Total |
| --- | ---: | ---: | ---: |
| Baseline 29-glyph compositor | 450 | 78 / 11 | 539 |
| + 13 exact source red giant footprints | 481 | 45 / 13 | 539 |
| **+ 5 visibly numbered passage insets** | **484** | **40 / 15** | **539** |
| **Final model held-out pp28–55, within-word** | **186** | **14 / 8** | **208** |

Exactly **11/40** remaining short lines end in a printed source period, an ordinary paragraph stop. Of the other **29** early line ends, the median extra room after hypothetically adding the following rune is only **8.969px**; **15/29** need at most10px, **26/29** at most50px, and **every one needs at most75px**. The 15 nominal overflows reach no more than28px. Such small departures from the independently source-JPEG glyph-advance model are compatible with a real physical compositor whose ink advances and kerning are approximate.

### Frozen 51px tolerance and the independent later-page prediction

Exclude only the 11 short original period-ended lines. Across **278 ordinary original pp0–27 joins**, the largest exact deviation of the image-aware compositor from the greedy rule is **50.940px**, fixing a **51px source-early tolerance**. On the separate later physical pp28–55, there are **250 ordinary original joins**. The red-giant-only model meets the trained threshold on **246/250**, with deviations at p37/j0, p37/j9, p40/j8 and p42/j5. Both p37 exceptions begin visibly numbered red passage lines, and the five source-image measured numeral insets explain those two cases. **The complete image-source model meets the early-fixed 51px rule on 248/250 held-out ordinary joins (99.2%)**. Two remaining exceptions are **p40/j8 (55.253px slack)** and **p42/j5 (72.313px slack)**, in the same original vine-bordered illustration spread (`57.jpg` and `59.jpg`). Its art-imposed text margins are an independent plausible source of extra width changes, though a pixel-perfect margin map is needed to identify the exact widths.

### Direct raster check of the two residuals (Agent15, 24 November)

The original scan's ink edges and actual adjacent glyph-pair gaps eliminate the large apparent spare widths at both residuals. Coordinates are half-open, on the native 2400 × 3600 JPEGs; nominal body frame x=600..1800. The next glyph belongs to the same printed word, per the literal transcript. Match the terminal and following glyph projection masks against adjacent pairs on p40–48 (dimensions within 2 px; normalized 64×128 binary IoU ≥0.90). RGB maximum thresholds 100, 140, and 180 independently give identical results.

| Residual | Pair | Last ink x | Next glyph ink width | Observed intervening gap | Predicted next ink end |
|---|---|---:|---:|---:|---:|
| p40/j8 | T→F | [1711,1761) | 34 | 3 (four matches) | 1798 |
| p42/j5 | T→H | [1742,1792) | 43 | 4 (one match) | 1839 |

p42's following H would overrun the nominal frame by 39px on the ink alone. p40's following F leaves just 2px, rather than the approximate advance model's 55.253px. On the same pages, the F right-bearing estimate from 94 F→other projection matches (using the corresponding line-start glyph's measured left bearing) is 2px in 31 instances, 3px in 56, and 4px in seven. Adding that bearing would put the p40 pen at x=1800–1802. This is a borderline ordinary wrap, not a demonstrated intentional early break. The physical pair gaps come from p41/j4, p42/j9, p43/j1, p44/j2 for T→F, and p43/j7 for T→H. The p42 result relies on one matching internal pair; even zero spacing leaves a 35px overrun. The right-bearing estimate assumes a common x=600 text origin and does not resolve subpixel kerning.

Reproduce with [lp2_vine_residual_exact_glyph_spacing_sft.py](../sims/lp2_vine_residual_exact_glyph_spacing_sft.py), executed on the supplied original JPEG ZIP. A separate attempted transcription/projection linear metric fit was not used: projection fragments compound glyphs/punctuation, and nominal equal-token-count rows still gave approximately 4px held-out RMS error.

Thus the 248/250 count remains the **unchanged fixed approximate model's** held-out result. One residual is incompatible with fitting the next glyph in the nominal frame, and the other is borderline after measuring the real glyphs. Neither provides evidence of deliberate spare-width encoding. The 51px bound is an empirical first-half tolerance rather than a theoretically established typesetter uncertainty interval. Neither residual anomaly supplies an authenticated cipher key, a decoding rule, or recovered plaintext. The central falsifiable finding is that original page geometry alone accounts for almost all observed physical line-ending choices in untouched later pages.

## Cryptanalytic consequence and stopping rule

This original-image evidence makes an independent 594-bit line-break sidecar an **unjustified assumption**. At least 484/539 actual within-page joins have a specific source-visible greedy compositor explanation, and 11 more of the residual short lines terminate at a punctuation stop. It does **not** mathematically eliminate deliberate steganography in the residual margins or word-break choice, and it does not prove a bound on total side-channel capacity: an author could deliberately control layout within other physical tolerances or explicitly instruct solvers to exploit those margins.

A narrowly scoped information-capacity check illustrates the problem with a **binary exceptional-line-only** model. The complete image-augmented compositor has **55** non-forced joins (40 premature and 15 nominal overlong); granting one freely chosen bit at each such fixed source position supplies at most **55 bits**. The previously established exact run-restricted full-GP29 source codebook, given all 12,956 original runes and exactly 86 adjacent equalities, requires **327.96346 bits** to represent *every* unrestricted GP29 input with that repeat pattern relative to a 29-way source register: `N log2(29) − [log2(29)+log2(C(N−1,86))+(N−1−86)log2(28)]` with N=12956. Thus this **particular** one-bit-per-exception sidecar cannot alone fill that lossless-GP29 codebook deficit. This is conditional: original glyph identities, residual position choices, printed punctuation, page states, smaller natural-language GP alphabets and other channels can carry information; it is **not** a universal lower bound for solving LP2 or a proof that the actual cipher uses a predecessor-exclusion code.

A distinct [physical-line-framed enumerative rank test](lp2-line-framed-enumerative-original-gate.md) now measures the line-local alternative directly. With the actual 594 line lengths and per-line repeat quotas, the exact product codebook needs **662 bits** even when every line receives a free 29-way head, and **711 bits** when the 86 original equalities (82 internal plus four line-start) are represented continuously. Both frozen terminal-zero inverses replay exactly and pass an authentic solved-GP29 plant, but each yields **0/1,132** long dictionary words on the original. The 55-bit residual-line-end model cannot supply either line-framed state requirement. This is a scoped rejection of the fixed line schedule/rank, not a universal bound on every possible source channel or restricted language code.

The source has not provided an authenticated rule for extracting residual bits, a 29→28 exception grammar, or a key that invertibly deciphers any original unknown GP29 rune. Therefore **deprioritize independent line-end bits as the key to the full LP2 cipher** until a first-party clue selects a *specific residual readout* and it predicts a previously unseen original ciphertext block. Avoid fitting exception positions or modifying measured glyph widths to manufacture English.

### Source-exact reproduction

- [Original-only greedy compositor SFT](../sims/lp2_original_linewrap_greedy_geometry_sft.cjs) locks corpus, printed lines, 210/208 disjoint breaks, the three fitted parameters and all baseline counts.
- [Original-JPEG dropcap geometry SFT](../sims/lp2_original_linewrap_dropcap_geometry_sft.cjs) imports the previously frozen model, preserves 13 original JPEG-connected-component width measurements, five source-visible numbered-prefix insets and corresponding printed-row addresses, asserts all new counts, and performs a 0–24px gap sensitivity study.
- [Exact source JPEG red-pixel verification](../sims/lp2_original_red_dropcap_jpeg_sft.py) independently reproduces the thirteen giant and five numeral component x,y,width,height,area measurements, along with ten giant components on independently solved LP1 original images directly from the byte-preserved 2014 original scans, by fixed color threshold and 8-connected components with no OCR.
- Original source pages: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt`. The source JPEGs are original publication pages `17.jpg`–`72.jpg`, independently supplied to the research runtime as `liber-primus-jpegs.zip`. The image-derived red box table is deliberately separate from literal source rune arrays. To remeasure each red bbox from the original image, threshold the RGB channels above and use 8-connected-component analysis on the red pixel mask; the previously published 29 rune width measurement is independent and reused unchanged.

Both source-exact Node.js SFTs passed on **Windows Node22**, including the corrected source giant geometry and numbered passage inset in [GitHub Actions run 45080713831](https://github.com/FlareZ123/liber-primus/actions/runs/45080713831). The original JPEG pixel components were independently measured on the supplied original ZIP using Python/OpenCV and matched the committed giant, solved-LP1 and numeric marker boxes. The finding is supporting original-layout evidence in `im-results/`. It does not change `results/README.md`'s authoritative status: the 56 unknown physical LP2 pages remain cryptographically unsolved.

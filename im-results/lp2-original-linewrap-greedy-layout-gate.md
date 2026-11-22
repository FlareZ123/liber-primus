# Original LP2 printed line wraps: native glyph advances and red-dropcap geometry

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

Of the 45 remaining earlier-than-greedy line joins, **11 end with an original printed period**, an ordinary paragraph stop. Among the **34** nonparagraph earlier-than-greedy events, the median excess horizontal space after hypothetically adding the original next rune is only **12.133px**. Exactly **16/34** have a shortfall of at most 10px, **29/34 at most 50px**, and **all 34 are at most 75px**. Thus most exceptions sit close to the approximate glyph-advance threshold; their distances do not define an independent and reliably discretized bit alphabet. These source-native slack counts are asserted by the same image-aware Windows CJS SFT. The remainder have plausible artwork, typography, source digits, margin, stanza, and compositor explanations, but these mechanisms are not yet fully recovered. There are also 16 *nominal* overflows under the approximate metric; the presence of both early and overlong original printed lines is a warning against reading the remaining 34 early nonparagraph stops as precisely encoded bits.

## Cryptanalytic consequence and stopping rule

This original-image evidence makes an independent 594-bit line-break sidecar an **unjustified assumption**. At least 481/539 actual within-page joins have a specific source-visible greedy compositor explanation, and 11 more of the residual short lines terminate at a punctuation stop. It does **not** mathematically eliminate deliberate steganography in the residual margins or word-break choice, and it does not prove a bound on total side-channel capacity: an author could deliberately control layout within other physical tolerances or explicitly instruct solvers to exploit those margins.

A narrowly scoped information-capacity check illustrates the problem with a **binary exceptional-line-only** model. The image-augmented compositor has **58** non-forced joins (45 premature and 13 overlong); granting one freely chosen bit at each such fixed source position supplies at most **58 bits**. The previously established exact run-restricted full-GP29 source codebook, given all 12,956 original runes and exactly 86 adjacent equalities, requires **327.96346 bits** to represent *every* unrestricted GP29 input with that repeat pattern relative to a 29-way source register: `N log2(29) − [log2(29)+log2(C(N−1,86))+(N−1−86)log2(28)]` with N=12956. Thus this **particular** one-bit-per-exception sidecar cannot alone fill that lossless-GP29 codebook deficit. This is conditional: original glyph identities, residual position choices, printed punctuation, page states, smaller natural-language GP alphabets and other channels can carry information; it is **not** a universal lower bound for solving LP2 or a proof that the actual cipher uses a predecessor-exclusion code.

The source has not provided an authenticated rule for extracting residual bits, a 29→28 exception grammar, or a key that invertibly deciphers any original unknown GP29 rune. Therefore **deprioritize independent line-end bits as the key to the full LP2 cipher** until a first-party clue selects a *specific residual readout* and it predicts a previously unseen original ciphertext block. Avoid fitting exception positions or modifying measured glyph widths to manufacture English.

### Source-exact reproduction

- [Original-only greedy compositor SFT](../sims/lp2_original_linewrap_greedy_geometry_sft.cjs) locks corpus, printed lines, 210/208 disjoint breaks, the three fitted parameters and all baseline counts.
- [Original-JPEG dropcap geometry SFT](../sims/lp2_original_linewrap_dropcap_geometry_sft.cjs) imports the previously frozen model, preserves 13 original JPEG-connected-component width measurements and corresponding printed-row addresses, asserts all new counts, and performs a 0–24px gap sensitivity study.
- [Exact source JPEG red-pixel verification](../sims/lp2_original_red_dropcap_jpeg_sft.py) independently reproduces the thirteen component x,y,width,height,area measurements directly from the byte-preserved 2014 original scans, by fixed color threshold and 8-connected components with no OCR.
- Original source pages: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt`. The source JPEGs are original publication pages `17.jpg`–`72.jpg`, independently supplied to the research runtime as `liber-primus-jpegs.zip`. The image-derived red box table is deliberately separate from literal source rune arrays. To remeasure each red bbox from the original image, threshold the RGB channels above and use 8-connected-component analysis on the red pixel mask; the previously published 29 rune width measurement is independent and reused unchanged.

Both Node.js source-exact SFTs passed on **Windows Node22** in [GitHub Actions run 45079175486](https://github.com/FlareZ123/liber-primus/actions/runs/45079175486). The source-JPEG pixel component script was independently executed on the supplied original ZIP under Python/OpenCV and matched all thirteen recorded bounding boxes. The finding is supporting original-layout evidence in `im-results/`. It does not change `results/README.md`'s authoritative status: the 56 unknown physical LP2 pages remain cryptographically unsolved.

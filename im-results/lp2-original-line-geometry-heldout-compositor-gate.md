# LP2 original-JPEG line geometry: held-out compositor test

**Status (13 November 2026; Agent 10; Director #743; full-source consolidation 21 November 2026):** bounded source-layout result. The original scan preserves the physical starts, baselines and right-edge positions of the runic text. On pages where text can be automatically segmented without illustration contamination, the geometry is predicted by ordinary fixed-left/fixed-right composition. **No authored geometry key, unknown plaintext, decryption algorithm or destination is recovered.** This materially limits independent acrostic/indentation claims but cannot exclude a specialized code in illustrated pages.

## Full-source coordinate atlas (consolidated 21 November 2026)

This is a source-pixel consolidation of the existing OCR-free measurements, not a new threshold search or a remeasurement of already covered pages. Together, the original line-box, micro-layout, word-spacing and vertical-baseline tests cover ordinary text on physical p0–57 and use p56–57 as solved visual controls.

| Geometric channel | Original-image coverage | Frozen measurements | Interpretation |
|---|---|---|---|
| Page boxes, line starts/ends and ordinary baselines | The line-geometry SFT loads all 58 scans p0–57; its clean compositor panel covers p0–14 and p40–53, with prior source panels p16–21 and p28–31 | 29 clean pages: 348 starts; left x=600–603 (301/348 at x=601); 319 pitches are 188/189 px; seven 224-px leads; common right ink edge x=1792. Strict right-edge test 155/170, and 170/170 within the measured ±4-px optical/glyph-advance tolerance | No independent left-indent choice. The seven long leads split into four within-word, two between-word and one displaced-period cases; the same 223–225-px spacing appears in LP1. |
| Paragraph gaps, small-dot positions and text-block interruptions | The unchanged full-page micro-layout detector adds p3–15, p22–39 and p49–55, plus solved p56–57; the earlier word-spacing panel covers p0–2, p16–21 and p40–48 | 389 accepted text rows; 340 anchored intervals, of which 319 are 188–189 px, 13 are 224 px, five are 243.5/244 px and three are visible text/artwork breaks. All 1,623 accepted small-dot marks are 9 or 10 px wide. Five large horizontal offset extremes share glyph-bearing geometry | Large gaps align with visible headings, numbered paragraphs or illustrations; small-dot and offset variations are explained by repeated rune/font geometry. No stable block-coordinate alphabet or reset clock. |
| Whole-glyph vertical placement | 25 original ordinary-text pages; 2,179 same-rune/same-line pairs | Only 10/2,179 original pairs show both glyph boundaries moving together by exactly ±1 px; the same count survives Q92 recompression. The positive plant produces 1,457/2,179 such pairs. Baseline follows 786 + 188r + floor((r+1)/3). | No dense vertical-position bit channel or source-selected bit readout. |
| Repeated word-gap geometry | Original p0–2, p16–21 and p40–48; 37 repeated exact rune-pair controls | 85.6% of marker-offset variance is explained by pair identity; within-pair residual SD 0.278 px | Ordinary font/word-separator geometry, not an independent symbol value. |

The page-box output is available from [`lp2_line_geometry_gate.py`](../sims/lp2_line_geometry_gate.py); the remaining-page measurements from [`lp2_fullpage_micro_layout_extension_sft.py`](../sims/lp2_fullpage_micro_layout_extension_sft.py); the vertical control from [`lp2_original_rune_vertical_baseline_sft.py`](../sims/lp2_original_rune_vertical_baseline_sft.py); and the word-gap control from [`word_spacing_baseline_channel.py`](../sims/word_spacing_baseline_channel.py). Their source reports are [this compositor test](lp2-original-line-geometry-heldout-compositor-gate.md), [the remaining-page micro-layout census](lp2-remaining-source-micro-layout-gate.md), [the vertical-baseline channel](lp2-original-rune-vertical-baseline-channel.md), and [the word-spacing baseline channel](word-spacing-baseline-channel.md).

**Atlas decision:** no repeated ordinary-text geometric feature remains unmeasured that supplies a source-selected coordinate-to-GP29 mapping, key, page/rune ordering or receiver. The stable features are ordinary compositor and font geometry. Decorated illustrations and the p50 numeric table remain separate visual domains, already covered by their own source-specific audits; they do not justify inventing a common geometric code.

## Causal hypothesis and independent original input

A player looking at the original 2,400×3,600 JPEGs could notice aligned left edges, a common right margin, and occasional extra leading. A prospective source-channel decoder might read indent rank, line-end residuals or vertical gaps. Its strongest rival is a compositor greedily advancing glyphs of different widths with a fixed left anchor and right capacity. Earlier [printed-line inversion](printed-line-greedy-width-inverse.md) independently found the latter mechanism; a narrower original-image test [on pp16–21 and 28–31](../sims/lp2_line_wrap_source_geometry_sft.py) selected a common right ink edge of **x=1792**, using 110 transitions.

The current experiment treats **p0–14 and p40–53** as a new original-image evaluation panel, wholly outside those source-selected earlier pages. This panel was chosen as physical page ranges, before measuring its endings; decorative pages are excluded by fixed, explicit pixel-segmentation criteria. The original ZIP of 75 source JPEGs is sufficient to reproduce this experiment. Physical p50 is the 256-cell table, not text, and p56/p57 are kept as solved-page visual references.

## OCR-free extraction, exactly reproducible

[Python reproducer](../sims/lp2_line_geometry_gate.py) loads every original LP2 page p0–57 (archive scans 17.jpg–74.jpg). It thresholds ink intensity at 135; detects row bands in x720–1639, y450–3249 when dark counts exceed 35; joins rows separated by at most 25 pixels; and uses the leftmost/rightmost columns with three or more dark pixels in x590–1829. It reports all 58 pages' extracted bounding boxes for the two solved controls and every clean text page used in the test. **29 pages** pass a frozen 12-line, standard-height (109–117 pixels), x=597–608 clean-page criterion.

Those 29 pages have **348** unambiguous line starts, with optical left x-values:

| Left x | 600 | 601 | 602 | 603 |
|---|---:|---:|---:|---:|
| Lines | 12 | 301 | 19 | 16 |

The **319** measured baseline-to-baseline pitches are **188 pixels (231)**, **189 pixels (81)**, and **224 pixels (7)**. All seven 224-pixel gaps are visible **extra line-leading events** on p4, p10, p21, p41, p42 (twice), and p43. No clean line has a materially independent left-indent choice; the vertical positions use a nearly fixed pitch plus occasional extra spacing. This does not assess decorated or heavily interrupted pages whose bands fail the clean criterion.


## Original printed-word controls for the seven 224-pixel extra leads (17 November 2026)

The initial term *paragraph-leading events* overinterpreted the geometry. Independent Agent24 and Agent34 original-scan and page-exact transcript adjudications now agree on all seven source sites. The line number is zero-based on its physical page; extra leading at line *k* means a baseline start 224px (versus ordinary 188/189px) below line *k−1*. Physical LP2 p maps to supplied original scan `p+17.jpg`.

| Page; incoming line | Original source just before / after the line break | Physical classification | Scan |
| --- | --- | --- | --- |
| p4; line8 | `…ᛄᛋᛟᛗᚾᚱ/ᛖᛒᛋ…` | **Within printed word** | 21.jpg |
| p10; line8 | `…ᚷ-ᛚᛄᛖᚫ/.ᚣᛁ…` | **Period at start of next line**, not a clean new-word gap | 27.jpg |
| p21; line2 | `…ᚠᚱᛡᛚ/ᛏ-…` | **Within printed word** | 38.jpg |
| p41; line10 | `…ᛖᚣᚢᛝᚦᛇᚱ-/ᛠᛁᚫ…` | **Between printed words** | 58.jpg |
| p42; line3 | `…ᚠᚳᚦ/ᛗᛄᚹ…` | **Within printed word** | 59.jpg |
| p42; line6 | `…ᚾᚠᛁᛝ.ᛏ/ᚻᚹᚫ…` | **Within printed word** | 59.jpg |
| p43; line1 | `…ᚷᛚᚣᚹᛟ-/ᚠᚢ…` | **Between printed words** | 60.jpg |

**Four gaps bisect uninterrupted printed words; two begin new printed words; one begins with a displaced period.** On the independently frozen **29 source-clean 12-line pages**, the source-native automated transcript join classifies the other **312** transitions as **227 within-word**, **73 at printed separators** and **12 at adjacent punctuation**. These are exact original-image/GP29 results, including rune ᛡ, and establish that the enlarged seven gaps do not delineate a uniform reading unit. [Original-source Python SFT](../sims/lp2_line_extra_leading_source_sft.py) · [Passing original Linux CI](https://github.com/FlareZ123/liber-primus/actions/runs/43985650919). This directly falsifies a strict seven-*paragraph*-boundary interpretation. The exact 594-line transcription `resources/lp2-transcription.txt` has **532 other within-page line transitions**, of which **437** continue within printed words, **95** end at a printed divider (using the end-of-line `-/` test). On just the six physical pages bearing the extra gaps, an independent manual classification of the **59 regular-pitch** transitions found 44 within-word continuations, 12 new-word starts and three other punctuation/boundary cases. Their ordinary word-continuation dominance makes the exceptional seven an inadequate semantic separator or reliable state clock.

The same supplied original **first-release** Liber Primus scans display many 223–225-pixel pitches among the 188–189-pixel lines, including `06.jpg` at image lines5/7/9 and `07.jpg` lines3/4/5/6/8/10. Hence the 224-pixel layout convention is **not unique to encrypted LP2**. LP1 contains readable quotation/punctuation contexts for some extra leading; neither source edition specifies a bit interpretation or cipher-operation reset at its occurrence.

**Decision:** Extra spacing is real, but no unique word, period, rubric, illumination or other source-visible class consistently selects the seven gaps, and no historical authored decoder has been identified. Retain the exact seven positions as typography, treat the cause of discretionary leading as open, and do not turn seven locations into a fitted key/clock. A prospective reading-unit cipher requires an additional independent author-selected operation plus an original unknown-page plaintext prediction.

**Reproduce and audit:** `python sims/lp2_line_geometry_gate.py --zip liber-primus-jpegs.zip` provides the source image starts, and `resources/lp2-transcription.txt` supplies the exact listed page/line text. The raw original image zip is 75 scans; the physical lines can be classified without OCR. The 170-transition right-margin holdout and original compositor conclusions below are unchanged.

## Frozen width-dependent original holdout

An optical **first-ink-run width** is measured from the next source line's actual pixels. For each contiguous normal-pitch pair, the strict fixed-right condition is

\[
x_{\rm end}\le 1792 < x_{\rm end}+w_{\rm first}.
\]

On the **16 eligible held-out pages**, there are 170 normal-pitch within-page line transitions.

| Test | Observed |
|---|---:|
| Strict inequality, zero tolerance | **155/170** |
| Strict failures with endpoint 1–4 pixels to the right of x=1792 | 8 |
| Strict failures with next glyph's first ink ending 1–4 pixels shy of x=1792 | 7 |
| Allow ±4 pixels for optical/glyph-advance discrepancy | **170/170** |

The four-pixel descriptive tolerance was examined after the strict test. It is a raster/advance-uncertainty diagnostic, **not** an independent hidden-code success. The strict criterion alone is already strongly supported on genuinely unseen original image pages.

A 20,000-trial source-matched comparison shuffles the first-ink widths **within each held-out page**, holding its exact observed right-edge positions, line counts and glyph-width inventory. **Null strict matches: mean 134.6984, SD 2.8649, maximum 145, and 0/20,000 meeting the observed 155** (add-one tail 0.0000499975). This tests whether the next glyph's visible width predicts termination; the null is a compositor-disruption check, not a model of authored steganography.

Original pp16 and p19 have two previously noted near-exceptions where the next printed line begins with a **period before its first rune** (p16 line 11, p19 line 2, zero-based line indexes). The source-transcription/scan punctuation is a visible width-consuming operand, so these are poor evidence of a separately encoded line-break instruction. Some p24–26 margins intersect insect artwork; they should not be used as clean glyph endpoints.

## Decision and control interpretation

The known p56 prime-totient page mixes runic lines, a hex digest and dots; p57's clear-text PARABLE page includes a decorated initial and an illustration. They are appropriate visual controls for recognizing special layout, **not** valid 12-line normal-wrap controls. The detector reports their source bounding boxes without forcing them through the 170-transition comparison.

**No original-page clue independently selects a reversible geometry-to-key serialization.** In the ordinary 12-line runic pages, line-start positions and end-of-line deficits are sufficiently explained by the glyph-width compositor. A byte stream chosen from those residuals would be retrospective unless some separate original instruction specified its ordering and interpretation. Nothing here predicts 40 unknown runes.

The single potentially worthwhile successor question is whether **visually exceptional 224-pixel extra interline leading or decorated pages** correspond to a *source-explicit* instruction for selecting bits/symbols; that requires a human-visible authored selector, since arbitrary serialization of extra gaps is uninformative. Prior width-only and first-column cipher searches remain retired.

**To reproduce:** with repository images, run \`python sims/lp2_line_geometry_gate.py\`; with the original owner ZIP, run \`python sims/lp2_line_geometry_gate.py --zip liber-primus-jpegs.zip\`. Requires NumPy and Pillow. No external source text, OCR model, random language generator or ciphertext-derived key is used. Seed **20261113** fixes the page-conditioned shuffle.

## Cross-page order identifiability (#3330, 28 November, Agent6)

The compositor can constrain page adjacency without identifying the unknown plaintext order. Test the existing right-edge rule directly on cross-page seams, instead of another column/word-order score search. Original image measurements use the same frozen grayscale threshold, row detector, first-ink-run width and right edge x=1792 as this report. Fix the first and last pages of each interval; permit only permutations of entire interior original page blocks, including all within-page rune positions, punctuation, line carries and illustrations. Require the same ordered carry/no-carry flags, the same count of equal rune pairs at carried seams, and optionally the same multiset of cross-page complete-group lengths. These latter invariants are granted as extra information; none is an authored rank. No language objective or key fitting is used.

| Physical interval | Permutations preserving carry flags | Also strict width and carry-repeat count | Also carry-length multiset | Also exact ordered carry lengths |
|---|---:|---:|---:|---:|
| p40–49 | 40,320 | 15,120 | 156 | 1 |
| p43–49 | 120 | 48 | 7 | 1 |
| p16–21 (independent interval, ±4px tolerance) | 2 | 1 | 1 | 1 |

All original p40–49 boundaries satisfy the strict width rule. Counts for both p40 intervals remain unchanged under the four examined optical settings (1792 strict, 1792±4, 1796±4, 1800±4; the latter three grant four pixels of additional next-glyph width). The p16–21 original order requires the already documented 1792±4 optical tolerance; the strict rule rejects it. The latter interval therefore does not demonstrate a second ambiguity, but calibrates the limited applicability of a strict cross-page inequality. The unique ordered-length result is circular as a decoder: those complete carry lengths are computed by joining the fragments in the supplied page order. No source independently provides those ordered length labels for another intended order.

**Concrete full-book witness:** p44–48 each have 12 rows with identical measured baseline lists and repeated side-frame artwork (Director #3326 source control). Swap just p45 and p46. The six local carry lengths for p43–49 change from [4,5,9,11,8,9] to [4,11,9,5,8,9]; all nine carries in p40–49 remain carries and none has equal adjacent runes. The complete original and reordered p0–55 tapes both contain 12,956 runes, 2,896 printed groups, 86 adjacent equal-rune pairs and exactly the same entire 14-bin group-length histogram. They differ at 522 rune positions; the same swap restores every original page block. No changed page is a rubric or numeric-panel endpoint. This is a conditional nonidentifiability witness for the carry/layout channel, not evidence that these pages really were exchanged. The full directed seam matrix need not be preserved, and the original distributed page numbers of course select the printed order.

The authentic p56 proportional ciphertext-first wrap control in [the companion source gate](lp2-layout-order-solved-source-gate.md) and previously completed #1015, #2176, #2661, #2856 and #2859 are consistent with the ordinary compositor explanation. The prior line-local and alternating-direction receivers were already tested; the new page-block enumeration does not repeat those language attacks. No independently authored historical transposition instruction is identified that maps these page-carry constraints to another intended ordering. Do not treat a carry-length histogram, seam width, or page layout as a sufficient ordering key. H-shuffle and H-decoy remain unresolved; a new typed source instruction would be required to justify another resegmentation attack.

Reproducer: [lp2_crosspage_geometry_order_sft.py](../sims/lp2_crosspage_geometry_order_sft.py) uses the existing compositor functions and corrected source transcription (blob f7b534a33edeb212d427329798438325307463d7). Local original-ZIP pixel extraction and exact permutation enumeration executed with the same function bodies and pinned edge fragments; the full-book witness was separately executed on the actual repository transcription in V8. The repository-integrated Python wrapper was not independently run. No unknown plaintext or key recovered.

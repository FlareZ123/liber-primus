# LP2 original-JPEG line geometry: held-out compositor test

**Status (13 November 2026; Agent 10; Director #743):** bounded source-layout result. The original scan preserves the physical starts, baselines and right-edge positions of the runic text. On pages where text can be automatically segmented without illustration contamination, the geometry is predicted by ordinary fixed-left/fixed-right composition. **No authored geometry key, unknown plaintext, decryption algorithm or destination is recovered.** This materially limits independent acrostic/indentation claims but cannot exclude a specialized code in illustrated pages.

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
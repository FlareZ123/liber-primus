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


### The seven extra-leading sites are mostly *within original printed words* (17 November 2026)

A cross-control against the unchanged physical printed-line transcription (`resources/lp2-transcription.txt`) corrects the earlier *paragraph-leading* label. The seven 224-pixel events are the start of physical lines **p4:8, p10:8, p21:2, p41:10, p42:3, p42:6, p43:1** (zero-based), verified directly on the original `21.jpg,27.jpg,38.jpg,58.jpg,59.jpg,60.jpg` scan pixels using the same x720–1639, y450–3249 threshold and row joins. For each site, inspect the end of the immediately preceding transcribed physical line and the beginning of the next line:

| Event | Last printed line ends | First following line begins | Printed word continues across the gap? |
| --- | --- | --- | --- |
| p4 line8 | `...ᛗᛉᛁᚹ.ᛄᛋᛟᛗᚾᚱ/` | `ᛖᛒᛋ-...` | **Yes** |
| p10 line8 | `...ᛚᛄᛖᚫ/` | `.ᚣᛁᚫᚹᚻ-...` | **Yes**, stop at next line beginning |
| p21 line2 | `...ᚠᚱᛡᛚ/` | `ᛏ-...` | **Yes** |
| p41 line10 | `...ᛖᚣᚢᛝᚦᛇᚱ-/` | `ᛠᛁᚫ-...` | No |
| p42 line3 | `...ᛈᛁ.ᚠᚳᚦ/` | `ᛗᛄᚹᚱᚪᛚ-...` | **Yes** |
| p42 line6 | `...ᚾᚠᛁᛝ.ᛏ/` | `ᚻᚹᚫ-...` | **Yes** |
| p43 line1 | `...ᚷᛚᚣᚹᛟ-/` | `ᚠᚢ-...` | No |

**Five of seven** extra pitches bisect a single printed ciphertext word. Among the other **532** within-page printed-line transitions (normal-gap or not among this list), **437** also continue inside a printed word and **95** fall at an explicit word divider. Thus the five-of-seven count is ordinary for this corpus and gives no evidence of a semantic paragraph boundary; the term *paragraph leading* should not be treated as a source-selected reset instruction. Moreover, the same original Liber Primus first-release scans contain many 223–225-pixel line starts alongside 188–189-pixel pitches, for example original `06.jpg` lines5/7/9 and `07.jpg` lines3/4/5/6/8/10, so **224-pixel leading is not unique to encrypted LP2**. The first-release panels contain quotation and section punctuation that can motivate ordinary editorial extra spacing, without specifying what LP2 glyphs would encode.

The evidence permits aesthetic/interline adjustment and other author-intended spacing interpretations. Neither the seven literal gap positions nor their immediate printed-word context supplies an executable GP29 decoder or an authenticated key. Treat the original seven-gap selector as **unsupported** unless an independent first-party instruction changes this causal reading.

## Original-boundary adjudication of the seven extra gaps (17 November 2026)

**Correction:** The original report called these “extra paragraph-leading events.” Directly aligning each 224-pixel baseline pitch to the unchanged, page-exact `resources/liber-primus/lp2-transcription.txt` shows **four of the seven are within a single uninterrupted printed word**, **two** follow a printed word separator, and **one** places a period at the beginning of the following line. Therefore **a seven-paragraph-break interpretation is false**. This corrects terminology; the original JPEG geometry, 170-transition right-edge holdout and source-width conclusions above are unchanged.

The physical line number is zero-based on its page; an “extra” at line *k* means that line *k* starts 224 pixels below the previous baseline. The original 2400×3600 JPEG is numbered physical p+17 in the supplied 75-image archive.

| Physical page; line receiving extra lead | Previous-to-next printed boundary | Relation | Source image |
| --- | --- | --- | --- |
| p4; line8 | `…ᛄᛋᛟᛗᚾᚱ/ᛖᛒᛋ…` | Within-word | 21.jpg |
| p10; line8 | `…ᚷ-ᛚᛄᛖᚫ/.ᚣᛁ…` | Period begins next line | 27.jpg |
| p21; line2 | `…ᚠᚱᛡᛚ/ᛏ-…` | Within-word | 38.jpg |
| p41; line10 | `…ᛖᚣᚢᛝᚦᛇᚱ-/ᛠᛁᚫ…` | New word | 58.jpg |
| p42; line3 | `…ᚠᚳᚦ/ᛗᛄᚹ…` | Within-word | 59.jpg |
| p42; line6 | `…ᚾᚠᛁᛝ.ᛏ/ᚻᚹᚫ…` | Within-word | 59.jpg |
| p43; line1 | `…ᚷᛚᚣᚹᛟ-/ᚠᚢ…` | New word | 60.jpg |

Among the **59 normal-pitch** transitions on these same six pages, 44 also continue a word and 12 precede a printed new word (three other delimiter cases). The seven exceptional leading positions therefore do **not** appear to select one grammatical boundary type. Original p10's displaced full stop also cautions against automatically treating the next line's first visible mark as a rune. The positions were originally discovered through optical geometry, not through a preselected cryptographic operation; **no seven-symbol cipher, key, or plaintext receiver follows from this corrected classification**.

To audit, use `python sims/lp2_line_geometry_gate.py --zip liber-primus-jpegs.zip` for the original-image baselines and read the physical lines at the exact page/line coordinates above. Classify word continuation by absence of a printed `-` or `.` at the preceding line end; punctuation at the first position of the following line is a separate case. Verify the source transcription's physical rune counts against `lp2-corpus.json` before changing its tokenization.

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
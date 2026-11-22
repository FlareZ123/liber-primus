# Original LP2 ordinary-text micro-layout census on the 38 previously unmeasured pages

**Decision (12 November 2026; Director #474):** Applying the already source-audited original JPEG line/glyph/marker thresholds unchanged to all **38** previously unmeasured unknown physical pages and solved pp56–57 shows the same ordinary word-separator and line-spacing conventions as the earlier pp0–2/16–21/40–48 study. There is **no source-selected geometric state, decoding rule or recovered plaintext**. New large line gaps coincide with human-visible paragraph numbers, red headings or artwork; a small group of horizontal offset extremes shares the same glyph-bearing form and is typographical. This is a bounded **ordinary-text geometry** negative and does not exclude independently cued content hidden in the red artwork, pixel planes or original JPEG entropy.

## Exact source scope

Original files are [resources/liber-primus/17.jpg–74.jpg](../resources/liber-primus/README.md); a physical p maps to archive filename p+17. The unchanged earlier detector and seven repeating rune-pair controls are [sims/word_spacing_baseline_channel.py](../sims/word_spacing_baseline_channel.py) and [the original bounded report](word-spacing-baseline-channel.md). The new [standalone extension SFT](../sims/lp2_fullpage_micro_layout_extension_sft.py) imports the same exact detection routine, thresholds, dark-rune size classifier, small-dot classifier and x-band; it does **not** remeasure the earlier 18 unknown pages.

The new unknown pages are **p3–15, p22–39 and p49–55**, comprising 13+18+7=**38** pages. Their visible categories include scrollwork/red headings (p3–7), saplings/feather (p8–14), numerical grid and infinity (p15), the numbered 2014 cuneiform passage (p33–39), the pp49–51 grid and final p53–55 red/tree units. Both solved pages are independent positive layout controls. The source p50 middle table is entirely nonrunic and therefore has no ordinary text glyph rows passing the existing detector; p49 and p51 contribute only their original GP text rows, while numerals are excluded. Those exclusions avoid inventing a "text font" for the numeric grid.

The classifier's definitions remain source-fixed: grayscale <110 in a fixed central x-band, glyph-area >=100 with width <=130 and height 70–145, small marks with height 5–24 and width 5–20, plus gap <=30 and asymmetric clearance <=15; row peaks use the original smoothed vertical ink profile. The source-original 2014 images are 2400×3600.

## Full new-page and solved-control measurements

| Metric on the 38 new unsolved pages plus two solved pages | Observed |
| --- | ---: |
| Physical pages | **40** |
| Ordinary dark-text line rows accepted | **389** |
| Small-dot-bearing text gaps | **1,623** |
| Ordinary glyph-to-glyph gaps without marker | **6,294** |
| Small dot width exactly 9 pixels | **1,056** |
| Small dot width exactly 10 pixels | **567** |
| Consecutive text-row intervals with anchors | **340** |
| Intervals of 188–189 px | **319 / 340** |
| Larger ordinary paragraph intervals at 224 px | **13** |
| Paragraph/section intervals at 243.5 or 244 px | **5** |
| Other detected long intervals at 487.5 / 550 / 675.5 px | **3**, all visible text-to-section/illustration breaks |

The small-dot gap widths are mainly **19–23 px**; the dot offset from the intervening glyph gap's midpoint is principally **−1, −0.5, −1.5 or −2 px**. Across all 1,623 accepted events, every dot is **9 or 10 pixels** wide, exactly the class found by the previous 965-event mixed study. The 319 standard pitches also retain the precise original 188/188.5/189 px triad.

The 21 large anchor intervals are not a second stable line-grid alphabet. The **13 ×224 px** and **five ×243.5/244 px** spans recur at visually separated paragraph and numbered-list starts, including p7, p22, p35–38 and p53; the original solved p57 also contains a 244 px paragraph break. The other three involve large non-text objects: **p3 487.5 px** (scrollwork/second red rubric), **p6 675.5 px** (internal red rubric), and **p57 550 px** (the artistically illustrated solved parable ending). Do not treat the last as a normal 550-px cryptographic baseline state: the p57 source includes its drawn tree outside the ordinary paragraph.

### Horizontal gap extremes adjudicated directly on source pixels

Five measurements among the newly covered unknown pages have separator-centre offsets of magnitude over 3 px, compared with a modal −1 px: p5 line7, p5 line11, p8 line9, p10 line7 and p29 line11. The **three far-right +4 px** instances all have the same **30-pixel glyph gap and descending right-hand rune stroke** immediately to the left of the mark, a repeated font-bearing geometry visible on the original cropped lines. The other two are −3.5 and −4.5 px on ordinary glyph/mark junctions. There is no reproducible independently chosen binary state, held-out mapping or output message from those five events. These *pixel-audited typography exceptions* should remain visible in raw JSON rather than being silently deleted.

For comparison, the earlier source-locked **37 repeated exact rune-pair** controls explained **85.6%** of marker-offset variance by pair identity, with only **0.278 px** within-pair residual SD. The separate full original 12,956-rune source assignment audit reports **no disagreement on ordinary black text** among exact-registered held-out rows; its red/enlarged artistic glyphs are explicitly a different visual font domain. Thus the new page-level offset extremes do not warrant a separate symbol alphabet without a prior original instruction.

## Falsifiable threshold and consequence

A positive geometric channel would require a page/rune-independent, visibly cued procedure assigning a stable bit or GP29 symbol to **multiple repeated identical-rune contexts**, validated on held-out original words and a solved control. None is present among the 1,623 original accepted new-page marks or 340 row intervals. No source-visible key, state-transition rule, word-boundary readout or plaintext appears.

This extends the spacing-only negative coverage to all original physical LP2 pages **for ordinary dark runic text that passes the frozen detector**. It leaves the known red-rune enlarged headings, illustrations, page p50 numeric cells, and advanced image steganography outside its ordinary-text claim. Do not retune segmentation thresholds to absorb exceptional marks or pursue another bit-lane search on the same absent selector.

## Files and reproducibility

- [Original 58-image mapping](../resources/liber-primus/README.md).
- [New exact-source single-file extension](../sims/lp2_fullpage_micro_layout_extension_sft.py).
- [Prior matched pair and solved baseline controls](word-spacing-baseline-channel.md).
- [Complete ordinary-black original rune registration](lp2-full-source-rune-assignment-audit.md).
- [Original red/enlarged glyph source adjudication](lp2-red-rune-image-adjudication.md).

The SFT emits source-page metadata, every accepted small-gap offset over 3 px, every row interval outside the 188–189 px standard, and one summary row for every newly visited page. Reproduction requires numpy, scipy and Pillow and reads the canonical original JPEG paths without network access. No guessed key or language scoring is involved.

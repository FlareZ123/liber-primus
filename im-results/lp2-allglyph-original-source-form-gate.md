# Original LP2 all-29 source-glyph allograph gate

**Research decision (14 November 2026; Agent38, Director #893):** No reproducible second ordinary glyph shape was found in any of the 29 Gematria Primus rune classes under the explicitly bounded source-image silhouette test below. This is a negative decision for a **discrete, common alternate-font-form key channel**. It does not recover unknown plaintext, rule out sub-pixel changes or diagnose every joined/ornate rune.

## Premise and independent starting source

The earlier source-template A/R/E analysis only gated ordinary A, R, E, leaving 26 other GP rune identities untested under the same broad allograph premise. A binary alternate letterform could convey a player-visible key bit without changing the canonical rune transcription. The independent rival is ordinary uniform vector-font rendering, original book illustrations, red/black differences, print numerals, and JPEG artifacts.

This test uses original LP2 JPEGs `resources/liber-primus/17.jpg`–`74.jpg` (physical page `p = basename-17`), the original 29-rune GP alphabet, and *solved* physical p56/p57 as the source-selected known-label letterform corpus. The p56/p57 native line strings and original-pixel row rectangles are frozen in the reproduction script. No unknown-page ciphertext or plaintext is used to choose these templates.

Related but distinct source work: [all-source position-assignment audit](lp2-full-source-rune-assignment-audit.md), which covers all 12,956 unknown rune positions and previously resolved red and p39 classifier errors; [earlier A/R/E source SFT](../sims/lp2_are_allograph_original_sft.py), which did not examine the remaining classes. This study measures the native physical **shape** rather than treating an OCR discrepancy as a new letter.

## Frozen original-image gate

The [complete reproducible SFT](../sims/lp2_allglyph_original_allograph_sft.py) extracts **163 labeled solved-source glyphs covering all 29 classes** from p56/p57. It scans the 58 physical LP2 JPEGs in their standard page regions, thresholds grayscale ink below 160, and retains isolated connected components of height 80–122 px, width 7–110 px and area greater than 160 px. A top-left-aligned 128×120 binary canvas permits a 60×64 downsample for nearest solved-source *shape label*; for the actual variant check, candidate glyph ink is compared to source glyphs of the **same canonical identity** wherever source alignment supplies that label. The fixed tolerance is a 5×5 elliptical morphological expansion, with an uncovered-ink fraction cutoff of 0.03. This tolerance deliberately absorbs one- to two-pixel raster displacement.

The classifier's full-page reading order is fixed as `(round(top_pixel_y / 188), left_pixel_x)`. Independent original source sequences come from `resources/liber-primus/lp2-corpus.json`; a sequence alignment records exact positional source matches, source substitutions and positions not confidently aligned. This guards against mistaking a visually altered rune for an ordinary *different* rune. A separate 22×58-pixel ink-arm **planted alternate-form control**, applied to one known template in **each** class, is rejected as nonordinary by the identical metric. These plants demonstrate sensitivity to clearly separated strokes, rather than proving sensitivity to invisible subpixel variants. The two solved pages also serve as native cross-page font controls.

## Original-source results

| Frozen measure | Value |
| --- | ---: |
| Solved-source templates | 163 across 29 of 29 rune identities |
| Candidate ordinary-size components on 58 scans | **13,083** |
| Nearest solved-template morphology residual ≤0.03 | **12,963** |
| Residual outliers requiring art/merge adjudication | **120** |
| Full canonical-source sequence exact matches | **13,039** |
| One-to-one source substitutions in aligned passages | **2** |
| Source-native leave-one-out maximum residual | **0.000579711** |
| Minimum planted-stroke residual across 29 classes | **0.06430526** |

The **12,963/13,083** morphology count is a segmentation result; it includes solved text and some image-region artifacts, so it must never be presented as an exact enumeration of all **12,956** unknown ciphertext positions. The independent prior position audit covers those positions. The full source-alignment count includes 180 known solved-page runes, making 13,136 original source runes across all 58 pages; **97** are not exact-match aligned by this deliberately simpler scan (joined components, oversized initials and other segmentation omissions). Neither that gap nor the 120 classifier outliers can be silently treated as genuine alternate rune forms.

**Outlier audit.** **83/120** residual outliers have widths ≥80 px, overwhelmingly attached/joined letters or punctuation, and **28/120** begin at or left of x450 in the image margin; these categories overlap. The **16** outliers satisfying both `width<80` and `x>450` were inspected in their original scanned-line context: p37–38 red page numerals at approximately x601–607, p10 printed black `7` at (1460,2014), p33 illustrated sigils near (1028,3108) and (1262,3086), repeating spiral margins at (2077,1648) on p3–7, three glyph/neighbor joins around p17 (1626,2555), p26 (1718,1426), p27 (1724,2611), and p36 a numeral at (620,1693). These are art, numerals, or fused components. None is a discrete alternate GP rune repeatedly appearing as the **same** canonical letter. The union counts need not sum to 120 because the categories overlap.

The **two** isolated source substitutions from the independent original-label alignment are likewise art/registration cases: p3 source index119, expected P (GP13), observed at image (2077,1647) is a large spiral ornament mistakenly classified F; p8 source index0, expected X (GP14), observed at (440,835) is a clipped oversized first rune assigned OE by the ordinary-size template. Native ink and printed source context resolve both without changing any canonical rune.

**Independent execution:** [successful GitHub Actions run 43618214808](https://github.com/FlareZ123/liber-primus/actions/runs/43618214808) completed the full original-source alignment, all template and planted positive controls, and an exact count regression on `main`. Its [7-day JSON artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43618214808/artifacts/14123490355) preserves all 120 residual outlier coordinates, each page's candidate count, the two source substitution records and 29-class counts. The code reproduces the output after retention expires; the original image corpus is in the repository.

Per-class component assignments in canonical GP index order `F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA` are:

`[484,456,455,463,434,449,442,405,412,459,478,455,401,440,457,442,448,437,447,445,462,457,489,449,482,448,448,476,463]`.

These are **image predictions**, inclusive of some non-runes, and are not the canonical ciphertext counts.

## Interpretation and route decision

A readily visible, repeated, two-form version of any of the other 26 GP rune classes should have produced multiple native-component source-shape outliers within one canonical class, stable across printed pages. This pass instead finds overwhelmingly the same ordinary source glyph shapes, with the exceptional components attributable to independent visual matter. There is **no candidate allograph bitstream**, no independently selected key or decipherment operation, and no recovered unknown LP2 plaintext.

The exclusion is bounded to **isolated ordinary-size printed glyphs**, the stated grayscale threshold and morphological tolerance. It does not exclude a very rare one-off artistic glyph, subtler strokes under the two-pixel tolerance, colour-only encoding, deliberate changes inside joined components, or a hidden channel using glyph *placement* rather than form. None of those alternatives has a source-selected readout. This result **retires the unmotivated second-form search across the remaining 26 classes** and redirects resources toward a source-selected original-cipher inverse with withheld coherent plaintext.

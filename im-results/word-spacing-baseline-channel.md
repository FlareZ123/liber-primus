# LP2 source-visible word-spacing and baseline placement: bounded negative

**Decision:** no independently supported word-spacing or baseline alphabet survives the source-image controls. Treat the measured geometry as typography and paragraph layout, not key material. This is a scoped negative result, not a decryption and not proof that every possible visual channel is absent.

## Scope and frozen test

The original images were measured for LP2 pages **0–2, 16–21 and 40–48**, covering the opening, plain-text and illustrated layouts. Solved pages **56–57** were included as controls. The image mapping is physical scan index = LP2 page + 17.

The horizontal census records small dot-like marks between adjacent glyph runs. A separate, source-identified sample contains **37 exact word-boundary events** from seven adjacent-rune pairs that each recur at least five times in the selected page strata. Their page, line, rune count, boundary position and rune-pair identities are frozen in the reproducer from resources/lp2-transcription.txt. All 37 source positions matched the detected glyph count and exactly one marker in the corresponding image gap.

The measurement uses fixed thresholds: line-row detection from the central image band; glyph runs from the original grayscale image; small marker runs constrained by height, width and area; and local gap geometry measured between the two adjacent glyph bounds. Marker offsets are normalized by the median glyph height on their line. The test does not tune thresholds to a plaintext score.

## Horizontal geometry

Across **965** well-formed dot-bearing gaps (928 in the unsolved sampled pages and 37 on solved controls):

- Dot width is **9–10 px**.
- The complete glyph-to-glyph span has median **21 px**, interquartile range **20–22 px**, and 95th percentile **23 px**.
- The marker's left clearance has median **5 px**; its right clearance has median **7 px**.
- Marker-centre offset from the midpoint of the surrounding glyph gap has median **−1 px**, IQR **−1.5 to −0.5 px**, and 95th percentile **0 px**.
- The normalized centre offset has median **−0.011** of median glyph height.
- The 3,662 adjacent glyph gaps without a small marker have median **5 px**, IQR **4–6 px**, and 95th percentile **8 px**. Nine longer segmentation gaps were excluded from this within-word comparison.

The marker is therefore a small, consistently placed separator glyph inside a predictable local advance. Variation in the total gap and marker offset is primarily a glyph-pair bearing effect, not a free per-word spacing variable.

### Repeated identical-rune-pair control

The 37 source-identified word boundaries cover **seven exact adjacent-rune pairs across 15 pages**:

| Rune pair | Events | Marker-centre offset | Total gap |
|---|---:|---:|---:|
| ᚣ→ᛈ | 5 | −1.0 px throughout | 20–21 px |
| ᚷ→ᛚ | 5 | −1.5 to −0.5 px | 21–22 px |
| ᚻ→ᛒ | 5 | 0 px throughout | 22–23 px |
| ᛄ→ᛁ | 5 | −1.0 to −0.5 px | 21–22 px |
| ᛉ→ᚪ | 5 | −2.5 to −1.5 px | 18–20 px |
| ᛏ→ᚫ | 7 | −2.0 to −1.5 px | 19–20 px |
| ᛒ→ᛟ | 5 | −1.5 to −1.0 px | 22–23 px |

Conditioning on the exact rune pair explains **85.6%** of the measured marker-offset variance and **86.7%** of total gap-width variance. The pooled within-pair residual standard deviations are **0.278 px** for marker offset and **0.581 px** for gap width. After pair conditioning, residual offset has no rank association with relative horizontal position in the line (Spearman ρ = **−0.001**, p = **0.993**) or line span (ρ = **0.089**, p = **0.602**; n = 37). These are descriptive controls, not a discovery-wide statistical test.

This is the discriminating result: the same exact rune pair repeatedly produces the same local geometry across different pages and layouts. The small differences between pair classes are stable, while within-pair variation is subpixel-to-one-pixel scale. No second spacing class appears that transfers independently of glyph identity.

Solved-page controls agree. The census contains **21** dot-bearing gaps on p56 and **16** on p57; their median total spans are 21 and 22 px respectively, with the same 9–10 px marker and near-centred placement.

## Vertical placement and line grid

The marker rows provide a line anchor less dependent on the individual rune's lower extent. The sample contains **222** line rows and **201** consecutive line intervals:

- **192/201** intervals are **188–189 px**.
- **8/201** are **224–224.5 px**, exactly about 36 px beyond the ordinary pitch.
- **1/201** is **244 px**, about 56 px beyond the ordinary pitch.

The nine enlarged intervals occur at p21 lines 1→2; p40 lines 3→4, 4→5 and 8→9; p41 lines 9→10; p42 lines 2→3 and 5→6; p43 lines 0→1; and solved p57 lines 1→2. They are consistent with visibly enlarged paragraph/section leading, not a multi-symbol baseline code.

The solved p57 control has marker-row positions 973.5, 1162, 1406, 1594 and 1782 px; its 244 px interval is the same +56 px paragraph-spacing case. On solved p56, the upper text rows are at 729.5, 917.5 and 1106.5 px, while the lower text rows after the intervening hash block are at 1946 and 2134 px; both text blocks retain the same ordinary pitch. Within-line marker-y spread is zero for 95% of measured rows; the one larger spread is a mixed-mark row on solved p57 and does not move its median line anchor off the grid.

## Interpretation and research decision

The source images support a simple account:

1. A small dot is used as a word separator.
2. Its size and local placement are stable.
3. Apparent horizontal variation is explained chiefly by the identities and bearings of the adjacent runes.
4. Vertical placement follows a shared line grid, with a small number of enlarged paragraph intervals also visible on solved material.

No stable discrete word-spacing or baseline alphabet has survived normalization, repeated-context testing, page-stratum comparison and solved-page controls. **Close this channel and do not continue bit-plane, threshold or word-gap extraction searches on the same premise** unless a new independent source clue selects a different observable or a reproducible counterexample appears.

### Limits

This tests the specified original-image layouts and integer-pixel measurements, not every one of the 55 unresolved pages or every conceivable color, subpixel, marginal or illustration channel. It does not mathematically exclude an encoding below the measured pixel scale. The 965-event census includes small dot-like marks generally; the exact word-boundary conclusion rests on the 37 transcription-identified repeated contexts. No plaintext, key, reversible operation or intended destination was recovered.

## Reproduction

Run from the repository root:

python sims/word_spacing_baseline_channel.py --image-dir resources/liber-primus

The script defaults to the repository's original page images and scan offset 17. It also accepts the extracted JPEG directory as the image-dir argument. Dependencies are numpy, Pillow and scipy. It prints the complete machine-readable summary, including all repeated-pair ranges and the exceptional line intervals.

This test is distinct from earlier printed-line glyph-width, line-start and p55 kerning experiments; it isolates inter-word dot placement and vertical row geometry across multiple page strata with solved-page controls.

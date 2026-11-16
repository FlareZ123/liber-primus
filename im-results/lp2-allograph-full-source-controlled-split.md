# Full-source controlled GP allograph split test

**Decision: no reproducible secondary allograph key channel is supported in the ordinary isolated glyphs of LP2 pages p0–p55.** The strongest page-held-out split is weaker than every one of 20 source-native no-message controls. No bit tape or plaintext was produced. This is a bounded negative for a common, visually readable binary/multiway same-rune form channel; it is not a general exclusion of image steganography.

## Inputs and source registration

The test uses the 58 original LP2 JPEGs in `resources/liber-primus/17.jpg`–`74.jpg`, the canonical `lp2-corpus.json`, and the fixed 163 ordinary source templates from solved p56/p57 in `sims/lp2_allglyph_original_allograph_sft.py`. All 58 images are 2400×3600 and have the same luma quantization table (SHA-256 `3a38d98a883064bc8f49c8d460c27b36a6382832ac8b2cf4`), matching the source corpus's Q92 table.

The source-locked extraction and sequence alignment reproduce the existing all-29 gate:

| Measure | Count |
|---|---:|
| Solved p56/p57 templates | 163 across all 29 GP classes |
| Ordinary-size connected components on 58 scans | 13,083 |
| Components mapped to a canonical source position | 13,041 |
| Exact source-sequence matches | 13,039 |
| One-to-one source substitutions | 2 |
| Source positions not exactly aligned (including the two substitutions) | 97 |
| Candidate components not aligned to a source position | 42 |
| Same-rune 5×5 morphology residual ≤0.03 | 12,963 |
| Unknown-page clean samples used here, p0–p55 | **12,789** |

The 12,789 test samples cover all 29 rune identities. Per-class counts in canonical GP order
`F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA`:

`[455,447,449,456,422,365,438,397,410,446,468,450,399,438,454,433,442,435,432,434,456,453,487,434,475,442,444,468,460]`.

The 12,789 are not the full 12,956 unknown source positions: source-unmapped positions and same-rune morphology outliers are excluded rather than silently classified as alternate forms. The previous [all-29 source-glyph gate](lp2-allglyph-original-source-form-gate.md) adjudicates its 120 all-scan morphology outliers (mostly joined components, art, punctuation and numerals). Red/black is measured separately: 198 red glyphs remain in the unknown-page sample and are used as an ink-class nuisance variable, not as a candidate bit channel.

## Frozen test

Each source-aligned candidate is compared only with solved-source templates of its canonical rune identity. Samples above the fixed 0.03 morphology residual are excluded. The remaining glyphs are aspect-preservingly normalized to 72×60 binary masks. The feature family is 6×6-pixel patch occupancy at stride 6 (120 patches per glyph).

For each rune class, patch occupancies are centered within physical page/line groups, then nuisance-regressed on log height, log width, log ink area, ink class, horizontal page position, and categorical JPEG block phase `x mod 8` and `y mod 8`. The page-line centering controls local line position. Page parity is frozen before feature selection: train on even pages and test on odd pages, then reverse the split. The training side selects the largest adjacent residual-occupancy gap subject to each side containing at least 15% of samples and both sides recurring across at least three pages with at least two shared pages. The selected patch and threshold are then frozen for the opposite-parity evaluation.

The statistic is the maximum held-out selection score across all 29 rune classes and both page parities. This is a familywise search, not a post-selected single-rune test.

### Source-native no-message controls

Twenty synthetic books are generated from same-rune p56/p57 prototypes. Each target glyph retains its original page, line, box dimensions, ink class, horizontal position and JPEG block phase; the selected source prototype is resized to that target box, then receives independent ±1-pixel registration jitter and 10% one-pixel dilation / 10% erosion. The same feature selection, nuisance regression, page split and familywise maximum are rerun for every replicate. Seeds are 4401–4420.

This 56-page extension preserves the source Q92 templates and controls JPEG phase, but it does **not** re-encode each synthetic full page as JPEG. The separate [six-page exact-Q92 synthetic null](lp2-allograph-synthetic-no-message-control.md) performs that full-page recompression control and includes a planted positive control; its limits are stated below.

## Results

| Statistic | Result |
|---|---:|
| Observed familywise held-out maximum | **0.0006985316** |
| Best class | S (GP index 15, `ᛋ`) |
| Selected patch | (30, 42) in the 60×72 normalized mask |
| Training split | 65 / 141 across 24 / 27 pages |
| Held-out split | 69 / 158 across 25 / 28 pages |
| Pages containing both held-out groups | 25 |
| Held-out residual effect | 0.0662866 |
| Synthetic no-message maxima, 20 replicates | 0.0008262137–0.0015698324 |
| Null median | 0.0010798965 |
| Null replicates ≥ observed | **20/20** |
| Plus-one empirical p | **1.000** |

The highest observed patch is not a distinct readable S allograph: group-mean glyph masks are visually the same form, with only small edge-pixel occupancy differences. More importantly, the same or larger page-held-out splits arise under source-native no-message resampling. No source-fixed binary/multiway form assignment survives this control. Therefore there is no defensible ordered feature tape to read or use as a key.

The independent [six-page Q92-recompressed null](lp2-allograph-synthetic-no-message-control.md) is concordant: its observed familywise maximum 0.0271318 is below every canonical no-message replicate (minimum 0.0303622; 20/20 nulls ≥ observed), and a planted 20×20 terminal mark is detected in 5/5 positive-control replicates. That result tests a different six-page sample and a conspicuous positive control; it does not prove sensitivity to invisible or subpixel marks.

## Interpretation and route decision

Close this branch. The full-source test covers all 29 rune identities and the 12,789 clean, source-aligned ordinary glyphs on the 56 unknown pages. Its best candidate is not visually distinct and fails the familywise source-native null comparison. The previous full 58-image morphology gate and exact-Q92 six-page control independently support the same decision.

Do not construct a bitstream, optimize thresholds against English, or rescue this hypothesis by selecting new runes, pages, patches or post-hoc feature definitions. Reopen only with a new source-visible clue that predicts a specific untested visual state or a held-out readout. This result recovers no unknown plaintext, key, cipher operation or Cicada destination.

## Reproduction

From the repository root:

```bash
python -m pip install numpy pillow opencv-python-headless
python sims/lp2_allograph_full_source_controlled_split_sft.py --null-reps 20 --seed 4401
```

The script reuses the frozen p56/p57 extraction in `lp2_allglyph_original_allograph_sft.py`, asserts the source alignment and 12,963 morphology-match counts, checks the 58-image Q92-table identity, and prints the full familywise null distribution as JSON. The matching manual workflow is `.github/workflows/lp2-allograph-full-source-controlled-split-manual.yml`.

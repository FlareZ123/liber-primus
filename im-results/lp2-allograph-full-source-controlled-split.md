# Full-source controlled GP allograph split test

**Decision: no reproducible secondary allograph key channel is supported in the ordinary isolated glyphs of LP2 pages p0–p55.** The strongest page-held-out split is weaker than every one of 20 source-native no-message controls. No bit tape or plaintext was produced. This is a bounded negative for a common, visually readable binary/multiway same-rune form channel; it is not a general exclusion of image steganography.

## Inputs and source registration

The test uses the 58 original LP2 JPEGs in `resources/liber-primus/17.jpg`–`74.jpg`, the canonical `lp2-corpus.json`, and the fixed 163 ordinary source templates from solved p56/p57 in `sims/lp2_allglyph_original_allograph_sft.py`. All 58 images are 2400×3600 and have the same luma quantization table (SHA-256 `3a38d3fbf7a420a06503d98a883064bc8f49c8d460c27b36a6382832ac8b2cf4`), matching the source corpus's Q92 table.

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

For each rune class, patch occupancies are centered within physical page/line groups, then nuisance-regressed on log height, log width, log ink area, ink class, horizontal page position, and categorical JPEG block phase `x mod 8` and `y mod 8`. The page-line centering controls local line position. Page parity is frozen before feature selection: train on even pages and test on odd pages, then reverse the split. The training side selects the largest adjacent residual-occupancy gap subject to each side containing at least 15% of samples and both sides recurring across at least three pages with at least two shared pages. The selected patch and threshold are then frozen for the opposite-parity evaluation. The runner deterministically selects one of two tied, equal-scoring patches; the statistic and null comparison are unchanged.

The statistic is the maximum held-out selection score across all 29 rune classes and both page parities. This is a familywise search, not a post-selected single-rune test.

### Source-native no-message controls

Twenty synthetic books are generated from same-rune p56/p57 prototypes. Each target glyph retains its original page, line, box dimensions, ink class, horizontal position and JPEG block phase; the selected source prototype is resized to that target box, then receives independent ±1-pixel registration jitter and 10% one-pixel dilation / 10% erosion. The same feature selection, nuisance regression, page split and familywise maximum are rerun for every replicate. Seeds are 4401–4420.

This 56-page extension preserves the source Q92 templates and controls JPEG phase, but it does **not** re-encode each synthetic full page as JPEG. The separate [six-page exact-Q92 synthetic null](lp2-allograph-synthetic-no-message-control.md) performs that full-page recompression control and includes a planted positive control; its limits are stated below.

## Results

| Statistic | Result |
|---|---:|
| Observed familywise held-out maximum | **0.0006985316** |
| Best class | S (GP index 15, `ᛋ`) |
| Selected patch | (36, 66) in the 60×72 normalized mask |
| Training split | 141 / 65 |
| Held-out split | 158 / 69 across 28 / 25 pages |
| Pages containing both held-out groups | 25 |
| Held-out residual effect | 0.0662866 |
| Synthetic no-message maxima, 20 replicates | 0.0008262137–0.0015698324 |
| Null median | 0.0010798965 |
| Null replicates ≥ observed | **20/20** |
| Plus-one empirical p | **1.000** |

The highest observed patch is not a distinct readable S allograph: group-mean glyph masks are visually the same form, with only small edge-pixel occupancy differences. More importantly, the same or larger page-held-out splits arise under source-native no-message resampling. No source-fixed binary/multiway form assignment survives this control. Therefore there is no defensible ordered feature tape to read or use as a key.

The independent [six-page Q92-recompressed null](lp2-allograph-synthetic-no-message-control.md) is concordant: its observed familywise maximum 0.0271318 is below every canonical no-message replicate (minimum 0.0303622; 20/20 nulls ≥ observed), and a planted 20×20 terminal mark is detected in 5/5 positive-control replicates. That result tests a different six-page sample and a conspicuous positive control; it does not prove sensitivity to invisible or subpixel marks.

## Explicit rotation and reflection receiver (Agent37, 25 November, #2852)

The separate orientation hypothesis is now tested directly, rather than relying on generic patch-occupancy negatives. The receiver uses the same source-labelled extraction for 163 ordinary solved templates, with **84 p56 templates covering all 29 identities** as the only recognition bank. p57's 79 templates are untouched-page controls. It searches a fixed 192×192 centered mask at original physical scale, downsampled to 48×48, against identity and rotations ±3°, ±6°, ±12°, 90°, 180°, 270° and horizontal, vertical and both diagonal reflections. The detector compares cosine similarity against the best upright template and, independently, against the best transformed template over all 29 identities (to catch rotated shapes that would not be admitted by an upright classifier). The prespecified decision is margin ≥0.025 and transformed similarity ≥0.90; the 78 p56-only leave-one-out calibrants have maximum margin 0.0109868, and the 79 independent p57 controls have maximum margin 0.00679851 and minimum upright similarity 0.98176551. This is a finite geometric detector rather than a hidden-bit clustering or language search.

The scan admits components in the original common text window (440,440)–(2100,3250), grayscale threshold 160, area >200, minimum dimension ≥7 and longest dimension >80 and ≤122 pixels. Allowing either long dimension is important for quarter-turns. Page skew is estimated by the median of robust within-line top-edge slopes for high-confidence glyphs; every measurable page median is 0°, and the largest absolute individual line estimate is 0.104174°. Thus no image deskew is needed at the tested ±3° resolution. Centering removes positional translation; preserving scale prevents turning altered aspect ratios into an artificial orientation channel.

| Original scope | Candidate components | Upright similarity ≥0.90 | Confident transformed winner |
|---|---:|---:|---:|
| LP1 (archive 00–16) | 2,704 | 2,632 | 0 |
| Unknown LP2 p0–55 | 12,939 | 12,789 | 0 |
| Solved p56–57 | 177 | 174 | 0 |
| Total | 15,820 | 15,595 | 0 |

No same-identity or unrestricted-class transformed candidate meets the decision threshold, including among the 225 low-upright-confidence components. The strongest margin among confident unknown glyphs is only +0.021618, for GP index12 (EO, ᛇ), size 40×112 pixels. The exact same measured upright similarity 0.97644 and transformed advantage occur 46 times in unknown LP2 and six times in solved LP1. Example original coordinates (x,y,w,h): physical p0/archive17 (601,2557,40,112), p1/archive18 (1078,1616,40,112); solved archive01 (1407,891,40,112) and archive03 (1244,1616,40,112). This recurring raster form is not a unique LP2 direction state.

### Independent direction-positive controls

Rotate or reflect each of the 79 held-out p57 masks, keeping the p56 bank fixed. Eligibility below applies the same bounding-dimension and area limits as the source scan; both same-identity and unrestricted detectors give these counts.

| Operation | Eligible / 79 | Detected / eligible |
|---|---:|---:|
| −3°, +3°, −6°, +6° (each) | 79 | 79 |
| −12° | 72 | 72 |
| +12° | 75 | 75 |
| 90°, 270° (each) | 79 | 79 |
| 180° | 79 | 58 |
| Horizontal reflection | 79 | 48 |
| Vertical reflection | 79 | 69 |
| Both diagonal reflections (each) | 79 | 79 |

Incomplete 180°/reflection sensitivity is expected for symmetric or nearly symmetric runes; this is explicitly measured, not treated as a hidden signal. The plants are transformed isolated masks, not full-page JPEG-reencoded interventions. Unknown-page components are recognition-labelled by the frozen p56 bank, not independently re-aligned here to canonical positions; the earlier source-alignment study above gives the independent coverage baseline. The 12,789 high-confidence count agrees with that study, but agreement does not prove identical assignments. Large/merged glyphs, illustrations, crop-excluded components, microtilts below 3°, rotations outside the discrete tested set, direction changes invisible in a symmetric glyph, and transformations that exactly masquerade as another upright GP rune remain outside this gate. No per-ink or phase-specific threshold was tuned, and the global test includes both ink colors.

Reproduce locally using the supplied original ZIP and [orientation receiver](../sims/lp2_orientation_original_gate.py): `python sims/lp2_orientation_original_gate.py liber-primus-jpegs.zip orientation.json`. The JSON contains the complete 15,820-row coordinate/score tape, ordered by page and component x-position, including the two decision margins and operation labels; it is not a decoded key stream. Archive index = reported page +17, so negative page IDs designate LP1. Run with Python, NumPy and OpenCV; the local OpenCV 4.13.0 execution completed, no new CI run is claimed.

**Decision:** retire this explicit ordinary-glyph orientation/reflection receiver. No stable source-selected direction alphabet or key is established. A proposal for a new direction mechanism needs a particular original glyph, read order and a discriminating prediction beyond the tested rotations; do not restart unconstrained shape searches.

## Interpretation and route decision

Close this branch. The full-source test covers all 29 rune identities and the 12,789 clean, source-aligned ordinary glyphs on the 56 unknown pages. Its best candidate is not visually distinct and fails the familywise source-native null comparison. The previous full 58-image morphology gate and exact-Q92 six-page control independently support the same decision. The explicit p56-trained rotation/reflection receiver above additionally finds zero confident transformed winners across the broadened 75-image component scan.

Do not construct a bitstream, optimize thresholds against English, or rescue this hypothesis by selecting new runes, pages, patches or post-hoc feature definitions. Reopen only with a new source-visible clue that predicts a specific untested visual state or a held-out readout. This result recovers no unknown plaintext, key, cipher operation or Cicada destination.

## Reproduction

From the repository root:

```bash
python -m pip install numpy pillow opencv-python-headless
python sims/lp2_allograph_full_source_controlled_split_sft.py --null-reps 20 --seed 4401
```

The script reuses the frozen p56/p57 extraction in `lp2_allglyph_original_allograph_sft.py`, asserts the source alignment and 12,963 morphology-match counts, checks the 58-image Q92-table identity, and prints the full familywise null distribution as JSON. The matching manual workflow is `.github/workflows/lp2-allograph-full-source-controlled-split-manual.yml`. The implementation completed successfully in [GitHub Actions run 43875150975](https://github.com/FlareZ123/liber-primus/actions/runs/43875150975); its JSON artifact is retained for seven days.

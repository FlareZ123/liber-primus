# LP2 same-rune outline channel: source-compatible no-message control

**Decision (Issue #742): retire the tested discrete intra-rune shape-bit branch.** Across 1,422 original glyphs on six unknown pages, the strongest source-registered local shape split did not exceed either synthetic no-message model. A deliberately conspicuous positive control was detected in every replicate. This is a bounded negative for the tested outline channel, not a general exclusion of image steganography.

## Inputs and registration

- Original Stage11 JPEGs: p29 (46.jpg), p34 (51.jpg), p35 (52.jpg), p43 (60.jpg), p47 (64.jpg), p52 (69.jpg), p55 (72.jpg), and solved p57 (74.jpg).
- Unknown-page target: p29 **277**, p34 **261**, p35 **271**, p47 **274**, p52 **263**, p55 **76**; **1,422** glyphs total, all 29 GP29 rune identities represented.
- Source-native prototype pool: p43 **274** source-labeled glyphs across all 29 classes, plus **65 black-ink** glyphs from solved p57. p57 has 95 known plaintext runes; this control uses its first four lines, excluding the seven red PARABLE initials and final 23-rune line. The 65 used glyphs cover 18 classes.
- The six target pages have **zero red pixels inside registered glyph boxes**. Red/special glyphs were not mixed into the black-font test.
- The original JPEG luma quantization tables are identical and match standard **Q92**. The synthetic renders use the exact source luma table.

The standard source-only row/column registration was reused for p29, p34, p35, p43, p47, p52 and p55. The p57 black subset is registered separately by its first four printed line bands; the detected counts are 13, 17, 17 and 18, matching the source-known black-rune sequence.

## Frozen test

Each glyph is aspect-preservingly normalized to a 72×60 binary outline. For every rune class, the test scans 6×6 patches at stride 6, finds the largest adjacent occupancy gap, and scores it by occupancy effect × split balance × gap. Both sides must contain at least max(4, ceil(0.15*n)) samples and recur on at least two distinct unknown pages. The reported statistic is the maximum over all 29 rune identities and all scanned patches, so the null comparison is familywise rather than a selected-rune p-value.

Two source-compatible synthetic no-message models replace the registered target glyph boxes with source-native same-rune prototypes while preserving each target page's text-region background, original glyph positions and box dimensions, then recompressing with that page's exact Q92 luma table:

1. **Canonical model:** one randomly selected p43/p57 prototype per rune per synthetic book; each glyph receives independent ±1-pixel registration jitter and 10% one-pixel dilation / 10% erosion.
2. **Mixed-exemplar model:** a randomly selected p43/p57 same-rune exemplar per target glyph, with the same position, stroke-width and Q92 controls. This deliberately includes more natural source-exemplar variation and is the conservative envelope.

The positive control plants a 20×20 terminal-corner mark on alternating T glyphs across the target pages (20 planted glyphs per replicate). It tests sensitivity to a conspicuous shape split; this does **not** establish sensitivity to one-pixel or subpixel payloads.

## Results

**Observed familywise maximum: 0.0271318.**

The top candidate is T, with 43 glyphs and a 22/21 split across p29, p34, p35, p47 and p52. Its selected patch has a 0.1667 occupancy effect, but its familywise score is lower than every canonical no-message replicate.

| Distribution | Replicates | Minimum | Median | 95th percentile | Maximum | Null replicates ≥ observed | Plus-one p |
|---|---:|---:|---:|---:|---:|---:|---:|
| Canonical no-message | 20 | 0.0303622 | 0.0331792 | 0.0386785 | 0.0405462 | 20/20 | 1.000 |
| Mixed-exemplar no-message | 20 | 0.3617511 | 0.4575832 | 0.5770371 | 0.5948287 | 20/20 | 1.000 |

The planted 20×20 T control scored **0.930233** in all five replicates and exceeded both null models' 99th percentiles in **5/5** replicates. Thus the detector can recover a large, stable, cross-page shape split; the observed original candidate is below the no-message envelope.

## Interpretation and limits

No stable discrete source-fixed same-rune outline split is supported in these six pages. There is consequently no defensible bit assignment or read order to apply to a held-out passage; no bitstream was interpreted. Close this specific allograph-channel investigation rather than rescuing it with post-hoc patch, rune, or page choices.

This does **not** exclude smaller-than-tested stroke perturbations, all red/special glyphs, illustration payloads, F5/JPHide, steganography in other image features, or other cipher mechanisms. It recovers no plaintext, key, cipher operation, or destination. The result is a branch-pruning negative, not a manuscript solution.

## Reproduction

From repository root, with the original JPEGs and resources/liber-primus/lp2-corpus.json present:

~~~bash
python sims/lp2_allograph_synthetic_null_sft.py --null-reps 20 --plant-reps 5 > im-results/lp2-allograph-synthetic-null-run.json
~~~

The script fixes seed 7980588601619, asserts source glyph counts and p57 registration, checks Q92 tables, and prints the complete machine-readable output; redirect stdout to preserve a run artifact.

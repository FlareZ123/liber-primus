# LP2 OE/A original-ink phase-matched allograph holdout

**15 November 2026; Agent 6, Director Issue #1183.** No secondary interior/exterior ink-mark alphabet was detected for the two most abundant GP29 classes, OE and A, after freezing glyph dimensions and JPEG 8×8 phase. This is a bounded negative source-image result, not a decryption.

## Original question and controls

A source-authored visible allograph would need to persist across independently printed source pages and be separable from normal rasterization. Earlier [all-29 silhouettes](lp2-allglyph-original-source-form-gate.md), [27-page shape controls](lp2-original-glyph-outline-phase-heldout-gate.md), and [six-page simulated no-message control](lp2-allograph-synthetic-no-message-control.md) already rejected gross redraws and arbitrary patch splits. This test instead freezes exact dimensions and 8×8 image phase on the most frequent ordinary runes before evaluating internal dots or erased strokes.

Original p0–55 GP29 counts independently select OE/index22 (492 total) and A/index24 (482 total). The immutable inputs are original LP2 scans 17.jpg–72.jpg, 2400×3600 each. The previously source-validated [29-class font prototype](../sims/lp2_original_rune_typography_sft.py) learns glyph identities on p32/p55 with eligible cross-page agreement 107/107 and 76/76, without guessed plaintext. The new [single-file reproducible test](../sims/lp2_oe_a_phase_allograph_original_sft.py) detects glyphs using grayscale threshold 155 and prototype cosine similarity at least 0.90.

## Frozen method and independent holdout

All unknown rune-bearing pages except p0,2,4,6,8,10 form 49 training pages. Those six early pages remain a withheld original-image check; p50 has only numeric table cells. Within each OE or A class, samples share exact image (height,width), x mod 8, and y mod 8. A group with at least three source instances yields its frozen majority silhouette. A two-pixel four-connected dilation/erosion contour envelope surrounds that template. A variant carrying a dot away from the outline or an absent interior stroke would produce noncontour differences.

The positive control plants a four-by-four-pixel dot outside the ordinary contour envelope in one held-out glyph per identity. The source glyphs are never altered. Exact held-out crop locations and SHA-256 of their packed binary masks are emitted by the SFT.

## Finite original-source results

| Measure | OE | A |
| --- | ---: | ---: |
| High-confidence training glyphs, all shapes/phases | 312 | 324 |
| Frozen phase/size groups with ≥3 instances | 47 | 57 |
| Training glyphs in those groups | 195 | 260 |
| Training majority-mask differing pixels | 5,813 | 8,817 |
| Training differences outside two-pixel contour | **0** | **0** |
| High-confidence unseen early-page glyphs | 44 | 28 |
| Held-out glyphs with frozen matching group | 18 | 16 |
| Held-out majority-mask differing pixels | 847 | 692 |
| Held-out differences outside two-pixel contour | **0** | **0** |
| Noncontour differences after planted four-by-four dot | **≥16** | **≥16** |

Across 455 matching training and 34 matching withheld glyphs, there are 16,169 changing contour pixels and **zero** changes outside the ordinary two-pixel border. The remaining 38 held-out glyphs lack a ≥3-member training phase/size group and are explicitly unclassified in this gate. Near-boundary variability is compatible with font hinting, fractional raster origin, and JPEG compression, without providing an independently reliable second alphabet or a printed bit-reading instruction.

**Original-source replay:** The completed [GitHub Actions run 43776226192](https://github.com/FlareZ123/liber-primus/actions/runs/43776226192) executed the immutable original JPEGs and committed source SFT under Python 3.12, NumPy 2.2.6, Pillow 11.3.0 and OpenCV 4.12.0.88. All training/held-out cardinality, pixel-difference, contour and synthetic-positive assertions **passed**. The two-pixel morphology explicitly uses constant-zero exterior padding at the tightly cropped glyph boundaries, matching the independent local SciPy source control and avoiding OpenCV's different default erosion-border convention.

## Causal decision

**Retire the tested OE/A independent interior-mark channel.** There is no source-supported second glyph class, bitstream, cryptographic key, or recovered unknown-page plaintext. The test does not exclude a one-pixel edge variant, fused/red initials, other rune classes, or steganography outside ordinary glyph outlines. Other existing repository reports already cover substantial portions of those alternatives. Reopen only for an independently selected authorial variant, bit-order clue, or original-image noncontour mismatch. Avoid another arbitrary patch/phase search.

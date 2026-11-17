# Same-rune-pair spacing widths and original-line residual cancellation

**Agent 47, 17 November 2026. Supporting measurement to an existing stronger result.** The decisive one-pixel-channel bound was already published by Agent 35 on 15 November as [the original microspacing innovation bound](lp2-original-microspacing-innovation-bound.md), with original-image positive plants and an estimated latent full-pixel innovation variance of 0.05544 px² versus 0.29499 px² after an independent one-bit watermark. **This note does not claim to discover or independently close that channel.** It supplies the narrower, complementary original-image fact that pixel-width variation for otherwise identical ordered glyph pairs is tightly localized and correlated along physical lines. It recovers no plaintext, key or decoding instruction.

## Source-conditioned measurements

Start with the established image-native 29-class font model in [the original typography reproducer](../sims/lp2_original_rune_typography_sft.py) and its exact 25-page held-out set. Its own source assertions pin the training pages (LP2 physical pp32 and55), classify all 29 rune symbols from 197 glyphs, and recover precisely **6,352** original adjacent gaps at ≥0.88 two-glyph confidence. Use unchanged original 2400×3600 JPEGs and fixed visible-punctuation counts.

Unlike the prior innovation-variance test, hold fixed each pair's *specific* incoming and outgoing GP29 identities and the number of actual printed punctuation ink components between them. Among **781** ordered-rune/visible-dot classes that repeat at least four times, representing **4,944** source gaps:

| Distinct integer advances measured for the same rune-pair/punctuation class | Classes |
| --- | ---: |
| One pixel width only | **154** |
| Two adjacent widths | **523** |
| Three adjacent widths | **104** |
| Four or more | **0** |

Relative to the modal advance within its exact class, **3,624 of 4,944** have zero residual, **1,271** deviate by one pixel, and **49** deviate by two pixels. This concentration is a directly measured property; a bit alphabet based on the mere existence of two widths would be postselection without an original authored decoder.

Next use the *training-fitted* outgoing/incoming glyph-bearing model from the earlier benchmark. Exactly **6,034 physically consecutive held-out gaps** have lag-one residual correlation approximately **−0.30858**. A seed-3301 null shuffles existing error values *only within their original printed lines* while retaining original missing-pair positions; the original adjacency is more negative than all 1,000 shuffled controls (conditional permutation tail bound at most **1/1001**). The per-line absolute sum of residual advances has **median 1.20px**, **90th percentile 2.57px**, and **maximum 4.89px**. These are expected signatures of shared-coordinate rounding, consistent with Agent 35's physically stronger innovation test. They cannot exclude a sparse, balanced, quantization-aware, or otherwise source-keyed microchannel.

## Decision and reproduction

The combined source evidence **does not support decoding ordinary ±1-pixel gap fluctuations into a binary message**; the prior physically planted one-pixel test is the stronger exclusion of a dense independent full-pixel channel. No amount of alternative ASCII bit ordering can fix the missing original-state readout. Source-authored evidence of an ink-position cipher would be necessary to revive the branch.

The [small companion standalone SFT](../sims/lp2_original_rune_microspacing_sft.py) imports the already tested source glyph extractor, asserts the above exact pair-width counts, computes original residual adjacency, and carries out the 1,000 fixed per-line permutations. It requires Python3, NumPy, Pillow and OpenCV, and writes no files. The source-image companion passed [manual Windows CI run 44023862750](https://github.com/FlareZ123/liber-primus/actions/runs/44023862750). It intentionally does not repeat the older watermark sensitivity and 2,000-line-bootstrap work. Neither measurement changes the established LP2 cipher frontier in [results/README.md](../results/README.md).

# Original rune typography: no unmarked whole-space channel on 25 pages

**Agent 38, 15 November 2026. Intermediate original-JPEG experiment.** A font geometry learned on two original LP2 pages predicts **6,352** independent adjacent-rune gaps on 25 other original pages. Every inferred full-width separator corresponds to an independently visible small punctuation component. No source-selected LP2 key or unknown plaintext emerges; the result excludes a concrete, previously untested physical hiding channel on the sampled pages.

## The clue and test

2016's signed Cicada message makes the words and their numbers important, while earlier rounds used media containers and unprinted side data. Ordinary runic text spacing could in principle carry hidden instructions absent from community GP29 transcripts.

The falsifiable hypothesis is that an author inserted whole word-space-width gaps where no punctuation was printed, producing an independent bitstream in the native 2400×3600 JPEGs. Measure positions from the original pixels directly and compare independently estimated font advances with the actual ink of separator dots.

The original inputs are repository images under resources/liber-primus/17.jpg through 74.jpg and the canonical rune register in resources/liber-primus/lp2-corpus.json.

## Fixed source training

Source p32 (image 49.jpg) has 121 printed runes across six lines. Source p55 (72.jpg) has 76 across four lines. They give 197 glyph examples and all 29 GP classes. A horizontal ink projection finds full-height glyph components; separate tiny components between glyphs are counted as visible punctuation. Normalized 48×96 pixel silhouette comparisons classify the source's runes.

Cross-page tests recover **107/107** GP classes present on p55 when reading p32 with only p55 templates; the four p32-only classes are excluded from this control. The reverse test recovers **76/76** on p55 with only p32 templates. These results justify the combined 29-class source-image classifier.

The model for consecutive leftmost glyph ink positions is

\[
x_{i+1}-x_i=U_{a_i}+V_{a_{i+1}}+s d_i+\epsilon_i,
\]

where a is the observed GP class, U and V are fixed source font bearings, and d is the **visible** small-punctuation count. Fit the bearing terms and one shared punctuation advance s using only the 187 within-line training gaps. With the additive gauge fixed, the design has rank **58**, RMS training error **0.355323 pixels**, and a punctuation advance of **15.961334 pixels**.

## Independent original-image sample

The selected conventionally printed twelve-line pages are physical p1, p5, p9, p11, p12, p13, p16, p17, p18, p19, p20, p24, p25, p26, p28, p29, p30, p31, p34, p44, p45, p46, p47, p48 and p52. Their original images yield **6,696** rune components. Twelve pages (p9, p12, p13, p19, p26, p28, p29, p31, p34, p46, p47 and p52) have complete source-JPEG glyph streams exactly matching all GP symbols in the independently retained reference transcription. The others can still support confident local adjacent-glyph measurements.

| Held-out image measurement | Outcome |
| --- | ---: |
| Pairs with both glyph confidence scores at least 0.88 | **6,352** |
| Pairs with zero visible tiny punctuation components | 4,918 |
| Pairs with one visible tiny component | 1,356 |
| Pairs with two visible tiny components | 1 |
| Pairs with three visible tiny components | 77 |
| Mean absolute fitted-advance residual | **0.452405 px** |
| RMS advance residual | **0.584236 px** |
| Residual at most two pixels | **6,343/6,352** |
| Maximum absolute residual | **3.141857 px** |
| Inferred full-width punctuation units with no matching visible ink | **0/6,352** |

For the last count, calculate the inferred number of punctuation advances from two measured glyph positions and the frozen source font alone, rounding by the learned advance s. Compare this numerical prediction to the independently counted small-ink components. **Every original test interval agrees.** An extra covert space of approximately 16 pixels would create a mismatch.

## Cryptanalytic consequence and limitations

The ordinary printed-runic text gaps in these 25 pages are accounted for by consistent font metrics and by observable punctuation. These pages show no evidence of an invisible full-width space bit channel, so further unmotivated searches for such space units should be retired in favor of source-selected decoding mechanisms or independent key material.

The experiment does not test irregular text layouts, different glyph silhouettes, JPEG coefficients, microposition changes smaller than a full space, or whether the existing printed punctuation encodes information. This is a bounded exclusion, rather than an LP2 decipherment.

The [self-contained source-JPEG reproducer](../sims/lp2_original_rune_typography_sft.py) requires Python 3, NumPy, Pillow and OpenCV. It reads the original reference files, has no filesystem writes, asserts the source and held-out controls, and prints the complete measurements. No authoritative claim in [results/README.md](../results/README.md) changes.

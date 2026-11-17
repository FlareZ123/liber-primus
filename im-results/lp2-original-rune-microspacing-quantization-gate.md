# LP2 rune microspacing: a source-native test of sub-word-space ink shifts

**Outcome (Agent 47, 17 November 2026):** A new microscopic spacing test on **25 original LP2 JPEGs** finds that adjacent printed rune advances are highly consistent with ordinary whole-glyph positioning and shared rounding error. There is **no identified, source-appointed microspacing decoding rule, hidden bitstream, creator key or unsolved-page plaintext**. This is a measured constraint on a hypothetical steganographic carrier, rather than a proof that no sufficiently subtle payload exists.

## Clue and discriminating question

Cicada historically employed media steganography and authenticated participant material stressed the words and numbers. Original GP29 glyph placement could conceivably hide a side-channel omitted from Unicode runic transcription. The prior [whole-space inspection](lp2-original-rune-typography-space-channel.md) excluded any unprinted *full* punctuation advance of approximately 16 pixels on 6,352 source gaps, while explicitly leaving smaller deviations untested. This investigation examines that narrower surviving hypothesis.

The direct experiment preserves source image geometry, measures each glyph's pixel-leftmost ink position and separates deviations from the full-width dot separator. To avoid spuriously reading glyph-width or letter-pair effects as bits, the data are stratified by the actual ordered GP29 predecessor/successor and physically visible punctuation count. For residual correlations, a low-parameter 59-column outgoing/incoming glyph-bearing model is learned solely on two original training pages. The comparison uses physically adjacent glyph pairs and a blinded-by-permutation per-line null retaining each line's error values.

## Original input and results

- Source: unchanged first-party 2400×3600 JPEGs in \`resources/liber-primus/\` (original LP2 physical p32/p55 for training, plus the original 25-page held-out sample p1,5,9,11–13,16–20,24–26,28–31,34,44–48,52).
- Glyph classifier: 197 source-native training glyphs spanning all 29 GP classes. Accept only held-out ordered pairs whose two matched glyphs each have normalized template confidence ≥0.88. Exactly **6,352** held-out adjacent gaps pass, replicating the original whole-space benchmark.
- Repeated pair test: **781** ordered-rune/visible-dot classes have at least four occurrences, representing **4,944** measured source gaps. The observed integer step count for each repeated class has **one distinct value in 154 classes**, **two in 523 classes**, and **three in 104 classes**. Across 4,944 repeated samples, the deviation from the within-class most common integer advance is 0 in **3,624** cases, ±1 in **1,271**, and ±2 in **49**.
- Bearing-model calibration: original-page p32/p55 fit RMS **0.35532 px**, held-out RMS **0.58424 px**. This is the same font-advance fit as the earlier whole-space test and was not optimized on the held-out microspacing phenomenon.
- **6,034 physically adjacent held-out fitted-error pairs** have Pearson lag-one correlation **−0.30858**. In 1,000 independent, seed-3301 *within-line* shuffles of those same residuals, which preserve line labels, observed missing pairs, and each line's marginal error distribution, the original negative correlation is more extreme than every shuffled correlation. Empirical one-sided tail upper bound under that permutation null: **1/1001**. Because each measured gap shares one physical glyph position with its neighbor, negative adjacent covariance is expected from ordinary quantized point placement. This test distinguishes observed serial structure from independent per-gap jitter, but it does not identify the exact font rasterizer.
- Sum of residual advances within a sampled line has absolute median **1.20 px**, 90th percentile **2.57 px**, maximum **4.89 px**. These small cumulative errors are consistent with regular long-line typesetting and are unfavorable to a large unbalanced one-pixel-per-gap encoder.

## Decision and limitations

A simple claim that *each rune gap's ±1px deviation encodes an independent hidden bit* is not supported: the deviations depend strongly on neighboring glyph positions, and whole-line drift is small. However, a deliberately balanced pixel-channel could mimic these observations, and a secret coder could exploit quantization phase or subpixel placements. This experiment does not inspect DCT, alternate allographs, the illustrated pages omitted from the confidence sample, or a source-selected decoding key. Therefore it excludes no cryptographic mode beyond an unauthenticated naive independent-gap interpretation.

**Research decision:** Do not invest in brute-force ±1-pixel ASCII or bit assignments based solely on the 6,352 deviations. Revisit ink-position payloads only if original author material specifies a readout, controls, or a falsifiable intended message. Resources are better directed toward operations that genuinely invert LP2 ciphertext or select original key material.

## Reproduction

\`sims/lp2_original_rune_microspacing_sft.py\` is a standalone Python 3 script (NumPy, Pillow, OpenCV) that loads the original JPEGs and canonical GP29 source indices, repeats the independently checked whole-space model, computes the new repeated-pair statistics, and runs 1,000 frozen per-line permutations. It performs no writes, contains corpus and numerical assertions, and prints a JSON result summary.

Related work: [original whole-space test](lp2-original-rune-typography-space-channel.md), [canonical images and index mapping](../resources/liber-primus/README.md), and [current research frontier](../results/README.md). No change to established \`results/README.md\` is warranted.
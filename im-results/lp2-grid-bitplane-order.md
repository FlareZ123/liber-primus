# LP2 printed 32×8 table as a directly visible 32×64 bitmap

**Evidence class:** source-led, original-input negative diagnostic; no plaintext, cipher key, or final destination recovered. The exact source bytes, deterministic test and positive control are in [the self-contained SFT](../sims/lp2_grid_bitplane_source_order_sft.cjs).

## Human solve-path hypothesis and finite test

The 256 two-character base-60 tokens on original LP2 physical pp49–51 form a printed **32×8** table. A contemporary reader could interpret each recovered byte as eight bits, making **32 rows of 64 binary pixels**. A separately proposed original-image clue, the five-circle ornament's tentative **13/31** reading, supports a 32-state LFSR/de Bruijn **row ordering**, though that order requires independent choices of polarity, taps, direction and insertion of state zero. This experiment asks a narrower falsifiable question: does either the *printed* order or the *already published* source-proposed row permutation make a coherent unencrypted, horizontally aligned bitmap measurably more likely?

The two row orders are printed `0..31` and the fixed candidate
`[31,30,28,25,19,6,13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15]`.
Compute the count of vertically equal pixels between consecutive 64-bit rows, allowing the best of the **32 cyclic break points** to be selected. The maximum possible score is **31×64=1,984**. Changing MSB-first to LSB-first within each byte leaves this statistic unchanged. No change to the ciphertext or arbitrary image-registration fitting is involved.

Two fixed source readings are tested: (1) the repository's exact canonical `base60-grid.json` bytes, (2) a separately published five-cell image-audited alternative at flattened token indices 45/50/165/172/246, setting their values to 81/21/47/174/224. The canonical fixture stays unmodified. Each of the four row-order/source combinations is compared with a deterministic **30,000-permutation Fisher–Yates row-order null**, seed `0x3301`, where every shuffled matrix receives the same best-cyclic-break advantage. Thus the null preserves all original rows, byte marginals and within-row pixel patterns.

## Original results

| Source bytes | Row order | Best 31-join matching pixels | Null tail, including equality |
| --- | --- | ---: | ---: |
| Canonical base60 | Printed | 1,027/1,984 | 8,510/30,001 = **0.28366** |
| Canonical base60 | de Bruijn | 1,032/1,984 | 6,332/30,001 = **0.21106** |
| Five-cell alternative | Printed | 1,032/1,984 | 7,347/30,001 = **0.24489** |
| Five-cell alternative | de Bruijn | 1,028/1,984 | 9,196/30,001 = **0.30652** |

The canonical permutations have null mean **1,013.925** (SD **21.695**); the five-cell alternative has mean **1,016.562** (SD **21.567**). A 32-row positive plant with exactly one bit changed per successive row scores **1,953/1,984** and is detected by this statistic. None of the four original outcomes discriminates strongly from an arbitrary row permutation. The visually rendered 32×64 rasters likewise resemble pixel noise in these two fixed orders.

## Interpretation and limits

This is a **bounded failure of a source-visible raster interpretation**, rather than an all-image steganography exclusion. A genuine bitmap with intentionally weak vertical continuity, a different row/column map, XOR chaining, compression, encryption, a 2-bit pixel format or a key-selected bit permutation would escape this test. These additional mechanisms have no independent selector here. The candidate de Bruijn order is itself retrospective and the null tail does not correct for discovering it among alternative ornament readings. Do not use the small numerical differences between the four source-fixed tests to select a cipher key.

As the full table has not produced prose or other authentic payload through the independently motivated direct image route, future efforts should seek an actual original instruction specifying a decoder or key before opening a larger pixel-geometry search. The manuscript's 12,956 unsolved rune plaintext symbols remain wholly undeciphered.

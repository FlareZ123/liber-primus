# Original LP2 floral frames: exact 4 × 829 shape, and complete stationary Hill4 inverse gate

**Agent5, 14 November 2026. Classification: source-derived numerical alignment plus an exhaustive conditional original-cipher exclusion. Zero unknown plaintext or recovered key.**

## Why this particular operation was tested

The [original visual chapter atlas](lp2-global-original-visual-section-map.md) independently identifies the same floral border on **all sixteen physical LP2 pages p40–p55**, although original red punctuation divides the frames into two actual visual chapters at p53→p54. The canonical [source-indexed corpus](../resources/liber-primus/lp2-corpus.json) records their rune counts, including the rune-free numerical table on p50:

```text
p40..55: 231 273 272 274 273 270 270 274
         271  66   0  92 263 179 232  76
Total: 3316 = 4 × 829
```

Separately, the actual original p15 **4×4 numerical square** has already been deciphered as a [Fibonacci-indexed prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md). Its eleventh noninitial prime, **829 = prime(145)**, comes from the printed cell 2472 via **3301 − 2472**. The square also supplies sixteen numerical coefficients. Therefore four streams of 829 runes are a specific mathematical proposal spanning two *independently visible* manuscript objects.

**Selection caveat:** No source says to combine these two objects, group both visual chapters, interpret the p15 square as a Hill cipher, or use consecutive versus interleaved 4-symbol blocks. The 4×829 equality was recognized after reading the manuscript-wide counts. It remains a retrospective clue candidate, rather than a historically established decoding instruction. No parameters were optimized to make plaintext appear.

## Complete original-input inverse of the motivated family

To decisively test a useful interpretation without assuming the correct matrix key, all **3,316 authentic source runes** were divided into exactly **829 vectors of four GP29 symbols**, under each of the two natural layouts:

1. **Four consecutive rows:** the first 829 original glyphs form stream A, the next 829 B, then C and D; combine the same column from each row.
2. **Consecutive four-rune packets:** combine each adjacent set of four original glyphs; equivalent to a 4×829 matrix read by columns.

Under *any fixed invertible 4×4 Hill/linear transformation over GF(29)*, each putative plaintext stream is a nonzero **linear functional** of its four ciphertext input coordinates. Multiplying the functional by any nonzero field scalar merely permutes symbol labels and leaves the index of coincidence unchanged. All nonzero functionals therefore fall into exactly

```text
(29⁴ − 1) / (29 − 1) = 25,260
```

distinct projective directions. Every one was evaluated exhaustively and exactly on both original layouts. For 829 outputs, the source-literal index of coincidence is `Σsymbol f(f−1)/(829×828)`.

| Original-cipher layout | Maximum over **all 25,260** secret linear rows | Maximizing coefficient vector | Rows with IoC above 0.045 |
| --- | ---: | --- | ---: |
| Four consecutive 829-rune rows | **24,810/686,412 = 0.036144473** | [0,1,24,7] | 0 |
| 829 consecutive four-rune packets | **24,918/686,412 = 0.036301813** | [1,1,11,11] | 0 |

The original whole-packet IoC is approximately **0.03446**. By contrast the source-clear physical LP2 p57 PARABLE paragraph has an IoC of **0.062709966** across its 95 actual GP runes; the complete no-tuning true-p57-row planted control described below yields **0.071784876** at length 829. The observed gap is far larger than any result obtainable by freely choosing a secret Hill4 matrix in these two original layouts.

A source-specified direct p15 matrix also fails the original plain-language gate: its row-major GF29 values are

```text
10  3 20 22
 1 22 21 25
11 17 19  7
21 17 12 22
```

with modular determinant **17**, so it really is invertible. Neither M/Mᵀ nor their inverses can evade the exhaustive bound. This includes an exhaustive original-cipher negative even when the key is **completely unknown**; it does not rely on guessing the correct matrix orientation.

## Executed source-native positive and exact evidence

The self-contained [Windows Node22 SFT](../sims/lp2_floral_4x829_allsecret_hill_sft.cjs) asserts every original per-page rune count, the full 3,316 source runes, the 4×4 p15 matrix and its actual GF29 inverse, then scans all projective rows without a free phase, dictionary, page key or language-score fit. It also constructs four length-829 rows from the **authentic solved p57 GP sequence** by reproducibly repeating its 95-rune source stream at distinct shifts. The actual p15 matrix encrypts them; its exact inverse recovers all **3,316/3,316** planted source-symbol positions. The blind all-secret projection scan detects the native row with IoC **0.071784876**. This plant validates algorithmic discrimination; its repeated source words are not a statistical model of ordinary independent 829-rune English prose.

The [manual Windows Node22 GitHub Actions run 43564818148](https://github.com/FlareZ123/liber-primus/actions/runs/43564818148) completed successfully on **14 November 2026** and asserts exact maxima 24,810 and 24,918, including both original layouts and the positive-control recovery. The transcript and source are sufficient to reproduce the result locally using the existing canonical repo.

## Decision and scope

A **single stationary invertible 4×4 GP29 Hill transform of either ordinary 4×829 reading** cannot recover the kind of marginally concentrated native GP29 plaintext attested by actual solved PARABLE, regardless of any secret fixed Hill key. It cannot explain a normal-GP wordstream if each recovered 829-symbol lane should display that ordinary concentration. This excludes the entire precise linear model, including the originally printed matrix, and is stronger than testing a few keys.

The result does **not** disprove the numerical 4×829 equality, establish that the author designed it intentionally, reject alternative language registers, or constrain changing-state/nonlinear ciphers, non-linear transpositions, other page selections, word-boundary replacement, or an additional independent encryption layer. Since the original source gives no reversible operator beyond the bare count alignment, there is no honest ciphertext-to-plaintext route to extend from this result. Retire a fixed Hill4 interpretation unless new primary source instructions fix a distinct, falsifiable operation.

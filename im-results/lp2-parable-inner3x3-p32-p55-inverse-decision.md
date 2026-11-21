# PARABLE-selected p50 inner 3×3: original p32/p55 decryption decision

**Agent24, 21 November 2026. Outcome: three new, bounded, source-motivated original-cipher inverses fail to recover unknown text.** The three mechanisms are p32 source-tile 3×3 deconvolution, p55 three 5×5 convolution inverses using the same kernel, and p55 direct 3×3 Hill inverse. Each is finite, reversible where required, with a solved-page planted positive control and unmodified original LP2 ciphertext; **no unknown plaintext, original key, reproducible decoder or final destination recovered**. This does not diminish the new source table-address relationships reported at [the three-prime original graph triad](lp2-parable-threeprime-whole-graph-58-8-56.md).

## Why these are the shortest source-selected tests

The solved p57 PARABLE has three 2013 source-authenticated clause sums with prime ordinals **205,173,201**. Those address three corners of one 5×5 square of the original p50 32×8 number table. The p57 imperative "**WE MUST SHED OUR OWN CIRCUMFERENCES**" gives a player-readable instruction to peel its outer 16 cells, leaving exactly one **3×3** matrix without key fitting:

|  |  |  |
|---|---|---|
| `2k` | `2t` | `2O` |
| `0J` | `1L` | `0c` |
| `2d` | `1T` | `2u` |

Under the two existing competing p50 numeric conventions, the resulting matrices modulo the native GP29 alphabet are **base59** `[[18,27,26],[19,22,9],[12,1,28]]` and **base60** `[[21,1,28],[19,23,9],[14,2,2]]`. Both direct Hill3 matrices have nonzero GF29 determinants (10 and3 respectively).

The original p32 (scan `49.jpg`) depicts a blurred tree and has exactly 121 runes = 11×11; original p55 (`72.jpg`) depicts the corresponding outline and has **76** runes, including one opening carry from p54 and **75** complete-body runes. Three original PARABLE clauses therefore could suggest three 25-rune p55 squares, or a single set of 25 3-rune vectors. These are source-guided *possible cipher operands*, **not** evidence that the authors explicitly specified matrix inversion or convolution. Prior tests of a generic 3×3 Gaussian kernel, the p50 **11-cycle** image kernel and a **different LP1 Wisdom inner3×3 Hill** do not cover the newly sourced actual p50 inner3×3 coefficients.

## Original-cipher experiment A: zero-padded 3×3 spatial blur inverse

Interpret the fixed 3×3 source matrix as a normalized image-blur filter on either:
- p32, all 121 original GP29 runes in row-major 11×11;
- p55, the 75 intact-body GP29 runes in **three consecutive 5×5 registers**.

Use a conventional zero border on each register, normalized by the 3×3 entry sum (mod29). The exact 121×121 or 25×25 coefficient matrix is inverted by GF29 Gaussian elimination. Both **convolution** and **correlation** orientations are tested, under base59 and base60. No fitted boundary values, offsets, key changes, omitted runes, extra transforms, row rotations or invented char mapping.

| Fixed matrix/orientation | Original p32 inverse IoC | Original p32 long printed-word matches (≥4) | Original p55 inverse IoC | Original p55 long printed-word matches (≥4) |
| --- | ---: | ---: | ---: | ---: |
| Base59, convolution | 0.037878788 | **0/16** | 0.033873874 | **0/9** |
| Base59, correlation | 0.034848485 | **0/16** | 0.032792793 | **0/9** |
| Base60, convolution | 0.034573003 | **0/16** | 0.035315315 | **0/9** |
| Base60, correlation | 0.033608815 | **0/16** | 0.042522523 | **0/9** |
| Untouched original ciphertext | 0.034159780 | 0/16 | 0.038558559 | 0/9 |

Every p32 output roundtrips to the exact **121/121** original runes and every p55 output to **75/75** original runes. An independent plaintext plant from authentic solved p56/p57 recovers 121/121 and 75/75 under the same source-sized model in **all eight** frozen cases. Their ciphertext inverses remain nonlinguistic, with no complete original long-word dictionary hit.

**Reproducers:** [p32 SFT](../sims/lp2_parable_inner3x3_p32_deconvolution_sft.cjs), [successful Windows run 44951497311](https://github.com/FlareZ123/liber-primus/actions/runs/44951497311); [p55 triple-25 SFT](../sims/lp2_parable_inner3x3_p55_triple25_sft.cjs), [successful Windows run 44951696935](https://github.com/FlareZ123/liber-primus/actions/runs/44951696935).

## Original-cipher experiment B: direct Hill3 on p55

The same source 3×3 matrix has a simpler algebraic use: treat each three consecutive intact p55 runes as a GP29 column or row vector. **75=25×3** gives exactly 25 Hill3 blocks, preserving all original glyphs, without changing their phase. Test each radix and both natural vector orientations, with exact source matrix inversion and a solved-p57 75-rune encrypted plant.

| Original p55 source key and convention | Decoded GP29 IoC | Dictionary word hits among nine actual intact source words of length≥4 |
| --- | ---: | ---: |
| Base59, column | 0.037117117 | **0/9** |
| Base59, row | 0.032792793 | **0/9** |
| Base60, column | 0.037477477 | **0/9** |
| Base60, row | 0.031351351 | **0/9** |

The original input IoC is 0.038558559 and known native GP English is far more structured. The entire 75-rune original is exactly reencrypted under all four cases; all four planted solved-text registers are recovered exactly. The output includes occasional short English-looking fragments but no coherent sentence or complete original long word. An independent remote reimplementation from the same pinned source files gave these exact four scores when Actions logs were temporarily inaccessible; the original [Windows Node22 SFT run 44951828520](https://github.com/FlareZ123/liber-primus/actions/runs/44951828520) returned success and asserts the inverse and positive controls.

**Reproducer:** [p55 PARABLE p50 inner3×3 Hill SFT](../sims/lp2_parable_inner3x3_p55_hill3_sft.cjs).

## Source-selected terminal-page directions still open

The precise root-to-value relations add a potentially useful human navigation sequence:

- The independently authenticated 2016 signed word **DIRECTION** under the literal I+O GP spelling (an alternative prior project convention merges IO→IA and gives GP0=112), GP0=98 selects **p50[98]=`1C`=72** under conventional base60. The source original p55 happens to be **`72.jpg`**, 76 runes.
- The third PARABLE clause ordinal **201** selects **p50[201]=`1E`=74**, exactly the archive filename **`74.jpg`** holding the clear source PARABLE itself at p57; its next graph node74 points to the first clause ordinal **205**.
- The first PARABLE clause ordinal **205** selects **p50[205]=`1G`**, which is **76** under base60, the exact p55 all-rune length, or **75** under the source-debated base59, the exact p55 intact-body length.
- The middle PARABLE ordinal **173** supplies the eight-bit source-ancestor readout **169**, the fourth rectangle corner. Under base59 this fourth cell reads 224, equal to the GP prime-weight sum of the solved p56 word **PAGE**.

Together these relations offer a *specific, source-conditioned* p55→p56→p57 terminal-page hypothesis. All cross-references are source-exact numerical equalities, but the address convention, radix switching, JPEG filename reuse and image-blur/Hill consumers were inferred in research and remain **unauthenticated as intended creator actions**. They do not yield the p56 SHA512 preimage or any p55 decipherment.

## Decision

Retire the **twelve finite direct source-tile inverses** tested above. The existing 5×5 direct p55 Hill, totient pad and 2013-prime-branch attempts also fail. Do not search arbitrarily fitted kernels after those negative controls. Preserve the PARABLE triad, binary169 fourth-corner, base60 scan74/72 and dual-radix 76/75 relations for a future **source-fixed consumer with a new plaintext or key prediction**, especially one that specifies the missing 56-node mapping rather than making more numerical matches.
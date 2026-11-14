# Original LP2 two-plaintext-lag cipher with independent chapter alphabets

**Agent25, 14 November 2026. Finite source-native English rejection of one complete original-cipher family. No recovered unknown LP2 plaintext, authentic key or historical decoder.**

## Source-fixed decision and actual scope

The previous global-output-alphabet gate left a precise exception: each of the **nine original image-visible chapters** might use a different unknown 29-symbol output alphabet. This test grants each chapter an **arbitrary independent secret permutation**, covering all 29! bijections without attempting to guess them, but keeps one common ordered pair of GF29 two-plaintext-lag feedback coefficients over all chapters.

At each physical page position i >= 2, the model is

    (C[i] - C[i-1]) mod 29 = pi_chapter((P[i] + a P[i-1] + b P[i-2]) mod 29).

Each of the 55 rune-bearing physical pages has two independently invertible header positions, so the 110 page headers do not enter this necessary statistic. The original text contains 12,956 runes, 2,896 complete printed words (including 32 genuine page-carried words) and 12,846 tested within-page transitions. Chapter starts are p0, p3, p8, p15, p23, p27, p33, p40, p54, fixed by the source-visible red rune heading/previous red13 delimiter. No unknown page-specific π is added.

The **sorted 29-bin histogram of ciphertext differences in EACH chapter** must equal the sorted histogram of the corresponding plaintext feedback expression, regardless of its secret chapter permutation. The exact nine original rarest-bin counts are **[4,6,9,10,11,13,12,17,3]**, summing to **85**; this agrees with the original underrepresented equal-ciphertext-rune transition, and is not itself a newly decrypted symbol.

## Full 841-key control experiment

For each of nine independently sampled source-native GP-English tapes, the test draws **all 2,896 original word lengths** from Shakespeare, Gibran or Emerson (three control tapes each), preserving the original 55 physical page seams and all nine source-visible chapter boundaries. It uses the source-authenticated ING/IO orthographic encoder from the existing solved LP1/p57 controls. Seeds 0x33015637/38/39 are fixed; all 841 shared pairs a,b are evaluated against the untouched original 9×29 sorted histogram.

The score is the sum of absolute bin-count differences across all nine chapters divided by twice the 12,846 tested transitions (total-variation distance). This is the **best possible invariant histogram match under arbitrary independent chapter permutation**, though equal histograms alone would still be insufficient to decrypt.

| Native control | Best invariant TV | Best shared (a,b) | Smallest rarest-bin sum over nontrivial 840 pairs |
| --- | ---: | ---: | ---: |
| Shakespeare 1 | 0.024366 | (7,1) | 141 |
| Shakespeare 2 | 0.022497 | (24,8) | 161 |
| Shakespeare 3 | 0.023665 | (15,13) | 151 |
| Gibran 1 | 0.025455 | (17,7) | 159 |
| Gibran 2 | 0.023665 | (14,25) | 161 |
| Gibran 3 | 0.025300 | (14,14) | 165 |
| Emerson 1 | 0.023898 | (6,9) | 160 |
| Emerson 2 | 0.022964 | (24,12) | 163 |
| Emerson 3 | 0.022887 | (22,24) | 158 |

Across these nine independently generated native text controls, **none of the 841 candidate coefficient pairs** matches the original complete chapterwise sorted histogram. The smallest nontrivial feedback rarest-bin sum is **141**, while the original is **85**. The zero-feedback pair a=b=0 is explicitly included in the complete profile comparison; its native letter histogram likewise does not match. The full histogram comparison matters more than the rarest-bin diagnostic alone.

A complete 12,956-rune matched-native positive is encrypted with **nine distinct independently generated nonaffine secret chapter permutations** and fixed shared a=10,b=20. It decodes all 12,956 symbols, checks both initial runes per page, round-trips every rune, reproduces the complete chapterwise histogram invariant, and rejects a wrong-chapter key. The positive is a functional control and provides no evidence that Cicada selected this operation.

## Decision and limitation

The per-**visual-chapter** secret output-alphabet variant is rejected **within these nine finite source-native English reference samples**, even though every possible chapter permutation is granted. This is a new scope relative to the prior single-global-π gate. It leaves open independently changing π **per physical page**, different original plaintext registers, changing coefficients, a distinct feedback equation, and any operation with a source-selected key.

This model remains conjectural as a historical cipher. No original LP2 runes were deciphered, and no free cipher-layer search follows from the finite negative. The next useful advance would be an authentic original clue selecting an algorithm/key or a native plaintext signature that does not assume the proposed cipher.

**Reproducer:** [Windows/Node 22 CommonJS single-file test](../sims/lp2_two_plain_lag_chapterpi_allkey_sft.cjs), using only preserved repository corpus/controls and the existing original-source orthography helper. **Prior distinct global-π test:** [original all-key gate](lp2-two-plaintext-lag-original-allkey-gate.md). **Chapter source map:** [original visual structure](lp2-global-original-visual-section-map.md).

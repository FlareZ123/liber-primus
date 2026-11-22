# P15 Fibonacci ordinal readout on P32: 463 checksum, direct-key negative

**Status (11 November 2026): exploratory original-cipher clue; no recovered plaintext, authentic key or authorial readout.** This is a bounded comparison of a source-exact p15 index rule with the independently established p32 11×11 prime-weight matrix. It adds one reproducible cross-artifact numerical candidate and retires a direct additive key interpretation without fitting cipher parameters.

## Source premise and readout

Original physical p15's red-start spiral has 16 values generated from the **distinct Fibonacci inputs** `0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987` by the published exact formula `abs(3301-prime(F+1))`. The 11 inputs through 89 give one-based prime ordinals **[1,2,3,4,6,9,14,22,35,56,90]**. Source physical p32 contains exactly 121 runes; its row-major 11×11 square has original GP-prime first-row and first-column sums **563** and **569**, the independently signed-2016 tree JPEG dimensions ([original 11×11 geometry](../im-results/tree-prime-canvas-partition.md)).

Select the eleven p32 cells at zero-based addresses `[0,1,2,3,5,8,13,21,34,55,89]` and sum their *original Gematria Primus prime weights*. Four standard readings of the same 11×11 cell array (unaltered row/column and reverse directions) yield:

| Matrix reading | Sum of the 11 GP prime weights |
| --- | ---: |
| Original row-major | 443 |
| Original column-major | 549 |
| Reversed row-major | 479 |
| **Reversed column-major** | **463** |

The reversed-column readout produces **EO A J TH B TH B W G J OE**, and its sum **463** is exactly the **90th ordinary prime** from the final selected p15 Fibonacci input `F=89` (`prime(F+1)`). Of the 52 unknown original pages with at least 121 runes, only p32 meets this same equality under any of the four fixed readings. The original p15 and p32 sources do **not** instruct transposing or reversing, nor say that the 11 glyphs are a key. This is consequently a candidate numerical alignment, not a decipherment.

### Original-cipher discriminators

A deterministic, 100,000-trial Fisher-Yates permutation of the p32 **100 inner cells** preserves its original first row, first column and their independently established 563×569 signed-image checksum. Shuffles matching 463 by original row/column/reverse row/reverse column number **[956,896,179,416]**; at least one of four orientations matches in **2,426/100,000** trials (conditional plus-one **0.02426976**). The p15-to-p32 interpretation, 11-position truncation and 463 target were identified during exploration. The conditional tail does not account for the broader hypothesis search, so no authorial significance is established.

Treat the 11 runes as a literal periodic GP29 Vigenère additive key under both signs, without chosen phase or trained plaintext. On physical p32 (121 runes), the p33:91..p39:119 original three-dot-bracketed interval (1,468 runes), and the full unsolved 12,956 runes, the original and decoded indices of coincidence are:

| Input | Original | Minus key | Plus key |
| --- | ---: | ---: | ---: |
| p32 | 0.03415978 | 0.03801653 | 0.03388430 |
| Original three-dot bracket | 0.03431255 | 0.03437292 | 0.03459952 |
| Entire unknown book | 0.03447840 | 0.03445670 | 0.03447401 |

No candidate yields coherent native-GP prose. Encryption/decryption using the same key exactly restores a 95-rune solved-p57 plant, checking the implementation. This retires only the direct literal 11-rune additive reading. The source selection's checksum alone does not identify a new cipher operation or key.

**Reproducer:** [`sims/p15_p32_fibonacci_address_463_sft.cjs`](../sims/p15_p32_fibonacci_address_463_sft.cjs) asserts original page/GP ordinals, source image dimensions, all four sums, original-page uniqueness, seeded 100,000-permutation counts, and original/direct positive controls. Run from the repository with Node 22. Existing background: [authentic p15 spiral](../results/lp2-p15-fibonacci-prime-spiral.md), [p32 image/Möbius constraints](../im-results/tree-prime-canvas-partition.md).

**Decision:** Do not promote this match to authoritative established decryption or use it to justify a broad search over phase, orientation, extra keys or affine transformations. An independently printed or signed instruction selecting reversed-column Fibonacci index extraction and its cipher consumer would change the value of this lead.

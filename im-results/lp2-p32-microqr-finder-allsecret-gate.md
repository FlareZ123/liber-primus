# Original LP2 p32 cannot be a literal 11×11 Micro QR under any rune-color or separable mask

**Agent 13, 11 November 2026. Classification:** source-constrained, exact all-secret impossibility for a concrete visual encoding family; **no unknown LP2 plaintext, key, cipher mechanism or destination recovered.** [Standalone original-cipher SFT](../sims/lp2_p32_microqr_allsecret_finder_sft.cjs).

## Source-prompted question

LP2 physical p32 has exactly **121 original runes**. Its separately source-linked 2016 image gives both independent 11×11 row-major prime checksums: top-row prime sum **563** and left-column sum **569**, the dimensions of the signed image. A human reader might therefore inspect the **11×11** square as a visual code. The pre-2014 standard [ISO/IEC 18004:2015, sections 6.3.2.2 and 6.3.3.2](https://standards.iteh.ai/catalog/standards/iso/8c023a56-bea2-418b-9b7b-5bf19f251555/iso-iec-18004-2015) describes the smallest Micro QR (version M1) as exactly **11×11 modules**, with **one 7×7 finder**. The finder has an obligatory dark outer ring, light inner ring and dark 3×3 center, independent of the encoded payload and QR data-mask choice. [Cognex's standard-oriented guide](https://docs.cognex.com/dmst_623/web/EN/DM475V_Manual/Content/Topics/DM475V/iso-18004-qr-code-grading-parameters.htm) independently confirms the pattern.

**Conjecture tested:** each original GP rune may represent a secret binary module color, perhaps concealed by independent row and column XOR masks. The 29 rune-to-color values are completely unknown; no guessed threshold, arbitrary keyphrase, binary assignment or language score is needed. Neither the original manuscript nor the signed historical message explicitly says p32 is a QR code. This is a narrow, falsifiable decoder check.

## A four-cell, key-independent contradiction

Read the 121 unchanged physical p32 rune indices row-major as an 11×11 matrix. In the 7×7 top-left finder, the original four cells at row/column pairs **(3,2), (3,5), (5,2), (5,5)**, zero-based, are **M, W, M, W** (original p32 runic offsets **35,38,57,60**, GP indices **19,7,19,7**).

The expected dark/light finder values at those four cells are **1,0,0,0**. Suppose a binary rune readout were `b(r,c)=F(rune[r,c]) XOR R[r] XOR C[c]`, where `F` is an *arbitrary* hidden 29-bit rune-color lookup and `R,C` are *arbitrary* independent hidden row/column bits. XOR the predictions at all four cells. Every term cancels twice: each rune label appears twice, each chosen row appears twice and each chosen column appears twice, forcing XOR **0**. The required finder target instead has XOR **1**. **No choice whatsoever of those secret values can satisfy the four cells.**

The contradiction remains for either direct dark/light polarity, all simple fixed GP numeral-to-bit rules, or any row-only/column-only subfamily. It does not depend on which source runes are regarded as English, ciphertext or symbols.

## Exhaustive finite original-source gate

The reproducer builds all 49 mandatory 7×7 target finder bits and performs exact Gaussian elimination over GF(2) for an arbitrary hidden bit per *distinct* rune label plus independently selectable seven-row/seven-column masks. This is an all-secret solvability test, with no fitted candidate discarded by a score. It tests **every one of the 25 top-left coordinates** in an 11×11 array where a 7×7 finder fits. This includes all four physical corners and is more permissive than the standard M1 top-left-only placement. The finder itself is symmetric under reflections and quarter-turns.

| Unknown binary readout family | Satisfiable finder placements among 25 |
| --- | ---: |
| Completely arbitrary secret mapping from 29 GP runes to dark/light | **0** |
| Same secret mapping plus independent XOR mask for each row | **0** |
| Same secret mapping plus independent XOR mask for each column | **0** |
| Same secret mapping plus independent XOR masks for every row and column | **0** |

For the simpler rune-color-only model, every corner is already inconsistent and requires at least **9, 9, 7, 12** incorrect modules, respectively, even when choosing the 29 unknown colors *optimally*. A synthetic 11×11 QR finder produced from a known hidden rune-color map and unknown row/column masks is accepted by the same test, including four corners. The original 563×569 source checksums and 121 symbols are asserted before the solver.

## Cryptanalytic decision

The original p32 11×11 source array **cannot directly represent a valid M1 Micro QR symbol through a stationary rune-binary lookup**, even after adding any separable row and column XOR pads. The decisive obstruction occurs in the mandatory finder before format/data/error-correction decoding. Position-dependent nonseparable encryption, a preliminary transposition, multi-bit symbols, a different grid geometry or a non-QR visual mechanism lie outside this bounded exclusion. There is no reason to search the 2²⁹ possible direct rune colorings or QR format masks for this original layout.

This result closes an attractive but unsupported direct visual hypothesis. It supplies no page order, clock, decryption key or genuine unknown plaintext. Future source-led visual work should require a specific original clue to justify a different reversible transform, rather than adding arbitrary fitted masks.

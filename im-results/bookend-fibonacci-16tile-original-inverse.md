# Two six-rune bookends and a source-p15 4×4 tensor-square inverse

**Agent 49, 11 November 2026. Scope: one source-constrained 16-rune block interpretation tested against all original unsolved LP2 ciphertext. No unknown plaintext or authenticated key was recovered.**

## The finite original-source proposal

The exact six-rune, two-word ciphertext `ᛞᛄᚢ ᛒᛖᛁ` (GP indices `23,11,1,17,18,10`) occurs only at global rune offsets **6,555** (physical p27) and **12,950** (physical p55); both occurrences are image-attested and already analyzed in [the bookend investigation](2016-28page-bookend-ratio-inverse.md). One possible source-visible interpretation is that they are literal, noncryptographic control tags that a continuous payload should skip. Removing exactly these two six-symbol occurrences gives **12,944 = 809 × 16** GP glyphs. The original physical p15 Fibonacci-indexed prime-distance square has **4×4 = 16** entries, selecting a matrix for reversible 4×4 GP blocks without an arbitrary secret-key scan.

This *16-packet/two-axis* interpretation is distinct from the existing [four-glyph contiguous Hill4 study](../sims/fibonacci_square_hill4_gate.cjs) and [per-word Hill4 inversions](fibonacci-word-reset-hill4-original-inverse.md). The two named bookends and the printed square are genuine inputs; treating the former as nonpayload and applying the same matrix on both axes are **unconfirmed operations, chosen after their 16-fold divisibility was noticed**. They are not authenticated 2014 instructions or discovered cipher rules.

Freeze the printed, unrotated p15 distance matrix modulo29:

```
M = [[10, 3,20,22],
     [ 1,22,21,25],
     [11,17,19, 7],
     [21,17,12,22]]

M^-1 = [[19, 1, 6, 3],
        [11, 7, 8,22],
        [ 2,10,15,28],
        [25, 4, 1,15]]
```

Read the remaining original glyphs in printed order as 809 row-major 4×4 matrices `C`. Test the two reversible directions `P=M^-1 C (M^-1)^T` and `P=M C M^T` over GF29. The corresponding encoder uses the other listed matrix on both axes. Reinsert both exact six-rune tags unchanged at their original offsets and compare **all 12,956** output runes with the untouched original.

## Original-input results and authentic-language positive control

| Decoder over 809 original tiles | Original output IoC | GP result |
| --- | ---: | --- |
| `M^-1 C (M^-1)^T` | **0.0344947854** | Uniform-like; first 96 runes are not coherent language |
| `M C M^T` | **0.0344442286** | Uniform-like; first 96 runes are not coherent language |
| Untouched 12,956-rune original | **0.0344784** | Uniform-like |

Both inverses recover exactly **12,944/12,944** symbols under their matching reencryption and, after reinserting the two tags, reproduce every original rune. This is an **implementation invariant** for any invertible matrix and does not select the authentic key.

As a source-native positive control, the first **12,944** GP-encodable runes of the independently retained Shakespeare reference are transformed as `C=M P M^T` and fully recovered as `P=M^-1 C (M^-1)^T`, with **12,944/12,944** exact. Their recovered IoC is **0.0610705784**, while the forward-encrypted IoC is **0.0345173718**. A wrong, independently source-visible p15 prime-ordinal matrix inverse instead gives **0.0344724377** on the plant. The original outputs are much closer to ciphertext and wrong-key distributions than to this GP-English reference. The test does not evaluate alternate plaintext alphabets or highly structured non-GP registers.

## Decision and extension boundary

The exact two-bookend deletion provides a mathematically clean 809-tile framing, but the frozen natural Fibonacci tensor-square inverse yields **no original GP-English plaintext**. Retire the specific `M⊗M` direct GP29 interpretation and its inverse; do not spin 16-grid rotations, per-block unknown keys, or arbitrary 29-field transformations without a new independent clue. The 16-divisibility observation is postselected and remains insufficient to establish that the bookends are control symbols. A future source-confirmed 16-rune register would still require its own lossless original-input inverse, including 86 adjacent doublets, and meaningful independently predicted plaintext.

**Reproduce:** [standalone CJS SFT](../sims/lp2_bookend_tensor16_source_gate.cjs). The script reads unmodified tracked source and Shakespeare files, asserts the original bookend offsets and 809 blocks, verifies forward reencryption and a wrong-source key control, and prints exact original IoC and sample GP tokens. No new CI workflow was created.

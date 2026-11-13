# P15 sixteen-number cyclic Hill inverse on the immediately following original chapter

**Agent14, 13 November 2026. Result:** six exactly invertible source-derived 16-symbol GF(29) mixing operators yield no recognizably linguistic original output across the 1,744 untouched runes of LP2 physical pp16–22. A seventh source term is not fitted, and no key or unknown plaintext is recovered. This is a **bounded direct inverse** with exact reencryption and authentic solved-GP positive plants, rather than an all-secret exclusion.

## Why this is a different and testable route

Original LP2 physical p15, [archive scan 32.jpg](../resources/liber-primus/32.jpg), prints a 4×4 numerical square. Its red 3299 and precise outward-spiral order give a source-established sixteen-step Fibonacci-indexed prime construction ([original derivation](../results/lp2-p15-fibonacci-prime-spiral.md)). The numerical square and infinity illustration make a sixteen-tap repeating or cyclic operation plausible to inspect. The **next seven physical pages p16–22 form one source-visible visual chapter tail** of lengths [267,273,260,271,269,273,131], totaling exactly **1,744 = 109×16 original ciphertext runes**. This is a testable target with no trimming or inserted padding.

Unlike already-tested p15 sixteen-phase substitutions and 181×16 *whole-word transpositions*, this proposal **mixes sixteen plaintext runes within every block**, altering the individual-rune frequency register. Unlike the source's four-rune Hill attack, the whole p15 square supplies one sixteen-tap cyclic kernel. The source does not explicitly instruct this use. The original manuscript neither fixes the kernel flattening order nor establishes a GF(29) Hill cipher, so this experiment tests the four natural directions from two source-visible orderings and two derived input lists.

The exact printed row-major sequence is:

    3258 3222 3152 3038 3278 3299 3298 2838
    3288 3294 3296 2472 4516 1206 708 1820

The recovered spiral is:

    3299 3298 3296 3294 3288 3278 3258 3222
    3152 3038 2838 2472 1820 708 1206 4516

Two more source-reconstructible sixteen-element kernels, **prime terms** [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817] and **distinct Fibonacci arguments** [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987], supply bounded comparisons. There is no key search and no fitted constant.

## Frozen decoder

For each key K of sixteen integers, reduce its coefficients modulo 29. In the printed ascending Gematria Primus index register define a cyclic 16×16 encryption matrix

    M[i,j] = K[(j-i) mod 16] mod 29

or the reversed cyclic convention

    M[i,j] = K[(i-j) mod 16] mod 29.

Use ordinary matrix-vector Hill encryption on successive source-ordered nonoverlapping blocks **C_block = M · P_block mod29**. Recover each candidate sixteen-rune plaintext block by Gaussian inversion of M over GF(29); only full-rank matrices are legal. Do not cross the p15 boundary, reorder p16–22, alter page-carried runes, apply a plaintext-F bypass, learn the kernel from ciphertext, or select a shift by scoring English. Those are separately testable operations, not part of this direct source consumer.

The original ciphertext has pooled IoC **0.034509598025128034**. The source-frozen results across the **same 1,744 original runes** are:

| 16-tap kernel | Normal cyclic inverse IoC | Reversed cyclic inverse IoC | GF29 rank |
|---|---:|---:|---:|
| Printed row-major | 0.034419460279 | 0.034459594604 | 16 |
| Recovered spiral | 0.034478016917 | 0.034366167159 | 16 |
| Underlying prime terms | not invertible | not invertible | 15 |
| Distinct Fibonacci arguments | 0.034731981662 | 0.034728691963 | 16 |

All six invertible outputs remain essentially at uniform GP29 coincidence (1/29 ≈ 0.034483) and produce no readable GP-native English. Example untouched output under the **normal row-major** inverse begins:

    S OE J C X W O F R T W EO T R E H Y P F C H Y D X B C X M P P F AE

The solved LP2 p57 clear-GP source has IoC **0.062709966405** on 95 runes; it provides a contextual register check rather than length-matched statistical significance. A longer source-native English threshold is unnecessary to determine that none of the six exact direct outputs is compelling plaintext.

## Independent correctness controls and limitations

For each of the six full-rank matrices, the candidate plaintext exactly reencrypts to the **original 1,744/1,744** runes. To check that these matrices can actually carry authentic English source orthography, append one synthetic F/index0 to the **unaltered 95 originally clear GP runes of solved LP2 p57**, encrypt the resulting 96-symbol register under that same matrix, and require inversion to recover **96/96 exact positions**. All six variants pass. The extra F is *positive-control block padding*, never added to the tested original unknown ciphertext.

The two prime-list matrices have GF29 rank15 and cannot be inverted without information loss. This is an algebraic property of the specific sixteen-value prime kernel, not evidence that the primes are unimportant or that any broader cipher is impossible.

This decision retires the **phase-zero, source-order, stationary cyclic Hill16 direct inverse** on the next 1,744 runes. It does not exclude another externally supplied kernel, other key clocks, noncyclic 16×16 matrices, evolving matrices, other enciphering fields, hidden preprocessing, or non-English plaintext registers. No original unknown plaintext, key, source-authenticated LP2 decipherment operation or destination is obtained.

**Single-file Windows/CommonJS original-input reproducer:** [sims/lp2_p15_circulant16_source_inverse_sft.cjs](../sims/lp2_p15_circulant16_source_inverse_sft.cjs). It asserts the source counts, all GF29 ranks, all six frozen metrics, exact original reencryption and independent GP-native positive plants.

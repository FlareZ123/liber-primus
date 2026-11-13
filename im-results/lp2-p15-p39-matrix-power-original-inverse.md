# The p15/p39 signed 4×4 matrix as a changing 812-period Hill operator

**Agent23, 13 November 2026. Bounded original-input inverse: negative.** Neither a native-GP plaintext, external key, complete cipher mechanism nor continuation is recovered.

## Independent author-visible inputs

Original physical p15 prints sixteen Fibonacci-prime-derived positive magnitudes in a 4×4 square. Under the independently established `3301−prime(F_n+1)` construction, two entries in the bottom row should be restored to negative sign. The signed matrix has the exact characteristic polynomial `(x−8)(x−17)(x−24)^2` over GF(29), sharing the printed p39 red-triad quadratic `15(x−24)^2`, and matrix multiplicative order **812**, as shown in [the cross-artifact algebraic finding](lp2-p15-p39-signed-matrix-eigen-crosslink.md).

This supplies a distinct, inexpensive cipher candidate that is missing from the already-tested stationary Hill and four-state OFB/CFB experiments: **change the entire four-symbol Hill operator with each block**, using `M^t` (or inverse) and the matrix's full 812-step structure. It requires no guessed key/IV. Importantly, restoring two unprinted signs, choosing powers, the first exponent and matrix multiplication remain **hypotheses**, not authored instructions; p39's double root makes this operation mathematically motivated but does not authenticate it.

## Frozen original ciphertext inverse

The [source-native CommonJS SFT](../sims/lp2_p15_p39_dynamic_matrix_power_sft.cjs) asserts the sixteen original p15 printed integers

`3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820`

and restores only signs of cells 12 and13. It obtains exactly

```text
M = [10  3 20 22]
    [ 1 22 21 25]
    [11 17 19  7]
    [ 8 12 12 22]     (mod 29).
```

It verifies an exact GF(29) inverse and the claimed period812. For each source-order four-rune ciphertext block `C_t`, test the completely reversible convention `P_t=M^(±(t+s))C_t` or its transposed operator, with **s=0 or1**. These are only the source-natural first-power conventions, rather than a tuned phase search. All sixteen combinations (matrix ± inverse, transpose yes/no, first exponent 0/1, two independent targets) are checked:

- Directly following original physical pages **p16–p22**, exactly **1,744 runes = 436 blocks**.
- Original **p40–p53** after p40's eight-rune red heading, exactly **3,000 runes = 750 blocks**, an independent source-visible segment previously used for the signed-matrix comparison.

No data-driven state initialization, key, punctuation skip, chapter resegmentation, stage offset or language scoring search is allowed.

## Full original-source outcome

[Successful Windows Node22 Actions run 43524667288](https://github.com/FlareZ123/liber-primus/actions/runs/43524667288) reports:

| Source target | Raw GP29 IoC | All eight changing-power variants | Best variant |
| --- | ---: | ---: | --- |
| p16–p22, 1,744 runes | 0.0345095980 | **0.0342622127–0.0345760499** | `(M^−1)^(t+1)`, transposed, 0.0345760499 |
| p40–p53, 3,000 runes | 0.0345444037 | **0.0343816828–0.0345944204** | `(M^−1)^t`, untransposed, 0.0345944204 |

The best full 3,000-rune transform starts `A P X Y W R W X D G AE G E E IA M A G N X OE TH EA H R OE EA W I IA T OE`; the corresponding 1,744-rune result starts `TH H TH AE M X U TH S TH J X I D IA F T J W B G P B IA H F E T TH R U S`. Neither is recognizably GP-native English, and both long-run IoCs remain near the untransformed ciphertext. Independently, an actual 92-rune solved p57 native-GP control has **IoC 0.0621118012**.

For **every candidate**, exact forward re-encipherment reproduces **all 1,744 or3,000** source ciphertext runes. A separate real p57 GP plaintext plant is first encrypted under the inverse convention and recovered exactly **92/92** runes. These controls establish reversibility and implementation sensitivity without authenticating the candidate.

## Decision

The simplest **source-derived time-varying Hill powers of the signed p15 matrix** do not recover an original GP-native plaintext register on either source-adjacent body. This is distinct from earlier stationary Hill operators, seven-block eigenvector pads, red-cell scalar power keys and OFB/CFB. The test does not exclude a secret initial vector, unknown plaintext register, different nonlinear use of the p39 double root, arbitrary hidden shift, or a true unrelated cipher. None has been authorized by a new original operation, and the exact algebraic connection remains a research clue rather than a solved instruction.

Continue on this branch only if a source-selected **four-rune operand, state initialization or transition/cipher consumer** becomes available; do not phase-fit an 812-cycle stream after observing the complete negative.

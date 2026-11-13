# P15 signed Fibonacci matrix shares a quadratic factor with p39's red triad

**Agent 37, 13 November 2026. Evidence class:** exact original-source arithmetic and an independently located interpage *candidate* mechanism. The first direct source-selected eigenstate decoder is negative. **No unknown LP2 plaintext, authenticated key or complete cipher recovered.**

## Two visibly separate source inputs

Original physical LP2 p15 (scan `32.jpg`) prints sixteen numbers in a 4×4 spiral. The independently established Fibonacci-prime construction is **`abs(3301−prime(F_n+1))`** at each fixed printed cell. The final row is `4516,1206,708,1820`; the first two arise from true negative differences **`3301−7817=−4516`** and **`3301−4507=−1206`**. Restoring the two mathematical signs, while leaving every original cell in place, gives a well-defined alternative matrix `M` over GF(29):

```text
M = [10  3 20 22]
    [ 1 22 21 25]
    [11 17 19  7]
    [ 8 12 12 22]
```

The manuscript itself prints *positive magnitudes*, and does not tell the solver to restore signs. This is the branch's most important unsupported premise; it cannot be silently substituted for the literal printed matrix.

Independently, original p39 has the red three-rune span at local offsets **119–121**, with genuine GP29 indices **[27,5,15]**. As previously established for the paired p3/p39 spans, reading the three indices as ascending polynomial coefficients yields `Q(x)=27+5x+15x²=15(x−24)² mod29`. The p3 red triad at exactly the same local offset is **[13,23,2]**, providing a fixed independent comparison.

## Newly established exact finite-field intersection

The literal *unsigned* p15 matrix and the Fibonacci-rule **signed** matrix have, respectively, the following monic characteristic polynomials over GF29:

```text
charpoly(M_unsigned) = x^4 + 14x^3 + 22x^2 + 5x + 17
charpoly(M_signed)   = x^4 + 14x^3 + 27x^2 + 10x + 7
                     = (x−8)(x−17)(x−24)^2
```

Thus the **complete independent p39 red-triad quadratic** is a scalar multiple of an **exact characteristic-polynomial factor** of the signed p15 Fibonacci matrix, with algebraic multiplicity two for the same root **24**. The absolute-value printed matrix does not have this factor. Under the two-source polynomial-matrix operation, `Q(M_signed)` has **rank 2 and nullity 2** over GF29, while the original p3 quadratic `13+23x+2x²` evaluated at the same matrix has **rank 4 and is invertible** (determinant **6**). A distinct p39-selected two-dimensional generalized eigenstate therefore exists without guessing a rune or plaintext key.

The signed matrix's exact multiplicative order is **812 = 28×29**, verified by `M^812=I` and `M^(812/q) != I` for prime factors `q∈{2,7,29}`. Its eigenvalue 24 has multiplicative order **7** in GF29 and a one-dimensional ordinary eigenspace. The unique eigenvector normalized to final coordinate 1 is **`v=[27,3,13,1]`**; `M v = 24v`, giving a frozen seven-block keystream without fitting a key. The extended generalized eigenspace can support a 203-step component under a Jordan chain, but there is no printed instruction choosing a generalized state, coordinate, or output mapping.

## Exact row-preserving source null, conditional only

A source-matched finite experiment enumerates **all 24⁴ = 331,776** permutations within the four original p15 **signed** rows, leaving their row inventories, negative-prime restoration and p39 quadratic completely unchanged. **378/331,776 = 0.001139322917** random row-order arrangements also have 24 as a repeated characteristic root. The original has this property. The **exhaustive rowwise null is implemented in the same CommonJS SFT** using the exact determinant and characteristic-polynomial derivative, retaining row groups and counting duplicate-value permutations consistently.

These numbers describe rarity **conditional on this retrospective model**, not manuscript-authentication probability. The sign-restoration operation, GF29 characteristic polynomial, selection of the p39 red triad, root factor target, and sample family were recognized using this same manuscript; discovery-wide correction is absent. The closeness to **1/29²** is expected for two independent conditions on a random quartic. A low conditional tail cannot establish Cicada's intent.

## First source-constrained inverse, and what it decides

A direct, inexpensive decipherment was frozen from only the source-selected eigenvector `v` and the signed matrix. Start at the first black rune after p40's **eight-rune red heading** and continue through p53, exactly **3,000 original runes = 750×4**. For each four-rune block `i`, update `v ← Mv` and subtract or add its four GP29 entries from the original ciphertext, with no fitted phase, state, clock, symbol alphabet, skips, word segmentation or language search. Source-native **92 clear runes on p57** are encrypted and recovered exactly as positive controls for both signs. Both original inverses re-encrypt all 3,000 runes.

| Source-direct candidate | Original 3,000-rune IoC |
| --- | ---: |
| Unchanged ciphertext | **0.034544403690** |
| Ciphertext minus source eigenstate | **0.034489496499** |
| Ciphertext plus source eigenstate | **0.034502611982** |
| Genuine solved p57 first 92 runes (separate control) | **0.062111801242** |

Neither source-defined sign yields plaintext; both remain near-uniform. This rejects the **direct seven-block GP29 additive key** on the original p40–53 body. It does *not* refute the polynomial factor, a source-selected two-dimensional projector, a nonlinear key consumer, or the possibility of an accidental factor match.

## Research decision

The exact crosspage polynomial factor is a concrete **candidate selector** for the previously unmotivated signed-matrix reading of p15. It earns a bounded independent decoder investigation if a separate manuscript cue identifies **how to use `Q(M)`** to remove a state or decode output coordinates. Without that consumer, extracting arbitrary eigenstates and fitting GP language would produce an unauthenticated cipher. The first direct eigenstate use already fails, so **do not escalate into unconstrained 812-clock/coordinate/phase sweeps**.

[Original-input CommonJS SFT](../sims/lp2_p15_p39_signed_matrix_eigen_sft.cjs) · [Prior literal-matrix OFB/CFB gate](lp2-p15-fourstate-ofb-cfb-source-gate.md) · [Independent p3/p39 quadratic field investigation](lp2-red-triad-frobenius56-source-state.md) · [Established p15 prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md).

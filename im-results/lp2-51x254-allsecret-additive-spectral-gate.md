# Source-exact 51×254 all-secret row/column pad spectral exclusion

**Agent 18, 11 November 2026.** New source-motivated all-key cryptanalytic exclusion. **No plaintext or authentic key recovered.**

## Original source geometry

The original unresolved LP2 stream has **12,956** GP runes. Omitting two yields **12,954 = 51 × 254**. Physical p53 has a **51-rune final red span**; the canonical 256-byte table polynomial divides over F29 by the original p39 red **(X−24)²** factor, yielding a **254-coefficient quotient**. Place the original 12,954-rune suffix row-major in a 51×254 rectangle. This source-derived layout is an assumption, particularly the two-rune omission and reading order.

Test the all-secret direct GP29 family **C[r,j] = P[r,j] + U[r] + V[j] mod29**. Every arbitrary row and column key is permitted (29^304 distinct additive masks).

## Exact key-independent theorem

For each nonzero GP29 harmonic k set E_k(X)[r,j] = exp(2π i k X[r,j]/29). Every masked output obeys

E_k(C) = diag(exp(2π i k U/29)) · E_k(P) · diag(exp(2π i k V/29)).

Both flanking matrices are unitary. Thus **all singular values are invariant under every possible unknown row/column key**.

The [original-source reproducible SFT](../sims/lp2_51x254_additive_spectral_sft.cjs) evaluates all fourteen independent harmonics. The original unmodified ciphertext has maximum leading singular value **23.16581309** (k=8) and k=4 value **22.62647881**.

## Native-language plaintext and encryption controls

Four source-native 12,954-rune windows each from Shakespeare, Gibran and Emerson exhibit leading k=4 values:

| Reference | Native k=4 range |
| --- | ---: |
| Shakespeare | **38.65613096–40.36594627** |
| Gibran | **40.95113959–41.22868534** |
| Emerson | **39.72736523–41.77935754** |

Independent arbitrary row and column GP29 keys encrypt all twelve controls; every top singular value remains **exactly invariant within 1e−8**.

For a separate model-matched perturbation, replace **81% of repeated adjacent ciphertext glyphs** by a different uniformly chosen output rune. Those same twelve encrypted plants have **69–96 remaining adjacent doublets**, close in scale to original LP2's 86 within-page doublets. Their k=4 leading values remain **37.65738446–40.77820824**. All exceed the original all-harmonic maximum 23.16581309. This repeat overwrite is an intentionally lossy control, **not** a demonstrated historical reversible cipher.

## Decision

The source-selected **51×254 native-GP-English additive row-and-column pad** cannot account for the original under any hidden row/column keys, even with the declared strong soft-repeat perturbation. The conclusion is limited by the original row-major layout, GP-English plaintext register and exactly specified additive model. It does **not** exclude a different source ordering, nonlinear encoder, non-English intermediate, arbitrary keystream, or the separately tested [GF(29²) multiplicative outer-product model](gf841-51x127-outer-product-mask.md).

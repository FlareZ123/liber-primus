# p8 red title reconstructs p7 quartic, and its companion has exact 56-stage order

**Agent20, 22 November 2026. Original-source algebraic candidate, with a bounded direct plaintext gate. No deciphered LP2 page and no authenticated authorial opcode.**

## Reconstruct the earlier red coefficients from the later heading

The physically original p7 final five **whole red words** have GP29 index products in printed order **`[11,26,8,15,2]`**, as previously source-verified in [the p7→p8 fixed-point report](lp2-p7-p8-original-red-polynomial-fixedpoint.md). Physical p8 begins with two whole red words of index products **`u=4, v=3`**. The final actual red heading rune is GP-index **`t=17`**. These three measurements are visible without consulting the p7 products.

There is a concise **conditional reverse grammar**, which uses only the p8 title as its numeric input:

```text
r = v/u (mod29)                        = 3/4 = 8
a = (t-1)/(u²-r) (mod29)              = 16/8 = 2
R(X) = (X-u)(X-v)(X²-r)               = X⁴+22X³+4X²+27X+20
P(X) = X+a R(X)                       = 11+26X+8X²+15X³+2X⁴
```

The five resulting ascending-degree coefficients are **exactly** the earlier p7 five whole-word products, in their original printed order. This is the reverse of the previously reported p7 polynomial→p8 roots/derivative relation, but introduces a separate useful observation: **the p8 second-to-first whole-word quotient `3/4=8` reproduces the irreducible factor's constant `X²−8`.** Under this grammar, the later heading specifies every earlier coefficient and the normalization without fitting a cipher key to unknown plaintext. It also reproduces `P(19)=12`, corresponding to the source title's visible Roman `XIX` and its twelve printed red runes, previously reported by Agent50.

**Essential uncertainty:** no authenticated Cicada document tells a solver to build a quartic from red-word products, treat the second/first product as the negative constant of a quadratic factor, or choose the derivative of the first root as a scalar normalization. The grammar was recognized with the p7 coefficient vector already known. Its exact arithmetic is real; it cannot be interpreted as an independent prospectively selected author instruction or a calibrated low-probability discovery.

## A canonical reversible 56-step operator

The source-specified *conditional* monic factor is

```text
R(X) = X⁴+22X³+4X²+27X+20
     = (X−3)(X−4)(X²−8)  (mod29)
```

Its Frobenius companion matrix, uniquely determined by this coefficient convention, is

```text
M = [ 0  0  0  9 ]
    [ 1  0  0  2 ]
    [ 0  1  0 25 ]
    [ 0  0  1  7 ]  (mod29)
```

The matrix is invertible and has **exact multiplicative order56**: `M⁵⁶=I` and no earlier positive power is the identity. This follows from the two fixed roots3,4 whose orders divide28, together with the `X²−8` quadratic field root of exact order56. The numeric equality to the **56 unsolved physical LP2 pages** is a possible page-state design lead. It is the four-register version of the already reported quadratic-field order56 observation, not a second independent proof that the creator intended a page clock.

A direct raw-rune 56-state output cannot itself be the original p8 ciphertext: the original 256-symbol p8+first-p9 receiver has only **6/200** equal symbols at distance56 (a literal 56-period sequence would require 200/200). The black243+first-p9 244-rune receiver has **6/188**, instead of 188/188. This does not exclude 56-state page keys combined with an independently selected rune cipher.

## Bounded direct reversible original-page gate

To test the cheapest literal companion **plaintext** consumer, apply `M`, `M⁻¹` and the corresponding transposes to successive native GP29 four-rune blocks, without any secret key or tuned phase. Two source-consistent original full receivers avoid inventing padding: **all original p8 255 runes plus the first p9 continuation rune (256)**, and **p8 black243 plus that first p9 rune (244)**. The 8 reversible reconstructions give **normalized GP29 IoC 0.971998–1.015382**, while authentic solved p57 has normalized IoC **1.818589**. All eight outputs are nonprose. The script verifies exact forward replay for every original rune and an authentic solved-p57 GP-native 96-symbol planted inverse.

**Decision:** The p8 title's conditional reverse reconstruction and canonical 56-order matrix are rigorous, portable operands, but the directly keyed four-rune Hill consumers and raw per-rune period56 use fail on original ciphertext. Do not launch another unrestricted key/phase search on this match. Further investment requires an independent source clue identifying a **page-level** state action, initial vector and value-changing rune transform, then an untouched original paragraph prediction.

[Read-only CommonJS/Node22 single-file test](../sims/lp2_p7_p8_title_companion56_original_sft.cjs) · [Earlier original-source fixed-point/derivative and seven-cycle investigation](lp2-p7-p8-original-red-polynomial-fixedpoint.md).

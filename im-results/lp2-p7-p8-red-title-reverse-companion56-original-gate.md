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

## Roman XIX also counts exactly the polynomial forest's 19 transient vertices

The original first red p8 word `XIXM` literally contains **Roman XIX = 19**. Independently of reading it as a matrix exponent, the earlier quartic `P` has a **seven-state nontrivial directed cycle** `[10,24,7,5,15,28,9]`, with **exactly nineteen additional GP29 vertices flowing into this cycle**. Its other three vertices form the singleton fixedpoint3 and the two-vertex component `1→4→4`. Thus `7 + 19 + 3 = 29`. This supplies a concrete graph-theoretic interpretation of the title's 19 and the seven-page repeated tree art, conditional on the retrospective polynomial grammar; the numeral could still be coincidence.

A single fixed *reader* of this structure is the complete 19-element breadth-first list of non-cycle preimages, rooted at the **first red word's literal cycle glyph I=10**, advancing in the actual source P cycle and taking children in ascending native GP29 index order:

```text
[18,2,8,21,17,20,12,23,14,16,19,6,11,22,26,27,0,13,25]
```

Use those 19 native GP29 digits as a repeating Vigenère key on the intact **p8 black243+first-p9 carry (244 runes)**. Since solved LP1 used both Vigenère and Atbash, freeze the only four simple sign/Atbash consumers. All are exactly reversible and a genuine p57 GP-native plant is recovered without error; normalized original IoCs are **0.978210** or **1.023207**, with no prose. The **BFS start/ordering and Vigenère opcode are unselected** by any first-party text. This is a precisely documented potential *19-value source key*, not recovered key material. Further traversal-order hunting is unjustified without an original route selector.

## Basis-independent identity-page obstruction for anchored page clocks

The full-book candidate above is excluded in a stronger, key-independent sense for the **two exact title/page anchors already tested**. For *any* unknown invertible GF29 4×4 basis change `B`, the state power on the origin page is `B M⁰ B⁻¹=I`. With the original p0 anchor, at least **260 contiguous p0 original runes** occupy complete unmodified four-rune blocks, and retain normalized GP29 IoC **1.001693**. With the source-title p8 anchor, at least **252 contiguous p8 original runes** occupy complete same-page quartets and remain unmodified, IoC **0.996743**. These values are vastly below native-GP source control **1.818589**, and the visible rune text is nonprose. Original cross-page blocks affect the excluded boundary fragments only. No secret global coordinate change, clockwise direction or conjugation can repair an identity action on the anchored page. A separate unprinted seed phase or additional cipher layer would be a genuinely different hypothesis requiring independent source selection.

## Source-visible Roman XIX as a matrix exponent

The p8 first red heading word physically spells `XIXM`. Its first three literal Roman glyphs supply **19**, and the fourth GP rune M has numeric value **19**. Without fitting any parameter to the unknown ciphertext, use that exact original numeral as a power `M^19` or its inverse on the complete p8+first-p9 (256 runes), or p8 black243+first-p9 (244 runes), with either canonical orientation or transpose. All eight full original receivers are exactly reversible. Their normalized GP29 IoCs span **0.977231–1.054510**, compared with **1.818589** on solved native p57; no long plaintext emerges. This excludes the most literal *source-specified exponent19* four-rune Hill consumer. Any other opcode would require a new manuscript-supplied instruction.

## Whole-book page-clock interpretation also excluded as a direct cipher

Taking the **56-page** count literally rather than using a 56-rune period, assign one power of the *same* source companion matrix to each physical page. On the complete **12,956 genuine source GP29 unknown-page runes**, there are exactly 3,239 four-rune blocks. Use the first actual rune's page as the block's state, no inferred padding or p50 table runes, and predeclare the two natural anchors p0 and p8, the two matrix-power directions and two transpositions. All **eight** complete-book inverse candidates decrypt and recipher exactly. Their normalized GP29 indices of coincidence are **0.999456–1.000908**, against **1.818589** for the solved p57 native-GP source. Not one gives long natural text. The upper value, 1.000907790, is only 0.001 above uniform29. This excludes a direct four-rune Hill cipher driven by that simple physical-page matrix clock, while preserving the distinct possibility of another source-authored nonlinear transform using the same abstract register.

**Decision:** The p8 title's conditional reverse reconstruction and canonical 56-order matrix are exact arithmetic operands, but the directly keyed four-rune Hill, fixed Roman-XIX-powered Hill, complete-book page-clock Hill and raw per-rune period56 consumers fail on original ciphertext. Do not launch another unrestricted key/phase search on this match. Further investment requires an independent source clue identifying a **different, explicit state action and value-changing rune transform**, followed by an untouched original paragraph prediction.

[Read-only CommonJS/Node22 single-file test](../sims/lp2_p7_p8_title_companion56_original_sft.cjs) · [Original Windows Node22 PASS, complete 28-gate run 45053460486](https://github.com/FlareZ123/liber-primus/actions/runs/45053460486) · [Earlier original-source fixed-point/derivative and seven-cycle investigation](lp2-p7-p8-original-red-polynomial-fixedpoint.md).

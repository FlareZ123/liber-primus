# Original p36 in the grid's irreducible degree-238 field: worked-DH power test

**Result (12 November 2026, Agent50):** a strictly source-posed exponent-15 power encryption of the original p36 block is **algebraically impossible** in the grid-defined finite field. Two reversible exponent candidates derived from earlier Cicada DH numbers also produce nonlinguistic 238-rune outputs. This is a bounded cryptanalytic result, with **no original unknown plaintext, key, or destination recovered**.

## Candidate human-visible route

The printed LP2 pp49–51 table has 256 base60 byte cells. Under the previously source-motivated GF29 polynomial reading, its exact complete factorization is

`28 · (X+5)² · (X²+18X+11) · (X³+14X²+16X+24) · (X⁹+12X⁸+20X⁷+10X⁶+5X⁵+X⁴+9X³+15X+11) · Q238(X)`.

The first five factors have aggregate degree **16**, recalling the source p15 4×4 number square, and the monic remaining factor `Q238` is irreducible over GF29. The source p36 carries **238 runes** and one physical Arabic **1** after rune 99, yielding **239** exactly placed GP29 coefficient positions. Prior [factorization](lp2-grid-complete-gf29-factorization.md) and [p36-1/source-root test](2013-base29-gf29-grid-factor.md) establish those inputs independently of the present cipher hypothesis.

A contemporaneous, signed 2013 Cicada [BASE29 / DH exercise](../resources/external/2013-tcp-server-signed-source.md) teaches modular exponentiation, with a worked DH23 client secret exponent **15**. A later conditional source-link analysis selects exponent **1661** for the DH3301 challenge; 23 itself is also a directly visible number. A human seeing an irreducible degree-238 factor and exactly 239 source-arranged coefficients might try representing the p36 object as a single element of **GF(29^238)=GF29[X]/(Q238)** and applying those prior power exponents.

This identifies **one specific finite algebraic transport**, with no arbitrary seed, shifted position, model fitting, alphabet relabeling or English scorer used to choose a candidate. The significant objection is that the 2013 DH exercise is over small prime fields, and the original LP2 manuscript does not expressly authorize this enormous extension field or a DH-power cipher. The degree match and the heading alignment were already observed retrospectively. We therefore test consequences instead of asserting intent.

## Exact source computation

Use the unmodified canonical base60 table, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, as high-to-low coefficients; divide over GF29 by the *already established* five low-degree factors; normalize the residual to monic degree238. The frozen `Q238` leading coefficients (high to low) are `[1,11,15,26,27]` and its first ten low-to-high coefficients are `[5,9,18,5,15,8,11,3,19,21]`. Insert the literal 1 at the original p36 numeral's 99-rune boundary; reduce the resulting 239-position polynomial modulo `Q238`.

Write `y` for this nonzero original-source field element. The multiplicative group has order `N=29^238−1`, divisible by **15**. If the original p36 had been produced by `y=m^15` for any unknown `m`, then it must also be a **cube**, so `y^(N/3)=1`. Exact modular polynomial exponentiation gives the opposite result:

- `y^(N/3)` has **227 nonzero** GF29 coefficients, so it is neither zero nor 1.
- Its low-to-high first 24 coefficients are `[10,26,11,26,0,7,11,10,7,6,15,20,27,4,9,26,16,12,16,10,20,26,2,23]`.
- Therefore **no GF(29^238) element maps to the original p36 block under `m↦m^15`**. This obstruction is independent of plaintext language, score thresholds or unknown secret state.

For reversible powers, **23** and **1661** are coprime to N. Compute the exact inverse exponent in the unit group and read the 238 resulting field coefficients in printed high-to-low order as GP29:

| Source-derived exponent | GP29 output IoC | First decoded GP transliteration |
| --- | ---: | --- |
| 23 | **0.034712619225** | `BJSUXITAPYYEOPTSXTHEANNGUOEEOEAWEATHFJOEIAYYIFIAUBSTTUCDEAEOEUCIAPOEO` |
| 1661 | **0.035244477538** | `LLBNIXTHRHUIASBCWCTCEOYNAPXIAXCNGDTHMOESCBEOETTOEAEXUXSYIAYEOBLOEADOE` |

The original 238-rune p36 has IoC **0.035989079176**; ordinary native GP English is substantially higher. Neither fixed inverse yields meaningful runic text. For **both** reversible exponents, powering the exact decoded field element back by its corresponding exponent reproduces the complete original p36 field value. This establishes correct group inversion, while supplying no evidence that either exponent is an author-chosen cipher.

## Decision and next useful input

The **literal fifteenth-power encoding** of the source-arranged p36 polynomial over the original grid's Q238 extension field is excluded outright. The **23** and **1661** reversible power consumers are concrete unsuccessful original-input decryptions. This does not exclude exponentiation after an independently chosen key multiplication, a different source ordering, a different field, or a non-power transport. Such additions require a new original-source instruction; the present arithmetic supplies none.

A plausible future route would need a *separate source-authenticated choice of field operand, exponent and receiver*, or a known plaintext prediction tied to the p36 heading. Another generic exponent sweep would be detached from the human puzzle.

**Reproduce:** [Single-file Node.js 22 CommonJS SFT](../sims/lp2_p36_q238_dh_power_sft.cjs). It reconstructs Q238 from all 256 source bytes, checks original input shape, evaluates the exact 15th-power obstruction, computes both inverses and round-trips both field values without external dependencies. The mathematical algorithm was independently run against the canonical GitHub source data before this report was written.

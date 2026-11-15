# Signed-2013 DH exponentiation on the original 51×127 LP2 field-pair register

**Agent25, 15 November 2026. Bounded original-input negative.** The exact historical exponentiation operation, read as a direct row-by-column GF(29²) mask, yields no previously unknown plaintext or authentic cipher/key. This result is **distinct from the earlier additive/multiplicative rank-one row-column mask** and directly uses a historically attested *power* operation. The factorization, 51-rune red span and shaped input are established data; identifying them as a DH-style cipher is a hypothesis.

## Human-observable motivation and weakest premise

1. The source's marked p3 red triple `[13,23,2]` defines the irreducible polynomial and 29²-element field relation `u²=8+3u` over GF29.
2. The source's p39 marked red triple defines `15(X−24)²`, an exact factor of the 256-cell original numerical table polynomial. Division yields 254 GP29 coefficients, or **127 two-coordinate nonzero field elements `Q[j]`**.
3. The source's final p53 red span has exactly **51 runes `R[r]`**, while the full unknown corpus begins with original GP29 `[15,8]` and has **12,956 runes**, leaving **12,954 = 51×127×2** after its first two. These numbers permit one 51-row, 127-column array of GF29² pairs.
4. The **26 January 2013 author-signed TCP-server challenge** explicitly demonstrates *Diffie–Hellman modular exponentiation* in its `DH 23` example. This motivates a discrete experiment with `Q[j]^R[r]` rather than new numerically fitted cipher parameters.

The strong objection is explicit: the 2013 source uses prime-modulus DH and gives **no instruction** to transfer powers into the later GP29² register. The 51×127 reshape, two-rune header removal, field representation and later manuscript application were recognized retrospectively. This test addresses a distinct, simple and reversible possibility suggested by those source objects, without upgrading that choice to creator intent.

## Complete frozen source consumer

Keep the full published rune order and all original 256 table bytes. For row `r=0..50` and column `j=0..126`, read the original pair `C[r,j]` after the initial two GP29 runes. Use `Q[j]` as field base and the source red rune `R[r]` as exponent. Test the only two common printed-rune numeric interpretations: the GP **ordinal** `0..28` and its source GP **prime value**.

For each of these exponent interpretations, compute the field power `K[r,j]=Q[j]^R[r]` and evaluate four direct reversible masks:

| Operation | GP29² inverse on each original cell |
| --- | --- |
| additive subtraction | `P=C−K` |
| additive addition | `P=C+K` |
| multiplicative inverse | `P=C/K` |
| multiplicative direct | `P=C×K` |

Thus exactly **eight** original models are tested. All 127 quotient bases are nonzero, so division and multiplication are well-defined. This is a word-independent field operation that preserves the exact 12,954 cell coordinates; the first two header runes are never silently replaced, fitted or decrypted. No key phases, output substitutions, per-page exceptions or arbitrary row/column order are adjusted against language.

## Exact original and positive-control output

The original unmodified 12,954-rune suffix has GP29 IoC **0.03447896166** and the frozen native-English trigram score **−13.28405598**. All eight power masks remain near uniform.

| Red exponent / inverse | Original GP29 IoC | GP-English trigram log score (nats/rune) |
| --- | ---: | ---: |
| ordinal / C−K | 0.034471393 | −13.294535 |
| ordinal / C+K | 0.034467471 | −13.253397 |
| ordinal / C/K | 0.034469712 | −13.283238 |
| ordinal / C×K | 0.034486256 | **−13.242374** |
| GP prime / C−K | 0.034468604 | −13.275581 |
| GP prime / C+K | 0.034484123 | −13.322948 |
| GP prime / C/K | 0.034489630 | −13.305691 |
| GP prime / C×K | 0.034477817 | −13.344656 |

The independent **source-length native GP-English controls** have IoCs **0.060991**, **0.060373** and **0.062977**, and their exact same scored 12,954-rune windows score **−7.78901**, **−7.87309** and **−8.03328** respectively. Even the best of the eight original inverses is over five nats/rune below the *worst* native control; none produces a recognizable opening or other source-language recovery.

For **every one of the eight variants**, the source cipher is decrypted and exactly re-encrypted at all **12,954 original positions**. A complete **12,954-rune native GP-English plant** is encrypted with the inverse operation and recovered exactly. Changing one actual red exponent in the plant breaks recovery for every variant. These controls distinguish an executable field inverse from merely seeing printable GP transliterations.

[Self-contained original-input CommonJS SFT](../sims/lp2_2013_dh_51x127_field_rowpower_sft.cjs) was committed before [Windows Node22 source execution 43657965874](https://github.com/FlareZ123/liber-primus/actions/runs/43657965874), which passed on the exact source files and printed all eight original outputs and plant assertions.

## Cryptanalytic decision

Retire **only** this direct, two-exponent, four-inverse DH-style 51×127 consumer as an explanation of GP-native English in the original corpus. Its available numeric source clues do not by themselves recover an LP2 cipher key or plaintext. Historical 2013 DH does not mandate field powers here; nonlinear stateful transport, a differently sourced keystream, alternative segmentation and non-English intermediate registers remain possible. Further variants require an independent source selector that explains how a solver would obtain the key or reversible operation.
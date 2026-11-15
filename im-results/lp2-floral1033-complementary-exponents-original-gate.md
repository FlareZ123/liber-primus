# Floral chapter headings as complementary exponents modulo 1033

**Agent5, 15 November 2026. Classification: new source-number coincidence and bounded original-cipher inverse; no LP2 plaintext/key recovered.**

## An independently specified, short arithmetic path

The original LP2 marks record an 8-rune red heading on physical p40 and a 9-rune red heading on p54. These head the only two original floral chapters and are also the only two of 18 red spans whose ordinary printed-order GP29 coefficient polynomial vanishes at the independently special red-field value x=24 (an earlier result). Summing their *canonical GP prime weights* in order yields:

- p40 heading `ᚠᚾᛗᚣᚷᛞᚫᚻ`: **435**;
- p54 heading `ᚪᛗᛝᛞᛡᚦᛉᛁᛗ`: **597**;
- together **435+597=1032**, which equals **φ(1033)** because 1033 is prime.

The original independently known 2014 7×7 and 5×5 magic squares each have row sum **1033**. The original p33–39 cuneiform likewise includes 1033 as one of two repeated quantities. This ties an original title-pair operation and a published numeric source, but **neither the original book nor Cicada's authenticated messages instruct solvers to sum these headings, identify 1033 as a modulus, exponentiate, or decrypt with it**. The φ match was identified after prior work had already singled out the floral headings, so it is exploratory and should not be assigned a discovery-wide chance significance.

A concrete historical-style operation can nevertheless be frozen without fitted key material. Signed 2013 Cicada sources authenticate a `BASE29` command and the DH paradigm; **choosing 29 as a multiplicative base modulo1033 is still a new hypothesis**. Its exact group arithmetic is strikingly complementary:

```text
29^435 mod 1033 = 680
29^597 mod 1033 = 278
680*278 mod 1033 = 1
```

Since 29 has order1032 modulo1033, both exponents label inverse units. This observation suggests, but does not authenticate, a common reversible key-generator family for the two floral chapters.

## One completed no-fit original inversion

For each heading, remove only that original chapter's visible red 8/9-rune prefix and retain its complete following body, including all physical page joins. Generate `state_0=1`; update `state_(i+1)=state_i*(29^headingSum mod1033) mod1033`; take `K_i=state_i mod29`. Test both ordinary GP29 additive inverse signs, `P_i=(C_i ± K_i) mod29`. The key origin is the first black-body rune, no phase offsets or arbitrary reductions; each original ciphertext and red prefix is untouched.

| Source chapter | Full black-body runes | Raw GP29 IoC | Minus key IoC | Plus key IoC |
| --- | ---: | ---: | ---: | ---: |
| p40–53, exponent 435 | 3000 | 0.034544403690 | **0.034486384350** | 0.034468822941 |
| p54–55, exponent 597 | 299 | 0.033489708424 | **0.033646831721** | 0.034791587170 |

Both decoded streams remain near random-distribution GP29 and have no sustained native-language reading; the direct use of the complementary exponent generator does not recover ciphertext plaintext. Both exact inverses reencrypt **every original rune**. Independent synthetic native-p57 plaintext under the identical two frozen keystreams is recovered completely, confirming the implemented reversible formula without supporting its historical use.

**[Reproducible source-exact CommonJS SFT](../sims/lp2_floral1033_complementary_exponents_sft.cjs)** reads `resources/liber-primus/lp2-ink-annotations.json`, `lp2-corpus.json`, and the archived 2014 `cicada2014-openpuff-magic-squares.txt`, asserts the printed magic-square row sums, GP-prime heading sums, both inverse exponent products, original length/IoCs, forward reconstruction and plaintext plants.

**Decision:** Retain only the exact `435+597=φ(1033)` cross-object identity as a possible clue, tagged speculative. The direct modulo1033 multiplicative-stream additive decoder is negative. Do not expand to arbitrary bases, secret exponents, transpositions, alternate alphabets or key phases without an authored consumer clue. This does not change the authoritative established-results synthesis.

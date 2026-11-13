# Dual-source 252-symbol grid quotient as a direct RC4 key

**Agent 8, 13 November 2026. Classification: source-motivated finite original-cipher negative.** No previously unknown Liber Primus plaintext, authentic key, cipher architecture or deep-web destination recovered.

## Source hypothesis

The independently PGP-authenticated original 2013 Cicada TCP challenge supplies **BASE29 3301 → 3QO**, with exact GP29 digit values **[3,26,24]**. The red physical p39 triad in the original manuscript is **[27,5,15]**. With the previously independently supported ascending-power red-triad reading, these define two degree-two polynomials over GF29:

- H(X)=3+26X+24X², source-authenticated 2013 digits.
- G(X)=27+5X+15X², source-authenticated original p39 red rune values.
- Their product is **23+21X+11X²+17X³+12X⁴ (mod29)**.

Read the original 256-cell base60 table on pp49–51 as 256 descending GF29 coefficients. Exact long division by H×G leaves **[0,0,0,0]** remainder and gives a **252-symbol quotient**, beginning **[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]**. This algebraic relationship predates the present test and is documented in the [2013-signed worked example and original grid factor](2013-base29-gf29-grid-factor.md).

The tested *new* consumer regards these **252 quotient GF29 residues as literal RC4 key bytes** in the existing descending-coefficient order. Standard RC4 is a historically plausible contemporary primitive (Cicada used it indirectly through OutGuess), but **the original manuscript has no instruction selecting RC4 or this quotient-to-key transfer**. This differs from previously tested [raw full 256-byte table as RC4 key](lp2-grid256-rc4-original-gate.md): no raw printed bytes are the present KSA key.

## Frozen complete-original-cipher inverse

Take the exact quotient bytes as a 252-byte RC4 KSA key without salt, discard or reordering. Generate PRGA output (a) continuously across all **12,956** original unknown GP29 runes or (b) restart RC4 at each of the 55 physical rune-bearing pages. Project each byte either with **byte mod29** or **(byte >>>3) mod29**. Decode original rune C by GP29 addition or subtraction of that key symbol, respecting every physical rune position and preserving original word boundaries.

Eight complete original-stream inverses are tested. Their output GP29 IoC normalized by29 is:

| RC4 stream | Output projection | P=C−K | P=C+K |
| --- | --- | ---: | ---: |
| Continuous | byte mod29 | 0.99939978 | 0.99929335 |
| Continuous | byte high-five | 0.99962163 | 1.00049796 |
| Physical-page reset | byte mod29 | 0.99955459 | 0.99898338 |
| Physical-page reset | byte high-five | 1.00066901 | 1.00009504 |

Original source IoC29 **0.99987354**. The maximum original output is **1.00066901**, entirely ciphertext-like, while genuinely solved p57 GP29 plaintext has IoC29 **1.818589** over its original 95-rune text. None of eight outputs yields previously unknown readable text.

## Exact positive control and decision

The [original-source single-file CommonJS SFT](../sims/lp2_hg_q252_rc4_original_sft.cjs) reads only canonical repository GP29 corpus and 256-byte table, verifies both source factors and the complete remainder identity, runs all eight inverses, and reencrypts the **entire 12,956 original ciphertext symbols exactly**. For each of eight fixed modes, the independently solved p57 GP29 plaintext is repeated to original length, encrypted with the same source-derived key schedule, and decrypted: **12,956/12,956 known GP29 symbols** are recovered. The script asserts eight original IoC29 values to 1e−12. The planted text is deliberately repetitive; its role is an exact decoder test, not recovered LP2 text.

**Bounded negative:** the original H×G quotient **does not decode LP2 as a conventional direct additive GP29 RC4 stream** under the eight natural fixed source clocks, projections and signs. No original source selects the quotient as an actual author key, so do not enlarge this with arbitrary drops, alternate KDFs, extra cipher layers or tuned key alphabets without new source evidence. The 252-symbol quotient and exact factor identities remain genuine mathematical observations, not a demonstrated solver route.

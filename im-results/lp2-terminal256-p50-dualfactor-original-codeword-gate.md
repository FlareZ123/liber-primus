# LP2 terminal 256 runes: direct source GF29 dual-factor codeword gate

**Agent 11, 14 November 2026. Original-input bounded negative with exact solved-page and planted codeword controls. No unknown plaintext or creator-selected key.** [Windows Node22 positive execution](https://github.com/FlareZ123/liber-primus/actions/runs/43576618511) · [standalone CommonJS SFT](../sims/lp2_terminal256_p50_dualfactor_source_gate_sft.cjs).

## Causal original-source hypothesis

Two original artifacts have **exactly 256 symbols** under independently established segmentation:

- The numeric LP2 p49–51 table: 32×8 fixed source two-character base60 tokens with 256 decoded bytes, SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.
- The final three physical LP2 rune-bearing pages: p55 **76** original GP29 runes, p56 **85**, p57 **95**, totaling **256**. P56 authentic clear text is \`AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE\`; p57 is already clear. The page55 76-rune plaintext is unknown.

The printed numeric table, interpreted as descending-power polynomial coefficients over GF29 after reducing its bytes modulo29, has the established [factorization](lp2-grid-complete-gf29-factorization.md). Its source-connected monic factors are:

- \`H(X)=X²+18X+11\`, associated with an authentic 2013 BASE29 example;
- \`G(X)=(X+5)²=X²+10X+25\`, matching the original p39 red triad and p54 GP index24;
- \`F(X)=H(X)G(X)=X⁴+28X³+13X²+9X+14\`.

Thus the table is a member of a **[256,252] GF29 polynomial code**, which imposes four exact parity constraints. A new, source-length-driven possibility is that the complete terminal **256 GP29 runes**, as printed, also satisfy this same *unkeyed* H×G factor, perhaps explaining the source's distinctive 256/256 length equality. A second possibility is that one must first perform the **actual solved p56 prime-totient inverse**, preserving p55 original and clear p57. Both are testable without fitting a cipher, without guessing page55 plaintext, and without selecting an arbitrary polynomial.

## Entire original 256-position test

Interpret all three candidate vectors as the coefficients of degree≤255 polynomials in **printed order, high to low**. Evaluate exact remainder syndromes modulo the two monic factors and their product; all rows below are ordered by **ascending polynomial coefficient** within each remainder. The SFT asserts the original table hash, original 76+85+95 runic lengths, and exactly reproduces all **85** original p56 clear rune indices using the authenticated prime-totient operation and literal GP-F skip at p56 offset56. Word segmentation is preserved during GP digraph encoding, including the original \`THAT HASHES\` boundary.

| 256-source vector | Remainder mod H | Remainder mod G | Remainder mod F |
| --- | --- | --- | --- |
| Original numeric table, base60 byte residues | **[0,0]** | **[0,0]** | **[0,0,0,0]** |
| Original p55 + ciphertext p56 + literal p57 | **[6,8]** | **[28,21]** | **[2,16,22,3]** |
| Original p55 + authentic clear p56 + literal p57 | **[22,28]** | **[20,14]** | **[17,12,10,6]** |

Neither physical terminal-rune reading shares even one of the table's **two quadratic factors**. These are exact finite-field equations that require neither an English language score nor a fitted key. They reject the **direct GP-index codeword reading**; a secretly relabelled alphabet or other keyed transform into the table's code defines a different, untested consumer.

## Locked positive plants and decision

A controllable positive plant retains **all 180 original p56/p57 runes unchanged** and changes *only the first four p55 symbols* to the unique GF29 values required to make the terminal 256-symbol polynomial divisible by F. This works because four consecutive columns form an invertible four-by-four GF29 syndrome system. Under original p56 ciphertext, source first four p55 symbols are **[21,25,19,10]**, while the codeword plant demands **[21,17,23,17]**; with p56 genuinely decoded, the plant demands **[19,13,3,1]**. The SFT solves these equations by GF29 Gaussian elimination, asserts both four-symbol outputs, preserves all subsequent source runes and checks exact zero remainders after planting. It also confirms that the actual source vectors remain noncodewords. The positive validates the test and proves that the source p56 segment is not an implementation blocker.

**Decision:** Retire the simple, direct proposition that the original 256 terminal GP29 runes, either as printed or after actually decoding the solved p56 section, are a second H×G-divisible word under the same table arithmetic convention. This tests a concrete possible use of the striking 256/256 original geometry; the relation by itself does not select an encrypted key, recover p55 plaintext or determine the manuscript's missing destination. Avoid tuning an unhinted linear scrambler merely to force parity.

**Reproduce:** \`node sims/lp2_terminal256_p50_dualfactor_source_gate_sft.cjs\` from repository root; Windows-compatible Node22 built-ins only.

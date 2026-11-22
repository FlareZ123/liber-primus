# Four literal x glyphs as source-selected algebraic erasures in the 256-cell numeral plate

**Agent 29, 22 November 2026. Classification:** reproducible original-table **known-symbol residue recovery** under a proposed literal-x interpretation. Four masked right-glyph positions are reconstructed uniquely from the other 252 cells using the unchanged historically signed 2013 BASE29 and LP2 p39 red-polynomial constraints. This is a concrete candidate human solve operation. The printed values were already visible, and no unknown LP2 plaintext or key has been recovered.

## Printed source, original clue and typed operation

Original physical pp49–51 print **256** two-glyph sexagesimal-looking cells in the exact 32×8 row-major register. Exactly **four** cells end in the lowercase glyph **x**, at zero-based cell positions **22, 51, 129, 219**, with original spellings **0x, 0x, 2x, 0x**. A human puzzle solver could interpret Latin x as an algebraic unknown. To test this without reading what those four right glyphs mean, retain each original leading digit and hide the four right-glyph numerical values.

Two other independently printed/historically documented source objects supply a concrete candidate arithmetic:

- Signed January 2013 Cicada BASE29 example: **3301 = (3,26,24) base29**. As descending GF29 polynomial coefficients, this supplies **H=[24,26,3]**.
- Original LP2 p39 **red three-rune inscription**, physical rune positions119–121: **[27,5,15]** under Gematria Primus. Reading descending polynomial coefficients supplies **G=[15,5,27]**.

These are already established source factors of the original 256 decoded base60 bytes in GF29. Their product is **HG=[12,17,11,21,23]**, a degree-four polynomial. This test asks a different reader question: if the four literal x digits are unknowns, what values do the existing source factors force from the other 252 cells?

Take the ordinary 60-character numeral order, in which an unmasked cell ab has numeric value **60a+b**, but temporarily leave every literal x right digit unknown. All GF29 polynomial inputs remain in original printed order, highest-degree coefficient first. At the four masked positions, retain the known contributions from leading 0,0,2,0. Write the unknown common right digit as d:

    P(d) = Pknown + d * E,

where E has coefficient1 exactly at positions22,51,129,219.

## Two independent source factors predict the same masked digit

Long division of the **252 fully visible non-x cells** plus four visible leading-digit contributions gives these exact GF29 remainder vectors:

| Original-source factor | Remainder of Pknown | Remainder of E | d implied by each equation |
| --- | --- | --- | --- |
| Signed 2013 H | [23,12] | [6,17] | **[1,1]** |
| Original red p39 G | [28,8] | [1,21] | **[1,1]** |
| Their exact product HG | [23,7,26,1] | [6,22,3,28] | **[1,1,1,1]** |

Both historically separate source factors agree that the repeated right glyph must satisfy **d=1 mod29**, without reading any of the four original x numerical values. The literal printed base60 glyph x is the **final digit59**, and **59 mod29=1**, matching every equation.

The assumption that all four x glyphs share one numerical value is unnecessary for reconstruction. Treat the four right-hand values as **independent unknowns**. The quartic remainder matrix for the four original positions has **rank4 over GF29** and uniquely solves to

    [d22,d51,d129,d219]=[1,1,1,1] mod29.

Adding the already visible leading 0/0/2/0 contributions yields the **whole-cell residues [1,1,5,1] mod29**. The source 2x cell has value179, residue5, while its right glyph x retains residue1. The original values **[59,59,179,59]** satisfy those predicted residues.

**Residue ambiguity:** GF29 checks identify masked right digits only modulo29. In the full 60-digit range, **1, 30 and 59** all meet the arithmetic requirement; the independently printed alphabet position supplies59. No unprinted ASCII character can be uniquely reconstructed without an additional numeral convention.

## Explicit rival tests, positive plant and limits

The previously considered missing-f **59-character numeral alphabet** is an independent rival. Keeping all its **other 252 digit values** fixed and still treating x as a common unknown gives **no d satisfying H or G**. Reversing the coefficients of either source polynomial also supplies no consistent d. These finite tests distinguish the exact operation under competing original-source conventions.

A solved-LP1 control takes **252 real GP runes** from the authenticated LOSS OF DIVINITY passage. Multiplication by the original H×G polynomial converts those into 256 GF29 codeword coefficients. Mask the **same four x positions** and solve the original quartic matrix: all four withheld coefficients are recovered exactly, reproducing **256/256 encoded coefficients**. The full pipeline is reversible on a genuine solved-text payload.

**Critical selection caveat:** the H×G divisibility was originally identified with access to the **unmasked original table**. Once that full codeword relation is accepted, four-erasure recovery at any full-rank coordinate set follows mathematically. **Eleven distinct right-hand glyphs occur exactly four times**, so four instances of x are not a unique property. Latin x suggests an unknown algebraic variable, but no first-party text commands erasing it. The recovered symbol agreement cannot be treated as an independent probability of authorship or plaintext authenticity.

**Decision:** preserve the x-mask as a possible historical way to recognize the existing 252-dimensional source code; it is not an authenticated instruction. No unknown GP29 plaintext, original author-selected cipher, key, or destination follows. A successor needs a source-selected receiver for the resulting 252 data positions or full H×G quotient rather than further erasure demonstrations.

**Reproduce:** [original-source read-only Windows Node22 SFT](../sims/lp2_p50_literal_x_four_erasure_source_sft.cjs). Inputs include the published 32×8 table, p39 red-runic ink annotations, historical 2013 BASE29 coefficients and authentic solved LP1 rune text. [Successful Windows Node22 original-source run](https://github.com/FlareZ123/liber-primus/actions/runs/45015145828).

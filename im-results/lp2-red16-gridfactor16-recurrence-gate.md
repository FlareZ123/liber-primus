# Original red-16 chapter headings as 16-state GF29 recurrence seeds

**Agent31, 13 November 2026. Bounded original-cipher negative; successful source-original CI.** The two original 16-rune red chapter headings each exactly fit the degree of the independent **monic degree-16 factor** of the full 256-cell p49–51 GF29 polynomial. Under the simplest frozen feedback-register interpretation, neither heading yields unknown-page plaintext in its following original chapter. Eight completely reversible original-cipher inverses have output IoC **0.03425–0.03489**, all near 1/29 and with no coherent GP-native text. This does not supply a key or establish that the factor/heading match was intended.

## Source and targeted human operation

The 2014 original LP2 images print one 16-rune red heading at the start of **p3** and one at the start of **p23**. The corresponding source-visible chapters are **pp3–7** and **pp23–26**; the title itself supplies a naturally initialized **16-cell register**, leaving exactly **1,129** and **1,005** ciphertext runes after removing only each original red title.

The independently derived GF29 factorization of the original 256-cell table contains the following monic degree-16 product, with coefficients listed constant-first:

`F16 = [13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]`

It equals the product of `(X+5)^2`, `X²+18X+11`, `X³+14X²+16X+24`, and the monic nonic `X⁹+12X⁸+20X⁷+10X⁶+5X⁵+X⁴+9X³+15X+11`. The exact original complete table polynomial **is divisible by this F16**, a test asserted independently against all 256 original table byte residues in the reproducer. This factor was previously known from the full table factorization; using the two distinct red16 headings as seeds for this particular recurrence is the new candidate operation. The visual/source clue remains **suggestive**: no author instruction specifies polynomial clocks, field register taps, or an additive cipher.

## Fixed reversible inverse and original-cipher outcomes

Let `s[0..15]` be the original first 16 GP29 rune indexes in the marked title and `F(x)=Σ f_j x^j`. For every next register symbol, apply the standard monic linear recurrence
`s[t+16] = -Σ(j=0..15) f_j*s[t+j] mod29`.
Use register outputs beginning at `s[16]` as a GP29 additive cipher key for *all original runes following the title*, continuing across the printed physical page boundaries without reset, skip, fitted phase or deleted symbols. Evaluate both signed directions `C±K`. The one finite alternate factor orientation is its **monic reciprocal** `x^16 F(1/x)/13`, again with both signs; there are exactly eight outputs for the two titled chapters.

| Original title→chapter | GF29 factor clock | C−K IoC | C+K IoC |
| --- | --- | ---: | ---: |
| p3 → pp3–7 body, 1,129 runes | F16 | 0.03451086 | 0.03424860 |
| p3 → pp3–7 body | Monic reciprocal | 0.03435225 | 0.03428158 |
| p23 → pp23–26 body, 1,005 runes | F16 | 0.03424709 | 0.03445323 |
| p23 → pp23–26 body | Monic reciprocal | 0.03430655 | 0.03489326 |

For comparison, the untouched original IoCs are 0.03461294 (p3 chapter after red title) and 0.03430457 (p23 chapter after red title). Complete decoded beginnings contain no legible paragraph; for example the p3 forward C−K first 20 labels are `N AE N B M IA TH C OE NG Y P S T EA P L X F Y`, and p23 forward C−K first 20 are `A EO EO NG F NG X E I TH Y G D O G F EA NG X B`.

Every original 1,129- or 1,005-symbol output is **exactly re-encipherable** by the inverse operation, which is only an implementation check. A separate independently known solved-page p57 GP plaintext, repeated to each target chapter's exact length, is encrypted with the same source-derived heading/clock and recovered **symbol-for-symbol** for all eight cases. The complete standalone CJS reproducer asserts original ink headings, source runes, table divisibility, factor coefficients, eight original IoCs, original re-encryption and the authentic solved-native plaintext plant.

## Decision

This rules out only the direct **monic F16 or reciprocal-heading-seeded GF29 LFSR as a repeating-free additive stream on the two source-visible chapters** under two signs. It does not reject the original table factors, cipher states hidden in another medium, non-additive or nonlocal consumers, altered reset semantics specified by a genuine manuscript instruction, or genuinely encrypted binary content. Do not enlarge an unsourced factor choice into arbitrary tap/phase/key searches. A separate source-selected cipher operation or independently authenticated plaintext is required.

[Single-file original CJS reproducer](../sims/lp2_red16_gridfactor16_recurrence_sft.cjs) · [successful original source CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43422820328) · [previous established GF29 factorization](lp2-grid-complete-gf29-factorization.md).
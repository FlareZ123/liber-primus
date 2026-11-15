# A p27 doublet pattern as a conditional plaintext-difference key anchor

**Agent 39, 15 November 2026. Classification: exploratory original-cipher decision. No authentic unknown rune plaintext, source-selected key, decoder or destination recovered.** This report introduces one explicitly reversible mechanism that differs from the previous fixed-plaintext-zero multiplicative feedback tests. Its main result is a rigorous condition on a twelve-rune original word, together with a complete conditional key witness and a narrow original-table key comparison.

## An invertible model motivated by the visible rare repeats

The original GP29 ciphertext on physical p0–55 has only 86 same-rune adjacent transitions on 55 nonempty pages. Historical 2015 solvers explicitly considered ciphertext differences and the 29-prime alphabet. One possible alternate mechanism multiplies **successive plaintext differences** by nonzero, evolving secret field elements:

\[
C_i=C_{i-1}+k_i(P_i-P_{i-1})\pmod {29},\qquad
P_i=P_{i-1}+k_i^{-1}(C_i-C_{i-1})\pmod {29}
\]

Here each \(k_i\) can be completely independent in \(1,\dots,28\), so there is no fitted short period, hidden fixed alphabet, guessed seed or forced use of the 2014 grid. A genuine decoder would still require the entire source-derived \(k_i\) tape and the initial plaintext rune. The crucial, exact key-independent identity is

\[
C_i=C_{i-1}\iff P_i=P_{i-1}.
\]

It applies *inside* an original printed word even if the secret key changes arbitrarily at every position. It differs from the earlier model \(C_i=C_{i-1}\iff P_i=s\), which assumed a fixed plaintext zero label \(s\).

## Exact source word and one conditional English witness

At physical p27, rune offsets 79–90 inclusive, the original printed twelve-rune word is:

\`ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ\` / GP aliases \`EORNSOOCAEYEE\`.

Its eleven successive within-word equality tests are \`00001000001\`: repeats occur **only at destination positions 5 and 11** (zero based), after the immediately preceding rune. Under the proposed multiplicative-difference architecture, a twelve-rune plaintext word must have *exactly* that identical equality pattern, no matter how the secret field multiplier changes.

The existing 29,157-entry frozen TextBlob English list contains **zero** GP12 words with this complete exact equality mask under the project's documented GP spelling. That observation has an important limitation: the independently intelligible English word **AMBASSADRESS**, encoded in GP as the twelve runes \`A M B A S S A D R E S S\`, has **exactly the required two repeated pairs**. The finite dictionary's zero count therefore does **not** eliminate this entire cipher family as impossible English. It illustrates how an uncommon actual word can escape the convenient research lexicon. AMBASSADRESS is offered solely as a *constructive hypothetical plaintext*, with no authorial or contextual evidence that it is what p27 says.

For this hypothetical, the nine nonrepeat steps **uniquely impose** the consecutive nonzero multipliers, in source order:

\`[19,12,5,11,*,26,10,11,13,22,*]\`

where the two asterisks correspond to repeated plaintext symbols and leave \(k_i\) unconstrained. Every displayed multiplier re-encrypts its original unchanged p27 ciphertext position exactly. This match is **tautological for any guessed plaintext word with the right equality mask**; it is not independent corroboration of AMBASSADRESS.

## Frozen physical-table key comparison

A downstream original source could in principle supply the required \(k_i\). One test fixes the manuscript's physical pp49–51 **256 printed table bytes**, conditional conventional-base60 interpretation, and converts each byte to a nonzero GF29 multiplier via \`1+(byte mod28)\`. This is a hypothesis, not a source-specified mapping. Compare the nine exact putative multipliers above to the resulting 256-period key under the only two obvious source clocks at the p27 word: **global rune offset 6606** or **p27-local rune offset 79**. Allow the key at each original destination rune or the immediately preceding rune, without a phase search or a word-selected post hoc shift.

| Source clock | Multiplier at destination | Multiplier at predecessor |
|---|---:|---:|
| Global rune index | **0/9** | **1/9** |
| Physical-page rune index | **0/9** | **0/9** |

None is an exact originating stream for this conditional word and operation. Since the source does not indicate the byte-to-multiplier conversion, a different cipher register, or this particular word as the plaintext, the comparison does not establish that the printed table has been exhausted.

An independent constructive encoder uses the complete, authentically clear **95-runic p57 PARABLE** as test plaintext with a deterministic evolving nonzero GF29 multiplier tape. The identical inverse recovers **95/95** original solved-runic letters and preserves every original consecutive-repeat identity, showing the proposed algebra is genuinely reversible. It supplies no evidence that Cicada used it.

## Decision

This whole class of per-step secret multiplication of **plaintext differences** has an unusually sharp original-site constraint, but the original p27 word still admits at least one actual English candidate. The 2014 table's single literal nonzero-mod28 key conversion matches only 0–1 of nine required source multipliers under the frozen clocks. **No unknown LP2 plaintext can be asserted, and no source-derived key is recovered.** Do not widen this branch into arbitrary word suggestions or adjustable table rotations. Reopen it only if an independent author-selected key stream predicts the nine nonzero multipliers *before* examining this original word and goes on to decrypt further original words.

**Exact reproducer:** [single runnable Node22 CommonJS source-original test](../sims/lp2_plain_difference_multiplier_p27_original_sft.cjs), requiring only the checked-in original rune corpus, 256-byte table and already-pinned TextBlob wordlist. It asserts the p27 original indices and offsets, all dictionary masks, the complete hypothetical forward-key witness, all four source-table comparisons and the 95/95 genuine solved-source positive.

# Direct p50 Q238 pad versus two red119-delimited original prefixes

**Decision, Agent 38, 13 November 2026: a bounded original-cipher negative, not recovered plaintext.** The shortest untested way to consume the mathematically exact 238-coefficient p50 residual together with the two independently original-marked 119-rune passages is a direct GP29 one-time mask. All eight canonical readings fail to produce native text.

## Source-constrained original inputs

The authentic LP2 pp49–51 256-byte table (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`) is the descending coefficient string of `P(X)` in GF29. Its previously established exact full factorization is `28(X+5)^2(X²+18X+11)(X³+14X²+16X+24)N9(X)Q238(X)`, with irreducible monic `Q238` of degree238 and the documented degree9 factor `N9`. Dividing by all smaller factors yields **240 serialized coefficient slots**: a first forced zero from the original 203 byte, the leading **one** of monic `Q238`, then **238 actual non-leading coefficients**. This exact factorization is an upstream established algebraic observation, **not proof of author intent**. See [source factorization](lp2-grid-complete-gf29-factorization.md).

The original physical p3 and p39 each have a **complete isolated three-rune red span starting at local position119**, bracketed by source-red thirteen-dot punctuation at positions119 and122. Each page therefore has a naturally defined preceding 119-rune passage. Their concatenation in either physical-page order has **238 runes**, exactly one per non-leading `Q238` coefficient. The original red marks, factor degree and passage lengths fix the data; no plaintext cribs, phase search or arbitrary key material are used. Whether to treat the quotient as a *mask* is the falsifiable, unauthenticated proposal.

## Eight direct, complete inverses

Let `K[0..237]` be the 238 lower coefficients of monic `Q238` in the table's descending source order. Let `C` be the 119-rune prefix of p3 followed by the 119-rune prefix of p39, or the two prefixes in the other order. Test `P_i=(C_i−K_i) mod29` and `P_i=(C_i+K_i) mod29` with both ordinary and reversed coefficient order. Preserve every original rune without deletion, page shift, inserted punctuation or tuned initial phase.

| Prefix order | Q238 coefficient order | Subtract pad GP29 IoC | Add pad GP29 IoC |
| --- | --- | ---: | ---: |
| p3 then p39 | table-descending | 0.03605999 | 0.03325887 |
| p3 then p39 | reversed | 0.03432259 | 0.03496082 |
| p39 then p3 | table-descending | 0.03464170 | 0.03318796 |
| p39 then p3 | reversed | 0.03559905 | 0.03694642 |

Every full 238-rune output remains close to the **uniform 1/29 = 0.03448276** reference, and the first 40 GP token readouts of all eight variants contain no coherent passage. For comparison, the **unaltered, independently solved 95-rune p57** has IoC approximately **0.06271**. The test precisely re-encrypts all 238 original rune positions under every tested sign/orientation and recovers a separate genuinely solved-GP positive plant under the same pad.

**Research consequence:** the exact `238=119+119` coincidence does not immediately give a direct masked message in either of the source-defined prefix orders. This removes an elementary quotient-as-pad consumer before further speculation about irreducible-field state, hidden nonlinear alphabets or transport encodings. It does **not** refute the mathematical factorization, a different authored operation, or an external source key, and it establishes no newly decrypted text. Prior work separately checked the **different** construction in which the same source 238-rune concatenation seeds a `Q238` LFSR that is then run over the entire book: [reproducer](../sims/q238_red119_lfsr_source_sft.cjs). The present experiment uses **the actual quotient coefficients directly as the mask**, so it is not that LFSR test.

[Complete, input-asserting, CommonJS reproduction and native positive control](../sims/lp2_q238_red119_direct_pad_sft.cjs).

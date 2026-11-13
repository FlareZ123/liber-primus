# p57 word-circumference edge keys on the original p55 and 55 rune-bearing pages

**13 November 2026, Agent50. Classification: source-motivated, bounded direct-consumer negative. No unknown plaintext, authentic key, cipher, or destination is recovered.** This tests a newly noticed size-level connection as an exact GP29 inverse without substituting a fitted key or changing the source register.

## Original clue and fixed construction

The solved original LP2 p57 says, “WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.” Its 95 source-matched GP29 runes form **20 complete printed words** of lengths

\`[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]\`.

The adjacent unknown p55 physically starts with one rune continuing a p54 word. Its **remaining 75 original runes** comprise 16 complete printed words. Removing the **first** (or independently the **last**) rune of each solved p57 word leaves **95−20=75 runes**, a precise length match. Removing **both endpoints** of every solved p57 word yields **95−40=55 runes**; there are **55 rune-bearing unsolved physical pages** p0–p55, because p50 has no runes. These equalities are artifact facts. Whether the author intended either as a key remains unverified. The more literal two-edge reading does not explain why one interior symbol should index a whole unknown page.

Three *predefined*, elementary direct consumers are tested, without cyclic shifts, tuned alphabet relabelings, inserted symbols or searched offsets:

1. **75-body pad:** flatten the p57 after-shedding word interiors in their printed order, for each of the two one-edge choices. Apply \`P_i=(C_i±K_i) mod 29\` to the original p55 runes at page-local offsets 1–75. Both signs are the ordinary additive/decrypt direction ambiguity.
2. **75-/76-rune source-tail pads:** The first physically printed p57 line has 20 GP runes, leaving 75 in the remaining four lines; the first four complete p57 printed words have 19 runes, leaving 76 in its final 16 words. Test the intact source p57 suffix after the first line on the p55 75-rune complete-word body, and its suffix after the first four words on full p55 (76 runes). Use both direct GP29 additive signs with no fitted offset. These are distinct original-image/text-alignment observations, though their key windows overlap by 75 of 76 symbols.
3. **55-page shift:** flatten the p57 strict word interiors (remove first and last) in printed order. Assign key index j directly to the j-th *rune-bearing* original page in physical order, skipping runeless p50, and apply \`P_{page,i}=(C_{page,i}±K_j) mod 29\` to all runes of that page.

Both interpretations treat the source runes as **GP alphabet indices 0–28**. This is a reasonable direct register suggested by solved GP Ciphers but **no original instruction mandates additive application**. The p54 incoming carry is excluded from the first test and retained within the complete p55 in the second.

## Exact original-input outcomes

| Fixed key and inverse | Output IOC | Assessment |
| --- | ---: | --- |
| p55 75-body, remove p57 first edge, subtract | 0.03963963964 | Nonlinguistic |
| p55 75-body, remove p57 first edge, add | 0.03423423423 | Nonlinguistic |
| p55 75-body, remove p57 last edge, subtract | 0.03351351351 | Nonlinguistic |
| p55 75-body, remove p57 last edge, add | 0.03819819820 | Nonlinguistic |
| p55 75-body, p57 after first printed line, subtract | 0.03711711712 | Nonlinguistic |
| p55 75-body, p57 after first printed line, add | 0.03387387387 | Nonlinguistic |
| p55 full 76, p57 after first four words, subtract | 0.03684210526 | Nonlinguistic |
| p55 full 76, p57 after first four words, add | 0.03403508772 | Nonlinguistic |
| Whole unknown 12,956 runes, p57 strict-interior page key, subtract | 0.03446806690 | Nonlinguistic |
| Whole unknown 12,956 runes, p57 strict-interior page key, add | 0.03446208519 | Nonlinguistic |

The unmodified 75-rune p55 body has IOC **0.03855855856**. The unmodified full 12,956-rune ciphertext has IOC **0.03447839786**; solved p57 has IOC **0.06270996641**. The best 75-rune arithmetic candidate begins \`USSMAEARXYDYHSUAEYSHTISUEA...\`, and the page-shift candidates leave the full book's symbol statistics nearly unchanged. None supplies an independently readable ≥40-rune plaintext sequence. The 75-/76-rune candidate outputs and the complete 55-page candidate previews are produced by the SFT; no post-hoc selection of an offset or transform was made.

For each fixed sign and key, every source-p55 candidate is re-encrypted to its exact original 75 symbols, and a native solved-p57 75-rune plant is encrypted and decoded exactly. For the 55-page test, page-shaped plants constructed from solved p57 plaintext runes also invert in every page, and the 12,956 original runes re-encrypt exactly. These prove the arithmetic implementations are reversible and correctly indexed. Since any additive key offers the same round-trip, the control supplies **no evidence that the source key is historical**.

The only assumptions needed for the reported finite negatives are the specified shedding operation, GP-index register, printed order, direct additive consumer and page/position correspondence. Results do not exclude alternate source-selected consumers, partial word-specific keys, stateful operations, or genuine instructions encoded outside the text. The cardinality matches themselves require independent source support before stronger significance is assigned.

## An all-secret plaintext-crib constraint on the 76/75 tail alignment

The source p57 tail may alternatively be hypothesized as p55's *plaintext* rather than as the pad. Under the exact same source-derived alignment, **no fixed GP29 monoalphabetic substitution can map the original p55 ciphertext to that intact p57 tail**, regardless of the secret alphabet. On the full 76-rune alignment, there are **99 unordered position-pairs** with the same p55 rune but different proposed p57 plaintext runes, which violates even a non-injective substitution. There are also **171 unordered position-pairs** with different p55 runes but equal proposed p57 runes, which violates injectivity of a reversible substitution. A concrete contradiction occurs at p55 page-local offsets **0 and 33**: both ciphertext runes are GP index21, while the proposed p57 tail plaintext runes are indices16 and9. On the 75-rune body/last-four-lines alignment, the two mismatch counts are **98** and **168**, respectively.

These counts exclude only an *unaltered stationary monoalphabetic substitution of p55 into that fixed p57 passage*; Vigenère/autokey, source-specific state, transposition, or different target prose are outside the claim. Unlike a tuned readability score, the first same-cipher contradiction is decisive and independent of language scoring or a secret 29-rune bijection. The SFT asserts all four exact counts.

## Exact reproduction

- Input: [canonical original-image-linked LP2 corpus](../resources/liber-primus/lp2-corpus.json), [original printed transcription](../resources/liber-primus/lp2-transcription.txt), physical p55 and solved p57.
- SFT: [\`sims/lp2_p57_word_shed_edge_key_sft.cjs\`](../sims/lp2_p57_word_shed_edge_key_sft.cjs), standalone Node.js 22 with no extra dependencies. It asserts source p57 word-count, length and equality of all 95 transcription glyphs against canonical p57 indices, 76/75 p55 length, exact source p57 five-line lengths [20,17,17,18,23] and 19-rune four-word prefix, and 55/12,956 page domain, then prints all outputs, IOC and positive inverse plants.
- Decision: retire **these ten precisely specified additive direct consumers**. A future mechanism must be selected by an independent original clue, yield authentic unknown plaintext, and explain the 1-rune page carry if it acts across p54–55.

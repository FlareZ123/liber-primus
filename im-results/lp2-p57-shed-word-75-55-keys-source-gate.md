# p57 word-circumference edge keys on the original p55 and 55 rune-bearing pages

**13 November 2026, Agent50. Classification: source-motivated, bounded direct-consumer negative. No unknown plaintext, authentic key, cipher, or destination is recovered.** This tests a newly noticed size-level connection as an exact GP29 inverse without substituting a fitted key or changing the source register.

## Original clue and fixed construction

The solved original LP2 p57 says, “WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.” Its 95 source-matched GP29 runes form **20 complete printed words** of lengths

\`[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]\`.

The adjacent unknown p55 physically starts with one rune continuing a p54 word. Its **remaining 75 original runes** comprise 16 complete printed words. Removing the **first** (or independently the **last**) rune of each solved p57 word leaves **95−20=75 runes**, a precise length match. Removing **both endpoints** of every solved p57 word yields **95−40=55 runes**; there are **55 rune-bearing unsolved physical pages** p0–p55, because p50 has no runes. These equalities are artifact facts. Whether the author intended either as a key remains unverified. The more literal two-edge reading does not explain why one interior symbol should index a whole unknown page.

Two *predefined*, elementary direct consumers are tested, without cyclic shifts, tuned alphabet relabelings, inserted symbols or searched offsets:

1. **75-body pad:** flatten the p57 after-shedding word interiors in their printed order, for each of the two one-edge choices. Apply \`P_i=(C_i±K_i) mod 29\` to the original p55 runes at page-local offsets 1–75. Both signs are the ordinary additive/decrypt direction ambiguity.
2. **55-page shift:** flatten the p57 strict word interiors (remove first and last) in printed order. Assign key index j directly to the j-th *rune-bearing* original page in physical order, skipping runeless p50, and apply \`P_{page,i}=(C_{page,i}±K_j) mod 29\` to all runes of that page.

Both interpretations treat the source runes as **GP alphabet indices 0–28**. This is a reasonable direct register suggested by solved GP Ciphers but **no original instruction mandates additive application**. The p54 incoming carry is excluded from the first test and retained within the complete p55 in the second.

## Exact original-input outcomes

| Fixed key and inverse | Output IOC | Assessment |
| --- | ---: | --- |
| p55 75-body, remove p57 first edge, subtract | 0.03963963964 | Nonlinguistic |
| p55 75-body, remove p57 first edge, add | 0.03423423423 | Nonlinguistic |
| p55 75-body, remove p57 last edge, subtract | 0.03351351351 | Nonlinguistic |
| p55 75-body, remove p57 last edge, add | 0.03819819820 | Nonlinguistic |
| Whole unknown 12,956 runes, p57 strict-interior page key, subtract | 0.03446806690 | Nonlinguistic |
| Whole unknown 12,956 runes, p57 strict-interior page key, add | 0.03446208519 | Nonlinguistic |

The unmodified 75-rune p55 body has IOC **0.03855855856**. The unmodified full 12,956-rune ciphertext has IOC **0.03447839786**; solved p57 has IOC **0.06270996641**. The best 75-rune arithmetic candidate begins \`USSMAEARXYDYHSUAEYSHTISUEA...\`, and the page-shift candidates leave the full book's symbol statistics nearly unchanged. None supplies an independently readable ≥40-rune plaintext sequence. The 75 candidate outputs and the complete 55-page candidate previews are produced by the SFT; no post-hoc selection of an offset or transform was made.

For each fixed sign and key, the source-p55 candidate is re-encrypted to its exact original 75 symbols, and a native solved-p56 75-rune plant is encrypted and decoded exactly. For the 55-page test, page-shaped plants constructed from independently solved p56 runes also invert in every page, and the 12,956 original runes re-encrypt exactly. These prove the arithmetic implementations are reversible and correctly indexed. Since any additive key offers the same round-trip, the control supplies **no evidence that the source key is historical**.

The only assumptions needed for the reported finite negative are the specified shedding operation, GP-index register, printed order, direct additive consumer and page/position correspondence. Results do not exclude alternate source-selected consumers, partial word-specific keys, stateful operations, or genuine instructions encoded outside the text. The cardinality matches themselves require independent source support before stronger significance is assigned.

## Exact reproduction

- Input: [canonical original-image-linked LP2 corpus](../resources/liber-primus/lp2-corpus.json), [original printed transcription](../resources/liber-primus/lp2-transcription.txt), physical p55 and solved p57.
- SFT: [\`sims/lp2_p57_word_shed_edge_key_sft.cjs\`](../sims/lp2_p57_word_shed_edge_key_sft.cjs), standalone Node.js 22 with no extra dependencies. It asserts source p57 word-count, length and equality of all 95 transcription glyphs against canonical p57 indices, 76/75 p55 length and 55/12,956 page domain, then prints all outputs, IOC and positive inverse plants.
- Decision: retire **these six precisely specified additive direct consumers**. A future mechanism must be selected by an independent original clue, yield authentic unknown plaintext, and explain the 1-rune page carry if it acts across p54–55.

# LP2 p0 red 8+5 title: complete crib-derived columnar cipher gate

**16 November 2026, Agent20. Classification:** original-cipher, two-chapter bounded negative. No authentic unknown-page plaintext, genuine title, author-selected key, or full decoder is recovered.

## Source premise and rival

The original physical p0 scan (`resources/liber-primus/17.jpg`) visibly prints 13 red GP29 runes in two words of 8 and 5, then a large red 13-dot marker at rune offset13. The actual heading indices in canonical `resources/liber-primus/lp2-corpus.json` are `[15,8,18,3,6,19,27,0 | 15,26,18,21,5]`. Independently, a Cicada-signed **January 2016** message contains the consecutive words **EPIPHANY SEEKS**; its GP-native 8+5 rendering is `[18,13,10,13,8,24,9,26 | 15,18,18,5,15]`, spelled EPIPHANY SEECS in the GP inventory. This is a *proposed title plaintext* published after the original 2014 book, not a verified heading.

Earlier studies already reject period13 Vigenère, direct red13 seed autokeys, Fibonacci and Berlekamp–Massey continuations, 13-dot route permutations and title-key prime blocks. This investigation asks one different, human-scale question: could the title select a **13-column transposition combined with GP29 additive substitution**, as a composition of cipher operations demonstrated in historical Cicada rounds? Rival: the 13/title coincidence is incidental, and no author has indicated this combined cipher.

## Frozen shared title/body mechanism

The 13-column order is obtained by **stable numeric sorting** of either (a) the 13 original red ciphertext GP indices or (b) the signed plaintext candidate's 13 GP indices, ties left-to-right. The 180-degree reversed cross decorations motivate checking each order in normal and reversed traversal. Each of these four fixed orders receives only two different historical operation sequences:

1. `transposed-shifts`: first `Q[i]=(P[i]+K[i mod13]) mod29`, then read the row-major 13-column grid **columnwise** in key order to get `C`.
2. `shifted-transposition`: first read `P` columnwise as above, then add `K[i mod13]` in transmitted order.

For **each** of these eight specific models, solve all thirteen `K` entries algebraically from the **same full conjectured 13-rune title** using the corresponding inverse columnar operation. This ensures the title uses precisely the same cipher as the black-body segment, with no exceptional title-only arithmetic. Because this derives 13 key digits from 13 assumed plaintext symbols, **the exact title match is automatic**, provides no key authentication and cannot be counted as a decryption.

The visually printed 13-dot marker authorizes one segment boundary. Freeze the inferred key and model, then invert all original **716 black-body runes** across physical pp0–2 (262+266+201=729, minus title13). Apply the exact same key/model without retuning to the independent **1,145-rune p3–7** chapter, using that entire chapter as the holdout input. Ragged column lengths are derived from the original segment size, preserving every rune. Neither original string is changed, filtered or shifted to improve a word score.

## Whole-source results

| Column selector and traversal | Operation | p0–2 body IoC | p3–7 holdout IoC |
| --- | --- | ---: | ---: |
| Original red header, ascending | Transposed-shifts | 0.03431261 | 0.03450698 |
| Original red header, ascending | Shifted-transposition | 0.03431261 | 0.03430391 |
| Original red header, reversed | Transposed-shifts | 0.03418760 | 0.03460470 |
| Original red header, reversed | Shifted-transposition | 0.03494159 | 0.03455584 |
| Signed phrase, ascending | Transposed-shifts | **0.03578154** | 0.03452683 |
| Signed phrase, ascending | Shifted-transposition | 0.03439075 | 0.03445201 |
| Signed phrase, reversed | Transposed-shifts | 0.03405477 | **0.03503374** |
| Signed phrase, reversed | Shifted-transposition | 0.03407821 | 0.03429322 |

Unmodified source baselines: p0–2 body **0.03410165**, p3–7 holdout **0.03463371**. Known **95-rune clear p57** has GP29 IoC **0.06270997**. Every tested original output remains near the uniform 29-symbol collision baseline **1/29≈0.03448**, without a coherent running English-GP opening. The highest original-body IoC model begins `B J NG J NG D R EA X EO U NG S T D O Y Y NG B I OE`. The isolated increase of 0.03578 is small, does not replicate on p3–7 and is no evidence of manuscript plaintext.

**Reversible correctness checks:** All eight models reproduce the original 13-rune title from the conjectured title exactly (expected by key inference), re-encrypt all 716 original p0–2 black-body runes exactly, re-encrypt all 1,145 independent original p3–7 ciphertext runes exactly, and recover a separate **716-symbol planted original-native p57 prose** sequence byte for byte after encrypting it under each model. Those round trips validate only the implementation, not author intent. Full 13-digit keys, source-accurate order lists, both full outputs, exact positive controls and asserted IoC values are reproducible in [the standalone CommonJS SFT](../sims/lp2_p0_signed13_columnar_joint_sft.cjs).

## Decision

The complete source-frozen **EPIPHANY SEECS + thirteen-column transposition + thirteen-symbol additive shift** architecture does not decipher the intact original chapter or its untouched next-chapter holdout. Its strongest possible native-GP frequency signal remains weak on both. This retires only the eight enumerated column orders/operation sequences under one conjectural signed title. The heading's actual plaintext, other source-selected transpositions, longer independently specified keys, a genuinely different unknown-page cipher, and a non-English intermediate register are unresolved.

A future title-to-body claim should provide an independently sourced complete **8+5** plaintext and a compact cipher operation that predicts **at least 200 consecutive authentic unknown-body GP runes** before looking at them. Further speculative key order, phase or spelling enumeration is not justified by these data.
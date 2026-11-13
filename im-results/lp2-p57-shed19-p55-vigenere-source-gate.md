# Original p57 circumference-key candidate for 76-rune p55

**Agent4, 13 November 2026. Classification: one source-motivated, frozen direct inverse; original input negative. No unknown plaintext/key recovered.**

The solved, **authentic original p57 PARABLE** has **19 printed body words** across three sentences. Its explicit instruction to **“SHED OUR OWN CIRCUMFERENCES”** provides a human-readable reason to try the first or final rune of each word as a 19-symbol key. The immediately preceding physical p55 contains exactly **76 original rune positions = 4×19**. In historical 2014 Cicada work, GP29 Vigenère with the printed word key and direct modulo29 arithmetic is an actual executable operation.

**Two source-fixed keys:** collect the first or the final GP rune of all 19 original p57 body words in printed order. Repeat that key **four times** across every original physical p55 glyph, including its first rune which continues a word from p54. Test the two ordinary historic decryption signs \(P_i=C_i-K_{i\bmod19}\) and \(P_i=C_i+K_{i\bmod19}\). No page-dependent phase, alternative key alphabet, word rearrangement or seed is introduced.

| p57 body-word key | Sign | Original p55 decoded IoC | Exact printed-word native-English matches | Matches of length ≥6 |
| --- | ---: | ---: | ---: | ---: |
| 19 first runes | − | 0.03473684 | 1 | 0 |
| 19 first runes | + | 0.03368421 | 1 | 0 |
| 19 final runes | − | 0.04245614 | 3 | 0 |
| 19 final runes | + | 0.03122807 | 1 | 0 |

The original p55 ciphertext IoC is approximately 0.034. The best of the four outputs has only three single/short word matches, and zero complete six-rune-or-longer words. All four tests exactly re-encode original ciphertext and exactly round-trip **76 actual solved p57 GP runes** under a planted encryption. These round trips establish correctness of the operation, without authenticating its use in p55.

The source-length relationship is genuine, but it is weaker as a key selector because **p55's first rune is a word continuation from p54**. A separate operation would be required to explain a page-reset key that begins partway through a printed word. The two circumference choices are also unselected by the literal instruction. Neither produced plaintext, and no phase or alternate-key sweep is warranted.

**Decision:** retire this specific simple p57 word-exterior→p55 period19 GP-Vigenère consumer. The source phrase could still specify a geometric or state-carrying transformation, but a new proposal needs its own reversible rule and original withheld plaintext prediction.

**Reproduction:** [sims/lp2_p57_shed19_p55_vigenere_sft.cjs](../sims/lp2_p57_shed19_p55_vigenere_sft.cjs) reads original p55/p57 transcriptions, checks 19/76/95 counts and the p54 carry-aware printed segmentation, derives the two keys, runs four original inverses and four original-solved plants, and checks complete native-English word matches.

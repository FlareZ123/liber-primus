# Agent 15: conditional p18:w7 word-map cross-check

One further conditional observation from the p0 DH candidate, using the **canonical** printed-word parser in `sims/lp2_2016_message_base58_word_map.cjs` (not the simpler transcription split):

If the DH outputs are read as the natural page/word address `p18:w7`, the selected word is `GAHEALGO` (7 GP runes). Its prime weights are `[17,97,23,109,73,17,7]`, summing to **343 = 7³**. It is the only 7-rune word with prime sum343 among the 2,973 printed words; there are five words of any length with that sum. The first and last prime weights are **17** and **7**, matching the p0 DH public value and private exponent from the candidate exchange.

Applying the existing provisional 2016 base-58 word-pointer rule to 343 gives p53:w6 = `DOEER` (sum250), then p18:w5 = `IDJ`; the resulting deterministic pointer walk enters a 33-cycle and does not reach solved p56/p57. This is therefore an interesting cross-round consistency, not recovered plaintext. The page/word interpretation of (18,7) is not explicitly specified by either source, and the base-58 rule remains provisional.

I have not promoted this to a result or searched alternate coordinate orderings/ciphers.

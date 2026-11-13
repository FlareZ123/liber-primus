# Provisional LP2 p55 moth-matched seven-word plaintext crib

**Agent 41, 13 November 2026. Source-motivated word-length candidate; no plaintext recovered.**

## Causal route from two original manuscripts

Solved LP1 physical p5 has a distinctive moth illustration, a 5×5 number square and the statement **“THE TOTIENT FUNCTION IS SACRED / ALL THINGS SHOULD BE ENCRYPTED.”** Original LP2 physical p55 repeats the moth illustration. The canonical LP2 page 55 transcription, checked against the exact 76 source rune indices, begins with **one carry rune completing the last word of p54**, followed by **16 complete words** of 75 runes. Its exact body rune-word lengths are:

\`[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]\`.

Unexpectedly, the final **seven** of these words have lengths **[2,7,7,2,6,3,3]**, which coincide exactly with the actual solved LP1 p5 words:

**THE | TOTIENT | FUNCTION | IS | SACRED | ALL | THINGS**

The correspondence uses **source-calibrated Gematria Primus spelling**, including the single **ᛡ=IO** rune in FUNCTION and the single **ᛝ=ING** rune in THINGS, which are independently established by the 181-word LP1 exact-original GP reconstruction and separately held-out solved LP2 p57 source test. The candidate 30-rune p55 suffix begins at **local physical rune index46** (zero-based), precisely after 45 complete p55 body runes and the one incoming p54 carry.

The p5 ↔ p55 moth match selects these two pages independently of this word-length observation. A source word-length clue could reasonably direct a human to compare them. **The literal seven-word candidate was found during exploration after scanning LP2 p55 word-length fragments**, so the p55 suffix placement and phrase are retrospective and must not be presented as author-confirmed.

## Bounded discriminants

An exact consecutive seven-word native-GP length search on the solved LP1 English reference (942 English words including supplied reference labels) locates this phrase; the three independent checked-in GP-source-calibrated plain-English texts yield **zero full seven-word matches** at these lengths: Shakespeare 55,407 words, Gibran 15,733 words and Emerson 77,932 words. Other six-word length coincidences exist, so the matching seven-word suffix should be treated as *interesting conditional evidence* without an across-project significance claim.

For a potential intended crib, use the **30 printed p55 source ciphertext runes** and the 30 source-native GP rune indices of the candidate LP1 p5 phrase. The candidate plaintext has **16 distinct GP symbols**, whereas the p55 ciphertext suffix has **15**. Consequently **no single global bijection** of the source GP29 alphabet maps this exact candidate plaintext into this exact source suffix, independent of which unknown monoalphabetic key is used. In addition, repeated candidate plaintext GP runes require contradictory output assignments at **22 positions** under a deterministic fixed substitution.

The candidate also fails the simple fixed source-key transfer motivated by Cicada's historical 2014 text-guide stage. At p55 zero-based original rune index46, the exact 81-rune original LP1 p5 repeating-key Vigenere operation predicts **only 1 of the 30 observed** GP29 cipher-minus-candidate-plain shifts. A fixed single additive Caesar shift also fails. These are exact model-specific contradictions; a stateful GP29 cipher, secret per-position stream key or different physical-word-order transformation remains algebraically possible.

No meaningful p55 source-language output, recovered original key stream generator, key-clue confirmation, signed authenticity or next puzzle destination follows from the word-length match. In particular, **the original cipher itself never reveals that these seven plaintext words are correct.**

## Cross-moth 81-rune source-key boundary (Agent 49, 13 November 2026)

The **complete original solved LP1 p5 prose** contains **81 GP29 runes** before its numeric table; its last sentence break, immediately before “ALL THINGS SHOULD BE ENCRYPTED / KNOW THIS”, cuts after exactly **51 runes**, leaving **30**. The original unsolved LP2 moth pages independently present **51 red runes on p53** (local offsets 128–178) and **30 runes in p55's last seven printed words** (local 46–75). Thus the two source-selected fragments concatenate to exactly the **81-rune** length of the earlier moth-page Vigenere text. This is a possible historical clue to a source key; the original source **does not** instruct joining two separate LP2 pages or transferring the LP1 text.

The link has an important word-boundary counterexample. The LP2 p55 terminal seven-word lengths [2,7,7,2,6,3,3] match an **internal** LP1 p5 phrase, as above. The **last 30 runes of LP1 p5** instead spell “ALL THINGS SHOULD BE ENCRYPTED KNOW THIS” with seven word lengths **[3,3,6,2,9,4,3]**. Moreover, LP2 p53 red51 contains **12 words**, while LP1 p5's first51 contains **11**. The 51+30 alignment is retrospective and does not show that either ciphertext preserves p5's word boundaries.

One frozen, historically attested consumer is direct GP29 Vigenere using the exact original LP1 p5 81-runic text as an **81-symbol one-time key** on p53 red51 followed by p55 terminal30 in that fixed order. Exact subtraction yields IoC **0.030555555556**, addition **0.036111111111**, both cipher-like and nonlinguistic. An independent 81-rune solved-p57 language plant and authentic-cipher reencryption each recover all 81 rune indices. Another all-secret bound rules out treating the *same* 81-rune LP1 p5 text as literal plaintext under an arbitrary **single bijective alphabet and transposition**: LP1 p5's most common rune occurs 11 times, while the combined LP2 target's maximum is seven. At least **31 rune identities** would have to change under a pure unmodified-alphabet permutation.

[Source-exact CJS reproducer](../sims/lp2_p53_p55_moth81_split_sft.cjs). **Decision:** preserve the composite 81 clue as a separate conditional source-key route. Direct p5 Vigenere and identity-preserving transpositions fail; no unknown plaintext, authentic key, or destination is recovered. A further operation must be independently specified rather than fitted to 81 ciphertext runes.

## Reproduction and next decision

The standalone [source-exact CommonJS experiment](../sims/lp2_p55_moth_p5_sevenword_crib_sft.cjs) reconstructs the printed p55 full 76-rune page and its 16-body-word lengths; independently encodes the original p5 phrase under the solved-LP1-calibrated GP orthography; matches the 7-word lengths and 30-rune suffix; searches four separate text sources; tests all-secret monoalphabet consistency and fixed historical 81-key phase; verifies source indices and printed source p5 key. The [passing Node22 manual GitHub Actions run 43396522196](https://github.com/FlareZ123/liber-primus/actions/runs/43396522196) reproduces all gates.

**Research decision:** retain the source-moth-linked seven-word match as a **provisional crib** for any *independently sourced, fully specified* LP2 p55 decoder. A candidate future decryption should either recover these 30 GP symbols verbatim or explain why the visual match is a coincidental length agreement. Reject monoalphabetic substitution and exact original p5-prose 81-rune Vigenere subtraction as mechanisms for this particular proposed crib. Do not force an unconstrained key schedule to satisfy the phrase.

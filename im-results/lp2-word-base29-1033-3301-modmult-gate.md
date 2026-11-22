# Signed-2013 BASE29 and 1033/3301: fixed-width word modular multiplication

**Agent9, 15 November 2026. Classification: bounded new executable original-cipher negative.** None of 56 unknown LP2 pages decrypted.

A human solver had the 2013 original **BASE29 integer protocol**, the repeated **1033/3301** cuneiform values on original pp33–39 and the first-party 2016 instruction that “words” have “numbers.” One plausible *additional, unauthenticated* operation is to interpret each printed GP29 word as a fixed-length radix29 integer **W**, choose the modulus **M=29^L** from that word's original L runes, and multiply the word by the source value **K=1033 or K=3301 modulo M**, preserving exactly L output runes. Both source numbers are coprime to29, so either multiplication is reversible for **every** 29-ary word. Reverse direction multiplies by the extended-Euclidean inverse of K modulo29^L. This differs from the already failed base29-to-minimal-binary serialization and whole-book short rune Caesar methods. Nothing in the 2013 TCP protocol commands modular multiplication of later LP2 words; the test explicitly treats the operator as a hypothesis.

**Source input:** all **2,896** original punctuation-separated words, reconstructing **all 32 words continuing across physical pages** from the original transcript; exactly **12,956 GP29 runes** match canonical corpus in order. Four fully specified, phase-free original-input decoders, two source numbers and both forward/inverse directions, preserve original word lengths and reencrypt **all 2,896** source words exactly.

| Source word multiplicative operator | Whole-output IoC |
| --- | ---: |
| 1033 × W mod29^L | **0.03448564264** |
| (1033)^−1 × W mod29^L | **0.03449070684** |
| 3301 × W mod29^L | **0.03445105120** |
| (3301)^−1 × W mod29^L | **0.03449865465** |

Original unsolved source IoC **0.03447839786** versus independently solved native p57 GP plaintext IoC about **0.06271**. All four output streams remain nonprose and near-uniform. The first 50 original symbols of each transformed output are printed by the SFT so an independent solver can check the actual ciphertext inverse. A separate source-native planted solved-p57 GP stream **roundtrips all 12,956 characters** when packed into the same original word lengths. The code verifies that the original direct inverse recovers the original ciphertext exactly for all word lengths, including words ending in GP F. No retuned exponent, residue, reverse-rune traversal, free word clock, or cipher layer was added.

**Decision:** The simple source-numbered BASE29 whole-word *modular multiplication* does not directly recover unknown English GP plaintext. The numbers 1033 and 3301 and the word framing are authentic, but this cipher consumer is not source-selected. A new original instruction selecting a different whole-word operation would be needed before additional arithmetic search. This does not exclude complicated modular exponentiation, different registers or altered word segmentation.

**Reproduction:** [original-input standalone Node22 CommonJS SFT](../sims/lp2_word_base29_modmult_2013_1033_3301_sft.cjs), manual Windows workflow in [agent9-wordmod29-manual.yml](../.github/workflows/agent9-wordmod29-manual.yml).

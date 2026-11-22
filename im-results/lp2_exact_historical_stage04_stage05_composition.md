# Historical Stage04 + Stage05 exact two-operation LP2 gate

**Decision, Agent50, 16 November 2026 (Director #1295):** the first-party 2014 Stage04 GP29 Vigenère and 2014 Stage05 seven-character row transposition can be composed and exactly inverted on the original 308-rune LP2 p54–55 chapter and a disjoint 91-rune p33 source unit. Both native historical solved-stage controls pass. Neither operation order recovers any coherent LP2 plaintext with either of two literal public source keys. More fundamentally, no first-party clue specifies both operations, their order, and the target; an arithmetically compatible chapter length is not a typed program.

## Original historical operations

The 2014 [Stage04 archive reproducer](../sims/stage04_small_image_vigenere_repro.cjs) proves the 18-rune image containing digits 5 and 3 decrypts using the solved GP-native phrase **WELCOME PILGRIM TO THE**. Its original program reverses a rune lookup table before computing key shifts. With the current canonical GP29 indexing, this is exactly rune **C−K mod29**, clocking only runes, with the literal digits retained. Our independent original-source check reproduces the GP transliteration AUOWYFGL5LCSFJ3NONIAN; the GP rune transcribed as IA also permits the original-stage alternative **IO**, yielding the historical avowyfgl5lkzfj3n.onion continuation after C/K and S/Z normalization. This is an actual historical positive, including the alternate rune spelling.

The [Stage05 historic decoder](../sims/stage5_original_outguess_columnar_sft.cjs) uses **1736254**, independently in every source seven-character row. Its authentic 56-symbol positive recovers the complete archived text TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133 and exact inverse. The composition runs the two existing historically typed reversible primitives with no invented cipher layer.

The two frozen keys test distinct provenance: **WELCOME PILGRIM TO THE** is the key *actually selected* in 2014 Stage04, while **DIVINITY** appears literally in the solved p57 PARABLE. Transferring either to unknown LP2 is a hypothesis, not an instruction. Similarly, complete original physical p54–55 contains 308=44×7 runes and the first p33 rubric has 91=13×7 runes. These numerical multiples license an unpadded seven-row test but do not by themselves command the Stage05 permutation. Four complete receiver alternatives follow solely from two key choices × two legal operation orders; the historically correct GP29 subtraction sign and Stage05 permutation are never fitted.

## Original-cipher output

| Original input | Single unmodified GP IoC | DIVINITY: row→Vig / Vig→row | WELCOME key: row→Vig / Vig→row |
| --- | ---: | ---: | ---: |
| Final pp54–55, 308 runes | 0.03382123 | **0.03481535 / 0.03454038** | **0.03443462 / 0.03462498** |
| Original p33 first 91 runes | 0.03199023 | **0.03418803 / 0.03516484** | **0.03516484 / 0.03052503** |

All eight full original outputs re-encrypt *exactly* to their unchanged rune inputs. The p54–55 DIVINITY read in the most favorable IoC branch begins with **U R L NG I B W P W B L N R P L A AE J D X ...**, which is not English, a first-party instruction, or a key. All the other complete output runes appear in the reproducible Node22 program output. The original source is far below the solved p57 English-level repeated-symbol distribution in each test.

## Selection failure and next decision

The historical Stage04 instruction **“Let the text guide you”** selects a specific runic image and a previously solved LP1 phrase; the Stage05 OutGuess artifact separately prints grouped ciphertext with a one-based seven-position decoding convention. There is no contemporaneous source combining these two operations on LP2. The p57 mention of DIVINITY selects a word but neither a Vigenère opcode nor a columnar order. The p54–55 7-divisibility is a convenience, not an authored branch marker. Thus this finite, source-based *plausibility check* fails both the output and the independent-selector gates. Expanding to other keys, offsets or permutations would be unjustified.

The result does not exclude a different, independently supplied two-operation cipher elsewhere in the manuscript. No new LP2 plaintext, correct key or continuation address was recovered.

**Reproduce:** [complete independent CJS SFT](../sims/lp2_stage04_stage05_exact_two_step_sft.cjs), [successful Windows Node22 run 43951750536](https://github.com/FlareZ123/liber-primus/actions/runs/43951750536), exact canonical [GP29 corpus](../resources/liber-primus/lp2-corpus.json) and preserved [p57 runes](../resources/liber-primus/lp2-transcription.txt).

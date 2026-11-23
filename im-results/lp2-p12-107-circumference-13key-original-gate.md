# LP2 p12: source-selected 2014 circumference-key transfer gate

**Agent 10 · 23 November 2026 · bounded original-cipher negative.** The p57→p12→107.jpg navigation candidate is real as a set of source observations, but the most direct key transfer from the reached LP1 circumference page does not recover plaintext. No unknown LP2 plaintext, authentic LP2 key, or complete cipher has been recovered.

## Why this exact key was worth one test

The new [p57 page-opening study](lp2-p57-pageopening-unique-prefix-source-hypothesis.md) records that:

- solved p57 contains the word CIRCUMFERENCES;
- original p12 begins with the contiguous rune prefix CIRC, although its actual printed grouping is CI-RCW, so the four runes cross a word boundary and are not a literal plaintext word;
- the study's retrospective p50 lookup maps CIRC to the 2014 Stage10 response image 107.jpg;
- that original response lists 107.jpg, 167.jpg, and 229.jpg, and 107.jpg is solved LP1 p14, whose clear text includes “THE I IS THE VOICE OF THE CIRCUMFERENCE.”

This makes the recovered LP1 second-koan key a more specific candidate than the whole 315-rune page or the 28-rune quotation already tested in the p57 study. The 13-rune key is the previously recovered GP29 string FIRFUMFERENFE, used subtractively on LP1 pp14–15. The alternative literal GP spelling CIRCUMFERENCE is kept separate; it is not the recovered LP1 key.

The navigation chain is still retrospective and not an author-authenticated instruction. In particular, the p12 prefix crosses a printed word boundary, and the base59/table-address interpretation is not a signed command.

## Frozen receiver

The original p12 and p13 contain 261 and 272 runes respectively. They are adjacent within the same transcription body, with no intervening chapter marker. The candidate key begins at p12 rune 0 and runs continuously through p13; no physical-page reset is inserted.

Three invertible fixed models are evaluated:

1. historical LP1 key FIRFUMFERENFE, subtractive GP29 Vigenère, all symbols consume;
2. the same key and subtraction, with ciphertext F left literal and not consuming a key symbol;
3. literal GP spelling CIRCUMFERENCE as a subtractive GP29 Vigenère key, all symbols consuming.

The actual LP1 pp14–15 F-exception positions are source-specific and are not transferred to p12. The blanket literal-F convention is tested only as a fixed historical-style control; no F mask is searched. A fourth combination, literal CIRCUMFERENCE plus transparent F, fails its own known-plaintext positive control because a non-F plaintext symbol can encrypt to ciphertext F under that key, making the inverse ambiguous. It is excluded rather than scored as a decoder.

The 95-rune solved p57 text is planted and recovered exactly under each of the three valid models. This validates the implementations, not the historical transfer hypothesis.

## Original-source result

The trigram score is the repository's GP29 Shakespeare model, trained on the first 80% of the 218,800-token normalized source. Higher (less negative) is more language-like.

| Fixed model | p12 IoC | p12 trigram | p13 IoC | p13 trigram | combined trigram |
|---|---:|---:|---:|---:|---:|
| Raw original | 0.033952 | −5.77033 | 0.033427 | −5.63762 | −5.69380 |
| FIRFUMFERENFE, all consume | 0.033245 | −5.64115 | 0.033237 | −5.59425 | −5.60874 |
| FIRFUMFERENFE, ciphertext F transparent | 0.036487 | −5.74127 | 0.036005 | −5.83583 | −5.78322 |
| CIRCUMFERENCE, all consume | 0.033392 | −5.58535 | 0.033834 | −5.62784 | −5.61456 |

The best single-page score among valid variants is p13 under FIRFUMFERENFE with transparent F (−5.26724); its IoC is only 0.036955 and the output begins GPAEOEYCEAINTEOIABNWOBDHGTEAWYLYIAOYXLYUUWEOFPOPXXBEANTXXTSFX. It is not coherent GP-native prose. For scale, the independently clear p57 positive has IoC 0.062710 and trigram −2.54678. The modest score movement in the table does not approach the solved-language control.

The literal CIRCUMFERENCE key with transparent F is excluded: its synthetic p57 plant does not round-trip, because the key creates one non-F-to-ciphertext-F collision. The all-consuming literal-key model is the valid direct-key test.

## Decision

Retire the exact p12/p13 transfer of the 13-rune LP1 circumference key under these three fixed, source-motivated conventions. Do not extend it with fitted phases, reverse-key variants, or arbitrary per-F skip masks. The result does not disprove the p57 navigation observation, nor does it exclude a non-additive use of 107.jpg or a separately source-specified operation.

Reproduction: `node sims/lp2_p12_107_circumference_koan13_key_gate.cjs`.

Source blob IDs used by the test: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7; Shakespeare control 94c677ad9dd50771c6670e0c4e4dad9052b46d85.

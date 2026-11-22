# LP1 Wisdom's thirteen word cells against LP2 p50's thirteen 8-cell rows

**15 November 2026, Agent 10. Status:** A specific three-artifact, original-layout **76-entry candidate key** is identified and the twelve frozen direct GP29 readouts are unsuccessful. No genuine plaintext, author-selected key or cipher mechanism is established.

## Source-visible alignment and why a player might attempt it

The earlier original LP1 physical p05 Wisdom square contains **13 verbal cells** among its 25 positions. In their original printed row-major order, these spell SHADOWS, AETHEREAL, BUFFERS, UOID, CARNAL, OBSCURA, FORM, MOBIUS, ANALOG, UOID, MOURNFUL, AETHEREAL and CABAL. Their source-native GP29 rune lengths are **7,6,7,4,6,7,4,6,6,4,8,6,5**, totaling **76**, and their GP-prime sums are **341,366,199,130,320,245,91,226,320,130,199,366,341**. These counts are independently present as part of the solved 1033 magic square and its text.

The LP2 numeric table occupies physical pp49–51. Its **middle physical page p50** carries exactly **13 printed rows of eight two-character numerals**, 104 cells. LP2 physical p55 contains **76 ciphertext runes** and reuses LP1 p05's moth, also repeated on p53. This offers a concrete source-shaped route: align 13 word cells with 13 numeric rows, selecting the first **k** cells of each row, where k is that word's original GP rune length. Every word length is at most eight; the selection yields **76 numbered source units** and leaves **28**, the number φ(29). Both the 76-match and the 28 remainder are arithmetic consequences of the same selection and must not be treated as independent evidence.

This is a distinct key operand from the previously evaluated **outer-ring 76 cells of the full 32×8 grid**, and from the earlier **complete p05 76-rune word tape**. The strong objection is the absence of any original author instruction to align those 13 word cells with the numeric-only p50 page or prefer this particular rectangular selection. The visible signed 2016 clue "Its words are the map, their meaning is the road, and their numbers are the direction" motivates investigating word-number correspondences, but does not prescribe this mapping, the starting column or key operation.

## Locked, limited direct original-cipher tests

Use the previously derived conventional base60 values of the printed p50 numerals, without editing any original glyph. The first selection reads k cells from the left of row i. A second selected by the independently printed word numbers starts at column **(GP-prime-sum(word) mod8)** and reads k cells cyclically rightward. Both give 76 source bytes. The second source has row starts **[5,6,7,2,0,5,3,2,0,2,7,6,5]**. For each, apply only these transparent GP29 decryption candidates to original p55 in original physical-rune order: ciphertext ± (selected byte mod29); ciphertext ± (selected byte + original LP1 verbal-cell GP rune mod29). Twelve candidates total. The additionally included minus-word form is the direct known-plaintext extraction: if p05's printed words were a known GP plaintext aligned with the selected p50 grid cells, their additive equivalent key would be K=grid−GP(word), which could then be transferred to p55. No free key phase, fitted rotation, word skip, source-page substitution, reverse geometry or retrospective language-scored reordering is allowed.

| Original p55 test | GP29 index of coincidence |
| --- | ---: |
| Unchanged original 76 runes | **0.037895** |
| Left-k, subtract numeral | **0.041053** |
| Left-k, add numeral | 0.032281 |
| Left-k, subtract numeral plus GP rune | 0.032632 |
| Left-k, add numeral plus GP rune | 0.030526 |
| Word-prime start, subtract numeral | 0.040702 |
| Word-prime start, add numeral | 0.038596 |
| Word-prime start, subtract numeral plus GP rune | 0.034035 |
| Word-prime start, add numeral plus GP rune | 0.038596 |
| Left-k, subtract numeral minus GP rune | 0.037193 |
| Left-k, add numeral minus GP rune | 0.030877 |
| Word-prime start, subtract numeral minus GP rune | 0.039649 |
| Word-prime start, add numeral minus GP rune | 0.032982 |

The source's clear p57 contains genuine GP prose with IoC around 0.06 over an equal 76-rune passage. All twelve original p55 candidates remain unlike sustained readable GP plaintext and none supplies a typed instruction. All twelve decoders exactly re-encrypt the 76 original ciphertext symbols by their declared fixed inverses, and all twelve recover the full genuine solved-p57 76-rune positive source sample from fresh encryptions. The original p55's first NG rune continues a word from p54; retaining it is a **physical-page** hypothesis of the exact 76-unit mapping, not an established cipher boundary.

The remaining **28** unused numerals in the left-k extraction have only **19 distinct residues modulo29** and **17 distinct residues modulo28**. This specifically rejects a raw fixed missing-28-cell bijective alphabet under those residue interpretations. It does not reject a hash, key-expansion algorithm or alternate role for the omitted cells.

## Decision and next missing input

Retain this as one independently reconstructible, clue-shaped **potential key operand** in the intermediate research record. Reject the twelve direct additive GP29 consumers, including the stronger p05-word-as-known-plaintext key extraction. An actual advance would require a sourced selector tying original p05 word lengths to p50 rows and a reversible operation whose output reads coherently on untouched p55. Do not expand the null results with arbitrary key derivations or phase sweeps. The model does not establish that the numeric table is a p55 pad, and it makes no assertion about unknown-page plaintext.

**Reproducer:** [read-only CommonJS SFT](../sims/lp1_p05_wordrows_p50_middle13_p55_source_sft.cjs) reads both canonical source-data JSON files and asserts the complete 13-word original GP-prime inventory, physical table geometry, exactly twelve frozen full-length original inversions, and positive full 76-rune p57 plants.
# p7 five-dot / 3301-square Hill-5 gate

**Status: exploratory negative; no plaintext recovered.**

## Question and human-visible route

A plausible human solve path links three source-visible objects:

1. The five dots on LP2 p7 have top-to-bottom column order `[2, 4, 0, 3, 1]`.
2. The following seven-page block, LP2 pp8–14, contains 1,729 runes. Its p10 inline Arabic `7` occurs at offset 692. Including that numeral gives 1,730 symbols, exactly `5 × 346`; the dot order interleaves five consecutive columns of height 346 and moves the literal 7 to the first output position.
3. The 2014 5×5 magic square has row sum 3301. The identity `3301_8 = 1729_10` is a possible selector for this block, but is not evidence by itself that the authors intended the connection.

This motivates one bounded classical-cipher test: use the 2014 5×5 square, reduced modulo the 29-symbol Gematria Primus alphabet, as a Hill-5 key on the dot-interleaved 1,730-symbol block. Hill-5 is a relevant open family in the current synthesis (the established exclusion only reaches polygraphic width four).

## Reproducible test

Run from the repository root:

```sh
node sims/lp2_p7_3301_hill5_gate.cjs
```

The script reads the original canonical LP2 corpus and the repository's source-calibrated GP29 trigram model. It:

- asserts the pp8–14 rune counts `[255, 268, 263, 273, 261, 272, 137]` and total 1,729;
- inserts the source's p10 numeral 7 at zero-based offset 692;
- interleaves five contiguous 346-symbol columns in the p7 dot order;
- reduces the 2014 5×5/3301 matrix modulo 29, checks invertibility, and applies both standard Hill decryption (matrix inverse) and the direct matrix orientation;
- compares the source-selected order against all 120 five-column permutations;
- checks the alternative reading in which the dot order permutes the key matrix columns instead of the data columns.

The direct square matrix has determinant 10 modulo 29. A source-motivated variant applying Euler's φ to each square entry before reducing modulo 29 has determinant 23; both inverses are well-defined.

## Result

The source-native GP29 trigram model gives:

| Stream | Mean log score |
|---|---:|
| LP1 solved-text training | -2.260728 |
| LP2 p57 solved plaintext (positive control) | -2.468145 |
| Dot-interleaved input, before Hill | -3.411375 |
| Dot-interleaved input, Hill inverse | -3.403992 |
| Dot-interleaved input, direct matrix | -3.422927 |
| φ(each square entry) matrix, Hill inverse | -3.415568 |
| φ(each square entry) matrix, direct | -3.416087 |
| Dot order applied to key columns, then inverse | -3.416483 |

The dot-selected permutation ranks **1st of 120**, but its score is only 0.000681 nats/trigram above the runner-up. The output begins:

`SMIEAOENWEOIISOEGJSIOEOGEORRCNXEAEINGUTFTNXEOOTX...`

It is not recognizable English. Its score remains about 0.94 nats/trigram below the independently solved p57 plaintext. The small score movement and permutation rank are worth preserving as an observation, but do not establish a decryption or justify searching more matrix permutations.

## Decision

Reject this specific hypothesis: **neither the direct 2014 5×5/3301 matrix nor the natural φ(each entry) variant is a Hill-5 decryptor for the p7-dot-selected pp8–14 block under the tested source-derived alignments.**

This does **not** reject every width-five polygraphic cipher, other authentic key matrices, or a different source-selected operation. Do not tune offsets, row/column shifts, or further matrix variants without an independent clue that selects them.

## Inputs and related work

- Original numerical corpus: `resources/liber-primus/lp2-corpus.json`
- Source-native scoring model: `sims/lp1_source_native_trigram_model.cjs`
- LP1 plaintext reference used by that model: `resources/liber-primus/lp1-plaintext-reference.txt`
- 2014 5×5/3301 matrix also used in the Jung word-index experiment: `sims/lp2_jung331_scrutinies_magic_square_word_index.py`
- p7 five-dot / inline-7 alignment: `im-results/lp2-p7-five-dot-numeral7-nested-key-selector.md`

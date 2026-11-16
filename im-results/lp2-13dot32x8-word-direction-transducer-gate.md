# 13-dot / 32×8 word-direction transducer gate — rejected

**Status:** intermediate negative result. No plaintext recovered; do not promote to `results/`.

## Solve-path hypothesis

A solver could notice the repeated five-dot floral border values 13 (left, `01101`) and 31 (right, `11111`), identify the authentic thirteen-dot marks, and compare their count with the unlabelled 32×8 numerical table on physical p50. The 31 marks divide the complete 58-page source into 32 intervals. The signed 2016 wording that words are a map and their numbers are direction suggests using a word's Gematria Primus number to select one of eight columns.

The frozen interpretation was:

1. The 32 intervals between the 31 thirteen-dot marks select table rows 0–31.
2. The preceding ciphertext word's GP prime-sum modulo 8 selects a column.
3. The table entry modulo 28 is the shift for the current printed word.
4. GP rune F (index 0) is literal and fixed; the other 28 runes rotate bijectively.
5. Printed hyphens are control boundaries, not plaintext spaces. The decrypted chunks concatenate; true plaintext words may cross the printed separators.
6. Thirteen-dot marks advance the row. Small stops and commas remain punctuation and do not consume/reset the key. Page boundaries carry both row and previous-word direction.
7. The first direction is \(13\bmod8=5\), from the left floral pattern.

This is a causal, lossless word-autokey: encryption can derive the next shift from the preceding ciphertext word. The modulo-28 alphabet is essential; a modulo-29 shift with literal F would allow a non-F rune to encrypt to F and become ambiguous.

## Source structure

Inputs are the original transcription and source-derived data:

- `resources/lp2-transcription.txt`
- `resources/liber-primus/lp2-corpus.json`
- `resources/liber-primus/lp2-ink-annotations.json`
- `resources/liber-primus/base60-grid.json`

Observed source facts:

- 13,136 runes and 2,941 printed words across the complete transcription; the unsolved p0–55 portion contains 12,956 runes and 2,896 words.
- There are 31 thirteen-dot events: 28 on p0–55 and three on solved p56–57.
- All 31 offsets fall on printed-word boundaries.
- The 31 offsets are:
  `13, 729, 745, 848, 851, 1541, 1552, 1860, 1860, 1874, 3603, 3603, 3612, 3623, 5506, 5522, 6527, 6546, 7960, 7970, 8051, 8059, 9519, 9522, 9640, 12648, 12657, 12956, 12961, 13041, 13048`.
- The markers define 32 intervals; two are empty because offsets 1860 and 3603 each occur twice.
- The p50 table is exactly 32×8, with entries represented as values 0–255 in `byte_rows`.

The alignment is a real structural observation. It does not, by itself, establish that the table is a decoder.

## Frozen decoder and controls

The exact implementation is `sims/lp2_13dot32x8_word_direction_gate.cjs`. It uses the source parser with page boundaries carried, computes each row from the count of thirteen-dot events at or before the printed-word start, and applies:

\[
P_i =
\begin{cases}
0 & C_i=0\\
1 + ((C_i-1-k_i)\bmod 28) & C_i\ne0
\end{cases}
\qquad
k_i=T[r_i,d_{i-1}]\bmod28
\]

where \(d_{i-1}\) is the preceding ciphertext word's prime sum modulo 8. The 138 genuine small stops are preserved as punctuation; they are not used as key events.

A 95-rune, 20-word plant made from the known p57 GP plaintext, with its initial direction taken from the preceding p56 ciphertext word, round-trips exactly through the forward and inverse transducer. The wrong-grammar plant decoder using previous-word length modulo 8 recovers only 14 of 95 rune positions. This verifies the implementation and the literal-F bijection; it does not validate the cipher against LP2.

## Original-ciphertext result

The frozen p0–2 training block contains 729 runes and 158 printed words.

- First decoded chunks: `THDCENGGXF AEHEAOS RPHIA FOX SNGX EONGILIAEAESPAR`.
- GP rune IoC: 0.034158, essentially random.
- A source-native GP-English trigram model was trained on the first 70% of Shakespeare, Gibran's *The Prophet*, and Emerson controls, then calibrated on 4,548 non-overlapping 40-rune holdout windows.
- Native reference: first percentile −8.90364, median −7.89030, 99th percentile −7.22712.
- The authentic p57 plaintext control's 40-rune windows score between −8.34391 and −7.72087.
- The candidate's 690 overlapping 40-rune p0–2 windows have a best score of −11.64214; **zero** reach the native first percentile. The whole 729-rune score is −12.66235.
- The wrong-grammar previous-word-length-modulo-8 null scores −12.78040 overall and −12.03883 at its best 40-rune window; it also has zero windows above the native first percentile.

This is a clear training-rate failure, not a marginal language-model result. No p40–53 ciphertext evaluation was run because the prescribed p0–2 gate failed. No key, sign, segmentation, or offset was tuned after seeing the output.

A second natural reading of the table as a 5-bit next-state / 3-bit next-direction automaton also fails immediately: starting at state 13, the first interval word gives direction 0; \(T[13,0]=122\) yields next state 15 and direction 2, while interval 15's first-word direction is 4.

## Decision and next research boundary

Retire this exact 13-dot / 32×8 word-direction transducer. Preserve the 31-marker/32-interval alignment as an established source observation, but do not treat it as proof that the p50 table is a key schedule.

The signed 2016 map/road/direction wording remains relevant, but numeric direction sweeps are not a useful next step without a new source selector. The independent Dukotah research snapshot at upstream HEAD `9087dc36b5aa64c1786428e32180261ab9420c29` reports:

- R9-DIRECTION: 2,670 readings across self-indexing walks, cumulative walks, signed direction walks, and numeric sieves; no plaintext/source hit.
- R37-C1-U3-COMPOSED-MAP-ROAD-DIRECTION: 4,176 position/rune-offset/word-length × mod-29/28 × start × sign decodes; no verified plaintext.
- R38 semantic-address and R39 sense-position families: 28,224 and 14,112 decodes respectively, also negative.

Do not repeat those numeric families. A successor investigation needs an independently evidenced, determinate semantic per-word index, a source-established LP1 codebook order, or another original clue that chooses the missing operation. Generic dictionary/WordNet exploration is not enough.

## Reproduction

From the repository root:

```bash
node sims/lp2_13dot32x8_word_direction_gate.cjs
```

The script prints the source counts, interval structure, frozen decoder, native-language calibration, p0–2 result, wrong-grammar null, p57 round-trip control, and the failed 5+3 automaton check.

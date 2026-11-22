# p55 5×5 Polybius-family test — negative

## Question

The p57 prime-rank/DH lead selects a 5×5 block in the p50 numeric table. The p55 page has 76 runes, including one rune carried across the p54/p55 boundary; its 75-rune body is divisible by 5 and 25. The body uses exactly 25 of the 29 GP symbols. This makes a 5×5 Polybius-family receiver a plausible, bounded human-solve-path hypothesis, distinct from the already tested 5×5 Hill matrix.

## Frozen construction

- Use the 5×5 block at **rows 22–26 and columns 2–6**, 1-based, of the p50 32×8 table.
- Interpret its 25 tokens using the missing-f radix-59 alphabet. The four corners are **224, 115, 73, 75**, matching the source-derived PAGE/DH values in the p57 prime-rank lead.
- Sort the 25 numeric cell values ascending. Assign the 25 symbols present in the p55 body to those ranks in canonical GP29 index order. This produces the following key square:

```
F   U   TH  R   C
G   W   H   I   J
EO  P   X   S   B
E   M   L   NG  OE
D   A   AE  IA  EA
```

- Test standard Playfair on all 76 p55 runes (the full page is even-length).
- Test standard Bifid on the 75-rune body, excluding the carried first rune, with periods 5, 25, and 75.
- Test both transform directions. No keyword, phase, orientation, filler, or post-decryption repair is tuned.

## Result

**No candidate produces intelligible plaintext.** The eight exact outputs and IoCs are in the executable SFT **sims/lp2_p55_5x5_polybius_bifid_playfair_sft.cjs**.

| Receiver | Direction | IoC |
|---|---:|---:|
| Playfair, full 76 | decrypt | 0.039298 |
| Playfair, full 76 | encrypt | 0.039298 |
| Bifid, body 75, period 5 | decrypt | 0.044685 |
| Bifid, body 75, period 5 | encrypt | 0.039640 |
| Bifid, body 75, period 25 | decrypt | 0.046126 |
| Bifid, body 75, period 25 | encrypt | 0.037838 |
| Bifid, body 75, period 75 | decrypt | 0.047207 |
| Bifid, body 75, period 75 | encrypt | 0.037117 |

The 25-symbol support is not itself strong evidence for a 5×5 cipher: under 75 independent uniform draws from 29 symbols, the exact probability of observing 25 distinct symbols is **0.094903** (9.49%).

## Interpretation

This closes only the frozen, natural rank-to-GP-alphabet Polybius construction and standard Playfair/Bifid receivers above. It does **not** establish that the p50 5×5 block is an authored Polybius square, and it does not rule out every possible 5×5 cipher. Do not expand this branch into arbitrary square orientations, alphabet permutations, periods, or filler conventions without a new source instruction.

The p57/p50 numeric correspondence remains an intermediate clue, not a decryption. No unknown p55 plaintext, key, or continuation was recovered. **results/README.md** is unchanged because this negative does not alter the established overall research state.

## Reproduction

From the repository root:

```sh
node sims/lp2_p55_5x5_polybius_bifid_playfair_sft.cjs
```

The script reads only the original transcription resources **resources/liber-primus/lp2-corpus.json** and **resources/liber-primus/base60-grid.json**; it does not read a candidate plaintext or external model.

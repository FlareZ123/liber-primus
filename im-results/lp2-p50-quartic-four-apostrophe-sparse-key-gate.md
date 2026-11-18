# An original-table quartic key inferred from four authenticated apostrophe positions

**18 November 2026, Agent15. Original-cipher sparse-key recovery experiment, completed negative.** This test uses an exact original-table algebraic factor and the four apostrophe marks preserved on original LP2 images. It derives complete candidate 12,956-rune keystreams from four original positions, and separately shows exact whole-book recovery on a planted source-native positive. **No unknown LP2 plaintext, historical key, or onward destination was recovered.**

## Plausible human-visible route

The original pp49–51 numerical table is 256 entries in its printed 32×8 layout, and its original-order GF29 coefficient polynomial has an exact quartic divisor

```text
F(X) = X^4 + 28X^3 + 13X^2 + 9X + 14.
```

The original-table divisibility was established in the [p50 original factor and terminal codeword analysis](p50-32x8-interior-known-plaintext-compatibility.md), and is checked anew by the SFT using **every unaltered printed source byte**.

Four independently identified original raised apostrophes occur in source-printed LP2 words. Solved first-release LP1 also prints a genuine apostrophe in encrypted `RWN'B`, decoded as `DON'T` without advancing the rune-only cipher clock. This makes the four unknown original apostrophes useful *conditional known-plaintext markers*: in common English contractions, their final GP rune should often be **S, D, or T**. The original marked words and their absolute GP tape positions are independently established in [the four-apostrophe original-image study](lp2-apostrophe-four-source-cribs.md).

| Physical page | Printed original word | Global zero-based suffix rune | Cipher suffix |
| ---: | --- | ---: | --- |
| 4 | `MXI'W` | 1110 | W / GP7 |
| 21 | `AEO'Y` | 5138 | Y / GP26 |
| 35 | `PE'T` | 8515 | T / GP16 |
| 41 | `XLJ'C` | 10089 | C / GP5 |

**The risky premise:** the source does not actually command a degree-four LFSR or equate the four unknown tails to English S/D/T. The quartic exists exactly in the source-derived table polynomial but is one of several factors. This is a fixed, reversible, clue-constrained attempt to obtain plaintext, with a built-in test against original unfit apostrophe prefixes.

## Exact source-constrained running-key inverse

Assume a book-continuous additive running-key cipher `C[t]=P[t]+K[t] (mod29)`, advancing once per GP rune and ignoring punctuation, as in historically demonstrated Cicada practices. Let the source polynomial specify the key recurrence:

```text
K[t+4] + 28K[t+3] + 13K[t+2] + 9K[t+1] + 14K[t] = 0 (mod 29).
```

Also test the *true monic reciprocal*, corresponding to reversing the time direction:

```text
K[t+4] + 11K[t+3] + 3K[t+2] + 2K[t+1] + 27K[t] = 0 (mod 29).
```

All coefficients are fixed; there is no parameter or phase search. The four original suffix positions are distinct. For either recurrence, the exact 4×4 GF29 linear system mapping unknown initial state `[K0,K1,K2,K3]` to the four observed positions is invertible. Thus **any** choice of four suffix plaintext letters yields a unique complete 12,956-rune key by direct linear algebra.

Enumerate all `3^4=81` assignments of the **predeclared** suffix set `{S,D,T}` to the four source positions. For each, solve the complete key, then predict the *unfitted letters* in the four marked words. Compare complete GP forms to the previously fixed common-contraction dictionaries: 13 possibilities for each 3+1 word and six for each 2+1 word. A solution has to pass the first source word before it can claim to decode all four.

## Actual unmodified LP2 result

| Original key recurrence | Unique initial states inferred from four suffixes | Solutions matching the first complete marked word | Solutions matching all four |
| --- | ---: | ---: | ---: |
| Original quartic F | **81** | **0** | **0** |
| Monic reciprocal quartic | **81** | **0** | **0** |

The anchored model fails at the first **withheld three-rune word prefix** for all 162 fixed original-source inverses. It therefore cannot recover a native-English-contraction plaintext under the stated assumptions. There is no need to select a best-scoring whole-book random output or alter a suffix interpretation to save it.

A narrower, entirely source-motivated candidate uses plaintext **T** at all four marks. That yields the four apparent key letters `LIFE`, by the authentic solved LP1 apostrophe-tail subtraction `C−T`. The source-original sparse equations then recover exact first key states:

| Model | Inferred initial GP29 key values | Full recovered GP29 corpus IoC | Four predicted complete marked words |
| --- | --- | ---: | --- |
| Original F | `[1,28,24,2]` | **0.03446174** | `PJAT`, `GRT`, `IHT`, `THYPT` |
| Reciprocal F | `[8,12,9,19]` | **0.03446836** | `YMAT`, `OETHT`, `CGT`, `NOTHT` |

Both exactly predict the four assumed **T suffixes**, as required by their construction. Their other letters do not form the admissible source-grounded contractions, and their full cipher inverses have essentially uniform-rune IoC. The four suffix matches are *training constraints*, not recovered words.

**Positive control:** apply either exact source polynomial to a hidden four-element GF29 key state `[3,7,11,19]`, encrypt 12,956 native source-GP values with legal contractions `DONT, ITS, HES, CANT` placed at the authentic four marker positions, and withhold the key and all other plaintext from the inverse. The same four-site solver recovers **the original secret state exactly**, decodes **12,956/12,956** planted GP29 values, and reconstructs the four full withheld contractions. The real original corpus remains separate from the plant.

## Decision

This eliminates a **full-book shared additive GF29 key obeying either direction of the source-derived quartic recurrence** under the 81 frozen common-contraction suffix choices and current genuine printed word boundaries. It is stronger than an ordinary key guess because every one of the four initial secrets is inferred rather than guessed. It is different from the prior exhaustive three-parameter **degree-three recurrence search** ([earlier four-crib source gate](lp2-apostrophe-four-sparse-gf29-recurrence.md)) and the earlier unrestricted linear residual tests on the unrelated table-interior/terminal alignment.

Other quartic factors, different suffix vocabularies, page-local rekeys, plaintext-F bypasses, nonlinear output maps and a different original cipher are outside this finite test. The table factor is an investigator's possible cipher operation rather than an authenticated instruction; its exactness must not be mistaken for plaintext evidence.

**Reproduction:** [single-file source-exact Node22 CJS](../sims/lp2_p50_quartic_four_apostrophe_sparsekey_sft.cjs), using only `resources/liber-primus/lp2-corpus.json` and `lp2-grid-256.json`. It verifies the original quartic polynomial remainder, all four original ciphertext words and rune positions, both full-rank sparse systems, the 81×2 original inverses, the LIFE-specific complete readouts, and the independent planted exact 12,956-rune recovery.

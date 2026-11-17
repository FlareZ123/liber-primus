# Original LP2 four-apostrophe sparse-GF29 recurrence gate

**Agent 26, 17 November 2026.** A source-constrained, completely enumerated four-crib test of two additive, book-global key recurrences found **zero** exact full-book-key candidates matching all four original apostrophe words. The source-native planted positive is recovered exactly. **No authentic LP2 plaintext or key follows.**

## Independent cue and frozen operands

The original 2014 LP2 image text preserves four raised-apostrophe positions, on physical pages **p4, p21, p35, p41**. Their complete GP29 ciphertext words and original absolute rune starts are:

| LP2 page | Absolute rune start | Cipher GP29 indices | Candidate plaintexts |
|---|---:|---|---|
| p4 | 1107 | `[19,14,10,7]` | DONT, CANT, WONT, AINT, ISNT, LETS, GODS, ONES, MANS, MENS, SHED, YOUD, ALLS |
| p21 | 5136 | `[25,3,26]` | ITS, HES, WED, HED, ITD, DOS |
| p35 | 8513 | `[13,18,16]` | ITS, HES, WED, HED, ITD, DOS |
| p41 | 10086 | `[14,20,11,5]` | Same thirteen four-rune candidates as p4 |

These options are fixed by the independently existing [four-contraction source SFT](../sims/lp2_apostrophe_fourcrib_original_sft.cjs). The exact original rune values and source word membership are checked against `resources/liber-primus/lp2-corpus.json` and the physical `lp2-transcription.txt`. The 2014 creator's demonstrated use of an apostrophe is corroborated by solved LP1 `I DON'T`, which has a verified five-rune `FIRFU` Vigenère keystream in the authentic first release. This cue motivates a known-plaintext attack; it does not authenticate the four unsolved words as particular contractions.

## Complete finite test

Take a reversible additive cipher `C[t] = P[t] ± K[t] mod29`, with one key value consumed per GP rune in the entire unbroken unknown LP2. Exhaust both signs and **every 29³ = 24,389 parameter triple** in each family:

- **Homogeneous third-order:** `K[t] = a K[t-1] + b K[t-2] + c K[t-3] mod29`.
- **Affine second-order:** `K[t] = a K[t-1] + b K[t-2] + c mod29`.

Each four-rune p4 contraction candidate directly determines the key state over the first four available positions, so **there is no secret initial-state parameter left to guess**. Filter against its recurrence equation, propagate that exact proposed key to the p21 apostrophe, and retain only complete GP29 ciphertext-word matches against frozen common contracted forms. Propagate survivors to p35 and p41 without changing any parameters or lexical options.

| Family | Sign | p4 key candidates satisfying recurrence | Also match p21 | Also match p35 | Match all four |
|---|---|---:|---:|---:|---:|
| Order3 homogeneous | + | 10,933 | 1 | 0 | **0** |
| Order3 homogeneous | − | 10,933 | 1 | 0 | **0** |
| Order2 affine | + | 377 | 0 | 0 | **0** |
| Order2 affine | − | 377 | 0 | 0 | **0** |

An independent source-compatible planted control puts `DONT / ITS / HES / CANT` at the same four positions under a single full-length third-order key with coefficients `[11,4,7]`, key state `[12,19,8]`, and the same + sign. The complete four-site solver recovers **exactly one** matching planted parameter candidate and identifies the original secret coefficients and opening word. This establishes sparse-crib recovery power within the precisely tested family, rather than merely detecting a short key on adjacent text.

## Decision and limits

Neither GF29 recurrence can explain all four original apostrophe words under the stated common English contractions, fixed transcript word boundaries, and uninterrupted globally additive keystream. The test does **not** exclude a different contraction dictionary, source-specific spelling, an independently specified F-transparent skip clock, nonadditive cipher, or a longer-degree/externally keyed recurrence. No evidence justifies rescuing these two families with silent exceptions at failed sites. The single p21 match in each order3 sign is a chance-compatible intermediate and fails the withheld original p35 constraint.

**Reproduce:** [read-only CommonJS SFT](../sims/lp2_apostrophe_four_sparse_lfsr_original_sft.cjs) · [passing Windows Node22 execution](https://github.com/FlareZ123/liber-primus/actions/runs/44148084654).

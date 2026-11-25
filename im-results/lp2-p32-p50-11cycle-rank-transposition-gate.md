# p50 11-cycle rank permutation on p32 11×11: bounded negative

**Status:** this specific transposition is not supported; no plaintext recovered.

## Motivation

The existing p50 base60 functional graph has an 11-cycle and a 2-cycle. The 2016 signed message has an 11+2 coda, and its word-map route points to p32: the `MAP` start reaches node121 at step5 and node32 at step7. Physical p32 contains 121 runes, naturally admitting an 11×11 arrangement. This motivates one bounded test: can the p50 11-cycle supply a row/column permutation for p32?

The 11-cycle node values, in cycle order, are:

`[0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192]`

Rank-normalizing these 11 distinct values gives permutation `[0,9,2,8,1,3,4,7,5,10,6]`; its inverse is `[0,4,2,5,6,8,10,7,3,1,9]`.

## Frozen test

- Input: the 121 p32 rune indices in canonical row-major order from `resources/liber-primus/lp2-corpus.json`.
- Matrix: 11 rows × 11 columns, no inserted/deleted runes.
- Transformations: forward or inverse rank permutation on rows or columns, each with and without transpose (8 variants).
- Readout: row-major after the stated transformation.
- Diagnostic: mean log-frequency of overlapping English quadgrams from `resources/control/dukotah_english_quadgrams.txt`; unseen grams receive count 0.01. This is a ranking diagnostic, not a calibrated probability of plaintext.

## Result

| Candidate | Mean log quadgram score |
|---|---:|
| Original p32 order | −17.138629 |
| Best: cycle-rank on rows, no transpose | −16.885843 |
| Inverse-rank on columns, no transpose | −16.901131 |
| Inverse-rank on rows, no transpose | −16.920072 |
| Cycle-rank on columns, no transpose | −17.203427 |
| Inverse-rank on rows, transpose | −17.419982 |
| Cycle-rank on rows, transpose | −17.474932 |
| Cycle-rank on columns, transpose | −17.766581 |
| Inverse-rank on columns, transpose | −18.016331 |

The best candidate begins `LTHAEWAEUPIACWNGEAROEENNWGULATHHBIARTTHFFOTHTOENG...`; it contains no recognizable plaintext. The clear p57 control, with its known V/U spelling restored in DIVINITY, scores −9.921268 under the same model. The transformed p32 outputs remain far below that control.

## Decision and limits

Reject this exact rank-derived row/column transposition as a p32 plaintext receiver. The test does **not** reject every use of the p50 11-cycle, every 11×11 operation, or nonlinear/keyed ciphers. Rank-normalization is a natural but not source-mandated conversion of the cycle values; the negative is correspondingly narrow.

Reproduce with:

`node sims/lp2_p32_p50_cycle_rank_transposition_probe.cjs`


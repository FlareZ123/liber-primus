# p27→p55 GP-prime-mod-5 row-selector gate

**Classification:** bounded original-cipher negative. No unknown LP2 plaintext, authentic key, or complete cipher mechanism is recovered.

## Causal-path hypothesis

The solved p57 Parable says to “shed our own circumferences,” which source-selects the 43 strict interior runes of p55's complete printed words (excluding the one-rune p54 carry fragment). Separately, p27 has 215 black-body runes after its 19-rune red title, and 215 = 5×43. The authenticated 2016 Cicada message says that words are a map and their numbers are direction. A solver could therefore try treating p27's black body as five consecutive 43-rune rows, using each p55 interior rune's Gematria-Primus prime weight modulo five to select a row at the matching column, then subtracting that p27 rune from the p55 rune.

This is a plausible clue-constrained *experiment*, not a source instruction. Neither the 5×43 grid layout, the prime-weight-mod-five selector, nor the direct subtraction is specified by the cited texts. The 5×43 packing is not visually marked: it crosses the printed line boundaries, grouping a single black rune from the title line with subsequent body runes.

## Frozen operation

For p55 interior position (j=0,ldots,42), with GP index (C_j), p27 black-body sequence (B), and canonical GP prime-weight table (pi):

[
r_j = pi(C_j) mod 5,qquad
K_j = B_{43r_j+j},qquad
P_j=(C_j-K_j)mod29.
]

The packing is exactly five consecutive rows of 43 in original p27 body order. There is no phase, rotation, row permutation, column permutation, alternate radix, alternate projection, or fitted key. The signed-message wording motivates using numbers as a selector; the p57 instruction motivates the 43 p55 interiors. The subtraction is the single operation explicitly proposed in the test request.

## Source contract and controls

- p27 has 234 transcribed runes: 19 red-title runes and 215 black-body runes. The original physical page has 11 rune-bearing printed lines: the title line contains 20 runes (19 red plus one black), followed by ten black lines with counts `[17,18,22,21,22,25,21,24,22,22]`; the black-body counts are therefore `[1,17,18,22,21,22,25,21,24,22,22]`.
- p55 has 76 runes and 17 printed segments. Taking strict interiors of the complete words gives 43 runes with interior word lengths `[2,4,4,11,4,2,5,5,4,1,1]`.
- The 43 selected target runes are checked against the canonical p55 page sequence at the corresponding printed positions.
- A GP bigram/trigram model is trained on the first 75% of `resources/control/shakespeare_first300k.txt`; evaluation uses only held-out text. Native controls are all 43-rune held-out windows stepped by five and partitioned using the same p55 interior word lengths.
- A single one-row-displaced key is included as a wrong-source control. A withheld native-GP 43-rune plant checks the inverse implementation. Exact original forward reconstruction is also asserted, but that round trip is an algebraic implementation check, not evidence for the key.

## Result

The five selected-row counts are **[3, 11, 13, 11, 5]**. The derived key transliterates as:

`E J R NG EA H F L O W NG EA P EA G Y L S U C R F D F R IA Y A E OE B W N OE M F W C NG Y G D OE`

| Measure | Result |
|---|---:|
| Raw p55-interior conditional GP score | −4.77183846 |
| Decoded candidate score | **−4.89797634** |
| Held-out native 43-rune windows | 10,693 |
| Native mean / SD | −2.91298503 / 0.25676619 |
| Native minimum / maximum | −3.83336688 / −2.03520080 |
| Candidate z-score vs native mean | −7.7307 |
| Native windows at or below candidate | 0 / 10,693 |
| Gap below worst native window | 1.06460946 |
| Wrong row+1 control score | −4.81739559 |
| Matched random-GP control score | −4.51827203 |
| Withheld native-GP positive plant | 43 / 43 recovered |

The output is nonlinguistic and scores worse than the untouched ciphertext. It is below every held-out native-GP control. The adjacent wrong-row control is similarly nonlinguistic. The planted control proves that the specified arithmetic is invertible and correctly implemented; it does not authenticate the original key selection. Likewise, exact forward reconstruction is automatic for this additive bijection.

## Decision

Retire this exact **p27 row-major 5×43 / p55 GP-prime-weight-mod-five row selector / direct GP29 subtraction** hypothesis. Do not rescue it with row permutations, phase shifts, alternate moduli, or post-selected signs. The 43-rune p55 interior remains a source-motivated target, and p27's 215-rune black body remains a source fact; neither observation alone supplies a cipher.

Reproducer: [`sims/p27_p55_primeweight_mod5_row_selector_sft.cjs`](../sims/p27_p55_primeweight_mod5_row_selector_sft.cjs).

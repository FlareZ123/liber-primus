# Reversed p32/p55 repeated plaintext under independent period-8/13 keys

**Decision (Agent33, 25 November 2026; Director #2658):** the exact original p32/p55 rune tapes admit **no solution** under the frozen reversed-repeated-text model. This is a finite, language-independent exclusion. No unknown LP2 plaintext, key, or destination was recovered.

## Human-visible lead and rival

The blurred tree on LP2 p32 and the detailed tree on terminal p55 have a strong, source-preserved visual correspondence. The source image study establishes that this is a distinctive raster relationship, but it does not establish that the pages carry the same text or specify a rune traversal. The red word-order reversal at p6/p7 gives a separate, weak reason to test one explicit reversal rather than assume every page reads identically.

The hypothesis tested here is deliberately narrow:

- a contiguous 76-rune passage in p32 is the same plaintext as all 76 runes of p55, but p55 presents that passage in reverse rune order;
- each page is independently encrypted in its own forward reading order;
- each page uses a continuous periodic additive GP29 key, with periods 8 and 13 in either order;
- plaintext F (GP29 index 0) is transparent and does not consume a key position;
- a non-F plaintext may still encrypt to ciphertext F when its key symbol cancels it.

The strongest rival remains that the repeated tree is decorative/shared artwork, or that any textual relation uses a different cipher or reading rule. Neither the image correspondence nor the p6/p7 reversal authenticates this model.

## Exact inverse

Let A_i be p32 ciphertext at a candidate 76-rune window, and let B_j be p55 ciphertext. The candidate plaintext P is read forward on p32 and backward on p55:

\[
A_i=P_i+K_A[a_i]\pmod{29},\qquad
B_{75-i}=P_i+K_B[b_i]\pmod{29}.
\]

For a consuming position, a_i is the number of non-F plaintext runes before i, while b_i is the number of non-F plaintext runes after i. Both are reduced modulo their respective key periods. A literal F requires both paired ciphertext symbols to be zero and holds both clocks. At a paired ciphertext zero/zero, both possibilities are retained: a transparent F hold, or a consuming non-F whose key cancels it.

For every consuming position the unknown independent key symbols must satisfy

~~~text
K_B[b_i] - K_A[a_i] = B[75-i] - A[i]  (mod 29)
K_A[a_i] != A[i]                       (plaintext is non-F)
K_B[b_i] != B[75-i]                    (same condition on p55)
~~~

These are necessary and sufficient constraints for the frozen model. A weighted union-find solves the key-difference equations over GF(29); each connected component has one absolute additive gauge, and the forbidden values remove root choices that would make a consuming plaintext F. Thus the test does not guess keys, use English scoring, or discard ambiguous double-zero branches.

The forward-order baseline uses the same equations with p55 index i and both clocks counting the same prefix.

## Original-source result

The canonical source corpus gives p32 = **121 runes** and p55 = **76 runes**, including p55's incoming carry. There are **46** contiguous p32 placements.

| Candidate reading | p32/p55 periods | Placements | Hold/consume masks tested | Feasible complete branches |
|---|---:|---:|---:|---:|
| p55 reversed | 8 / 13 | 46 | 47 | **0** |
| p55 reversed | 13 / 8 | 46 | 47 | **0** |
| p55 forward baseline | 8 / 13 | 46 | 53 | **0** |
| p55 forward baseline | 13 / 8 | 46 | 53 | **0** |

In the reversed alignment, 45 placements have no paired ciphertext zero/zero and one placement has one such pair, so the exact mask count is 45 + 2 = 47 per period order. In the forward baseline, 39 placements have no such pair and seven have one, giving 39 + 14 = 53. Every branch was checked to completion. The original has no consistent independent key arrays for either period assignment or either reading direction. No language model was applied after this exact support failure.

The forward baseline is a consistency comparison, not a new claim: earlier forward repeated-text work already covered q13 and mixed q8/q13 variants in [#2615](https://github.com/FlareZ123/liber-primus/issues/2615) and the [consolidated p32/p55 tree study](lp2-p32-p55-blurred-tree-correspondence.md).

## Positive and negative controls

Two independent native-text reversed plants check that the inverse retains the intended model, including genuine F holds and a consuming double-zero:

| Native source | 76-rune window start | F holds | Periods | p32 planted offset | Connected key components | Allowed absolute root choices |
|---|---:|---:|---:|---:|---:|---:|
| WELCOME | 9 | 3 | 8 / 13 | 11 | 1 | 6 |
| KOAN 1 | 612 | 4 | 13 / 8 | 29 | 1 | 10 |

Both plants force their first non-F rune to encrypt as zero on both pages while preserving all genuine transparent F positions. The exact true hold mask and planted key class survive at the true placement. Each has two feasible branches at that same placement because the generated consuming double-zero can also be interpreted as a hold; neither has a false placement. The planted key class is among the allowed global-gauge values. The forward-order baseline has zero branches for both plants.

Two unrelated native-text pairs, independently encrypted under the corresponding reversed period models, produce zero feasible branches:

- KOAN 1 p32-like text versus LOSS OF DIVINITY p55-like text, periods 8/13;
- WELCOME p32-like text versus the second KOAN donor p55-like text, periods 13/8.

Finally, the weighted-union-find decision was checked against exhaustive enumeration of all \(5^5\) key arrays on 125 small-field GF(5) cases, including every paired-zero mask. There were **zero disagreements**.

## Scope and next decision

This retires only the literal 76-rune reversed repeated passage under independent continuous q8/q13 additive GP29 keys with the authenticated plaintext-F hold convention. It does not reject the visual tree correspondence, a different cipher, nonperiodic/stateful keys, other periods, a different segment length, a different source-selected traversal, or independent plaintexts.

The strongest objection is upstream: no first-party Cicada instruction says that the two tree drawings encode the same passage or that one passage should be reversed. The negative result removes one compact, testable consumer; it does not supply an alternative decryption route. Further p32/p55 reversal or key-period variants should wait for a new source-authenticated selector.

**Reproduction:** run node sims/lp2_p32_p55_reverse_period_key_sft.cjs from the repository root (Node.js 22, no external dependencies). It reads only resources/liber-primus/lp2-corpus.json and resources/external/relikd-solved-gp29-native-v1.json. Synthetic-control seeds are fixed at 0x2658c33 and 0x2660beef. The connected-runtime execution of the same equations passed; no GitHub Actions run is claimed.

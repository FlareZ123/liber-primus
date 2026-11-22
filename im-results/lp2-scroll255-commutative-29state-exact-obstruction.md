# A universal 29-state accumulator obstruction in the frozen p3–p8 scroll register

**Agent22, 22 November 2026. Classification: exact conditional original-cipher exclusion.** No unknown LP2 plaintext, independently selected key or author-validated algorithm was recovered.

## Decision and independently supplied input

Director [#2298](https://github.com/FlareZ123/liber-primus/issues/2298) asks whether the 255 complete original p3–p7 words can map to 255 original p8 runes through a small, source-motivated **nonlinear commutative whole-word accumulator**. The source word boundaries, target p8 runes, five original p7 red products [11,26,8,15,2], GF(4) 255-state address cycle and p49–p51 table's candidate radix59 were frozen before this test. The candidate p8 value is H_i=(C_i+table59[address_i]) mod29. The four exact repeat/anagram pairs continue to correct to [[20,20],[8,8],[2,2],[9,9]], as in [the prior four-pair original analysis](lp2-scroll255-gf4-radix59-untrained-anagram-fourth-equality.md). This source-to-source registration remains **unauthenticated by a 2014 first-party instruction**.

The new question is whether H can equal a hidden **29-state associative commutative fold** over the printed rune multiset, followed by any unknown **bijective output relabeling separately for each word length**. This includes arbitrary secret operations on the 29 states, arbitrary secret per-rune state assignments, and any fixed or length-dependent final substitution. It does not presuppose GP addition, a known multiplication table, or a conventional polynomial.

## Exact original-input contradiction

For any commutative associative accumulator with state s(W), s(U)=s(V) implies s(U multiset-union X)=s(V multiset-union X). If both U and V have the same original length and H(U)=H(V) under an injective length-specific output rule, their hidden states are equal. Their equal-length extensions by X must therefore have equal H values as well, even if the length-3 output alphabet is relabeled differently from the length-2 alphabet.

The **unchanged source words and full-register corrected outputs** violate this necessary law:

| Scroll word, zero-based | Authentic rune indices | Corrected H | Printed words |
| ---: | --- | ---: | --- |
| 54 | [6,28] | 2 | ᚷᛠ |
| 235 | [23,21] | 2 | ᛞᛝ |
| 236 | [23,21] | 2 | ᛞᛝ |
| 74 | [5,28,6] | 17 | ᚳᛠᚷ |
| 105 | [5,21,23] | 21 | ᚳᛝᛞ |

Both first-row and second-row multisets have two runes, and both emit **2**. Appending the **same GP index 5** to each multiset yields source words 74 and 105, which emit **17** and **21**. The repeated 235/236 spellings supply two independently printed antecedents of the same contradiction. All involved scroll words have **black ink**, so an independent black/red output relabeling would not explain it.

An exhaustive scan of all 255 original words, all equal-length/equal-H source pairs and all 29 possible one-rune extensions finds exactly two representations of this contradiction, [54,235] and [54,236]. A source-shaped positive control using the true commutative GP29 sum, on these same original printed words, has zero contradictory extensions. Thus the obstruction concerns **the observed candidate H**, rather than a broken source parser or a generic untested theoretical expectation.

A further collision demonstrates that a **global many-to-one state emission** would require additional internal states. Words 128 [26] and 166 [27,20] both emit H=25. Extending both bags by the same {5,10} gives words 183 [5,10,26] and 221 [20,27,10,5], which emit H=19 and H=8. With one fixed global state-to-symbol output map, the two colliding output classes H=2 and H=25 each need at least two distinct internal states. Because all **29** GP symbols appear among the 255 H outputs, any such commutative deterministic accumulator requires **at least 31 internal states**. This 31-state lower bound assumes a fixed global output map; it does not apply to arbitrary length-dependent many-to-one readouts.

## Relationship to prior exact exclusions

The earlier [29/character arbitrary-weight multiplicative proof](lp2-scroll255-gf4-radix59-allsecret-multiplicative-wordhash-obstruction.md) already rules out GF29 products even with arbitrary secret, potentially noninvertible output codebooks. The earlier [all-secret nonlinear bag-hash study](lp2-scroll255-gf4-nonlinear-baghash-allsecret-original.md) excludes every *group* of order29, whose structure must be cyclic, with secret input and output labels and optional length/page/red additive offsets. Agent14's [final-permutation rank result](../sims/lp2_scroll255_gf4_radix59_final_permutation_nogo_sft.cjs) independently rules out up to twelve additive positional codebooks with a secret nonlinear terminal alphabet. The present congruence contradiction addresses the remaining **arbitrary associative 29-state commutative semigroup/monoid**, including non-group state spaces, and permits a different bijective final code for each word length. Its proof uses only observed equalities and shared symbol extensions, with no secret-state search.

## Consequence for choosing the next cipher route

The four corrected whole-word collisions remain exact original observations. However, **no single 29-state commutative associative whole-word digest with an injective terminal code, even one secret and independent by word length, can explain the remaining source data**. A multiplicative mod29 hash is already excluded by the stronger independent all-secret study linked above.

A viable alternative must alter an assumption that has observable physical meaning: for example, a larger internal state with a many-to-one 29-symbol emission, a nonassociative whole-word function with independently source-selected parameters, or position/page-specific state. The 256-cell p50 panel could motivate a larger state space, but neither a commutative update law nor a final 256→29 receiver has been authenticated. Proposing an arbitrary 251-entry word dictionary would fit the data without explaining it. The next justified advance needs a historical operator clue or an untouched original-cipher prediction.

**Reproduction:** [Windows Node22 CommonJS original-source SFT](../sims/lp2_scroll255_commutative_accumulator_obstruction_sft.cjs) reconstructs all 255 scroll words from original transcription, all 255 source-table corrections, all four earlier Parikh collisions, exhaustive one-rune congruences, the independent global 31-state lower-bound witness, and the planted associative positive control. [GitHub Actions execution](https://github.com/FlareZ123/liber-primus/actions/runs/45045122782).

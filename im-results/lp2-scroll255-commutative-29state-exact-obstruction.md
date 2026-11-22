# Universal commutative accumulator obstructions in the frozen p3–p8 scroll register

**Agent22, 22 November 2026. Classification: exact conditional original-cipher exclusion.** No unknown LP2 plaintext, independently selected key or author-validated algorithm was recovered.

## Decision and independently supplied input

Director [#2298](https://github.com/FlareZ123/liber-primus/issues/2298) asks whether the 255 complete original p3–p7 words can map to 255 original p8 runes through a small, source-motivated **nonlinear commutative whole-word accumulator**. The source word boundaries, target p8 runes, five original p7 red products [11,26,8,15,2], GF(4) 255-state address cycle and p49–p51 table's candidate radix59 were frozen before this test. The candidate p8 value is H_i=(C_i+table59[address_i]) mod29. The four exact repeat/anagram pairs continue to correct to [[20,20],[8,8],[2,2],[9,9]], as in [the prior four-pair original analysis](lp2-scroll255-gf4-radix59-untrained-anagram-fourth-equality.md). This source-to-source registration remains **unauthenticated by a 2014 first-party instruction**. The new tests establish both a universal arbitrary-abelian-group certificate and a direct 29-state non-group commutative accumulator obstruction.

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

## Stronger exact no-go for **every abelian group**, of any size

The word values might have more than 29 hidden states. A natural candidate is a byte-sized **256-state commutative group** suggested by p50's 256 printed cells. The earlier GF29 and bitwise-XOR group obstructions do not by themselves exclude a 256-state cyclic accumulator. The following new integer certificate does.

Allow a secret value for **every one of 29 input glyphs**, an independent secret decoded label for **every one of 29 corrected output glyphs**, 12 independent genuine word-length offsets, five independent original page offsets and one source red-ink offset. Let these unknowns lie in **any abelian group G**, whose size, element representations and operation are unrestricted. Each original whole word supplies the relation

    sum(A[rune] for rune in complete word) - B[corrected rune]
       + D[original word length] + E[original source page]
       + F*isRed = identity in G.

All 255 original words define a fixed **255 x 76 integer matrix M**. Both source-page clocks (word start and word end) are tested. Neither the matrix nor its proof selects secret keys.

**Exact integer certificate:** Select the 73 columns indexed 0 through67, 70, 71, 72, 73 and 75. The 73 original source-word rows reproduced verbatim in the SFT form a square submatrix of determinant **45,562,267** under exact Bareiss arithmetic. Replace only the final selected row (word73) by original word75: the second determinant is **2,223,716**. Both source-page clocks give these same exact determinants. The integer identity

    794171 * 45562267 - 16271966 * 2223716 = 1

proves that these 73 columns admit an **integer left inverse**. The remaining free columns are **68,69,74**.

Three explicit integral solutions of every one of the 255 original equations are: (a) add1 to all input-rune labels and subtract the true word length from each length offset; (b) add1 to every output label and each length offset; (c) add1 to every output label and every page offset. The restrictions of these gauge vectors to the three free columns have coordinate matrix

    [-11   1   0]
    [-12   1   0]
    [  0   0   1]

with determinant **+1**. Thus the gauges span *every possible* choice of the three free coordinates over **any abelian group**, and the integer left inverse makes the other 73 coordinates unique. Every solution to the original 255 equations is a combination of these gauges. Every such combination gives **the same output label B[y] for all 29 symbols**, contradicting the required injective output labelling.

This impossibility holds independently of group size or structure. It includes cyclic Z/32, Z/64, Z/256, GF(256) under addition, any direct product of finite cyclic groups and infinite abelian groups. Permitting arbitrary additive source page, true word length and red-ink offsets does not change it. The SFT checks the complete source, both integer determinants, the exact Bezout equality, all three integer gauge solutions and a genuine GP29 additive positive plant. The positive plant has maximal minors divisible by29, as required for its nonconstant mod29 output labels.

**Scope:** This excludes the stationary abelian-group sum of fixed secret source-rune labels with a single global injective output alphabet and the specified free additive side clocks. It does not exclude an order-sensitive cipher, non-group hidden accumulator, nonadditive page dependence, a cryptographic hash with distinct higher-state operations or another original-source registration. The source-selected GF4/radix59 correction itself remains unconfirmed.

## Consequence for choosing the next cipher route

The four corrected whole-word collisions remain exact original observations. However, **no single 29-state commutative associative whole-word digest with an injective terminal code, even one secret and independent by word length, can explain the remaining source data**. A multiplicative mod29 hash is already excluded by the stronger independent all-secret study linked above.

A viable alternative must alter an assumption that has observable physical meaning: for example, a larger **non-group** internal state with a many-to-one 29-symbol emission, an order-sensitive update, a nonassociative whole-word function with independently source-selected parameters, or position/page-specific state. The 256-cell p50 panel could motivate a larger state space, but neither a commutative update law nor a final 256→29 receiver has been authenticated. Proposing an arbitrary 251-entry word dictionary would fit the data without explaining it. The next justified advance needs a historical operator clue or an untouched original-cipher prediction.

**Reproduction:** [Windows Node22 CommonJS original-source SFT](../sims/lp2_scroll255_commutative_accumulator_obstruction_sft.cjs) reconstructs all 255 scroll words from original transcription, all 255 source-table corrections, all four earlier Parikh collisions, exhaustive one-rune congruences, the independent global 31-state lower-bound witness, the universal abelian-group integer certificate, and the planted associative positive control. [GitHub Actions execution](https://github.com/FlareZ123/liber-primus/actions/runs/45045122782).

# Exact zero-marker obstruction for multiplicative GP29 pads

**11 November 2026, Agent 30.** A source-conditional, key-independent negative. No unknown LP2 plaintext, authentic key, cipher or destination recovered. [Manual CI success](https://github.com/FlareZ123/liber-primus/actions/runs/43115314211) and [source-original reproducer](../sims/lp2_gp29_multiplicative_zero_allsecret_sft.cjs).

## Motivated question and mathematical answer

The GP29 alphabet and the manuscript's finite-field clues make multiplication modulo29 an operation worth testing without guessing its key. Grant **arbitrary independent secret nonzero field multipliers at every one of the 12,956 original ciphertext runes**, plus any fixed unknown 29-rune output alphabet permutation \(\sigma\):

\[
C_i=\sigma(P_i K_i\bmod29),\qquad K_i\in\{1,\ldots,28\}.
\]

The GP plaintext rune index zero corresponds to **F**. In a prime field every nonzero multiplier is invertible, so this entire family has the unavoidable exact invariant

\[
C_i=\sigma(0)\quad\Longleftrightarrow\quad P_i=0.
\]

The secret multiplier, algorithm, PRNG, clock and seed cannot change that. Even allowing all 29! secret output permutations, one original ciphertext rune must occur **exactly as often** as plaintext F. This model is different from the already studied [predecessor-difference zero marker](field-unit-zero-marker-positions.md), where a *ciphertext doublet* stands for a fixed plaintext rune.

## Original LP2 evidence

The exact original LP2 unsolved register has 55 rune-bearing pages, **12,956 runes** and **2,896 intact whole words**. Their 29 cipher-glyph counts range from **399 to 492**, with the ciphertext F glyph occurring 458 times. The smallest frequency **399** gives the proposed cipher every possible stationary output alphabet's most favorable chance.

Three archived independent English-language references were converted to the canonical GP29 spelling, with the established Q/V/K/Z orthographic aliases. To control the unusual manuscript word-length pattern, for every one of its 2,896 whole words, sample only reference words of the **identical GP rune length**. Expected plaintext F counts are the sums of the corresponding source-conditioned means; standard deviations derive from those word-level variances.

| GP-native reference and exact LP2 word-length inventory | Expected F count | Conditional SD | Excess of even the least-frequent original glyph (399) |
| --- | ---: | ---: | ---: |
| Shakespeare, first 300k | 241.731882 | 15.479780 | **10.1596 SD** |
| Gibran, *The Prophet* | 293.290564 | 16.626358 | **6.3579 SD** |
| Emerson, *Essays* | 296.587874 | 16.949621 | **6.0421 SD** |

No original glyph is rare enough to represent ordinary GP-English F under these matched sources. For each reference, **0 of 3,000** deterministic matched word-bootstrap samples contain at least 399 F runes (descriptive plus-one tail at most 1/3,001 per reference). This is a conditional language-register comparison, not an unconditional p-value for all conceivable plaintext.

## Positive mechanism check and decision

The reproducer plants 12,956 source-native GP symbols of the same word-length layout, hides every rune with independently generated nonzero GP29 multipliers, then with an unknown fixed output permutation \(\sigma(x)=11x+7\bmod29\). It recovers **12,956/12,956** planted runes separately under all three reference sources. The required special output symbol \(\sigma(0)=7\) appears exactly at every original planted F position, and nowhere else. The original-source SHA-independent symbol counts, all conditional means/SDs, and exact planted inverse are asserted. [Successful Actions run 43115314211](https://github.com/FlareZ123/liber-primus/actions/runs/43115314211) exercises the source and the earlier field-unit marker controls.

**Decision:** retire direct nonzero multiplicative GP29 pad plus any stationary 29-rune output permutation for ordinary English GP plaintext under the manuscript's actual word lengths. This excludes *all secret nonzero key schedules* in that finite algebraic architecture without any key enumeration. It does not exclude changing output alphabets, positional additive offsets, altered symbol representations or boundaries, a radically different plaintext language, or other nonlinear/transducer mechanisms. No authentic plaintext or key recovered; no multiplier sweep can rescue the excluded model without a source-justified change of its defining assumption.


## Director #2867: explicit zero branch, exponent-domain variant and source-to-operation decision (Agent11, 25 November)

The [signed 2013 TCP protocol](../resources/external/2013-tcp-server-signed-source.md) specifies BASE29 integer representation separately from DH key agreement. The worked DH modulus is 23, with base 5 and shared value 2; it does not instruct a GP29 substitution, define F handling, or establish either value as an LP2 multiplier/initializer. The actual server chooses its own base and secret per request. #2823 concerns a different modulus-3301 pair action; #626 leaves the cuneiform rubric's opcode untyped; #142's GF(29²) element does not authenticate a GF29 single-symbol receiver.

For any decoder-recoverable state s, let the nonzero-domain branch be T_s(x)=k(s)x mod29 for x≠0. Since its image is exactly {1,…,28}, an explicit F branch T_s(0)=z is instantaneously reversible iff z=0. If z≠0 it collides with x=k(s)^−1 z. Even a distinct next state cannot make this construction injective on every finite input of a fixed length without an independently transmitted terminal state or additional output: place the collision at the final input position after any common reachable prefix. If z=0 the inverse is T_s^−1(y)=k(s)^−1 y for every y, including F. Arbitrary state evolution, including plaintext or ciphertext feedback and state resets on zero, cannot change the pointwise zero invariant. More generally any permutation of the 28 nonzero residues with a separate one-symbol F branch has exactly the same invariant; composition of such operations and even a global permutation of positions preserves the zero count. A fixed final GP29 symbol relabeling is already granted by the original whole-book test above.

A closer literal adaptation of the historical exponent operation, rather than multiplication by a DH share, also has a finite exact obstruction. For the ordinary GP indices 0…28, x→g^x mod29 always collides at x=0 and x=28 for every nonzero g. If F=0 instead emits 0 and the 28 remaining inputs are exponents 1…28, the action is bijective iff ord_29(g)=28. Directly evaluating the two historic worked-example values gives ord_29(5)=14 and ord_29(2)=28. Thus g=5 has exactly 14 distinct nonzero outputs and 14 collisions beyond the first preimage (one for each output); g=2 is bijective with the explicit F branch, but again preserves F exactly at every state, even if the primitive root changes by a reversible state rule. Its inverse is the discrete logarithm in the 28-element group with F handled separately. Using the authentic DH modulus 23 instead gives at most 22 distinct nonzero outputs for 28 nonzero GP29 inputs (ord_23(5)=22, ord_23(2)=11), so the one-rune map cannot be injective even after reserving one F output. BASE29 representation cannot supply the missing domain elements. Additional output/exception side information would be a different mechanism.

These arguments extend the prior marker obstruction from scalar multiplication to every explicit-zero nonzero-domain permutation, including the only bijective exponent variant. They do not assume any particular secret schedule, nor that an independently specified additive outer layer preserves F. An outer layer moving zero, a state-dependent exchange of F with another symbol, or a redundant side channel requires an independent source rule, not supplied by the signed protocol. For a genuinely known invertible outer layer the correct test would be on its inverse image, not the raw ciphertext; no such source-selected LP2 layer is present here.

**Decision:** reuse the original full-corpus counts and passed controls above (12,956/12,956 positive inversions; 399 minimum observed glyph count versus 0/3,000 compatible matched F-count samples for each of three native registers). Do not re-run those tests or attempt an arbitrary chapter inverse from the worked-example values. Neither the literal signed modulus nor its speculative GF29 transfer supplies a newly admissible source-selected receiver. This is an algebraic reduction and prior-test application, not a new empirical exclusion of all nonlinear pre-encryption. No unknown LP2 plaintext or authentic key recovered. Reopen only with independently authenticated zero-relocation/exception syntax or a specified outer layer.

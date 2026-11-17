# H2 random-table prior fails original GP29 marginal-flatness gate

**Agent38, 17 November 2026. Classification:** original-cipher, source-native planted-family discriminator. A manuscript-length q=0.81 H2 proposal with **independently random 29×29 substitution rows** reproduces the adjacent-repeat deficit but produces more uneven overall ciphertext symbol counts than the original. A **balanced cyclic-row** counterpart can match the original's marginal flatness. **No unknown plaintext, authentic LP2 key or row trajectory is recovered.**

## Exact original input and hypothetical encoder

The canonical original resources/liber-primus/lp2-corpus.json contains **12,956 original unknown runes** in physical p0–55, excluding runeless p50. Concatenating them gives **86 identical-adjacent ciphertext pairs** and full-book IoC

\[
\frac{\sum_{c=0}^{28} n_c(n_c-1)}{12956\cdot12955} = \mathbf{0.03447839786450569}.
\]

The uniform 29-symbol baseline is **1/29 = 0.03448275862069**, differing from the original by only 0.00000436.

Director [#1342](https://github.com/FlareZ123/liber-primus/issues/1342) calibrates a hypothetical H2 cipher using the *source-authenticated p56-style* successive-prime Euler-totient key clock, with row labels \(r_j=(p_j-1)\bmod29\). Its random-table prior defines 29 **independent uniform GP29 permutations** \(T_r\). For each plaintext rune \(P_i\), propose ciphertext \(T_{r_j}(P_i)\); if that proposed output equals the previous **emitted** ciphertext rune, consume the key and retry the same plaintext rune with probability **q=0.81**. Otherwise emit the proposed rune and advance the key. This key/skip transfer to unknown pages is **hypothetical**. The original solves of p56 only authenticate the prime/totient key family, not this stochastic 29-table model.

## Source-native 2,600-plant original-length control

[Reproducible Node22 CommonJS SFT](../sims/lp2_h2_random_table_flatness_gate_sft.cjs) reads the actual corpus, an independently GP29-normalized Gibran reference (**62,492 runes**) and an independently GP29-normalized Shakespeare reference (**217,106 runes**). Each **12,956-rune** plant starts at a seeded randomized contiguous English control-text window. The generator creates a fresh table and key-rejection history, then scores **only emitted ciphertext frequency counts** and duplicate counts. Secret table and skipped-pointer paths are never supplied to a decoder. All seeds, references and deterministic parameters remain in the executable.

The two random-model arms sample 29 independent uniform permutations. The alternate model has a fresh secret base permutation \(\tau\), a shift \(s\), and a **structured cyclic/Latin** row table \(T_r(p)=(\tau(p)+r+s)\bmod29\). All three arms use the same source prime-totient clock, source-English GP spelling, q=.81 rejection rule and input length.

| Candidate or original | Plants | Mean global IoC | Smallest IoC | Number ≤ original | Mean adjacent doubles |
|---|---:|---:|---:|---:|---:|
| Original p0–55 | 1 | **0.0344783979** | same | reference | **86** |
| Gibran; independent random rows | **1,000** | 0.0353377637 | 0.0347481587 | **0** | 87.427 |
| Shakespeare; independent random rows | **600** | 0.0353237791 | 0.0348125991 | **0** | 87.4833 |
| Gibran; cyclic balanced rows | **1,000** | 0.0345073193 | 0.0344356680 | **108** | 84.544 |

Thus **zero of 1,600 independent-random H2 plants** has a marginal IoC as close to uniform as untouched original LP2. This holds under two literary GP29 controls. Conversely, 108/1,000 cyclic-table plants are **at least** as flat as original under the same rejection logic. The repeat means across all groups agree roughly with **86**, so doublet matching alone misses a much more discriminating feature. For each random arm a plus-one empirical one-sided tail upper estimate is \(1/(1000+1)\) or \(1/(600+1)\); these are *model-conditional finite null comparisons*, with no global multiple-hypothesis claim.

## Why independent random rows leave a frequency fingerprint

The source-authenticated arithmetic has a structural property: for every prime \(p>29\), the totient residue \((p-1)\bmod29\) is in **0 through 27**. Row **28** is emitted only for the unique prime \(p=29\), the tenth ordinary prime. Therefore the simulated H2 cipher effectively mixes only **28 repeatedly used rows** over a full manuscript.

Let \(q_p\) denote native-English GP29 unigram frequencies and \(w_r\) the proportion of ciphertext outputs taken from each row. For independently sampled random row permutations and an *exogenously fixed* row history, the large-sample expected output-symbol collision probability is

\[
\mathbb E\left[\sum_c \Pr(C=c)^2\right]
= \frac1{29}+\left(\sum_p q_p^2-\frac1{29}\right)\sum_r w_r^2.
\]

The added term is positive for nonuniform English and nonzero row occupancy. With about 28 balanced rows and source-English plaintext IoC around 0.06, it predicts approximately **0.0353–0.0354**, in line with the direct planted results. This formula is **explanatory**, because true H2 collision-rejection history depends on the secret table and plaintext. The **complete q=0.81 Monte Carlo enciphering**, rather than this approximation, supports the operational comparison.

A cyclic table balances the marginal by construction, even though a rare row is absent. Its successful matching is an **existence control**; the cyclic row family is not authenticated as Cicada's algorithm, and its hidden key-path remains unknown.

The planted windows do not insert the four separately *hypothesized* contraction words at authentic LP2 apostrophe coordinates, since the original contraction plaintexts are unknown and the current gate tests global ciphertext frequencies. This is an explicit scope difference from the earlier #1342 H2 oracle-tableau experiment; it does not change the simulated key/skip rule.

## Research decision

For ordinary GP-native literary input, **do not promote the independent 29-random-table H2 prior** on the strength of its calibrated 86 repeats or its positive 97.24% table-inversion result with *oracle-supplied true rows*. Its actual full-length marginal is empirically too uneven. Before hidden-row drift recovery is taken to original ciphertext, require either (a) **a first-party selected, frequency-balanced tableau/clock**, (b) a concrete extra mechanism correcting independent-table marginals, or (c) an authentic source selecting a plaintext register with far flatter symbol distribution. Then demand a blind planted full-path inverse, 150 contiguous original unknown readable runes, a disjoint holdout and exact forward reencryption.

This changes an architectural **prior**, not the established unknown-LP2 solve status.

[Source and model SFT](../sims/lp2_h2_random_table_flatness_gate_sft.cjs) · [manual Windows CI verification](https://github.com/FlareZ123/liber-primus/actions/runs/44029568080) · [original H2 joint-state decision #1342](https://github.com/FlareZ123/liber-primus/issues/1342).

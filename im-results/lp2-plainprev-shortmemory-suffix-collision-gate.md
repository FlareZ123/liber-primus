# Secret plaintext-history cipher tables: original LP2 word-suffix obstruction

**Agent13, 23 November 2026. Decision:** Original-source, key-independent necessary-condition exclusion of stationary short plaintext-history transducers for three source-native English reference registers, **even with entirely private arbitrary cipher tables on each original printed page**. The result supplies no unknown plaintext, authentic key, first-party cipher instruction or destination. The [stand-alone Windows Node.js 22 test](../sims/lp2_plainprev_suffix_collision_sft.cjs) passes [original-source GitHub Actions run 45114463357](https://github.com/FlareZ123/liber-primus/actions/runs/45114463357).

## Source-motivated question and competing explanation

The 12,956 original unknown LP2 GP29 runes contain unusually few adjacent equal ciphertext runes, but the transcript preserves 2,896 physical printed words, including 32 words continuing across page boundaries. A simple, reversible mechanism capable of flattening English unigram and immediate-pair statistics would choose the substitution table for each new symbol from the **last recovered plaintext rune(s)** rather than the last printed ciphertext rune. This is a genuine different candidate from the published previous-*ciphertext* state capacity bounds and the earlier restricted *additive* plaintext-feedback lookup consensus.

No original Cicada instruction selects this architecture. The strongest alternatives are changing key/state inside each word, a nonlocal or variable-length emitter, a different plaintext orthography, or a source-specific plaintext that seldom repeats word endings. The following test targets the entire finite-memory **stationary hidden-table family**, eliminating any need to guess its tables before deciding whether it can output source-native prose.

## Exact unknown-key theorem

Let the 29 GP runes be indexed 0..28. Within each original **complete printed word** (word boundaries retained), grant every independently keyed scope an unrestricted secret table at every predecessor plaintext context:

\[
 C_{w,j}=Q_{g,\,(P_{w,j-m},\ldots,P_{w,j-1})}(P_{w,j}),\qquad j\ge m.
\]

Here **memory** \(m\) is fixed; \(g\) can identify the whole manuscript, one of the nine original illustrated chapters, or every single physical rune-bearing page. Each secret row can be any 29-way permutation, independently chosen from all others. The theorem even holds for deterministic non-injective rows. Each word's first \(m\) ciphertext runes are **arbitrary and unconstrained**. The only requirements are that the relevant row remains stationary within \(g\), output is one GP rune per plaintext rune, and the original printed word boundaries are preserved.

Take any two complete words of length at least \(m+2\), sharing the same secret scope \(g\). If their last \(m+2\) **plaintext** runes are identical, the contexts and current plaintext symbol for each of their final **two** positions are identical. Both final ciphertext runes must therefore match pairwise. For a collection of source printed words in a fixed grouping, let \(N_P(u)\) count words sharing final plaintext string \(u\) of length \(m+2\), and \(N_C(v)\) count words sharing final ciphertext string \(v\) of length two. Then for **every choice of every secret table**,

\[
 \sum_g\sum_{|u|=m+2}{N_P(g,u)\choose2}
 \ \le\
 \sum_g\sum_{|v|=2}{N_C(g,v)\choose2}.
\]

Every pair of plaintext words counted on the left must be counted on the right. This statement is exactly independent of cipher keys, arithmetic group operations, ciphertext marginals, learned language models, and word-initial ciphertext conventions. Changing a row **between the two final positions** based on an additional clock, word identity, or other state invalidates the premise. A deterministic lookup with more than \(m\) plaintext history also lies outside the theorem.

## Exact untouched LP2 ciphertext capacities

Use [the canonical rune-word parser](../sims/lp2_word_pages.cjs) on the [original master transcript](../resources/lp2-transcription.txt), matching the [LP2 GP29 numeric corpus](../resources/liber-primus/lp2-corpus.json). Page50 has only numeric-table cells, so it contributes no GP rune. Joining line and physical-page continuations yields precisely **2,896 complete words, 12,956 GP runes and 32 cross-physical-page words**. For chapter/page scopes, conservatively discard all words that cross physical pages, while for the global scope retain them. The nine original chapter endpoints are physical pages **[2,7,14,22,26,32,39,53,55]**.

The right-hand side of the theorem is an exact **two-rune word-ending collision-pair capacity**, independently of the unknown plaintext and its putative cipher table. Its value depends on the eligible word lengths, because a memory-\(m\) model makes no prediction for words with fewer than \(m+2\) symbols.

| Plaintext memory \(m\) | Minimum word size | Eligible words, global / page-contained | Original global ending pairs | Original nine-chapter ending pairs | Original page-private ending pairs |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 3 | 2,365 / 2,333 | **3,479** | **458** | **52** |
| 2 | 4 | 1,645 / 1,617 | **1,686** | **204** | **24** |
| 3 | 5 | 1,132 / 1,108 | **809** | **83** | **6** |
| 4 | 6 | 815 / 797 | 389 | 35 | 2 |

A changing output row per page is much more permissive than a global or chapter-only model. Its tiny capacity nonetheless gives a strong necessary-condition test because ordinary English reuses short suffixes such as ING, ED, ER, and other GP29 multi-letter contractions.

## Source-native English controls with original word lengths

The test derives GP native spelling from exact solved-LP1 examples: the source uses the one-rune ING and IO forms in FOLLOWING, THINGS, STRONG, FUNCTION, CONSUMPTION, BEHAVIORS, GREAT, and QUESTION. English QU, V, K/Q and Z are normalized as in the existing calibrated GP29 source encoder. We then independently collect **actual complete prose word occurrences** from three pinned, historically plausible English registers: Shakespeare, Gibran's *The Prophet*, and Emerson's *Essays*. Each source receives the exact original LP2 sequence of printed GP word lengths and original physical word/page scope, filled with a randomly shuffled matching-length pool of **intact source words** without replacement of an available occurrence. If a source contains fewer occurrences than the required original length stratum, the code cycles after exhausting that stratum. No corpus word is synthesized by randomly splicing runes; no secret table is fitted. Each source is tested at **64 deterministic seed-conditioned samplings**, for **192 per memory**, preserving every original source word-length slot.

The table below gives the **lowest** number of source-native equal plaintext suffix pairs found among each source's 64 controls, separately for every original cipher-secret scope. If a minimum exceeds the corresponding original ciphertext capacity, **all 64 controls** from that source violate the exact necessary inequality no matter how the secret table is chosen.

| Memory | Shakespeare: global / chapter / page minima | Gibran: global / chapter / page minima | Emerson: global / chapter / page minima |
| ---: | ---: | ---: | ---: |
| 1 | **16,690 / 2,310 / 292** | **27,332 / 3,727 / 493** | **19,488 / 2,710 / 354** |
| 2 | **3,396 / 424 / 53** | **4,806 / 638 / 74** | **2,885 / 348 / 37** |
| 3 | **1,174 / 133 / 14** | **1,342 / 164 / 21** | **774 / 99 / 8** |
| 4 | 736 / 81 / 9 | 702 / 87 / 8 | 244 / 24 / 1 |

**Exact decision for memory 1, 2, and 3:** in **all 192 source-native controls**, the chapter-specific and page-private counts independently exceed the original capacities. For \(m\le2\), even the global counts exceed the original. At \(m=3\), three of Emerson's 64 controls fall at or below the less-discriminating **global** 809-pair bound; they still exceed the stricter original **page** six-pair bound. A single global secret table is also necessarily a valid page-restricted instance of the same table, so those exceptions cannot rescue it. The bound is conditional on the sampled prose register and exact printed word representation, rather than a universal lower bound for every possible English manuscript.

**Boundary where this argument loses discriminatory power:** At \(m=4\), **8 of 64** Emerson samples fall at or below the original **page-private** capacity 2, while **15 of 64** fall at or below the chapter capacity 35. Therefore the report makes **no exclusion for four-plaintext-predecessor tables**. This explicit counterexample matters more than continuing to add hidden-table freedom to a ruled-out one-, two-, or three-step version.

## Independent reversible positive controls

The single-file source test encrypts a complete Gibran GP29 control having the same original eligible word lengths and page geometry with an independently secret, randomly generated nonlinear **29-symbol permutation for every observed \(m\)-rune predecessor context**. The secret tables are independently keyed under the global, nine-chapter and page-private scopes, and every word's first \(m\) ciphertext runes are individually free. The inverse is sequential: recover the previous \(m\) plaintext values, invert the corresponding row permutation, then continue. For **all nine independent \(m\in\{1,2,3\}\) × scope combinations**, the inverse reconstructs every eligible planted plaintext rune exactly and the necessary suffix inequality holds. These controls test the architecture's actual decipherability, not merely that two vectors have equal lengths.

The script [\`sims/lp2_plainprev_suffix_collision_sft.cjs\`](../sims/lp2_plainprev_suffix_collision_sft.cjs) is source-reading-only, CJS and dependency-free, and asserts the original 2,896 words/32 page carries/12,956 GP runes, all four sets of exact original capacities, the calibrated spelling witnesses, 64 randomized controls per source and every positive inverse. The [manual Windows Node.js22 workflow](../.github/workflows/lp2-plainprev-suffix-collision.yml) passed on [run 45114463357](https://github.com/FlareZ123/liber-primus/actions/runs/45114463357), 23 November 2026.

## Causal cryptanalytic decision

A stationary one-rune-per-rune decoder with up to **three plaintext predecessors** as its **entire** within-word state cannot generate the observed original ciphertext from any of the tested native-GP English controls, regardless of 29-way table secrets, even if the author independently rekeys **every physical page** and picks every word's first three ciphertext runes freely. This closes a broad nonlinear architecture without 29!\(^{29^3}\) table enumeration. It complements, and does not duplicate, prior first-order previous-ciphertext capacity and additive plaintext-feedback consensus bounds.

The original human-facing puzzle still lacks a first-party instruction selecting this family, and this test recovers **no unknown plaintext**. Its useful effect is to redirect effort toward **an independently selected evolving state**, a genuinely nonlocal/polygraphic mechanism, a separately supplied key stream, a different word/rune transport, or an authentic source register whose endings are substantially less redundant than the reference English. A four-predecessor stationary table is empirically unresolved by this test, but should not receive a brute-force assignment without independent author evidence.
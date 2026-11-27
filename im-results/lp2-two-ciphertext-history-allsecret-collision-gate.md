# LP2 full-GP29 second-order ciphertext-history state: key-independent equality obstruction

**Agent38, 13 November 2026. Original-ciphertext structural gate, independently computed.** This test identifies a material restriction on a particular family of short-memory ciphers. It does not recover unknown Liber Primus text, an authorial key, or a final address. It is distinct from the earlier original **16-symbol Younger-Futhark two-history** codebook feasibility check and the first-order secret-row bound.

## Mechanism a human solver might attempt

LP2's original ciphertext suppresses adjacent identical runes, possibly by a rule referring to preceding ciphertext. An inexpensive lossless mechanism is a GP29 alphabet *permutation* selected by the previous two ciphertext runes:

`C_i = σ_(C_(i-2),C_(i-1))(P_i)`.

Every one of the **841** history states may use a different secret 29-symbol bijection. The source does not explicitly instruct this architecture. We test its simplest book-wide key schedule and a more permissive schedule that resets independent secret permutations at the nine image-defined chapter starts **p0,3,8,15,23,27,33,40,54**. The analysis excludes the first two runes of every original nonempty physical page from both ciphertext and comparison sequences; this is a conservative page-boundary treatment and imposes no key phase fit.

## Exact invariant and observed ciphertext

For any fixed source history state `s=(C_(i-2),C_(i-1))`, a secret bijection preserves equality of two plaintext symbols: `P_i=P_j iff C_i=C_j` whenever both histories equal `s`. Denote by `n_s(c)` the observed counts of ciphertext rune `c` after state `s`. The equal ordered-pair count `E=Σ_s Σ_c n_s(c)(n_s(c)−1)`, and exposure `D=Σ_s N_s(N_s−1)` with `N_s=Σ_c n_s(c)`, are therefore exact invariants for **any secret permutation of each state**, with no guessing of those 841 permutations.

| Secret-state domain | Original equal ordered pairs E | Exposure D | Collision E/D | Observed states |
| --- | ---: | ---: | ---: | ---: |
| One set of 841 tables over the full book | **7,022** | 201,168 | **0.03490614810** | 840 |
| Separate tables for nine source-visible chapters | **970** | 27,958 | **0.03469489949** | 5,642 |

Both are near uniform-GP29 **1/29 = 0.03448276**, despite thousands of within-state pairs. This is an original-input, key-independent fact.

## Authentic-language positive plants

The independent original-layout reference fixtures `resources/control/shakespeare_first300k.txt` and `gibran_prophet_58585.txt` are normalized to GP29 (QU→CW, V→U, K/Q→C, Z→S, ING→NG and IO→IA), then sliced to 12,956 runes and partitioned into the exact original 55 page lengths. An independently fixed, **lossless second-history cipher** encrypts them with state-dependent affine permutations `σ_(a,b)(p)=m_(a,b)p+k_(a,b) (mod29)` where `m=1+((a+1)7+(b+1)11) mod28` and `k=((a+1)3+(b+1)5) mod29`. A fresh pair of `−1` sentinels starts each physical page. Every decrypted rune is checked exactly by enumeration of all 29 inverses, so the controls test precisely this family rather than merely sampling independent plaintext.

| Sampled native GP plant | Book-global E/D | Nine-chapter E/D |
| --- | ---: | ---: |
| Shakespeare | **12,924 / 202,154 = 0.06393146** | **1,910 / 28,490 = 0.06704107** |
| Gibran | **12,938 / 203,110 = 0.06369947** | **1,900 / 28,376 = 0.06695799** |
| Original unknown LP2 | **0.03490615** | **0.03469490** |

The full book's 7,022 original equality pairs are dramatically below both source-native planted examples even though *all 841 state permutations are allowed to remain secret*. The finite controls use one independently fixed affine encryption schedule per author; they are not a statistical census over every conceivable choice of the state permutations or of all literary prose. The mathematical invariant rules out rescuing **a given** plaintext assignment by reassigning the secret state alphabets. The comparison specifically disfavors direct natural-language GP29 plaintext under a stationary second-order previous-ciphertext-alphabet rule, whether a single key applies book-wide or each of the nine chapters has its own. Exotic state–plaintext correlations, a third hidden state/keystream, nonbijective maps, page-specific secret tables, and nonlinguistic intermediates are outside the test.


## Exact limited-state refinement: binary classification of the second predecessor (Agent38, 27 November 2026)

A full 841-row decoder has many degrees of freedom and the older collision comparison above is conditional on its planted state schedule. The following is a sharper **all-key marginal capacity theorem for a smaller but still very broad recoverable-state architecture**. Suppose that the previous ciphertext rune (a=C_{i-1}) chooses a pair of entirely secret GP29 permutation rows, and the second predecessor (b=C_{i-2}) chooses either member by an arbitrary secret binary classification (h(a,b)):

```text
C_i = S[a,h(a,b)](P_i)
```

Every one of the 841 binary decisions may be independent; the classification may differ for each a. The 58 rows are completely arbitrary permutations, not necessarily affine, and the first two runes of each of the 55 physical rune-bearing pages are freely assigned. No printed-word assumption, clock phase, guessed key, or source-selected classifier is imposed. This mechanism addresses the original low repeat rate by introducing a limited amount of recoverable history state beyond a previous-rune table; no authenticated clue specifies the mechanism itself. A truly evolving hidden state or additional register is a distinct hypothesis.

For a fixed set of k plaintext labels, each of the two rows maps it to a k-element ciphertext subset A or B. Let n[a,b,c] be the exact original triple counts, omitting the first two physical runes of each nonempty page. The sharp maximum, including freely assigned page heads, is

```
U(k) = 110 + sum_a max_{A,B: |A|=|B|=k} sum_b
                     max(sum_{c in A} n[a,b,c], sum_{c in B} n[a,b,c]).
```

This follows because h(a,b) is independent for every observed context. Conversely pick the maximizing sets, select the better row for every b, map the k fixed plaintext labels bijectively to that row's chosen subset, and complete its permutation on remaining labels. Thus the bound is attainable, not an optimizer estimate. For k=2 all 406 possible subsets and all 82,621 unordered pairs with repetition are enumerated for every a (including overlap). For top-one and r independently selectable rows, replace the two k-sets by r output labels; enumerate all r-element subsets for r=1,2,3,4. Distinct labels suffice for top-one because replacing a duplicate with an unused label cannot reduce the maximum.

| Whole-book model | Max top-one | Max top-two |
|---|---:|---:|
| 1 row per previous rune, 110 free page heads | 823 | — |
| 2 rows per previous rune, arbitrary two-predecessor binary classifier | **1,216** | **2,068** |
| 3 rows per previous rune, arbitrary two-predecessor ternary classifier | 1,455 | — |
| 4 rows per previous rune, arbitrary two-predecessor quaternary classifier | 1,622 | — |
| Binary selector allowed to vary independently at every occurrence (relaxation) | 1,468 | 2,669 |

Original counts use all 12,956 runes; the 110 freely assigned heads make the tests conservative. The binary exact caps are 9.386% and 15.962% of the full tape. The constructed maximizing original inverse assigns exactly 2,068 runes to the fixed pair E/O and replays all 12,846 constrained original positions. Its row maps and classifier are output by the reproducer; the two freely assigned rune heads per page are outside the modeled sender. This is an extremal witness, not recovered language or a discovered key.

All contiguous 12,956-rune windows of three pinned literary references, encoded GP29 (QU→CW, V→U, K/Q→C, Z→S, ING/NG→NG, IO/IA→IA; longest chart token within each word), exceed **both** binary ceilings even excluding plaintext F from the frequency ranks:

| Source | Eligible windows | Min E count | Min two most common non-F labels |
|---|---:|---:|---:|
| Gibran | 49,537 | 1,416 | 2,548 |
| Shakespeare | 204,151 | 1,408 | 2,441 |
| Emerson | 308,372 | 1,491 | 2,514 |

The 2,979 directly transcribed solved-native runes have E=380 and top-two non-F=636, also substantially larger fractions, though this shorter source is not a length-matched control. Therefore the binary family would need at least **192 additional E positions** or at least **373 additional top-two non-F positions** to reach any of the 562,060 tested literary windows. These deficits count positions, not bits of key entropy. The ternary top-one bound rejects every tested Emerson window but does not by itself reject Gibran or Shakespeare. The binary result also applies to a literal-F bypass if the two physical ciphertext predecessors always advance and each state maps consuming non-F runes injectively; allowing free F holds does not increase any non-F subset's output cardinality. It does not extend to histories indexed by a hidden consumed-symbol clock.

Three original-page-length positive controls encrypt the first 12,956 runes of each literary donor under independently seeded secret binary classifications and permutations. All 38,538 constrained symbols replay; the true top-one/top-two counts and respective computed caps are Gibran 1529/2661 ≤ 2075/3435, Shakespeare 1524/2551 ≤ 2029/3349, Emerson 1658/2682 ≤ 2068/3440. These test the bound and exact constructive inverse, not blind recovery of the planted key.

Independent chapter tables **are not excluded**: e.g. original p40–53 alone admits sharp top-one/top-two maxima 430/738 on 3,008 runes. The more permissive arbitrary-per-occurrence binary history bound is also insufficient to exclude every literary window. The decisive new constraint is stationary shared book-wide rows indexed by a binary class of the preceding two physical symbols, not every two-state cipher or every natural-language text. Retire this book-global family against the finite donor envelope without searching its enormous secret classifier/permutation space. No unknown plaintext or authentic key.

[Exact SFT and constructive extremal witness](../sims/lp2_twohistory_binary_context_exact_capacity_sft.cjs), commit e4b78bebd37c50634048aff2804d04e23629e2be. Experiment core executed on actual repository inputs in connected V8; standalone Node wrapper not independently executed. Source blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, native 1b064ef6d85819b7d96adaff31a82d1ec551598f, Gibran df260a07d56bf5998d40a6360b6132c35c252d10, Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85, Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a.

## Cryptanalytic decision

Treat a **fixed arbitrary 29-symbol bijection selected solely by the previous two visible ciphertext runes** as a weak LP2 decryption route unless new original instructions specify an additional key/clock or an alternative plaintext register. The observed ciphertext has no source-recoverable text under this test. A third, external key state or word-position-specific alphabet is not covered merely by counting 841 history states. This result extends the [first-order GP29 all-secret bound](lp2-firstorder-cipherstate-alphabet-capacity.md), while the [16-rune two-history test](lp2-source16-twohistory-codebook-decision.md) asks a distinct capacity question.

**Reproducer:** [standalone Windows-compatible CJS SFT](../sims/lp2_two_ciphertext_history_allsecret_collision_sft.cjs). It reads the exact committed original corpus and independent controls, asserts all integer E/D counts, verifies every reversible affine plant symbol and emits the full numeric result. Its exact checked-in source text has executed successfully with the unchanged repository corpus fixtures in an isolated JS runtime; no GitHub Action was created.

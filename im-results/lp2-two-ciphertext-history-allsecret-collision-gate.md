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

## Cryptanalytic decision

Treat a **fixed arbitrary 29-symbol bijection selected solely by the previous two visible ciphertext runes** as a weak LP2 decryption route unless new original instructions specify an additional key/clock or an alternative plaintext register. The observed ciphertext has no source-recoverable text under this test. A third, external key state or word-position-specific alphabet is not covered merely by counting 841 history states. This result extends the [first-order GP29 all-secret bound](lp2-firstorder-cipherstate-alphabet-capacity.md), while the [16-rune two-history test](lp2-source16-twohistory-codebook-decision.md) asks a distinct capacity question.

**Reproducer:** [standalone Windows-compatible CJS SFT](../sims/lp2_two_ciphertext_history_allsecret_collision_sft.cjs). It reads the exact committed original corpus and independent controls, asserts all integer E/D counts, verifies every reversible affine plant symbol and emits the full numeric result. Its exact checked-in source text has executed successfully with the unchanged repository corpus fixtures in an isolated JS runtime; no GitHub Action was created.

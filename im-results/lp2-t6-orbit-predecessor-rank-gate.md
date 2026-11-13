# T6 affine orbit as a predecessor-exclusion rank cipher

**13 November 2026, Agent11. Conditional original-cipher exclusion, no recovered unknown plaintext or key.**

The unmodified 55 unsolved rune-bearing pages contain **12,956 GP29 runes**, including only **86** repeats among 12,901 immediate page-local transitions. An independently reproduced ciphertext anomaly is the word-local lag-six map `T(x)=24−2x mod29`. It has one fixed point (index8) and one **28-element cycle**, which can supply an explicit ordering of the 28 next-runic glyphs **excluding the preceding ciphertext glyph**.

For previous index `p≠8`, define the 28 valid outputs in order `T(p),T²(p),…,T²⁷(p),8`. For `p=8`, use `0,T(0),…,T²⁷(0)`. Every ordinary output has an exact predecessor-dependent rank 0…27. The manuscript's 86 actual immediate repeats have no such rank and are treated as erasures, without inventing a lossless escape channel. This is a proposed *combination* of two observed signatures. There is **no authenticated instruction** selecting the combination, and the T6 relation occurs at word-local lag six whereas this hypothesized rank map uses lag one.

The [CommonJS reproducer](../sims/lp2_t6_orbit_predecessor_rank_sft.cjs) independently inverts all **12,815** ordinary transitions and checks each original page length. The rank's exact same-symbol collision fraction is mathematically invariant under **any unknown bijection of rank labels**, and the page-conditioned fraction is invariant even if the secret permutation is unrelated on each page.

| Rank-collision fraction | Original LP2 | Shakespeare planted | Gibran planted | Emerson planted |
| --- | ---: | ---: | ---: | ---: |
| Pooled book | **0.03576912** | 0.06180625 | 0.06160706 | 0.06378063 |
| Within physical pages | **0.03605405** | 0.06233204 | 0.06294924 | 0.06404306 |

For each independent control source, the text is GP-normalized into 28 runic symbols (omitting original rare index28), then *actually encoded* with the predecessor-dependent T-orbit under the manuscript's **exact 55 original page extents, 55 starting runes and 86 original repeat locations**. It recovers **12,815/12,815 source ranks** without a secret key; the native-language equality fingerprint survives encryption in all three controls. The manuscript's rank output is instead essentially uniform (1/28 = 0.03571429).

**Decision:** This specific reversible T-orbit predecessor-rank component, even composed with a secret fixed or pagewise 28-way alphabet permutation, **does not produce native GP28 English** from original LP2. It is different from [sorted/cyclic exclusion](no-repeat-rank-inversion.md) and the [word-local six-back orbit exponent model](../sims/lag6_orbit_static_mapping_gate.cjs). Neither observed ciphertext anomaly is an identified source-authenticated key; a complete 29-symbol lossless model would additionally need to account for the 86 repeat sites and coding capacity. No phase, orientation or postselected exceptions are introduced.

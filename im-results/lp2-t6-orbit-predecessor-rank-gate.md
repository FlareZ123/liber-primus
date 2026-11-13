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

## One complete source-key consumer on the p40 visual chapter

The **p40–53** original section opens with **eight red runes** (indices `[0,9,19,26,6,23,25,8]`) followed by exactly **3,000** other runes. Its embedded original base60 table has **32 rows × 8 columns = 256 bytes**. These visible dimensions supply a finite candidate key stream: for body position `i`, take the printed row-major table byte `K[i mod256]`, reduce modulo28, and subtract it from the immediate-predecessor T-orbit rank. All **18** actual repeated outputs in this body are preserved as erasures; the byte clock consumes their original positions. This is fully specified by source values apart from the proposed orbit cipher and modular-subtraction operation. A complete 28-rank inverse exists for every nonrepeat output.

| Fixed source test on the complete p40–53 body | GP28 rank collision fraction |
| --- | ---: |
| **Original output, predecessor-orbit unrank then grid-byte subtract** | **0.03583595** |
| Shakespeare GP28 encoded with exactly the same key and all 18 original erasures, then inverted | **0.06392532** |

The actual original output remains uniform-like. The source-native true-key plant recovers **2,982/2,982** nonerased GP28 positions under the same exact decoding pipeline. No readable text, key-skip signal or other original mechanism appears. This is a bounded failure for a complete **source-visible** 256-byte key candidate, distinct from unkeyed rank inversion and earlier table-based plain additive mod29 tests; no grid orientation, phase or extra hash is fitted to output.

**Decision:** Both the direct fixed/pagewise rank-substitution family and its single source-visible p40–53 modular grid-key consumer fail to produce native GP28 English from original LP2. It is different from [sorted/cyclic exclusion](no-repeat-rank-inversion.md) and the [word-local six-back orbit exponent model](../sims/lag6_orbit_static_mapping_gate.cjs). Neither observed ciphertext anomaly is an identified source-authenticated key; a complete 29-symbol lossless model would additionally need to account for the 86 repeat sites and coding capacity. No phase, orientation or postselected exceptions are introduced.

# The 55×233 LP2 step array: exact row- and column-secret-permutation invariants

**Evidence class:** original ciphertext arithmetic and two exact unknown-key-invariant tests, with exhaustive finite native-text exclusions and exact original-shaped positive inversions. **No unknown Liber Primus plaintext, historical key or cipher has been recovered.**

## A source-coordinate candidate, not an established architecture

The 55 rune-bearing unsolved physical LP2 pages contain **12,956 original runes**. Omit each physical page's first rune as a potential initial-vector site and omit every one of its **86 literal equal-adjacent rune events** as a potential special marker. The remaining nonzero consecutive steps constitute exactly

```text
12,956 − 55 − 86 = 12,815 = 55 × 233.
```

Both **55** and **233** are Fibonacci numbers, and **233** is prime. This suggests two concrete candidate dimensions for the continuous 28-label step stream. The divisibility was noticed *after* proposing the IV/doublet interpretation, so it is exploratory numerical alignment. No transposition, row clock, or key generation is thereby authenticated. See also the separate [binary-packet capacity test](gp28-direct-binary-packet-capacity.md), which rules out an unrelated natural radix28 byte framing.

## Column-period secret-permutation theorem

Let the original source-derived 28-symbol step stream be `Y[i]`, with step `(C[i]−C[i−1]) mod29` interpreted through any fixed labeling, excluding zero steps and page initials. Test the complete class

```text
Y[i] = S[i mod L](P[i]),       L ∈ {55, 233},
```

where every `S[j]` is an **independent, completely arbitrary bijection of the 28 labels**. This includes any repeated additive shift as a strict special case; it additionally allows completely secret non-additive substitutions, with the same table reused once every `L` positions. No permutations are fitted or disclosed.

The equality invariant is exact:

```text
Y[i] = Y[i−L]   iff   P[i] = P[i−L].
```

It holds for every one of the `(28!)^L` possible secret-table assignments because both positions are transformed through the **same bijection**. Consequently the total number of equal symbols at lag `L` must be **identical** in the input plaintext and the original stream, without any assumptions about alphabet naming or the distribution of the secret keys.

This is an exact source-to-source necessary condition for authentic GP28 prose after omitting its EA markers. It works even if the secret table is not modular-additive.

## Original observations and exhaustive source comparisons

| Source and statistic | Lag 55, among 12,760 comparable pairs | Lag 233, among 12,582 comparable pairs |
| --- | ---: | ---: |
| **Original LP2 stream** | **450 (3.5266%)** | **439 (3.4891%)** |
| All Shakespeare windows: minimum | 719 (5.6348%) | 707 (5.6191%) |
| All Gibran windows: minimum | 727 (5.6975%) | 679 (5.3966%) |
| Shakespeare source-window median | 786 (6.1599%) | 779 (6.1914%) |
| Gibran source-window median | 792 (6.2069%) | 737 (5.8576%) |

An additional **author-native language control** comes from the repository's editor-normalized, previously solved Cicada prose in `resources/liber-primus/lp1-plaintext-reference.txt`, the same native solved source used by Agent 43. It contains **3,736 GP runes**, including 30 EA; after removing EA it has **3,706 GP28 symbols**. Its period-55 equality rate is **242/3,651 = 6.6283%** and its period-233 rate is **239/3,473 = 6.8817%**. Both are considerably above the original 3.5% and consistent with the independent literary controls. This native register is shorter than 12,815 symbols and so provides **empirical author-style evidence**, rather than another exhaustive full-book-source exclusion. Its editorial normalization and mixture of solved sections should not be treated as a historically exact LP2 plaintext prior.

The checked-in Shakespeare source, converted with the established GP tokenizer and omitting GP-EA, has **217,167 GP28 symbols**. Every one of the **204,353** possible full-manuscript-length windows is scanned without skipping any offsets. The checked-in Gibran *Prophet* reference has **62,508 GP28 symbols** and **49,694** possible windows. The exhaustive sliding-window test updates each window's collision count in constant time, avoiding approximate sampling or fitted search.

**Zero of the 254,047 candidate source windows** from either reference achieves the original LP2 equality count at either period. The original gaps from even the closest literal-source match are: 269 and 268 equal pairs for Shakespeare at periods 55 and 233; 277 and 240 for Gibran. These are deterministic finite exclusions of **entire original-source copies** for this declared architecture. They make no assumption of random independence between overlapping source windows and require no post-hoc p-value.

The original stream also has these disjoint half-of-book equality counts:

| Phase | L=55 | L=233 |
| --- | ---: | ---: |
| First half, 6,380 / 6,291 adjacent-row comparisons | 233 (3.6520%) | 225 (3.5765%) |
| Second half, 6,380 / 6,291 adjacent-row comparisons | 217 (3.4013%) | 214 (3.4017%) |

The deficit relative to ordinary GP English occurs in both halves, instead of being caused by a handful of extreme rows. Those halves are descriptive checks; only the full original values are used for the exact finite source exclusions.

## Complementary rowwise alphabet **and** position invariant

The same 55×233 shape admits a second independent, broader secret-key architecture: each contiguous 233-symbol row may be transformed by its **own arbitrary 28-symbol substitution `S_r`** and **its own arbitrary 233-position permutation `π_r`**, with all 55 rows completely independently keyed. For each row, the number of *unordered pairs of positions carrying equal symbols*,

```text
Q_r = sum_{x=0}^{27} count_r(x) × (count_r(x) − 1) / 2,
```

is invariant under **both** unknown permutations. The total `Σ_r Q_r` is preserved under every one of the `((28!) × (233!))^55` possible row-key choices, even though no positions are presumed aligned across rows. This tests rowwise monoalphabetic substitution plus arbitrary within-row scrambling, a materially different class from the previous fixed-column recurrence.

| Entire 55-row source window | Unordered equal-symbol pairs within rows | Row-symbol coincidence rate |
| --- | ---: | ---: |
| **Original GP28 ciphertext steps** | **53,310 / 1,486,540** | **3.5862%** |
| Minimum among all 204,353 Shakespeare windows | 87,794 / 1,486,540 | 5.9059% |
| Minimum among all 49,694 Gibran windows | 90,681 / 1,486,540 | 6.1001% |

The **1,486,540** denominator is exactly `55 × 233 × 232 / 2`. The original equality inventory cannot be obtained from **any** of the 254,047 checked contiguous literary GP28 source passages under **any independent row-symbol permutations or row-position permutations**. This conclusion is exact and does not require model fitting, approximate Monte Carlo or an alphabet guess.

[`sims/gp28_55x233_row_inventory_gate.cjs`](../sims/gp28_55x233_row_inventory_gate.cjs) scans every original-sized source window after computing all possible 233-symbol block collision inventories with constant-time sliding updates. Two independent **original-physical-page-shaped positive controls** deliberately hide 55 random rune alphabets **and 55 independently generated 233-position permutations**. Both satisfy the invariant, recover **12,815/12,815** GP28 source runes by their exact synthetic inverse, reproduce **all 12,956** full GP29 ciphertext glyph sites, and preserve all **86** original literal doublet positions.

The rowwise result requires 233 consecutive GP28 plaintext positions to have remained in the **same row inventory**, even if their within-row order is shuffled. Inter-row mixing, state-evolving substitutions within rows, differing source segmentation or binary intermediates remain untested. The source texts do not establish that any intact original GP-English row inventory is the actual cipher input.

## Fully invertible native-text controls

[`sims/gp28_fibonacci_55x233_collision_gate.cjs`](../sims/gp28_fibonacci_55x233_collision_gate.cjs) constructs **four** independent tests: both source books under each of the two periods. It chooses **55 or 233 independent secret 28-way random permutations**, enciphers 12,815 actual source-GP28 symbols in their positions, reconstructs all **12,956** page-shaped GP29 runes while retaining the 86 exact original repeat-marker locations and 55 physical page IVs, and then completely recovers the secret GP28 plaintext using the synthetic inverses. All **four** plants recover **12,815/12,815** original source symbols and reproduce their exact source lag-collision counts. The original source fails these same necessary conditions without requiring any attempt to fit the permutations.

The script was run on the exact checked-in canonical corpus and both source texts plus the editor-normalized solved Cicada reference, and all original, source-count, inverse and forward-encryption assertions passed.

## Inference and unresolved possibilities

The column-period invariant **rules out repeating 55-state or 233-state one-to-one substitution of an intact contiguous Shakespeare or Gibran GP28 source**. The independent row-inventory invariant also excludes **independent per-row monoalphabetic substitution plus arbitrary within-row transposition** for those same source passages. Both strongly contradict the broader *ordinary GP-English* versions measured by those control corpora. The key cannot rescue that exact model, even if every period column has its own otherwise unconstrained 28-way permutation.

This remains a **bounded conditional exclusion**, because a novel original text with near-uniform GP28 letter frequencies could satisfy the observed invariant. Source-specific alternative GP normalization, evolving keys that change the substitution even on a recurrence of the same residue, state-dependent transpositions, a keyed omission rule, plaintext EA appearing in the nonzero channel, direct binary intermediates, or any different semantic meaning of the 86 doublets are outside this theorem. The observed 55×233 factorization does not prove the author intended such an array, and the test makes no claim about the true full cipher.

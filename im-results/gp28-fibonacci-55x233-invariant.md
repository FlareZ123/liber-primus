# The 55×233 LP2 step array cannot use a fixed-per-column GP-English substitution

**Evidence class:** original ciphertext arithmetic and an exact unknown-key-invariant test, with exhaustive finite native-text exclusions and exact original-shaped positive inversions. **No unknown Liber Primus plaintext, historical key or cipher has been recovered.**

## A source-coordinate candidate, not an established architecture

The 55 rune-bearing unsolved physical LP2 pages contain **12,956 original runes**. Omit each physical page's first rune as a potential initial-vector site and omit every one of its **86 literal equal-adjacent rune events** as a potential special marker. The remaining nonzero consecutive steps constitute exactly

```text
12,956 − 55 − 86 = 12,815 = 55 × 233.
```

Both **55** and **233** are Fibonacci numbers, and **233** is prime. This suggests two concrete candidate dimensions for the continuous 28-label step stream. The divisibility was noticed *after* proposing the IV/doublet interpretation, so it is exploratory numerical alignment. No transposition, row clock, or key generation is thereby authenticated. See also the separate [binary-packet capacity test](gp28-direct-binary-packet-capacity.md), which rules out an unrelated natural radix28 byte framing.

## General secret-permutation theorem

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

The checked-in Shakespeare source, converted with the established GP tokenizer and omitting GP-EA, has **217,167 GP28 symbols**. Every one of the **204,353** possible full-manuscript-length windows is scanned without skipping any offsets. The checked-in Gibran *Prophet* reference has **62,508 GP28 symbols** and **49,694** possible windows. The exhaustive sliding-window test updates each window's collision count in constant time, avoiding approximate sampling or fitted search.

**Zero of the 254,047 candidate source windows** from either reference achieves the original LP2 equality count at either period. The original gaps from even the closest literal-source match are: 269 and 268 equal pairs for Shakespeare at periods 55 and 233; 277 and 240 for Gibran. These are deterministic finite exclusions of **entire original-source copies** for this declared architecture. They make no assumption of random independence between overlapping source windows and require no post-hoc p-value.

The original stream also has these disjoint half-of-book equality counts:

| Phase | L=55 | L=233 |
| --- | ---: | ---: |
| First half, 6,380 / 6,291 adjacent-row comparisons | 233 (3.6520%) | 225 (3.5765%) |
| Second half, 6,380 / 6,291 adjacent-row comparisons | 217 (3.4013%) | 214 (3.4017%) |

The deficit relative to ordinary GP English occurs in both halves, instead of being caused by a handful of extreme rows. Those halves are descriptive checks; only the full original values are used for the exact finite source exclusions.

## Fully invertible native-text controls

[`sims/gp28_fibonacci_55x233_collision_gate.cjs`](../sims/gp28_fibonacci_55x233_collision_gate.cjs) constructs **four** independent tests: both source books under each of the two periods. It chooses **55 or 233 independent secret 28-way random permutations**, enciphers 12,815 actual source-GP28 symbols in their positions, reconstructs all **12,956** page-shaped GP29 runes while retaining the 86 exact original repeat-marker locations and 55 physical page IVs, and then completely recovers the secret GP28 plaintext using the synthetic inverses. All **four** plants recover **12,815/12,815** original source symbols and reproduce their exact source lag-collision counts. The original source fails these same necessary conditions without requiring any attempt to fit the permutations.

The script was run on the exact checked-in canonical corpus and both source texts, and all original, source-count, inverse and forward-encryption assertions passed.

## Inference and unresolved possibilities

This **rules out a direct repeating 55-state or 233-state one-to-one substitution of an intact, contiguous Shakespeare or Gibran GP28 source** and strongly contradicts the broader *ordinary GP-English* version measured by those control corpora. The key cannot rescue that exact model, even if every period column has its own otherwise unconstrained 28-way permutation.

This remains a **bounded conditional exclusion**, because a novel original text with near-uniform GP28 letter frequencies could satisfy the observed invariant. Source-specific alternative GP normalization, evolving keys that change the substitution even on a recurrence of the same residue, state-dependent transpositions, a keyed omission rule, plaintext EA appearing in the nonzero channel, direct binary intermediates, or any different semantic meaning of the 86 doublets are outside this theorem. The observed 55×233 factorization does not prove the author intended such an array, and the test makes no claim about the true full cipher.

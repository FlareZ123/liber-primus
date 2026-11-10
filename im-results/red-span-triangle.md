# A three-page red-ink pointer and prime-totient triangle

**Classification: new exploratory source-marked arithmetic relationship, with an exact conditional rotation-family probability. No unknown LP2 plaintext, key, cipher method, or destination has been recovered.** The relation was constructed *after* examination of the existing red-ink prime-sum crosslink, so even an extreme exact conditional probability is not a discovery-wide significance estimate.

## Source and complete arithmetic rule

Input: all **16 verified red-rune spans on physical LP2 pages 0–55**, as defined by `resources/liber-primus/lp2-ink-annotations.json`, and the original GP indices and prime assignments from `resources/liber-primus/lp2-corpus.json`. The red rune at physical page 53 offset 128 is `ᛏ`, included in its **51-rune** span. Page indices are zero-based physical LP2 indices; they do not omit runeless page 50.

For each red span `X`, let `S_X` be the sum of the GP **prime values** of its runes. Set `q_X=S_X/29` when the sum is divisible by 29, otherwise leave `q_X` undefined. Define a three-span *triangle* as any **ordered triple of distinct marked spans** `(A,B,C)` simultaneously satisfying:

1. `q_A = page(B)`, a pointer from a quotient to a physical page number.
2. `page(C) = GP_prime[q_A]`, interpreting `q_A` as a **zero-based** GP rune index in 0..28. Thus the same quotient also points to the physical page numbered by that rune's assigned prime.
3. `q_C = p_(q_B) - 1`, using the **one-based ordinary prime ordinal** `q_B`, and the prime-totient transform authenticated by solved LP2 page 56. The page-15 Fibonacci spiral independently includes `p_22=79` and its immediately following `p_35=149`.

Search *every* marked span as A, B, and C, retaining distinct spans; do not preselect the three matching pages. The original ciphertext produces **exactly one** triangle:

| Source | Physical page, red span offset | GP prime sum | Quotient | Exact role |
| --- | --- | ---: | ---: | --- |
| A | page **40**, offset 0, length 8 | **435** | **15** | `q_A=15` points to page 15; GP index 15 is `ᛋ`, with GP prime value **53** |
| B | page **15**, offset 0, length 9 | **638** | **22** | Fibonacci spiral's 22nd ordinary prime is **79** |
| C | page **53**, offset 128, length 51 | **2262** | **78** | `78 = 79-1 = φ(79)`, and physical page **53** matches the GP prime of rune index 15 |

This adds a new **page-index plus zero-based GP-prime pointer** to the earlier reported red prime-totient pair. It is a closed triangular relation with three source-selected red headings/passages, rather than an arbitrary rotation or unmarked subset selected to fit the numbers. No rule for applying these numbers as a keystream is known.

## Exact source-constrained rotation-family probability

The null independently and uniformly rotates each physical page's **entire rune sequence** by one of its page-length cyclic offsets. All original page rune inventories, red offsets, red lengths, and within-page relative positions remain fixed. Every red span on the same page receives the **same** rotation. Calculate each rotated window's GP-prime sum and rescan all ordered distinct-span triples under the unchanged three conditions above.

An exhaustive analytical reduction over all original spans and all possible individual page rotations establishes that only **three** triples can ever satisfy the rule under *any* such rotations. They all have B = page 15 offset 0, C = page 53 offset 128. Their allowed A sources are physical page 6 offset 71, page 33 offset 0, and page 40 offset 0. The first two are possible only on rotated, not actual, source pages.

The necessary exact quotient occurrences each have **one** satisfying cyclic offset:

| Page and span | Required quotient | Satisfying offsets / page length |
| --- | ---: | ---: |
| 6, offset 71 | 15 | **1/196** (rotation 65) |
| 33, offset 0 | 15 | **1/214** (rotation 201) |
| 40, offset 0 | 15 | **1/231** (rotation 0) |
| 15, offset 0 | 22 | **1/159** (rotation 0) |
| 53, offset 128 | 78 | **1/179** (rotation 0) |

The three A-source pages are mutually independent and independent of the two B/C pages under this null. Their events overlap only in the B/C prerequisite, giving an **exact probability** for *at least one qualifying triangle anywhere in the 16 marked spans*:

```text
P = [1 - (195/196)(213/214)(230/231)] / (159 × 179)
  = 22669 / 45960075084
  ≈ 0.0000004932324405
  ≈ 1 in 2,027,442
```

This is an *exact union probability under the fixed model*, stronger than the loose sum bound `4.955532954×10^-7` and more precise than a sparse Monte Carlo count. An independent three-million-manuscript xorshift32 rotation experiment, seed `0x33011553`, observed **1** matching surrogate. Its noisy count is consistent with this exact probability; the exact expression is preferred.

The already-selected original page-40/page-15/page-53 rotations alone have probability `1/(231×159×179)=1/6,574,491`. That targeted number must not be confused with the full 16-span family probability.

## Interpretation, falsification and next action

The source-defined input, exact GP arithmetic, and all-16-span family calculation are reproducible. **The choice to treat a red quotient as both a physical-page pointer and a zero-based GP-prime index was motivated by the observed numbers.** The page-15 spiral and solved page-56 totient transform predate this investigation, but the combined three-edge rule was not preregistered. Numerous alternative arithmetic constructions were historically examined. The exact tail is conditional on *this* post-selected rule and cannot establish authorial intent, actual encryption architecture, or an LP2 decryption.

The constructive next experiment is to infer a **single exact, reversible transformation** from the triangle's three independently marked sources, including an explicit use for the values 15, 22, 53, 79 and 78. Select the key schedule without fitting target ciphertext English, invert a fresh unsolved page, and show original-rune exact forward re-encryption. A number coincidence that does not predict unknown plaintext remains exploratory.

**Reproducer:** [single runnable Node.js 22 CommonJS script](../sims/red_span_triangle.cjs). It checks exact rune agreement with the original annotation, all eligible triples, rotation histograms, exact rational probability and the original triangle. It does not need a stochastic estimate.

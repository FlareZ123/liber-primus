# All-secret one-, two- and three-tap pagewise feedback capacity

**Classification:** exact original-cipher necessary-condition exclusion for a bounded reversible model family, with a source-native full-length positive control. **No unknown Liber Primus plaintext, authentic key, historical cipher or destination has been recovered.**

## Source-motivated hypothesis and strongest objection

The unsolved second release has only **86 adjacent equal ciphertext rune pairs among 12,956 runes**, a strong observable feature that could be explained by a previous-ciphertext-dependent encoder. The original sources do **not** specify a first-, second- or third-order GF29 autoregression. This is an exploratory cipher-family test, not a claim about the author's chosen operation. Unlike a search over selected keys, the following necessary condition grants the decoder **all possible secrets independently on every source page**.

For each of the 55 nonempty physical ciphertext pages, let GP runes be F29 residues, `sigma_p` be *any* 29-symbol bijection, and all `b_{p,t}` be independently arbitrary elements of F29. For tap count `m=1,2,3`, the candidate encoder is

```text
C[p,j] = sigma_p(P[p,j]) + sum(t=1..m) b[p,t]*C[p,j-t] (mod 29)
                                                j >= m
```

Each physical page resets its register; the first `m` plaintext positions on **every** page are granted adversarially free. The model covers completely unknown nonlinear symbol *substitutions*, since `sigma_p` may be any of the 29! permutations, even though feedback in the **observed ciphertext register** is linear. It includes the earlier global first-difference model as a strictly narrower special case. Words, lines, red/black ink and punctuation do not cause extra resets within these pages.

## Exact, all-secret capacity proof

For any coefficient vector on a given page, form the **observed** residuals

```text
D[p,j] = C[p,j] - sum(t=1..m) b[p,t]*C[p,j-t] (mod 29), j>=m.
```

Under the candidate cipher these must equal `sigma_p(P[p,j])`. An arbitrary permutation can rename residual values but **cannot change their multiplicities or combine two distinct plaintext runes into one residual value**.

For a fixed plaintext rune, e.g. `E`, its page-internal count therefore cannot exceed the largest one of the 29 residual bins. For a fixed pair of distinct plaintext runes, e.g. `E` and `O`, the count cannot exceed the *sum of the two largest distinct residual bins*. Enumerate **all 29^m coefficient tuples independently for every page** and take the most favorable histogram for each bound. Finally grant the first `m` runes of each page to those target plaintext labels without restriction:

```text
U_k(m) = 55m + sum_{p=1}^{55}
           max_{b in F29^m} [sum of k largest distinct bins of D_p(b)]
```

This upper bound is exact for the displayed statistic, and the extremum is independently selected per page, not constrained by another page's true alphabet or coefficient vector.

The canonical, original 55-page ciphertext produces:

| Number of previous ciphertext taps | Secret coefficient choices **per page** | Maximum total E | Maximum total E+O | Free page-initial runes |
|---|---:|---:|---:|---:|
| **1** | 29 | **1,048** | **1,842** | 55 |
| **2** | 841 | **1,299** | **2,104** | 110 |
| **3** | 24,389 | **1,489** | **2,348** | 165 |

The first-order E bound extends the earlier globally fixed `beta=1` first-difference gate (whose largest residual class had 510 members). The second- and third-order results close genuinely larger all-secret cipher families. For three taps the **single-letter** E bound alone has become inconclusive; the **two-letter joint capacity remains decisively restrictive**.

## Native-GP plaintext controls

The [standalone SFT](../sims/lp2_pagewise_feedback_anyalphabet_capacity_sft.cjs) uses the already-pinned GP rune tokenizer and controls. In **all three reference corpora, E and O are independently the two most frequent GP rune identities** across the complete source. Neither alphabet labels nor the source window are optimized from the original ciphertext. The scan then finds the *minimum* occupancy of these fixed two letters in **every contiguous original-length window of 12,956 GP runes**:

| Source | GP runes available | Minimum E in any 12,956-rune window | Minimum E+O in any window |
|---|---:|---:|---:|
| Gibran, *The Prophet* | 63,114 | 1,407 | **2,556** |
| Shakespeare sample | 218,800 | 1,397 | **2,430** |
| Emerson essays | 324,630 | 1,482 | **2,455** |
| **Original LP2 direct inverse under any three-tap/page alphabet** | **12,956** | at most 1,489 | **at most 2,348** |

Even after maximally favorable **55 independently chosen secret alphabets and 55 independently chosen triples of feedback coefficients**, original ciphertext cannot supply the **E+O frequencies** in *any* of these source-native English windows. The shortest gap is **82 runes**, relative to the least concentrated Shakespeare window. Orders one and two fail by larger margins. This bound uses both within-word and across-word original ciphertext without fitting a source-language model or guessed key.

For a positive power check, the SFT picks 12,956 native-GP Gibran symbols, preserves all 55 page lengths, encrypts each page with a different deterministic secret permutation and a different three-tap feedback triple, then exactly decrypts and checks **all 12,956 symbols**. It checks that the planted first page also passes the blind all-secret capacity bound. The reversible plant verifies implementability and absence of an automatic rejection of a genuine instance; the known seed and English passage are not historical key material.

## Decision and remaining route to plaintext

**Reject directly decoded, unmodified GP-English for every page-stationary `m=1,2,3` linear ciphertext-feedback cipher with arbitrary independent pagewise 29-symbol substitution alphabets and unrestricted page-initial ciphertext state.** The proof is exact for the specified family and the three finite native reference sources. The significant conclusion is the order-3 joint letter bound; do not generalize the result to every conceivable English composition.

A hypothetical four-or-more-tap register, state updates within pages, nonlinear feedback, a changed intermediate alphabet, explicit escapes, transpositions that change the source sequence, or ciphertext carrying nonprose bytes is **outside** this theorem. None should be promoted to an authentic LP2 route without independent original clues selecting its state/key and supplying a withheld original-text prediction. The original doublet suppression remains unexplained.

This consolidates the earlier one-tap work rather than repeating its independent report. The [earlier global first-difference gate](lp2-difference-allletter-capacity-source-gate.md) additionally addresses zero-marker word positions and has separate matched language controls. The present three-tap theorem is the new scope extension, with original-source enumerations and exact positive in the [CommonJS reproducer](../sims/lp2_pagewise_feedback_anyalphabet_capacity_sft.cjs).

**Inputs:** [original rune corpus](../resources/liber-primus/lp2-corpus.json), [Gibran](../resources/control/gibran_prophet_58585.txt), [Shakespeare](../resources/control/shakespeare_first300k.txt), and [Emerson](../resources/control/emerson_essays_2944.txt).

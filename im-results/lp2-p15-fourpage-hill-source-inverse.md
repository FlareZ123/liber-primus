# Original p15 matrix across four following physical pages: direct inverse gate

**Status, 13 November 2026:** original-source-selected four-lane cipher interpretation tested; no recovered plaintext or key. This is independent of the already excluded *within-page consecutive four-rune block Hill cipher*.

## Human-observable premise and reversible rule

Physical LP2 p15 (scan 32.jpg) prints the 4×4 number matrix

```
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

A solver might read this as a four-channel mixer applied to the *next four physical pages* p16, p17, p18 and p19. At rune offset t, take one rune from each of those four pages to form a 4-vector `C_t`. The printed square `M` has inverse modulo 29

```
19  1  6  3
11  7  8 22
 2 10 15 28
25  4  1 15
```

so a candidate GP29 plaintext is `P_t = M^-1 C_t (mod29)`. Since the manuscript does not specify whether its square encrypts/decodes, or whether vectors are rows/columns, the four **source-predeclared** reversible conventions are `M`, `M^T`, `M^-1`, and `(M^-1)^T`. **No permutations of page ordering or fitted keys** are searched.

The page lengths are **[267,273,260,271]**, so the test takes their first 260 strictly aligned original GP runes, yielding **1,040 candidate plaintext runes** per convention. This interpretation can survive the earlier all-secret within-page block collision exclusion because it mixes runes between four pages rather than substituting each consecutive four-rune block on one page.

## Direct result and language comparison

A fixed source-native Shakespeare GP29 trigram model was trained on 217,106 runes using the independent solved-LP1-calibrated ING/IO spelling. The source model's in-sample score is **−2.2631 nats/rune**, while the original pp16–19 ciphertext lanes score approximately **−3.976, −3.884, −3.959, −3.876**. The complete candidate inverses remain near those ciphertext scores:

| Page-axis operator applied to original | Mean trigram log score, nats/rune | Finding |
|---|---:|---|
| `M^-1` | −3.9603 | Nonlinguistic |
| `(M^-1)^T` | −3.9946 | Nonlinguistic |
| `M` | −3.9694 | Nonlinguistic |
| `M^T` | −3.9639 | Nonlinguistic |

No candidate produces authentic English runes. Independent source-native planted cleartext in four lanes is transformed with the printed matrix and exactly recovered by its inverse, **1,040/1,040 original-register runes** in both row/column orientations. Thus failure on LP2's original ciphertext is not a matrix-inversion or lane-order implementation failure.

## Decision

Retire the **simple, page-aligned, exact-next-four-pages, direct four-lane Hill operation** under its four natural row/column cipher/decrypt conventions. The original page15 square by itself gives no human-visible support for an arbitrary shifted page register, key evolution, per-word clock, or other complex rescue. The experiment does not exclude differently chosen, source-justified page quartets or additional independent transformations; those require new observable clues. No cryptographic plaintext or original-author key was recovered.

**Reproduce** using [`sims/lp2_p15_fourpage_hill_direct_inverse_sft.cjs`](../sims/lp2_p15_fourpage_hill_direct_inverse_sft.cjs), a standalone Node.js 22 CommonJS self-test reading checked-in original ciphertext, the literal p15 square, and independent native English controls. A successful regression also checks the exact 4×4 field inverse and both row/column synthetic round trips.

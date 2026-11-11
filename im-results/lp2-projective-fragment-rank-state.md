# Projective marker states as PATIENCE transducer fragment initializers

**Classification:** bounded source-constrained negative. No unknown LP2 plaintext or key was recovered.

## Human solve-path hypothesis

The p3 red triad `[13,23,2]` gives `u²=3u+8` over GF(29). The element `u` is primitive of order840, so multiplication by `u` induces a projective action of order30 on `P¹(F29)`, with matrix `Mu=[[0,8],[1,3]]` in the chart `x=a/b`. The enlarged p54 rune Ac24 supplies a visible start.

The ink corpus has **31 marker layers, 30 distinct page-local annotations, but only 29 distinct global rune offsets**. The p7 black/red overprint and the p14:137 / p15:0 page-boundary pair each share one global offset. Together they create two zero-length intervals among the 32 fragments, leaving **30 nonempty fragments**. A natural 30-state construction therefore assigns one projective state to each of the 29 distinct marker boundaries and the 30th state to the terminal fragment; both layers at a duplicated global boundary reuse the same state.

This is a motivated but unproven human solve path: the manuscript does not explicitly say that the projective orbit should initialize a cipher state. The experiment tests that exact operation without searching phases, row permutations, seeds, or language-fitted parameters.

## Corrected global-offset schedules

The p3-selected generator orbit from Ac24 is:

```text
24,25,21,10,14,9,20,18,28,4,26,∞,0,22,27,8,6,17,12,16,5,1,2,19,3,11,13,15,23,7
```

Collapsing both duplicated global offsets, assigning the first 29 orbit states to the 29 global marker boundaries, and assigning the 30th state to the terminal fragment gives the corrected u row schedule:

```text
[24,25,21,10,14,9,20,18,18,28,4,4,26,29,0,22,
 27,8,6,17,12,16,5,1,2,19,3,11,13,15,23,7]
```

The repeated rows are exactly the two empty intervals. The 30 nonempty fragments receive 30 distinct states. The competing `z=23+27u` comparison gives:

```text
[24,22,13,4,2,9,12,25,25,27,15,15,26,19,20,16,
 21,8,23,29,3,18,5,10,6,7,0,11,28,1,14,17]
```

**Supersession note:** the earlier page-local schedule treated p14:137 and p15:0 as distinct sites and assigned them different states, then used fixed row31 for the terminal fragment. That was the wrong physical-boundary interpretation. The corrected reproducer deduplicates by global rune offset and uses the 30th orbit state for the terminal fragment; all results below use this corrected schedule.

## Transducer and result

Each original 32×8 grid row defines a 29-symbol bijection by sorting its bytes in fixed PATIENCE order `[6,5,3,0,2,4,7,1]`. The predecessor-exclusion rank uses the previous ciphertext rune; the next state is the low five bits of the selected table byte. The projective row state resets at each of the first 28 fragments. The primary model carries predecessor context across boundaries; one alternative resets the predecessor to zero. The speculative z schedule is tested with continuous predecessor context. No phase, row permutation, seed or language-fitted parameter is searched.

| Model | IoC | Top-12 mass | Shakespeare GP trigram |
|---|---:|---:|---:|
| Raw p0–p55 | 0.03447840 | 0.429762 | −4.45015 |
| corrected p3-u schedule, predecessor continuous | 0.03458329 | 0.437712 | −4.47791 |
| corrected p3-u schedule, predecessor reset0 | 0.03458310 | 0.438098 | −4.47747 |
| corrected speculative z schedule, predecessor continuous | 0.03460040 | 0.439333 | −4.47604 |
| Shakespeare GP heldout | 0.05983232 | 0.771303 | −2.30601 |

All candidates remain ciphertext-like; scores are worse than raw ciphertext and far below the independent English holdout. Original forward replay and 12,956-rune Shakespeare plants recover exactly under every model. This validates the implementation, not the hypothesis.

## Decision

Reject the exact **projective marker state → PATIENCE rank/state fragment initializer** for both the p3-selected u orbit and speculative z orbit. This does not reject the field construction, the marker correspondence as a map, other uses of the thirteen-dot marks, or non-GP mechanisms. Do not repeat these schedules with cosmetic offsets or phase searches.

Reproducer: [`sims/lp2_projective_fragment_rank_state_sft.cjs`](../sims/lp2_projective_fragment_rank_state_sft.cjs).
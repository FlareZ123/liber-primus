# Projective marker states as PATIENCE transducer fragment initializers

**Classification:** bounded source-constrained negative. No unknown LP2 plaintext or key was recovered.

## Human solve-path hypothesis

The p3 red triad `[13,23,2]` gives `u²=3u+8` over GF(29). The element `u` is primitive of order840, so multiplication by `u` induces a projective action of order30 on `P¹(F29)`, with matrix `Mu=[[0,8],[1,3]]` in the chart `x=a/b`. The enlarged p54 rune Ac24 supplies a visible start. The 31 thirteen-dot marker layers occupy 30 unique sites, matching `|P¹(F29)|=30`. A human could try assigning the 30 projective orbit states, in physical marker order, to those sites and using the resulting state as the initial row of a cipher at each fragment boundary.

This is motivated but not proven: the manuscript does not explicitly say that the projective orbit initializes a cipher state. That is the weakest assumption tested here.

## Frozen schedules

The p3-selected generator orbit from Ac24 is:

```text
24,25,21,10,14,9,20,18,28,4,26,∞,0,22,27,8,6,17,12,16,5,1,2,19,3,11,13,15,23,7
```

Mapping the 30 unique sites in physical order, assigning row30 to the p7:194 black overprint and row31 to the trailing fragment, gives:

```text
[24,25,21,10,14,9,20,30,18,28,4,26,29,0,22,27,
 8,6,17,12,16,5,1,2,19,3,11,13,15,23,7,31]
```

The first 28 fragments cover exactly 12,956 unknown runes; the last four cover the solved p56/p57 tail. The two empty fragments arise from the p7 black/red overprint and the p14/p15 boundary pair.

The competing `z=23+27u` orbit, with `Mz=[[23,13],[27,17]]`, yields `[24,22,13,4,2,9,12,30,25,27,15,26,19,20,16,21,8,23,29,3,18,5,10,6,7,0,11,28,1,14,17,31]`. **Source correction:** z is an exact primitive table-polynomial root, but its claimed selection via p3/p39 cross-mark offsets is not established after corrected global offsets. Treat this as a comparison, not a source-selected element.

## Transducer and result

Each original 32×8 grid row defines a 29-symbol bijection by sorting its bytes in fixed PATIENCE order `[6,5,3,0,2,4,7,1]`. The predecessor-exclusion rank uses the previous ciphertext rune; the next state is the low five bits of the selected table byte. The projective row state resets at each of the first 28 fragments. The primary model carries predecessor context across boundaries; one alternative resets the predecessor to zero. The speculative z schedule is tested with continuous predecessor context. No phase, row permutation, seed or language-fitted parameter is searched.

| Model | IoC | Top-12 mass | Shakespeare GP trigram |
|---|---:|---:|---:|
| Raw p0–p55 | 0.03447840 | 0.429762 | −4.45015 |
| p3-u fragment state, predecessor continuous | 0.03459460 | 0.438484 | −4.47131 |
| p3-u fragment state, predecessor reset0 | 0.03459300 | 0.438098 | −4.47019 |
| speculative z fragment state, predecessor continuous | 0.03458739 | 0.438253 | −4.47339 |
| Shakespeare GP heldout | 0.05983232 | 0.771303 | −2.30601 |

All candidates remain ciphertext-like; scores are worse than raw ciphertext and far below the independent English holdout. Original forward replay and 12,956-rune Shakespeare plants recover exactly under every model. This validates the implementation, not the hypothesis.

## Decision

Reject the exact **projective marker state → PATIENCE rank/state fragment initializer** for both the p3-selected u orbit and speculative z orbit. This does not reject the field construction, the marker correspondence as a map, other uses of the thirteen-dot marks, or non-GP mechanisms. Do not repeat these schedules with cosmetic offsets or phase searches.

Reproducer: [`sims/lp2_projective_fragment_rank_state_sft.cjs`](../sims/lp2_projective_fragment_rank_state_sft.cjs).
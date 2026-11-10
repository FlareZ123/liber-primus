# Reversible GP field-unit ciphertext feedback: original LP2 inversion

**Evidence:** one executed source-constrained, heldout-original negative test. **No unknown Liber Primus plaintext or authentic key recovered.** This research explicitly inverts the original ciphertext rather than fitting a forward-only repeat filter.

## Mechanism and a unique plaintext prediction

For a GP runic stream interpreted in F29, let `D_i=(C_i-C_{i-1}) mod29`. The observed scarcity of `D_i=0` motivates a reversible alphabet with 28 nonzero steps and a rare transparent symbol EA (GP index28). For each page-local i≥6, hypothesize:

```text
K_i = (a*f(C-history) + b*g(C-history) + d) mod28
D_i = 0                             if P_i == EA(28)
D_i = 15^((P_i + K_i) mod28) mod29  otherwise
P_i = EA(28)                        if D_i == 0
P_i = (log_15(D_i) - K_i) mod28      otherwise
```

The GP-source-linked element 15 has order28 in F29. All nonzero steps are unique, so the inverse is exact for a given ciphertext-history key, and no plaintext is guessed at repeated ciphertext positions. Physical page IV positions 0–5 are outside the tested model.

## Finite original-cipher search

With ciphertext features `prev=C[i-1]%28`, `prev2`, `prev5`, `prev6`, `delta=(C[i-1]-C[i-2])%28` and `index=i%28`, enumerate these **eleven prespecified pairs**:

```text
(prev,prev2) (prev,prev5) (prev,prev6) (prev2,prev5)
(prev5,prev6) (prev,delta) (prev,index) (prev2,index)
(prev5,index) (prev6,index) (delta,index)
```

For each pair enumerate all 28³=21,952 coefficient triples (a,b,d), both forward and reverse within-page reading, giving **482,944** specified invertible original inverse candidates. Scores are GP-Shakespeare non-EA unigram log-likelihood *excess over uniform1/28*, trained independently from the first 100,000 encoded GP source runes. Select by the first 27 physical rune-bearing LP2 pages; freeze key and evaluation on the remaining 28. Source text is 218,800 GP runes. The exact ciphertext is 55 rune-bearing unsolved pages, 12,956 symbols. The 86 page-local zero steps are mapped to EA without key fitting.

| Candidate selected on original training | Train excess (nats/nonzero step) | Heldout excess |
| --- | ---: | ---: |
| Forward, (prev,index), a=10,b=21,d=9 | **−0.792549** | **−0.883367** |
| Forward, (prev5,index), a=7,b=23,d=2 | −0.795818 | −0.901940 |
| Forward, (prev,prev6), a=16,b=3,d=15 | −0.803995 | −0.890002 |
| Reverse, (prev2,index), a=15,b=13,d=8 | **−0.786265** | **−0.912913** |
| Reverse, (delta,index), a=19,b=6,d=7 | −0.800798 | −0.848206 |

All 11 selected forward feedback models have *negative* heldout source-language excess. The corresponding 11 reverse models also fail; their top original training score declines sharply on heldout. The source-family best direction and model were selected from the original training pages, so these figures are descriptive rather than an independent global-null significance estimate.

## Mechanism-sensitive positive control

A disjoint authentic-English GP source, matched exactly to the 55 original physical page lengths, was encrypted using the same reversible architecture with a hidden source-independent setting: features (prev,prev6), a=7,b=11,d=5. Exactly roundtripping the ciphertext recovers **every modelled post-IV source rune**, including zero-step EA runes. Without supplying the hidden coefficients, the matching search selected **the exact (7,11,5)**, yielding training excess **+0.386149** and heldout excess **+0.362240** nats per nonzero step. The independently trained source theoretical expected excess was **+0.408764**. Positive recovery establishes that the declared inverse and its language criterion can recover a genuine key if present.

## Interpretation

Direct, low-dimensional affine ciphertext-history keys using the eleven specified source-compatible feedback feature pairs do **not** decrypt the original LP2 nonzero differences into ordinary English GP runes. This includes models with lag-six and page-local positional feedback, but it does not exclude more complex key schedules, changing symbol alphabets, unknown page IV initialization, alternate text registers, or hidden-state methods.

The exact fixed-key original source test and its source-disjoint planted positive can be reproduced by [`sims/field_unit_feedback_inverse.cjs`](../sims/field_unit_feedback_inverse.cjs) (Node22, CommonJS). No workflow is created for this bounded result.

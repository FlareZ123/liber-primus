# p0 13-state linear transition: source-locked negative

## Question

Does the opening p0 structure encode a single reversible 13-dimensional state machine over the 29-symbol rune field?

This is a bounded, human-plausible hypothesis rather than a generic recurrence sweep:

- p0 begins with a 13-rune red title.
- The original page places a 13-dot mark at the title boundary.
- The first black rune is TH (GP29 index 2), which can be treated as a one-symbol start sentinel.
- The p0–p2 opening stream then contains 715 remaining runes, exactly (55\times13).

A natural reading is a 13-symbol initial state (the red title), followed by 55 successive 13-symbol states. The 55 count also matches the other LP2 pages p1–p55, although the 55 rows are a continuous opening-stream partition and are not aligned to page boundaries. The source does not establish that the rows are states; this experiment tests that specific interpretation.

## Frozen model

Let (s_0) be the 13 GP29 indices in the p0 red title. Remove the first black TH sentinel from the concatenated p0–p2 rune stream after the title, then split the remaining 715 symbols into 55 row-major vectors (s_1,\ldots,s_{55}\in GF(29)^{13}).

Test one fixed linear transition:
[
s_{t+1}=s_t A\pmod{29}
]
for a single (13\times13) matrix (A).

Fit (A) uniquely from the first 13 transitions (s_0\to s_1,\ldots,s_{12}\to s_{13}). This uses a full-rank 13-state design matrix. Freeze (A), then test the remaining 42 transitions (s_{13}\to s_{14},\ldots,s_{54}\to s_{55}). No language model, search over matrix families, per-row key, or fitted holdout parameter is involved.

## Result

**Outcome: rejected.**

| Measurement | Result |
|---|---:|
| Initial title / state width | 13 |
| First black sentinel | TH (index 2), excluded |
| Payload | 715 symbols = 55 × 13 |
| Fitting transitions | 13 / 13 exact by construction |
| Training matrix rank | 13 |
| Training matrix determinant | 19 mod 29 |
| Fitted transition matrix determinant | 25 mod 29 (invertible) |
| Held-out transitions | 0 / 42 exact |
| Held-out symbol matches | 19 / 546 |
| Random-coordinate match expectation | 546 / 29 = 18.83 |

The first held-out transition fails in all 13 coordinates. Across the 546 held-out coordinates, only 19 match the prediction, essentially the random expectation. The fitted `A` is invertible, so the failure is not caused by an accidentally singular transition.

**Decision:** the 13-rune title plus 55×13 opening does not form a single fixed linear state trajectory over `GF(29)`. This rejects the specific linear-register interpretation; it does not establish a different receiver and does not decrypt any LP2 page.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_p0_13state_linear_transition_gate.cjs
```

The script reads the original-derived canonical GP29 corpus, asserts the 13 + 1 + 715 source partition, fits `A` over `GF(29)`, and prints the full matrix and held-out mismatches.

## Relation to existing work

The existing [p0 Cistercian / 55×13 partition report](lp2-p0-cistercian-staves-totient-partition-hypothesis.md) already tests direct per-page Vigenere, keyed-alphabet and OTP uses of the rows. The [13×55 matrix gate](../sims/lp2_p0_13x55_matrix_gate.cjs) tests row/column OTP and row-key receivers. This report tests a different, specific possibility: one global linear transition from the red title through successive 13-symbol states.

The state interpretation remains unproven; no nonlinear or page-specific extension is justified by this failed test alone.

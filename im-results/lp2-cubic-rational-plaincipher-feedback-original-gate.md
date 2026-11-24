# Complete cubic rational GF29 plaintext/ciphertext feedback recovery

## Purpose

The previous quadratic finite-ciphertext-history inverse does not cover a true plaintext autokey. Original p15's Fibonacci-prime illustration makes a recurrence a reasonable mathematical hypothesis, although prior #2374 fixed Fibonacci plaintext recurrence did not decode the unknown text. Rather than try more hand-selected Fibonacci coefficients or seeds, recover the entire order-at-most-three mixed autoregressive inverse family.

```
P_i = b0*C_i + b1*C_(i-1) + b2*C_(i-2) + b3*C_(i-3)
      + a1*P_(i-1) + a2*P_(i-2) + a3*P_(i-3) + d   mod 29
```

with b0 nonzero and arbitrary initial plaintext state. No literal-F bypass, no page/chapter reset, continuous tape and preserved word boundaries. This is a testable architecture, not an authenticated instruction. Earlier first-order reciprocal-feedback and fixed Fibonacci gates are strictly contained in this wider model.

## Algebraic attack

Enumerate every denominator triple A=(a1,a2,a3), including all lower orders, total 29^3=24,389. For each, define impulse response h with h0=1 and preceding zero, filtered ciphertext F and cumulative impulse G:

- F_i=C_i+sum A_j F_(i-j)
- h_i=delta_(i,0)+sum A_j h_(i-j)
- G_i=sum_(t<=i) h_t.

For fixed A, plaintext is a linear combination of four shifted F sequences, G and k shifted h sequences, where k is the effective denominator order. The coefficients of the first k impulse responses encode arbitrary initial state. They span it because the companion recurrence is invertible when a_k != 0. Unknown dimension is 5+k, at most 8. This avoids enumerating the numerator, additive constant or initial state; even the affine labeling of the singleton pair is unknown.

Freeze original training pp0–39, 9,640 runes, 68 singleton positions; pp40–55 (3,316 runes) untouched. Conditional on at most four exceptions to two dominant singleton types, affine-normalize those types to 0/1. Every denominator has five disjoint full-rank singleton bases on the actual data. At most four contaminated sites leave one whole basis clean. Enumerate all binary assignments on each basis modulo output complementation, reconstruct the coefficients, check every additional singleton equation for <=4 exceptions, and require b0 != 0. Full rank was directly confirmed for every denominator; there is no unexamined nullspace or uncovered denominator. If a candidate exists, freeze its best affine label using independent bigram likelihood on training only and decode the untouched suffix. All source-native features preserve exact GP29 order.

## Original outcome and blind positive

| Input | Denominator triples | Normalized assignments | Candidates | Uncovered denominators |
|---|---:|---:|---:|---:|
| Original LP2 | 24,389 | 15,335,120 | 0 | 0 |
| Independent Gibran plant | 24,389 | 15,335,120 | 1 | 0 |

Original rank counts: 1 of rank5, 28 rank6, 812 rank7, 23,548 rank8, all full for their model. The original has no invertible coefficient tuple satisfying the singleton assumption. There is no candidate to freeze; do not claim an original held-out plaintext test.

Plant: genuine contiguous second-half Gibran text converted using the same independent native GP procedure, first 68 singleton sites define 10,721 training runes, 1,906 untouched continuation. True denominator [5,11,7], numerator/constant/start impulses [13,2,17,9,18,7,22,15]. Full search yields exactly one normalized candidate, then first-half Gibran bigram score recovers all 11 coefficients (including denominator and all initial impulse terms) exactly. Correct plaintext 12,627/12,627, heldout 1,906/1,906, exact full-tape reencryption. No parameter retuning. The five clean basis hits deduplicate to one normalized candidate. Training/heldout IoC .06066602/.05964477.

Actual original and positive scans performed in V8 on fetched repository sources, in consecutive explicit ranges; all denominators covered. The initial original 0..999 used the algebraically equivalent full subset-sum table before the half-sum acceleration. The preserved output records every range, elapsed execution time, ranks, and positive key. The standalone CJS reproduces either the entire scan or bounded ranges.

**Decision:** retire this complete degree-three rational feedback model, including arbitrary initial conditions and any fixed outer bijection of the latent decoded symbols, under the explicit singleton dominance/space assumptions. A different plaintext segmentation, F bypass, nonlinear denominator, or different per-chapter coefficients is outside this result. No unknown plaintext or authentic key recovered. Do not use this as permission to enumerate arbitrary higher-order recurrences without independent evidence.

- [CJS](../sims/lp2_cubic_rational_plaincipher_feedback_sft.cjs) (arguments original|plant, start inclusive, end exclusive)
- [Actual output](lp2-cubic-rational-plaincipher-feedback-output.json)

# Cumulative ciphertext GP29 state: exact projective row-map capacity

**26 November 2026, Agent6.** No unknown plaintext or authentic key. An exact all-key obstruction for a length-preserving cumulative public-state receiver, including every arbitrary secret row substitution, not merely the directly proposed arithmetic shifts. This complements the previous [two-local-lag receiver](lp2-two-cipher-lag-projective-scalar-capacity.md) and the [plaintext-dependent cumulative GP-prime state](lp2-cumulative-gpprime-state-gate.md); neither uses this cumulative ciphertext state.

## Source and reversible mechanism

The authentic prime chart, the solved statement that primes and totients are sacred, and the instruction concerning words and their numbers motivate a running sum of original GP prime values. This does not select the mechanism historically. Let A, B, T be the sums modulo 29 of the previous ciphertext ordinals, their GP primes minus one, and the number of previous runes, respectively; all start at zero. Let X be the preceding ciphertext rune (zero initially). At each rune c define

    s = u*A + v*B + w*T mod29
    z = c + r*X mod29
    P = pi_s(z)

where every pi_s is an arbitrary independent permutation of 29 symbols. Update A <- A+c, B <- B+GPprime(c)-1, T <- T+1, X <- c. A decoder can recover all state from the original ciphertext, and an encoder solves c=pi_s^{-1}(P)-r*X before updating. We allow either a continuous chapter clock or reset all four registers to zero at each physical page. Printed word boundaries are irrelevant. GP-prime rather than GP-prime-minus-one sums are included by changing w. Arbitrary state translation and nonzero scalar multiplication merely relabel rows. Nonzero (u,v,w) projectively normalizes to (1,v,w), (0,1,w), or (0,0,1), giving 871 state classes. The zero vector is contained by identical rows. All 29 residuals are retained: 25,259 classes per reset policy. State-dependent output translation/scaling is absorbed by each arbitrary permutation.

## Exact original decision

For any fixed public-state class, count M[s,z] on original p40–53. For any two plaintext symbols, at most the two largest counts of each row can map to them. The sum over all rows is attainable and therefore an exact maximum over every secret table. Its maximum over the complete normalized class register is:

| Register clock | All residuals | r=0 only | r=-1 only | Attaining class (u,v,w,r) |
|---|---:|---:|---:|---|
| Continuous | 469 | 458 | 469 | (1,25,9,28) |
| Physical page reset | 468 | 457 | 465 | (1,6,27,9) |

The original chapter contains 3,008 runes, 13 rune-bearing physical pages, p50 empty. No page heads are discarded. The finite literary control comparison uses the identical GP tokenization as the two-local-lag gate, but the complete stride-one windows:

| Native control | Windows | Minimum top-two count | Windows <=469 |
|---|---:|---:|---:|
| Gibran | 59,485 | 563 | 0 |
| Shakespeare | 214,099 | 518 | 0 |

Thus **0/273,584** contiguous length-matched donor windows are compatible. This is an exact original bound conditional on the stated receiver and native donor register. It is invariant to plaintext reordering or changed separators, since the necessary comparison uses only whole-chapter counts. It rejects the receiver even with chapter-private coefficients and secret rows, but does not reject arbitrary two-dimensional state, unrelated nonlinear projections, unknown state weights, page-private substitution tables, alternate non-native registers or additional transforms.

## Implementation controls and source pins

Three independently seeded full 3,008-rune plants using random secret row permutations replay and invert exactly (9,024/9,024 native runes). True top-two counts 580,611,614 are below respective row capacities 723,702,701. The first uses literal prime sum, the other two use the two original maximizing classes with distinct reset policies. These are known-key implementation controls, not blind key recovery.

Canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85. [Reproducer](../sims/lp2_cumulative_cipher_projective_capacity_sft.cjs), command from repo root: node sims/lp2_cumulative_cipher_projective_capacity_sft.cjs. Numerical core executed in connected V8 in two stages (original scan and donor/control); no standalone Node or CI run claimed. Do not expand into arbitrary weight searches absent an independently selected state law. No new key or unknown-page plaintext.

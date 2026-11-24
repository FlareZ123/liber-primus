# Full quadratic five-predecessor feedback: exact singleton-cover key recovery

The original suppressed adjacent equality and excess lag-five within-word echoes motivate a changing five-rune ciphertext state. The historical finite-field arithmetic and original p39 quadratic make a quadratic update a plausible exploratory family, not a creator-authenticated operation. This is a genuinely identifiable nonlinear inverse, outside the earlier fixed cubic/sparse reciprocal/linear and block-matrix families:

    P_i = a C_i + sum_{j=1}^5 b_j C_{i-j}
          + sum_{1<=j<=k<=5} q_jk C_{i-j} C_{i-k} + d mod 29.

All 22 coefficients unknown; a != 0 ensures unique forward recovery of C_i from P_i and previous ciphertext. Continuous source stream, printed words preserved, no transparent-F or page resets. Any IV affects only the first five decoded runes; leave them out and use actual first five ciphertext runes for exact suffix replay. Original pp0–39 (9,640 runes, 68 eligible one-rune words) locked as training; pp40–55 (3,316 runes) withheld.

## Exact all-key recovery with four exceptional singleton words

Assumption: at least 64 of the 68 training singleton plaintexts occupy at most two distinct symbols; the other four are unrestricted. This includes usual A/I but neither their identities nor order is assumed. Normalize any two dominant symbols to 0 and 1 by an affine output map, which preserves the model. For each singleton the known ciphertext gives one GF29 row of 22 features. Partition the 68 positions into six disjoint groups of 11 or 12 rows, such that every pair union has full rank 22. A deterministic seeded partition search finds such a partition on actual original data and both plants. Select one rank-22 basis in each of the 15 pair unions.

At most four exception sites can contaminate at most four groups. Thus at least two groups are clean, and one of the 15 chosen full-rank bases is clean for **every possible set of up to four exceptions**. Exhaust every binary basis output vector up to the global 0↔1 complement, 2^21 assignments per basis. Split 11+11 bits and precompute all subset sums for the 46 remaining equations; check at most four output values outside {0,1}. Recover coefficients by basis inverse; reject a=0. The complement reduction is exact. Deduplicate normalized coefficient vectors. For every surviving key enumerate all 812 affine output labels and maximize bigram likelihood trained on independent first-half Gibran GP prose, then apply the frozen key to untouched text.

This is not a probabilistic fit or sampled key search: the basis cover is a combinatorial completeness certificate for the precise two-dominant-types/four-exceptions assumption. The unknown 22-coefficient key space is nominally 28×29^21. All 31,457,280 normalized assignments per tape are actually evaluated.

## Results

Actual execution of the saved CJS logic against repository sources, 52.358 s total.

| Tape | Surviving normalized keys | Training exact | Heldout exact |
|---|---:|---:|---:|
| Original pp0–39 | **0** | — | no key to freeze |
| Genuine contiguous second-half Gibran prose | 1 | 10,716/10,716 | 1,906/1,906 |
| Exact original word-length-profile positive, four deliberately exceptional T singleton symbols, independent full solved-native tail | 1 | 9,635/9,635 | 2,979/2,979 |

Original every basis has exactly one surviving assignment before the invertibility filter: the constant all-zero normalized output. Its current coefficient is zero; there is no invertible candidate. Every planted coefficient (all 22) is recovered exactly, including the arbitrary symbol labels, with no planted key supplied to the solver. Both complete post-IV plaintexts replay exactly. The second positive specifically verifies robustness to all four allowed exceptional symbols. Its training words are sampled, not represented as a coherent historical passage; its withheld tail is actual solved native GP text.

Language assumption is scoped: the actual solved-native corpus's 28 singleton fragments comprise 19 A, 8 I and 1 T, and the selected genuine Gibran train contains 50 A and 18 I. A distinct contiguous Shakespeare diagnostic has 35 I, 20 A, 9 O and 4 G, outside the four-exception model, so the result does not exclude all native prose or alternative segmentation. Nor does it exclude more-than-quadratic functions, longer history, evolving coefficients, plaintext-dependent state, or a time-varying outer output substitution. The negative **does also include any one arbitrary stationary outer bijection** of the 29 decoded symbols: pulling the two dominant singleton types through that unknown bijection still yields two latent field values, and the affine normalization covers every such pair. This stronger scope follows directly from the same singleton-cover calculation and needs no additional search. Do not expand those parameters without independent evidence.

**Decision:** the entire defined quadratic five-predecessor receiver cannot decode the original under the explicit singleton condition. The exact basis-cover technique is reusable for a future independently specified nonlinear-in-ciphertext but linear-in-unknown-parameters law; it recovers coefficients rather than guesses source numbers. No unknown plaintext or authenticated key recovered.

[Runnable CJS test](../sims/lp2_quadratic5_singleton_cover_inverse_sft.cjs) · [actual complete output](lp2-quadratic5-singleton-cover-output.json).

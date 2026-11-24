# Periodic GP29 permutations with latent F holds: exact support and certified collision obstruction

Agent 10, 2026-11-24. Independent fallback after all actionable Director assignments were claimed. No plaintext or key recovered.

## Model

For q=8 or 13 (historical LP1 key lengths), each phase has an arbitrary secret permutation of the 29-rune alphabet. Plaintext F emits ciphertext F without advancing phase. Every other plaintext rune consumes a phase, including when its permutation image happens to be F. All nonzero ciphertext positions therefore consume. We discard every ciphertext F and relax the start phase of every resulting maximal nonzero block independently; no assumptions about words, separators, or which zeros consume. A second test also cuts at physical page boundaries, granting arbitrary page resets with shared phase permutations.

The original has 12,956 runes, 458 zeros, and 12,498 nonzero runes in 455 maximal nonzero blocks. The nine solved native sections contain 2,979 runes and omit EO and OE.

## Exact support obstruction

For plaintext restricted to the 27 runes actually present in the nine solved sections, each consuming phase uses at most 26 plaintext symbols. Thus the union of observed nonzero ciphertext symbols at each phase has cardinality at most 26. For arbitrary affine rows, the absent symbols additionally include the three images of F, EO and OE. Select the 24 longest nonzero blocks (ties by offset). Fix the longest block's rotation by relabeling phases. DFS all remaining rotations with minimum remaining values, monotone mask pruning, no heuristic pruning. All searches terminate without reaching the 100,000-node cap.

| q | Affine row nodes | Arbitrary permutation nodes | Page-cut arbitrary permutation nodes |
|---|---:|---:|---:|
| 8 | 3 (infeasible) | 11 (infeasible) | 20 (infeasible) |
| 13 | 613 (infeasible) | 21589 (infeasible) | 88008 (infeasible) |

This is an exact conditional support exclusion, not a claim that all English plaintext omits EO/OE. Native-source affine plants pass both periods.

## Full-alphabet certified collision bound

Let h[b,r,c] be each nonzero block's local phase/symbol histogram, and N[r,c] their sum after arbitrary independent cyclic rotations. The ordered collision count K=sum N[r,c](N[r,c]-1) is invariant under any shared per-phase permutation on precisely those observed consuming positions. Parseval gives

K+n = (sum_c n_c² + sum_{k=1}^{q-1} ||sum_b z_b F[b,k]||²)/q,

where F[b,k] is the vector over symbols of their Fourier sums within block b; each z_b is a unit complex number representing an arbitrary rotation. Set w_b=ceil(sqrt(length_b)), W=sum w_b, A_k=sum F[b,k]F[b,k]* / w_b. The weighted matrix Cauchy inequality gives ||sum_b z_b F[b,k]||² <= W lambda_max(A_k).

The implementation certifies an upper bound using BigInt only. Roots are rounded at scale S=10^6 from exact rational order-40 Taylor polynomials at 2(3141592653589793/10^15)r/q. The known pi approximation error is <10^-15, and 7^41/41! <10^-12; coordinate errors are <1/S. For integer Fourier vectors g, let D=lcm(w_b) and M=sum (D/w_b)g_b g_b*. Four exact complex matrix squarings compute M^16. The induced infinity norm is bounded by max row sum of ceiling integer square roots of squared absolute values; binary search certifies an upper eigenvalue bound for M/(D S²), rounded upward to 0.001. The total vector approximation error is <=2n/S. Use upward-rounded square roots in the final Parseval sum, then floor the integer collision bound. Conjugate frequencies are paired.

For a candidate plaintext histogram, remove all its F plus exactly (ciphertext zero count - plaintext F count) other symbols. If plaintext F exceeds ciphertext zeros, it is already impossible. Greedily remove from the largest remaining symbol count (convex marginal costs); balance each remaining count n_c over q phases. With n_c=qa+r its minimum contribution is (q-r)a(a-1)+r a(a+1). This lower bound grants arbitrary phase assignments, no word structure, all 29 symbols and even the most favorable selection of consuming ciphertext F positions.

| q | Original upper | Page-cut upper | Repeated native lower | Minimum of 96 literary windows | Continuous margin |
|---|---:|---:|---:|---:|---:|
| 8 | 922601 | 940910 | 1180146 | 1112456 | 189855 |
| 13 | 665076 | 686833 | 721474 | 679816 | 14740 |

The pinned literary corpora are Gibran, Shakespeare and Emerson, converted to GP29 with the existing transliteration conventions; Gibran and Emerson are cut to authored material and Gutenberg end markers. Thirty-two evenly spaced contiguous windows of 12,956 runes per donor are tested. q8: 96/96 excluded for continuous model and 96/96 after arbitrary physical page resets; q13: 96/96 excluded for continuous model and 95/96 after arbitrary physical page resets. Windows overlap, so these are finite controls, not independent statistical draws or a universal claim about English.

The native control repeats and truncates the 2,979 solved runes to 12,956 and encrypts with deterministic independent affine phase rows. Actual invariant collision counts lie between the two certified bounds:
- q8: 1032928 <= 1169830 <= 1563434; 965 ciphertext zeros.
- q13: 645332 <= 725684 <= 1095969; 874 ciphertext zeros.

## Decision

This is stronger than additive Vigenere exclusion: no secret per-phase GP29 bijections at q8/q13 can yield any of the 96 tested natural-language windows under the model, even with all latent F holds and independently rotated nonzero blocks. The support result separately excludes the whole GP27 native register for the tested model. The tests do not recover plaintext, establish the correct cipher, or exclude unusual plaintext distributions, chapter-private permutations, other periods, transposition, or phase changes within nonzero blocks. Do not use these results to assert arbitrary LP2 ciphers are impossible.

Reproduce from repository root: `node research/agent10/periodic-permutation-fhold-spectral-sft.cjs`. Full raw certificate summaries are in `results.json` adjacent to this report. Source data: existing canonical LP2, nine solved GP29 sections and pinned control texts.

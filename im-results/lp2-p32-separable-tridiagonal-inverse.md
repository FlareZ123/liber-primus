# P32: exact blind key recovery for the two-axis separable three-tap blur family

**Agent 5, 25 November 2026. Conditional original-data negative; no unknown LP2 plaintext, authentic key or new destination.**

## Why a materially different inverse

The actual p32 / 49.jpg has a visibly blurred tree and p55 / 72.jpg a sharper outline. The 121-rune count and previously established 563/569 GP-prime axis sums nominate a hypothetical 11×11 reflow, not a printed grid. Agent2's new historical Stage10 prime-ordinal extraction `TWA` (28,39,50) tentatively suggests a two-axis reading, but is not authenticated or an operator specification. [Fixed binomial Gaussian](lp2-p32-gaussian-blur-inverse.md), [fixed p50 circulant](lp2-p32-p50-11cycle-circular-deconvolution-gate.md), and [fixed Laplacian](lp2-p32-tree-laplacian-edge-inverse.md) inverses are already negative. This test does **not** rerun those keys. It uses a direct lexical linear-system attack to recover completely unknown coefficients of a small **separable two-axis filter**, a materially different blind-key question: would *any* invertible local 3×3 separable kernel with the prior zero boundary produce p32 plaintext? The new TWA clue is weak; the compact model is cheap enough to settle exactly. Do not infer a real filter from the artwork or broaden this family further without a new selector.

## Exact family and exhaustive conditional coverage

Over GF29 let T(k) be the 11×11 tridiagonal Toeplitz matrix with lower/central/upper diagonals k=(l,m,r), zero outside the square. Define C=T(A) P T(B)^T; both factors must be invertible. Normalize the first nonzero A coefficient to one by absorbing the scalar into B. Its determinant is computed by d0=1,d1=m,d_n=m d_(n−1)−lr d_(n−2) mod29, and inverses use exact modular elimination. This yields **757 normalized A values × 21196 B values = 16,045,372 distinct invertible linear maps**. The original physical p32 is reflowed once into 11×11 without rotation, and its 22 groups are retained.

For each A, calculate D=T(A)^−1 C. If any candidate printed word P is correct, each of its internal same-row triples gives D[i]=B_l P[i−1]+B_m P[i]+B_r P[i+1]; at row edges the appropriate neighbor is a fixed zero. Unknown adjacent words are never assumed. Solve the resulting equations for B using an invertible three-row subsystem and verify all remaining equations. Rank-deficient systems have their affine solution spaces enumerated rather than skipped. The seven disjoint group indices [3,7,9,11,13,15,19] all have length ≥8. **At most six OOV groups therefore imply at least one fully in-register anchor, and every key satisfying that condition is included in the union.** The final inverse evaluates all groups, exact forward replay and a separate trained bigram tie-break. Sieve survivors can be false anchors; that makes the search a safe superset.

Dictionary: 32,208 distinct GP forms, including TextBlob English, solved native LP1 and corrected Beowulf. This retains the earlier [Old English sensitivity](lp2-p32-rowcolumn-oov-exact.md#old-english-register-sensitivity-same-mechanism-distinct-language-premise). Modern donor excluded from native bigram training; OE bigram training uses the first 16,000 source runes. All donor lexical forms are included in the dictionary. The seven original anchor domains are full rank in this dictionary; generic rank-deficient handling remains present but does not affect the original count.

## Actual original and controlled results

| Input | Distinct candidate filters | Best OOV | Exact plaintext | Exact planted key |
|---|---:|---:|---:|---|
| Original p32 | 381 | 18/22 | none | none |
| Native LOSS OF DIVINITY 121-rune control, row-aligned anchor | 1 | 0 | 121/121 | yes |
| Beowulf 121-rune control, row-crossing anchor | 1 | 0 | 121/121 | yes |
| P32-shaped synthetic lexical plant, six specified long anchor forms removed | 352 | 6/22 | 121/121 | yes |

The original anchor increments are 0,0,4,123,6,133,115 for the seven groups in source order. Neither original eleven-rune group supports any invertible two-axis filter with an in-register plaintext anchor. Two original filters attain 18 OOV; the best tie-break winner has A=[1,5,16], B=[17,15,17], score −4.53860 nats/edge, and wholly incoherent plaintext despite exact replay. The controls give −2.91000 and −2.49856 with uniquely recovered keys; the synthetic six-OOV plant gives −3.02774. These are not independent random p-values; the control lexicon knows donor words and synthetic plant grammar is not native prose.

**Decision:** retire the entire named invertible separable three-tap family for p32 under preserved groups and ≤6 OOV in the stated dictionary, not merely the previously fixed Gaussian. The minimum 18 applies only to the anchor-derived union, **not** to unconstrained all-key global OOV minimization above the six-exception budget. Nonseparable kernels, different geometry, boundary treatment, resegmentation and different alphabets are outside scope; no justification to sweep them follows.

Reproduce: `node sims/lp2_p32_separable_tridiagonal_inverse_sft.cjs all`. All three modes were actually executed in connected V8 using the committed function, with original [first output](lp2-p32-separable-tridiagonal-original-output.json) and [full output](lp2-p32-separable-tridiagonal-inverse-output.json). The standalone Node CLI/Windows CI was not independently run.

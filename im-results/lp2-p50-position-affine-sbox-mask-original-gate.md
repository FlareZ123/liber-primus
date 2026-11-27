# P50 256-token table: positional-affine byte-mask S-box exclusion

**18 November 2026, Agent10. Classification:** original-input bounded cipher-family negative. The raw 32×8 source table is not a byte permutation, and it cannot be transformed into one by a two-parameter linear position-dependent XOR/add mask under either source-documented radix. The exact extension below also rules out all 2^64 binary-linear position masks plus arbitrary output XOR bias, with a planted arbitrary-matrix key recovered uniquely. These exclude two distinct reversible prewhitening architectures. **No unknown-page plaintext, intended operation, or key has been recovered.**

## Motivation and competing explanation

The terminal p50 table visibly contains 256 two-glyph tokens. A 256-byte substitution box would be an executable, reusable nonlinear part of a stronger cipher, potentially making its nearly uniform ciphertext more comprehensible. The existing source-native [unmasked-permutation exclusion](../sims/lp2_p50_256_sbox_permutation_gate_sft.cjs) proves that the literal tokens have only 161 distinct values, so they are not an S-box even after arbitrary position permutations or global byte relabeling. That earlier test does **not** exclude a value-changing *position-dependent* prewhitening mask that can separate duplicate printed tokens. An affine-index mask is a minimal two-parameter proposal; the manuscript and historical handoff do **not** specify such a mask.

Frozen family for exact source cell index `i=0..255`, byte-valued `a,b=0..255`:

`S[i] = T[i] XOR ((a*i+b) mod 256)`, or
`S[i] = (T[i]+a*i+b) mod 256`.

Only two historically documented table interpretations are admitted: ordinary `base60` and alternative `base59` with lowercase `f` deleted. The 2014 original index happens to expose HTML integers 133 and 331, but their use as `(a,b)=(133,331 mod256)` is **unlicensed** and recorded only as an explicit unchanged source example. No language scoring, ciphertext fitting, alternate row order or secret third parameter is allowed.

## Exact original-data outcome

Source: [256-cell numeric table](../resources/liber-primus/base60-grid.json), ordinary radix60 table SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. All four exhaustive enumerations test **65,536** parameter pairs and all **256** decoded cells each, for **262,144 full outputs**.

| Literal input | Operation | Best distinct S-box byte values | One maximizing (a,b) | Perfect 256-value S-boxes | Distinct with (133,75) |
| --- | --- | ---: | --- | ---: | ---: |
| base60 | XOR | **180** | (81,119) | **0** | 164 |
| base60 | mod256 addition | **175** | (158,0) | **0** | 166 |
| base59 | XOR | **180** | (36,112) | **0** | 169 |
| base59 | mod256 addition | **176** | (248,0) | **0** | 163 |

The most accommodating branch still leaves at least **76** output positions duplicated beyond the first occurrence. A positive synthetic 256-element affine byte permutation `(197*i+17) mod256` is deliberately masked with known `a=81,b=119`; both full XOR and addition inversions recover all 256 distinct byte values, and the same exhaustive procedure finds at least one qualifying perfect mask. Thus the algorithm detects the specified architecture when present.

**Reproducer:** [standalone read-only Node.js 22 / Windows 11 SFT](../sims/lp2_p50_position_affine_sbox_mask_sft.cjs). It checks authentic source dimensions, the raw radix60 SHA-256, all 262,144 cases, four fixed outputs, and both complete planted positives. Executed locally against 256 printed source tokens reconstructed exactly from the GitHub-held table and SHA-pinned byte sequence, yielding the above assertions.

## Arbitrary binary-affine position mask: exact 2^64-map key recovery (Agent49, 27 November)

The earlier integer-affine position mask does not cover arbitrary binary-linear maps. Grant any 8×8 matrix M over GF(2) (not necessarily invertible) and any constant byte b:
`S(x)=T(x) XOR Mx XOR b`, where x is the zero-based row-major byte address. This includes finite-field GF(256) multiplication masks, bit permutations and all cross-bit linear combinations. The historical 2013 XOR operation motivates trying binary masks, but neither the table nor the historical source selects this whitening architecture. The output translation b cannot affect injectivity and cannot be identified by a permutation-only criterion.

For every nonzero difference d define the allowed image set

`A[d] = GF(2)^8 \\ { T(x) XOR T(x XOR d) : x in GF(2)^8 }`.

Two cells collide in S exactly when M(d) equals one of the excluded differences. Therefore S is a permutation **if and only if** M(d) belongs to A[d] for every nonzero d. Pick a complete binary basis greedily using only derivative-domain sizes; this is an enumeration order, not a restriction on M. At depth k, the image of every vector u in the current span is already fixed. For the next basis vector e, the entire admissible set of images y=M(e) is the intersection of A[e XOR u] XOR M(u) over all current u. A packed eight-word bitset computes it exactly. Branch on every remaining y and extend M linearly to the enlarged span. A zero intersection prunes only maps with a proved output collision.

The row-major→column-major rearrangement for the 32×8 table is a permutation of the eight address bits; horizontal reflection is x→x XOR 7. Both are affine address relabelings, so composing with them maps this entire binary-affine family to itself. They do not justify repeated searches.

| Source | Partial maps at dimension 4 | Dimension 5 | Dimension 6 | Dimension 7 | Complete dimension 8 |
|---|---:|---:|---:|---:|---:|
| Original base59 | 1,432,449 | 61,860 | 2 | 0 | 0 |
| Original base60 | 1,533,406 | 80,448 | 0 | 0 | 0 |
| Hidden planted permutation | 1,485,841 | 67,243 | 1 | 1 | 1 |

The exact source derivative sets admit 144–165 and 144–168 allowed images per nonzero direction respectively; the search excludes every one of the 2^64 possible binary matrices and all 256 affine biases for both radices, without enumerating all full matrices. In a separate synthetic control a deterministically shuffled 256-byte permutation is masked by a hidden arbitrary matrix with standard-basis image bytes [173,106,53,180,108,26,19,17], plus bias 3. The resulting table has only 151 distinct bytes. The search uniquely recovers all eight matrix columns and reproduces the original permutation up to the unidentifiable constant output XOR. This is genuine key recovery in the declared model, not a claim that the synthetic permutation is a historical control.

[Exact executable](../sims/lp2_p50_all_gf2_linear_position_sbox_sft.cjs) · [raw result and input blob](lp2-p50-all-gf2-linear-position-sbox.json). Computational core executed in connected V8; standalone Node/CI was not separately run.

**Updated decision:** the entire binary-affine position-mask S-box family is excluded in addition to the earlier two-parameter integer masks. This does not exclude nonlinear masks, general position-dependent integer operations, data rather than a substitution permutation, or source-selected external keys. No authentic LP2 key, plaintext, or destination recovered.

## Research decision

Neither the fixed integer-affine index mask nor any binary-affine position mask rescues the S-box interpretation of this table. This is a **source-specified complete finite model exclusion**, not an assertion about every 256-byte cryptographic consumer or a proof of intended puzzle design. A nonlinear mask, stateful generation, KDF, stream cipher or data rather than permutation can still use these bytes. Do not enlarge the affine family with arbitrary phase, bespoke piecewise masks or tuned ciphertext outputs without an independent manuscript/2014-era operation that would lead from an original clue to authentic unknown plaintext.

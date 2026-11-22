# P50 256-token table: positional-affine byte-mask S-box exclusion

**18 November 2026, Agent10. Classification:** original-input bounded cipher-family negative. The raw 32×8 source table is not a byte permutation, and it cannot be transformed into one by a two-parameter linear position-dependent XOR/add mask under either source-documented radix. This excludes one concrete reversible prewhitening architecture. **No unknown-page plaintext, intended operation, or key has been recovered.**

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

## Research decision

A fixed affine index-dependent byte mask does not rescue the S-box interpretation of this table. This is a **source-specified complete finite model exclusion**, not an assertion about every 256-byte cryptographic consumer or a proof of intended puzzle design. A nonlinear mask, stateful generation, KDF, stream cipher or data rather than permutation can still use these bytes. Do not enlarge the affine family with arbitrary phase, bespoke piecewise masks or tuned ciphertext outputs without an independent manuscript/2014-era operation that would lead from an original clue to authentic unknown plaintext.

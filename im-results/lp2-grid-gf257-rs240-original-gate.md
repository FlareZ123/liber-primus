# Original LP2 numerical grid: GF(257) RS[256,240] source-order gate

**Agent 46, 12 November 2026. Classification: exact, bounded original-data exclusion. No plaintext, key, historical error-correcting-code instruction or destination recovered.**

## Why this candidate was worth one exact test

Original physical LP2 pp49–51 print 256 base60 tokens in a 32-row × 8-column table. The conventional, conditionally decoded 256-byte stream is pinned in [the grid resource](../resources/liber-primus/base60-grid.json), SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Physical p39 uniquely contains exactly **240 GP29 runes**. Thus an independently motivated *possibility* is a 240-symbol data payload plus 16 parity values in a 256-cell codeword. The prime 257 gives a convenient size-256 multiplicative group; 3 has exact order 256 in GF(257).

Neither the p39 illustration nor the archive instructs a Reed–Solomon codec, the field GF(257), or an orientation. These are frozen explanatory choices, not keys learned from successful output.

## Two finite complete tests on the exact original stream

1. **Cyclic coefficient form:** Treat the 256 table bytes (each a GF257 element) as descending coefficients of a degree-255 polynomial, either in printed order or reversed. A narrow-sense cyclic RS[256,240] codeword with 16 parity constraints would vanish at 16 consecutive powers of primitive 3 (allowing any initial exponent only strengthens the null). Enumerate **all 256 nonzero GF257 evaluation points**: the original polynomial has exactly **one root**, at 3^164 in printed order, and exactly **one**, at 3^92 in reverse order. Thus it cannot satisfy any 16-distinct-root generator of this type, irrespective of which consecutive-root window is selected. A planted 240-coefficient message multiplied by the 16-root generator recovers all 16 designed roots.
2. **Evaluation/NTT form:** Treat the source 256 byte values in order as evaluations of a degree-at-most-239 polynomial at 3^0,…,3^255. Inverse evaluation is a length-256 finite-field Fourier transform, with multiplier 256=256^(-1) mod257. The recovered polynomial has only **one zero coefficient** in either source orientation, and **all 16** coefficients at degrees 240 through 255 are nonzero. Original printed-order high-degree coefficient values: `[157,110,157,45,178,190,26,136,166,60,49,101,127,220,7,231]`. Reversed order: `[5,69,51,52,92,81,47,222,126,49,128,55,69,229,137,102]`. Thus the exact source values cannot be evaluations of any polynomial of degree below 240 under this natural grid-index-to-power mapping. An encoded positive plant with 240 seeded data coefficients and 16 zero high coefficients inverses exactly.

**Independently executable test:** `node sims/lp2_grid_gf257_rs240_sft.cjs` (Node 18+, built-in modules only). It asserts the byte digest, row count, primitive generator order, both original results, 256-point reconstruction and two positive controls. It never changes the original input or writes files.

## Scope and research decision

This is a strong exact **negative result for two explicit unaltered GF(257) RS[256,240] representations**, requiring no language statistics or brute-force key search. It does **not** exclude an undocumented symbol permutation, secret point order, different field/radix, punctured/shortened code, pre-encryption, or a non-RS function of the 256-byte table. Nor does the 256-minus-240 equality authenticate error correction in the first place.

Do not further search arbitrary Reed–Solomon encoders without an independently visible clue specifying code construction, layout or generator. The original-source divisor structure over GF(29) and the p39 240-slot quotient are separately scoped in [the previous factor gate](lp2-p39-240-gridfactor16-convolution-gate.md); neither supplies the missing historical RS instruction.

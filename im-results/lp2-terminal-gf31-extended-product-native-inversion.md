# Extended GF(31) product-code reconstruction of the 76-rune terminal perimeter

**Status (16 November 2026): complete, source-shaped negative test. No unknown Liber Primus plaintext, cipher key, or authenticated author operation recovered.**

## Independent motive and exact proposed decoder

Physical LP2 pp49–51 print a 32×8 numerical table. Physical p55 has **76 unknown runes**; the independently decoded p56 has **85 known runes** and clear p57 has **95**. A 32×8 rectangle has a 76-cell one-layer perimeter and 180 interior cells. The p57 parable refers to shedding circumferences. This suggests a direct 30×6 interior → 32×8 perimeter decoder, though neither the author nor the solved text identifies a particular mathematical transform.

An especially economical alternative to previously tested GF(29), GF(29²) and GF(256) Reed–Solomon gates is an **extended Reed–Solomon product code over GF(31)**: 32 projective evaluation points are exactly the 31 finite elements of GF(31) plus infinity, allowing all 32 physical rows to be represented without the inevitable repeated coordinates of GF(29). The 8 columns fit naturally inside the finite field. GF(31) is a prime field, adjacent to the established 29-symbol runic modulus.

The fully specified, key-free model places the **exact 180 authenticated p56-plaintext+p57 rune ordinals** in the 30×6 interior, row major. In each interior row, six known values uniquely interpolate a degree-at-most-five polynomial on horizontal coordinates 1–6; evaluate at coordinates 0 and 7 for the edges. Each resulting column has 30 known values and uniquely interpolates a degree-at-most-29 polynomial on 30 finite field points; evaluate it at the missing finite point and at projective infinity (the leading coefficient) for top and bottom. The entire perimeter is determined with **zero free coefficients**, without fitting the unknown p55.

We allow the only elementary source-layout alternatives: infinity at the top or bottom, and independently mirroring the order of interior rows or columns. All eight assignments use the same original p56 and p57 input. An outer-ring reading from each of the four corners, in both directions, tests the observed ciphertext for a simple direct match.

## Exact original-input outcome

| Infinity end | Reverse interior rows? | Reverse interior columns? | Forbidden GP29 residues among 76 predicted outer positions | Best equality to p55 printed ciphertext across eight ring traversals |
| --- | --- | --- | ---: | ---: |
| Bottom | No | No | **5** | 3/76 |
| Bottom | No | Yes | **5** | 3/76 |
| Bottom | Yes | No | **3** | 4/76 |
| Bottom | Yes | Yes | **3** | 4/76 |
| Top | No | No | **5** | 4/76 |
| Top | No | Yes | **5** | 4/76 |
| Top | Yes | No | **3** | 4/76 |
| Top | Yes | Yes | **3** | 4/76 |

The model outputs values **29 or 30**, which have no glyph in the 29-rune Gematria Primus alphabet. This is an exact necessary-condition failure for **all eight direct GP29 outer-perimeter decoders**; it rules out such a canonical product-code reconstruction of actual p55 plaintext. The codeword's other output symbols do not read as coherent native GP text. The best direct equality against the *ciphertext* is also close to chance, although equality is not itself required for a plaintext-recovery model.

A separate source-table use of the identical GF(31) construction (reducing the original 256 base60-decoded bytes modulo31 and interpolating their 180 central positions) reconstructs **1 of 76** authentic outer table cells. Thus the source table is not itself a projective GF31 product-code codeword under this fixed natural registration.

Each configuration has a synthetic positive: an independent complete field31 encoder reconstructs **all 180 planted interior data and all 76 planted border positions exactly**, while the source p56 prime-totient decoder reproduces the authentic 85-rune known input. Original table bytes are SHA-256-pinned as `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

## Implication and limits

This closes one source-readable, genuinely **non-GF29** two-dimensional erasure/extrapolation candidate that earlier GF29 product-code rejections did not cover. The 76/180 coincidence remains interesting but does **not** authorize inventing an unprinted 31→29 packing, 31-valued escape symbols, an arbitrary position permutation, or a secret key to rescue this failed direct decoder. Other source-selected nonlinear or keyed maps are untouched. The producer's intention to use a product code is unproven.

[Reproducer and complete coordinates](../sims/lp2_terminal_gf31_extended_product_sft.cjs) · Inputs: [original rune corpus](../resources/liber-primus/lp2-corpus.json), [original transcribed table](../resources/liber-primus/lp2-grid-256.json), [prior GF29 systematic product-code gate](lp2-terminal-hg-product-code-parity.md), [prior GF256 erasure gate](../sims/lp2_terminal256_rs180_ring_sft.cjs).

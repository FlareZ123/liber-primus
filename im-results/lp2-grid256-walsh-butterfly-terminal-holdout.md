# Direct 256-point Walsh and Fermat Fourier butterflies versus the 256 terminal runes

**Agent20, 22 November 2026. Two bounded direct original-cipher negative operations.** This source-selected-input, speculative-operator test recovers **no LP2 unknown plaintext, key, or 2014 continuation**. The exact 256 values are unmodified.

## A short, human-readable prospective route

The original pages 49–51 display a single **32×8 table of 256 numeric tokens**. Original p55 illustrates a large bilateral moth, and solved p57 asks the reader to *shed circumferences* and seek the interior. A mathematically literate solver could consider the standard **butterfly** of a recursive fast Walsh–Hadamard transform on a power-of-two table, rather than an indefinite key sweep. The source table also has a numerical match with the **76 original p55 ciphertext + 85 solved p56 cipher runes + 95 clear p57 runes = 256** contiguous terminal symbols. These are individually established source properties, not an authenticated direction to use an FFT or WHT. The source does not specify a transform sign, field, Fourier root, nor that the table contains terminal plaintext.

A new, sharply discriminating possibility is a **single** 256-point Walsh transform between the original table and the three terminal page streams. The last **95** symbols then have a fully known plaintext at a fixed offset **161**, so this decoder can be tested **without guessing any p55 plaintext**.

An earlier p15 WHT16 inverse involved the **distinct printed 4×4 spiral**. The present full **256-cell** table is a separate original source and the fixed **95-rune** terminal holdout tests an otherwise unknown 76-rune output.

## Frozen transformation and source values

Read original numeric table pp49–51 as conventional 256 base60 decoded bytes, the **exact printed row-major order**, and assert the existing byte-stream SHA-256:

\`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

The same 256 literal tokens are independently checked against both repository grid transcriptions. The first frozen butterfly is \`(a,b) → (a+b,a−b)\` at successive strides 1,2,4,8,16,32,64,128, all in the source order. The ordinary mathematical WHT **squares to 256·identity**. Thus each field's reverse is exactly \`256⁻¹ · WHT\`, no secret or fitted inverse matrix.

- **GF29:** Reduce every source byte mod29, use \`256⁻¹ ≡23 mod29\`, and read 256 native GP29 rune candidates.
- **GF257:** Preserve all original bytes as distinct elements of the smallest prime field containing all byte values, and use \`256⁻¹ ≡256 mod257\`. Inspect the exact 256-result field vector for printable ASCII and for literal equality to the authentic p57 GP symbols. The 257th residue 256 is explicitly **not** silently mapped into a byte.

Both directions (direct WHT and its strict inverse) are frozen because the original does not identify which side is encoded. No row shuffles, rotations, unknown phases, output alphabets, fitted pads, postselection or p55 guesses. The original terminal p57 starts at offset \`76+85=161\` and occupies positions 161–255.

## Original-cipher result and genuine solved-page discriminator

| Original source field / direction | Decoded GP29 normalized IoC | p57 GP29 matches of 95 at fixed positions161–255 | ASCII printable of 256 | Result |
| --- | ---: | ---: | ---: | --- |
| GF29 direct | **1.0368566176** | **4/95** | n/a | Uniform-like runes |
| GF29 inverse | **1.0368566176** | **8/95** | n/a | Uniform-like runes |
| GF257 direct | n/a | **0/95 exact** | **93/256** | Binary-like residues; 2 positions contain unrepresentable byte256 |
| GF257 inverse | n/a | **0/95 exact** | **92/256** | Binary-like residues; no byte256 |

For GF257 outputs reduced mod29, matches with p57 rise only to **4/95** (direct) and **1/95** (inverse). The original raw GF29 title distribution is transformed into **10 zeros among 256 symbols**, close to the roughly 8.83 expected under a uniform field; it supplies no obvious sparse Walsh spectrum or readable GP words. The GF257 printable fractions are 36.33% and 35.94%, unlike clear ordinary ASCII. Neither type offers a recognizable payload header or readable text.

The genuine first-party p57 page is left completely untouched. All **95 original solved page symbols** would have to agree under a literal terminal256-keyed Walsh model. A maximum of eight exact matches excludes that direct model independently of how the 76 unknown p55 runes might be guessed. It would be unwarranted to rescue the mismatch by fitting a new output permutation or editing the printed table.

## Exact reverse and positive control

The single-file Windows Node22 CommonJS runner:

1. Asserts **32×8** original token geometry, **256** byte identities and the full source SHA-256, and checks the independently transcribed 256 tokens.
2. Asserts original terminal dimensions **76+85+95** and the genuine page57 GP29 output at fixed offsets.
3. Runs WHT twice over each field and verifies \`WHT(WHT(x)) =256x\` for the actual table, with exact **256/256** original table recovery after inverse scaling.
4. Creates one **256-rune native solved-p57 control** using the authentic p57 GP rune sequence cyclically, forward-WHT encodes it under each field and inverts it, recovering all **256/256** native runes. This proves the finite WHT inverse works, while never claiming a planted text is an original decryption.
5. Prints the full original GF29 decoded transliteration for both directions and 100-character ASCII preview in both GF257 directions.
6. Computes the separately frozen GF257 Fourier/NTT packet specified below and proves its authentic source and planted-text inverses.

**Reproducer:** [\`sims/lp2_grid256_walsh_hadamard_original_holdout_sft.cjs\`](../sims/lp2_grid256_walsh_hadamard_original_holdout_sft.cjs).

## Distinct 256-point Fermat Fourier consumer (same original-source holdout)

The power-of-two table also suggests an **actual finite-field Fourier transform** using the **Fermat prime 257**. This is a more specific arithmetic fit than an arbitrary field: the multiplicative group of GF257 has exactly **256** elements, and the small integer \`3\` has multiplicative order **256**, since \`3^128≡−1\` and \`3^256≡1 mod257\`. That supplies a reversible full 256-point number-theoretic transform (NTT) without guessing 256 Fourier coefficients. The printed table itself supplies neither “FFT” nor the primitive root3, so retain this as a mathematically motivated proposal rather than first-party cipher identification.

Fix \`ω=3\` and the exact 256-element source byte vector. One direct Fourier readout is

\`F[k] = Σ(j=0..255) bytes[j] * ω^(j*k) mod257\`.

The literal inverse is \`bytes[j] = 256*Σ(k=0..255) F[k]*ω^(−j*k) mod257\`. Only these forward/inverse source-order orientations are admitted. Both reproduce the **complete 256/256** original table in the opposite transform, and a separately encoded 256-native-rune solved-page plant returns **256/256**.

| Exact GF257 Fourier readout | Printable ASCII of 256 | Literal GP29 matches against fixed clear p57 | GP29 matches after residue mod29 | Values equal 256 |
| --- | ---: | ---: | ---: | ---: |
| Forward NTT with ω=3 | **96** | **1/95** | **3/95** | 2 |
| Inverse NTT with ω=3 | **94** | **1/95** | **4/95** | 0 |

No sustained English or binary signature is present. Both printable fractions are consistent with a high-entropy byte-like output, and even a generously reduced GP29 reading is incompatible with the authentic 95-rune heldout passage. These values are computed by the exact same linked CommonJS SFT, with no additional dataset, phase search or language fitting.

## Decision

Retire both the **direct WHT256/inverse-WHT256** and the **Fermat257 NTT256/inverse-NTT256 with primitive root3**, applied to the canonical p50 table, as unkeyed native-GP29 or ASCII257 terminal-p56/p57 plaintext packets. This tests a historical **possibility**, not an authenticated instruction. Recovered original p55 plaintext remains **zero runes**. The underlying 32×8 numeric source, moth illustration and authentic 95-rune control remain available to a future candidate if an independent puzzle instruction selects a different, actually invertible operation and predicts its output.

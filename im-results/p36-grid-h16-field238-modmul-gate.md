# P36 versus the printed-grid degree-238 field: exact modular inverse

**Classification:** source-motivated, source-input-locked original-cipher negative. Four complete, reversible GF(29) finite-field decoders yield no unknown native-GP29 plaintext. The original source does not explicitly prescribe modular field multiplication, so the negative applies only to this finite architecture.

## Source premise and proposed human solve path

The conventional base-60 transcription of the original 256 printed cells on physical pp49–51 supplies a polynomial `P(X)` over GF(29), with the highest degree printed first. The previously verified exact factorization is

`P(X) = 28 · H16(X) · Q238(X)`,

where `H16` is the monic product of the two linear factors `(X+5)^2`, the source-related degree-two factor `X²+18X+11`, and the independently established monic factors of degrees three and nine. The final `Q238` is irreducible over GF(29). Thus `H16` has degree 16 and `Q238` degree 238; `H16` is a unit modulo `Q238`.

Physical p36 independently contains **238 original GP29 ciphertext runes**. This suggests one *specific*, lossless two-source reading: regard p36's rune values as the 238 coefficients of one element of GF(29)[X]/(Q238), and use `H16` as the multiplier. Polynomial factoring and quotient-field arithmetic are motivated by the original p3/p39 red algebraic triads and the printed 256-cell table, although no 2014/2016 source commands this particular operation. The p36 length and the choice of H16/Q238 were recognized retrospectively.

The tested inverse family is `M⁻¹(C) = C · H16⁻¹ mod Q238` and its key-direction alternative `M(C) = C · H16 mod Q238`. Each is applied to source-high-to-low and source-low-to-high coefficient readings, without key search, phase shift, arbitrary padding, transposition or output filtering. Exactly **four models** are admitted.

## Original and positive-control measurements

The original p36 rune IoC is **0.0359890792**. Direct GP29 decoder outputs are:

| Coefficient reading | Operation | Output IoC |
| --- | --- | ---: |
| Printed high-to-low | Multiply by `H16⁻¹` modulo `Q238` | **0.0350671914** |
| Printed high-to-low | Multiply by `H16` modulo `Q238` | **0.0321951565** |
| Reverse / low-to-high | Multiply by `H16⁻¹` modulo `Q238` | **0.0346417048** |
| Reverse / low-to-high | Multiply by `H16` modulo `Q238` | **0.0341098465** |

The independently supplied solved-LP1 reference yields **3,504 GP29 symbols** under the reproducer's documented greedy longest-match transliteration convention. Across all **3,267** consecutive windows of length 238, IoC ranges from **0.0554550934** to **0.0730418750**. Every original candidate falls well below this reference interval. The outputs remain nonlinguistic. The reference is a finite native-text comparison, not an exclusion of non-English, compressed or differently encoded intermediate registers.

For each of the four models, the exact inverse key reproduces **238/238 original p36 runes**, and a 238-rune known-GP plaintext plant is encrypted and recovered **238/238**. These controls establish that the calculation implements an actual reversible full-block cipher. Re-encryption itself does not authenticate the selected key or historical mechanism.

The source fingerprint is SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` for all 256 decoded table bytes. The program reconstructs and checks the original factorization modulo29, computes a genuine extended-Euclidean inverse, checks the 238-rune page, and refuses to score a candidate failing exact original or known-plaintext re-encryption.

## Decision

**Retire direct single-block multiplication/division by the source-defined H16 factor in GF(29²³⁸), for either printed coefficient orientation, as a decoder of ordinary GP29 plaintext on p36.** This is distinct from earlier direct source-factor additive pads and 238-tap LFSR feedback inverses. It neither supplies a decoded page nor excludes a source-selected different field operation, another secret, additional stages, or a non-GP intermediate.

This finite negative prevents a plausible direct polynomial-field continuation from being retried without an independent source instruction selecting a new operation or target.

**Standalone CommonJS reproducer:** [`sims/p36_grid_h16_field238_modmul_gate.cjs`](../sims/p36_grid_h16_field238_modmul_gate.cjs). Uses only repository-pinned original table transcription, original p36 rune indices and solved LP1 native-text reference. Related established factor source: [complete GF29 factorization](lp2-grid-complete-gf29-factorization.md).

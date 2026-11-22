# Moth-selected p05 magic-square Hill-5 applied to original p53

**Agent 32, 17 November 2026. Classification: bounded original-input cryptanalytic negative; no recovered plaintext or authenticated key.** A newly executed direct transfer of the previously identified original **LP1 p05 5×5 magic square** onto the artwork-selected **LP2 physical p53** produces only near-uniform GP29 symbol streams.

## Original selector and exact operation

The original solved LP1 p05 image prints a five-by-five magic square whose row sums are 1033. Its distinctive moth/cicada illustration is copied on unknown LP2 physical p53 and p55, and p53 contains 179 authentic runes. These source facts are documented in [the same-image and payload report](lp1-p05-hidden179-p53-moth-rawpad-gate.md). Previous source-selected p53 consumers tested the 179-byte hidden JPEG content as a rune-wise additive pad and as an ASCII XOR pad. The previously published Stage10 [matrix power/orbit study](lp1-p16-order56-pagepower-gate.md) tests different book-global/page-indexed operators, while the [moth crib Hill-5 study](lp2-p55-moth-p5-hill5-original-crib-gate.md) tests the p55 **terminal** phrase. The present test isolates the otherwise natural **fixed direct original-square Hill matrix on p53 itself**, without selecting it by a ciphertext language score.

The authentic LP1 p05 source matrix, read as printed, is:

```text
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

Reduce these 25 published numbers modulo 29 and apply each of four source-matrix orientations (**M, M⁻¹, Mᵀ, (Mᵀ)⁻¹**) as column-vector multiplication to successive five-rune blocks from the original p53 rune index 0. The source p53 contains **35 full five-rune blocks plus four leftover runes**. This bounded trial deliberately leaves the final four aside rather than inventing a padding rule, a wraparound state, or a block origin. No nonce, unknown alphabet, English key, guessed phrase, matrix entry or rune is fitted.

## Exact 175-rune original result

| Fixed matrix operator | Repeated-pair numerator across 175 result runes | GP29 index of coincidence |
| --- | ---: | ---: |
| Original **M** | 1,058 | 0.034745484 |
| **M⁻¹** | 1,034 | 0.033957307 |
| **Mᵀ** | 1,104 | 0.036256158 |
| **(Mᵀ)⁻¹** | 1,016 | 0.033366174 |
| Original untransformed p53 prefix | 1,014 | 0.033300493 |

For each row, IoC is exactly the integer numerator divided by 175×174. All source outputs remain close to uniform GP29 coincidence 1/29≈0.03448; none yields a continuous readable GP-native English section. The source-transformed first 40 GP tokens are printed by the reproducer so the claim can be checked directly. The exact 179 source runes are never changed.

**Positive gates:** every result is inverted by its independently calculated inverse and reconstructs **175/175 original p53 runes**, while a separate **90-rune genuinely solved p57 English control** is forward-encrypted by the same matrix and recovered **90/90**. These are algorithm-correctness checks; merely recreating the ciphertext cannot authenticate any claimed plaintext. Both the source matrix and its transpose are invertible modulo29.

## Decision and boundary

The visible moth supplies a plausible player-selected *page* and the printed 1033-square supplies a plausible *operand*, but the manuscript gives **no instruction to perform Hill multiplication**. This fixed direct five-rune Hill family fails its original plaintext test, reinforcing previous page-independent matrix-power and p53 pad negatives while leaving the distinct operations outside this frozen family untested. It does not solve any LP2 page or identify a key, destination, or cipher architecture. Do not promote the result as an exclusion of arbitrary Hill keys, stateful/position-dependent matrices, or unspecified four-rune suffix framing.

**Reproduce:** `node sims/lp1_p05_moth_p53_hill5_original_sft.cjs`. The standalone read-only Node.js 22 CommonJS source reads `resources/liber-primus/lp2-corpus.json`, freezes the 25 original matrix values above, asserts p53 length 179 and p57 length 95, checks the exact five GP29 collision numerators, and validates the complete 175- and 90-rune inversions. Source-independent initial calculations on the identical immutable p53 GP index sequence obtained the listed integer counts. No CI completion is asserted here.

# Five-dot Shamir geometry on original p7: dual DH constants, no plaintext

**21 November 2026, Agent26. Classification: exact original-image/rune arithmetic plus a bounded immediate receiver, not an unknown-page decryption.**

## Motivated hypothesis and original input

Cicada's 2013 puzzle used Shamir's Secret Sharing, reportedly five-of-ten shares, to reconstruct an onion destination. [Historical walkthrough](https://github.com/Dukotah/cicada3301/blob/master/research/02-puzzle-2013.md). The 2014 LP2 original physical p7 (image 24.jpg, SHA-256 91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c) ends with **five red words** beside **five independent black dots**. That source-visible five/five pairing motivates testing five-share interpolation. Unlike the historical SSSS byte-field usage, the proposed use of **GF(29)** here is an inference from the LP2 alphabet, with no authorial instruction.

The exact p7 red GP29 rune-index words begin at rune offset 194:

| Word | Rune indices | GF29 index product |
| ---: | --- | ---: |
| 1 | [23,3] | 11 |
| 2 | [22,16,2,25] | 26 |
| 3 | [5,7,11] | 8 |
| 4 | [14,28] | 15 |
| 5 | [6,28,19] | 2 |

Thus **y = [11,26,8,15,2]**. This same product vector had already been found and associated with historical 2013 Diffie-Hellman parameters in [the prior p7 circulant/DH report](lp2-p7-red-circulant-dh-original-inverse.md); reusing these operands is not independent evidence of their cryptographic role.

The five black dot centers from the already independently measured original 2400×3600 JPEG are approximately (796.95,3105.74), (992.47,3166.69), (1296.97,2866.70), (1479.36,3127.50), (1527.22,2936.20), left to right. The strict top-to-bottom height ranks **in that left-to-right order** are **[3,5,1,4,2]**. Their extraction and JPEG SHA-256 were established before this interpolation, in the [existing image-rank audit](../sims/lp2_p7_fivedot_seven_header_alignment_sft.cjs).

## Exact two-coordinate interpolation over GF29

For each of the following original-image-derived x-coordinate registers, compute the unique degree-at-most-four polynomial passing through all five paired source points (x_i,y_i). The Lagrange/Shamir secret is the constant f(0). No unknown ciphertext or plaintext enters the polynomial.

| Coordinate register | x values | Polynomial coefficients in ascending degree | f(0) |
| --- | --- | --- | ---: |
| Horizontal dot ranks | [1,2,3,4,5] | [5,6,23,26,9] | **5** |
| Vertical dot ranks | [3,5,1,4,2] | [23,18,21,22,11] | **23** |

The first polynomial is f_H(x) = 5 + 6x + 23x² + 26x³ + 9x⁴ modulo29. The second is f_V(x) = 23 + 18x + 21x² + 22x³ + 11x⁴ modulo29. Both reproduce all five original red-word products at their indicated x coordinates, exactly.

**The two recovered constants, (5,23), equal the independently documented 2013 Diffie-Hellman teaching pair (base g=5, modulus p=23).** The first polynomial's next coefficients 6 and 23 also match historical a=6 and p=23, but that ordering was recognized after the calculation and is not counted as a prospective third match.

### Source-locked controls

All **120 permutations** of the five distinct original y values were run against the same frozen image coordinate registers. Five permutations give horizontal f(0)=5; five give vertical f(0)=23; **only the original printed order gives both**. The conditional joint count is 1/120 for that fixed multiset and those retrospectively selected targets. It is not a global design probability.

Six other ordinary red-word summaries yield these constant-term pairs (horizontal,vertical): GP-prime product **(21,1)**; GP-index sum **(17,19)**; GP-prime sum **(21,21)**; first rune **(26,2)**; last rune **(15,12)**; word length **(22,28)**. Only the previously documented index-product operand gives the dual (5,23) among those seven aggregations. An independently generated polynomial is also recovered under both coordinate registers as an implementation positive control.

## Reversible hypothesis on the following original page

The following p8 has **255 source GP29 runes**: a twelve-rune red heading and an exactly **243 = 3⁵** rune black body. A minimal possible immediate consumer of five source coefficients is the five-axis base-three tensor difference. Fix each of the two interpolated five-coefficient vectors, each coefficient orientation, both signs, and forward/backward axes, yielding **16 bounded source-derived operators**. Apply each to all 243 original black runes, unchanged, and score the output against a source-native LP1 trained GP29 trigram model plus clear p57.

**No registered output approaches clear GP-native prose or recovers an unknown 150-rune passage.** The test rejects only these sixteen direct tensor-consumer rules. It leaves the Shamir/DH structural coincidence intact and supplies no key for the other pages.

## P0 original-body transfer after vertical dot sort (Agent2, later 21 November)

The independently established vertical ranks [3,5,1,4,2] can also be treated as a **permutation of the five printed red words**, by pairing dots and words in horizontal order and then reading words from highest to lowest dot. This gives the GP29 first-index sequence [5,6,23,14,22] and mod29 product sequence **[8,2,11,15,26]**. Their first two source-word heads/products reproduce `g=5,a=6,A=8,K=2`; the third head gives `p=23`. The historical DH state and height ranks were already known, so this is a secondary *interpretation*, not a new independently recovered key or previously unobserved image ordering. The identical five-dot ornament also occurs at p23 and solved p56 under reflections.

One fixed prospective p0-body consumer was evaluated: use the height-ordered five products as a repeated 5-period additive key on all 249 original p0 black-body runes, resetting at rune offset13. For comparison the original printed-order products are treated identically. Both signs and both orders exactly re-encrypt, but the full native-GP IoCs are **0.033780/0.035983** (height order, subtract/add) and **0.035562/0.034201** (print order, subtract/add), compared with untouched black-body IoC **0.034363** and solved clear p57 **0.062710**. No native plaintext. The earlier retrospective p0 marker RISE/H key still recovers only the known 13-rune red-title candidate `EPIPHANYSEECS` under either representation of the same DH state. This leaves the source-selected body KDF/clock/inverse unspecified; do not fit phases or further ad hoc permutations.

[Cross-page p0 original-source reproducer](../sims/lp2_p7_five_dot_height_dh_handoff_sft.cjs) · [Windows Node22 execution, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44944583720).

## Research decision

This is a **new geometry-constrained candidate mechanism for recovering already-known key-state constants from the original manuscript**. Its merit is that the dot heights supply an actual missing order permutation, while Cicada's earlier puzzle historically used the five-share operation. It may be useful if a future independent original clue specifies how to consume the resulting parameters.

The direct p8 tensor and p0 period-five body consumers both fail to recover plaintext. The **central limitation** remains: no original LP2 instruction explicitly says to use Shamir over GF29, no independent ciphertext/key receiver was identified, the source red-word products and target DH values were known before this test, and the direct following-page decoder fails. The global hypothesis family and discovery-aware chance probability are unmeasured. **Do not promote a new solved page, unknown key, or authorial operation** on this evidence.

**Reproducer:** [source-native Windows Node22 CommonJS single-file test](../sims/lp2_p7_fivedot_shamir_dual_secret_sft.cjs), including the original JPEG SHA, all five rune products, unchanged dot ranks, two GF29 polynomials, synthetic interpolation control, full 120-permutation enumeration, six competing aggregations, and original p8 16-way receiver. [Independent Windows CI execution](https://github.com/FlareZ123/liber-primus/actions/runs/44941697115).

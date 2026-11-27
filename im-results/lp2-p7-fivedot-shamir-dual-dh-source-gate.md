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

## Entire following p8 as 51 five-share records (Agent5, 22 November 2026)

A second original p8 recipient, distinct from the **243-rune black 3⁵ tensor** analyzed above, is implied by a source-simple integer equality: **the complete adjacent physical page p8 has 255 GP29 runes = 51 × 5**. The five p7 red words and five source-visible black dots permit exactly five x-positions for ordinary degree-four GF29 Shamir interpolation. A prior p7 red-product report already supplied source values **[11,26,8,15,2]**. Freeze those, the horizontal dot ranks **[1,2,3,4,5]**, and image-derived vertical dot ranks **[3,5,1,4,2]** as the only three coordinate systems. Freeze two elementary readings of **all 255 original p8 runes**: 51 consecutive five-rune records, or five contiguous lanes each of51 runes. No black-body skip, secret x-position fitting, replacement symbols or page offset is admitted.

The exact GF29 Lagrange interpolation weights for the three coordinate lists are respectively **[5,19,10,24,1]**, **[10,1,5,24,19]**, **[6,14,20,3,16]**. Each set sums to 1 mod29 and annihilates monomials of degrees1 through4, so the recovered constant is explicitly reproducible on original ciphertext.

| Original p7 x-register | Full p8 tape reading | Recovered original GP29 symbols | Original output GP29 IoC |
| --- | --- | ---: | ---: |
| Horizontal ranks | 51 adjacent groups of five | **51** | 0.036862745 |
| Horizontal ranks | Five 51-rune lanes | **51** | 0.031372549 |
| Vertical ranks | 51 adjacent groups of five | **51** | 0.028235294 |
| Vertical ranks | Five 51-rune lanes | **51** | 0.036078431 |
| Original p7 red-word products | 51 adjacent groups of five | **51** | 0.035294118 |
| Original p7 red-word products | Five 51-rune lanes | **51** | 0.031372549 |

**No recovered 51-rune register resembles native GP29 English, a meaningful instruction or a known destination.** The best IoC remains below **0.037**, whereas the first 51 verified plaintext runes of original solved p57 have IoC **0.054901961**. The complete [Windows Node.js 22 original-data SFT](../sims/lp2_p7_fivedots_p8_255_shamir51_original_sft.cjs) also generates fresh degree-four GF29 polynomials whose constant terms are the real 51 first clear-GP symbols of p57, evaluates every one at the source coordinates in both layouts, and recovers **51/51** genuine native-GP source symbols in **all six** positive controls. It preserves p7's full original red-word packet and every original p8 rune. [Passing Windows run 45029070536](https://github.com/FlareZ123/liber-primus/actions/runs/45029070536).

**Important source-design objection:** p8 visibly contains **12 red heading runes followed by243 black body runes**. Grouping all 255 into five-rune sharing records crosses that original ink boundary, so even the arithmetically exact 255=51×5 may be accidental. The historical 2013 Shamir system also used a **different GF(2^176) field and packet serialization**. The exact test rejects these six direct GP29 share-to-plaintext outputs; it does not exclude other authentic keyed mechanisms or the unresolved 243-rune black tensor.

## P0 original-body transfer after vertical dot sort (Agent2, later 21 November)

The independently established vertical ranks [3,5,1,4,2] can also be treated as a **permutation of the five printed red words**, by pairing dots and words in horizontal order and then reading words from highest to lowest dot. This gives the GP29 first-index sequence [5,6,23,14,22] and mod29 product sequence **[8,2,11,15,26]**. Their first two source-word heads/products reproduce `g=5,a=6,A=8,K=2`; the third head gives `p=23`. The historical DH state and height ranks were already known, so this is a secondary *interpretation*, not a new independently recovered key or previously unobserved image ordering. The identical five-dot ornament also occurs at p23 and solved p56 under reflections.

One fixed prospective p0-body consumer was evaluated: use the height-ordered five products as a repeated 5-period additive key on all 249 original p0 black-body runes, resetting at rune offset13. For comparison the original printed-order products are treated identically. Both signs and both orders exactly re-encrypt, but the full native-GP IoCs are **0.033780/0.035983** (height order, subtract/add) and **0.035562/0.034201** (print order, subtract/add), compared with untouched black-body IoC **0.034363** and solved clear p57 **0.062710**. No native plaintext. The earlier retrospective p0 marker RISE/H key still recovers only the known 13-rune red-title candidate `EPIPHANYSEECS` under either representation of the same DH state. This leaves the source-selected body KDF/clock/inverse unspecified; do not fit phases or further ad hoc permutations.

[Cross-page p0 original-source reproducer](../sims/lp2_p7_five_dot_height_dh_handoff_sft.cjs) · [Windows Node22 execution, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44944583720).

## Primary 2013 SSSS field and packet reconstruction (Agent3, 26 November 2026)

The prior comparison relied on a later historical walkthrough. The primary corpus now has three original 2013 cleartext-PGP-signed share messages mirrored verbatim in `resources/historical/2013-ssss-{03,09,10}.asc`. Each carries the header `ssss, Threshold:5` and one 44-hex-character share value:

| Share index / x | 176-bit serialized value |
|---:|---|
| 03 | `7678a5f6b72042d839151b34b02ffe161cf997fed484` |
| 09 | `82a98a7fe06014f783b752506cf6cd1fabaa3d8b3750` |
| 10 | `1668a611ba9fccddee2a0d8fd7e05df4d01c6d42a26d` |

The archive's 2013 signing-key artifact is identified by fingerprint `67F363C61BA8FB6FDBA9C47D0670B0E57A35090F` and linked in [the primary-source index](../resources/external/2013-ssss-primary-source-index.md). The three messages contain PGP signature blocks. The original signed-message corpus preserves 03, 09 and 10; additional historical walkthroughs preserve **seven distinct numerical share values** (02,03,05,07,08,09,10). See the [source index](../resources/external/2013-ssss-primary-source-index.md). Exact native-format reconstruction recovers the already documented historical destination `p7amjopgric7dfdi.onion` from all 21 five-share subsets, with 42/42 held-out share predictions. The native default diffusion is required to reproduce that text. This is historical reconstruction, not an LP2 key.

The preserved B. Poettering `ssss` v0.5 implementation ([source file at pinned mirror commit](https://github.com/osresearch/ssss/blob/e2d11c3c128c992947afbe18accb7be1ac55feed/ssss.c), blob `0955e250971da324412fdc8454888881df9d3411`) supplies the missing serialization mechanics. In `combine`, a share's hexadecimal payload sets the field degree to four times its character length; 44 hex digits therefore select **176 bits**. `field_init` selects the degree-176 irreducible polynomial
[
x^{176}+x^{11}+x^3+x^2+1
]
over GF(2). Thus each share is one element of **GF(2^176)**, not 22 independent GF(256) bytes and not an element of GF(29). The split routine evaluates at `x=i+1`, so share labels 03, 09 and 10 correspond to x=3,9,10; combine reads that prefix as x, removes the monic x^5 term and interpolates the remaining degree-four polynomial at x=0. The signed message explicitly fixes threshold 5. The 2013 round is documented as 5-of-10; the surviving index 10 is consistent with ten shares, although the three signed fragments alone prove only that the set reaches at least x=10.

The v0.5 implementation enables its diffusion layer by default and exposes `-D` to disable it. The signed messages do not preserve the exact command line/version flags, but native default diffusion reproduces the documented historical plaintext from every five-share subset. This uncertainty does not alter the field degree, share width, or x-coordinate convention.

**Bridge test:** p7's independently extracted red-word products are the small GP29 scalars **[11,26,8,15,2]**, with five black dots. None is a serialized 176-bit share; several are outside the historical share-coordinate range 1–10; p7 provides neither 44-hex values nor a source-selected conversion to GF(2^176), nor ten share indices. The five dots can at most resemble the historical threshold numeral 5. The same five-dot ornament recurs on p23 and solved p56, so it does not independently identify SSSS. No original LP2 instruction or primary 2013 artifact bridges p7's GP29 packet to this 2013 GF(2^176) scheme.

**Decision:** reject the p7-as-2013-Shamir-share interpretation as a source-selected mechanism. Preserve the geometric GF29/DH coincidence as an intermediate observation only; do not search arbitrary GP29-to-GF(2^176) encodings or promote a key/plaintext. The historical secret is reconstructible using the additional public numerical transcriptions; this does not supply a p7-to-historical-key bridge.

## Historically faithful monic-polynomial analogue (Agent3, 27 November 2026)

The [reconstructed 2013 SSSS control](../sims/cicada_2013_ssss_recovery_sft.cjs) establishes that the native sender adds the fixed monic degree-five term, and its receiver removes that term before quartic interpolation. Over GF29 the corresponding algebraic analogue is subtraction of x^5 (not characteristic-two XOR). The prior p7 dual-secret coincidence uses ordinary quartic interpolation, omitting this historical convention. For five distinct nonzero points, the interpolation-at-zero correction is their product, since x^5 minus its degree-four interpolant equals the monic polynomial with those five roots.

| Coordinate register | Ordinary quartic constant | Monic correction mod29 | Native-convention analogue constant |
|---|---:|---:|---:|
| Horizontal dot ranks | 5 | 4 | 1 |
| Vertical dot ranks | 23 | 4 | 19 |
| Red-word products | 0 | 26 | 3 |

Both dot-rank registers contain 1–5, so both subtract 120 mod29 = 4. The previously reported (5,23) DH pair becomes **(1,19)**. The historical 2013 implementation does not independently support the exact arithmetic that produces the DH pair. Ordinary textbook Shamir remains a possible generic inspiration; this is a convention-specific objection, not a general exclusion.

For the fixed p8 255-rune recipient (51 adjacent records or five lanes), the native analogue changes each recovered rune by one common shift per coordinate register. The six original output tapes:

- 1,2,3,4,5 / adjacent: `EOTATOESGPDOEOEOIANGAEEOJWNGOESCCNDUNUDHAESRTEONGIATAECOEEAORLEAPOAOE` (IoC 0.036862745).
- 1,2,3,4,5 / lanes: `SFYRWPEAEEOIFBEAEAETHRINGLNYJHLEOYCGTHROEAESUTEOEALBNGLIATYOELNGGBX` (IoC 0.031372549).
- 3,5,1,4,2 / adjacent: `AJTHBJPXBIAGGIWFHRGPOAEHGLTEABXFAENRIWDJSSAEEOXNGEAPFIADOENGNGMTH` (IoC 0.028235294).
- 3,5,1,4,2 / lanes: `TOEYGFEOTJEODINPIARAWEUOUOJEOWTOETNYADBIIOEDIATLFNGISNGFJXD` (IoC 0.036078431).
- 11,26,8,15,2 / adjacent: `FFNJFBOOEASNGJUBOXTACONIAAEJATHFGEEOEAYAENDNRAEXGTHIAFLEAGYJPPC` (IoC 0.035294118).
- 11,26,8,15,2 / lanes: `NGTHBEAGTEONIANNEAEGDWDRATSAEEOAEUJEAAEHIAEPEEOPTHGXDYEOFEOEANGAFHB` (IoC 0.031372549).

None yields recognizable prose; IoC is invariant under the common translation. The six monic degree-five plants using genuine p57 first 51 plaintext runes recover 51/51 each. [Reproducer](../sims/lp2_p7_native_monic_shamir_original_sft.cjs); canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`. Connected V8 core executed; original p7 constants independently checked in Python. No broader key/clock search or LP2 plaintext claim.

## Reconstructed historical secret as a direct BASE29 operand (Agent3, 27 November 2026)

The historical SSSS reconstruction now supplies actual bytes rather than guessed shares. The independently signed 2013 TCP specification defines BASE29, with 3301 → 3QO; the participant witness gives 1033 → 16I. As a limited cross-round transfer, interpret the complete 22-byte reconstructed destination and the 22-byte pre-diffusion field constant as big-endian integers, apply minimal BASE29, and interpret each resulting digit value as a GP29 shift. This is a proposed bridge, **not a source instruction**; the BASE29 command itself does not specify a byte-to-integer conversion or a rune cipher.

| Input | Exact 36-digit key |
|---|---|
| ASCII `p7amjopgric7dfdi.onion` | `RE5H5Q0MSBALI2P09QSEHBF8LG76B9EEOA83` |
| Field constant `65b9c4065cc47a4a48e01d17de166a94252dfbb44e69` | `OQJ9AE61BR14BA7P733NC2IPE4G1H5PHJN8I` |

Freeze phase zero at p8's black-body start after its 12 red runes; no phase fitting, no alternate serialization or key stretching. Decode all 243 runes, then freeze the resulting end phase and continue into all 268 original p9 runes. Both arithmetic signs and ordinary versus literal plaintext-F holds are tested. An exact max-sum DP retains the best history for each (key phase, preceding decoded rune), branching on every ciphertext F which can be an emitted hold or legal consuming non-F. The score is a smoothed bigram model trained on 3,001 approximately GP-transliterated LP1 reference runes, excluding LP2 p56/p57. Scores are diagnostics, not a calibrated universal threshold.

| Key | Sign | Ordinary p8 / p9 mean log score | F-hold p8 |
|---|---:|---:|---|
| Destination | + | −4.304 / −4.208 | No legal full history |
| Destination | − | −4.386 / −4.149 | No legal full history |
| Field constant | + | −4.282 / −4.322 | No legal full history |
| Field constant | − | −4.334 / −4.217 | No legal full history |

The ordinary outputs are nonprose and exactly re-encrypt. Held solved p57 scores −2.616; all eight same-key p57 plants admit exact replay, seven recover all 95 runes and the field-constant minus F-hold MAP recovers 87/95 (ambiguity in language ranking). The four original F-hold negatives are structural, independent of the score. No new plaintext. Retire these direct, phase-zero historical-key receivers; arbitrary phase offsets, other clocks and transformations were not tested. No independent source selects the historical secret as an LP2 operand, so do not expand this key family just because the recovered destination is authentic.

[Executable receiver](../sims/lp2_2013_ssss_base29_p8_receiver.cjs), original corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, code commit `d1a832146b998e445f9def66b7d61eb6f7a5c1f1`. Connected V8 core executed; filesystem wrapper/CI not independently executed.

## Full-coefficient lossless interpolation receiver (Agent3, 27 November 2026)

The earlier 51-rune experiment retained only the interpolated constant and discarded four coefficients per record. A genuinely reversible interpretation instead treats each original five-rune record as five evaluations of a degree-four polynomial (or of the historically motivated fixed monic degree-five polynomial), then emits **all five** coefficients. This uses the same three frozen x registers `[1,2,3,4,5]`, `[3,5,1,4,2]`, and `[11,26,8,15,2]`; no key or matrix elements are fitted. The Vandermonde map is invertible because each register has distinct coordinates. Monic interpolation subtracts the known x^5 term before interpolation. Test adjacent records and five contiguous lanes, with either record-major or degree-major coefficient serialization: 24 full receivers. The p8 input is all 255 physical runes (including its red rubric); freeze each receiver for physical p9's first 265 runes (53 complete records), with its last three copied unchanged solely to make the framing reversible. No phase or coefficient permutation search.

| Diagnostic | Result |
|---|---:|
| Original p8 raw mean trigram log probability | -3.506158 |
| Best full p8 inverse (vertical coordinates, monic, adjacent→degree-major) | -3.449953 |
| Same frozen p9 inverse | -3.509499 |
| Best individual p8 coefficient lane (vertical, ordinary, adjacent, constant) | -3.339012 |
| Same frozen p9 coefficient lane | -3.511494 |
| Raw p9 265-rune reference | -3.518239 |
| Actual clear p57 reference | -2.668243 |
| Native-derived 255/268-rune positive samples | -1.955843 / -2.005589 |

All 24 p8 and p9 inverse/re-encryption checks restore every original symbol, including the explicitly untransformed p9 tail. All 48 same-mechanism native-derived plant trials recover every rune. All five coefficient lanes were examined; the best lane is the previously examined constant, and its continuation is nonprose. The best full p8 inverse has IoC .03433688 and frozen p9 .03396226. No readable multiword continuation emerges. The 2,399-rune approximate LP1 trigram training reference includes parts of the positive samples, so these positive scores are illustrative rather than blind discrimination; the untouched real p57 reference is independent. Coefficient decoding is affine-linear, so original round trips do not distinguish historical keys. The three coordinates and the five-rune framing remain proposed rather than authenticated; the p8 color boundary cuts a record.

**Decision:** retire this full-coefficient alternative to the previous lossy constant-only receiver. It resolves the objection that useful plaintext could have been discarded in the other four polynomial coefficients *for the fixed coordinates and serializations*. It supplies neither plaintext nor a source-selected secret. Do not tune an arbitrary coefficient order or add a new cipher layer to rescue it.

[Reproducer](../sims/lp2_p7_p8_full_polynomial_coefficients_sft.cjs), commit `7ddf6bca1f727ef833bfd56600fb06c1306c2ed1`; corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, reference `8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d`. Connected JavaScript core executed; standalone filesystem wrapper not separately executed.

## Research decision

This is a **geometry-constrained ordinary-quartic coincidence with already-known key-state constants**. The actual 2013 sender's fixed monic term removes the dual DH match in the corresponding GF29 analogue. Its merit is that the dot heights supply an actual missing order permutation, while Cicada's earlier puzzle historically used the five-share operation. It may be useful if a future independent original clue specifies how to consume the resulting parameters.

The direct p8 tensor, p0 period-five body, reconstructed historical secret's phase-zero BASE29 p8/p9, and lossless five-coefficient interpolation consumers all fail to recover plaintext. The **central limitation** remains: no original LP2 instruction explicitly says to use Shamir over GF29, no independent ciphertext/key receiver was identified, the source red-word products and target DH values were known before this test, and the direct following-page decoder fails. The primary 2013 source reconstruction now fixes the historical comparison scheme as GF(2^176), polynomial x^176+x^11+x^3+x^2+1, index-prefixed 44-hex shares, and threshold 5; no GP29 bridge exists. The global hypothesis family and discovery-aware chance probability are unmeasured. **Do not promote a new solved page, unknown key, or authorial operation** on this evidence.

**Reproducer:** [source-native Windows Node22 CommonJS single-file test](../sims/lp2_p7_fivedot_shamir_dual_secret_sft.cjs), including the original JPEG SHA, all five rune products, unchanged dot ranks, two GF29 polynomials, synthetic interpolation control, full 120-permutation enumeration, six competing aggregations, and original p8 16-way receiver. [Independent Windows CI execution](https://github.com/FlareZ123/liber-primus/actions/runs/44941697115).

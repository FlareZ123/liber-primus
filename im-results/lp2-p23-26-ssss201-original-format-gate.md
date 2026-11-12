# LP2 p23–26 five-dot chapter: historical SSSS whole-field inversions against physical p2

**Decision (12 November 2026, Agent21):** The original five post-heading 201-rune source strands fit historically supported **984-bit SSSS fields**. Two distinct full-cipher tests now close both natural roles for the separate 201-rune physical **p2**: **120,960** exact five-share reconstructions yield no original-p2 shared secret before or after the genuine historical XTEA diffusion; **1,209,600** exact six-point monic-quintic consistency tests find **no valid p2-as-sixth-share**. A complete reverse-XTEA readout of all 120,960 reconstructed secrets yields no coherent text or Tor/HTTP/PGP artifact. The 2013 period-original onion output and full-size planted controls succeed. These are source-bounded exclusions, with **no authentic unknown LP2 plaintext, key or continuation recovered**.

## Why the exact historical protocol matters

The 2013 Cicada poster/ISO/phone continuation used the **ssss 0.5** share format: decimal share IDs (01..10), fixed-width hexadecimal y-values, and polynomial arithmetic over **one whole-secret field** GF(2^(8n)), with n 1..128 bytes. The five-of-ten scheme is a **monic quintic** (\`x^5+c4*x^4+...+c0\`); the output constant passes through a reversible XTEA diffusion layer. The actual 2013 share payloads were 44 hex digits, so their field is GF(2^176) with polynomial \`x^176+x^11+x^3+x^2+1\`. The previously recorded LP2 GF(2^8) bytewise five-point illustration is deliberately a synthetic example, **not** the 2013 literal SSSS algorithm.

Original implementation: [ssss 0.5 source](https://github.com/osresearch/ssss/blob/master/ssss.c), especially \`field_init\`, \`split\`, \`combine\`. An archived positive control is [the authenticated/participant-preserved 2013 share reconstruction](pklmx-2013-onion-continuation-gate.md); its full reconstruction tool is [2013_shamir_missing_shares_sft.cjs](../sims/2013_shamir_missing_shares_sft.cjs).

## Source-only LP2 capacity gate: selected 976-bit model

The unmodified original physical pp23–26 contain 213,270,273,265 rune indices. Remove exactly the 16-rune red heading on p23; 1,005 symbols remain. The five black dots suggest, but do not prescribe, five shares. An ordinary source-readable numeric interpretation is GP alphabet index 0..28 as a base-29 digit (the 2013 Cicada signed TCP challenge separately knew the BASE29 numeral operation). Preselect only (a) five quintet-column streams, (b) five consecutive 201-rune blocks, and full within-lane reversals as an explicit direction control.

201 GP29 digits have `201*log2(29)=976.4541800` bits of maximum entropy, so a general injective fixed-width byte encoding needs **123 bytes / 984 bits**. The historical `ssss` v0.5 field limit is **1024 bits**, not 976. Its 984-bit polynomial is `x^984+x^24+x^9+x^3+1`; all original 201-digit strings are legal elements of that field. An *unrestricted* 984-bit element may need **203** base-29 digits to express, but it is a different demand from encoding a given 201-digit input into 123 bytes. A 976-bit field is instead an optional special case under which every 976-bit value can be rendered in 201 digits, while some 201-digit strings are too large.

For that smaller, unselected field only, the original-input 976-bit polynomial is `x^976+x^17+x^10+x^6+1`. The exact measured bit lengths are retained below as a **conditional test**, not an original SSSS format obstruction.

| Five-strand serialization | Exact bit lengths, original group order | Indices exceeding the optional 976-bit field (0-based) |
| --- | --- | --- |
| Interleaved quintet columns, printed | 977,975,976,977,976 | 0,3 |
| Interleaved quintet columns, each reversed | 975,976,977,976,977 | 2,4 |
| Five consecutive blocks, printed | 977,976,977,975,975 | 0,2 |
| Five consecutive blocks, each reversed | 976,977,976,975,977 | 1,4 |

No share-identifier assignment can make those two out-of-range values legal **within the optional 976-bit field**. Every one of the twenty tested integers is already valid in a **historically supported 984-bit field**, without reduction, truncation or a new alphabet. Thus there is **no universal format obstruction**. The historical 984-bit program does permit an exact lossless original-field reconstruction. The **complete inverse against an independent p2 target** now excludes one concrete consumer of it, detailed below. Five-share interpolation itself is generic, so different target material would still require an original-source instruction.

**CI:** [passing original-source SFT, run 43164068830](https://github.com/FlareZ123/liber-primus/actions/runs/43164068830), executed on the unmodified repository corpus on 12 November 2026.


## Complete 984-bit original-cipher consumer (Agent21)

Original LP2 p2 contains **201** GP29 runes. The five-dot-marked p23–26 body has **1,005** original runes after removing precisely its red16 heading, giving five **201-rune** consecutive strands or columns of 201 quintets. A 201-rune source order can be interpreted as a single unsigned base29 integer using the canonical Gematria Primus indices 0–28. Because 29^201 is smaller than 2^984, all five original share values fit the 984-bit field without reduction or truncation.

The historical field modulus is **x^984 + x^24 + x^9 + x^3 + 1** over GF(2). The period-original ssss shares are evaluations of **x^5 + c4*x^4 + c3*x^3 + c2*x^2 + c1*x + c0** at distinct nonzero decimal identifiers. Subtract the known monic term x^5 from each share and use exact five-point Lagrange interpolation in this field to recover encoded c0. The original 2013 executable further applies a reversible 40-round-schedule XTEA diffusion to c0.

The source-constrained test enumerates **all 10P5 = 30,240 ordered assignments** of five share IDs in 01..10 for each of the four original readings. For each exact recovered c0, test both orientations of physical p2 as either the direct encoded c0 or as the decoded secret, in the latter case comparing against the exactly XTEA-encoded p2 target.

| Original reading | ID assignments | Outputs representable by 201 base29 digits | Best exact matching GP positions to p2 or reverse | Direct p2 recovery, including XTEA |
| --- | ---: | ---: | ---: | ---: |
| Quintet columns, forward | 30,240 | 489 | 14 / 201 | **0** |
| Quintet columns, reversed | 30,240 | 726 | 17 / 201 | **0** |
| Consecutive blocks, forward | 30,240 | 274 | 14 / 201 | **0** |
| Consecutive blocks, reversed | 30,240 | 689 | 17 / 201 | **0** |

The literal natural assignment IDs 01..05 in original strand order produces four decoded 123-byte values having **44, 54, 48, 47 printable ASCII bytes** respectively; no readable prose or typed artifact appears. Their byte entropies are **6.40991, 6.51361, 6.50134, 6.49520 bits/byte**. As direct preimages of the printed LP2 p56 64-byte target (also preserved in the 2014 anend 56.bin witness), these four exact outputs were hashed under **SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256(64)**: **0/16 exact matches**. The digest algorithm is not specified by the p56 text. The 2014 archive's `56.bin` is the exact same 64-byte digest printed on LP2 p56, so this is a direct test of the actual p56 target, not a separate cross-round target. It retires only these four natural outputs as direct preimages under these four 512-bit families, not their possible use as key material. The updated [original 984-bit SFT](../sims/lp2_p23_26_ssss984_p2_original_gate_sft.cjs) preserves the four 123-byte outputs and all digests.

**Functional controls:** The actual preserved 2013 GF(2^176) encoded secret, after exact historical XTEA reversal, recovers **p7amjopgric7dfdi.onion** byte-for-byte, and re-encoding reproduces its source bytes. A synthetic five-share monic quintic using the **unmodified full 201-rune p2** as its secret recovers that 984-bit value exactly. The previous smaller-field SFT's synthetic positive plant was also corrected to match the real historical Horner evaluator: its former implementation multiplied once too many times, yielding a degree-six leading term rather than the intended degree five.

**New SFT:** [complete original 984-bit inversion](../sims/lp2_p23_26_ssss984_p2_original_gate_sft.cjs) on Node.js 22, with original rune corpus assertions and no external packages or network calls. [Original GitHub Actions run, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/43286894266). The prior [976-bit source capacity and original 2013 polynomial SFT](../sims/lp2_p23_26_ssss201_field_gate_sft.cjs) remains a narrowly scoped companion.

## Complete 120,960-output historical XTEA plaintext test

The full pre-XTEA five-share search above is now paired with the period-original **ssss 0.5 inverse XTEA diffusion on every recovered 123-byte constant**, under all four already-frozen source order/direction readings and all 30,240 historical share-ID assignments per reading. The independently known 176-bit 2013 encoded field constant again decodes byte-for-byte to \`p7amjopgric7dfdi.onion\` using the identical per-field algorithm. For each of the resulting **120,960** original LP2 outputs, count ASCII-printable bytes, longest contiguous printable run, zero bytes and recognizable original artifact markers.

| Complete original search | Observation |
| --- | ---: |
| Full historical XTEA readouts | **120,960** |
| Maximum printable ASCII bytes in 123-byte outputs | **72** |
| Maximum ASCII-alphanumeric bytes in any output | **56** |
| Maximum contiguous printable run | **16** |
| Maximum zero bytes in any output | **6** |
| Literal complete \`.onion\`, \`http\` or \`BEGIN PGP\` occurrences | **0** |

The most ASCII-printable readout is still binary-looking, with 72 printable bytes separated by nontext bytes. No output supplies recognizable plaintext or an endpoint. These exhaustive finite observations do not rule out a later source-selected cipher layer, structured binary output or key material. They reject the immediate *SSSS → ordinary readable plaintext/address* hypothesis under the original four source encodings and period share IDs.

**Reproduction:** [portable C++20 and Boost C++ original-source SFT](../sims/lp2_p23_26_ssss984_full_xtea_ascii_sft.cpp), with exactly 1005 original source GP29 digits frozen and the historical 176-bit onion positive control. The complete program asserts all five maxima and 120,960 readouts. [Successful GitHub Actions run 43289947748](https://github.com/FlareZ123/liber-primus/actions/runs/43289947748).

## Independent p2-as-sixth-share monic-quintic identity

The physical 201-rune p2 may be **an additional sixth point** in the period-original five-of-ten secret-sharing polynomial, rather than its secret. This interpretation is independent of p2-as-constant and requires neither text recognition nor XTEA. It uses the same original p23 heading/5×201 partition, the same exact GF(2^984) and decimal historical IDs 01..10, and exactly the two original p2 reading directions. The monic degree-five form is historically documented.

For six distinct share IDs \`x0...x5\`, define \`D = PRODUCT_{i<j}(xi XOR xj)\` and \`W_i = PRODUCT_{j<k, j≠i, k≠i}(xj XOR xk)\`, with products in the same field. The six original 201-digit values, if evaluations of one **monic degree-five polynomial**, must satisfy this *key-independent* necessary and sufficient leading-coefficient identity:

\`(W_0*y_0) XOR ... XOR (W_5*y_5) = D\`.

It is exact because the leading Lagrange coefficient is \`SUM_i y_i/PRODUCT_{j≠i}(xi XOR xj)\` in GF(2^984). Multiplication by the nonzero Vandermonde product \`D\` yields the displayed identity. Each weight is computed entirely from six small historical ID numbers and is independent of the 984-bit ciphertext values; the arithmetic does not construct/favor a secret or score English prose.

Enumerate **all 10P6 = 151,200 assignments** of six distinct decimal identifiers from 1..10 for each of the four p23 strand readings and **both p2 directions**. This gives exactly **1,209,600** original-input six-point predictions. **Zero** satisfy the monic quintic identity. The minimum Hamming weight of any original 984-bit field residual against the required identity is **420 bit positions**, far from zero, although this distance is not a corrected statistical significance measure.

A source-shaped positive plant constructs \`y(x)=x^5+c0\` with its sixth point forced to exactly the original 201-rune p2 unsigned base29 integer. Its full six-point identity is **exactly satisfied**. This validates the original p2 shape and the six-share forward and inverse algebra without choosing any plaintext words.

**Reproduction:** [full original GF(2^984) six-point Common C++20 SFT](../sims/lp2_p2_p23_26_ssss984_sixth_share_sft.cpp), using exact frozen source input, all 210 ID sets, all 720 ordered assignments, four layouts and two p2 directions. The preceding five-point gate is algebraically different: the six-point gate excludes any **unknown** lower five coefficients, since they vanish from the sixth finite divided difference. [Successful complete SSSS six-point CI run 43291769967](https://github.com/FlareZ123/liber-primus/actions/runs/43291769967).

## Decision and next real source condition

Both natural physically equal-length roles for original **p2** are now directly excluded under the four source-native source readings, the real 984-bit ssss monic quintic and all period-available IDs 01..10. The complete reverse-XTEA readout yields no ordinary plaintext, onion/HTTP endpoint or PGP message. Four fixed natural IDs01..05 also fail as direct preimages of LP2 p56's printed 64-byte digest under SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256(64) (0/16). More strongly, Agent21's independent C++ SFT exhausts all 120,960 source-valid 5-of-10 assignments across four layouts and tests both raw encoded and XTEA-decoded 123-byte serializations under SHA-512: **0/241,920** direct preimages. This closes the complete source-valid assignment space as a direct SHA-512 preimage in either serialization; the other three digest families were tested only for the natural assignment. The archived 2014 56.bin witness is byte-identical to p56's printed digest, not a separate target. See `sims/lp2_p23_26_ssss984_p56_sha512_preimage_sft.cpp`. None of these tests proves the five-dot chapter does not contain a cipher, nor can they exclude a different source-selected share receiver, framing or second cryptographic layer.

The source-visible 201-rune length equality is now exhaustively resolved for both historically available SSSS roles; repeating additional unselected ID/key searches would merely multiply plausible nulls. Future work requires an independent original-artifact instruction that selects a **different exact recipient, payload type or key use**. Focus on distinct operations or original external key material.

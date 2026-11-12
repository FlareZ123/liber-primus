# LP2 pp23–26 five-dot chapter: historical SSSS field and completed original-p2 inverse

**Decision (12 November 2026, Agent21):** The five post-heading 201-rune source strands fit the genuine historical ssss v0.5 **984-bit** field. A complete original-cipher inverse now examines **120,960 exact 984-bit monic quintic reconstructions** across the four source-native layouts/readings and all distinct assignments of five historical IDs 01–10. The separately original **201-rune physical p2** is tested as the shared secret, with either reading direction and with or without the historical XTEA diffusion step. **Zero reconstruct p2**. The original-order outputs are also unreadable. This closes this specific p2-as-SSSS-secret model without recovering any other unknown plaintext, key or destination.

The previous capacity restriction was conditional: **two of five** original 201-digit values in each reading exceed a deliberately smaller **976-bit** field, while **all five** fit the historically supported **984-bit** field. The genuine participant 2013 sample itself used **176-bit** shares and cannot directly carry these 201-rune LP2 streams.

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

The literal natural assignment IDs 01..05 in original strand order produces four decoded 123-byte values having **44, 54, 48, 47 printable ASCII bytes** respectively; no readable prose or typed artifact appears. Their byte entropies are **6.40991, 6.51361, 6.50134, 6.49520 bits/byte**. As direct preimages of the printed p56 64-byte target, these four exact outputs were hashed under **SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256(64)**: **0/16 exact matches**. The digest algorithm is not specified by the p56 text; this retires only these four natural outputs as direct preimages under those four 512-bit families, not their possible use as key material. The updated [original 984-bit SFT](../sims/lp2_p23_26_ssss984_p2_original_gate_sft.cjs) preserves the four 123-byte outputs and all digests.

**Functional controls:** The actual preserved 2013 GF(2^176) encoded secret, after exact historical XTEA reversal, recovers **p7amjopgric7dfdi.onion** byte-for-byte, and re-encoding reproduces its source bytes. A synthetic five-share monic quintic using the **unmodified full 201-rune p2** as its secret recovers that 984-bit value exactly. The previous smaller-field SFT's synthetic positive plant was also corrected to match the real historical Horner evaluator: its former implementation multiplied once too many times, yielding a degree-six leading term rather than the intended degree five.

**New SFT:** [complete original 984-bit inversion](../sims/lp2_p23_26_ssss984_p2_original_gate_sft.cjs) on Node.js 22, with original rune corpus assertions and no external packages or network calls. [Original GitHub Actions run, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/43286894266). The prior [976-bit source capacity and original 2013 polynomial SFT](../sims/lp2_p23_26_ssss201_field_gate_sft.cjs) remains a narrowly scoped companion.

## Decision and next real source condition

The direct **p2-as-SSSS-secret** hypothesis fails across all period-available share IDs and these four natural 201-rune source readings, even after the genuine XTEA layer. The four natural IDs01..05 outputs also fail as direct p56 preimages under the four tested 512-bit digest families. The manuscript gives no independent choice of other identifiers, serialization, consumer page or typed secret. Their possible key use remains untyped; do not search arbitrary cipher consumers without a source-selected receiver. Five strands may still serve an entirely different operation; these results cannot eliminate that possibility.

Do not commission another arbitrary identifier sweep. A useful renewed five-share route would first require a **source-visible receiver or source-selected output type**, ideally a known plaintext prediction. The [separate observed-2013-share-format analysis](lp2-p23-26-ssss-original-format-gate.md) correctly explains why the original 176-bit shares cannot directly be these full LP2 strands.

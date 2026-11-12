# LP2 pp23–26 five-dot chapter: genuine 2013 SSSS whole-field serialization gate

**Corrected decision, Critic audit 12 November 2026:** Of four source-order 201-digit base-29 packings of the original five p23–26 strands, **two of five integers exceed 2^976 in each layout**. That excludes only a **deliberately restricted 976-bit (122-byte) field**. The actual `ssss` 0.5 program permits 984-bit (123-byte) fields; every original 201-digit value is smaller than `29^201 < 2^984` and therefore fits as an injectively encoded field element. The former claim that all four layouts are illegal in the historical SSSS format was incorrect. The genuine 2013 sample is only 176 bits and cannot directly carry unrestricted 201-rune strands. Missing LP2 evidence for a 984-bit codec, IDs, or output still blocks identification of a cipher or plaintext.

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

No share-identifier assignment can make those two out-of-range values legal **within the optional 976-bit field**. Every one of the twenty tested integers is already valid in a **historically supported 984-bit field**, without reduction, truncation or a new alphabet. Thus there is **no universal format obstruction**. The absence of a source-selected 984-bit serialization and five x-identifiers is the current epistemic blocker. At the exact threshold, arbitrary five points interpolate automatically, and a round-trip cannot authenticate a plaintext.

**CI:** [passing original-source SFT, run 43164068830](https://github.com/FlareZ123/liber-primus/actions/runs/43164068830), executed on the unmodified repository corpus on 12 November 2026.

## Reproduction and controls

Run \`node sims/lp2_p23_26_ssss201_field_gate_sft.cjs\` on the repository corpus. It verifies the red16 and exact original page counts; tests all four readings; implements the historical full-field polynomial and five-point interpolation; recovers the known 2013 176-bit pre-diffusion encoded secret \`65b9c4065cc47a4a48e01d17de166a94252dfbb44e69\` from archived decimal-ID shares 02,03,05,07,08; and generates five deterministically seeded 976-bit field shares, losslessly round-tripping each through 201 base-29 digits and recovering the planted encoded coefficient zero.

The original 2013 group is an arithmetic positive control, and the 976-bit plant proves only that the chosen smaller-field parser works. The original strings fail **only that 976-bit candidate**; all fit a supported 984-bit field. No key or plaintext is identified.

**Limit:** No Cicada-authenticated LP2 instruction fixes the base-29-to-984-bit conversion, five identifiers, or output format. The 984-bit method is mathematically possible but unmotivated by an original instruction; five-point interpolation alone is not evidence. An independently source-selected key or operation is needed for a meaningful inversion. The independent [984-bit capacity analysis](lp2-p23-26-ssss-original-format-gate.md) was already correct on this point.

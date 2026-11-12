# LP2 pp23–26 five-dot chapter: genuine 2013 SSSS whole-field serialization gate

**Decision, 12 November 2026:** The original 1,005-runic post-heading body can be arranged as five source-order 201-rune strands, but **neither** the interleaved five-column layout nor the five contiguous blocks yields five legal shares under a literal, fixed-width, lossless rune-index base-29 representation of the historical \`ssss\` format. Reversing each complete strand (a bounded direction control suggested by paired source artwork) also fails. In **each of four** original-input readings, two of five source values exceed the 976-bit field bound. No historically specified rune-to-SSSS conversion, secret, LP2 key, or previously unknown plaintext is recovered. This closes the *specific* byte-accurate GP-index serializations, not all possible encodings.

## Why the exact historical protocol matters

The 2013 Cicada poster/ISO/phone continuation used the **ssss 0.5** share format: decimal share IDs (01..10), fixed-width hexadecimal y-values, and polynomial arithmetic over **one whole-secret field** GF(2^(8n)), with n 1..128 bytes. The five-of-ten scheme is a **monic quintic** (\`x^5+c4*x^4+...+c0\`); the output constant passes through a reversible XTEA diffusion layer. The actual 2013 share payloads were 44 hex digits, so their field is GF(2^176) with polynomial \`x^176+x^11+x^3+x^2+1\`. The previously recorded LP2 GF(2^8) bytewise five-point illustration is deliberately a synthetic example, **not** the 2013 literal SSSS algorithm.

Original implementation: [ssss 0.5 source](https://github.com/osresearch/ssss/blob/master/ssss.c), especially \`field_init\`, \`split\`, \`combine\`. An archived positive control is [the authenticated/participant-preserved 2013 share reconstruction](pklmx-2013-onion-continuation-gate.md); its full reconstruction tool is [2013_shamir_missing_shares_sft.cjs](../sims/2013_shamir_missing_shares_sft.cjs).

## Source-only LP2 capacity gate

The unmodified original physical pp23–26 contain 213,270,273,265 rune indices. Remove exactly the 16-rune red heading on p23; 1,005 symbols remain. The five black dots suggest, but do not prescribe, five shares. An ordinary source-readable numeric interpretation is GP alphabet index 0..28 as a base-29 digit (the 2013 Cicada signed TCP challenge separately knew the BASE29 numeral operation). Preselect only (a) five quintet-column streams, (b) five consecutive 201-rune blocks, and full within-lane reversals as an explicit direction control.

201 base-29 symbols hold \`201*log2(29)=976.4541800\` bits. A lossless historical SSSS whole-byte share has maximum **122 bytes / 976 bits**. A 123-byte / 984-bit share requires at least **203** base-29 digits, absent a preselected restriction or an auxiliary channel. The source field polynomial for 976 bits is \`x^976+x^17+x^10+x^6+1\`, taken from \`ssss.c\`'s irreducible polynomial coefficient array.

| Five-strand serialization | Exact bit lengths, original group order | Over-capacity lane indices (0-based) |
| --- | --- | --- |
| Interleaved quintet columns, printed | 977,975,976,977,976 | 0,3 |
| Interleaved quintet columns, each reversed | 975,976,977,976,977 | 2,4 |
| Five consecutive blocks, printed | 977,976,977,975,975 | 0,2 |
| Five consecutive blocks, each reversed | 976,977,976,975,977 | 1,4 |

No assignment of documented SSSS identifiers 1..10 can make out-of-range y-values legal field elements. No interpolation, hexadecimal leading-zero padding, or XTEA diffusion can repair a share whose value already exceeds the field. Reducing modulo the field or dropping a digit would be an invented, non-injective transformation. The point is a **format obstruction**, independent of language scoring or fitted candidate plaintext.

**CI:** [passing original-source SFT, run 43164068830](https://github.com/FlareZ123/liber-primus/actions/runs/43164068830), executed on the unmodified repository corpus on 12 November 2026.

## Reproduction and controls

Run \`node sims/lp2_p23_26_ssss201_field_gate_sft.cjs\` on the repository corpus. It verifies the red16 and exact original page counts; tests all four readings; implements the historical full-field polynomial and five-point interpolation; recovers the known 2013 176-bit pre-diffusion encoded secret \`65b9c4065cc47a4a48e01d17de166a94252dfbb44e69\` from archived decimal-ID shares 02,03,05,07,08; and generates five deterministically seeded 976-bit field shares, losslessly round-tripping each through 201 base-29 digits and recovering the planted encoded coefficient zero.

The original 2013 group is an implementation positive control, and the 976-bit plant demonstrates that a genuine five-share 201-digit system *can* pass this parser. Original LP2 strings fail before any candidate key or plaintext is selected.

**Limit:** No Cicada-authenticated LP2 instruction tells a reader to convert the five strands to whole-field SSSS shares, to treat runes as these base-29 digits, or to provide the missing identifiers. Other reversible symbol codecs or additional source-hidden data remain possible. Reopen this avenue only if original evidence supplies an alternative encoding or a real share object, preferably with a byte-for-byte original decoder.

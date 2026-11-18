# Previously known floral 13/31 motif: original-image pixel witness and five-plus-three rank obstruction

**Agent 7, 18 November 2026. Classification: additional pixel-level witness for an already-published motif and a new bounded algebraic code-family exclusion.** The 13/31 dot reading was **already documented** in [Agent's earlier original-row/walk gate](lp2-floral-13-31-original-direct-row-and-walk-gate.md) and independently used in the [16 November AES/TEA/XTEA tests](lp2-floral-13-31-aes128-original-table-receiver.md). The first half of this report repeats that known geometry only to specify the pixel-positive control and an additional original p55 target; it is **not a new discovery**. The new research decision here is the separately motivated row-local **3+5 code rank obstruction**. The original p40–55 floral stencil contains two pale outlined dots on the left and eight completely inked dots across both margins. A top-clockwise binary interpretation of each five-position cluster gives `01101` (13) on the left and `11111` (31) on the right. The original p49–51 table has **32 rows of eight cells**. This makes two literal row addresses available, although **the source never instructs binary reading, row selection or an additive cipher**. Testing both rows as eight-rune GP29 pads recovers no unknown text. Independently, the **3 filled left + 5 filled right** dots suggest an eight-column *five-data/three-parity* code. An exact key-independent matrix-rank gate rejects that complete common-linear-code family on the unchanged table.

## Original-image pixel confirmation of the previously known 13/31 pattern

In original `67.jpg` (physical LP2 p50), the five left-branch dots form a roughly pentagonal cluster. At original 2400×3600 pixel resolution, use the five sites in physical **top → upper right → lower right → lower left → upper left** order:

| Cluster | Original-pixel centers in that geometric order | Source ink | As bits | Base-2 value |
| --- | --- | --- | --- | ---: |
| Left | (398,1475), (425,1500), (421,1534), (380,1542), (367,1500) | outlined, filled, filled, outlined, filled | `01101` | **13** |
| Right | (2003,1475), (2034,1495), (2021,1536), (1980,1534), (1975,1497) | filled, filled, filled, filled, filled | `11111` | **31** |

The two left open sites have bright central 11×11 pixel patches (zero pixels below grayscale128). Their faint circular outlines remain visible at a radius of about ten pixels; the other eight filled sites have at least 100 dark pixels out of 121 in their same-sized center patches. These are actual faint **ring outlines**, rather than completely absent dot locations. An independent full-pixel comparison already established that the floral margins are identical on **every one of the sixteen original p40–55 pages**: [shared stencil](lp2-reused-ornament-source-raster-identity.md) and [exact border](lp2-floral16-identical-margins-source-gate.md). The new observation concerns the *within-stencil dot fill state*, not a page-specific watermark. The source-image reproducer asserts all ten observed dot states on all sixteen pages.

**Already-proposed human-path hypothesis:** the symmetric clusters have five positions each, the page's 32-row numeric table requires five bits for an address, and a normal top-clockwise reading needs no freely chosen dot ordering. It is therefore cheap to test the two directly printed five-bit values as row indices. This is still **post-observation source interpretation**: the right all-filled pentagon might be purely decorative, and no signed message commands binary conversion. The two marks occur identically on all p40–55 pages, so they cannot alone distinguish page-specific keys.

## Additional bounded p55 receiver of the known row13/31 candidate

The working table transcription is `resources/liber-primus/base60-grid.json`. Its physical 32×8 structure is directly visible in `66.jpg`–`68.jpg`; the base60-to-byte interpretation is an existing, independently qualified convention. The two original printed rows are:

| Zero-based row | Eight published tokens | Eight existing base60 byte values | Byte residues mod29 |
| --- | --- | --- | --- |
| 13 | `22 13 0V 3c 0E 34 0W 1t` | 122, 63, 31, 218, 14, 184, 32, 115 | 6, 5, 2, 15, 14, 10, 3, 28 |
| 31 | final physical row | 113, 158, 172, 230, 180, 36, 189, 80 | 26, 13, 27, 27, 6, 7, 15, 22 |

The **narrow, invertible consumer** is `P[i] = (C[i] ± byte_rows[r][i mod 8]) mod 29`, with `i=0` at the first original p55 rune and either source-addressed row `r∈{13,31}`. Applying the same direct eight-symbol cycle to all floral-chapter ciphertext p40–55 from p40 local zero is a second, independently fixed output check, not a fitted phase. All original rune symbols, including F, consume a key step. No rescue shifts, arbitrary byte order, p56 carry, reverse-column read or second cipher are introduced.

| Fixed GP29 inverse | Original p55 76-rune IoC | Entire p40–55 3,316-rune IoC |
| --- | ---: | ---: |
| Unmodified ciphertext | 0.037894737 | 0.034462827 |
| Row13, subtract | **0.037543860** | **0.034492847** |
| Row13, add | **0.040350877** | **0.034434262** |
| Row31, subtract | **0.042456140** | **0.034557982** |
| Row31, add | **0.032982456** | **0.034500852** |

All four complete-chapter values remain near the uniform 29-rune IoC of 1/29 = 0.034482759. The strongest 76-rune value, 0.042456, is still below the minimum 0.045614 seen in the project's independently corrected native-GP LP1 76-rune control windows, an illustrative finite comparator rather than a universal linguistic threshold. The row31 subtract candidate begins `A-EO-NG-EO-U-H-TH-NG-OE-TH-X-H-B-A-I-W-U-J-M-W-A-F-E-A-TH-T-T-EO-P-D`, not a coherent GP-language continuation. The other three first30 original readouts are preserved by the reproducer. None recovers unknown plaintext.

**Controls and reproducibility:** the [single-file Python/Pillow test](../sims/lp2_floral_dot_rows_original_sft.py) asserts the ink mask on all sixteen original JPEGs, checks the exact two source rows, verifies all 76 original p55 and 3,316 original floral ciphertext indices, and prints every candidate output. The exact [Windows Python 3.12 / Pillow 11.3.0 source run](https://github.com/FlareZ123/liber-primus/actions/runs/44239483664) **passed** with all sixteen original JPEGs and the actual corpus. For each row/sign convention it uses the first 76 authentic clear p57 GP runes as a positive encryption/decryption plant and reconstructs the complete original p55 source on re-encryption. The read-only test requires only the repository's already archived images, table, corpus and Pillow.

## Eight columns as five data plus three parity positions

The distinct, previously untested interpretation of the actual **three solid left** and **five solid right** dots is as a **3+5 column partition** of the 32×8 numerical panel. Earlier Cicada rounds used polynomial secret sharing, and an ordinary systematic Reed–Solomon (8,5) code or five-coefficient Shamir-style evaluation across eight fixed arguments would carry five data bytes and three dependent check bytes per row. Such a code could have exposed a 32×5 = 160-byte original key or typed binary payload. Neither the floral drawing nor the numeric table explicitly authenticates a coding operator, so this is a conditional, source-limited hypothesis.

The strongest inexpensive test does not assume the code generator, parity columns, column order or evaluation x-coordinates. Let `M` be the original 32×8 byte matrix. Any `32` source rows lying in a common (8,5) linear code over field `K` would have the form `M[row] = u[row]·G` for some **arbitrary secret** 5×8 generator `G`, forcing `rank_K(M) ≤ 5`. Even if each encoded eight-byte row also includes one unknown **common constant offset** `b`, the row-centered matrix `M[row] − M[0]` must have rank≤5. These necessary conditions also apply to any fixed unknown column permutation and any conventional field-polynomial selection.

| Exact field interpretation | Original table rank | First-row-centered rank | Maximum for shared affine (8,5) code |
| --- | ---: | ---: | ---: |
| GF(256), **all 30 monic irreducible degree-8 binary moduli** | **8 under every modulus** | **8 under every modulus** | 5 |
| GP29, using each original base60 byte modulo29 | **8** | **8** | 5 |
| GF(2), GF(3), GF(5), the three prime divisors of the original 60-digit token radix | **8 in each field** | **8 in each field** | 5 |

The 30 GF256 cases include AES's polynomial `0x11b` and the common RS polynomial `0x11d`. The exact elimination pivots are columns `[0,1,2,3,4,5,6,7]` in every case. For every tested source-field choice, including the three prime factors of the **literal base60 arithmetic ring**, a **positive 32×8 five-data/three-parity code** generated from the unchanged original first five columns has rank5, remains rank5 after subtracting the first row, and reaches rank6 after deliberately corrupting one parity byte. This checks algebra and detection sensitivity without searching for plaintext. The source table's original byte XOR is independently pinned to `0x94`; all 256 byte values are consumed.

**Reproduce:** [standalone Windows Node.js 22 CommonJS SFT](../sims/lp2_floral35_p50_rowlocal_85code_rank_sft.cjs) · [successful completed 34-interpretation Windows original-source run 44240728775](https://github.com/FlareZ123/liber-primus/actions/runs/44240728775). It enumerates degree-eight irreducible field polynomials algebraically rather than relying on an unverified library table. This test is distinct from the [previous entire-256-symbol full-field XOR theorem](lp2-grid256-gf256-fullfield-parity-gate.md), which does not evaluate **32 separate row-local codewords**.

**Decision:** the original p50 matrix cannot be 32 codewords from one fixed five-dimensional *linear or affine* length-eight code over any of these 34 tested source interpretations, including 30 choices of GF(256) representation, GF(29), and GF(2), GF(3), GF(5) as necessary base60 ring projections. This includes standard Reed–Solomon (8,5) and five-coefficient Shamir-evaluation interpretations with a shared generator. Variable per-row encoders, nonlinear or deliberately nonstandard glyph-to-field mappings and unspecified external masks remain outside this exclusion. The ornament supplies no evidence selecting those added mechanisms.

## Independent historical OpenPGP CRC-24: five data bytes and three checksum bytes

A **different and genuinely independently typed** consumer of the same three-solid/five-solid visual dot split is **five original source bytes followed by three OpenPGP Armor CRC-24 checksum bytes** on each of the table's 32 printed eight-byte rows. This differs from a GF(256) linear Reed–Solomon code: the standard CRC is linear over individual *bits* in GF(2) with a 24-bit shift register, and need not give a five-dimensional vector subspace over GF(256) on byte columns. Thus the matrix rank gate above does **not** decide this branch.

This candidate has unusually strong historical motivation despite the missing original opcode: Cicada's authentic OpenPGP signature instructions predate the LP2 release. **RFC 4880 §6.1**, published in 2007, explicitly fixes the OpenPGP ASCII Armor checksum algorithm, initialization `0xB704CE`, and binary generator polynomial `0x1864CFB`. A human in 2014 possessing the signed PGP material could reproduce those exact 24-bit check bytes. The original LP2 artifact does not state that its table uses CRC or which original three columns are checksum, so the claim remains a hypothesis. Original literal table row orientation selects the small fixed matrix below without an optimized seed, secret polynomial or plaintext language model.

Preserve every original source row, decode its eight printed tokens into the canonical 8-bit source values, and inspect exactly the four natural fixed layouts: first five bytes as data/last three as checksum, or first three checksum/last five data, each with checksum bytes in standard big-endian PGP order or reversed byte order. All source byte values are consumed once per row; no row swapping, key search or residual correction is used.

| Original table bytes | Checksum orientation | Full exact checksum matching rows |
| --- | --- | ---: |
| First 5 data, last 3 CRC | RFC 4880 big-endian | **0/32** |
| First 5 data, last 3 CRC | Three CRC bytes reversed | **0/32** |
| First 3 CRC, last 5 data | RFC 4880 big-endian | **0/32** |
| First 3 CRC, last 5 data | Three CRC bytes reversed | **0/32** |

The single runnable [OpenPGP original-table CRC-24 test](../sims/lp2_flora35_openpgp_crc24_rowcode_sft.cjs), [full source original Windows PASS run 44242816258](https://github.com/FlareZ123/liber-primus/actions/runs/44242816258), implements the exact published operation in one readable JSDoc/CJS script. Independent control `CRC24("123456789") = 0x21CF02` passes, as does empty-message initialization `0xB704CE`. It regenerates valid CRCs for the actual original first five bytes of each of the **32 rows** (32/32 full matches), validates the reversed three-byte layout on genuine planted rows, and detects a deliberately flipped check byte (31/32 valid). Full source byte array XOR `0x94` and literal physical table row13/31 byte values are also asserted.

### Literal printed-text RFC4880 radix-64 checksum receiver

The table itself is printed as **eight two-character base60 tokens per line**, i.e., sixteen visible ASCII characters. RFC4880 ASCII Armor emits one 24-bit CRC as **four radix-64 characters**. A separate source-visible check therefore treats six consecutive printed tokens (12 original characters) as literal ASCII data and the other two tokens (four original characters) as one RFC4880 radix-64 CRC. Test the checksum at the beginning and at the end of every original row, without changing any digits or inserting the usual PGP armor `=` marker.

Both source orders have **0/32 exact checksums**. These are independent of the previous original-base60-byte 5+3 test and permit no fitted polynomial or key. All **64 positive constructed 12-character payload + 4-character authentic CRC** rows pass under the same fixed reader. This bytewise test is included in the same [single-file source runner](../sims/lp2_flora35_openpgp_crc24_rowcode_sft.cjs), alongside the direct 5+3 register and independent RFC standard vector. The original source does not print an equals sign or literal claim of PGP armor data, so the exact positive framing is a bounded hypothesis, not a signed instruction.

**Decision:** no original printed row satisfies a literal OpenPGP CRC-24 grammar under any of the four frozen five-data/three-check layouts. The distinct original printed 12-character data / four-character radix64 CRC row reading also fails in both literal source orders. This finite typed-object exclusion rejects the source-motivated **32 copies of an RFC 4880 row CRC** without relying on an unknown key or English scoring. It does not exclude an unrelated error code, a CRC applied to the entire 256-byte object, a differently ordered source field or some unknown authenticated encoder. Stop this branch without a separate authorial instruction.

## Research decision

The left **three solid/two pale outlined** motif was previously established by [other agents](lp2-floral-13-31-original-direct-row-and-walk-gate.md); this invocation independently fixes its exact pixel centers and distinguishes a separate **5-data/3-parity** original table receiver. **Do not treat row13 or row31 as an authenticated key address yet.** The two source-shaped direct repeated-row GP29 inverses are negative on both the terminal p55 and the entire floral chapter. The independent 3+5 row-local linear/parity reading is also algebraically excluded without fitted parameters. The historically specified OpenPGP CRC-24 interpretation is separately excluded on the actual 32 original table rows under both byte orientations. Any new row-based consumer needs independent evidence selecting a binary readout *and* a value-changing operation, with a withheld plaintext consequence. The fixed ornament is a possible static cue, not a per-page signal, and supplies no solved unknown page on its own.

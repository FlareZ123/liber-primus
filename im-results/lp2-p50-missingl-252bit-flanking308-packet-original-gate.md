# Missing 4C, fifth-column key and 308 flanking GP runes: exact 252-bit slack, but no literal GP29 packet

**23 November 2026 · Agent14. Classification: unexplained arithmetic cross-constraint and bounded original-source negative.** Original unknown LP2 plaintext recovered: **none**. Historic 2014 packing instruction or authenticated source-selected receiver: **none**.

## A specific human-visible arithmetic bridge

The original physical LP2 p49–51 prints a **32×8** table of two-character sexagesimal-looking numerals. The earlier [source-visible increasing-neighbor analysis](lp2-p50-missing4c-dualradix-terminal-split.md) found an exact missing **`4C`** between the surviving paths `48,49,4A,4B` and `4D,4E,4F`. Conditional Latin ASCII `H,I,J,K,[L],M,N,O` labels eight table columns; the absent **L** selects the unambiguous 32-byte fifth column, the candidate scalar whose conventional compressed secp256k1 P2PKH address begins `1Meanpng` ([full source route](lp2-p50-missing-l-secp256k1-address.md)). Neither the label convention nor Bitcoin is author-signed.

A distinct *source-contained bit-capacity equality*, noticed after these discoveries, joins that column choice to the **two complete original runic sentences adjoining the numerical table**:

| Original, fixed source quantity | Exact amount |
| --- | ---: |
| Table cells as eight-bit base60 numbers | 256 bytes = 2,048 bits |
| Selected L/fifth column | 32 bytes = 256 bits |
| Seven *other* intact printed columns | **224 bytes = 1,792 bits** |
| Whole first table-adjacent sentence: p48 final72 + p49 all66 | **138 GP29 runes** |
| Whole second table-adjacent sentence: p51 all92 + p52 first78 | **170 GP29 runes** |
| Both sentences, if five-bit encoded (since 2⁴ < 29 ≤ 2⁵) | **308×5 = 1,540 bits** |
| Remaining capacity in the 224 non-L bytes | **1,792−1,540 = 252 bits** |
| Missing source token `4C` under the same radix60 alphabet | **4×60+12 = 252** |

The two flanks are delimited by their original printed sentence boundaries, using the canonical [unchanged GP29 corpus](../resources/liber-primus/lp2-corpus.json). The 32×8 table is [source-audited here](../resources/liber-primus/base60-grid.json).

**Interpretation limit:** this is an exact arithmetic coincidence in a consciously selected family of radices, boundaries and bit widths. It is *not* evidence that the author ordered a 252-bit sidecar, used `4C` as a bit count, or encrypted the flanking sentences into this table. A bit-field of 252 bits is not intrinsically byte-aligned, and the author has provided no packet grammar. The earlier 76/180 circumference bridge uses a different interpretation of the same `4C`; these remain rival conditional explanations.

## Source-byte falsifier for the straightforward packet

A necessary prediction of the simplest **literal 5-bit GP29 packet** is that *every* one of its 308 five-bit data groups represents a legitimate rune **0..28**, in a fixed 1,540-bit data region. Freeze the seven non-L columns without edits, in the two natural table traversals (row-major and column-major), two conventional bit orientations (MSB and LSB per byte), and the 252 spare bits as either a header or footer. Exactly **eight** original-source packet parses; no image reorder, different pad length, bit offset search, altered numeral, crypto key or alphabet relabeling.

| Original seven-column order | Byte bits | 252-bit sidecar position | Invalid 5-bit groups (`29..31`) | Same-position matches to original 308 flanking cipher runes |
| --- | --- | --- | ---: | ---: |
| Rows | MSB | Footer | 24 | 5 |
| Rows | MSB | Header | 25 | 11 |
| Rows | LSB | Footer | 29 | 10 |
| Rows | LSB | Header | 20 | 12 |
| Columns | MSB | Footer | 30 | 13 |
| Columns | MSB | Header | 30 | 16 |
| Columns | LSB | Footer | 24 | 10 |
| Columns | LSB | Header | 25 | 14 |

None is a complete valid literal GP29 five-bit field. Each has 20–30 reserved codes. Direct equality against the original printed 308 rune indices is likewise close to the unrelated-code expectation. The 252-bit source header/footer is also **115–128 bits different** from the original fifth-column scalar's first/last252 bits, so it does not simply duplicate a bit-truncated copy of the key.

**True control:** a fresh 224-byte shadow packet was constructed by packing *all 308 genuine original flanking GP29 rune indices* into 1,540 MSB-first bits followed by the fifth-column key's exact top252 bits; the same parser recovers **308/308** legal, correct original runes and **252/252** sidecar bits. This verifies the source lengths, bit framing and register matching without modifying the original table.

**Reproduce:** [read-only single-file Windows Node22 test](../sims/lp2_p50_missingl_flanking308_5bit_packet_sft.cjs), [Windows Node22 PASS run 45252554695](https://github.com/FlareZ123/liber-primus/actions/runs/45252554695).

## Cryptanalytic decision

**Retire the literal 5-bit table-packet interpretation** in these eight naturally defined presentations. The exact 252-bit numerical equality is worth preserving as a bounded candidate for an intended clue, but a viable decoder must first specify from independent original evidence how 29–31 reserved codes are interpreted, how the spare bits are actually consumed, whether the embedded data is plaintext/ciphertext/key material, and a *held-out* original runic prediction. Do not inflate the equality into a solved cipher or fit new escape rules after seeing this negative.

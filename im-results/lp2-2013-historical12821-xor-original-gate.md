# CicadaOS offset 12,821 → original LP2: source-fixed XOR / BASE29 gate

**Classification:** bounded original-artifact negative. No LP2 plaintext or reusable key was recovered.

## Why this test was selected

The historical 2013 third-onion XOR step takes `DATA/560.13` from the original 2013 CicadaOS ISO at **absolute byte offset 12,821** and XORs the 23 original bytes there with the published source hex `28c07e1b102d4d5c4c1a376e064477e1416fcc94928765`. The resulting 23 bytes are exactly `gbyh7znm6c7ezsmr.onion\n`. This is a genuine period-authentic creator-used dataset and precise offset, before the 2014 book existed. The independently signed 2013 participant-server protocol specifies `BASE29` as a numeral operation.

Those two original instructions motivate a bounded transfer from the historically used offset using three source-shaped representations of the original GP29 ciphertext: individual rune-index bytes, a whole-section base-29 integer, and five-bit MSB-first packed indices. The printed GP29 indexing and a continuous byte clock over two successive source sections are fixed in advance. The original 2014 256-byte table is a separate natural byte operand. No offset search, fitted key, extra decipherment layer or new password is permitted.

**Strongest unsupported premise:** the 2013 XOR offset and operation are authenticated for the 2013 onion handoff, and `BASE29` was documented, but no creator-authenticated 2014 instruction requires either for LP2. The transport itself is an extrapolation and therefore must be rejected if it fails the first two original sections.

## Primary, exact test

- Source: original 118,818,811-byte ISO member `DATA/560.13`, SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`, freshly downloaded in the Windows CI job and hash-checked before analysis.
- Known independent original control: 23 bytes at offset 12,821 produce the exact 2013 `.onion\n` string; **passed**.
- Untouched original ciphertext: physical LP2 p0–p2 (729 runes), followed by p3–p7 (1,145 runes), canonical `resources/liber-primus/lp2-corpus.json` indices.
- Transport A: one source byte per GP index. Apply XOR and advance the absolute source clock by 729, then 1,145 bytes.
- Transport B: interpret a whole original section as a most-significant-first base-29 integer; serialize minimally to 443, then 696 bytes. XOR with the source, advancing the clock by those byte counts. A matching inverse serializes the original rune sequence exactly.
- Transport C: pack each original GP29 index into five bits, MSB first with a terminal zero pad, producing 456 then 716 bytes. A strict original-rune inverse verifies exact reversible unpacking before XOR.
- Controls: all six rune/section cases independently recover source-XOR-planted ASCII bytes with 100% fidelity; adjacent incorrect source offset does not recover planted text; original rune bytes, BASE29 integers and five-bit bitstreams round-trip exactly. The output is examined for English, lengthy printable alphabetic segments and byte-level text evidence.

## Original result

| Input | Register | Source byte start | Output bytes | Printable ASCII | Latin letters | ASCII spaces | Consecutive letter/space runs of 8+ |
|---|---|---:|---:|---:|---:|---:|---:|
| p0–p2 | GP-index bytes | 12821 | 729 | 270 (37.04%) | 154 | 3 | 0 |
| p3–p7 | GP-index bytes | 13550 | 1145 | 426 (37.21%) | 246 | 4 | 0 |
| p0–p2 | whole-section BASE29 | 12821 | 443 | 181 (40.86%) | 98 | 3 | 0 |
| p3–p7 | whole-section BASE29 | 13264 | 696 | 257 (36.93%) | 145 | 2 | 0 |
| p0–p2 | MSB-first five-bit packed GP29 | 12821 | 456 | 181 (39.69%) | 99 | 1 | 0 |
| p3–p7 | MSB-first five-bit packed GP29 | 13277 | 716 | 265 (37.01%) | 140 | 2 | 0 |

Expected printable-ASCII proportion for uniformly random byte output is 95/256 = 37.11%. Observed values approximate that null, and none of four output streams contains even eight consecutive ASCII letters/spaces. The source-authentic XOR, source hash, GP29 round-trip, and planted ASCII controls all passed. **This exact transfer is not a plaintext recovery.** It is a bounded negative for the two input representations and the exact offset; it does not exclude other archive-derived operations or other source instructions.

A second source-byte transfer, **GP29 additive instead of native 2013 XOR**, was independently tested with all offsets **0–12,899**, including the historical 12,821 start. For each source offset and sign, a previously defined original-cipher decoder allowed up to eight individually admissible repeat-skipped key draws and ranked the **96 original first-page runes** before decoding its 249-rune body. On the actual original inputs, the best-of-12,900 discovery scores were **−339.290 (minus sign, offset 12,024)** and **−332.790 (plus sign, offset 7,462)**, with the historical 12,821 offset absent from both top-twelve lists. Forty independently planted 96-rune native GP positives all outscored the best original candidate (worst plant −313.598, best original −332.790); 32 of 40 plants recovered every rune, so the decoder has meaningful but imperfect power. The best original body finalist was a different freely selected offset **9,610**, with gibberish `BTHCIOMRYSNYAPDEEAPNGUUULYNRGOEORIABRTHJAEEOIAJNBYDHDUNEUAUFTBSNG...`, and no independently coherent output. The [Windows original source run 43644197553](https://github.com/FlareZ123/liber-primus/actions/runs/43644197553) and [native artifact inspection run 43644829661](https://github.com/FlareZ123/liber-primus/actions/runs/43644829661) preserve the complete finite numerical output. This additive screen is a distinct, source-offset-inclusive **negative**, and its searched offset maxima cannot be promoted into a key without an independent clue selecting the offset.

## Independent 256-byte table-consumer check

A separate, strongly typed operand exists: the original printed pp49–51 numerical table has exactly **256 byte values**, with a dated May 2014 solver-copied 256-byte version preserved independently. The 2013 challenge's original `DATA/560.13` method used raw **bytewise XOR**, so reusing the same **source-selected offset 12,821** on both 256-byte sources is an affordable, distinct test from packing GP29 rune sequences. This was added to the same SFT before inspecting output, without fitting an offset or transforming table bytes. Both original 256-byte vectors are checked for exact length; the known 2013 onion-address and planted 256-byte ASCII controls remain exact.

| Historical 256-byte ciphertext | Decoded printable ASCII | Latin letters | Spaces | Readable letter/space runs of 8+ | First 16 decoded hex bytes |
|---|---:|---:|---:|---:|---|
| Original printed pp49–51 base60 table | 94/256 (36.72%) | 50 | 1 | 0 | `8445a0c946ba5d8626809cd58b33ad47` |
| May 2014 original solver-derived binary | 95/256 (37.11%) | 50 | 1 | 0 | `8445a0c946ba5d8626809cd58b33ad47` |

The independent dated archive has ten known transcription differences from the original printed table, so the two XOR outputs accordingly differ at ten byte positions. The source-conditioned XOR exposes **neither readable ASCII nor a common file-format signature** in either version. It could still produce a further binary key under some other independently specified consumer, but no such instruction is supplied by these sources. The entire [second successful Windows native-original run 43645207433](https://github.com/FlareZ123/liber-primus/actions/runs/43645207433) preserves these outputs with the first two rune sections and the 2013 positive witness.

## Source-red p0 heading as a different single fixed 2013 XOR byte address (Agent14, 14 November 2026)

A fresh, bounded candidate chooses the **first 13 original red runes of physical LP2 p0**, explicitly excluding the title from the body to be decoded. Their original GP29 indexes are `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. Read as a positional most-significant-first BASE29 integer, they give **5,412,445,423,142,629,857**. The 2013 Cicada-signed BASE29 numeral example, together with the genuine 2013 `DATA/560.13` XOR operation, motivates testing the heading as a possible byte address in the old 118,818,811-byte source file. The deliberately single proposed reduction, number modulo original file length, gives a definite **offset 69,948,647**. **This modulo-file-length step is an investigator's conjecture; it is not an original Cicada instruction.** It is a different fixed offset from the historically witnessed 12,821, and no alternate phase or key is fitted.

A [completed Windows/Node22 original-source CI job, run 43647291164](https://github.com/FlareZ123/liber-primus/actions/runs/43647291164), downloaded the entire genuine `DATA/560.13`, verified its source SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`, and recovered the exact authentic 2013 address `gbyh7znm6c7ezsmr.onion\n` by XOR of the 23 historic source-cipher bytes at offset12,821. It checked the original physical p0's 262 runes, retained **all 249 runes after the 13-rune red header**, and round-tripped all three encoded registers and each source XOR without byte alteration.

| Fixed source p0 body register | XOR output bytes | Printable ASCII | ASCII letters | High-bit bytes | Longest alphabetic/space run | Output first 16 hex |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| One GP29 index per byte | 249 | 102 | 48 | 118 | **3** | `fb04241e518406cf475ed4f4e32a4c23` |
| One MSB-first BASE29 integer | 152 | 60 | 35 | 79 | **2** | `f94eadafddb057f6af36ead612ba9141` |
| Packed MSB-first five-bit GP indexes | 156 | 57 | 35 | 83 | **3** | `ebc2b22992c783ef89536ef3b49c727` |

All three byte outputs are nonlinguistic and have no byte-zero PNG, PDF, ZIP, gzip, armored-PGP or ordinary ASCII-text signature. Full first-48-hex-byte fingerprints, ASCII previews, source-hash control and double-XOR checks are printed by the [self-contained original-input SFT](../sims/lp2_2013_p0_red13_56013_xor_sft.cjs). The exact manual workflow is [`lp2-p0-red13-56013-xor-manual.yml`](../.github/workflows/lp2-p0-red13-56013-xor-manual.yml).

**Decision:** the heading-derived, source-file-length-reduced 2013 **XOR at exactly offset 69,948,647** cannot directly recover ordinary source-language plaintext in any of these three unaltered GP-to-byte representations. The authentic historical 12,821 XOR positive passes. No source instruction independently selects the reduction, and no unknown-page plaintext, cipher key, or destination is recovered. Do not expand this into unconstrained red-title offset or endian searches without an additional first-party selector.

## Reproduction and decision

- [Self-contained source-specific Node22 CommonJS SFT](../sims/lp2_2013_historic12821_base29_xor_sft.cjs)
- [Complete Windows original-input execution 43645642404](https://github.com/FlareZ123/liber-primus/actions/runs/43645642404), success; covers all six native GP-to-byte cases, both 256-byte table operands, and source-authentic and planted positives. The earlier [baseline run 43644449895](https://github.com/FlareZ123/liber-primus/actions/runs/43644449895) independently passed the initial four rune-section cases. The existing [ISO workflow](../.github/workflows/iso56013-full-offset-manual.yml) was extended with the optional `historic12821` mode; its normal offset-scan behavior is preserved.

**Decision:** retire the direct historical 12,821 XOR bridge under the **three registered rune encodings** (GP-index bytes, full-section BASE29 integer, packed five-bit GP29), and both 256-byte table operands, as an unrewarding simple transfer. Do not recursively try tuned encodings or neighboring offsets based on these random-looking outputs. Reopen only if a new original clue independently specifies a different representation or source clock, or if an authentic LP2 crib materializes.

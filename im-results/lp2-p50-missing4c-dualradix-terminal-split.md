# p49–p51 missing `4C` dual-radix bridge to the terminal 76/180 rune split

**Agent38 · 23 November 2026 · original-source structural candidate, no unknown plaintext.** This is a concrete possible **operand/receiver selector** for an intended human path. The necessary cipher opcode, key role, and independent original plaintext prediction are still absent. Do not promote this candidate to an established decipherment.

## Direct original-source reconstruction

The original scans **66.jpg, 67.jpg, 68.jpg** print a single numerical table of **32 rows × 8 tokens = 256 cells**, represented faithfully in [base60-grid.json](../resources/liber-primus/base60-grid.json). The original neighboring consecutive-token paths `48→49→4A→4B` (two paths because there are two adjacent starts at `48`) and `4D→4E→4F` (one path) were reported and independently corrected in the existing [spatial-path study](lp2-p50-highband-spatial-successor-chain.md). The connecting original token **`4C` occurs nowhere in all 256 cells**. Other `4x` tokens (`41`–`44`) are also absent, so the meaningful selection premise is the *gap between the two particular consecutive spatial runs*, rather than uniqueness of missing table bytes.

Reading that one absent two-character token with two reproducible, but **not author-directed**, numeration conventions produces a complete exact arithmetic bridge:

| Step | Exact original data or arithmetic | Candidate role |
| --- | --- | --- |
| Absent displayed token | `4C` between the observed `48…4B` and `4D…4F` runs | Possible missing-operand cue |
| Interpret in hexadecimal | `0x4C = 76` | Original unknown p55 contains **76 GP29 runes** |
| Interpret as conventional high-digit-first base60 | `4×60+12 = 252` | A valid zero-based address into the **256-cell** panel |
| Read addressed original source cell | `T[252] = T[row31,col4] = "30"` | Visible in original scan **68.jpg**, last row, fifth column |
| Interpret that printed cell in base60 | `3×60 = 180` | Original **solved** p56+p57 contain **85+95 = 180 GP29 runes** |
| Compare complementary sections | `76+180 = 256` | The exact rune total of consecutive original p55+p56+p57 and the exact size of the numeric table |

**Independent geometric opcode already printed in the solved book.** The original p57 clear parable instructs the reader to **“shed our own circumferences.”** On the actual **32×8** numerical panel, shedding precisely **one outer rectangular circumference** yields **76 outer cells** (= `2×(32+8)-4`) and a **30×6 = 180-cell interior**. Those are exactly the previously independently known p55 encrypted rune count and p56+p57 solved rune count. The geometry of the 76/180 table partition and p57's explicit circumference instruction were known in earlier research ([inner180 tests](../sims/lp2_p50_inner180_solved_tail_byte_readout_sft.cjs)); the *new observation* is that the missing `4C` provides a second, dual-radix numerical route to exactly the same **76 perimeter / 180 interior** split, including a direct zero-based table cell whose value is 180. This is a more concrete prospective human operation than interpreting arbitrary page lengths as a cipher.

An immediate, fully lossless *positional partition*, before specifying any symbol transform, is therefore **outer 76 table cells ↔ 76 original p55 cipher runes** and **interior 180 table cells ↔ 180 original known p56+p57 plaintext runes**. Choosing the start corner, direction, grid reading order, and reversible byte/rune rule still requires an original source instruction; no one alignment can be treated as the designer's instruction merely because it scores better.

No ciphertext decoding, page reordering, hidden insertion, or fitted constant is used in the equation. Both the `4C` omission and `30` in the terminal original grid row are visible in unmodified images. The source-canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json) supplies the independently checkable physical-page rune counts.

The finite **selection-competition screen** is also explicit. Consider all **80** two-digit uppercase hex strings `00…4F` that are simultaneously valid zero-based conventional-base60 addresses in the 256-cell table. For each string `h`, evaluate `hex(h) + base60(T[base60(h)])`, without fitting a cipher key or inspecting plaintext. **Only `h=4C` equals 256**; that token is absent from the source. Thirty-two of these 80 candidate strings are source-absent. This is a finite uniqueness result within a declared syntactic family, **not** a calibrated random-creator probability, because the gap, target total, both radices and 80-member test universe were recognized after inspecting the artifact.

## Optional pointer continuation

A purely deterministic self-indexing rule, `i → base60(T[i])`, applied from the missing base60 address 252 gives:

```text
252 → 180 → 144 → 125 → 20 → 102 → 32 → 115 → 247 → 192
    → 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 ...
```

This visits **180 immediately** and reaches **76 after 15 hops**, before entering an 11-cell cycle at 115. It offers a more specific potential navigation operation but **no source-selected stop criterion** and no known GP29 payload transformation. Treat it as secondary and post-observation; do not use the intermediate numbers as an arbitrary new secret or password list.

## What this permits and what it does not

A historically capable reader could observe the conspicuous neighboring ascending tokens, infer a missing `4C`, and use the table's own 32×8 address space. The later [signed 2016 Cicada message](../resources/historical/cicada2016-4gq25-outguess.asc) describes numbers as “the direction,” offering broad encouragement to inspect source numbers. It **does not specify** hexadecimal plus base60, zero-based self-addressing, source-indexed pointer walks, or a decoder. Historical 2014 human discoverability of this exact mixed-radix step is unproven. A base59 alphabet omitting `f` changes the address and readout; the exact 76/180 closure assumes conventional base60.

The new candidate assigns **source-determined lengths** to a plausible 256-rune terminal receiver: p55 has 76 still encrypted runes, followed by 180 known plaintext runes from solved p56 and p57. That is a sharply specified place to seek a *source-authored conversion or key-transfer law* across the already indicated 76-perimeter/180-interior table geometry. Prior [terminal 256-rune stationary-codebook tests](../sims/lp2_grid256_terminal_solved180_lookup_sft.cjs) already exclude simple fixed byte↔GP29 substitutions across the 180 solved positions, and the [inner180 direct additive/XOR study](../sims/lp2_p50_inner180_solved_tail_byte_readout_sft.cjs) supplies other bounded negatives. Those results remain intact. Repeating arbitrary mixed-radix shifts, additive keys, AES passwords, or tree-walk stops would not constitute an independent route.

The decisive missing input is an authentic indication of **how the known 180 runes and/or table cells act on all original p55 76 ciphertext runes**, with preserved word/page boundaries, explicit key/state/clock and a demonstrably correct original-source inverse that returns substantial readable unknown plaintext and survives a separate untouched target. A plausible future test must freeze that operation **before** running any source-language filter. If that instruction never emerges, classify this arithmetic as an interesting local navigation alignment.

**Reproducer:** [read-only Windows Node22 SFT](../sims/lp2_p50_missing4c_terminal_split_sft.cjs) checks the original 256 entries, the spatial runs, complete 80-candidate complement family, all three physical rune counts and optional pointer trace. It does not alter sources, train on synthetic cipher positives or claim decryption.

# LP2 p50 missing-4C → terminal 76+180 erasure: source and decoder gate

## Decision for Director Issue #2376

The source-visible **4C numerical gap** and exact **76+180=256** terminal length relation are reproducible and potentially worth preserving. **They do not currently select a reversible erasure decoder** for LP2 p55. The source omits the code family, field, parity/evaluation layout, GP29-to-byte serialization and even the instruction that the three terminal pages form a codeword. Two incompatible explicit full-length GF29 codecs can reproduce the same 180 authenticated terminal symbols; a separately tested natural GF257 polynomial code fails both source-aligned original receivers. No original unknown plaintext or key follows from the length match.

This is a reason to leave the 4C→terminal operation *unresolved pending an authored opcode*. It is not proof that the author did not intend a 256-symbol construction.

## Physical data and conditional pointer

The original image files **66.jpg, 67.jpg and 68.jpg** show the LP2 p49–51 numeric block. The printed block has **32 rows of eight two-character tokens**, broken after source p49's 80 cells and p50's 104 cells, with the last 72 on p51. On p49, three encrypted rune lines introduce the numeric block; on p51, four encrypted rune lines follow it. Neither surrounding encrypted span has authenticated plaintext. The panel has its own original page ordering and remains fully populated: all 256 token cells exist. No `4C` is printed.

The visually selected successor paths `48→49→4A→4B` and `4D→4E→4F`, preserving page/row/column positions, have a **gap at 4C**. Details and exact corrected path count reside in [the spatial-source analysis](lp2-p50-highband-spatial-successor-chain.md) and [the original 4C report](lp2-p50-missing4c-dualradix-terminal-split.md). The gap's interpretation is not an authored instruction.

The arithmetic bridge is exact under a **specific mixture of numeral systems**:

| Step | Input | Result |
| --- | --- | --- |
| Hexadecimal reading | `4C` | **76** original p55 ciphertext runes |
| Base60 reading | `4C` | **252** (zero-based cell address) |
| Physical cell | `T[252]` | Printed `30` on p51 |
| Base60 reading | `30` | **180** known p56+p57 plaintext runes |
| Terminal lengths | `76 + (85+95)` | **256** equal to printed cell count |

The alternative previously proposed **radix59** reads `4C` as 248, then `T[248]='1r'` as 111 (with the omitted `f` in the 59-character alphabet); it does **not** yield the 76+180 link. Thus the link requires **hexadecimal for 4C's first use, source-conventional base60 for its second, and base60 for the referenced token**. The images do not spell out why a solver should switch bases or select p55 as the missing block, four illustrated pages after the table.

The actual terminal pages are image files **72.jpg (76 original p55 ciphertext runes), 73.jpg (85 original p56 ciphertext runes), 74.jpg (95 printed plaintext runes)**. Page55's initial rune finishes a word begun on p54; all **76** runes are retained, including that carry. The external exact solved-GP29 reference for p56 regenerates all 85 *printed ciphertext* symbols under the authenticated successive-prime-totient cipher, with precisely the original F0 bypass at source position56 and 84 consumed prime keys. The original p57 printed text equals its 95 solved reference runes.

## What an erasure inverse would need

The 256 table cells are already **observed byte-valued tokens**, whereas the purported 76 erasures are **unknown plaintext beneath observed p55 rune ciphertext**. The other 180 items are p56 and p57 **known plaintext**, although p56's 85 symbols are also printed through a separate prime-totient cipher. No common codeword alphabet and input state have been identified for these three roles.

Before any 76-rune decryption can be independently reproduced, an authored route needs to specify:

1. Whether the table is a codeword, a coordinate/order table, a pad, or a parity generator, with exact physical row/column traversal.
2. Which 256 values form the codeword: GP29 ciphertext, GP29 plaintext, printed bytes, rune prime values or another exact serialization, and how the mixed plaintext/ciphertext representations are normalized.
3. A specific **[256,180]** erasure algorithm, field/primitive polynomial when applicable, parity-check/generator construction and how the printed byte values enter it.

An ordinary GF29 Reed–Solomon code with 256 distinct evaluation points does not exist over 29 elements. A general systematic linear [256,180] GF29 code is mathematically possible, but its **76 parity coordinates are entirely undefined by the length equality**.

### Original-input direct receiver and constructive ambiguity

The [exact CommonJS test](../sims/lp2_p50_missing4c_terminal_erasure_source_gate_sft.cjs), independently executed as **Windows Node22 PASS [run 45142004928](https://github.com/FlareZ123/liber-primus/actions/runs/45142004928)** on commit `659651d9e`, aligns the **last 180** physical table values with all 180 authenticated p56/p57 *plaintext* rune indices, preserving original position and allowing **arbitrary stationary, secret rune-to-byte and byte-to-rune maps**. Under either radix59 or radix60, **21 of the 23 source rune types require multiple byte values**, and **42 of the 129 observed byte types are associated with multiple rune types**. A planted valid unknown-alphabet map passes. Thus no simple stationary bijective substitution turns the printed table into the 256 terminal plaintext symbols, even allowing an unrestricted secret alphabet. This excludes only that direct receiver.

Two *explicit, distinct and unfitted* systematic linear [256,180] codes over GF29 further show the choice problem. In model A, the first 76 code symbols simply copy the first 76 of the given last-180 information symbols. In model B, they copy known symbols starting at offset85, with cyclic wrap. Both fixed encoders perfectly reconstruct their own first 76 erasures from the same authentic last180, preserve every GP29 type and round-trip. They produce different first76 outputs, and neither reproduces actual p55 ciphertext. The examples are a constructive non-uniqueness witness, **not** proposed Cicada solutions. There are arbitrarily many other possible parity matrices without a source-selected generator.

## Distinct source-fixed polynomial erasure test over GF(257) (Agent9, 23 November 2026)

The smallest prime field supporting 256 distinct evaluation coordinates is **GF(257)**. This gives a concrete, historically feasible alternative to the arbitrary GF29 parity matrices above: freeze a conventional systematic polynomial Reed–Solomon **[256,180]** candidate, in the printed order and with evaluation points exactly `x=0,1,...,255`. Treat positions 76–255 as the 180 known data symbols, interpolate the unique polynomial of degree at most 179 through them, and use its values at `x=0,...,75` as the alleged missing part. This fixes the entire operator without a private generator matrix, phase or optimization against p55.

The original **85 solved p56 GP29 symbols concatenated with the 95 original clear p57 GP29 symbols** exactly supply the required 180 symbols. GF(257) interpolation reconstructs those 180 known values, but only **5/76** extrapolated values lie in the allowed GP29 plaintext range `0..28`. The other **71/76** are between 29 and 256. None of the 76 extrapolations equals the corresponding original p55 ciphertext rune directly, though plaintext need not equal ciphertext; the decisive contradiction is the missing 71 GP symbols under this direct alphabet embedding. The first 16 extrapolations are `[198,100,167,158,59,60,229,72,158,95,181,33,237,143,256,66]`.

Test the **second genuine 256-symbol receiver** independently: use the complete 32×8 original printed numeric table as GF(257) byte symbols in row-major order. Fit its last 180 values and extrapolate the first 76. Exactly **0/76** predicted values match the source's printed first-76 bytes. Therefore the original table itself is not a direct row-major GF(257) systematic RS[256,180] polynomial codeword with 76 leading parity positions. A planted degree-179 GF(257) polynomial is interpolated and recovered at **all 256/256 positions**, including all 76 held-out positions; the test fails the original models for substantive source mismatches, not a broken interpolator.

[Source-exact standalone CommonJS SFT](../sims/lp2_terminal_gf257_rs180_original_sft.cjs) uses the original `lp2-grid-256.json`, `lp2-corpus.json`, and the existing independently solved-native GP29 p56/p57 source; its actual committed code passed an exact-source V8/Node-builtins adapter execution with the reported assertions. This new negative closes **only** the natural consecutive-coordinate, direct GP-index or direct table-byte systematic GF257 polynomial code. Other fields, nonconsecutive coordinates, interleavings, nontrivial symbol mappings or a genuine external erasure key remain mathematically possible, but the original clue does not select them. Neither attempted original consumer yielded plaintext.

## Disposition and next decision

**Close #2376 unresolved under the stated source gate.** The bridge's numerical observations survive, but no exact authenticated operator exists to invert. The next productive action requires a source-selected decoding instruction or a new original artifact that fixes the necessary field/serialization/code family; a random GF256 Reed–Solomon matrix, an alphabet fit, or exhaustive radix/row/path tuning cannot establish the author's plaintext. Do not promote this conditional receiver to `results/README.md` as a verified key or decryption.

# LP2 original two empty 13-dot intervals as a 128-bit AES key selector

**Agent27, 17 November 2026. Intermediate, bounded candidate receiver; no unknown plaintext, source-authenticated algorithm or destination recovered.** The original mark/table geometry selects two complete, distinct 8-byte rows without fitting a key to ciphertext. A source-motivated attempt to interpret their concatenation as an AES-128 key produces high-entropy output, not a readable original passage or typed object. Do not promote the proposed AES operation as authored: the manuscript visibly fixes the two empty intervals, but supplies **no AES or key-use instruction**.

## What the source fixes

The original physical LP2 58-page rune sequence contains **13,136 runes**. Its **31 distinct printed 13-dot glyph events** partition the full release into 32 intervals (mark time, including both authentic solved pages). The exact double marks produce two zero-length intervals:

- **Fragment 8, zero-based:** original p7 black and red 13-dot marks occupy the same p7:194 rune position, global rune index **1860**.
- **Fragment 11, zero-based:** original p14 end and p15 start carry two distinct red 13-dot marks at the same absolute index **3603**.

These are previously established source facts [13-dot empty-fragment report](13dot-coincident-empty-fragments.md), not newly discovered by this test. The original numeric field on pp49–51 contains exactly **32 rows of eight two-character numerals**. A literal chronological fragment-to-row pairing therefore selects **original printed rows 8 and 11**, each eight bytes under an eligible numeral reading. The first-party cuneiform numeral context nominates the 60-character base notation; the source's unused lowercase `f` leaves an independent 59-symbol decoding, so **both** were retained.

The resulting hypotheses have one independently source-determined 16-byte key and 30 remaining eight-byte rows, or **240 bytes = fifteen AES-128 blocks**:

| Numeral reading | Original row8 (8 bytes) | Original row11 (8 bytes) | Concatenated 128-bit key |
| --- | --- | --- | --- |
| Base60 `0-9A-Za-x` | `7aff19c0c749a96c` | `d3dcc631ec543823` | `7aff19c0c749a96cd3dcc631ec543823` |
| Base59, omit lowercase `f` | `78fb19bdc448a66a` | `d0d9c330e8533723` | `78fb19bdc448a66ad0d9c330e8533723` |

The **testable interpretive leap** is to concatenate the empty-interval rows into an AES-128 key and treat the **remaining 240 printed bytes in source order** as the ciphertext. This is plausible as a 2014 byte-level cipher with no fitted key parameters, but **there is no source glyph naming AES, an encryption mode, an IV, or any separate plaintext target**. As a result, a negative is only for these direct constructions, not for the book's general encryption architecture.

## Source-shaped complete inverse

Freeze the original two physical numeral alphabets and the source-literal key rows. Check **both fragment order orientations**: row8∥row11 and row11∥row8. Decode the remaining cells in original order under (a) **AES-128-ECB** with no padding (15 full blocks); (b) **AES-128-CBC** with zero IV (15 full blocks); and (c) **AES-128-CBC** using the first remaining 16-byte block as the IV (14 blocks). No AES key derivation, arbitrary offset, guessed phrase, row permutation, block shuffle or original-rune-language model enters the inverse. Exactly **12** complete source-fixed decryption outputs result.

| Original key | Mode, forward row order | Output bytes | Printable ASCII | ASCII letters | First decoded 16-byte block |
| --- | --- | ---: | ---: | ---: | --- |
| Base60 | ECB | 240 | **88** | **47** | `3dc886bf4bd04d790a59ed932772a267` |
| Base60 | CBC zero IV | 240 | **93** | **53** | Same as ECB |
| Base59 | ECB | 240 | **93** | **58** | `59b9317e6dc2c7bf3abf5dfebe8db502` |
| Base59 | CBC zero IV | 240 | **91** | **55** | Same as ECB |

The other orientation and IV control have similarly random-looking bytes in the locked JSON output. The base60 ECB first block, for example, contains several high-bit bytes and no source-defined file magic. The original outputs do **not** contain coherent plain ASCII, original-language instructions, or a recognized header. A separate test encrypts and exactly recovers a **240-byte known plaintext plant** under both AES-128-ECB and AES-128-CBC, preventing an implementation error from masquerading as an original failure.

## Decision and actual next input

This is a bounded failure of one *source-shaped* two-empty-row AES-128 transport, and an additional explicit reason **not** to treat the dual empty-interval numerology as a solved key. The two source rows could encode something other than a key, and no first-party cue defines where the 240 bytes should be delivered. In particular the mere existence of an exact 128-bit key length and 15-block remainder is insufficient: 32×8 rows and two zero-length intervals **mechanically imply** those lengths.

The reproducible, read-only [original corpus and AES source SFT](../sims/lp2_empty13_rows_aes128_source_sft.cjs) independently recomputes both original positions and extracts both actual keys, runs all 12 inversions and checks planted encrypt/decrypt. Run it on Node.js 22, Windows-compatible. [Passing original-input Windows Node.js 22 run (44138348450)](https://github.com/FlareZ123/liber-primus/actions/runs/44138348450). Future improvement requires **an authenticated source instruction selecting the algorithm/mode and a ciphertext receiver**, or an independently specified nontrivial output type and checksum. No new plaintext, historical source-selected AES key, or continuation is claimed.

# Original ink256 versus 256 table bytes: direct byte-mask and AES gate

**Agent 49, 16 November 2026. Status:** source-constrained direct-cipher exclusion and one exact ordering-independent format obstruction. **No unknown LP2 plaintext, key, decipherment, or destination recovered.**

## Why these inputs

The untouched LP2 manuscript contains **225 red GP runes** and **31 thirteen-dot marks**, giving **256 chronological ink events**. Its 32×8 numeric table on physical pp49–51 has **256 printed base60 byte cells**. A participant might pair these independently visible inventories and use historical Cicada's previously demonstrated bytewise XOR or derive a 256-bit key. Neither operation is author-selected. This test uses original page/rune order and mark-before-rune at a common offset; it retains the corrected p0 red13 layout.

## Exact ordering-independent XOR obstruction

Each red rune has GP ordinal 0–28 or its assigned prime weight 2–109. Each 13-dot punctuation mark is represented literally as 0 or 13. **Every proposed ink-event byte is below 128.** The original table has **129/256 bytes >=128**.

For any byte x and mask k<128, the high bit of x XOR k equals the high bit of x. Consequently **every possible pairing**, permutation, rotation or reversal of these 256 low-seven-bit event bytes with the original 256 table bytes leaves **129 high-bit output bytes**. No direct source-event XOR can yield a 256-byte *seven-bit ASCII* plaintext under this explicit codec. This does not exclude hidden binary payloads, distinct key encodings, multiple cipher layers, or other byte operations.

The frozen ordinal/prime × marker0/13 schemes yield 12 direct byte-mask readings under XOR and add/subtract mod256. None contains sustained English or a recognizable start-of-file header; only **96–111/256** bytes are ordinary printable text or whitespace controls. These direct arithmetic negatives are scoped to source-origin pairing.

## Four 256-bit key projections

Encode each rune as either its GP ordinal low bit or its predicate ordinal>=15, with dot mark 0 or 1. Pack all 256 bits MSB-first into 32 bytes. The four exact AES-256 keys and decrypt counts for the unchanged 256 table bytes are:

| Event projection | Key hex | ECB printable | Zero-IV CBC printable |
| --- | --- | ---: | ---: |
| Parity, mark1 | 969e9985ec6e7c78636fa82fe7b244f3413f22709fd99b92e10a3e36dde3eb89 | 108/256 | 94/256 |
| Parity, mark0 | 96989984606e0c78436e280fe4b244334139221087199b92e10a3e36d9e26888 | 101/256 | 80/256 |
| Ordinal>=15, mark1 | a6f7134baf6e7b42e2439ff457524deed9e704705dcda280e95c142507e3db5f | 99/256 | 98/256 |
| Ordinal>=15, mark0 | a6f1134a236e0b42c2421fd454524d2ed9e10410450da280e95c142503e2585e | 89/256 | 111/256 |

None yields recognizable original-message content. All eight modes independently recover a planted 256-byte ASCII source through their full AES encrypt/decrypt round trips.

Direct original-event bits also fail to identify a single table byte bit-plane. Best of eight bit-planes at original phase matches **142/256** (parity/mark1), **145/256** (parity/mark0), and **145/256** (threshold/mark1). Under all 256 cyclic shifts with eight bit planes rescored, **76, 34, and 28** phases respectively do at least as well.

## Decision and reproduction

The source-visible 256=256 equality does not support the tested direct masks, AES bitkeys, or single-bit field association. The XOR high-bit obstruction is exact for *any event/table pairing* under the low-seven-bit ink byte codec; the AES and additive results are finite source-fixed negatives. Further key/IV variants would require a new independently supplied clue.

The previously reported stationary table-byte→ink-glyph lookup exclusion is a separate family; see [that report](ink256-grid256-source-lookup.md). Reproduce these exact cases and positive AES plants with the [single-file original-input CommonJS SFT](../sims/lp2_ink256_table_direct_aes_mask_sft.cjs), which reads only the three canonical JSON artifacts and performs no filesystem writes. [Passing original-source Windows Node22 CI run 43815442768](https://github.com/FlareZ123/liber-primus/actions/runs/43815442768) independently executed every assertion and full AES planted control.

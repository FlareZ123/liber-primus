# p8 255-rune / pp49–51 256-byte direct XOR gate

**Classification (15 November 2026, Agent16): bounded source-selected negative.** No unknown plaintext, historical key, or continuation was recovered.

## Human-visible premise

The original p8 scan (25.jpg) contains 255 GP29 runes, including its large red initial (the first corpus rune is GP29 index 14). It is the **only rune-bearing LP2 page with exactly 255 runes**. Original pp49–51 (scans 66.jpg–68.jpg) print a 32×8 table of 256 two-character tokens. Under the conditional base60 reading in resources/liber-primus/base60-grid.json, those tokens decode to 256 values in 0–255. The numeric base60 interpretation is still conditional; radix59 remains a separate live alternative.

This makes a byte-domain XOR between the 256-cell table and p8 a plausible, small-step human experiment. The one-byte length discrepancy gives only two natural end alignments: leave the final table byte unused, or treat the first table byte as a leading IV and use the remaining 255 bytes. No interior offset, reversal, permutation, modulo-29 postprocessing, or second cipher was searched.

## Original-input test

For each of the two alignments, the operation was fixed as:

    output[i] = table_byte[i] XOR GP29_index[i]

The GP29 symbols are represented by their canonical integer indices 0–28; the XOR result is kept as a raw byte, not reduced modulo 29.

| Alignment | Unused table byte | Printable bytes | Spaces | Control bytes | High bytes | Distinct bytes | Entropy (bits/byte) | UTF-8 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| First 255 table bytes | final byte 80 | 103/255 (40.39%) | 0 | 23 | 129 | 156 | 7.1079 | invalid |
| Last 255 table bytes | first byte 203 | 104/255 (40.78%) | 1 | 23 | 128 | 160 | 7.1530 | invalid |

Neither output contains a common PNG, ZIP, PDF, GZIP, ELF, GIF or JPEG signature, PGP armor, or valid UTF-8. The first 64 output bytes are:

- Drop final byte: c5eda9a960e36db25ef49fcfec0da7c877c70b3b658c274478c0a30d975787957079c53239448c1253471050e27cc05cf612353959b28642f178845476c0703e
- Drop first byte: e9adb472ec70a459fb91dde61fbec465c402257c8a3e4b7ed3ab178243988f6371ce27235f910c47570f45ff6fd04bed1b2d2154a4854aec799c537bd8783f77

These are binary-looking streams, not recovered English or GP29 plaintext. A 255-byte ASCII positive control was encrypted and recovered exactly under both alignments, validating the byte order and XOR implementation.

## Relationship to prior table tests

This is distinct from the existing [ciphertext-dependent table feedback test](lp2-grid-cipherfeedback-byte-xor-allseed-gate.md), which updates a 256-state register and reduces the plaintext output modulo 29, and from the [terminal row/column/rune-mask XOR gate](lp2-terminal256-byte-xor-allsecret-source-gate.md), which uses known p56/p57 text to test arbitrary byte masks. Here the proposed plaintext is the raw 255-byte output of direct table-byte XOR with p8.

## Decision

Retire this direct p8/p50 byte-XOR reading. Neither natural end alignment yields text or a recognizable binary payload, and the source provides no instruction for a second decoder. Do not continue with arbitrary offsets or add a new cipher layer to rescue these bytes. A different table consumer needs an independent author-selected selector or a discriminating prediction on original ciphertext.

**Reproducer:** sims/lp2_p8_p50_table_byte_xor_gate.cjs (Node standard library only). Run from repository root with node sims/lp2_p8_p50_table_byte_xor_gate.cjs.

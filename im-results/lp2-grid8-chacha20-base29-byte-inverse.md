# Printed-grid ChaCha20 keys against byte-packed BASE29 chapters

**Status: original-input bounded negative.** This experiment finds no unknown Liber Primus plaintext or historical key. It tests a distinct byte representation from the previously published rune-level table-column stream test.

## Why this test was worth running

The original physical pp49–51 visibly print 256 two-character numerical cells arranged as 32 rows by eight columns. Under the existing provisional radix60 reading, each vertical column is 32 bytes, exactly the key length for ChaCha20. The authenticated 2013 Cicada challenge used BASE29 integer conversion. A solver might therefore interpret a section of GP29 runes as a big-endian integer, serialize it into bytes, and apply a table-column key before reading a compressed payload. The original author does not prescribe the byte packing, ChaCha20, zero IV, or section/column correspondence.

The existing [direct table-column ChaCha20 test](../sims/lp2_grid8_chacha20_column_inverse_sft.cjs) instead creates keystream bytes and takes each modulo29 to decrypt one rune at a time. Its negative result does not test a bytewise XOR of a base29-packed section.

## One frozen byte-level inverse

Input: original pp0–55 GP29 indices from the [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json), total **12,956**. Use the pre-existing eight textual source-unit boundaries, at rune offsets [0,729,1874,3612,5506,6527,7960,9640,12956], rather than the later nine original-image visual-chapter boundaries. The table values are provisional base60 bytes from [the source table](../resources/liber-primus/lp2-grid-256.json).

For each section, read its GP29 digits as one base29 big-endian integer and write exactly ceil(number_of_runes * log2(29)/8) big-endian bytes. The original fixed width preserves leading zeros needed for round-trip. In section order 0–7, take the corresponding vertical 32-byte column of the source table and generate the same number of ChaCha20 bytes with zero 64-bit counter and zero 64-bit nonce. XOR with the packed section bytes. No candidate column permutation, IV change, key derivation, digit reversal or linguistic optimization is performed. The resulting byte stream is inspected for first bytes, ASCII readability and conspicuous file headers.

## Original run

| Section | Rune count | Packed bytes | Decoded first 12 bytes (hex) | Decoded printable fraction |
|---:|---:|---:|---|---:|
| 0 | 729 | 443 | a4a2881f3bbc170b2b086709 | 0.300226 |
| 1 | 1145 | 696 | 4464be77c4557703b918525b | 0.383621 |
| 2 | 1738 | 1056 | ac258e571ba9501f66ef563d | 0.372159 |
| 3 | 1894 | 1151 | ddf5d0ec3aef97f4a6e8430e | 0.400521 |
| 4 | 1021 | 620 | b3dedba098ede69b445a0258 | 0.380645 |
| 5 | 1433 | 871 | 15dccc41d8d468a17657a3bd | 0.383467 |
| 6 | 1680 | 1021 | 22e92c43178f8c95557ead6b | 0.380999 |
| 7 | 3316 | 2014 | 46e1501e6767450d09c3e406 | 0.380338 |

Every decoded preview is high-entropy and lacks coherent ASCII text or an obvious PNG, ZIP, GZIP, BZIP2, PDF or OpenPGP header. Across all eight sections the printable fractions are near random-byte expectations. The direct rule therefore supplies no positive evidence of an authentic plaintext channel, while leaving non-ASCII, transformed, alternative framing or keyed source interpretations open.

## Reproduction and limitations

The [single-file CommonJS SFT](../sims/lp2_grid8_chacha20_base29_byte_sft.cjs) reads canonical inputs, checks the published ChaCha20 all-zero-key 64-byte known-answer vector, round-trips each original-length BASE29 packed section, exactly XOR-reverses all eight decoded byte streams, and recovers a genuine solved-p57 native-GP test plant after byte packing and masking. These tests establish implementation consistency; no historical cipher selection follows.

This is one source-motivated direct reading. A source-selected byte framing, authenticated key pairing, IV, or external file can warrant a different experiment. Do not extend it through unconstrained 8! assignments, guessed nonces or pressure from a file-magic scorer. No unknown GP plaintext, key or continuation destination was recovered.

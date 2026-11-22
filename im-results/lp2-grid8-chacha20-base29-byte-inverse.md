# Source-table ChaCha20 against BASE29-byte-packed LP2

**Classification: two frozen original-input negatives. No unknown plaintext, key or destination recovered.** This source-motivated test is different from the existing table-column test that converts each ChaCha byte modulo29 and applies it directly to one GP rune.

## Premise and exact operation

The physical pp49–51 numerical table has 32 printed rows and eight columns. The provisional radix60 interpretation yields eight 32-byte vertical columns, the natural ChaCha20-256 key length. The authenticated 2013 BASE29 challenge makes interpreting a GP29 rune sequence as an integer plausible. The manuscript does not authenticate ChaCha20, this byte serialization, zero counter/nonce, or a section-to-key pairing.

Each section's runes are read as one big-endian base29 integer and serialized into ceil(rune_count × log2(29)/8) big-endian bytes. The printed table's column of the same ordinal supplies a ChaCha20-256 zero-IV keystream; XOR gives a candidate byte output. Column ordering, IV, cipher and digit direction are fixed without fitting to original data.

Two **independently established sectionings** are compared without optimizing the key assignment: the historical eight text-source units at rune offsets [0,729,1874,3612,5506,6527,7960,9640,12956], and the original-image nine visual chapters at [0,729,1874,3603,5506,6527,7960,9640,12648,12956]. Under the latter, the first eight macro-chapters receive the eight keys; the terminal p54–55 308-rune chapter has no corresponding key, so its raw bytes are shown for completeness and **are not called a decryption**.

## Original-image visual chapters

| Chapter | Rune count | Packed bytes | First 12 output bytes, hex | Printable fraction |
|---:|---:|---:|---|---:|
| 0 | 729 | 443 | a4a2881f3bbc170b2b086709 | 0.300226 |
| 1 | 1145 | 696 | 4464be77c4557703b918525b | 0.383621 |
| 2 | 1729 | 1050 | fedb0fd1461918ce4b0f6cac | 0.371429 |
| 3 | 1903 | 1156 | dc9e26c119086781e61cf92e | 0.400519 |
| 4 | 1021 | 620 | b3dedba098ede69b445a0258 | 0.380645 |
| 5 | 1433 | 871 | 15dccc41d8d468a17657a3bd | 0.383467 |
| 6 | 1680 | 1021 | 22e92c43178f8c95557ead6b | 0.380999 |
| 7 | 3008 | 1827 | 46d164643f3760960223eb92 | 0.378216 |
| 8 (raw; unkeyed) | 308 | 188 | 010490bde021d22c8fb147f1 | 0.382979 |

The historic eight text-source layout also yields no overt language or recognizable initial PNG, ZIP, GZIP, BZIP2, PDF or OpenPGP header. Its output first-12-byte hex values, in column order, are: a4a2881f3bbc170b2b086709; 4464be77c4557703b918525b; ac258e571ba9501f66ef563d; ddf5d0ec3aef97f4a6e8430e; b3dedba098ede69b445a0258; 15dccc41d8d468a17657a3bd; 22e92c43178f8c95557ead6b; 46e1501e6767450d09c3e406. The printed-character fractions are 0.300226, 0.383621, 0.372159, 0.400521, 0.380645, 0.383467, 0.380999 and 0.380338.

Both outputs resemble high-entropy bytes. The direct hypothesis yields no evidence of a plaintext-bearing ChaCha20 channel, while binary/compressed payloads under other source-selected operations remain open.

## Reproducer, controls and limit

The [CommonJS SFT](../sims/lp2_grid8_chacha20_base29_byte_sft.cjs) uses the canonical [original runes](../resources/liber-primus/lp2-corpus.json) and provisional [original table bytes](../resources/liber-primus/lp2-grid-256.json). It checks the ChaCha20 all-zero-key 64-byte known-answer vector, exact original rune→byte→rune reconstruction in both sectionings, reversibility of the byte XOR, and a genuine solved-p57 plaintext plant. The original outputs were also computed in an independent JS ChaCha20 implementation using the same canonical original inputs. Successful round trips test implementation, not historical key identification.

This one bounded source-reading does not authorize sweeping guessed nonces, column permutations, formats or extra ciphers. A new original source clue that independently fixes those choices is required to make another test meaningful.

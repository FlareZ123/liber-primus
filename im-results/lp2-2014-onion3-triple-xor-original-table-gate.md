# Authentic 2014 three-shard XOR operation and the original LP2 three-page numeral table

**Decision, 18 November 2026.** A real 2014 Cicada stage uses **three equal-length, independent binary inputs and bitwise XOR**. The 2014 archived operands exactly reconstruct a full PGP-armored message (991/991 printable bytes). Original LP2's p49–51 numeral table provides three physically distinct page portions of **80, 104, and 72 bytes** under the established provisional base60 reading. There is no first-party instruction selecting a bytewise three-way XOR operation or an unequal-length combination law for these LP2 pages. The two frozen, minimal length conventions below produce no recognizable typed output. **No unknown LP2 plaintext or key.**

## Historical positive directly from dated source

The 2014 [Stage03 historical reconstruction](https://github.com/micheloosterhof/cicada-2014/blob/master/stage03/README.md) identifies three JPEG/OutGuess outputs that are decoded into three byte streams then XORed to uncover the next signed puzzle instructions. The exact authentic binary operands are [onion1.bin](https://github.com/micheloosterhof/cicada-2014/blob/master/stage03/onion1.bin), [onion2.bin](https://github.com/micheloosterhof/cicada-2014/blob/master/stage03/onion2.bin) and [onion3.bin](https://github.com/micheloosterhof/cicada-2014/blob/master/stage03/onion3.bin), **991 bytes each**.

Direct XOR of their retained bytes, without a guessed key or parameter, yields **991/991 printable ASCII bytes**, starting `-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1\n\n\n\nIDGTK UMLOO ARWOE`, and including a full `-----BEGIN PGP SIGNATURE-----` to `-----END PGP SIGNATURE-----` block at the end. This is a successful **authentic historical input→typed object** control (we check the original PGP armored bytes, not an independent GPG signature verification). The Stage03 README's abbreviated CLI line uses `onion1xor2.bin` as the third operand; that file is itself the two-input XOR, whose inclusion cancels the first two to all zeros. A correct three-file reconstruction must instead use `onion3.bin`; the full signed output confirms this correction.

## One LP2 recipient selected by original physical layout

The original LP2 printed numeral table occupies p49, p50 (rune-free), and p51. The [canonical original transcription](../resources/liber-primus/lp2-grid-256.json) has 32 rows × 8 cells, split **10+13+9 rows** over those three pages. Under the explicitly provisional mapping `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` of two base60 digits to a byte, the input streams have lengths **80, 104, 72**.

The first-party Stage03 three-shard XOR operation requires three equal-length operands, so LP2 has no exact source-specified matching input. We froze two elementary conventions, without fitted keys or row permutations:

| Original LP2 table reader | Bytes produced | Printable ASCII | First 32 bytes (hex) | Typed header |
| --- | ---: | ---: | --- | --- |
| Retain complete common 9-row prefix of each page; triple XOR | 72 | 28/72 | `c5417d2aea31bbd78fbec5b6ab23e6d8c9169647f720648c2e56b4fede6c56a2` | None |
| XOR all three pages, treating missing positions on shorter pages as zero | 104 | 38/104 | Same | None |

The 72-byte prefix discards 40 authentic input cells beyond each selected nine-row prefix. The padded 104-byte output consumes all cells but padding is a new unauthored convention. Neither produces a PGP, JPEG, ZIP, PDF, gzip or bzip2 opening; source byte distributions are consistent with binary noise at this limited scale. More exotic table layouts or masks would be arbitrary extensions without an independent historical or source-visible selector, so none were searched.

For completeness the historically used **bytewise bit inversion (XOR FF)** applied directly to the original 256-byte table also yields no typed header (99/256 printable, first 32 bytes `341858459e128148a306632108fb482b8635f0de9976c4a8923952e669bd727a`). This is a narrowly stated direct-input negative, not a search over other byte alignments.

## Reproduction, interpretation, and the next decision

[Complete self-contained Windows Node22/CommonJS SFT](../sims/lp2_2014_triple_xor_grid_original_sft.cjs) embeds the three unchanged historical archived binaries as base64 controls and reads the committed original LP2 source table. It asserts the exact historical 991-byte signed positive and the source-original 72/104-byte negatives. [Windows Node22 CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44266432598) independently reproduces all historical positive controls and the original LP2 table negative tests. The previous [initial failed run](https://github.com/FlareZ123/liber-primus/actions/runs/44266199329) was caused solely by an empty ZIP-signature test fixture, corrected in the passing version.

The genuine historical operation narrows plausible intent if LP2 explicitly signals three binary shards. Merely having three visually adjacent table pages does not select the operation, especially with incongruent lengths, and an unidentified XOR product is not a decrypt. A future source-authored clue must specify an exact **three-way operand segmentation, equal-length correction or expansion**, and the expected typed receiver before more LP2 ciphertext is fitted. The historically documented operation is now covered; do not run generic XOR key/row/permutation grids as extensions.

**Director #1447 disposition:** one authenticated 2014 operation with an image-selected potential LP2 input has been tested; its actual necessary-input gate fails and no executable first-party LP2 operator or plaintext arises. Retire this direct transfer pending a genuinely new LP2-authored operand.

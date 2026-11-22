# Original 75-JPEG OutGuess scan with the conditional 32-byte seam key

**Agent 1, 17 November 2026. Classification: bounded original-data negative, no recovered unknown LP2 text, authentic key or file.**

## Author-visible route

Earlier LP1 puzzles demonstrably used OutGuess on JPEGs. The original LP2 includes **75 JPEGs** and exactly **32 words crossing page seams**, while the original p50 numeric table has **32 rows of eight byte-valued entries**. [Agent22's source analysis](lp2-crosspage32-gridbyte-original-gate.md) selected one byte per table row by the one-based number of original runes after the corresponding page seam, creating the conditional 32-byte key:

`61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671`

One obvious way to use binary key material as an OutGuess passphrase is its ASCII lowercase hex serialization (64 characters). This test freezes **that exact text** without optimizing capitalization, KDF, alternate transcriptions, JPEG order or other passwords. Neither source instructs an OutGuess transfer of the selected bytes, so the key remains hypothetical.

## Entire source-image test

Using the preserved native OutGuess 0.4 JPEG bitmap/RC4 implementation `sims/outguess_bitmap_dump.c` plus `sims/outguess_extract.py`, exhaust original `resources/liber-primus/00.jpg` through `74.jpg`. The C routine iterates original quantized DCT MCU coefficients, skips exactly zero and positive one coefficients, and packs their parity bits. The key text is given to the original OutGuess seeding and encryption streams. **A known first-party positive control is built into the test:** the authentic 2016 tree JPEG `resources/historical/cicada2016-4gq25.jpg` decodes under the historically correct blank passphrase to precisely the preserved 1,136-byte PGP-clear-signed payload. That authentic extraction is checked byte for byte before the candidate tests.

Original original-image scan outcome (fixed key, all 75 images):

| Condition | Count |
| --- | ---: |
| Original JPEGs tested | **75** |
| First 1,024 eligible coefficient bits **all one** | **65** |
| Native extractor apparently completed a payload | **73** |
| Native extractor failed declared length/iterator | **2** |
| Completed payloads with recognizable file header or ≥90% ASCII | **0** |

The crucial trap is that **65/75 images have the first 1,024 eligible bits all one**. OutGuess's 32-bit encrypted header samples only within this region, so every password on these carriers produces the **same fake `ffffffff` encrypted header**, with a password-dependent apparent seed and length. Thus a decoded length/seed and a successfully completed pseudo-payload are insufficient evidence of steganography.

For this key, the apparent header `53362e31` occurs in at least 64 completed cases. The original JPEGs `31.jpg`, `49.jpg` and `72.jpg` each give a length 12,590 false-positive pseudo-payload with GP-incompatible content; exact payload SHA256 values respectively:

- `e8096bc31d40828946d636a42b7f5e735a5038d4ee4919ee5919d1e1491a82b0`
- `aff3adcfcc9bbd14a319d035f9c59327e772a2b7398b3e15e5f0ac48d3463cec`
- `94e0c8cf7692e82fd2ad6cd35e81b36a83567719adb551060df730c79606f63d`

The candidate's direct OutGuess receiver finds **no plausible file or readable payload** in the entire original JPEG archive. A formatless high-entropy embedded file cannot be excluded solely by the absence of magic or ordinary text; a different key serialization is another operation not selected here. Above all, the conditional seam key has not been independently authenticated. No new plaintext is claimed.

**Reproduce:** [Windows-compatible Python SFT](../sims/lp2_seam32_outguess_all75_source_sft.py), with existing repository-local JPEG bitstream C code and the original 75 images. The full 75-image gate was separately executed locally against the ZIP of unmodified original images; the new source-native reproduction file is committed for independent replay. Do not assert its remote CI passed until it actually runs.

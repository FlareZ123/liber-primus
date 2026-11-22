# 2013 Twitter hex stream: binary format gate

**11 November 2026 · Agent37 · issue #262 · outcome: no recognizable file/container or LP2 feed recovered.**

## Existing reconstruction (do not repeat)

The exact reconstruction already exists in [Agent29's original-byte LP2 inverse report](cicada2013-twitter-2014-column14-original-inverse.md) and its reproducer [`sims/cicada2013_twitter_original_pad_inverse.cjs`](../sims/cicada2013_twitter_original_pad_inverse.cjs). It sorts the 988 address/value records by ascending address and establishes:

- address range `0x0000000` through `0x000fa9b`;
- 987 records of 65 bytes and one 12-byte highest-address fragment;
- 64,167 bytes total, contiguous, with no gaps or overlaps;
- SHA-256 `defa117644978755c9d6e5cf9ed3dc4179dc63e5b6da877f1212ca2d24ce3776`.

The original Twitter header `Offset:0, Skip:0, Col:65, Line:988` explains the 65-byte record stride and 988 records. The issue premise that no exact reconstruction was documented was therefore stale.

## Format test

The new [format-gate reproducer](../sims/cicada2013_twitter_format_gate.cjs) rechecks the reconstruction and SHA-256, then tests common file signatures, JPEG marker framing, byte entropy, and the apparent 16-byte alignment. It is deterministic and runs from repository root:

```sh
node sims/cicada2013_twitter_format_gate.cjs
```

The reconstructed object begins:

```
b6 9c cc e3 00 10 4a 46 48 02 54 59 59 58 00 01
00 8d 00 00 ff 8b 61 ...
```

No common JPEG, PNG, GIF, ZIP, GZIP, PDF, ELF, 7z, RAR, BMP, or SQLite signature is present at offset zero. The byte stream has **7.9966 bits/byte** of empirical Shannon entropy and uses all 256 byte values. A few JPEG-like marker pairs occur inside it, but there is no JPEG SOI (`FFD8`), no DQT (`FFDB`), and no JFIF marker; the isolated hits do not constitute a valid JPEG framing. No recognized embedded file or plaintext instruction is identified by these checks.

## The 23-byte / 16-byte-block observation is not a format identification

The total length is 64,167 bytes, so removing any prefix length congruent to 7 modulo16 leaves a block-aligned remainder. In particular:

| Prefix removed | Remaining bytes | 16-byte blocks |
|---:|---:|---:|
| 7 | 64,160 | 4,010 |
| 23 | 64,144 | 4,009 |
| 39 | 64,128 | 4,008 |
| 55 | 64,112 | 4,007 |

The first 23 bytes are not a known header, and the 16 bytes at offsets7–22 are not source-identified as an IV. Selecting 23 because it is the DH modulus in another 2013 worked example would be circular: the length arithmetic itself does not select it. Neither the block alignment nor the high entropy establishes AES, a particular mode, or a custom container. No AES/password/XOR guesses were run.

## LP2 relevance

The only documented historical role is as an opaque 2013 byte stream used in the earlier Cicada round. Agent29's preceding report already tested the raw stream as a direct additive GP29 pad (204,848 fixed source models) and combined it with the authentic 2014 14-column operation (819,392 fixed models), with native-GP hidden-key positive controls. Those original LP2 inversions recovered no unknown plaintext.

No source-visible instruction or recovered object links this byte stream to LP2. The 23-byte prefix theory supplies no such link. **Decision: treat this as a self-contained earlier-stage high-entropy byte stream, not a newly identified file/container or LP2 key. Close #262; do not repeat the direct-pad or column14 sweeps.**

This is a bounded negative result, not proof that the stream cannot encode a different earlier-stage payload under its original 2013 instructions.

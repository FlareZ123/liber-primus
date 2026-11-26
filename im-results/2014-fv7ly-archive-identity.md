# 2014 fv7ly .htaccess: complete byte identity (Director #2944)

**Decision: no new LP2 material.** The 5,577,967-byte object is a different representation of known LP1 pages 03, 04 and composite 05. It is not gzip. Actual [acquisition run 45789078905](https://github.com/FlareZ123/liber-primus/actions/runs/45789078905) downloaded the exact [Internet Archive object](https://archive.org/download/fv7lyucmeozzd5j4.onion/.htaccess) (HTTP200, metadata SHA1 matches), then local Python independently reconstructed its whole raw text from the maintainer's original ZIP. The item is a 2020 community re-upload labelled 2014, not a new contemporaneous capture.

| Representation | Bytes | SHA256 |
|---|---:|---|
| Raw lower-case hex + final LF | 5577967 | 51886868658ea5a95898ff9847af7e56222ed2b1d46bc743311ff6c777651040 |
| Hex decoded before complement | 2788983 | 9be35c6613ef8e8c6fb4a7543ac7cb4029a2a03da88e18921c1af7343c440ede |
| Complemented payload | 2788983 | 5d46f4a8a215fdaec1eda52ecd65c3d1ef2f3969876f6046b432a5558fde27f3 |

Decoded input prefix 0027001fffefb5b9 is the exact bitwise complement of JPEG/JFIF prefix ffd8ffe000104a46. Complement is format-selected. The first acquisition script only recognized complemented gzip, so its zero recognizable JPEGs were before complement. The complete exact crosswalk supersedes that incomplete format gate.

| Payload half-open range | Content |
|---|---|
| 0:336353 | 05 forward JPEG core |
| 336353:336534 | 181-byte nested gap (two LF + 179 bytes) |
| 336534:672887 | same 05 core reversed |
| 672887:1565646 | original 03.jpg |
| 1565646:2788983 | original 04.jpg reversed |

Four JPEG streams, three distinct exact JPEGs; all three fully decode 2400×3600 in Pillow. 03 SHA256 b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f; 04 745c6a46f67de1e5a2a9ac76175c323af82c2432e3b7483a8dc6244f8de9478f; 05 core c517d5d87544a761188cd50c46473898ab9d2c0da108cf13c61234dc1bda635a. No unexplained trailing bytes.

Original 05 is a 673066-byte composite with two mirror JPEG cores and a 360-byte central gap (two LF + 358 nested hex digits). This explains the 179-byte difference between the sum of 03/04/05 lengths and the archive decoded payload. Take 05 core + decoded nested hex + two LF + reversed core; reverse this whole composite, append 03 and reversed 04, complement, encode lowercase hex and append LF. Exact independently downloaded raw SHA256 and SHA1 match. A bounded orientation/order and newline-position identity search found the arrangement; the final reproducer uses only that fixed arrangement.

The central gap, reversing the original 05 hex characters and decoding, yields:

```
272 138 341 131 151
366 199 130 320 18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

All rows, columns and both main diagonals sum to 1033. It is the [historically described third-onion material](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014)). The external [OSINT sweep](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/OSINT-SWEEP-2026-07-27.md) described .htaccess blobs as gzip/JPEG candidates and later unidentified high-entropy material; this resolves fv7ly specifically. Avowy is already resolved separately. No password, KDF or LP2 key search follows.

- [Exact crosswalk SFT](../sims/fv7ly_archive_identity_sft.py): local Python with maintainer ZIP; standalone file reconstructs same computation.
- [Acquisition SFT](../sims/fv7ly_archived_htaccess_sft.py): original raw and metadata preserved in read-only workflow artifact.
- Archive public date 2020-11-06 02:29:40; file last-modified 2020-11-11 20:52:55 UTC; SHA1 5bc5d0706fa455710ad2a8f598782ef5ce1b3070; MD5 per IA ba9b11c378e42b865e87dafaa347dc8a.

# Two appended JPEG tails in the original full 75-image Liber Primus scan

**Classification:** source-artifact interpretation, **not recovered LP2 plaintext or a proposed cipher**. This investigation is a completed byte-for-byte parsing of the available full original JPEGs `resources/liber-primus/00.jpg` through `74.jpg`. It resolves whether two conspicuously oversized files embed distinct images or useful unseen numeric material, without further blind steganographic search. The existing public [Dukotah Corpus-A trailing-data inventory](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/REPORT-A.md) noticed both trailer lengths, but did not state these complete exact byte identities.

## Exact findings

Among the 75 source JPEGs, **only `05.jpg` and `10.jpg` have bytes after the first true JPEG EOI marker**.

1. `05.jpg` (673,066 bytes, SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`) consists of a **336,353-byte complete JPEG** plus a **336,713-byte trailer**. Reversing the trailer byte order gives an exact, byte-for-byte copy of that *same 336,353-byte JPEG*, followed by **360 printable ASCII hexadecimal characters**. Hex-decoding those 360 characters produces precisely the 5×5 numerical square displayed on the same solved early page:

```text
272  138  341  131  151
366  199  130  320   18
226  245   91  245  226
 18  320  130  199  366
151  131  341  138  272
```

Thus, for byte strings `J05` (the primary JPEG) and `M` (the space-padded text version of the visible square), the complete file is exactly `J05 || reverse(J05 || ASCII_HEX(M))`. This is an exact source-borne alternative numerical encoding of *already visible solved-page content*. It offers an independent integrity witness for that historical square, but no additional key or instruction.

2. `10.jpg` (4,240,957 bytes, SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`) consists of a **754,662-byte complete primary JPEG** plus a **3,486,295-byte trailer**. The entire trailer is exactly `11.jpg || 12.jpg || 13.jpg`, preserving those three full original files byte for byte (sizes **712,733 / 703,428 / 2,070,134** bytes). No additional original page or alternate image resides in that trailer.

The other **73/75** files have zero bytes after the first JPEG EOI.

## Implications and limits

The dramatic image-file length anomalies do not by themselves identify a hidden LP2 key, unknown plaintext, or extra manuscript page. The reverse-byte / hex-encoding operation in `05.jpg` is present in the source bytes, but its producer, chronology, and intentional role are **not authenticated**; it cannot be promoted to an LP2 decryption step without an independent author-selected connection. The concatenation in `10.jpg` similarly has no new picture or decoder. A future attack on these two trailers should specify what new information it expects beyond the exact copied contents.

Other image steganography channels and historical 2014 onion carriers remain separate questions; this report excludes only these exact appended-byte structures.

## Reproduce

Execute `python sims/lp1_jpeg_trailer_source_sft.py` from the repository. It reads all 75 checked-in JPEGs, verifies both complete byte identities, asserts the **exact** numeric 5×5 square, and prints five source SHA-256 digests. It has no third-party dependencies and performs no writes.

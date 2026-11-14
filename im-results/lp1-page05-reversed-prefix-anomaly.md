# LP1 page 05 JPEG contains an exact reversed-prefix attachment

**Agent24, 14 November 2026. Evidence class: direct original-artifact byte identity; interpretation unresolved.**

The uploaded 75-image JPEG archive was scanned for bytes after each file's final JPEG EOI marker. Exactly one image has trailing data: LP1 page 05.

| Property | Observed value |
|---|---:|
| Archive JPEG count | 75 |
| Files with bytes after final EOI | 1 |
| File | 05.jpg |
| File size | 673,066 bytes |
| Final EOI offset | 600,364 |
| Trailing-data start | 600,366 |
| Trailing-data length | 72,700 bytes |
| Whole-file SHA-256 | 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7 |
| Tail SHA-256 | 3e95593e226980e3bf743ce9d12f38cf41b96dc7797587f9ff7470788719803f |

**Exact identity:** reversing all 72,700 trailing bytes yields byte-for-byte equality with the first 72,700 bytes of 05.jpg:

\[
\operatorname{reverse}(\text{file}[600366:673066])=\text{file}[0:72700].
\]

This is not merely a similar image or a coincidental JPEG signature. The reversed tail begins with the original file's exact JPEG/JFIF header. Decoding the reversed tail as a truncated JPEG produces a 2400×3600 image whose first 900 rows are pixel-identical to the original page05; the remaining area is incomplete/truncated. It is therefore a reversed copy of the original page's prefix, not a second independent hidden page or a recovered plaintext.

The other 74 JPEGs in the uploaded archive have no bytes after their final EOI. The anomaly is unique to LP1 p05, the prime/totient page. Its significance is unknown: it could be a deliberately constructed mirror/echo marker or an artifact introduced before the archive was supplied. No cryptographic operation or intended use is established.

## Reproduction

Run the following from the repository root:

    python sims/lp1_jpeg_mirror_tail_scan.py /path/to/liber-primus-jpegs.zip

The script also accepts an extracted image directory. It reports all post-EOI tails, hashes, lengths, and exact reverse-prefix matches. The uploaded archive itself is not copied into the repository; this report records the observed hashes and byte identity. Do not interpret the 72,700-byte mirror as a new key or payload without an independent clue.

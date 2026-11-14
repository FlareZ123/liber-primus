# LP1 page 05 JPEG is a near-palindrome with a 179-byte central binary block

**Agent24, 14 November 2026. Evidence class: direct original-artifact byte identity; central-block interpretation unresolved.**

The uploaded 75-image JPEG archive was scanned byte-for-byte. Exactly one file has a nontrivial mirror structure: LP1 page 05, 05.jpg.

## Exact file structure

The 673,066-byte file decomposes exactly as:

\[
F=A\parallel M\parallel\operatorname{reverse}(A)
\]

where:

- \(|A|=336,353\) bytes;
- \(|M|=360\) bytes;
- the first 336,353 bytes equal the reverse of the last 336,353 bytes byte-for-byte;
- the central 360 bytes are the only part that breaks the symmetry.

The first block A is a complete 2400×3600 JPEG, ending with EOI at offset 336,351. The middle block M begins with two newline bytes followed by 358 ASCII hexadecimal characters. Those characters decode to a 179-byte binary block.

| Property | Observed value |
|---|---|
| Archive JPEG count | 75 |
| Files with nontrivial mirror structure | 1 |
| File | 05.jpg |
| Whole-file size | 673,066 |
| Mirror-shell length on each side | 336,353 |
| Central block length | 360 |
| Central block SHA-256 | b7673be762e3f1b0560b2735d1a0894029ce1a39abb130bf9947e81dbf733892 |
| Decoded binary length | 179 bytes |
| Decoded binary SHA-256 | 82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa |
| Whole-file SHA-256 | 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7 |

The exact central text is preserved in im-results/lp1-p05-central-block.txt. The decoded binary is not yet understood. Its byte distribution is highly nonuniform (102 of 179 bytes are 0x02); it is not ordinary plaintext, and no standard file signature or successful common decompression has been identified. No cryptographic interpretation is claimed.

The earlier observation of 72,700 post-EOI bytes is a consequence of this larger mirror structure: the trailing segment is the reverse of the first 72,700 bytes. Reversing it reconstructs that prefix exactly. It is not an independent hidden page. The other 74 JPEGs in the uploaded archive have no comparable mirror shell.

## Research significance

This is stronger than a generic appended-data anomaly: it isolates a 360-byte central block in a page whose remaining 672,706 bytes are exactly mirror-symmetric. Page 05 is the LP1 prime/totient page, so the central block deserves source-constrained analysis. However, the mirror itself does not identify how to decode the central binary. Do not assume the block is a key, plaintext, or a specific cipher format without an independently motivated operation.

## Reproduction

Run the following from the repository root:

    python sims/lp1_jpeg_mirror_tail_scan.py /path/to/liber-primus-jpegs.zip

The script also accepts an extracted image directory. It reports post-EOI data, maximal mirror-shell lengths, central-block hashes, and whether the central block is ASCII hex. The uploaded archive itself is not copied into the repository.

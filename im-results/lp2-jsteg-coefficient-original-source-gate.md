# Original LP2 JPEG coefficient receiver: exact JSteg-Shell length and footer test

**Decision (17 November 2026, Agent11).** A period-available sequential JPEG quantized-DCT coefficient LSB consumer was implemented and applied to all 58 original LP2 scans (archive 17.jpg–74.jpg), all 16 source LP1 JPEGs containing a single stream (00.jpg–09.jpg and 11.jpg–16.jpg), and one coefficient-preserving planted positive. **No original LP2 file contains a complete JSteg-Shell length-plus-signature record under this exact byte/bit-order and AC coefficient path.** This excludes one specific keyless historical JPEG receiver. It does not exclude other coefficient-domain steganography, another coefficient selection order, an author-selected password, or a text-cipher key obtained elsewhere. No unknown Liber Primus plaintext or key was found.

## Why this receiver

JSteg embeds bits sequentially in eligible JPEG quantized DCT coefficients. The historical JSteg-Shell variant adds an unencrypted variable-width length and footer signature. Contemporary descriptions specify five leading bits for length-field width, the following width bits for message length in bytes, and JSteg-Shell trailer "korejwa", "cMk4", or "cMk5". A full declared message plus exact trailer is a much stronger positive discriminator than a short purported OutGuess length header.

- Niels Provos and Peter Honeyman, *Detecting Steganographic Content on the Internet* (2001), sections 5.1 and 6.3.2: https://www.usenix.org/legacy/events/sec01/full_papers/provos/provos_html/ ; https://www.citi.umich.edu/techreports/reports/citi-tr-01-11.pdf .
- Period-compatible JSteg coefficient eligibility, absolute magnitude greater than one: https://journals.sagepub.com/doi/pdf/10.3233/INF-2004-15%281%2909 .
- [Original Huffman-origin fingerprint](lp2-2014-original-distribution-carrier-gate.md#lossless-jpeg-entropyhuffman-origin-test-agent-10-17-november-2026). The present test reads quantized coefficients directly. Huffman optimization and coefficient modification must remain distinct.

## Exact original-input decision

[Standalone C99/libjpeg reproduction](../sims/lp2_jsteg_shell_source_sft.c).

1. Read source JPEG coefficients through the libjpeg coefficient API; visit MCU blocks in scan order and AC coefficients in zigzag order. Exclude DC and coefficients −1, 0, +1. Record absolute-value parity.
2. Treat the first five bits as MSB-first field width w and the next w bits as unsigned big-endian length L in bytes. Require minimal width and capacity at least 5 + w + 8L bits. Match only the documented JSteg-Shell suffix at the declared end, or immediately following it.
3. Plant a 23-byte ASCII message ending with "cMk5" in the exact coefficient path of an in-memory copy of authentic 00.jpg, then write an optimized-Huffman JPEG while preserving quantized coefficients. Re-read it and compare the complete extracted bitstream with the original amended coefficients: every bit matches, including the length and trailing signature. The original 00.jpg bytes are untouched.
4. Run the frozen extraction against every original archive JPEG except 10.jpg, which concatenates JPEG streams. Genuine LP1 OutGuess carriers are *not* JSteg controls for decoder compatibility. They are channel-specific contrasting sources.

| Input | Source scans | Minimal-width length fits | Exact JSteg-Shell footer |
|---|---:|---:|---:|
| LP2 original 17.jpg–74.jpg | 58 | 10 | **0** |
| LP1 original single-stream scans | 16 | 1 | **0** |
| Synthetic JSteg-Shell positive in original 00.jpg coefficient substrate, optimized recode | 1 | 1 | **1** |

The ten LP2 fitting headers occur in scans 27, 29, 31, 39, 43, 44, 50, 57, 66 and 72. The first ten raw extracted bytes are identical in 27/29/31 (hex 14446061581004134452); scans 43/66 share their seven-byte first readout (hex B219E53C2803AC). These repeats help explain why short apparent payloads are misleading. The native synthetic positive reports width=5, length_bytes=23, signature=1 and first16=54455354204443542050524553455256. Every unmodified original reports signature=0.

## Limits and next experiment

This controlled positive establishes internal implementation and preservation under **lossless optimized-Huffman recoding**. It is not an independently sourced old JSteg-Shell carrier, so it does not prove exact byte-for-byte compatibility with every historical implementation. The test excludes one MCU+zigzag absolute-magnitude parity/byte-order/footer convention. Raw JSteg messages with a different wrapper remain possible, as do F5, JPHide and keyed OutGuess.

**Director Issue #1402 remains open**. A stronger next test would first recover a first-party authentic OutGuess payload from LP1 after coefficient-preserving optimized recoding, then apply that *same calibrated receiver* to original LP2 files under a source-selected key/mode. Do not infer authenticity from a plausible length header or run an arbitrary decoder/password menu.

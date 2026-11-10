# LP2 JPEG container and Huffman-table audit

**Classification:** reproducible, source-level negative for a specific JPEG-container channel. This is not an LP2 decipherment and does not exclude all image steganography.

## Why this test was motivated

Two LP1 images already have established byte-level payloads: JPEG 05 contains a reversed JPEG and reverse-hex encoding of its visible magic square, while JPEG 10 contains four concatenated JPEG streams. That history gives a concrete reason to test whether the 58 LP2 source images use a comparable container-level channel.

One specific candidate is the JPEG DHT segment. The order of symbols assigned to equal-length Huffman codes is not fixed by the code lengths alone, so a deliberately modified DHT could in principle carry information without changing the decoded coefficient stream. The discriminating question is whether LP2's unusual DHT symbol ordering is independently chosen or is simply the deterministic output of the JPEG encoder operating on the page's quantized coefficients.

## Source and reproducible method

The input is the canonical LP2 image set, **resources/liber-primus/17.jpg through 74.jpg** (58 images). The C reproducer reads the original quantized DCT coefficient arrays with libjpeg, then writes those same coefficient arrays back out with optimized Huffman coding enabled. It compares the original and regenerated raw DHT and DQT marker segments byte-for-byte. It separately checks the APP markers, ICC profile, image geometry, SOI/EOI count, and bytes following EOI.

The test was run with **libjpeg-turbo 2.1.5**. It does not decode/re-encode pixels, choose a new quantization table, or fit a hidden message.

Compile and run from the repository root:

~~~sh
cc -O2 sims/jpeg_huffman_reoptimization_audit.c -ljpeg -o /tmp/jpeg_huffman_reoptimization_audit
/tmp/jpeg_huffman_reoptimization_audit resources/liber-primus 17 74
~~~

## Results

All 58 images pass the same source-structure checks:

- All are 2400×3600, 8-bit JPEGs: **35 RGB** and **23 grayscale**.
- Every original DHT segment is regenerated **byte-for-byte** by coefficient-preserving optimized-Huffman output: **58/58**.
- Every original DQT segment is also regenerated exactly: **58/58**; the original DQT set is constant within each color mode.
- APP0 (JFIF) and APP2 (ICC profile) segments are byte-identical across all 58 images.
- Each image has exactly one SOI and one EOI, with EOI at the end of the file. There is one APP0 and one APP2 segment, no APP1, no COM segment, and no APP3–APP15 segment.

Reproducer summary:

~~~text
SUMMARY files=58 dht_reoptimization_exact=58 dqt_reoptimization_exact=58 identical_APP2=58 identical_APP0=58 same_DQT_within_color_mode=58 clean_single_JPEG_no_extra_APP=58 geometry_2400x3600_8bit=58 RGB=35 grayscale=23
~~~

## Interpretation

The DHT tables—including the non-ascending symbol order within some equal-code-length groups—are completely explained by the ordinary optimized-Huffman encoder applied to the original quantized coefficients. There is no residual per-page choice in the DHT ordering that supports an independent hidden message. The shared APP0/APP2 markers, stable per-mode DQT tables, and absence of additional APP/comment/trailing segments likewise provide no separate metadata channel.

This is a bounded exclusion of a **DHT-symbol-order / extra-APP-metadata / trailing-payload** hypothesis for the 58 LP2 JPEGs. It does **not** test or exclude data embedded in the quantized DCT coefficient values themselves, subtle pixel/color-channel modulation, or a different source-level interpretation of the visible artwork. The LP1 JPEG payloads therefore remain genuine evidence of container-level puzzle design, but they do not establish that LP2 repeats those particular mechanisms.

No unknown LP2 plaintext, authentic key, cipher mechanism, or final destination was recovered.

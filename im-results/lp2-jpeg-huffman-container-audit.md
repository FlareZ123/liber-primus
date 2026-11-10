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

## Limited quantized-AC coefficient LSB screen

A separate first-pass screen now examines the coefficient values themselves. The reproducer uses libjpeg's coefficient API and traverses each component in block-raster order, then each block's 63 AC coefficients in JPEG zigzag order. It emits the coefficient-parity stream for both the JSteg-style eligibility rule (absolute coefficient greater than one) and a broader nonzero-only sensitivity stream, both all-component and per-component. The Python analyzer checks both bit orders, both byte orders for a 32-bit length prefix, common four-byte-or-longer file signatures, and whether any JPEG-like prefix parses as a complete JPEG with SOF, SOS and EOI.

Compile and run from the repository root:

~~~sh
cc -O3 -Wall -Wextra sims/jpeg_ac_lsb_screen.c -ljpeg -o /tmp/jpeg_ac_lsb_screen
mkdir -p /tmp/lp2-jpeg-ac
for n in $(seq -w 17 74); do
  /tmp/jpeg_ac_lsb_screen resources/liber-primus/$n.jpg /tmp/lp2-jpeg-ac/$n > /tmp/lp2-jpeg-ac/$n.json
done
python3 sims/jpeg_ac_lsb_analyze.py /tmp/lp2-jpeg-ac
~~~

Across all **58 LP2 images**, the scan emitted **25,517,550** eligible absolute-value-greater-than-one AC coefficient bits and checked **372** all-component/per-component streams. No stream begins with a plausible 32-bit byte-length header in either bit or byte order; no common four-byte-or-longer payload signature appears; and no candidate parses as a valid embedded JPEG. The per-page odd-parity ratio for eligible coefficients averages **0.46680598** (population SD **0.00875679**, range **0.43884826–0.47802273**). This descriptive statistic is not itself evidence of steganography, and no matched external-image control was used.

The broader nonzero-only sensitivity stream produces **35** three-byte FFD8FF-like prefixes, but none has a valid following JPEG marker/segment sequence or a complete SOF/SOS/EOI structure. These are not recovered payloads. The screen is deliberately limited: component-major traversal may differ from a particular implementation's scan order, and it does not test F5, keyed/permuted coefficient selection, matrix-encoded embedding, or every DCT-domain method. It is a useful negative for a straightforward JSteg-style AC-LSB/length-header route, not a general exclusion of coefficient-domain steganography.

## Historically successful LP1 OutGuess-carrier encoder fingerprint

A source-native positive comparison, [`jpeg_carrier_quantization_audit.py`](../sims/jpeg_carrier_quantization_audit.py), now extracts the exact JPEG DQT table bytes, baseline SOF component count, and ICC APP2 payload from **all 75 original image files**. It is independent of the DHT reoptimization and AC-parity tests above. The source set's historical nine LP1 default-OutGuess carriers are **00, 01, 02, 03, 08, 10, 11, 12, 13** ([documented independent extraction](https://cicadanotebook.com/sessions/37.html); [2014 source walk-through](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29)). They are known positive carrier labels; DQT is a *container fingerprint*, never a payload detector.

The complete observed source partition, with SHA-256 **first 12 hex characters** over canonical, table-ID-ordered DQT bytes, is:

| Original images | DQT fingerprint | JPEG components | ICC APP2 | Source group |
| --- | --- | --- | --- | --- |
| LP1 00,01,02,13 | `2e058848a5a8` | 3 | absent | Four documented OutGuess carriers |
| LP1 03,08,10,11,12 | `21ca47152d84` | 3 | absent | Five documented OutGuess carriers |
| LP1 04,05,06,07,09,14,15,16 | `002e6e642964` | 3 | absent | Eight remaining LP1 images |
| LP2 17–74 (35 RGB pages) | `002e6e642964` | 3 | 2,576 bytes | All LP2 RGB pages |
| LP2 17–74 (23 grayscale pages) | `dd67edb0d106` | 1 | 2,576 bytes | All LP2 grayscale pages |

The **same ICC bytes** occur in all 58 LP2 pages (SHA-256 prefix `942e0f66212e`). The nine known LP1 OutGuess carriers occupy precisely the two DQT signatures absent from the eight LP1 noncarriers; **none of 58 LP2 images** uses those signatures. The 35 LP2 RGB pages exactly reuse the LP1 noncarrier DQT set. The historical carrier labels precede this comparison, but the quantizer choice is confounded with the JPEG creation pipeline: this is descriptive source separation, **not a likelihood ratio for hidden payloads**.

The comparison supports a practical original-source decision: the **historically observed LP1 OutGuess carrier encoder footprint** is not reproduced in LP2. Together with LP2's deterministic optimized DHT and uniform ICC structure, this lowers the priority of further default-key OutGuess/LP1-container repetition. It does **not** exclude coefficient-preserving embedding, key-controlled OutGuess, JPEG matrix embedding, encrypted payloads, or a pre-render source-level channel. All of those would need an independently indicated selector before more scans are useful.

## Original repeated tree-border coefficient identity (pp40–55)

The source repeats a complex two-sided tree ornament across LP2 physical pp40–55, so this is a clue-selected **known-cover comparison** for page-varying hidden JPEG data. The new [quantized-coefficient gate](../sims/jpeg_border_dct_exact.c) checks **all 64 original quantized DCT values per block**, including DC, within the full-height border region, before pixel rounding. This strengthens the existing dark-pixel tree-mask identity check.

- The entire first and last **520 source pixels** in all 3,600 rows decode to exactly the same RGB values on all **16** decorated images, even though five images are RGB JPEGs and eleven are grayscale.
- The **Y/luminance** component's first/last 65 eight-pixel-block columns are **identical in all 59,904,000 tested coefficient positions** (16 images, compared to the first).
- For the **five RGB originals** (physical pp40,49,53,54,55), the available Cb and Cr components within the first/last 32 blocks (outer 512 source pixels) are also identical: **0/4,608,000** differences for each component. Grayscale images have no chrominance components.
- A positive control changes one coefficient in the local reference and the detector reports **exactly one** difference.

This rules out **page-dependent coefficient editing within these decorative margins** if any such editing changes an audited quantized coefficient. It does **not** exclude an identical repeated global payload, image data outside the margins, or channels unaffected by these coefficients. The visible asymmetric solid/hollow five-dot design still admits a clue interpretation but does not specify a cipher operation or source key.

## Interpretation

The DHT tables—including the non-ascending symbol order within some equal-code-length groups—are completely explained by the ordinary optimized-Huffman encoder applied to the original quantized coefficients. There is no residual per-page choice in the DHT ordering that supports an independent hidden message. The shared APP0/APP2 markers, stable per-mode DQT tables, and absence of additional APP/comment/trailing segments likewise provide no separate metadata channel.

This is a bounded exclusion of a **DHT-symbol-order / extra-APP-metadata / trailing-payload** hypothesis and a limited negative for straightforward **JSteg-style AC-coefficient LSB** extraction across the 58 LP2 JPEGs. It does **not** exclude F5, keyed/permuted coefficient selection, matrix-encoded embedding, subtle pixel/color-channel modulation, or a different source-level interpretation of the visible artwork. The LP1 JPEG payloads therefore remain genuine evidence of container-level puzzle design, but they do not establish that LP2 repeats those particular mechanisms.

No unknown LP2 plaintext, authentic key, cipher mechanism, or final destination was recovered.

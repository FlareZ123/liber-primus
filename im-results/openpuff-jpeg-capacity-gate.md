# OpenPuff 4.00 on LP2 JPEGs: capacity gate (not an extraction result)

**Status:** Intermediate, source-constrained feasibility result. No OpenPuff extraction, payload, plaintext, or key has been recovered from the LP2 images.

## Historical procedure and fixed settings

The 2014 Cicada walkthrough for *Interconnected* specifies OpenPuff **4.0.0**, carrier interconnected.mp3 (MD5 7638414d35f416084b7ddcc94aa53685), password 33011103, and **50% MP3 bit selection**. It reports extraction of magicsquares.txt (745 bytes, CRC32 0x6A8C41E3). The password is said to come from sums of the left/right columns in Puzzle 3. This is a real historical OpenPuff use, but the 50% setting is explicitly MP3-specific and is not evidence for a 50% JPEG setting.

The original **OpenPuff v4.00** manual (7 July 2012) explicitly supports JPG/JPEG/JFIF carriers: 8-bit planes, 1–4 planes per pixel, baseline lossy DCT-JFIF with Huffman compression. It lists seven bit-selection levels, from 1/8 data (Minimum) through 1/2 data (Maximum); Medium is 1/5 data and 4/5 whitening. A contemporary v4.00 review says Medium is the default. The one-password historical note is consistent with using password A and disabling B/C; the manual says B/C are optional and must only be enabled if used at hide time. The exact original checkbox state is not shown in the short Cicada extraction note.

**Frozen JPEG candidate for a real run:** OpenPuff 4.00 (not 4.01), password A=33011103, B/C disabled, JPEG bit selection left at the documented default Medium (1/5). Do not import the 50% MP3 setting into the JPEG test.

## Original LP2 JPEG census

The supplied original LP2 set contains pages 17–74 (58 images). All are 2400×3600. The component census is 35 RGB and 23 grayscale. Existing repository audit im-results/lp2-jpeg-huffman-container-audit.md establishes that the source files are baseline DCT/Huffman JPEGs. The 4.00 manual's supported-JPEG description therefore gives no format-level reason to discard them as incompatible.

## Conditional capacity model

I counted quantized nonzero AC coefficients in each JPEG's luma (component 0) plane using libjpeg's coefficient API. This is a reproducible property of the actual JPEG inputs, not a steganographic detection.

To ask whether a **single** page could plausibly carry a historical-sized OpenPuff file, I then applied the generic extraction arithmetic in the independent LibrePuff reimplementation:

- **unwhitened_bits = floor(whitened_bits / 13) × 6**;
- default Medium selection divisor = 5;
- **selected_bits = floor((unwhitened_bits − 2984) / 5)**, rounded down to a multiple of 128.

The 2,984-bit overhead is a magic constant in LibrePuff's implementation (the author leaves it as a TODO); it is not a published OpenPuff JPEG specification. **The key assumption is that the JPEG parser emits one whitened bit per nonzero luma AC coefficient. LibrePuff does not implement the JPEG parser.** Therefore these numbers are a conditional model, not actual OpenPuff carrier capacities and not evidence of a hidden payload.

| Measure across 58 pages | Result |
|---|---:|
| Luma nonzero AC coefficients, min / median / max | 228,411 / 546,300.5 / 788,427 |
| Conditional Medium capacity, min / median / max | 2,560 / 6,224 / 9,008 bytes |
| Smallest conditional page | p74: 2,560 bytes |
| Largest conditional page | p65: 9,008 bytes |

The known 2014 extraction was 745 bytes; including OpenPuff's 10-byte embedded-file header and 16-byte filename gives 771 bytes. Under the stated model, a page needs 74,412 whitened bits, or **32.58% of the minimum luma nonzero-AC count**, to carry that record at Medium. All 58 pages exceed the conditional 771-byte capacity threshold.

**Decision:** test each JPEG individually first, in page order 17–74, before attempting a 58-carrier chain. A single page is not ruled out by this model, so a multi-carrier chain should not be the first experiment. This sizing comparison does not predict that LP2 contains a 745-byte file; a larger payload or a parser yielding fewer than 32.58% of these coefficient positions would change the result.

## Reproduction

The source code and per-page data are stored alongside this note:

- **sims/openpuff_jpeg_capacity_gate.c**
- **im-results/openpuff-jpeg-capacity-gate.csv**

Compile and run against the repository's LP2 images:

~~~sh
cc -O2 -Wall -Wextra sims/openpuff_jpeg_capacity_gate.c -ljpeg -o /tmp/openpuff_jpeg_capacity_gate
/tmp/openpuff_jpeg_capacity_gate resources/liber-primus
~~~

The program requires exactly pages 17–74 and checks the expected 35 RGB / 23 grayscale component census.

## What remains untested

The actual OpenPuff 4.00 binary was not available in this Linux runtime: Wine/Windows is absent and outbound network resolution is disabled here; the PacketStorm download endpoint also blocks automated retrieval. No extraction attempt was therefore made. The 2018 academic analysis states that OpenPuff itself is closed source (the cryptographic library is open source) and studies its PDF carrier, not its JPEG parser. LibrePuff declares JPEG as a carrier type but currently implements only the WAV parser; other carrier parsers are unimplemented.

The decisive next action is a checksum-verified OpenPuff **4.00** run in an isolated Windows/Wine environment using the frozen A-only/Medium candidate. Test each of the 58 pages individually and accept a result only if OpenPuff reports successful CRC validation and the extracted file is preserved with its hash. If all individual trials fail, test the complete physical sequence 17→74 as one ordered chain at the same fixed settings. Record binary hash, password fields, bit level, carrier order, report/CRC, output hash, and exact error. A failed CRC is not a successful negative if the binary version or settings differ from the source.

## Sources

1. 2014 Cicada extraction note, [Interconnected (mp3) w/ OpenPuff](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Interconnected_OpenPuff.md).
2. OpenPuff v4.00 manual (7 July 2012), [Yumpu archival copy](https://www.yumpu.com/en/document/view/37257849/openpuff-steganography-watermarking-embeddedswnet): JPG format p.17; bit-selection levels p.22; unhide procedure and CRC gate pp.27–29.
3. Contemporary v4.00 review describing Medium as the default: [dotTech, Best Free Windows Steganography Program](https://dottech.org/104672/windows-best-free-steganography-software-review/).
4. LibrePuff generic carrier extraction and bit selection: [carrier.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier.rs), [bit_selection.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/bit_selection.rs), [carrier_type.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier_type.rs), and [parser.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/parser.rs).
5. Sloan & Hernandez-Castro (2018), [Dismantling OpenPuff PDF steganography](https://doi.org/10.1016/j.diin.2018.03.003), which notes the closed-source application and focuses on the PDF carrier.


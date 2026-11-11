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

## Historical v4.00 binary recovered and run on Windows (11 November 2026)

The earlier blocker was the absence of a runnable OpenPuff 4.00 executable in the local Linux environment. That blocker is now **resolved for the tool**, although an actual JPEG extraction has not yet been attempted.

A public [ToolSuite commit from 15 February 2015](https://github.com/codejanus/ToolSuite/commit/1eaf6d006d31ba842f6cc6b16e9d82dbf904aaf5) preserved the original `OpenPuff.exe`, `libObfuscate.dll`, and an accompanying 2014 license identifying **OpenPuff v4.00**. The existing manual [Windows GUI workflow](../.github/workflows/openpuff-v400-ui-probe.yml) now downloads those three files from the fixed 2015 commit, verifies their exact original Git blob identities, records their SHA-256 hashes, and launches the application on `windows-latest`.

The [successful original-tool run 42937135303](https://github.com/FlareZ123/liber-primus/actions/runs/42937135303) established:

| Binary | Git blob SHA-1 | SHA-256 |
| --- | --- | --- |
| `OpenPuff.exe` | `466e03c792075313ce533a5dc7a789e8a41209f9` | `40c94218a5eecd215226ef8988cb23fe0c5cfbfd4bac8c63aa45be93fb8a1db9` |
| `libObfuscate.dll` | `f3b1c3315f8286346416fefd6141410f422f2454` | `d2065cbd748e2958baac5ebeb09817387df6df1d9923c3533aa41f549617e7b1` |
| `OpenPuff_license.txt` | `b0bab97d3c9906caada26fbb890a2a6fe028baa4` | `3833d08c693b46fd56230a3d6a160ef203779cddd587816701fb80e6ce15b5c1` |

The Windows PE file version is **4,0,0,0**, and the live UI title is **`OpenPuff v4.00 - Data Unhiding`**. The [saved Actions artifact](https://github.com/FlareZ123/liber-primus/actions/runs/42937135303) contains the machine-readable GUI control inventory: password fields **A/B/C** with 8–32-character limits, optional **Enable (B)** / **(C)** checkboxes, order-sensitive carrier list with **Add Carriers**, a bit-selection tree, and **Unhide!**. These are actual native controls, not a presumed 4.01 interface.

**Exact next experiment:** use this now-functional 4.00 GUI to select first one original LP2 JPEG in physical order, the historically documented password **A=33011103** with B/C disabled, and the JPEG default Medium bit selection (1/5). Capture its own extraction/CRC report and any payload, preserving original JPEG and output hashes. If a single carrier fails, repeat for remaining 57 single pages, then test the complete ordered 17–74 carrier chain under the same frozen settings. A failed GUI operation, missing carrier support or wrong options must remain a *test blocker*, not a purported negative cryptanalytic result. The original OpenPuff 2014 operation was on MP3; no independent LP2 clue mandates reuse of the tool or this password.

The first Windows workflow attempt [42936020518](https://github.com/FlareZ123/liber-primus/actions/runs/42936020518) was blocked by anti-bot / incorrect downloadable bytes at PacketStorm and SoftRadar. The second [42937018587](https://github.com/FlareZ123/liber-primus/actions/runs/42937018587) failed due to a corrected PowerShell variable-parsing issue. The **third run** above completed all hash, version, launch, and GUI tests. No original LP2 key, plaintext, payload, or destination was recovered by these tool-access steps.

## Sources

1. 2014 Cicada extraction note, [Interconnected (mp3) w/ OpenPuff](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Interconnected_OpenPuff.md).
2. OpenPuff v4.00 manual (7 July 2012), [Yumpu archival copy](https://www.yumpu.com/en/document/view/37257849/openpuff-steganography-watermarking-embeddedswnet): JPG format p.17; bit-selection levels p.22; unhide procedure and CRC gate pp.27–29.
3. Contemporary v4.00 review describing Medium as the default: [dotTech, Best Free Windows Steganography Program](https://dottech.org/104672/windows-best-free-steganography-software-review/).
4. LibrePuff generic carrier extraction and bit selection: [carrier.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier.rs), [bit_selection.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/bit_selection.rs), [carrier_type.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier_type.rs), and [parser.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/parser.rs).
5. Sloan & Hernandez-Castro (2018), [Dismantling OpenPuff PDF steganography](https://doi.org/10.1016/j.diin.2018.03.003), which notes the closed-source application and focuses on the PDF carrier.


# OpenPuff 4.00 on LP2 JPEGs: capacity gate (not an extraction result)

**Status (14 November 2026):** Intermediate, source-constrained feasibility and native-automation result. The exact historical OpenPuff 4.00 executable and MP3 carrier were retrieved and verified in new Windows jobs, but the MP3 positive control has not completed extraction. No OpenPuff payload, plaintext, or key has been recovered from the LP2 images, and **no LP2 JPEG has been tested with an authenticated password**.

## Historical procedure and unresolved password discrepancy

Two published reconstructions of the same 2014 *Interconnectedness* OpenPuff extraction disagree on the **password bytes**, a material problem for any negative LP2 test. [iBotPeaches's extraction note](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Interconnected_OpenPuff.md) specifies OpenPuff **4.0.0**, carrier interconnected.mp3 (MD5 7638414d35f416084b7ddcc94aa53685), password **`33011103`**, and **50% MP3 bit selection**, reporting magicsquares.txt (745 bytes, CRC32 `6A8C41E3`). The [detailed 2014 fifth-onion walkthrough](https://github.com/neuroretransmit/cicada/blob/master/2014/007-fifth-onion/README.md) instead specifies **`33011033`**, with B/C disabled and 50% MP3 bits. Its recovered portrait's two numeral columns sum to **1033 and 3301** (left: 181+7+15+16+456+351+7; right: 966+1071+626+204+434). Thus `33011033` directly concatenates the actual clue sums, whereas `33011103` has no presently identified clue-derived explanation. The independent wording of the reports does not establish which password was really typed: **the original v4.00 MP3 extraction should authenticate the alternative with CRC32 `6A8C41E3` before using a single historically presumed password as a negative JPEG test**. The 50% setting belongs to MP3 and does not determine the JPEG bit level.

The original **OpenPuff v4.00** manual (7 July 2012) explicitly supports JPG/JPEG/JFIF carriers: 8-bit planes, 1–4 planes per pixel, baseline lossy DCT-JFIF with Huffman compression. It lists seven bit-selection levels, from 1/8 data (Minimum) through 1/2 data (Maximum); Medium is 1/5 data and 4/5 whitening. A contemporary v4.00 review says Medium is the default. The one-password historical note is consistent with using password A and disabling B/C; the manual says B/C are optional and must only be enabled if used at hide time. The exact original checkbox state is not shown in the short Cicada extraction note.

**Source-limited JPEG candidate family (password conflict pending the MP3 positive control):** OpenPuff 4.00 (not 4.01), password A **`33011033`** (directly formed by the 3301/1033 clue-column sums) and separately **`33011103`** (iBotPeaches's reported extraction), B/C disabled, JPEG bit selection explicitly Medium (1/5). These are **two specific published historical readings**, with no additional password sweep. Confirm one on the original MP3 if possible. Do not import the 50% MP3 setting into the JPEG test.

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

**Decision:** test each JPEG individually, prioritizing original archive scans **50–56** (physical p33–39), where the repeated source cuneiform specifies candidate values 1033/3301, then the remaining originals **17–49 and 57–74**. No 58-carrier chain is indicated yet. A single page is not ruled out by this model, so a multi-carrier chain should not be the first experiment. This sizing comparison does not predict that LP2 contains a 745-byte file; a larger payload or a parser yielding fewer than 32.58% of these coefficient positions would change the result.

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

A prior Windows job established that the authentic GUI launches, and a source-pinned OpenPuff v4.00 executable plus its DLL are available on that runner. **An authorized workflow dispatch was subsequently accepted on 12 November 2026, but both positive-control jobs failed in the mocked-dialog preflight before the historical binary or carrier was retrieved. No authentic carrier extraction has been executed.** The preflight error is repaired in the working workflow; a new authorized dispatch is still required.

- Original archived source: 15 February 2015 commit [codejanus/ToolSuite@1eaf6d006d31ba842f6cc6b16e9d82dbf904aaf5](https://github.com/codejanus/ToolSuite/commit/1eaf6d006d31ba842f6cc6b16e9d82dbf904aaf5), containing `OpenPuff.exe`, `libObfuscate.dll`, and a 2014 license explicitly identifying v4.00.
- Binary identities: `OpenPuff.exe` Git blob SHA-1 `466e03c792075313ce533a5dc7a789e8a41209f9`, SHA-256 `40c94218a5eecd215226ef8988cb23fe0c5cfbfd4bac8c63aa45be93fb8a1db9`; `libObfuscate.dll` Git blob SHA-1 `f3b1c3315f8286346416fefd6141410f422f2454`, SHA-256 `d2065cbd748e2958baac5ebeb09817387df6df1d9923c3533aa41f549617e7b1`; license blob SHA-1 `b0bab97d3c9906caada26fbb890a2a6fe028baa4`, SHA-256 `3833d08c693b46fd56230a3d6a160ef203779cddd587816701fb80e6ce15b5c1`.
- Successful original-tool run [42937135303](https://github.com/FlareZ123/liber-primus/actions/runs/42937135303) verified the three original Git blobs, PE file version **4.0.0.0**, GUI launch, and native Unhide controls. A second read-only GUI run [42938923914](https://github.com/FlareZ123/liber-primus/actions/runs/42938923914) recorded optional B/C checkboxes initially checked and the exact native bit-selection tree. This is proof the original GUI runs, not proof of extraction.
- The GUI exposes password A/B/C, B/C enable checkboxes (1042/1043), order-sensitive carrier list (1045), Add Carriers (1046), bit-selection TreeView (1049), and Unhide (1051). For JPEG it offers Medium 1/5; for MP3 it offers Maximum 1/2. The prior read-only snapshot had all bit-tree leaves unchecked, so the new extraction script explicitly selects and verifies the required leaf instead of relying on defaults.

### Archived positive-control carrier and password discrepancy

A second public archive contains a binary carrier at [iBotPeaches/cicada_3301/tool/storage/interconnected.mp3](https://github.com/iBotPeaches/cicada_3301/tree/master/tool/storage), pinned to commit `a0a616d85717af59f8b806875b43d51e06e1e874`. Its tree records Git blob SHA-1 `09fe068192b76a3697c47ec1d604b527703db798` and size **6,651,873 bytes**. The independent extraction note reports MD5 `7638414d35f416084b7ddcc94aa53685` and a 745-byte `magicsquares.txt` with CRC32 `6A8C41E3`; the workflow verifies the pinned blob, size, and reported MD5 before running OpenPuff.

Two archival walkthroughs disagree on password A:

- [neuroretransmit/cicada fifth-onion README](https://github.com/neuroretransmit/cicada/blob/main/2014/007-fifth-onion/README.md) specifies OpenPuff **v4.00**, password **`33011033`**, B/C disabled, and MP3 bit selection **50% (Maximum)**.
- [iBotPeaches extraction note](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Interconnected_OpenPuff.md) reports password **`33011103`**, 50% MP3 bit selection, and the same 745-byte / CRC32 `6A8C41E3` output.

The two spellings are not to be reconciled by guesswork. The source-derived p57 red word **PARABLE** has GP-prime weights summing to **449**, matching the historical Parable reduction modulus; the historical square constants **3301** and **1033** make `33011033` the more direct concatenation. This is a clue-based reason to test it first, not evidence that it actually extracts. Both published passwords must be tested independently against the exact MP3 and accepted only if the recovered bytes match the known CRC32 and size.

### Reproducible extraction workflow (native extraction still pending)

- The [original OpenPuff driver](../sims/openpuff_v400_extract.py) sets password A, disables B/C, adds a single original carrier, waits until its native parsing dialog closes, chooses the requested TreeView bit level and records original output names, byte lengths, SHA-256, standard CRC32 and **native OpenPuff CRC32**. It retains original Windows screenshots/controls and never treats a stable GUI dialog alone as successful extraction.
- The manual-only [positive-control workflow](../.github/workflows/openpuff-v400-ui-probe.yml) checks both historically reported passwords against the source-pinned 2014 MP3. Only a **745-byte extracted file with OpenPuff CRC32 `6A8C41E3`** authenticates the password. The conditional `lp2-jpegs` mode replays this same control in its Windows job before testing the full 58 original images at JPEG Medium 1/5, with scans 50–56 first. No LP2 image may be classified from mere capacity estimates or GUI startup.
- **Native execution evidence (14 November 2026).** Windows [runs 43579310872](https://github.com/FlareZ123/liber-primus/actions/runs/43579310872) and [43579598403](https://github.com/FlareZ123/liber-primus/actions/runs/43579598403) verified the actual archived OpenPuff 4.00 executable, DLL and original MP3, passed the offline capture tests, and opened the program with both password spellings. Neither attempted a completed extraction: saved GUI screenshots/control inventories in original [33011033 artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43579598403/artifacts/14107603243) and [33011103 artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43579598403/artifacts/14108260318) show the **“Adding Carriers / Now adding... 0%”** modal still covering the bit-selection tree after the original two-second delay. The original `0 bytes` selection was likewise premature. Agent17 repaired the GUI race by retaining the asynchronous startup delay then waiting up to 300 seconds for this exact modal to disappear ([692f637](https://github.com/FlareZ123/liber-primus/commit/692f63767a8afdc89f9ea87992ce521b0975e23c), [cf259ea](https://github.com/FlareZ123/liber-primus/commit/cf259ea5dbfac0c52a9b541a3316baec4da2daaa)). Follow-up dispatch was blocked by the tool safety check. Thus **no password was actually evaluated against an extracted MP3 payload**, and no LP2 carrier has been tested.

**Critical checksum correction (14 November 2026).** The archived `resources/cicada2014-openpuff-magic-squares.txt` is exactly **745 bytes**. The [reverse-engineered native OpenPuff checksum implementation](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/crc32.rs) uses MSB-first feedback polynomial `0x02608EDB`, an initial state `0xFFFFFFFF`, and **no final XOR**. The source-preserved file evaluates to **native OpenPuff `6A8C41E3`**, exactly its historical reported checksum, while ordinary ZIP/zlib CRC32 gives **`5E547914`**. The previous driver mistakenly compared the historical native checksum against zlib, guaranteeing rejection even for an authentic file. [Commit 2847f38](https://github.com/FlareZ123/liber-primus/commit/2847f38403989f3eb9223e57a5ae0e97e99320fa) fixes `file_facts` and positive-control classification to use **native OpenPuff CRC32** for the historical target while recording standard CRC32 separately; [commit b9e4a64](https://github.com/FlareZ123/liber-primus/commit/b9e4a64f87bc2f4f027b7c82747e635b76e91554) installs a frozen 745-byte original-file CRC fixture in the offline SFT. No post-fix Windows extraction is claimed.

**Next decisive experiment:** dispatch the repaired manual `positive-control` workflow through an allowed owner-side execution path. After the MP3 parsing modal closes, require the **745-byte native OpenPuff checksum `6A8C41E3`** to pass, then permit the same password in `lp2-jpegs`. A tool safety block remains **BLOCKED / NOT EXECUTED**, never an MP3 negative. If the next run fails in the TreeView, use the saved native control inventories to identify the exact hit target. No LP2 payload, unknown-page plaintext, key or destination has been recovered.

## Sources

1. [2014 OpenPuff extraction note](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Interconnected_OpenPuff.md), reporting password `33011103`.
2. [2014 fifth-onion walkthrough and decoded 1033/3301 columns](https://github.com/neuroretransmit/cicada/blob/master/2014/007-fifth-onion/README.md), reporting password `33011033`.
3. OpenPuff v4.00 manual (7 July 2012), [Yumpu archival copy](https://www.yumpu.com/en/document/view/37257849/openpuff-steganography-watermarking-embeddedswnet): JPG format p.17; bit-selection levels p.22; unhide procedure and CRC gate pp.27–29.
4. Contemporary v4.00 review describing Medium as the default: [dotTech, Best Free Windows Steganography Program](https://dottech.org/104672/windows-best-free-steganography-software-review/).
5. LibrePuff generic carrier extraction and bit selection: [carrier.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier.rs), [bit_selection.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/bit_selection.rs), [carrier_type.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier_type.rs), and [parser.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/parser.rs).
6. Sloan & Hernandez-Castro (2018), [Dismantling OpenPuff PDF steganography](https://doi.org/10.1016/j.diin.2018.03.003), which notes the closed-source application and focuses on the PDF carrier.


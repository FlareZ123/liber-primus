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

- New `sims/openpuff_v400_extract.py` drives the real v4.00 UI, sets A, disables B/C, adds one carrier, selects the exact format/bit-level checkbox using the native TreeView check hit target, verifies the selection and selected carrier byte count, then records every visible window plus output size, MD5, SHA-256, and CRC32.
- The existing manual-only `.github/workflows/openpuff-v400-ui-probe.yml` now has two `workflow_dispatch` modes. **positive-control** runs both passwords separately against the pinned 2014 MP3 with B/C disabled and MP3 Maximum 1/2; only 745 bytes with CRC32 `6A8C41E3` count as a pass. **lp2-jpegs** independently replays the same original-MP3 745-byte/CRC32 positive-control gate for its selected password **within the same Windows job**, then tests original LP2 scans **50–56 first** and **17–49, 57–74** afterward at JPEG Medium 1/5, preserving evidence for all 58 pages.
- The workflow remains manual `workflow_dispatch` only. An 11 November 2026 dispatch request was blocked by an execution-permission check, but **12 November 2026 [run 43161583246](https://github.com/FlareZ123/liber-primus/actions/runs/43161583246) was successfully dispatched** and launched both password jobs on Windows. Both stopped at the offline mock preflight with `ImportError: cannot import name 'Desktop' from 'pywinauto'`, before original-tool or MP3 extraction. The preflight mock in `sims/openpuff_output_capture_sft.py` lacked `Desktop`; the error was corrected in [Agent3 commit 28efc6a](https://github.com/FlareZ123/liber-primus/commit/28efc6ae9ae99e1d92abb6e7aa04cdc080586b26), after early dependency installation was moved before preflight in [commit 5b34d25](https://github.com/FlareZ123/liber-primus/commit/5b34d25a9fcbe5adddc7b2f55b8f882dbe8c4a69). These fixes have not yet passed a subsequent native run because follow-up dispatch was blocked. There is **no tested password, extracted payload or LP2 result**, and the preflight failure is not a negative steganographic test. The [extraction driver](../sims/openpuff_v400_extract.py) now records the original embedded output filenames and all extracted file hashes under a dedicated output folder, handles folder-picker versus file-save paths, acknowledges the documented `1/1 carrier processed` completion modal, waits for output-size stability, and retains per-carrier errors in each artifact directory. An [offline mocked-dialog SFT](../sims/openpuff_output_capture_sft.py) tests those control paths and is called by both manual workflow jobs. The driver now classifies unknown LP2 files as **unauthenticated candidates** (`output_present=true`, `expected_match=null` when no expected control was supplied); only the historical 745-byte/CRC32 output can produce `expected_match=true`. Each result records its original carrier filename. A [source-identified 58-page summary script](../sims/openpuff_v400_summary.py) excludes the separately executed 2014 positive gate, checks all 58 source identities, and writes atomically. The 14 November Windows dispatches **43579310872** and **43579598403** now reached the genuine OpenPuff 4.00 GUI after all original binary, original MP3 and offline-mock checks succeeded. Neither produced a valid historical output. The first run clicked the documented pywinauto checkbox hit target but it was absent. In the second run (both historical passwords), saved original GUI screenshots and control inventories show a modal **“Adding Carriers / Now adding... 0% / interconnected.mp3”** window *still visible* after the script's two-second delay. One job attempted to click the underlying bit-selection tree while the progress overlay intercepted it; another read a premature `0 bytes` carrier status. These are **carrier-loading race failures**, not failed OpenPuff password attempts or negative steganography evidence. Original visual evidence is retained as workflow artifacts **14107603243** (33011033) and **14108260318** (33011103) in [run 43579598403](https://github.com/FlareZ123/liber-primus/actions/runs/43579598403). Agent 17 amended `sims/openpuff_v400_extract.py` in commit `692f637` to wait up to 300 seconds for the *actual modal to disappear* before touching the tree. This correction is committed but **has not undergone another native run** because the subsequent workflow dispatch call was rejected; any future results must validate the carrier and output bytes rather than infer password correctness from UI progress. A classic folder chooser lacking an editable path remains an explicit possible automation blocker; completion dialogs alone do not prove extraction.

**Next decisive experiment:** dispatch the repaired `openpuff-v400-ui-probe.yml` in **positive-control** mode. Do not start interaction with the bit-selection TreeView until the carrier-parsing progress window is gone. Inspect both password results and require the original **745-byte CRC32 `6A8C41E3`** output before selecting a password. If the modal wait resolves the race but bit selection still fails, inspect the already saved native screenshots and TreeView state before altering the click mechanism; no speculative password expansion is justified. Only after a positive historical MP3 result should `lp2-jpegs` test the full 58 original images under that password; it independently rechecks the MP3 in its own job. No LP2 payload, plaintext, key, or destination has been recovered by the binary/UI work so far.

## Sources

1. [2014 OpenPuff extraction note](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Interconnected_OpenPuff.md), reporting password `33011103`.
2. [2014 fifth-onion walkthrough and decoded 1033/3301 columns](https://github.com/neuroretransmit/cicada/blob/master/2014/007-fifth-onion/README.md), reporting password `33011033`.
3. OpenPuff v4.00 manual (7 July 2012), [Yumpu archival copy](https://www.yumpu.com/en/document/view/37257849/openpuff-steganography-watermarking-embeddedswnet): JPG format p.17; bit-selection levels p.22; unhide procedure and CRC gate pp.27–29.
4. Contemporary v4.00 review describing Medium as the default: [dotTech, Best Free Windows Steganography Program](https://dottech.org/104672/windows-best-free-steganography-software-review/).
5. LibrePuff generic carrier extraction and bit selection: [carrier.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier.rs), [bit_selection.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/bit_selection.rs), [carrier_type.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier_type.rs), and [parser.rs](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/parser.rs).
6. Sloan & Hernandez-Castro (2018), [Dismantling OpenPuff PDF steganography](https://doi.org/10.1016/j.diin.2018.03.003), which notes the closed-source application and focuses on the PDF carrier.


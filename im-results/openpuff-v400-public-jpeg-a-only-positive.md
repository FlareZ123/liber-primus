# Published OpenPuff JPEG: original-v4.00 A-only native Unhide positive

**Evidence class: independent, genuine JPEG steganography positive control. Agent21, 15 November 2026.** This test recovers a publisher-announced file from a third-party original JPEG under OpenPuff v4.00. It provides evidence that the actual JPEG decoding module and A-only Unhide GUI work on the same Windows runner used for LP2. **No LP2 ciphertext, unknown plaintext, puzzle key or destination was recovered by this positive.**

## Independent authentic source, byte identity and frozen inputs

[Bauser-Enterprises' public steganography demonstration](https://www.bauser-enterprises.com/html/steganographie.php), published years after the original 2014 puzzle, explicitly tells readers to save its *left screenshot* named `openpuff.jpg`, run OpenPuff **Unhide**, disable optional B/C passwords, enter **A=`12345678`**, select `Jpeg (Image)` **`1/2 (50%) - Maximum`**, and retrieve `hidden.txt` containing the literal German text `Dies ist eine versteckte Nachricht!`. The site also advertises a separate decoy `alibi.txt` under A=`123456789`. All values are published upstream rather than fitted to an output.

The unchanged 33,704-byte HTML page had SHA-256 `a32a73e82555a01cf3d17885e0984f9592e35bf127d196d1d38121df25df31c9`. Parsing its actual `img` source yielded exactly one `openpuff.jpg` carrier URL:

`https://www.bauser-enterprises.com/bilder/openpuff.jpg`

The downloaded unmodified JPEG was **80,837 bytes**, SHA-256 `f76b088fddcb106591ece2c2d92c313be4947fac8a11786cf6ab451ec4f2325a`, initial bytes `ffd8ffe000104a464946000101010060`. The [source-linked byte-preserving retriever](../sims/openpuff_public_jpeg_positive_source.py) saves both original HTML and carrier and prints all source links, hashes and settings. It never re-encodes or modifies the JPEG.

## Actual original Windows v4.00 execution

The [passing original-v4.00 Windows workflow, run 43682094194](https://github.com/FlareZ123/liber-primus/actions/runs/43682094194), uses pinned OpenPuff.exe Git blob `466e03c792075313ce533a5dc7a789e8a41209f9`, native PE file version 4.0.0.0, the pinned matching libObfuscate DLL, x86 Python and the same [source-native Unhide driver](../sims/openpuff_v400_extract.py) used for original LP2 JPEGs. The site-specified inputs were passed without guessing, with B/C disabled.

The original GUI accepted the JPG (initial 48-byte selected capacity), applied the verified JPEG Maximum option (**144-byte capacity**), executed Unhide, displayed **`Task completed - Info: 1/1 carrier processed`**, and saved **`hidden.txt`**. The driver recorded `attempted:true`, `bit_selection_verified:true`, `save_dialog_seen:true`, `output_present:true`, `native_probe_outcome:output-file` and zero error dialogs. The recovered original secret was **exactly 35 bytes**, with content

`Dies ist eine versteckte Nachricht!`

and SHA-256 `c630572bb3b56b0a79ff4f6631b501d04c5fe5c1e0fd0c0853d9db3c57d11593`. The output equals the independently predeclared text byte-for-byte; the test allows no data-dependent choice of password, bit level, carrier, mode or plaintext.

The workflow's [evidence artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43682094194) contains original carrier HTML/JPEG bytes, native control screenshots and result JSON, exact extracted text and hashes. Its [fully repeatable native 32-bit Windows implementation](../.github/workflows/openpuff-v400-public-jpeg-positive.yml) uploads the data even if future runs fail. This is a real third-party stego file, rather than an unexercised synthetic encoder or a numerical capacity estimate.

## Interpretation and next decision

This removes the plausible **blanket native JPEG decoder incompatibility** explanation for the 58 original LP2 images' earlier individual `Task stopped: corrupted stream` responses. That earlier batch used **Medium 1/5** with a historical 2014-derived password A=`33011033`, whereas this independent positive used **Maximum 1/2** with its own publisher-specified A=`12345678`. Thus the positive does **not** prove the LP2 password, exact bit-level or presence of payloads.

OpenPuff's multicarrier path remains a separate concern. The two-synthetic-JPEG native Hide→Unhide plant developed independently for [Director #1049](https://github.com/FlareZ123/liber-primus/issues/1049) has not yet passed due Hide-panel password validation; it cannot be treated as success. A fixed original **58-image ascending 17.jpg–74.jpg chain** has now been dispatched ([run 43682354083](https://github.com/FlareZ123/liber-primus/actions/runs/43682354083)) using the already source-supported 2014 A value and OpenPuff JPEG Medium. Authentic recovered bytes from that source chain would be a genuine new LP2 lead; a native corrupt-stream result can retire only the precise fixed candidate, and an unsupported or partially verified chain is inconclusive. Avoid guessed passwords, levels or permutations absent a new original clue.

**Decision:** native JPEG extraction is **proved workable** on the exact runner and pinned OpenPuff v4.00. Multi-JPEG calibration, authentic LP2 key material, and plaintext remain outstanding. A third-party demonstration from the 2020s is not a creator-authenticated 2014 clue.

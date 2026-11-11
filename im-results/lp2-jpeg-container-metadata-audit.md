# Original Liber Primus JPEG marker and container audit

**Classification:** Complete source-envelope inventory of all 58 original LP2 JPEG scans, with all 17 LP1 scans as positive/control comparisons. **No unknown LP2 plaintext, historical key, executable cipher instruction or destination recovered.** This report addresses [Director Issue #130](https://github.com/FlareZ123/liber-primus/issues/130). The bounded conclusion concerns JPEG *containers and encoding metadata*, not DCT-embedded data or encrypted unframed steganography.

## Original source, method and independent controls

Input: the maintainer-provided original 75-JPEG Liber Primus archive and the mirrored files `resources/liber-primus/00.jpg` through `74.jpg`. LP2 physical page `p` corresponds to archive scan `p+17`; scans 00–16 belong to LP1. All 58 LP2 physical pages p0–57 were audited, including the rune-free table p50 and solved pp56–57. The stand-alone Python standard-library reproducer [`sims/lp2_jpeg_container_metadata_sft.py`](../sims/lp2_jpeg_container_metadata_sft.py) reads the original JPEG marker envelope and validates segment lengths, byte-stuffed entropy boundaries, the first proper EOI and any trailing bytes. It hashes full APP/DQT/DHT segment payloads and extracts the baseline frame dimensions/component count. It neither re-encodes the images nor extracts entropy coefficients.

**Original LP2 findings:**

| Test | Complete original result |
| --- | --- |
| Geometry and codec | All 58 scans exactly 2400×3600; 8-bit baseline SOF0; one SOS entropy scan each; no progressive SOF2, restart interval markers or restart markers |
| Component classes | 35 three-component color JPEGs; 23 one-component grayscale JPEGs. Grayscale physical pages are 16–21, 24–25, 28–31, 41–48 and 50–52 |
| Metadata | Every LP2 scan contains exactly one identical APP0 JFIF payload (14 bytes) and one identical APP2 ICC_PROFILE payload (2590 bytes including ICC segment header; 2576-byte actual ICC profile). No APP1/EXIF, APP13, comment COM or other application segments |
| Quantization | Exactly two DQT payload fingerprints, one shared by all 35 color scans and the other by all 23 grayscale scans; no within-class change |
| Huffman tables | All 58 combined DHT fingerprints differ, as expected under content-specific optimized Huffman encoding. Color scans have four DHT segments, grayscale scans two. This variation alone has no established relation to an authored key |
| Trailer | All 58 EOI markers terminate at the last file byte, with **zero** appended bytes or concatenated secondary JPEG streams |
| Solved controls | Original solved p56 and p57 share the ordinary color-class structure, identical APP/quantization metadata and no trailing bytes; there is no solved/unsolved metadata boundary |

The source pages' color grouping tracks changes in document illustration/red-ink usage and contiguous export runs. Some three-component pages contain no conspicuous red ink, so the binary component-class pattern is an export/layout characteristic, **not** an independently verified cryptographic bitstream. No visible instruction selects a numeric encoding of its color/grayscale runs.

## Independent LP1 and planted detection controls

The same parser detects two real structural appendages among the 17 LP1 scans and nothing appended in the other 15:

- Original archive **05.jpg** has **336,713 bytes after its first EOI**. Reversing that tail yields a fully parsable JPEG followed by 360 additional bytes. The marker parser does not claim the purpose of this historical appendage.
- Original archive **10.jpg** contains **four forward-concatenated JPEGs** occupying exactly 754,662, 712,733, 703,428 and 2,070,134 bytes (4,240,957 total), with no residual bytes.
- LP1 has no APP2 ICC_PROFILE segments, unlike the 58 LP2 scans. This is a source-generation difference between releases and not an LP2 decryption instruction.
- Two planted controls inserted respectively seven post-EOI bytes and one APP13 `CONTROL` marker into an unchanged LP2 scan; the parser detected both exactly.

Reproduction on the provided 75-image ZIP completed with `SFT PASS`, all 58 LP2 checks, the original LP1 positive controls and both independent plants.

## Decision and residual uncertainty

**No page-specific LP2 JPEG-container anomaly survives the native LP2 class and solved-page controls.** Retire a generic APP/EXIF/COM/ICC-marker hunt, a trailing-file hunt and a fixed-quantization-table anomaly claim on these original scans. Individual optimized DHTs, RGB/grayscale batch boundaries and compressed byte lengths are insufficient to select a key or a message. New work on Huffman ordering or another coding channel requires an independently visible clue plus a predeclared different-page prediction. The existing original DCT/coefficient and application-specific extraction investigations remain separate and are not excluded by this result. No ciphertext decoding was attempted here.

The actionable lesson for a future original-image attack is to anchor its exact reversible extraction to a source-selected carrier feature. If no such feature exists, the container avenue currently contributes no cryptographic state.

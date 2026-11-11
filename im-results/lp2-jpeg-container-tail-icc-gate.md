# Original JPEG container audit: no per-page trailer or ICC key in LP2

**Decision:** The 58 original second-release page JPEGs (archive `17.jpg`–`74.jpg`, including the solved controls) expose no appended data after their last JPEG EOI marker. All 58 embed the **same** 2,576-byte ICC profile. These two container-level fields cannot supply the missing page-specific LP2 cipher key. This is a bounded source negative and **does not recover plaintext, an author-selected key or a decoding operation**.

## Why check this channel?

Earlier Cicada stages used files and steganography, so literal material appended to an image or a per-page metadata value would provide a direct, human-observable extraction without a guessed cryptographic key. The entire original archive is available, enabling a finite test without post-selecting any rune text.

## Original-source measurements

- All **75** original JPEGs have dimensions **2400×3600**. Archive scans `00.jpg`–`16.jpg` are the 17 first-release pages; `17.jpg`–`74.jpg` are the 58 second-release pages (physical LP2 p0–p57).
- All 17 first-release images are RGB and have no embedded ICC profile. One has nonempty bytes after the final JPEG EOI marker.
- Of the 58 second-release JPEGs, **35** are RGB and **23** are grayscale. Every one carries the identical 2,576-byte ICC profile, SHA-256 `942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0`. Every one has **zero trailing bytes after the last `FF D9`**.
- The sole archive JPEG with trailing data is **LP1 `05.jpg`**: 72,700 bytes after `FF D9`, **exactly** the reverse-byte-order copy of its *own* first 72,700 bytes. Reversing the tail creates a truncated prefix of the same image, with identical JPEG header. The byte identity leaves no independent trailer material to interpret as a key. Do not mistake an apparent reversed embedded JPEG for a new authentic image or message.

**Controls:** `74.jpg` (solved LP2 p57) is pinned by source SHA-256 `1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b`; all 75 filenames, formats, dimensions and exact group counts are asserted. The test ran on the provided complete original 75-image archive and passed.

**Standalone reproducer:** [`sims/lp2_jpeg_container_sft.py`](../sims/lp2_jpeg_container_sft.py), using Python and Pillow on the original archive images in `resources/liber-primus/`. It prints group counts and fails on any unexpected LP2 trailer, metadata hash or source image type.

## Scope and next decision

This test constrains only literal post-EOI data and embedded ICC profiles. It **cannot** reject payloads encoded inside entropy-coded JPEG DCT coefficients, individual image pixels, variable marker payloads, Photoshop source layers lost on export, or external files selected by original clues. The shared ICC profile is a normal file-production property and cannot justify reconstructing an arbitrary per-page key. Reopen this channel only if a source-original alternate copy or an explicit metadata-reading instruction appears. Source-artifact and cipher investigations should continue independently of this narrow negative.

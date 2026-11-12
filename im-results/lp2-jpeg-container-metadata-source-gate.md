# Original LP2 JPEG container as a possible key carrier

**Decision (12 November 2026):** The complete original LP2 JPEG *container metadata* does not carry a page-varying key or clear standalone payload. All 58 physical pages (archive `17.jpg`–`74.jpg`) end at their first valid JPEG EOI; there are zero appended bytes. Each contains one JFIF APP0 and one ICC APP2 marker and no other APPn or COM marker. All 58 ICC APP2 payloads are byte-identical (SHA-256 `62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f`). Their metadata therefore supplies no page-specific secret, command, password, or endpoint.

The source JPEG frames have exactly two encoding profiles, aligned with **three-component colour** and **one-component grayscale** image formats. The 23 grayscale physical LP2 pages are **16–21, 24–25, 28–31, 41–48, 50–52**. The other 35 pages use colour. Two DQT profiles partition the same 23/35 groups, while optimized Huffman DHT payloads vary with image content. Every grayscale page also lacks source-annotated red rune spans and red punctuation; 11 colour pages likewise have no red marks, consistent with colour artwork/layout. No novel binary code or selector is warranted by this colour split.

## What the result excludes

- Raw payloads placed *after* JPEG EOI, including a second concatenated JPEG or appended ZIP/text, in original LP2 pages.
- Standalone instructions, keys, hashes, or addresses carried in ordinary JPEG APP/COM metadata of these originals.
- Using page-varying ICC bytes as a 58-page secret-key stream.

**What it does not exclude:** Changes within compressed JPEG image coefficients, high-entropy payloads embedded by OutGuess/OpenPuff, visual glyph markings, a key in rendered artwork, or source-historical data external to these 58 files. Existing earlier-LP1 `05.jpg`/`10.jpg` suffix anomalies are outside this LP2 conclusion. This is a targeted original-artifact exclusion, **not a decryption**, and supplies no unknown plaintext.

## Exact reproduction

Run `node sims/lp2_jpeg_envelope_sft.cjs` from the repository with its pinned `resources/liber-primus/17.jpg`–`74.jpg` files. This SFT parses every JPEG marker, skips entropy-coded scans with byte-stuffing/restarter handling, rejects truncated or trailing bytes, checks expected APP/COM marker sets, verifies profile hashes and source-pixel geometry, and prints one line for every page plus the complete grayscale and colour partitions. Tested locally under Node.js 22.16.0 on the provided 75-JPEG archive; all 58 LP2 inputs passed. The image archive's mapping and original-byte hashes are documented in [the resource README](../resources/liber-primus/README.md), while the source-scoped red-ink comparisons use [ink annotations](../resources/liber-primus/lp2-ink-annotations.json).

**Research consequence:** Do not spend further work looking for a plaintext key in LP2 JPEG trailer bytes, APPn comments, or page-specific ICC profiles. A future image-steganography hypothesis requires a new visual/source-selected extraction rule operating on actual compressed data or an independently verifiable positive control; do not infer no steganography from the absence of metadata.

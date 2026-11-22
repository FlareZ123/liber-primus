# Source JPEG digests are not directly printed as 32-byte grid columns

**Agent 45, 10 November 2026. Evidence: a finite source-to-grid hypothesis falsified with a controlled exact-byte test. No LP2 plaintext, cryptographic key, or destination was recovered.**

## Cryptanalytic question

The LP2 numeric grid on pages 49–51 is exactly 256 bytes, a natural eight-by-32-byte arrangement. Could the eight vertical columns be SHA-256-like digests of the original page images, yielding reproducible key material from the published JPEG corpus? Another literal layout is eight consecutive 32-byte pieces of the row-major grid. This experiment tests these **specific direct-digest equalities** against source image files and decoded grayscale pixels. It does not choose glyph variants or train any representation on the ciphertext.

The exact input is [the canonical 256-byte grid](../resources/liber-primus/lp2-grid-256.json), whose SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Thus its known readings at indices 45, 50 and 246 already are the updated 107, 47 and 198. No alternative-version sweep is needed.

## Executed test

The Python/Pillow [source-image-digest checker](../sims/grid_image_digest_probe.py) enumerates the 75 original images `00.jpg`–`74.jpg` as raw JPEG file bytes, 58 LP2 images `17.jpg`–`74.jpg` decoded to row-major 8-bit grayscale raster bytes, and two explicitly bounded concatenated JPEG streams: all LP2 images, and scans 17–72 corresponding to the ciphertext-bearing/unsolved part. These are **135 distinct labelled input constructions**. For each input it computes SHA-256, SHA3-256 and BLAKE2s-256.

The checker independently reconstructs the grid's eight 32-byte **vertical columns** and eight consecutive 32-byte **row-major chunks**, each in both byte orientations. That yields **32 full-length target presentations** and **12,960 exact comparisons**.

| Measurement | Executed result |
| --- | --- |
| Input constructions | 135 |
| Full-length digest functions | SHA-256, SHA3-256, BLAKE2s-256 |
| Original grid orientations and 32-byte layouts | 32 |
| Exact 32-byte equality comparisons | **12,960** |
| Original-source digest matches | **0** |
| Planted authentic-image control | **1/1 correct** |

For the positive control, the digest `SHA-256(17.jpg)` is installed as one **shadow target** (not written to the actual grid). The same digest calculation over the actual original `17.jpg` source correctly reports the planted target with the right image label and digest algorithm. The test does not rely only on a run with no matches.

The script was executed on the supplied original 75-JPEG corpus. Printed output: `originalMatches: []`, one exact `jpeg-17 / sha256 / planted-grid-column` control hit, with the grid hash above. The comparison is exact; no arbitrary threshold or statistical significance is involved.

## Result and boundary

**None of the eight original grid columns, nor any of its eight consecutive 32-byte blocks, equals one of the three tested standard 256-bit digests of any complete source JPEG, canonical grayscale raster, or the two defined concatenated JPEG streams.** This closes the narrow, low-complexity interpretation “the printed grid is a literal per-page SHA-256-class image-digest table.”

The result says nothing about hashes of different page groupings or crops, RGB raster bytes, metadata-stripped streams, a digest post-processed by a KDF, salts or AES, partial digests, bit changes, byte permutations beyond the two layouts, hashes of unknown plaintext, JPEG-DCT steganography, or an image-derived running keystream. Those remain open as separate hypotheses if a specific original clue motivates them. No broader key-family exclusion is claimed.

**Reproduce:** `python sims/grid_image_digest_probe.py` with Pillow installed and `resources/liber-primus/00.jpg`–`74.jpg` present. The script reads repository fixtures and leaves all files unchanged.

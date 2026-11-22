# LP2 original JPEG container carriers: exact metadata and trailer boundary

**Agent 6, 15 November 2026. Original-byte finding, limited to ordinary JPEG ancillary markers and bytes after EOI. No unknown Liber Primus plaintext, original cipher key, or destination is recovered.**

## Source-visible question and original data

Earlier Cicada stages used out-of-band JPEG data and deliberate reversal. It is therefore reasonable to check whether the **58 original LP2 JPEG scans (17.jpg–74.jpg)** contain a per-page key in JPEG application/comment segments or a file trailer, before treating generic JPEG steganography as a new attack route. The test reads the repository's 58 unchanged JPEG files, with no transcoding, pixel thresholds, assumed cipher, or fitted parameters.

The read-only [source-native single-file SFT](../sims/lp2_original_jpeg_auxiliary_sft.py) parses every JPEG header segment up to start-of-scan, checks the physical end-of-image and asserts each of the following:

| Original-source observation | Exact result |
| --- | --- |
| JPEG sources / common dimensions | **58/58** images, **2400 × 3600** pixels |
| Ancillary marker sequence | Every source has exactly **APP0 (JFIF)** followed by **APP2 (ICC_PROFILE)** |
| APP0 payload | Identical on all 58 images, SHA-256 `fb259e3d53dc86ac12d161aef88d442454ba017b260166043144cf2378b74f1e` |
| APP2 ICC profile | Identical **2,576-byte** stock **Artifex Software sRGB ICC Profile**, SHA-256 `942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0` |
| Other EXIF/APPn/COM | **None** on all 58 |
| Trailing bytes after JPEG EOI | **Zero** on all 58 |
| Baseline JPEG components | **23** grayscale one-component pages; **35** RGB three-component pages |

The repeated APP2 packet is **2,592 bytes including its JPEG marker and length**, of which 2,576 are actual ICC profile bytes. Its embedded description and copyright string identify a stock Artifex sRGB profile, rather than a page-specific message. The script byte-hashes the profile and JFIF segment; identical ancillary payloads preclude using their per-page differences as an indexed ciphertext channel.

## Actual positive control and interpretive boundary

The independently supplied **first-book 05.jpg** is an original positive for unusual source-byte layout: **72,700 bytes remain after its JPEG end-of-image**, and those bytes reversed are **exactly the first 72,700 bytes of that same original JPEG**. Thus the LP2 absence is distinguishable from a scanner that silently discards all trailers. The LP1 trailer is a historical layout cue, not a newly recovered LP2 operand. This result does not decode the first-book image or propose any link from its trailer to an unknown LP2 cipher.

**Decision:** For original LP2 scans, there is no **per-page variable APP/COM metadata payload** or **appended post-EOI stream** to extract as a direct key. Do not repeat metadata-tag fishing or assume that a private page-key exists after the visible JPEG end. **This does not test** entropy-coded DCT coefficients, JPEG scan-specific steganography such as OutGuess, pixel color values, typography, illustrations, image ordering, or a hypothetical common key embedded in the shared profile. Such distinct carriers require their own original-source clues and tests. The profile indicates the encoder/toolchain, not necessarily the author, and provides no decipherment instruction.

## Reproduction

Run the read-only Python standard-library SFT against the repository-local image files; it checks every original page, the exact auxiliary marker sequence, both SHA-256 identities, the EOI boundary, and the independently genuine first-book trailer. The same code was executed directly on all **75** original JPEGs supplied in the maintainer archive (restricting the target census to 17–74), producing the exact results above. Neither synthetic pixels nor altered manuscript images were used.

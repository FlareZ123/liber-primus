# Original LP2 JPEGs: keyless direct DCT-AC bit extraction

**Decision, 15 November 2026.** A source-complete, *keyless sequential coefficient-bit* carrier test yields **no recognizable file prefix and no long plain-ASCII run** on the unmodified 58 historical LP2 JPEG scans, including the two solved controls. The same receiver **recovers 200/200 deliberately embedded bits** through an actual in-memory JPEG re-encoding on an original-sized cover. This is a valid negative only for the specified direct receiver and first 512 extracted bytes. **No unknown-page plaintext, key, or destination was recovered.** It does not test genuine OutGuess/OpenPuff keyed traversal, hidden content without a header, or a stego readout outside this scan/bit class.

## Why this is a plausible bounded source route

Original 2014 Cicada stages actually used JPEG hidden payloads, including OutGuess, and the LP2 Stage11 delivery itself is a series of JPEG images. This motivates trying a *simple direct carrier* before inventing an unselected cipher key. Earlier native OutGuess/OpenPuff tests use fundamentally different hidden-data algorithms; this experiment makes no version or password claim about them. The preserved [2014 JPEG byte-identity check](lp2-2014-original-distribution-carrier-gate.md) identifies all original scan files and their exact Git-blob matches to the contemporaneous Stage11 archive.

Input is **exactly resources/liber-primus/17.jpg through 74.jpg**, in ascending printed-image order, with no image conversions. The 56 unsolved pages are the first 56; the last two are the solved LP2 p56/p57 controls. Each source is a 2400×3600 baseline JPEG. The original 17.jpg used for the positive is **695,525 bytes**, SHA-256 **197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e**.

## Exact candidate inverse and original result

The [read-only source receiver](../sims/lp2_original_jpeg_direct_ac_lsb_sft.c) opens original quantized DCT coefficients with libjpeg, traverses *luma blocks in raster order*, ignores DC coefficients and zero AC coefficients, and emits the low bit of each eligible **absolute** coefficient, packed MSB-first. Four fixed models cover the two simplest coefficient inventories and scan orders:

| Mode | Within-block ordering | Eligible nonzero AC coefficients |
| --- | --- | --- |
| 0 | JPEG zigzag | Absolute value at least 2 |
| 1 | JPEG zigzag | Absolute value at least 1 |
| 2 | Native 8×8 array order | Absolute value at least 2 |
| 3 | Native 8×8 array order | Absolute value at least 1 |

The sign convention requires no separate branch: signed two's-complement parity and absolute-value parity agree. A first-component-only read has enough eligible coefficients to emit **512 full bytes in all 232 original image×mode runs**; concatenating chroma components would therefore leave these prefixes unchanged. Every byte stream is also inspected at all **eight possible initial bit alignments**, allowing the recovered file header to begin at any byte within the first 511/512 bytes. Total **1,856 aligned prefixes**.

The receiver checks the exact signatures of ZIP local headers, GZIP, bzip2, PDF, PNG, GIF87a/GIF89a, RAR, 7z, XZ, ELF, PGP ASCII armor, ID3, HTML doctype and lowercase HTML. It also scores the longest contiguous ASCII interval using bytes 0x20–0x7e. The unchanged source result is:

| Criterion | Original result |
| --- | ---: |
| Original JPEG images | 58 |
| Complete 512-byte candidate readouts | **232/232** |
| Eight-bit-phase candidate readouts | **1,856** |
| Exact known file-header occurrences in those prefixes | **0** |
| Longest contiguous printable ASCII run | **13 bytes** |
| Authenticated embedded file/key/plaintext | **none** |

These are absence-of-signature observations, not probabilistic proof that all 512-byte outputs are unstructured, and certainly not proof that an encrypted stego payload is missing.

## Genuine encoded-JPEG positive control

A separate [read-only in-memory positive SFT](../sims/lp2_jpeg_direct_ac_lsb_positive_sft.c) starts with the unchanged original 17.jpg JPEG. It modifies only the first 200 eligible quantized luma AC coefficients as necessary to encode the exact 25-byte UTF-8 marker:

**LP2_DCT_LSB_POSITIVE_2026**

The positive uses JPEG coefficient-domain **re-encoding into memory** via libjpeg, then opens that new encoded JPEG through a fresh decoder and extracts its actual first 200 bits under mode 0. The independently re-decoded result is **200/200 exact bits**, with embedded_bits=200, jpeg_bytes=803894, exact_recovery=yes and the expected marker. No original source file is edited or rewritten. This proves the implemented bit packing and real JPEG coefficient transport can recover an embedded short payload, and it prevents mistaking a broken extractor for a substantive negative.

## Interpretation and next decision

The source JPEGs do not expose a recognizable **directly serialized, unencrypted file** under this keyless luma-AC LSB family within the tested prefix horizon. Since key-bearing original Cicada stego historically used a keyed permutation, further unmotivated traversal/seed/bit-plane combinations would have an enormous retrospective search space. The useful next step remains an **independently selected key, algorithm, or source-defined carrier ordering**, or an actual unknown-page plaintext crib that can drive a reversible receiver. Existing encrypted original-rune observations and the lack of an authenticated LP2 cipher are unchanged; this bounded carrier exclusion belongs in intermediate evidence rather than the authoritative plaintext synthesis.

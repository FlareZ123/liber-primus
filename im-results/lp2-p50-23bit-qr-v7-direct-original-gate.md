# Original p49–p51 23-bit-trimmed QR-v7 raster: direct source-order gate

**Result type:** Bounded negative on an original-source, reversible-looking *readout proposal*. No LP2 plaintext, historical key, or authored cryptographic operation recovered.

## Why this particular bit count was examined

The original page-spanning numerical table has 256 two-character values in an exact 32-row × 8-column panel. Interpreting these as conventional base60 bytes gives exactly **2,048 bits**. The original solved p57 contains a visually marked final **23-dot** ornament. Subtracting 23 bits leaves **2,025 = 45²**, exactly the square dimension of a **QR version-7** symbol. This dimensional link was noticed before examining candidate bitmaps. The historical creator never instructs a byte-level QR decoder or 23-bit discard; the numerical table radix and the proposed 23-bit removal are hypotheses.

The low-cost discriminator is the **mandatory QR finder geometry**, even before any Reed–Solomon or message decoding. A direct QR image must satisfy all three 7×7 finder patterns and both standard alternating timing runs irrespective of payload, mask, error correction level, data text or secret.

## Original source experiment and frozen finite scope

Read `resources/liber-primus/lp2-grid-256.json` (source-consolidated, original printed p49–p51 cells, 256 byte values) in unmodified 32×8 row order. Interpret each byte most-significant-bit first or least-significant-bit first; remove the **first** 23 bits or the **last** 23 bits; rasterize the retained 2,025 bits as 45×45. Apply each of the eight square reflections/rotations and either polarity. These are **2 × 2 × 8 × 2 = 64** candidate representations.

The three 7×7 finder patterns plus two non-overlapping 29-module timing runs supply **205 distinct forced module values**. The **best of 64** original interpretations matches **116/205**; the remaining **89 mandatory modules disagree**. None is a literal QR-v7 bitstream. The 23-dot interpretation does not repair that contradiction. The original-data digest is anchored by the committed dataset; no image processing or transcription changes are performed.

A separate direct 32-character ASCII reading of each table row's eight values, taking one fixed bitplane across columns, is also a natural visible-panel test. Every bit index (eight) and either row orientation (two) was evaluated. The best of **16** gives **18/32 printable ASCII bytes**, with raw candidate hexadecimal `67bf29eb3b6baad649e28e6cc568787c241cbda8007c324821977da5c3295a7e`. This is an uninterpreted byte result, not plaintext.

## Necessary controls and inference boundary

The committed read-only Node22 CommonJS SFT builds an independent positive raster by writing all 205 forced modules into a 45×45 bitmap, appending 23 arbitrary bits, and repacking into 256 bytes. Its expected original orientation scores **205/205**, confirming that the test recognizes a direct, valid geometric QR header without requiring valid payload or error correction. The original source rejects this narrow direct model.

A **permutation of bits**, whitening/XOR, an extra cipher layer, a keyed row rearrangement, a QR rendered in the page *artwork*, or a source-led matrix conversion are outside this gate. Do not widen the finite search using arbitrary operations unless an original clue independently selects them. The 23=QR dimension is a source-suggested coincidental possibility, not evidence of an encoded QR.

## Reproduction

[`sims/lp2_p50_23bit_qrv7_direct_original_sft.cjs`](../sims/lp2_p50_23bit_qrv7_direct_original_sft.cjs), Node22 CommonJS, reads the canonical source grid and assertions, logs all summary values, and requires no dependencies. Use the existing read-only `manual-readonly-commonjs-sft.yml` workflow with `script=sims/lp2_p50_23bit_qrv7_direct_original_sft.cjs`. The full original QR-finder 205-module test is stronger than trying to decode QR payload without a recognizable finder.

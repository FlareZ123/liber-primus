# Original LP2 reused-plate JPEG coefficient gate

**Decision (22 November 2026, Agent20; Director #2180):** The named exact/reused artwork groups do not expose a page-specific coefficient payload in their source-identical regions. The five-dot stencil on p7/p23/p56 is a transformed reuse of one source design; its small pixel residuals are concentrated at antialiased edges, and its transformations are not aligned to the JPEG 8×8 DCT grid. No byte stream, key, unknown plaintext, or executable cipher instruction was recovered. This is a finite negative for the inspected exact source plates and ordinary JPEG envelope, **not** a proof that every shared/pre-embedded or keyed coefficient payload is absent.

## Human solve-path premise and rival

LP1 pages 05 and 10 demonstrate that Cicada previously used image-level byte payloads. A solver receiving LP2 as JPEGs could reasonably inspect the original containers and ask whether repeated illustrations reveal a hidden byte stream or a source plate modified differently on different pages. The strongest rival is simpler: the same static artwork was copied, reflected, or shifted into a page template, and the resulting JPEG differences are ordinary quantization and raster-phase effects.

The source input is the maintainer-supplied original 75-JPEG archive. The concatenated SHA-256 of scans `00.jpg` through `74.jpg` is `cdda41395a52761be5d00c52ec4a2c1c769f9a9f756974a7ec62d4bbf4156dc1`, matching the repository's source-art atlas. Physical LP2 page `p` is archive scan `p+17`.

## Container channels already resolved by original-source audits

The existing all-58-page envelope and coefficient-preserving replay reports are reused here rather than repeated. They establish:

- All 58 LP2 images are 2400×3600, 8-bit baseline SOF0 JPEGs with one SOS scan, no restart interval/markers, and no progressive scan.
- There are 35 RGB and 23 grayscale images. Each class has a fixed DQT family; APP0/JFIF and APP2/ICC are identical across all 58 images.
- There is no APP1/EXIF, COM, other APP segment, or post-EOI byte/trailing stream in any LP2 image.
- All 58 page-specific DHTs, DQTs, SOS/frame parameters, and entropy-coded scan bytes regenerate exactly from the original quantized DCT coefficients using optimized libjpeg coding after removing the shared ICC APP2 segment. The apparently variable Huffman tables therefore add no independent payload under the native encoder model.
- The exact historical JSteg-Shell length header is impossible for every original LP2 page; the separate OutGuess, JSteg-style, Steghide, and other finite stego reports retain their own stated scopes.

These are established results, not new tests in this issue. They retire generic APP/EXIF/COM/trailer/DHT/entropy-byte fishing. The remaining JPEG question is the coefficient values themselves, under a source-selected operation.

## Original quantized DCT identity in exact reused art

I added a read-only libjpeg coefficient comparison for two independently established, same-position source-plate groups. It reads original quantized luminance coefficients directly with `jpeg_read_coefficients`; it does not decode/re-encode pixels, fit a key, or modify source files. All compared rectangles are fixed by the existing source-pixel atlas and are aligned to the original 8×8 block grid.

| Original artwork pair | Fixed block-aligned region | Original luma blocks | Coefficients compared | Differences |
|---|---|---:|---:|---:|
| p1/p2 triple-bar cross, scans 18/19 | left crop interior, x=0–447, y=904–2647 | 12,208 | 781,312 | **0** |
| p24/p26 insect plate, scans 41/43 | left margin, x=0–519, y=1000–2599 | 13,000 | 832,000 | **0** |
| p24/p26 insect plate, scans 41/43 | right margin, x=1800–2399, y=1000–2599 | 15,000 | 960,000 | **0** |

The p24/p26 comparison includes a grayscale original and an RGB original, but both use the same luma quantization table and 300×450 luma block geometry. The two fixed insect crops are exact source-pixel copies, and their original quantized luma DCT blocks are also identical. These results exclude a *different per-page coefficient message* in these exact copied regions. They cannot detect a payload embedded in the common source plate before it was copied to both pages.

The broader exact compositor atlas independently establishes literal source-pixel reuse for p1/p2 crosses, p24/p26 insect wings, and p40–p55 floral frames, among other groups. Existing F5 and additive/XOR shared-pad gates are distinct tests and should not be conflated with this coefficient-identity result.

## Five-dot stencil: p7, p23 and solved p56

The source-locked five-dot transforms are:

- p7 → p23: `(x,y) → (x, 3674-y)` (vertical reflection).
- p7 → p56: `(x,y) → (2401-x, y-419)` (horizontal reflection and translation).
- p23 → p56: `(x,y) → (2401-x, 3255-y)` (180° rotation and translation).

The original-image comparisons reproduce the previously published black-mask matches:

| Pair | Black-mask IoU | Exact grayscale pixels in fixed crop | Mean absolute grayscale residual |
|---|---:|---:|---:|
| p7 → p23 | **0.999479829** | 0.975466897 | 0.075148221 |
| p7 → p56 | **0.971851852** | 0.974584980 | 0.346225296 |
| p23 → p56 | **0.972350493** | 0.976763834 | 0.331704545 |

The residual is localized. More than five pixels inside the union of the black disks, mean absolute residual is 0.103–0.131 gray levels; only 0.16–0.23% of those interior pixels differ by more than five levels. The edge band within five pixels of a disk boundary accounts for the much larger residuals (mean 1.91 for p7/p23 and about 17.3–17.8 for the p56 comparisons). The surrounding paper residual is approximately 0.008–0.010 gray levels on average.

This is consistent with the known raster transformation/recompression of a reused five-dot stencil, not an added high-contrast mark or an evolving per-page image stream. As an independent source-native phase control, the p24/p25 insect art's established one-pixel shift gives substantially larger grayscale residuals: exact-pixel fractions 0.7603/0.7945 and mean absolute residuals 0.8025/0.5232 in the two margins.

**Important DCT limitation:** none of the five-dot transforms preserves the JPEG 8×8 block phase. Their offsets modulo eight are respectively 2 (p7→p23 vertical), 1 and 5 (p7→p56 x/y), and 1 and 7 (p23→p56 x/y). Directly subtracting or reversing original quantized DCT blocks would therefore be invalid. The phase-residual reproducer deliberately stops at fixed pixel registration and does not manufacture a coefficient bitstream from reblocked residuals. The p33 three-dot object is a source-native unrelated control and fails the exhaustive D4/point-permutation match in the existing all-page five-dot census; the p32/p55 tree resemblance is also not an exact source plate and is not a valid coefficient reference.

The existing five-dot source report also shows that the same stencil is reused at three different textual boundaries, and that the known p56 decryption keystream transferred to p7/p23 does not produce readable plaintext. That source-art fact does not choose a DCT traversal, password, or cipher operation.

## Decision, limits and next causal requirement

No byte stream, standard file signature, keyed opcode, authentic key, or meaningful GP plaintext emerged from the inspected source plates. There is consequently no candidate key to apply to 150 original runes.

The result does **not** exclude:

- a payload already embedded in the common five-dot or insect source plate before reuse;
- a custom/keyed coefficient codec in non-repeated text or illustration regions;
- F5 or another scheme restricted to the five-dot interior (the calibrated 32-page F5 margin stencil gate does not cover this central dot region);
- an external clean source plate or historical key that has not been recovered.

Do not continue generic LSB, arbitrary threshold, or DCT-frequency-order sweeps. A useful successor needs an independently motivated coefficient traversal/password, an authenticated clean parent image for one of the shared plates, or a first-party marker selecting a particular region and reversible operation. The p32/p55 tree pair remains a visual correspondence, not a source-identical carrier.

## Reproduction

From the repository root:

```sh
cc -O2 -Wall -Wextra sims/lp2_reused_plate_coeff_identity_sft.c -ljpeg -o /tmp/lp2_reused_plate_coeff_identity_sft
/tmp/lp2_reused_plate_coeff_identity_sft resources/liber-primus
python3 sims/lp2_fivedot_phase_residual_sft.py --sources resources/liber-primus
```

The coefficient reader asserts source geometry, luma DQT equality, fixed crop alignment, and exact coefficient identity. The phase-residual script asserts the original source hashes and pre-registered transforms. Existing supporting results: [JPEG envelope audit](lp2-jpeg-container-metadata-audit.md), [byte-exact libjpeg replay](lp2-jpeg-libjpeg-byteexact-reoptimization.md), [JSteg-Shell source gate](lp2-jsteg-coefficient-original-source-gate.md), [F5 shared-stencil gate](lp2-f5-q92-shared-stencil-original-gate.md), [exact compositor atlas](lp2-original-exact-compositor-layer-atlas.md), [five-dot stencil decision](lp2-fivedot-source-stencil-mirror-and-p56-key-gate.md), [p24/p26 insect gate](lp2-p24-p26-illustration-reusedpad-gate.md), and [p32/p55 tree correspondence](lp2-p32-p55-blurred-tree-correspondence.md).

# Exact decoded-border invariance of the sixteen floral LP2 pages

**Original-image and coefficient-domain finding, 15 November 2026 (Agent 1).** The original floral LP2 pages pp40–55 / scans `57.jpg`–`72.jpg` repeat one exterior artwork template. All pp40–54 have **exactly identical decoded RGB borders**. Original JPEG quantized DCT coefficients within these regions are also **identical, coefficient for coefficient, among pages in the same grayscale or color export class**. The only p55 border changes occupy 16 luma DCT blocks where its separately drawn moth wing visibly enters the right border. This excludes a variable per-page exterior coefficient payload within those classes. No unknown LP2 plaintext, creator key or decryption instruction was recovered.

## Direct experiment on unchanged source scans

Use original repository `resources/liber-primus/57.jpg` as the fixed reference. Decode each original JPEG to Pillow `RGB` (three 8-bit channels), preserving each pixel's independent R/G/B values; compare absolute per-channel differences, no resizing, registration, thresholding, OCR, interpolation, or pixel selection using page content. Four exterior rectangles in original `(x0,y0,x1,y1)` coordinates:

| Region | Fixed rectangle |
| --- | --- |
| Left artwork/exterior | `(0,0,590,3600)` |
| Right artwork/exterior | `(1810,0,2400,3600)` |
| Top exterior | `(0,0,2400,600)` |
| Bottom exterior | `(0,3200,2400,3600)` |

Across scans **57–71**, the absolute-difference images for *all four* regions have zero nonzero pixels compared with scan57. In other words, all 14 other scans have precisely identical decoded exteriors to the reference, including the floral branches and small repeated side dots. The central variable-content rectangle `(590,600,1810,3200)` differs by over 1,000 pixels for every nonreference scan, so the equality is specific to the repeated frame and not an accidentally duplicated complete page.

Scan **72**, physical p55, has zero changed pixels in the left, top, and bottom rectangles. Its right exterior has **1,070 changed RGB pixels**, confined to an exact bounding box `(1810,2780,1832,2872)` in global coordinates. Original visual inspection identifies these as the tip of p55's distinctive moth wing entering the exterior cutoff, not a modified floral symbol. The common right floral decoration remains the same.

The [single-file Pillow reproducer](../sims/lp2_floral16_border_pixel_differential_sft.py) asserts each source image's original dimensions, every exact result, and a deliberate one-channel, one-pixel modified-source positive showing that the comparator identifies a true change. It writes no files. The source corpus mapping and 2014-authenticated JPEG provenance are in [the reference index](../resources/liber-primus/README.md).

## Original quantized JPEG coefficient test

Pixel agreement could conceal different DCT coefficients that quantize to the same displayed colors. The [original-source libjpeg SFT](../sims/lp2_floral16_border_dct_identity.c) calls `jpeg_read_coefficients` on unmodified JPEG files, comparing **all 64 signed quantized coefficients** in every fully contained exterior 8×8 block, without pixel rounding or re-encoding. It uses the four exact exterior rectangles specified above; boundary-straddling blocks are excluded. It checks the original dimensions, component sampling factors, quantization tables and that central blocks truly differ.

Compare the **grayscale scans** against grayscale reference `58.jpg` (ten candidates `59`–`65`, `67`–`69`) and the **color scans** against color reference `57.jpg` (four candidates `66`, `70`–`72`); these classes have different component structure and cannot be compared directly in the coefficient domain.

| Original JPEG class | Border quantized DCT comparisons | Actual differences |
| --- | ---: | --- |
| Grayscale Y: 10 comparisons against scan58 | 849,500 luma blocks | **Zero** blocks and coefficients changed |
| Color Y: scans66,70,71 against scan57 | 254,850 luma blocks | **Zero** blocks and coefficients changed |
| Color Cb/Cr: scans66,70,71 against scan57 | 126,216 chroma blocks | **Zero** blocks and coefficients changed |
| Color p55 scan72 against scan57 | 84,950 Y plus 42,072 chroma blocks | **16 Y blocks**, containing **311 changed signed coefficients**, all around the visible right-side moth-wing intrusion; **zero** Cb/Cr changes |

A one-AC-coefficient deliberate mutation is detected by the comparator. Every original candidate differs from its reference in the central text/illustration region, confirming that exact coefficient equality is specific to the common frame. This source result excludes **page-varying quantized DCT payloads in the unchanged exterior regions within each image export class**. It leaves static ornament, differential center content, invisible coefficient changes in the center, optimized Huffman codebooks, and other carrier formats outside the tested scope.

**Additional original cross-export-class Y comparison (15 November 2026).** The grayscale files and color files have an identical luma quantization table and 300×450 Y block geometry, so direct comparison of their original quantized Y blocks is also well-defined. A modified copy of the same libjpeg coefficient comparator tested color reference scan57 against **all fifteen** other floral scans57–72, including ten grayscale scans. **All fourteen** unchanged frames scans58–71 have **0 changed luma DCT blocks out of 84,950 exterior blocks each**, and scan72 retains only its visible moth-wing **16 changed Y blocks /311 coefficients**. Thus the exact common luminance DCT border extends **across both JPEG export classes**, not only within separate classes. Chroma exists only for color files and retains the previously reported within-color conclusion. This is a direct original-coefficient result; the same-class SFT above remains the published full-assertion reproducer.

## p55 moth-wing exception: source-registered cover and payload gate (Agent 16, 15 November 2026; issue #1175)

The only nonidentical exterior is p55 / original scan `72.jpg`. This test resolves the specific 16-luma-block exception; it does not claim that all image steganography is impossible.

The exact local inputs used were p53 `70.jpg` (SHA-256 `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548`), p54 `71.jpg` (`dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4`), and p55 `72.jpg` (`a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`). The target is luma block columns 227–228 and rows 349–356: a 2×8 strip at p55 pixel coordinates x=1816–1831, y=2792–2855.

### Visible-only and known-cover models

- At the same absolute coordinates, p53 versus p54 has **0/1,024** changed quantized luma coefficients. p53 versus p55 has **311/1,024** changes in all 16 target blocks: **16 DC and 295 AC**.
- Reading the original decoded Y plane with libjpeg, taking the same-coordinate p55−p53 pixel delta, applying an orthonormal 8×8 DCT and the original shared luma quantization table predicts **exactly 311 nonzero quantized coefficient changes**. It matches **1,016/1,024** observed coefficient deltas exactly; the remaining eight differ by only one quantization unit. Thus the full 311-coefficient count is already required by the visible wing pixels; it is not an unexplained coefficient residual.
- The independent p53→p55 moth registration is (+66,+67) pixels ([coordinate-registration report](lp2-moth-art-coordinate-registration-source-gate.md)). Sampling p53 at that translated source location gives a known-cover model for the same 16 p55 blocks. Across all 1,024 Y samples, the aligned images differ by at most 7 levels (mean absolute difference 0.903320; no sample differs by more than 10). Quantized DCT prediction from the translated p53 cover matches **905/1,024** p55 coefficients; the 119 residual coefficients have total absolute magnitude 120 and maximum magnitude 2. The residual is small and consistent with the two separately encoded, shifted copies of the same visible moth.

### Frozen transport test and positive control

Before reading the local bitstream, I froze the historically available JSteg-style order: target blocks in raster order, AC coefficients in JPEG zigzag order, skip coefficients with |c|≤1, emit |c| mod 2, pack MSB-first. The original p55 strip yields **169 bits** (21 complete bytes plus one trailing bit), with complete-byte hex `80a06744e0b0cc0801a3cc03c7806808478732a002`; printable ASCII fraction is 0.238 and there is no recognizable file/PGP header.

For a source-registered differential readout, keep only AC positions where both the p55 coefficient and translated-p53 predicted coefficient have |c|>1, and emit the XOR of their magnitude LSBs in that same fixed order. This yields 156 bits (19 complete bytes plus four trailing bits), with complete-byte hex `09e40003c108d80812b1815e5914a404ec0d4a` and 52 one-bits. A single direct GP29 candidate, `K[i] = byte[i] mod 29` repeated over all 76 original p55 ciphertext runes, gives IoC 0.033684 for P=C−K and 0.037895 for P=C+K (uniform 1/29 = 0.034483); neither direction produces plaintext. This is a bounded direct-key check, not an author-authenticated byte-to-GP29 instruction.

The same 16-block JSteg extractor/plant routine was calibrated by planting the 21-byte payload `LP2-WING-POSITIVE-001` into a copy of original p55 and reopening the JPEG: all 168 planted bits were recovered byte-exactly. Payload SHA-256 is `3320c5c17e534fbc9ce09a9adf586c80651de8f83d21929dc675dfe2b4b90822`; the planted JPEG SHA-256 is `70881b52eb5a82133e8ae89b7bab1e60350c5f01bb3c70a0dee06e6e920c5459`. This establishes that the selected 16-block carrier has enough capacity for the positive control and that the local extractor works. The existing [full-image JSteg coefficient scan](jpeg-jsteg-coefficient-scan.md) separately covers all 58 original LP2 images, including solved p56/p57, and includes byte-exact planted controls.

### Reproduction and decision

Build and run from the repository root:

```sh
cc -O2 -Wall -Wextra sims/lp2_p55_moth_wing_dct_sft.c -ljpeg -lm -o /tmp/lp2_moth_sft
/tmp/lp2_moth_sft analyze resources/liber-primus
printf 'LP2-WING-POSITIVE-001' > /tmp/payload.bin
/tmp/lp2_moth_sft plant resources/liber-primus/72.jpg /tmp/72-planted.jpg /tmp/payload.bin
sha256sum resources/liber-primus/70.jpg resources/liber-primus/71.jpg resources/liber-primus/72.jpg
```

**Decision:** retire the p55 16-block moth-wing DCT anomaly as an independent payload/key route. The 311 changes are explained by visible artwork and the source-registered moth copy; the fixed local readouts provide no coherent payload or GP29 plaintext. This does not exclude a different carrier region, a keyed/randomized steganographic method with an independently sourced key, or other non-image channels. Do not repeat this 16-block search without a new source selector.

## Cryptanalytic decision

The repeated floral exterior is a **pixel-identical template** and, within each export class, a **quantized-DCT-identical template** except for the visible p55 moth wing. The p55 exception is now source-registered: the visible pixel delta predicts all 311 changed coefficients (1,016/1,024 exact, maximum residual one), while the translated p53 moth is a known cover (905/1,024 coefficient matches, maximum residual two). The fixed local JSteg-style readout and one direct GP29 key candidate yield no plaintext. A page-index key therefore cannot be recovered from varying exterior petals, decoded border colors or the p55 wing's coefficient differences. Static ornament may select a route; central glyphs, page-specific illustrations, changed optimized JPEG Huffman tables and text/boundary ordering remain separate inputs without a known extraction rule.

This is a bounded elimination of a particularly source-attractive *16-page decoration-variation* channel. It should prevent another attempt to read variable values from features that demonstrably never change. It does not authorize a new 4×4 key, encryption operation, or plaintext.

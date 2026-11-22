# LP2 original JPEG standard-marker audit

**Agent45, 18 November 2026. Director issue #1644. Decision:** the original LP2 JPEGs expose **no source-selected standard-marker payload or encoding anomaly** on p27, p50, or p55. The standard JPEG-structure branch should close here. Any deeper pixel-domain steganography requires an independent visible or source clue.

## Scope

The supplied original archive contains `00.jpg` through `74.jpg`. The established LP2 mapping is JPEG17 through JPEG74 for p0 through p57, so the source-selected pages are p27/JPEG44, p50/JPEG67, and p55/JPEG72.

The audit parses JPEG markers and entropy boundaries byte-for-byte. It inventories JFIF/APP metadata, ICC profile segments, comments, quantization and Huffman tables, SOF/SOS structure, scan count, dimensions, file size, and bytes after the first EOI. It deliberately excludes LSB and bit-plane searches.

## LP2-wide structure

All **58 LP2 files** share the same metadata/template family:

- every file is baseline SOF0, 3600×2400, 8-bit, with exactly one SOS scan;
- 35 are three-component color JPEGs and 23 are one-component grayscale JPEGs;
- every LP2 file has the same APP0 JFIF payload and the same APP2 ICC payload; the ICC profile identifies **Artifex Software sRGB ICC Profile / Copyright Artifex Software 2011**;
- no LP2 file has COM, EXIF, XMP, IPTC, DRI, or another APP payload;
- every color LP2 file uses the same two DQT payloads; every grayscale LP2 file uses the same one DQT payload;
- all 58 files have distinct DHT signatures, so target-page Huffman uniqueness is ordinary image-specific optimized coding rather than a source-selected metadata channel;
- all 58 LP2 files end exactly at EOI with **zero trailing bytes**.

The full 75-image archive has two trailing-byte controls outside LP2: JPEG05 has 336,713 bytes after its first EOI and JPEG10 has 3,486,295. JPEG10 begins its trailing data with another JPEG SOI; JPEG05 contains reversed/embedded JPEG-like byte structure. Their presence verifies that the marker parser detects appended data when it exists. Neither anomaly occurs on an LP2 page.

## Source-selected pages versus controls

| LP2 page | JPEG | components | size | LP2 size rank | z score | DHT bytes | trailing | marker family |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| p27 | 44 | 3 | 580,041 | 26/58 | -0.261 | 259 | 0 | ordinary color LP2 |
| p50 | 67 | 1 | 581,983 | 28/58 | -0.244 | 149 | 0 | ordinary grayscale LP2 |
| p55 | 72 | 3 | 614,928 | 34/58 | +0.046 | 232 | 0 | ordinary color LP2 |

Their file sizes sit near the middle of the LP2 distribution. p27 and p55 use the same APP/DQT/color marker template as 33 other LP2 pages. p50 uses the same APP/DQT/grayscale template as 22 other LP2 pages. Their Huffman tables are individually unique, as are the Huffman tables of every LP2 control page.

## Decision

The standard JPEG container supplies no source-selected payload, key, receiver, page tag, or unusual encoding state for p27, p50, or p55. The visible page content remains the relevant artifact for those branches. Do not initiate generic pixel steganography from this result; a deeper test needs a specific clue or byte anomaly that this audit did not find.

The pre-LP2 JPEG05/JPEG10 trailing data can be studied separately if historically useful. It does not support an LP2 hidden-byte route.

## Reproduction

```text
python sims/lp2_jpeg_standard_marker_inventory_sft.py
```

The SFT reuses the repository's marker-aware parser at `sims/lp2_jpeg_marker_audit.py` and asserts the 58-file LP2 template invariants, absence of LP2 trailing bytes, the two pre-LP2 trailing controls, and the p27/p50/p55 target statistics.

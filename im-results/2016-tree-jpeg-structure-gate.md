# Signed 2016 tree JPEG: source-native container audit

**Agent 13, 11 November 2026.** This closes the bounded file-structure question in Director Issue #324. No additional payload or instruction was recovered. The authenticated OutGuess payload remains a separate, already reproduced DCT-coefficient channel.

## Source and control

- Target: original archived 4gq25.jpg, preserved at resources/historical/cicada2016-4gq25.jpg, Git blob SHA 22027296dcd7df53c5127e6aadbabeaf3223f72d, 26,342 bytes.
- Ordinary repository control: resources/liber-primus/00.jpg, Git blob SHA b99a2532e76bba018b2ace579238dd07e4fd3dbc, 168,876 bytes.
- Both inputs were parsed from the repository's exact stored bytes. The control is a normal baseline JFIF page image; its quantization tables are all ones, so it is a useful marker/Huffman control rather than a same-quality pixel control.

## Exact JPEG structure

The target has this complete marker sequence and offsets:

| Marker | Offset | Segment length |
|---|---:|---:|
| SOI | 0 | 2 |
| APP0 / JFIF | 2 | 18 |
| DQT, table 0 | 20 | 69 |
| DQT, table 1 | 89 | 69 |
| SOF0 | 158 | 19 |
| DHT, DC table 0 | 177 | 33 |
| DHT, AC table 0 | 210 | 183 |
| DHT, DC table 1 | 393 | 33 |
| DHT, AC table 1 | 426 | 183 |
| SOS | 609 | 14 |
| EOI | 26,340 | 2 |

SOF0 declares 8-bit, three-component baseline JPEG, 563×569 pixels. Component sampling is Y=2×2, Cb=1×1, Cr=1×1; quantization-table selectors are 0,1,1. The JFIF APP0 payload is the ordinary JFIF 1.01 header with unitless 1×1 density and no thumbnail.

There are exactly two 8-bit DQT tables, four DHT tables, one baseline SOF0 and one SOS. There is no APP1–APP15 segment (therefore no EXIF or ICC profile), no JPEG COM segment, no extra scan, and no bytes after EOI. The first EOI is at byte 26,340 and the file ends at byte 26,342.

## Comparison with ordinary JPEG structure

The two target DQT tables, interpreted in JPEG zig-zag order, match the standard IJG/libjpeg quality-75 luminance and chrominance quantization tables exactly. A search over integer quality settings 1–100 finds the sole joint match at quality 75.

The target's four DHT tables are byte-for-byte identical in class, table ID, 16 code-length counts and symbol order to the four tables in control 00.jpg. The target and control also have identical APP0 bytes and identical pre-scan marker order and segment lengths: FFE0(18), FFDB(69), FFDB(69), FFC0(19), FFC4(33), FFC4(183), FFC4(33), FFC4(183), FFDA(14).

The only meaningful header differences are the expected image dimensions and DQT values: control 00.jpg is 2400×3600 and uses all-ones DQT tables, while the target is 563×569 and uses standard quality-75 DQT tables. This is ordinary baseline JPEG encoding, not a custom marker/table convention or a hidden segment boundary.

## Decision and scope

The raster itself remains the previously recorded signed text over a faint leafless-tree silhouette; the pixels do not establish a tree species or location, and this audit does not reopen the already closed visible-map hypotheses. The exact file-structure test finds no additional source-native payload or instruction beyond that visible image and the already authenticated signed OutGuess content. In particular, there is no EXIF/ICC/COM/APP payload, custom Huffman table, nonstandard quantization table, appended trailer or second JPEG stream. The target's standard quality-75 quantization and shared canonical Huffman tables do not select a new LP2 transformation, key, route or stopping rule.

This is a bounded negative for the JPEG-container channel only. It does not claim that ordinary JPEG coefficients cannot carry steganographic data, and it does not re-test the already authenticated OutGuess extraction. The contemporaneous archive's OutGuess instruction and the exact 1,136-byte signed payload are already recorded in resources/cicada2016-4gq25.md. No password list, arbitrary offset, or additional steganographic decoder was run.

Reproduction: single-file Node.js structure SFT at sims/cicada2016_jpeg_structure_gate.cjs.

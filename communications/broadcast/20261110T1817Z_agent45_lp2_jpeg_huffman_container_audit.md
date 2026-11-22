# Agent 45: LP2 JPEG Huffman/container audit

**Sender:** Agent 45. **Date:** 2026-11-10 18:17 UTC.

## Result

The LP1 JPEG 05 and JPEG 10 payloads motivate checking whether LP2 uses a related JPEG-container channel. A specific candidate is data encoded in the variable ordering of equal-length symbols in JPEG DHT tables.

Across all 58 LP2 images (17.jpg–74.jpg), a coefficient-preserving libjpeg-turbo 2.1.5 re-optimization reproduces **every original DHT and DQT marker segment byte-for-byte (58/58)**. The APP0/JFIF and APP2/ICC segments are identical across all 58 images; DQT is constant within each color mode. All 58 are single 2400×3600, 8-bit JPEGs (35 RGB, 23 grayscale), with one SOI/EOI, no trailing bytes, no APP1, no COM and no APP3–APP15 segments.

The unusual DHT symbol ordering is therefore fully explained by ordinary optimized-Huffman encoding of the original quantized coefficients. This retires a separate DHT-symbol-order / simple APP-metadata / trailing-payload channel for LP2. It does **not** exclude coefficient-domain or pixel/color-channel steganography. No unknown plaintext, authentic key, cipher mechanism or destination recovered.

## Reproduction

- Report: **im-results/lp2-jpeg-huffman-container-audit.md**
- Reproducer: **sims/jpeg_huffman_reoptimization_audit.c**
- Command:
  ~~~sh
  cc -O2 sims/jpeg_huffman_reoptimization_audit.c -ljpeg -o /tmp/jpeg_huffman_reoptimization_audit
  /tmp/jpeg_huffman_reoptimization_audit resources/liber-primus 17 74
  ~~~

Do not repeat this DHT-order/APP-metadata scan. Continue with source-constrained cipher-state work rather than a generic steganography sweep.

# Agent 42 — LP2 sequential JPEG coefficient-LSB scan

**Scope:** all 58 original LP2 JPEGs (17–74), using the original quantized DCT coefficient arrays through libjpeg. This is a bounded test of unkeyed, sequential JSteg-style AC-LSB replacement, not a general steganography exclusion.

**Method:** skip DC; traverse AC coefficients in JPEG zigzag order; skip absolute magnitudes 0 and 1; emit abs(coefficient) mod 2. Both component-major and MCU-interleaved traversal were tested.

**Result:** 25,517,550 eligible AC bits per traversal (3,189,718 padded bytes). Mean page entropy is 7.927349 / 7.926748 bits per byte; mean printable fraction 0.368961 / 0.368534; longest printable run 21 / 16 bytes. No common file/text signature was found at bit alignments 0–7, and no sustained readable plaintext emerged. High entropy alone cannot exclude an encrypted/compressed payload.

**Validation:** synthetic payloads of 32, 512, 4,096 and 32,768 bytes were planted and recovered byte-for-byte on an original RGB image (17) and grayscale image (33). A 4,096-byte control also passed under both traversal orders. The repeated 2,187-byte stream prefix between image files 54 and 56 is explained by pixel-identical top 672 rows across files 51–56, not evidence of payload.

**Artifacts:** sims/jpeg_jsteg_coeff_scan.c; sims/jpeg_jsteg_stream_analyze.py; im-results/jpeg-jsteg-coefficient-scan.md.

Please do not repeat this exact sequential extraction without a new source clue. Keyed/randomized coefficient placement, F5/JPHide-like methods, encrypted payloads, and pixel/color-channel modulation remain open.

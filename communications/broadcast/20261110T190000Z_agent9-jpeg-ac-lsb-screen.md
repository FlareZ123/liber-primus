# Agent 9: limited LP2 JPEG AC-coefficient LSB screen

**Sender:** Agent 9, run agent9-20261110T181325Z-gpt6-source-architecture-7c2a9f.  
**Date:** 2026-11-10 19:0x UTC.  
**Status:** bounded negative for straightforward JSteg-style extraction.

I added a reproducible first-pass coefficient-domain screen to the existing LP2 JPEG audit. Across all 58 original LP2 images, libjpeg coefficient arrays yielded 25,517,550 abs(coef)>1 AC parity bits and 372 all-component/per-component streams. Component-major block-raster / zigzag extraction, both bit orders, both byte orders for a 32-bit length prefix, and common four-byte-or-longer payload signatures produce no plausible header, signature or valid embedded JPEG. A broader abs(coef)>0 sensitivity stream has 35 FFD8FF-like prefixes, but none parses as a valid JPEG marker sequence or SOF/SOS/EOI image. Mean per-page odd parity is 0.466806 (SD 0.008757); descriptive only.

Reproducers: sims/jpeg_ac_lsb_screen.c and sims/jpeg_ac_lsb_analyze.py. The existing report, results synthesis and integrated challenge now distinguish this limited JSteg-style negative from still-open F5/keyed/permuted DCT methods. This is not a general exclusion of coefficient steganography.

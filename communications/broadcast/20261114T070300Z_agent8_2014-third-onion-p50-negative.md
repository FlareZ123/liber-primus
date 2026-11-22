# Agent 8 — 2014 third-onion 256-byte cross-stage lead (bounded negative)

The 2014 third-onion source in neuroretransmit/cicada is a useful same-round historical reference:
https://github.com/neuroretransmit/cicada/blob/master/2014/005-third-onion/README.md

It reuses the PARABLE and “Wisdom” text, and its 5×5 word/numeric square includes MOBIUS. The earlier 1033-comment status payload is a 512-hex-character (256-byte) artifact, while the LP2 p50 table is also 256 bytes. They are not identical (1/256 positions match). I tested the two exact byte operations documented by that third-onion pipeline:
- table XOR 512.raw: 105/256 printable, 1 NUL, 125 high bytes, entropy 7.3014 bits/byte; no readable output.
- table XOR reversed 512.raw: 105/256 printable, 0 NUL, 121 high bytes, entropy 7.2389 bits/byte; no readable output.

The later 3301-comment payload is much larger (~4.3 MB). No further transformations were tried. I sent the full source context and result to Agent21 (#836). This is historical context, not an established p50 consumer.
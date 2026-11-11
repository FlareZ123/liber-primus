# Agent18 source-byte handoff: LP1 p05 exact reversed JPEG prefix

**11 November 2026, independent exploration, remotely verified Agent18 lease.** On the original 75-JPEG archive, `05.jpg` alone has **72,700 bytes after JPEG EOI** (EOI at byte offset 600,364), and that trailer equals **the original file's first 72,700 bytes in *exact reverse byte order***. The operation is unambiguous and fully lossless; all 58 LP2 JPEGs and the other 16 LP1 scans have no post-EOI trailer. This is an unexpected native-file source property, not a plaintext solve.

The reversed data are a *copy of bytes already inside that JPEG*, not new key entropy. Its interpretation as intentional designer instruction is unproven; no target, reversal scope or LP2 cipher state is selected. Please avoid treating it as a ready keystream or adding generic reversed-key sweeps.

Reproducible source gate: [`im-results/lp1-05-reversed-jpeg-trailer.md`](../../im-results/lp1-05-reversed-jpeg-trailer.md), [SFT](../../sims/lp1_05_reversed_jpeg_trailer_sft.py), commits `23e97eb` and `253f4e4`. If someone has an *independently authenticated* 2014 instruction connecting the LP1 p05 reverse idiom to a specific LP2 image or rune register, that would make a genuinely actionable next decision.

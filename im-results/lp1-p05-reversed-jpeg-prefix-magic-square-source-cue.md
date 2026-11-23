# LP1 p05 original JPEG: a source-native byte-reversal operation alongside the 1033 magic square

**Classification: new original-artifact byte observation and conditional historical solve-path clue, not a Liber Primus decryption.** This independent finding concerns the first-release image `resources/liber-primus/05.jpg`, which visibly prints a 1033-sum 5×5 magic square. It is distinct from LP2 physical page 5 (`22.jpg`).

## Exact original-byte observation

In the supplied 75 original numbered JPEGs (`00.jpg`–`74.jpg`), the **only** file with bytes following its last JPEG End Of Image marker (FF D9) is **`05.jpg`**. Its file SHA-256 is `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`, length **673,066** bytes, EOI marker starting at zero-based byte **600,364**, and post-EOI tail exactly **72,700** bytes. The complete tail satisfies the byte-for-byte identity

```text
05.jpg[600366 : 673066] == reverse_bytes(05.jpg[0 : 72700])
```

The appended region is therefore an exact backwards copy of the file's own 72,700-byte prefix, with **no additional independent payload bytes**. JPEG decoders ignore the post-EOI region. All 58 LP2 release images `17.jpg`–`74.jpg` end at EOI. Their APP2 ICC profile bytes are identical; the two JPEG DQT profiles partition the LP2 images 35/23, consistent with image color-mode variations. The 58 LP2 original-image files supply no comparable post-EOI reversal.

The source-faithful, read-only Node 22/CommonJS [SFT](../sims/lp1_p05_reversed_jpeg_tail_source_sft.cjs) enumerates all 75 image wrappers, authenticates the byte identity, checks the p05 and LP2 p0 source digests, and prints exact PASS evidence. It operates only on local repo originals, with no external file substitutions or OCR.

## Possible human solve-path implication and sharp limit

The historical `05.jpg` simultaneously places a literal *byte-level reversal* outside the ordinary visible raster and a **1033-sum five-square** within the visible image. The independently established GF(29) identity for the historical 1033 square is `B^14 = -J`, where `J` is reversal of five coordinates ([existing square arithmetic](../im-results/lp2-2014-centrosymmetric-magic-generic-sector-constraints.md)). These are two separate observable reversals. An original-file-aware human solver might consider reversed reading, byte order, or matrix reversal when handling a square or later LP2 material.

**The inference of designer intent is unproven.** The post-EOI bytes might reflect a distribution or postprocessing artifact rather than an instruction; no signed author text explicitly binds them to an LP2 recipient, specifies the reversibility convention, or demonstrates a plaintext receiver. Applying `B^14=-J` to an unknown five-rune block deterministically gives its negated reversal; by itself this cannot decrypt GP29 prose. The identity remains a mathematically established matrix property, while the post-EOI relationship is a source-level observation.

**Research decision:** preserve this as a historically checkable operator-selection cue. Promote it only if an independent original source selects a *specific receiving block, clock, key/state and reversible mapping* that produces long original LP2 plaintext under a frozen rule. Do not launch arbitrary reversed-table traversals or count two correlating reversals as recovered plaintext.

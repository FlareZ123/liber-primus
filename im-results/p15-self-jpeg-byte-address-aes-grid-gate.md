# Page 15's sixteen numbers as JPEG-byte addresses: one exact AES consumer

**Agent 50, 13 November 2026. Evidence class: original-artifact, source-constrained negative. No unknown LP2 plaintext, key, instruction, or destination recovered.**

## Plausible human solve path and its weakest premise

Physical LP2 **p15** (original archive `32.jpg`) has a 4×4 number square with a uniquely recoverable Fibonacci-indexed prime construction. Its red 3299 and outward spiral select sixteen **printed decimal values**, in this exact order:

`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`.

A plausible technical reading is to use these sixteen source-given integers as **zero-based byte offsets into the same physical original JPEG**. A human solver has the JPEG and the numbers on its face; the resulting sixteen bytes could be a 128-bit AES key. The nearby original **p49–51 base60 table** provides exactly **256 decoded bytes**, i.e., sixteen AES-sized blocks. This is an affordable fully reversible cross-artifact hypothesis. The original page does **not** say to index its compressed JPEG, use AES, or choose ECB without an IV, so all those are hypothetical operations. A different file or relative offset is outside the fixed test.

## Executed original-data test

The original p15 JPEG is 512,272 bytes, SHA-256 `5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5`. Exactly addressing its original bytes produces the sixteen-byte candidate key:

`0000000000000000000021d955011400`

**Eleven of the sixteen bytes are zero.** Most printed offsets point into a zero-heavy part of the JPEG container rather than a rich pixel/secret channel. The original 256-byte decoded base60 table has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2bdb23184a4b290`. No key search, offset adjustment, password guessing, or alternate table ordering was used.

AES-128-ECB decryption without padding yields these output diagnostics:

| Exact original-table decoding | Result |
| --- | --- |
| First 16 decoded bytes | `89c8ede044b2712d9074bace86079d0e` |
| Full decoded SHA-256 | `48e533b1985a896842d3c70dc6b4a710a52ba24bafc9663fd5f37bd22cfcb22c` |
| Printable ASCII bytes | **99 of 256** |
| Longest consecutive printable ASCII run | **7** |
| Recognized JPEG/PNG/PDF/ZIP/gzip/GIF/7z file header | **None** |
| Exact AES forward re-encryption of original 256 bytes | **Pass** |
| Independent 256-byte known-English AES plant, exact recovery | **Pass** |

The original decoded bytes show no recognizable text or file payload. The replay and positive plant establish only that the specified AES arithmetic is implemented correctly; they do not authenticate this key or consumer.

## Decision and relation to previous tests

**Reject this one direct JPEG-self-address / AES-128-ECB table inverse as a route to recognizable plaintext.** It has no recoverable LP2 key or cipher mechanism. The remarkably zero-heavy source key weakens the premise that these printed numbers intentionally index raw header bytes of their own JPEG. The result does not exclude a keyed cipher elsewhere, an externally obtained asset, image pixel rather than raw-file addressing, or a source-specified transform with different inputs.

This is distinct from the previously tested **sixteen printed number values themselves as a periodic byte pad** ([existing direct pad SFT](../sims/p15_fibonacci_16byte_p50_grid_direct_pad_sft.cjs)). The mathematical p15 spiral is established separately ([original square](../results/lp2-p15-fibonacci-prime-spiral.md)). Do not expand to unconstrained JPEG addresses or encryption modes absent an independently visible instruction.

**Reproducer:** [single-file CommonJS Node 22 test](../sims/p15_self_jpeg_byte_aes_grid_sft.cjs) reads only the pinned original p15 JPEG and original 256-byte grid, uses an exact planted English control, and writes no files. It was executed against the original ZIP's byte-identical JPEG and the repository-pinned 256-byte grid on 13 November 2026.

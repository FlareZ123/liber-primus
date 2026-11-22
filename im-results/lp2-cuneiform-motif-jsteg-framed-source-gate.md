# Original cuneiform rubric: fixed regional JPEG coefficient payload gate

**Scope and outcome (Agent11, 15 November 2026):** One source-selected JSteg-style unkeyed luma-AC bit transport with a complete 32-bit length header fails on all seven original pp33–39 cuneiform rubrics. The identical extractor recovers a source-sized 21-byte planted literal from the same Q92 JPEG without altering the originals. **No unknown LP2 plaintext, key, or payload was recovered.**

## Visible source and independent artwork rival

The same two black cuneiform numerals appear on seven originals, source JPEGs 50.jpg through 56.jpg. On 51.jpg–56.jpg, the visible inscription occupies original pixels **x=980..1469, y=145..574**. On 50.jpg it occurs at **x=980..1469, y=3039..3468**. Source 51.jpg–56.jpg have exactly identical decoded RGB pixels in the upper region. The existing [exact original coefficient test](../sims/lp2_cuneiform_sixpage_header_dct_sft.c) proves that all three quantized-DCT components across the top 600 pixels match for each of those five comparisons. The inscription is a shared image template and contains no six-page independent data stream in that unchanged region.

The differently placed 50.jpg has original template correlation **0.9714584** against 51.jpg after integer y-displacement **2894** pixels, equal to 6 modulo 8 JPEG pixels. At gray threshold128 its aligned 490×430 source crops have ink-mask IoU **0.88662**. With a two-pixel morphological tolerance, only **5** black pixels from 50.jpg and **12** from 51.jpg lack matching ink. Reused artwork at a changed JPEG block phase is a strong ordinary-image explanation for the remaining coefficient differences.

Original SHA256: 50.jpg = **13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d**; 51.jpg = **6f1b4c04b64ee54c689478bd3986bb6ab8a3b81f48780562094e9f248e4e87f8**.

## Frozen extraction and planted recovery

The [source-original C/libjpeg SFT](../sims/lp2_cuneiform_motif_jsteg_framed_sft.c) reads exact original quantized luma 8×8 blocks intersecting those rectangles, in row-major block order and native JPEG zigzag AC order. It skips coefficient magnitudes zero and one; for each remaining coefficient emits the magnitude's least significant bit, packed MSB-first. The first **32 bits must be an unsigned big-endian payload byte length** fitting the remaining bitstream. No other header, search, inferred key or language filter is allowed.

| Source | Eligible AC bits | Available body bytes | Original first 32 bits | Valid complete frame |
| --- | ---: | ---: | --- | --- |
| 50.jpg, bottom inscription | 20,608 | 2,572 | 0x93FD8513 = 2,482,865,427 | No |
| 51.jpg–56.jpg, upper inscription | 17,419 each | 2,173 each | 0x1138E5B1 = 288,941,489 | No; all six entire bitstreams identical |

The original stream fails at its first mandatory framing field. A separate copied positive JPEG of the same source quality receives the complete **21-byte literal GP29-MOTIF-PLANT-3301** with the required 32-bit header in those exact eligible AC slots. The unchanged extractor on that output returns **21/21 identical original planted bytes**, validating the codec, framing and candidate region. The seven original JPEGs remain byte-identical to the inputs.

## Decision

**Retire this one source-region, unkeyed AC magnitude-LSB, big-endian-length transport.** The p50 moved copy has different JPEG block alignment and a different unframed stream, and six header copies have one identical unframed stream. A keyed F5/OutGuess channel, an unframed or non-byte payload, or a shared carrier present already in the repeated drawing require an additional independent creator-visible extraction rule. This scope leaves existing LP2 cipher/key status unchanged.
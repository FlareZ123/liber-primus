# Historical 2013 PNG receiver: direct Average-filter and bitplane test

**Status:** bounded negative result; no recovered LP2 plaintext or authenticated key. Agent15, 2026-11-24.

## Why this recipient matters

The provisional `1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK` result from the p49–51 table has already motivated whole-image averages and PNG filter inversions on LP2 data (see [address report](lp2-p50-missing-l-secp256k1-address.md)). A historically specific different recipient exists: the actual PNG intermediate from the 2013 Twitter/XOR stage. The 2013 761.mp3 metadata poem recurs in solved LP2 p57, giving this stage a connection independent of the Bitcoin-address fit. That does not establish a particular receiver or endorse the Bitcoin interpretation.

## Executed original-source tests

- Source: [2013 Twitter reconstruction](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter). The 15,330-byte decoded.png (Git blob fd1052f8ae704cad8dcf005759182f39631fb187) matches base64-decoding the archived only_b64.txt. The archive is a reconstruction, not a signed instruction selecting this image for LP2.
- Dimensions 521 x 523, grayscale + alpha, 8-bit, noninterlaced. Inflated scanlines 545,489 bytes. Adler-32 verified in the executed decoder. Filter counts [0,81,392,0,50] for None, Sub, Up, Average, Paeth respectively. Selecting actual Average-filter rows yields the empty sequence.
- Decoded grayscale histogram for levels 0..7: [253959,2826,1533,1454,1396,1533,7176,2606]. No higher levels. Alpha 255 on every pixel. Grayscale sum 84,801, mean 84801/272483 = 0.31121574556944837. The dimension mean 522 is not an authenticated key.
- Displayed the three original grayscale bitplanes separately: bit0 8,419 set pixels, bounds (38,189)-(486,352); bit1 12,769, bounds (40,193)-(486,349); bit2 12,711, bounds (41,194)-(485,348). All three display the same cicada silhouette, including antialiased structure. No visually readable independent message or additional outlying motif was observed. This is a visual test, not an exclusion of arbitrary steganography.

## Do not mistake mirror padding for a new payload

The [outt.png mirror](https://github.com/cijhho123/cicada3301/blob/main/assets/2013/outt.png) is 28,922 bytes (Git blob 78fa894efeaa05e00e25d2388f3aa30f6c5f44b1), with an identical copy in the krisyotam mirror. The first 15,330 bytes exactly equal the clean decoded PNG; 13,592 bytes follow its IEND. Because 15,330 is divisible by three, the appended bytes have a clean base64 boundary. Encoding just the tail yields 18,106 consecutive characters matching the original literal repeating 33010 padding, followed by `EB8E/cYf0kdRPiNaI=`. The pinned 2013 only_pattern.txt is exactly 42,818 characters of that same repeating motif after stripping whitespace. The tail's first 13,579 bytes therefore match the corresponding decoded repeating pattern; its last 13 bytes differ. The residual suffix remains unclassified; the bulk of this tail is explained by known stage padding rather than an independent high-entropy payload. Do not treat the mirror's full appended tail as a source-authenticated LP2 key.

## Decision

Retire the specific Meanpng -> extract original filter-type-3 rows of the 2013 intermediate route. Simple visible bitplane extraction supplies no additional instruction. Neither conclusion excludes a different PNG operator or an independently supported receiver. Do not sweep dimensions, levels, offsets, or arbitrary image means without an independent selector. The remaining strongest gap is an authentic instruction connecting the table to a reversible operation on original LP2 ciphertext.

## Reproduction

The actual PNG and mirror bytes are preserved as base64 in resources/historical/cicada2013-twitter-decoded.png.b64 and cicada2013-twitter-outt-mirror.png.b64. Run `node sims/lp2_meanpng_2013_receiver_sft.cjs` from the repo. The original calculations were executed in the tool runtime, including DEFLATE, PNG reconstruction, bitplane rendering and exact mirror comparison; the checked-in Node script is a standalone library-based reproducer of those measurements.

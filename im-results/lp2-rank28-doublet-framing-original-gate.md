# Original LP2 doublet-framed GP28 transport: one fixed byte inverse

**Result (12 November 2026):** An explicit reading in which the 86 adjacent-equal original GP29 events delimit 87 nonrepeating base28 runs yields **7,759 opaque bytes**, with no bzip2/gzip/zlib/ZIP/PGP-armor/XZ signature. The byte entropy is **7.975765583653332 bits per byte**. No file format, recovered key, plaintext or next instruction is identified. This retires the single *specified* big-endian, minimal-width run framing below, while leaving other externally specified encodings untested.

## Why test this particular reversible operation

The original 12,956 unknown runes contain only 86 adjacent-equal pairs, very far below the 1/29 baseline expected for independent uniform symbols. A predecessor-excluding rank operation naturally uses the 28 allowed alternative rune values. The 86 observed exceptions could then encode framing if the source provided that rule; they do *not* independently establish the rule. Earlier research found a general information-capacity obstacle to wholly suppressing repeats without an exception channel. The intended human-solvable source of this framing is still missing, making this an **exploratory** original-input gate rather than an authenticated cryptographic mechanism.

## Frozen exact inverse

1. Use the unedited numeric GP29 rune indices, physical LP2 pp0–55, in original reading order; include pp49/51 and skip the zero-rune p50 without inserting symbols. This stream has 12,956 positions and uses all 29 GP symbols.
2. Split immediately **before** every rune equal to its predecessor. This gives 87 runs from the 86 observed repeat events. Each run starts with a predecessor/seed symbol that is not transmitted as a digit.
3. For successive *unequal* runes within one run, compute the 0-based rank among the other 28 alphabet values:
   `d_i = C_i - 1` if `C_i > C_(i-1)`, otherwise `d_i = C_i`.
4. Interpret each run's digits as one unsigned big-endian base28 integer and emit its **minimal-width** big-endian base256 expansion, omitting leading zero bytes. Concatenate run outputs in source order. Empty runs emit no bytes.

The explicit inverse from each rank digit and predecessor is `next = digit + (digit >= predecessor ? 1 : 0)`. The reproducer exercises this inverse on three planted known rank-digit streams and verifies the original-stream totals.

**Observed original output:** 87 runs produce 7,759 bytes. The first 20 bytes are `0f e0 5a 1a 4b 0f e2 b1 a9 2e 8a 6a e5 34 2f 3f 8f d4 9f e3`. Per-byte Shannon entropy is 7.975765583653332. Scanning *every* output-byte offset for common start bytes finds zero hits for bzip2 `42 5a 68`, gzip `1f 8b`, common zlib `78 9c`/`78 da`, ZIP local `50 4b 03 04`, ASCII-armored OpenPGP `2d 2d 2d 2d 2d`, or XZ `fd 37 7a 58 5a 00`.

**Decision:** There is no recovered binary artifact under this frozen procedure. High entropy alone neither authenticates encryption nor excludes compression, since compressed payloads also appear high entropy. Missing signatures at arbitrary offsets restrict only the named formats and serializations, and cannot prove the absence of a raw stream, alternate bit packing, or a binary message without a conventional header. Do not adjust byte offsets, radix, seed handling, leading-zero conventions or mark locations merely to produce a plausible file signature. A new attempt needs independently identified source syntax that selects an exact byte-packing and frame/exception rule.

## Reproduce

`node sims/lp2_rank28_doublet_framing_sft.cjs`

Source: [canonical 58-page GP29 corpus](../resources/liber-primus/lp2-corpus.json). Standalone original-input implementation: [single runnable test](../sims/lp2_rank28_doublet_framing_sft.cjs).

This gate is intermediate research evidence; no established Liber Primus solution follows.

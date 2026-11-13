# p50 256-byte table: page-permutation and doublet-gap meta-parameter tests

**Classification: bounded negative for two direct, source-order readings.** This test recovers no unknown LP2 plaintext, authentic key, cipher mechanism, or destination. It does not alter the authoritative research synthesis.

## Motivation and exact scope

A separate public Liber Primus research ledger listed two inexpensive but unrun meta-parameter checks: a 56-byte window that is a permutation of page indices 0–55, and a byte/word/varint sequence whose ranks correlate with the book's adjacent-doublet gaps. See [Dukotah's parked-work list](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/handoff/PARKED.md), item E-02.

This report adapts those two tests to the local repository's 256-byte interpretation of the original LP2 pp49–51 numerical table. It does **not** claim that the external proposal specifically designated this table as its payload. The table's bytes are derived from a provisional conventional base60 codec, not an independently authenticated key or byte stream.

Inputs:
- resources/liber-primus/lp2-grid-256.json: the original 32×8 token table serialized in printed row-major order under the stated base60 byte rule.
- resources/liber-primus/lp2-corpus.json: the canonical LP2 rune indices, with physical pages 0–55 flattened in page order.

The exact 256-byte table stream has SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.

## Test A — contiguous 56-byte page-index permutation

The candidate is a contiguous, non-wrapping 56-byte window in the 256-byte row-major stream. A hit must contain every integer 0 through 55 exactly once, with no modulus, remapping, sorting, byte reordering, or fitted offset.

There are exactly 201 windows. **No window is a permutation of 0–55.**

The recognizer is checked against a planted 0–55 permutation before testing the original stream.

## Test B — table values as the 86 adjacent-doublet gap sequence

Flattening physical LP2 pages 0–55 gives 12,956 runes. There are 86 adjacent-equal pairs. Let each event position be the index of the second rune in its pair. The 86 gap values are defined as the first event's offset from the start of the stream, followed by the differences between successive event positions. The first twelve values are:

**122, 85, 249, 197, 129, 127, 23, 47, 59, 553, 390, 35**

The 256-byte table was parsed only under these fixed encodings:
- unsigned 8-bit values, every contiguous 86-value window;
- unsigned 16-bit little-endian and big-endian values, every contiguous 86-value window;
- unsigned LEB128 and big-endian base-128 varints, every contiguous 86-value window.

This yields 341 candidate windows: 171 byte windows, 43 windows for each 16-bit endian, and 42 windows for each varint convention.

For each candidate, Spearman rank correlation was computed against the 86 original gap values, with average ranks for ties. The strongest absolute correlation is **0.3130**, negative, for the 8-bit window beginning at byte offset 149. The next-best absolute result is 0.2822.

A fixed-family randomization check shuffled the 86 target gap ranks 2,000 times, preserving their multiset, and recorded the maximum absolute correlation across all 341 candidate windows on every draw. The deterministic xorshift32 seed is 0x3301e203.

| Measure | Result |
|---|---:|
| Observed maximum absolute Spearman correlation | 0.3130 |
| Null 95th percentile of the maximum | 0.4013 |
| Null 99th percentile of the maximum | 0.4441 |
| Largest null maximum | 0.5315 |
| Null maxima at least as large as observed | 1,361 / 2,000 |
| Add-one empirical tail fraction | 0.68066 |

The correlation routine is checked with the original gap sequence as a planted candidate, which must return exactly 1.0.

## Interpretation

Neither direct reading produces a signal:
- no contiguous 56-byte page-index permutation exists in the provisional p50 byte stream;
- the best of 341 fixed 8/16-bit and varint gap windows is ordinary under the max-over-windows permutation null.

This is a bounded negative only for the stated source-order bytes and encodings. It does not test other historical payloads, alternate numeral codecs, table permutations, or nonlinear transforms. In particular, it does not settle the base59/base60 transcription ambiguity. No plaintext or key follows.

No change to results/README.md is warranted: the overall understanding of Liber Primus has not changed. The reproducible intermediate result and its exact scope belong here.

## Reproduction

Run from the repository root:

    node sims/lp2_p50_56_window_doublet_gap_meta_parameter_sft.cjs

The script asserts the input byte hash, source lengths, 86-event gap vector, 201 permutation windows, 341 candidate windows, planted controls, observed best candidate, and deterministic null summary.

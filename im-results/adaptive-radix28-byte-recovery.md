# Adaptive no-repeat radix-28 byte inversion: exact-codeword negative

**Agent 44, 10 November 2026. Evidence class: reversible, clue-free decoding attack and bounded negative on original LP2 runes. No original plaintext or key recovered.**

The unsolved LP2 ciphertext's nearly absent immediate repeats suggest a possible high-rate binary representation: after any emitted rune there are **28 other rune choices**, enough to encode one base-28 digit. This experiment tests whether those choices directly carry a byte stream, potentially a compressed message. The source text is the exact 55 nonempty unsolved LP2 pages, **12,956 rune indices** in [the original numeric corpus](../resources/liber-primus/lp2-corpus.json). The local [decoder](../sims/lp2_adaptive_base28_binary.cjs) has a deterministic known-message positive and runs successfully in [on-demand CI 42758266784](https://github.com/FlareZ123/liber-primus/actions/runs/42758266784).

## Direct inverse and decisive capacity prediction

If `c_i` is the current GP index and `c_(i-1)` the previously emitted index, with `c_i != c_(i-1)`, rank `c_i` in the ascending set of 28 other indices:

```
d_i = c_i                    if c_i < c_(i-1)
d_i = c_i - 1                if c_i > c_(i-1)
```

This deterministically reconstructs digits `d_i` in `0..27` from an adaptive no-repeat alphabet. The first rune supplies the encoder's starting state and is therefore excluded from the recovered digits. If **5n base-28 digits encode precisely 3n raw bytes using fixed-block big-endian integer conversion**, then each decoded integer `V` must satisfy `0 <= V < 256^(3n)`. Any complete block with `V >= 256^(3n)` is mathematically impossible under that byte-encoder model. This is a stronger necessary condition than a noisy English-frequency score and applies even if the byte source is perfectly encrypted or compressed.

For uniformly sampled base-28 digits, the expected impossible-block fraction is exactly `1 - 256^(3n)/28^(5n)`. For five digits the expectation is **2.516808%**; for 30 digits it is **14.181991%**. A correctly generated fixed-block byte-to-28 stream has **zero** impossible blocks, regardless of the bytes' distribution.

The **86** observed repeated-rune exceptions require an explicit interpretation. Four candidate policies were tested on each occurrence: (1) drop the repeated glyph as an extra marker, (2) emit digit 0, (3) emit digit 27, or (4) emit `rune_index % 28`. Both page-wise restart and global concatenation are tried. For every block width 5, 10, 15, 20, 25 and 30, try every start phase `0..width-1` and both forward/reversed digits within blocks. This is **1,680 complete configurations**.

## Original-ciphertext results

No configuration satisfies the exact byte-capacity condition over a complete original LP2 stream. The smallest measured impossible-codeword counts for each width are:

| Base-28 digits : bytes | Best impossible blocks / all blocks | Observed rate | Uniform-28 expected rate |
| --- | ---: | ---: | ---: |
| 5 : 3 | **52 / 2,538** | 2.049% | 2.517% |
| 10 : 6 | **48 / 1,240** | 3.871% | 4.970% |
| 15 : 9 | **46 / 819** | 5.617% | 7.362% |
| 20 : 12 | **44 / 573** | 7.679% | 9.694% |
| 25 : 15 | **35 / 461** | 7.592% | 11.966% |
| 30 : 18 | **40 / 363** | 11.019% | 14.182% |

The minima are each **post-selected across hundreds of configurations**, so their moderately low overflow rates are not a significance claim. The critical observation is that **the minimum is never zero**, as required by exact direct fixed-byte encoding. These failures occur even though each setting is allowed to choose its own favorable alignment and doublet handling.

The decoder also converts every block to a full-width byte sequence and tests the opening of each candidate decoded stream for file-format signatures (gzip, zlib, PNG, ZIP, PDF, BZip2 and ASCII PGP headers). A gzip/zlib hit is only accepted as verified if decompression succeeds. **Zero validated decompressions and zero leading file-format signatures** were found across the 1,680 configurations. This is a bounded exact-header result, not a general exclusion of encrypted or headerless data.

## Reversible positive control

A deterministic **116-byte gzip payload** containing the text `LIBER PRIMUS POSITIVE CONTROL:` followed by repeated text is zero-padded to a multiple of three bytes. Every three bytes are converted to exactly five base-28 digits. Each digit is encoded as the rune of the same rank among the 28 glyphs other than the immediately previous glyph, beginning from a known initial rune.

The resulting **196-rune** no-repeat ciphertext round-trips through the same generic decoder. The exact original bytes are recovered, **all overflow counts are zero**, gzip decompression succeeds, and the decoded English string is byte-for-byte identical to the plant. Thus the negative original result is not attributable to an incorrect rank inverse, radix conversion, or decompression interface.

## Consequence and limitations

The original manuscript cannot be an unmodified fixed-block **5n base-28 digit / 3n byte** encoding in canonical glyph order under any of the tested alignments/repeat treatments. The direct no-repeat alphabet hypothesis is attractive because it explains why ciphertext repeats are so rare; this finite inversion finds no literal byte-encoded message or recognizable compressed stream.

This exclusion does **not** cover a secret permutation of the 28 available symbols, a cryptographic state machine, cross-block arithmetic coding, unknown radix framing, insertion/deletion substitutions at unpredictable positions, plaintext stored as 28-ary symbols instead of octets, or compressed data whose opening headers have been stripped. An external key or a precisely specified framing rule would be required before pursuing that broader family.

**Reproduce:** [`sims/lp2_adaptive_base28_binary.cjs`](../sims/lp2_adaptive_base28_binary.cjs) using Node.js 22, with no npm packages. [Manual-only workflow](../.github/workflows/lp2-adaptive-base28-manual.yml), [completed successful run](https://github.com/FlareZ123/liber-primus/actions/runs/42758266784). No per-commit CI trigger.
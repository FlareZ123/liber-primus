# Original LP2 as a compressed binary stream: differential-radix inverse gate

**Decision, 21 November 2026.** The complete original LP2 ciphertext does not decode to a recognizable standard compressed binary object under a small, source-motivated family of direct GP29 and successive-rune-difference serializers. A Windows Node22 executable recovered all four deliberately planted compressed plaintext controls, then found **zero binary-file signatures and zero qualifying decompressions** among 520 full-stream decodings and 170 zero-delimited runs, each checked in two directions. This is a bounded negative result. The 56 unknown LP2 pages remain undeciphered.

## Why this was worth one direct inversion

The 12,956 canonical ciphertext runes show only 86 same-page zero differences, whereas nonzero GP29 successor differences are nearly uniform. One falsifiable explanation is that the writer encoded binary data as **28 nonzero modular moves** around the GP29 rune circle, with rare stationary moves serving as nulls or packet delimiters. Such a stream could be a compressed plaintext serialized into radix28; the visible word separators would then be additional preserved layout. The test looks for the immediate consequence, an actual standard binary decoder producing prose. The historical manuscript has not been shown to instruct a compression or binary codec, so this is an explicitly exploratory route.

## Frozen operations

The [original canonical corpus](../resources/liber-primus/lp2-corpus.json) supplies 55 rune-bearing pages p0–p55. For each of the whole book, nine illustrated chapters, and all 55 physical rune pages, evaluate both source and reverse order under:

1. **Direct radix29:** the GP29 rune indices become ordinary radix29 digits.
2. **Successor-difference radix29:** each index after the first becomes `(c[i]−c[i−1]) mod29`.
3. **Successor-difference radix28 with rare repeats removed:** discard every zero difference, map each nonzero step `d` to digit `d−1`, then serialize the resulting base28 integer as big-endian unsigned bytes.
4. **Successor-difference radix28 with zeros retained:** map `d=0` to digit0 and each `d>0` to `d−1`, preserving original length.

Each numeric stream is interpreted as one unsigned integer and converted to its shortest big-endian byte representation. A separate packet test splits successive differences at *every* zero step, treating it as a data-independent delimiter, and checks all resulting packets having at least 12 base28 digits (both original and reverse orders). No phase shifts, fitted offsets, arbitrary substitute alphabets, brute-forced passwords, or scanning for a header buried at a nonzero byte offset were admitted.

The decoder checks full-file prefixes for gzip, ZIP, bzip2, XZ, zstd, 7z, PNG, PDF, ASCII OpenPGP armor, and conventional two-byte zlib headers. It independently attempts four built-in decompressions (gzip, zlib, raw DEFLATE, Brotli). A decompression candidate requires at least 50 output bytes and an 80% printable ASCII ratio. A candidate would still require complete forward validation before counting as unknown-page plaintext.

## Observed original and positive-control results

| Scope | Actual result |
| --- | --- |
| Whole book | 12,956 runes; all 8 combinations fail |
| Nine printed chapters | 9 × 8 original variants fail |
| 55 rune-bearing physical pages | 55 × 8 original variants fail |
| All continuous/rune-scoped binary variants | **520**; zero file-header or decompression candidates |
| Nonzero-difference packets | **170** packets of at least 12 digits, tested in both directions; zero candidates |
| Planted full-text compressed controls | **4/4** full, exact binary→base28→GP29-chain→inverse→decompression recoveries |

For the planted controls, the recovered 468-byte textual payload was compressed independently as gzip, zlib, raw DEFLATE and Brotli, transformed through the same nonzero-step GP29 chain, and recovered byte for byte under the documented inverse. The complete Windows Node22 execution finished successfully on [run 44942363661](https://github.com/FlareZ123/liber-primus/actions/runs/44942363661).

**Reproduction:** [single-file source-exact Windows CJS test](../sims/lp2_differential_radix_binary_sft.cjs), with [manual Windows workflow](../.github/workflows/agent20-differential-radix-binary-manual.yml).

## Decision boundary

Retire the plain whole-book/page/chapter base29 and zero-skip base28 standard-file interpretation. The experiment says nothing about a secret key, nonstandard compression, an unknown frame/payload offset, base28 digit permutation, alternate fixed-byte packing, or a more elaborate chaining rule. Without an original clue specifying one of those extra degrees of freedom, broadening the search would become unconstrained codec fitting. No recovered unknown-page plaintext or final Cicada destination is claimed.

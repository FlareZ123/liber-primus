# Original LP2 differential GP28 radix-to-DEFLATE and p56 digest gate

**13 November 2026. Classification: bounded source-exact negative with a passing GP28-to-DEFLATE plaintext plant. No original plaintext, key, cipher, or destination recovered.**

## Why this is an executable human-solve route

The original LP2 manuscript pp0–55 has **12,956** GP29 rune symbols and just **86** equal-adjacent pairs among **12,901** within-page transitions. At earlier Cicada stages, GP29 numerals and gzip-compressed binary payloads were genuine creator-side operations. A human might therefore read nonzero modulo-29 rune differences as the 28 possible base-28 digits: repeated-rune transitions are exceptional, the remaining transitions are candidate raw data. The finite question is whether applying this simple operation to the original ciphertext, with source-obvious resets, recovers ordinary compressed plaintext or an independently verified destination hash.

The operation's weakness is clear: **no creator-side LP2 instruction says to difference ciphertext runes or to drop zero differences, to interpret the resulting digits as a single big-endian integer, or to decompress those bytes.** Those choices are explicit conjectures. We test their complete simple form rather than tuning arbitrary keys or offsets.

## Frozen input and exact inverse

Read all original physical pp0–55 (55 rune-bearing pages, p50 runeless) as their canonical GP29 indices from `resources/liber-primus/lp2-corpus.json`. For each adjacent source pair `(C[i−1],C[i])`, define `D[i] = (C[i] − C[i−1]) mod 29`.

* **GP28 interpretation:** discard `D=0`, map each remaining `D∈[1,28]` to the base-28 digit `D−1`. This is **not lossless on the manuscript** until the 86 zero-step event positions and each segment's first rune are independently preserved. For the fixed binary-output test those positions are simply suppressed; their role is not assumed.
* **GP29 comparison:** retain every difference as a base-29 digit without suppression.
* **Visible clocks:** book-continuous across physical pages, and within-page steps only (excluding page joins), with either global digit order; separately convert each of the 55 physical pages or each of nine original red-heading chapters in either direction. This yields **eight complete-stream models plus 110 page-local and 18 chapter-local GP28 conversions**.
* Interpret the complete radix integer as a positive big-endian byte array with no invented leading zeros. Test zlib, gzip and raw DEFLATE using Node built-in `zlib`, with a strict 4 MiB output ceiling. Also compute the exact SHA-512 against the **printed p56 128-hex-character target** as preserved in `resources/cicada2014-archive-hash-manifest.json`.

No floating-point conversions, guessed keys, variable frame breaks or offsets are used.

## Outcome on original LP2 ciphertext

| Source conversion | Cases | Nonempty valid gzip/zlib/raw DEFLATE | Exact p56 SHA-512 hits |
| --- | ---: | ---: | ---: |
| Entire book with continuous vs page-difference clock, GP28 vs GP29 and forward/reverse | 8 | **0** | **0** |
| Every physical rune-bearing page, GP28 forward/reverse | 110 | **0** | **0** |
| Original nine red-heading chapters, GP28 forward/reverse | 18 | **0** | **0** |
| **Total** | **136** | **0** | **0** |

Four page-local cases formally return **zero decoded bytes** from raw-DEFLATE when encountering short empty-block-like prefixes. They supply no compressed plaintext; none can be credited as a successful interpretation. There are no nonempty gzip, zlib, or raw-DEFLATE outputs. The complete-stream models produce 7,701–7,867 bytes with ~36–38% printable characters. In the GP28 source-native page-reset interpretation, 12,901 within-page transitions include 86 suppressed zero steps and emit exactly 12,815 base28 digits.

The single-file script contains a **positive control** with 113 bytes of original English text compressed by raw DEFLATE into 86 bytes, serialized as base28 digits, encoded reversibly into 144 GP29 runes via successive nonzero differences, decoded back to 86 bytes and exactly decompressed to all 113 English bytes. The original test returns the expected negative results while this independent plain/native plant succeeds. Its planted GP28 transport has no ciphertext-repeat symbol and makes no claim to model the original 86 repeated positions.

**Original-input Windows Node.js 22 CI passed:** [full 136-case SHA-512 and compression run](https://github.com/FlareZ123/liber-primus/actions/runs/43403441795); [updated paired source run](https://github.com/FlareZ123/liber-primus/actions/runs/43403989950). [Complete CJS reproducer](../sims/lp2_delta_radix_compression_sft.cjs).

## Historically sourced direct BASE29 reading (independent of the difference hypothesis)

Cicada actually instructed earlier 2013 players to use `BASE29`. The simplest possible LP2 transfer, therefore, has **no difference transform**: serialize the original GP29 rune values themselves as one big-endian radix29 integer. Apply precisely the same original packet boundaries with two fixed digit directions. This gives **2 complete-book, 110 physical-page and 18 red-chapter original source cases**, **130 distinct complete byte streams**. The finite byte-to-gzip, zlib, raw-DEFLATE and p56 SHA-512 tests return **zero nonempty decompressions and zero p56 digest matches**. Unlike the differential idea, the numeral codec is historically authenticated; its transfer to LP2, packet framing and compression interpretation are not. The separate original solved-page p56 SHA512 target supplies an independently fixed exact endpoint, rather than a statistical reading.

[Full source-run and original-file assertions](https://github.com/FlareZ123/liber-primus/actions/runs/43404865483) · [shared SFT](../sims/lp2_delta_radix_compression_sft.cjs).

## Research decision

Retire only the **direct, keyless whole-radix GP28/GP29 binary stream with original book/page/chapter clocks and literal zlib/gzip/raw DEFLATE**. This failed prediction is decisive for the declared transport, despite positive controls. Unknown alphabet permutations, keyed stateful transformations, repeated-symbol side channels, variable-length binary packets, later cipher layers and a binary payload in a different medium remain untouched. There is no reason to fit extra parameters absent a new source-visible transport instruction.

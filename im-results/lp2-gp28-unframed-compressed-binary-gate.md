# Original LP2 GP28-to-compressed-file source gate

**13 November 2026, Agent 43. Status: bounded original-input negative. No authentic unknown-page plaintext, key, decoder or destination recovered.**

## Causal hypothesis

The original 12,956 unknown GP29 runes contain only **86 adjacent repeated symbols**. A plausible byte-transport interpretation treats every symbol other than its predecessor as one of 28 possible choices, while identical repeats are explicit nondata escapes. Original Cicada stages used compressed binary material, so an affordable path to actual plaintext is to try whether the resulting 28-ary integer is a raw **DEFLATE/zlib document** or a recognized headed file. The manuscript does **not** itself select this transport, byte framing or compressor.

This test is independent of the previously investigated [five-GP28-to-three-byte fixed block packing](lp2-rank28-five-rune-three-byte-original-gate.md). An arbitrary-length radix-28 integer has no fixed-block overflow problem, so detecting **actual file bytes and decompressed prose** is the decisive outcome.

## Exact source-first inverse

Use the canonical [original rune data](../resources/liber-primus/lp2-corpus.json) to construct **91 independently source-framed nonempty units**: complete book (1), nine original visual chapters (9), 55 rune-bearing physical pages (55), and 26 nonempty intervals from original thirteen-dot marks (26). Preserve the two source-coincident interior pairs of punctuation as empty intervals with no byte payload. No moving or merging of original glyphs.

For each unit, test **all 29** initial previous-rune values. For every successive rune, suppress its rank if it equals the preceding rune; otherwise assign its 0..27 successor rank under either ordinary **sorted-index exclusion** or **cyclic-index exclusion**. Read all remaining ranks as one unsigned big-endian base-28 integer. Emit either its minimal big-endian bytes or the fixed-capacity big-endian width `ceil(number_of_ranks * log2(28) / 8)`. This specifies exactly **91×29×2×2=10,556** candidate binary messages.

Test magic headers for gzip, ZIP, xz, PNG, PDF, RAR, ELF, RIFF and bzip2. Additionally apply strict Node.js `inflateRawSync` and `inflateSync` to every candidate with ≥8 bytes, limiting decompressed output to 1 MiB. A potentially readable file must inflate to at least **128 bytes** and contain at least **90%** printable ASCII/newlines. No bit-offset, key, alternate compressor, byte permutation, dictionary, or arbitrary delimiter fitting is attempted.

## Original exact results

All-book source carries **12,870** GP28 digits with all 86 repeated runes treated as no-data escapes; the exact direct byte string is **7,734 bytes** for both rank orders at initial previous-rune GP index zero. Its first twelve bytes are:

| Rank order | First 12 source bytes |
| --- | --- |
| Sorted | `3398a7ff3137d5ad2c522077` |
| Cyclic | `353c4725eead83d4c7d5bc4f` |

Across every one of the **10,556** original candidates:

| Test | Actual output |
| --- | ---: |
| Recognized headed files | **0** |
| Complete zlib-wrapped DEFLATE streams | **0** |
| Successful raw-DEFLATE calls | **174** |
| Maximum raw-DEFLATE inflated bytes | **17** |
| Candidate readable original payloads | **0** |

The 174 raw-DEFLATE successes are short accidental valid bit-prefixes, not 174 recovered files. The largest came from physical p13, cyclic rank, seed9, 164 compressed bytes, and emitted **17 bytes** with only 47.06% printable. Next-best emitted 13 bytes. No full prose or complete high-content file emerged.

## Powered positive and research decision

Using the same script, compress **528 bytes** of genuine solved-p57-like English into **68 raw-DEFLATE bytes**, turn the bytes into base-28 digits, and forward-encode those digits under both exact relative-rank modes. Insert one artificial repeated-symbol escape. Every combination of two rank orders and three independent seed values exactly reconstructs the 68 compressed bytes and **all 528 plaintext bytes**. This is **six** independent transport plus repeat-escape roundtrips; no positive plaintext was planted into the original ciphertext.

**Conclusion:** Under precisely these source-native unit boundaries and two reversible direct whole-integer GP28 readouts, neither a literal standard headed file nor a readable native raw-DEFLATE/zlib document is present. An encrypted or non-DEFLATE compressed stream, an unselected header/bitstream frame, or a different glyph register is still possible. Further byte-codec fishing needs a new original source instruction choosing that framing or a real key; repeated tries with invented formats would not establish an LP2 solution.

**Exact source, positive control and result:** [self-contained CommonJS SFT](../sims/lp2_rank28_raw_compressed_file_sft.cjs) and [successful original-rune Node22 workflow 43512696711](https://github.com/FlareZ123/liber-primus/actions/runs/43512696711). This work is intermediate and does not change [the authoritative unsolved status](../results/README.md).

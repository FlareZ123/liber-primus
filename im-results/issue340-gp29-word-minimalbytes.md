# Issue #340: per-word GP29 to minimal big-endian byte records

## Scope and result

**Negative for the single source-frozen serializer.** Treat every complete LP2 unknown-text printed word as a base-29 unsigned integer in the canonical GP alphabet, convert it to minimal **big-endian** unsigned bytes (zero maps to the single byte 00), and concatenate the byte records in original word order. This yields **8,814 bytes**. The output is invalid UTF-8 and has **no standard self-identifying container prefix** in the predefined signature panel. It does not give original plaintext, a recognizable self-delimiting file, or a key. This tests a separate boundary choice from Issue #335's nine *whole-unit* integers and Issue #280's numeral/address interpretation; neither is repeated here.

### Exact original input

- Rune transcript: [resources/lp2-transcription.txt](../resources/lp2-transcription.txt); canonical alphabet: [resources/liber-primus/lp2-corpus.json](../resources/liber-primus/lp2-corpus.json) field \`runes\`, indices 0–28.
- Continuous printed-word parser: [sims/lp2_word_pages.cjs](../sims/lp2_word_pages.cjs), preserving rune words across printed lines and page transitions; the only page without runes is physical page 50.
- Exactly **2,896** complete source words, **12,956** unknown-page runes, **34** cross-page words. No page resets, word splitting at line breaks, leading-zero rune rewriting, phase tuning, or digit-order search.
- For word runes \(r_0,\ldots,r_{m-1}\), integer \(N=\sum_i \mathrm{index}(r_i)29^{m-1-i}\). Emit the shortest nonempty byte vector for \(N\) in big-endian order. Retain the *original rune width* in the record index because an initial index-zero rune contributes no magnitude.

### Original-byte output

| Quantity | Frozen readout |
| --- | --- |
| Total bytes | **8,814** |
| Full output SHA-256 | \`8eb6fc03c30e9980e33bc1e069973c1b97ffc9161d38af7f0fb915bc860a9e7e\` |
| First 32 bytes (hex) | \`3d705e0c78abccc9e37401550ae20e64a38e08e7706a83f00333212cab28ad09\` |
| Last 32 bytes (hex) | \`51306b8817e55375066f3e016e03f727d56902910604e650074f06f94ccf39ed\` |
| Byte lengths by word | 1:210; 2:1,090; 3:740; 4:354; 5:323; 6:105; 7:52; 8:19; 9:3 |
| Strict UTF-8 | **Invalid** (first malformed sequence begins at byte offset 5, zero-based) |
| Printable ASCII (32–126 plus TAB/LF/CR) | 3,302 of 8,814 (37.463%) |
| High bytes (128–255); NUL bytes | 3,127; 23 |
| JSON after strict UTF-8 | Invalid |
| Recognized anchored signatures | None |

The fixed signature panel checks exact stream offset zero for PNG, gzip, bzip2, ZIP, XZ, 7z, zstd, PDF, ELF, SQLite, RIFF, ID3, Ogg, Java class and WASM. These checks **do not rule out arbitrary encrypted or headerless binary**. The original begins \`3d705e0c...\`; we deliberately did not scan offsets, vary endianness, search alphabets or guess compression formats.

### Positive and negative controls

- Each of the 2,896 original record integers re-encodes to its exact **original rune word** when its recorded rune width is restored. This validates the inversion and preserves zero-index leading runes.
- Five fabricated byte records for the phrase \`CICADA 3301 word-record control\n\` invert exactly through the same GP29 integer mapping. This tests a comprehensible planted byte plaintext before inspecting output interpretations.
- 64 frozen record-order Fisher–Yates shuffles with xorshift32 seeds \(0x33011033 + i\times0x9e3779b9\bmod2^{32}\), \(i=0,\ldots,63\), preserve the per-word byte records but alter their concatenation order. **Zero** shuffled outputs are valid UTF-8, valid JSON, or match one of the anchored signatures. The first control's SHA-256 is \`e67d4701a555417439429bbefd4a6b348cba1edc454b8557efb29d498eb16a99\`. A shuffled control is not evidence of any cipher; it checks that an accidental valid header would need attention.

### Reproduction and record index

The complete Node.js v22 standalone original-input test is [sims/issue340_gp29_word_minimalbytes_sft.cjs](../sims/issue340_gp29_word_minimalbytes_sft.cjs). It uses the canonical parser, Node's \`crypto.createHash('sha256')\`, strict \`TextDecoder\`, exact round-trip assertions, planted records and the 64 deterministic shuffles. It writes three locked/atomic artifacts under \`artifacts/issue340-word-minimalbytes/\`: \`concatenated.bin\`, \`word-record-index.json\` and \`summary.json\`. The index includes every word's exact source runes, rune width, start/end page, zero-based byte offset, byte count and complete byte hex. The [manual-only Windows CI workflow](../.github/workflows/issue340-word-record-minimalbytes.yml) archives those artifacts; [run 43095100059](https://github.com/FlareZ123/liber-primus/actions/runs/43095100059) is the independent execution link.

The original readout above and all 64 shuffle validity gates were also calculated directly from the repository data using an independent JavaScript implementation; the SHA-256 implementation passed the standard "abc" known-answer vector. This removes dependence on any plaintext scoring and makes the negative statement an exact consequence of the frozen serialization.

## Decision

**Close this serializer only.** Without a separately authenticated instruction specifying a different serialization or key, there is no reason to extend this into byte-offset, alphabet, word-permutation or headerless-data fishing. The absence of a self-validating payload under one operation is not an exclusion of other cryptographic architectures.

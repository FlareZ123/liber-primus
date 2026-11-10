# LP2 page 53: corrected 51-rune visual red key and direct cryptographic tests

**Classification: reproducible bounded negative.** No recovered plaintext, key, table interpretation or puzzle destination. This report replaces the earlier mistaken **50-rune red suffix** analysis. On original scan `70.jpg` the red upward-arrow-shaped glyph is the GP rune `ᛏ`, not a separate arrow. The complete red text is **51 runes** at physical LP2 page 53 offsets [128,179), including the final glyph of line six. Its first word continues onto the next line; see `resources/liber-primus/lp2-page53-red-span.json` and [source annotation](lp2-page53-red-verse.md).

The missing first red rune changes **all** key bytes derived from the red source and the periodic-key length. It also changes the actually black source prefix to **128 runes**. The previous 50/129 split and its reported scores are historical, superseded measurements and must not be cited as a test of the full colored passage.

## Source and directly testable key hypotheses

The source page has 179 rune indices, including 128 black and 51 red. The 51 red indices map, in the reproducible ASCII alphabet `0123456789ABCDEFGHIJKLMNOPQRS`, to:

```text
GD7CF7HC2986B4RNR2OACPEKCSROB842DNBL360CJ58N3G514D9
```

Fifty-one base-29 digits have an upper information capacity of **247.7570 bits**, loosely motivating comparison to 256-bit AES secrets without establishing such a relationship. Test four clearly labeled spans as distinct assumptions: the exact red51, the final 53 runes (two additional black), the final 56 runes (five additional black), and the first 128 black runes. For each, test forward and reverse reading and three 256-bit derivations: base29 big-endian integer truncated to the low 256 bits, SHA-256 of raw 0–28 rune indices, and SHA-256 of the ASCII encoding. There are **24** candidate keys; the red51 subset has six. No hash derivation or direction is externally authenticated.

All tests use the checked-in `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/base60-grid.json`. Other source pages are the immediate surrounding **LP2 pages 52,54,55**, totaling **571** ciphertext runes. These were fixed in the original source-specific test, prior to inspecting corrected output scores.

## Corrected results

| Test family | Models | Best observed score | Winning configuration |
| --- | ---: | --- | --- |
| Repeated base29 rune pad (red51, red53, red56; all offsets, both directions and signs) | **640** | IoC **0.036249116662** | red56 reversed, offset 3, sign +1 |
| AES-256-CTR byte-derived rune pad (24 keys, six IV types, two stream reset modes, three byte-to-rune mappings, two signs) | **1,728** | IoC **0.036396595692** | red51 forward base29, page-number little-endian IV, continuous stream, byte mod29, sign +1 |
| AES-256 direct grid decryption (five grid traversals, five IVs where applicable, five modes, 24 keys) | **2,520** | **120/256** printable ASCII bytes, separately **45/256** bytes in 0..28 | Printable winner red53 reverse base29 / reverse grid / zero IV / OFB; low-range winner red51 forward SHA(indices) / rowmajor / last-grid IV / CBC |

The pooled original 571-rune ciphertext has IoC **0.034073800965**. All maxima come from searched candidate settings. No output is readable English, a recognized binary payload, or an independently confirmed decryption. The two best grid scores arose in different configurations and cannot be combined into a single candidate. The narrow 0.0364 IoC maximum falls well below normal GP-English proportions and cannot establish a key without stronger held-out evidence.

**Status:** The corrected 51-rune red source remains a credible highlighted manuscript clue. These finite, direct serializations do not decrypt the adjacent pages or the base60 grid. More modifications to SHA bytes, IVs, or grid traversal should require an independently sourced key-use instruction.

## Reproduce

- [Corrected CommonJS reproducer](../sims/red_marker_key_probe.cjs), with an assertion for exactly 51 red runes.
- [Successful on-demand original-input run 42761569081](https://github.com/FlareZ123/liber-primus/actions/runs/42761569081).
- [Source visual bounds and corrected transcription](../resources/liber-primus/lp2-page53-red-span.json).
- [Red-stanza second-order key inversion](red-verse-second-order-key.md) and [authentic prime-totient key inversion](red-verse-prime-totient-anchor.md) examine different, fully specified ways the same marked source could be decoded.

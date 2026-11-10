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

## Additional complete-book colour-key inverse: 213 unsolved red runes

A separate test uses *all* **213** unsolved LP2 red rune indices in their exact original reading order, from the [complete colour annotation](../resources/liber-primus/lp2-ink-annotations.json), rather than the 51-runed passage alone. The historical coloured transcription is a substantially different source from the source page's 51-rune suffix. The known image-side red rune count is 225 including the twelve runes on the two already-solved closing pages.

**Explicit model:** the 213 red indices form a repeating additive mod-29 pad, key pointer reset to **phase zero on each physical page**. Every proposed ciphertext doublet triggers another key draw with probability 0.81, retaining its original plaintext rune. The full hidden alignment is marginalized by the exact [key-skip transducer](../sims/keyskip_transducer.cjs), so a valid key is not penalized for independently skipped draws. Score plaintext runes with the fixed solved-LP1 and LP2 unigram prior. Test the four prespecified possibilities: forward or reversed key, each with positive or negative additive sign.

Use **39 fully black rune-bearing pages** (no source-colour complications), in disjoint 20-page training and 19-page heldout sets, each using its first 100 runes. Choose the strongest of the four pad settings **only on the 2,000 training runes** and measure its untouched 1,900-rune heldout log likelihood. Compare with **300** whole-key permutations preserving the same 213 rune values and repeating the complete train/heldout procedure. The exact script is [red_ink_keyskip_probe.cjs](../sims/red_ink_keyskip_probe.cjs), deterministic RNG seed `0x496e6b31`.

| Measurement | Actual / control |
| --- | ---: |
| Original selected orientation and sign | Reverse, +1 |
| Training log likelihood (2,000 runes) | −7,337.0923 |
| **Heldout log likelihood (1,900 runes)** | **−7,007.2283** |
| Matched random-key heldout mean ± SD | −7,058.2396 ± 43.7937 |
| Random-key heldout scores ≥ original | 37 / 300 |
| **Empirical heldout p**, plus-one | **38/301 = 0.12625** |
| Independently planted q-like ciphertexts, true red213 key, 0.81 key skips | **8/8** recovered the exact forward + key; **8/8** heldout scores above the 95% matched null cutoff |

The tested exact page-reset candidate has **no statistically persuasive advantage**, despite a pipeline with full planted-key retrieval. This does not exclude offset-shifted or continuous red key use, text-dependent repairs, a nonadditive output alphabet, or any alternate colour interpretation. It specifically closes the tempting *direct whole-red-string, page-zero resetting Vigenere-with-keyskips* scenario and avoids misleadingly assigning readable plaintext to its best random fluctuation.

Reproduction: [successful GitHub Actions run 42766433491](https://github.com/FlareZ123/liber-primus/actions/runs/42766433491), which independently checked the previous red51 tests and this new complete-red-stream attack on the exact committed corpus. No plaintext recovered.

## Reproduce

- [Corrected CommonJS reproducer](../sims/red_marker_key_probe.cjs), with an assertion for exactly 51 red runes.
- [Successful on-demand original-input run 42761569081](https://github.com/FlareZ123/liber-primus/actions/runs/42761569081).
- [Source visual bounds and corrected transcription](../resources/liber-primus/lp2-page53-red-span.json).
- [Red-stanza second-order key inversion](red-verse-second-order-key.md) and [authentic prime-totient key inversion](red-verse-prime-totient-anchor.md) examine different, fully specified ways the same marked source could be decoded.

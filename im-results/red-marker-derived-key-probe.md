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

## The 51-rune fixed-five-bit AES-256 interpretation

A further, distinct **source-fixed serialization** uses the 51 original highlighted p53 runes as 51 literal five-bit values (GP indices 0–28). They occupy **255 bit positions**; one separately unspecified 0/1 boundary bit at either end yields a 256-bit AES key. This is an exact *bit-slot* correspondence, not a claim of 255 bits of independent entropy: the red source has at most **51 log₂(29) = 247.7570 bits** of information. There is no authenticated instruction to pack it as a cipher key.

This five-bit serialization was **already investigated** with parity-derived IVs from the 128 preceding black runes in [the existing red51 five-bit study](../sims/red51_fivebit_key_iv.cjs). The extension below tests different independently sourced IVs, five original table traversals, additional no-repeat rank/de-log decoders, and a physically separate 624-rune comparison. Its scope is a further negative for the same general five-bit idea, not a first five-bit hypothesis or an authentic key.

The [reproducible CommonJS original-cipher inverse](../sims/red51_fivebit_key_inverse.cjs) tests both source rune orders, MSB/LSB order within each five-bit value, boundary-bit 0/1, and boundary-bit front/back. These are **16 literal 256-bit candidate keys**, with no byte fitted to LP2 ciphertext.

- **Numerical grid, 256 original bytes:** five table traversals (printed, reversed, whole-column, reversed whole-column, and printed-page-local column), AES-256 ECB/CBC/CTR/CFB/OFB, and zero / table-first16 / table-last16 IVs where applicable yield **1,040 direct decryptions**. Best outputs contain **122/256** printable ASCII-or-TAB/LF/CR bytes, or separately **43/256** low GP-index bytes (0–28), or a longest printable run of **14**. No candidate is wholly printable, wholly GP-index-valued, or recognizable as a decrypted text/file.
- **Authentic GP ciphertext:** first source-selected test block is p52 (263 runes), p53 black prefix (128), p54 (232), p55 (76), **699 total**; disjoint comparison is p0 (262), p15 after its red head (139), p40 after its red head (223), **624 total**. For all 16 keys, three IVs, book-continuous/page-group clock resets, source-number maps byte%29 or floor(29×byte/256) (and corresponding mod28/scaled values for rank maps), both signs, and three reversible rune transforms (direct additive GP29, no-repeat previous-rune rank, or no-repeat discrete-log base15 rank), this tests **1,152 fixed configurations**. Original near/far IoCs are **0.034294 / 0.034444**. Highest individually selected decrypted near/far IoCs are just **0.036626 / 0.036975**, and the best jointly selected mean IoC is **0.0364815**. No configuration reaches **0.045 in both disjoint scopes**.
- The exact AES-CTR inverse passes a **699-position planted original-alphabet roundtrip**, recovering every input GP rune and re-encrypting it without error. The original-source negative therefore measures this explicit interpretation's failure to expose English-like runic plaintext; it does not rest on an inoperative decryption implementation.

This closes the **literal red51 five-bit + one boundary bit** direct AES-256 model under the declared modes, IVs and rune maps. Unknown key derivation, non-AES mechanisms, changing states, other binary plaintext formats, and untested source encodings remain possible. In particular, the 255-slot coincidence alone is **insufficient evidence** for the AES hypothesis. No unknown original LP2 plaintext or genuine key is recovered.

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

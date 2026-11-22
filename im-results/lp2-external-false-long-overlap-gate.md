# Original-image gate: claimed long LP2 ciphertext overlaps are not present

**Agent 36, 14 November 2026. Established source-data correction; no decrypted unknown plaintext or creator key.**

## Decisive source-original observation

An external April 2026 [Liber Primus master tracker](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md#810-two-time-pad-cipher-text-overlaps-p21p54--critical) asserts six physically repeated ciphertext regions of **97, 172, 265, 404, 1,312 and 1,468** runes, totaling **3,718** constrained positions. It additionally asserts that LP2 physical p27's first **234** runes equal physical p44's first 234 runes, and describes the purportedly shared 14,529-rune p21–54 stream as source-authentic. These are strong claimed key-reuse constraints, so an exact original-source gate matters before any two-time-pad or crib inference.

The immutable original 2014 source images are archived as \`resources/liber-primus/17.jpg\`–\`72.jpg\` for physical p0–55. The [canonical image-backed rune-index corpus](../resources/liber-primus/lp2-corpus.json) contains **12,956** unsolved runes in the *entire* 56-page range, including one rune-free physical p50. The exact [source-original SFT](../sims/lp2_source_exact_long_repeat_sft.cjs) checks SHA-256 of original \`44.jpg\` = p27, \`61.jpg\` = p44 and \`72.jpg\` = p55 against independently preserved [source hashes](../resources/liber-primus/SHA256SUMS.txt), and then compares unmodified complete physical-page rune arrays.

The direct p27/p44 test is unambiguous:

| Source item | Unmodified physical LP2 data |
| --- | --- |
| Original p27 (archive \`44.jpg\`) | **234 runes**, first GP rune **M** (index19) |
| Original p44 (archive \`61.jpg\`) | **273 runes**, first GP rune **EA** (index28) |
| Identical prefix p27 vs p44 | **0 runes** |
| Longest *anywhere* shared contiguous substring p27/p44 | **3 runes**, \`E T R\`, at p27 offset90 / p44 offset96 |
| Source p50 (archive \`67.jpg\`) | **0 runes**, entirely numeral cells |

An exhaustive original-corpus count of every within-physical-page substring across every pair of *different* unknown physical pages finds the **longest shared contiguous ciphertext is exactly six GP runes**, once: \`D J U B E I\`, at p27 local28–33 and p55 local70–75. **Zero** cross-page original ciphertext substrings have length ≥7, hence none can have any of the external 97–1,468-rune lengths. This result agrees with the independently identified [printed two-word p27/p55 bookend](lp2-bookend7-p56-known-boundary.md). A previously reported seven-rune continuation appends p56's first ciphertext rune to the end of p55 and therefore **crosses a physical page boundary**; it does not contradict this within-page six-rune maximum.

### Interpretation

The external tracker mixes page-length labels and an apparent reconstructed 14,529-rune data stream that cannot be mapped to the original physical LP2 pages. Examples are external “P50 full” of 1,468 runes versus original physical p50 **zero**, “P44 first 1,312” versus original p44 **273**, and “P25” with 1,729 runes versus original physical p25 **273**. A separate inferred segmentation could have different labels, but must still prove every claimed equal-runic interval against the exact original ciphertext before transferring any cryptanalytic key constraint. The published *physical-page* identity and its six alleged long equal-runic regions fail that test.

The false long-reuse premise invalidates any dependent inference of shared key positions, circular crib “twin verification”, or 95.6% recovered words when those claims rest specifically on the listed repeated-ciphertext intervals. A forced-key forward round-trip is always possible and cannot authenticate the resultant plaintext. This correction does **not** refute every independent experiment in that external repository and does **not** establish that genuine LP2 never reuses a secret pad under different plaintext.

**Research decision:** do not seed any LP2 decoder, key-length deduction or plaintext crib with those six external two-time-pad interval identities. Preserve the real **single six-rune p27/p55 seam** as a separate original clue with no currently demonstrated decoding consumer. New plaintext evidence must reconstruct the unmodified source and survive a held-out original interval.

## Reproduction

\`node sims/lp2_source_exact_long_repeat_sft.cjs\` from the repository root. The CommonJS test checks three original JPEG SHA-256 digests, asserts exact source lengths, derives p27/p44's true longest common substring by independent dynamic programming, exhaustively indexes all within-page six/seven/97-rune substrings, and asserts the only six-rune cross-page match. Original input is read-only. All numbers above were also independently calculated directly on fetched canonical source arrays before committing the test. This is a **source-integrity exclusion**, not a candidate decryption.
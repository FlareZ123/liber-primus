# LP2 p55 strict word-circumference checksum gate

**Decision for Director #572, 12 November 2026.** Both frozen, elementary word-local checksum models fail on **all 16 complete original p55 words**. The GP29-index and GP-prime-weight versions each give **0/16 exact word equations**, and in either model the most frequent residual occurs only twice. No one fixed additive offset restores a checksum. This retires these two specified word-edge parity checks. **No p55 plaintext, authenticated key, encoder, or continuation is recovered.**

## Original input and motivated alternatives

The solved p57 text says to “shed our own circumferences” and find divinity within. The original p55 image has 76 source-verified black GP29 runes, 16 black interword dots, and a separate red terminal mark. Its first rune is the last fragment of a p54 word, followed by exactly 16 complete p55 words totaling 75 runes. Their 43 strict interior runes and 32 word-end runes, plus the one carried rune, account for all 76 source positions. The original source-glyph map and independent adjudication are [here](p55-original-image-blind-transcription.md).

Let a complete printed p55 word be \(c_0,\dots,c_{n-1}\), with canonical GP rune index \(v(c)\in[0,28]\) and GP prime weight \(q(c)\). Test the two **unchanged, predeclared** equations modulo 29:

- **Index checksum:** \(v(c_0)+v(c_{n-1})\equiv\sum_{j=1}^{n-2}v(c_j)\).
- **Prime checksum:** \(v(c_0)+v(c_{n-1})\equiv\sum_{j=1}^{n-2}q(c_j)\).

The strict interior sum is zero for a two-rune word. The one-rune p54 carry is *not* a complete p55 word, so there is no arbitrary choice to double-count it as a first and last edge. Both hypotheses use the same original printed word boundaries, unaltered GP29 order and no key, phase, reordering, relabeling, or word-specific offset.

## Exact original results

Each displayed residual is left minus right, reduced to 0–28. A valid equation requires **0**, and a fixed offset would require all words to share one residual.

| Complete word | Original GP word | Length | Index residual | Prime residual |
| ---: | --- | ---: | ---: | ---: |
| 1 | AE M I W | 4 | 3 | 17 |
| 2 | S B | 2 | 3 | 3 |
| 3 | X M | 2 | 4 | 4 |
| 4 | S EO G D TH AE | 6 | 26 | 4 |
| 5 | F IA A B C U | 6 | 15 | 13 |
| 6 | W R | 2 | 11 | 11 |
| 7 | B EA F X I M U C P H NG L EO | 13 | 6 | 28 |
| 8 | M S D IA P F | 6 | 28 | 17 |
| 9 | B H EO C | 4 | 2 | 16 |
| 10 | EO E | 2 | 1 | 1 |
| 11 | EA E I G X G S | 7 | 18 | 9 |
| 12 | E S EO TH TH E S | 7 | 13 | 7 |
| 13 | TH OE | 2 | 24 | 24 |
| 14 | C EA I M C X | 6 | 15 | 27 |
| 15 | D J U | 3 | 13 | 16 |
| 16 | B E I | 3 | 9 | 18 |

Both models have zero exact matches. The modal residual counts are **2/16** each, nowhere near the necessary **16/16** for a single global offset. The conditional chance of zero hits for 16 independent uniform 29-residue checks is \((28/29)^{16}=0.570375\); this absence is routine under a no-checksum model. Source-native solved p57 gives index **1/20**, prime **0/20**. These comparisons calibrate the expected random-match scale; no natural-language assumption is needed for the exact p55 failure.

## Reproduction and next decision

[Single-file CommonJS SFT](../sims/p55_word_circumference_checksum_sft.cjs) reads the unchanged original transcript and canonical GP29 source. It identifies p55 and solved p57 by complete rune-sequence identity, preserving physical page mapping despite the omitted numeric-only p50 text page, then checks printed word boundaries, the one-rune carry, all 16 residual pairs, and both successful one-symbol-adjusted positive plants plus their one-symbol perturbations. It writes no files.

Do not infer a generic impossibility of word-local error correction. A checksum involving a source-selected word-position state, parity polynomial, different alphabet, or cross-page carry could exist, but neither the image nor solved p57 independently supplies such a rule. The reported two checks supply no plaintext and no reason to expand an unbounded parity-family search. **Close #572 as a literal-source negative and retain #41's full 76-rune source-selected inverse prerequisite.**

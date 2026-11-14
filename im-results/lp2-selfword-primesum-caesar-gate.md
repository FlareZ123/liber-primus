# Current-word GP-prime-sum Caesar: original-input gate

**Decision (14 November 2026; Agent18): the exact printed-word prime-sum Caesar model is rejected in both directions.** This is a bounded negative, not an LP2 decryption. It assumes the 2,896 printed words are the cipher units and uses the source-authenticated GP29 prime chart; it does not test alternate latent segmentation or other word-navigation operations.

## Why test this

The signed 6 January 2016 Cicada message says: “Its words are the map, their meaning is the road, and their numbers are the direction.” The 2013 Gematria Primus source image fixes 29 rune indices and their prime weights 2–109. A simple, reversible-looking interpretation is that each word's own plaintext prime sum selects its Caesar direction and shift.

Neither source explicitly says to sum the word's prime values, reduce modulo 29, or apply a per-word Caesar shift. This is therefore a clue-constrained candidate, not an authenticated cipher instruction. It is distinct from the already-tested previous-word → next-key handoff.

## Frozen rule

For each printed plaintext word (P=(p_1,ldots,p_n)), define

[
k(P)=\left(\sum_{i=1}^{n}\operatorname{GPprime}(p_i)\right)\bmod 29.
]

Test both direct orientations:

[
C_i=P_i+k(P)\pmod{29}
\qquad\text{and}\qquad
C_i=P_i-k(P)\pmod{29}.
]

For each original ciphertext word (C), the inverse enumerates all (k\in\{0,\ldots,28\}), forms the corresponding (P=C\mp k), and retains it only when (k(P)=k). No phase, key, word break, offset, alphabet, or score is fitted.

## Exact original-cipher result

The inputs are the canonical original transcription and source-derived LP2 corpus: **12,956 original runes, 2,896 printed words**, with page- and line-carried words joined exactly as in the repository's source parser. Prime weights come from `gp.prime` in `resources/liber-primus/lp2-corpus.json`, which is pinned to the 2013 GP29 source chart.

| Measurement | (C=P+k) | (C=P-k) |
|---|---:|---:|
| Original words with no fixed-point inverse | **1,049** | **1,050** |
| Original words with one fixed-point inverse | 1,118 | 1,120 |
| Original words with multiple fixed-point inverses | 729 | 726 |
| Original words with any TextBlob GP29 dictionary candidate | **159 / 2,896 (5.49%)** | **54 / 2,896 (1.87%)** |
| Distinct dictionary plaintext candidates across those words | 183 | 60 |

The zero-solution count is language-independent: under this exact rule, every ciphertext word generated from a plaintext word must have at least one fixed point. More than a thousand original printed words have none in either direction. The dictionary result independently shows that the surviving candidates do not form English plaintext.

## Positive controls and vocabulary coverage

The TextBlob source dictionary supplies **29,059 unique GP29 word encodings** after the same source-native orthographic normalization used by the repository's existing English-prefix controls (TH, NG/ING, EO, OE, AE, IA, EA; K→C, Z→S, V→U, QU→CW).

| Source-native control | Alphabetic tokens | Dictionary coverage |
|---|---:|---:|
| Shakespeare first 300k | 55,407 | **94.40%** |
| Gibran, *The Prophet* | 15,733 | **98.14%** |
| Emerson essays | 77,932 | **97.06%** |

For both cipher directions, every eligible source-control word was planted under the exact rule and its true plaintext remained among the inverse fixed points (**100% planted-word retention**). The inverse is sometimes ambiguous (multiple fixed points), so the positive control validates the implementation and its lossless candidate set; it does not claim unique recovery for every planted word.

The dictionary's 94–98% control coverage makes its 5.49% / 1.87% match rate on original words an inadequate explanation for a native-English plaintext.

## Interpretation and limits

- **Rejected:** one Caesar shift per authentic printed word, where the shift is the sum of that same plaintext word's GP prime weights modulo 29, in either sign.
- **Not rejected:** a different word segmentation; a key selected by a preceding or following word; a navigation rule that uses word values to choose another page/table cell; a multi-rune or stateful operation; a non-English plaintext register; or any operation not represented by this fixed equation.
- The 2016 phrase is authentic motivation for word-level navigation, but it does not select this arithmetic. Do not expand this negative into arbitrary moduli, prime functions, resets, or sign schedules without a new first-party instruction.
- No unknown LP2 plaintext, authentic key, complete cipher, or destination is recovered.

## Reproduction

Run from the repository root with Node.js 22:

```sh
node sims/lp2_selfword_primesum_caesar_gate.cjs
```

The script reads the original transcription, canonical GP29 source map, TextBlob word-frequency lexicon, and three native-English controls. It asserts the original source counts, both exact fixed-point tallies, dictionary matches, and 100% positive-plant retention. It makes no file writes and requires no dependencies.

Related source records: [2013 GP29 source map](../results/2013-original-gp29-source-map.md), [2016 signed message](../resources/cicada2016-4gq25.md), and [previous-word → next-key historical gate](lp2-word-prime-feedback-historical-precedent-gate.md).

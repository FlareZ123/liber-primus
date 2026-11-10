# Fixed-permutation adaptive radix-28 byte model: exact obstruction

**Agent 24, 2026-11-10. Classification:** a bounded, plaintext-independent impossibility result for a specified reversible byte-framing model. **No unknown LP2 plaintext or key recovered.**

## Cryptanalytic rationale

The unsolved LP2 ciphertext strongly suppresses identical adjacent rune symbols. One direct decoder ranks each published glyph among the 28 glyphs excluding its predecessor, then reads five recovered base-28 digits as three raw bytes. The earlier [adaptive-radix28-byte-recovery.md](adaptive-radix28-byte-recovery.md) rejected this interpretation for the two natural rank conventions with known rank-to-digit labels. An arbitrary unknown **globally fixed permutation of the 28 labels** remained untested. This investigation eliminates that entire permutation freedom through a necessary-condition inequality, without enumerating 28! keys, language assumptions or guessing byte contents.

## Exact theorem

Let adjacent GP indices be p and c in 0..28. Whenever c differs from p, the **sorted-exclusion rank** is r=c-[c>p], and the **cyclic-exclusion rank** is r=((c-p) mod 29)-1. Both lie in 0..27. Suppose an unknown fixed bijection π maps each observed rank to a base-28 digit d. A five-digit big-endian block must encode a 24-bit integer

\[
V=d_0\,28^4+d_1\,28^3+d_2\,28^2+d_3\,28+d_4 < 256^3.
\]

One and only one input rank r* maps to digit 27. If a five-digit block begins with r*, then the next digit is at most 8, since

\[
256^3-27(28^4)=181504,\quad \lfloor181504/28^3\rfloor=8.
\]

**Therefore no more than nine distinct second-rank symbols are permitted following that first-rank symbol across all blocks.** Because π is injective, any ten distinct second ranks would force one digit greater than 8. If every candidate rank has more than nine distinct successors, no global permutation can make the whole stream a valid five-digit/three-byte encoding. This is independent of the byte distribution, even if the underlying data is compressed or encrypted.

## Tests on the original manuscript

Input is the canonical numerical source in resources/liber-primus/lp2-corpus.json: 55 nonempty unresolved LP2 physical pages (0–55, excluding runeless physical page 50), with 12,956 total indices. The reproducible script evaluates every combination below.

| Factor | Configurations |
| --- | --- |
| Rune exclusion rank | sorted; cyclic |
| Equal adjacent glyph | remove as extra marker; digit 0; digit 27; glyph index modulo 28 |
| Page state | independently rank every page, preserve a common block phase; independently rank pages and stitch resulting ranks; concatenate rune pages before computing ranks |
| Block phase | 0,1,2,3,4 |
| Digit significance | printed order; reverse each five-digit block |

The resulting **2 × 4 × 3 × 5 × 2 = 240** variants all violate the global-permutation condition.

| Statistic | Result |
| --- | ---: |
| Necessary maximum distinct second ranks under any true hidden permutation | **9** |
| Minimum over all 240 variants and all 28 top-digit-rank candidates | **22** |
| Best minimum with sorted/cyclic ranks | **22 / 23** |
| Best minimum with page / stitched / continuous mode | **23 / 22 / 23** |
| Complete-stream interpretations having any admissible global permutation | **0 of 240** |

The closest observed variant is sorted rank, equal-glyph replacement 0 or 27, stitched page streams, phase 2 and printed digit order. It still has **22 distinct followers**, exceeding the necessary bound of nine by 13. This is an exact codeword-capacity contradiction within the declared hypotheses, independent of cryptographic entropy and English-scoring choices.

**Positive controls:** The reproduction script generates a seeded 18,000-byte stream, a shuffled and unknown 28-digit permutation, five-digit radix-28 packing, and legal no-repeat GP ciphertext. For both sorted and cyclic rank conventions, it verifies the rank recovery and 18,000-byte round trip, then confirms that the actual rank mapped to 27 has at most nine possible second ranks.

## Limits and next decision

This result rules out a **single globally fixed 28-digit relabeling** rescuing direct 5:3 byte packing in the tested page/exception interpretations. It cannot exclude independently varying page phases or permutations, a running-key digit remapping, arithmetic/variable-length packing, other block sizes, unmodeled insertion/deletion channels, or an intermediate non-byte plaintext. The page-mode test assumes one common phase per page; its two global modes test the separately specified continuity rules. The rune repeat treatments are finite alternatives, not a complete hidden-state model.

No source key, LP2 plaintext, or general cipher architecture is identified. Additional optimization of this specific global 5:3 relabeling is mathematically unnecessary. Stronger work requires a source-derived key or a different reversible architecture with original held-out ciphertext predictions.

**Reproducer:** sims/adaptive_radix28_permutation_obstruction.cjs, Node.js 22, no third-party packages, against the exact project corpus.

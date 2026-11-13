# Original LP2 cumulative-difference zero-symbol gate

**Status (13 November 2026): bounded, source-original negative result.** This tests the simplest reversible explanation for LP2's rare adjacent repeated runes without selecting a key from language scores. It recovers no unknown plaintext or actual cipher.

## Distinguishing invariant and original observations

Consider any **stationary**, continuous cumulative GP29 encoder

\[
C_i=(C_{i-1}+h(P_i))\bmod29,
\]

where \(h\) is **any secret bijection** of the 29 GP symbols. The condition \(C_i=C_{i-1}\) holds precisely when \(P_i=h^{-1}(0)\). Thus every ciphertext doublet locates one and the same (unknown) plaintext rune. All 29 choices for that rune are covered without finding the other 28 entries of \(h\).

The exact p0–p55 source transcription, with 32 unmarked physical-page word continuations joined, contains **12,956 runes** in **2,896 printed words**. Its 86 adjacent equal-rune transitions comprise **63 inside words** and **23 across word separators**. To avoid treating sentence/page punctuation as a continuous cipher clock, this experiment uses only the **22 doublets across 2,720 literal hyphen word boundaries**, plus **19 doublets at the last rune of 2,813 words of length at least two**. The other cross-word doublet follows a period and is excluded from the test.

## Independent fixed-English comparison

The three pinned control files Shakespeare, Gibran and Emerson provide **149,072 words**, encoded as GP29 using the independently solved-LP1 orthography, including one-rune ING and IO. For each original printed word length, treat its hypothetical plaintext as an independent uniform draw from the control words of the same *GP-rune* length. This is a finite, length-stratified model of English, not an assertion that the author wrote those texts.

For every candidate \(g=h^{-1}(0)\), calculate expected GP-\(g\) counts at positions following literal hyphens and at within-word terminal positions. The resulting model gives:

| Candidate \(g\) | Expected ordinary word starts | Expected word-final positions | Original doublets |
|---|---:|---:|---|
| U (least excluded candidate) | 55.091 | 47.965 | 22 / 19 |
| G | 65.762 | 6.208 | 22 / 19 |
| EA | 7.628 | 1.178 | 22 / 19 |
| NG/ING | 0.292 | 58.073 | 22 / 19 |
| IA/IO | 0.034 | 3.317 | 22 / 19 |

For each of the **29** unknown special runes, the probability of getting *both* observed counts is no larger than the smaller one-sided Chernoff tail of the two length-stratified Poisson-binomial marginals. A conservative sum over all 29 choices gives **1.8276376395094553 × 10⁻⁶**. This bound is valid **under the specified independent-word sampling model**; it is neither an exact authorial probability nor a deterministic prohibition on all English.

An independent, nontrivial cumulative-cipher positive plant uses \(h(p)=(p-21)\bmod29\) on genuine native-GP words; the doublet positions equal the plaintext NG positions exactly. The test also checks original word/rune counts, both observed position counts, and source-native ING/IO encodings.

## Consequence and limits

A simple **word-boundary-preserving, book-stationary, unkeyed cumulative alphabet permutation** fails a discriminating original-input test even when the secret alphabet is unrestricted. Uniform nonzero ciphertext differences alone do not establish a no-repeat cipher. A changing stream key, a reset at each printed word, a different alphabet or spelling register, non-English plaintext, and any operation that breaks the zero-event equality are outside this result. In particular, the 22 ordinary-boundary events cannot test an encoder that resets state at every word.

This is a separate constraint from previous all-secret substitution tables indexed by ciphertext history. Further arbitrary nonzero-difference key scans would avoid this invariant without supplying an intended solve path; a new independently visible source selector would be needed.

**Reproducer:** [offline Windows-compatible CJS SFT](../sims/lp2_cumulative_difference_zero_symbol_sft.cjs). Inputs are the checked-in original transcript, GP inventory and three pinned original control corpora. No network or unseeded simulation is required.

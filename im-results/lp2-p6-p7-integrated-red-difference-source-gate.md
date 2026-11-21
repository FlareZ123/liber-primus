# P6→p7 reversed red boundary: integrated-difference potential key fails on the original 308-rune body

**Agent38, 21 November 2026. Classification: source-derived reversible candidate rejected, no unknown plaintext or authentic encryption key recovered.**

The already documented original p6/p7 red-tail/head reversal preserves both the word lengths and **GP0 word sums**: p6's four-rune/two-rune pair has sums 65/26; p7's four-rune/two-rune pair, in reversed printed word order, also has 65/26. The direct six-rune difference-key receiver was rejected by Director #2056. This report tests a different, mathematically natural interpretation of that exact equality: the red differences might be the *finite differences of a shorter hidden key* whose endpoints are zero.

## Source-fixed potential

Use the original rune-index order, without fitting signs, phase, offsets, or plaintext. Align equal-length words, not their spatial order. The original GP29 vectors are:

| Source word | GP29 indices | GP0 |
| --- | --- | ---: |
| p6 final four-rune red word | [6,27,15,17] | 65 |
| p7 second red word | [22,16,2,25] | 65 |
| p6 terminal two-rune red word | [14,12] | 26 |
| p7 first red word | [23,3] | 26 |

Their modular p6-minus-p7 differences are **[13,11,13,21]** and **[20,9]**. Integrating each difference wordwise over GF29 with initial state zero yields **[13,24,8,0]** and **[20,0]**. The final zero in each sequence is algebraically forced by the equal GP0 checksum. Removing the two dependent terminal zeros gives the uniquely determined independent *potential key* **[13,24,8,20]**.

This tests the specific idea that red differences are *derivatives* of a four-symbol key to be repeated over the source-selected black body. A derivative interpretation is an exploratory operation hypothesis: the original words give the differences but do not instruct solvers to integrate them, concatenate the two independent parts, or use a repeating key. The experiment therefore tests one economical consequence and stops.

## Complete original-cipher test

The black body runs from p6 rune offset82 to its end at offset196, followed by p7 rune offsets0–193, for **114+194=308 original runes**. It includes a word continued across the page boundary. Use the only fixed four-symbol key above; test addition/subtraction modulo29 and the two natural orientations of the key, with phase0 fixed at the p6 after-red body start. All four variants retain the original GP29 rune order and printed word separators. No word-local phase reset, fitted substitution, permutation, or candidate plaintext is admitted.

For lexical controls, transliterate the pinned solved LP1 reference into native GP29, with canonical digraph preference and standard K/Q→C, V→U, Z→S folding; use its 29-symbol trigram model (additive count 0.2) and unique four-or-more-letter native words. The same reference recognizes **11/12** long words on original solved p57, which itself scores **−2.07669**. Untouched p6/p7 ciphertext scores **−3.56051**.

| Integrated-key inverse | Native-GP trigram mean log likelihood | Exact solved-reference native words of length ≥4 |
| --- | ---: | ---: |
| subtract, forward [13,24,8,20] | −3.60671 | 0/40 |
| subtract, reversed [20,8,24,13] | −3.60392 | 0/40 |
| add, forward [13,24,8,20] | −3.58733 | 0/40 |
| add, reversed [20,8,24,13] | −3.58384 | 0/40 |

All 308 source ciphertext runes are exactly recovered by forward re-encryption in all four variants; independent 308-rune native-GP positive plants also round-trip exactly. These controls check implementation rather than evidence for a historical cipher. The four candidate decodings are visibly nonlinguistic, with slightly *worse* trigram scores than the original ciphertext.

## Decision

**Retire the four-symbol integrated-red-difference repeated-key decoder for this particular 308-rune body.** The boundary's sum-preserving reversal remains a legitimate original-source observation, but its equality alone cannot specify an inverse operation. No broader numerical key search, new receiver, or claimed plaintext follows from this negative. A useful successor would need a distinct first-party clue selecting a key clock or wordwise reversible operation and predicting an untouched ciphertext consequence.

Reproducer: [Node22 CommonJS source SFT](../sims/lp2_p6_p7_integrated_red_difference_gate_sft.cjs). Inputs: unmodified [original LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), [printed punctuation/word transcription](../resources/liber-primus/lp2-transcription.txt), and [solved LP1 reference](../resources/liber-primus/lp1-plaintext-reference.txt). The computation was independently executed on the fetched source arrays before committing the reproducer.

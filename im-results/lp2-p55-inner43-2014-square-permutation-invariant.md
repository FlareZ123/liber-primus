# 2014 three-square 43-core ↔ LP2 p55: all-secret permutation obstruction

**12 November 2026 · Agent45 follow-up to Agent32's original-source discovery. Classification: exact permutation invariant, four matched GP-native control tests, direct permutation-positive roundtrip. No unknown plaintext, key or destination recovered.**

## Original-source target

The preserved [2014 magic-square values](../resources/cicada2014-openpuff-magic-squares.txt) form three **5×5, 7×7, 5×5** matrices, with **3²+5²+3²=43** cells after removing their perimeters. The [earlier sixth-onion instructions](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/README.md) required solvers to enter these historic squares before the seventh-onion Liber Primus release. Agent32 identified the correspondence with 43 strict word interiors on original p55 and tested direct square-value additive/spiral/chain consumers in [the dedicated report](lp2-2016-p50-p55-43unit-source-selector-gate.md).

P55 contains exactly **17 printed words** with GP29 rune lengths **[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**, totaling 76. Removing the first and last rune of every word leaves **43 GP29 interiors**, retaining only the source-visible word boundaries. This exact original ciphertext has **62 ordered equal-symbol pairs** out of **43×42=1,806** ordered unequal-position pairs, giving GP29 IoC **0.03433001107419712**.

The three original square interiors consist of 43 numbers with only **23 unique values**; 20 values occur twice. Sorting them requires a tie rule that the historical source does not supply.

## Key-independent whole-family result

**Every bijective permutation of these same 43 interior symbols, including every potential square-row/column/spiral/readout permutation and all tie orders, has exactly the same 62/1806 IoC.** A further *single globally shared secret GP29 alphabet permutation* also cannot change the collision count. This holds under arbitrary secret values and every one of the 43! position permutations, rather than just the previously tested ascending-number or spiral keys.

To test whether an ordinary GP-native English interior could exhibit such a low invariant, sample **seventeen genuine source words with precisely the seventeen p55 word lengths** from each independently pinned corpus. Strip each control word's first and last rune, concatenate exactly 43 *plaintext* runes, and compute the same collision statistic. GP transliteration uses the project's normal QU→CW, V→U, K→C, Z→S, Q→C and longest multigraph tokens. Each corpus contributes 20,000 independently sampled word-length-matched records, xorshift32 initial seed **0x45001112** used continuously across corpora; all original target runes are unchanged.

| GP-native source | Shape-matched trials | Minimum source-native collision pairs (out of 1806) | Mean IoC | Trials at or below original 62 |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, first 300k | 20,000 | **72** | **0.07199823** | **0** |
| Gibran, The Prophet | 20,000 | **70** | **0.07154003** | **0** |
| Emerson essays | 20,000 | **68** | **0.07051683** | **0** |
| Solved LP1 reference (includes editorial text) | 20,000 | **72** | **0.07081074** | **0** |

For each source separately, the empirical add-one lower-tail bound is **1/20,001**, conditional on ordinary GP-English strict-word-interior plaintext and the fixed target word shape. The four sources are reference registers, not independent claims about the unknown author's actual language; samples reuse vocabulary entries and draw independent words rather than grammatical whole sentences. Native source-word lengths include the real 13-rune length. Their distribution is a more relevant diagnostic than arbitrary contiguous English 43-rune passages.

A directly fixed ascending-value square-key permutation with printed-index tie breaking preserves the original 62 collisions; an independently sampled GP-native control encrypted through the same permutation is recovered exactly **43/43**, with no IoC change. This positive control demonstrates both the bijection and its unavoidable frequency invariant.

**Scope:** The result obstructs **pure permutation of p55's 43 strict interiors, optionally followed by one fixed alphabet substitution**, under the plain GP-English/register assumption. It does not exclude position-dependent number shifts, unknown state, a different intermediate language, changing word boundaries or an additional side channel. Agent32's source-selected direct addition/chain results address other families.

## Row-by-word placement cannot work as printed

The three historical squares have **5+7+5=17 rows**, matching p55's 17 words in count. But a literal **one complete printed word per square row is impossible under any row order**: one genuine word is **13 runes**, and the longest square row is only seven cells. With the original word and square-row order frozen, four word/row pairs overflow: **#5 6>5, #8 13>7, #13 7>5, #15 6>5**. They exceed row capacities by **10 runes total**, while the shorter rows have **33 empty cells**. The net 33−10=23 matches the terminal red23-dot count, but cannot produce a valid lossless one-word-per-row placement. The 23-dot design is a single original punctuation symbol without a source-authenticated one-dot-one-rune encoding.

**Research decision:** Preserve the original 43-cell interior / 43-rune alignment as a clue-bound *candidate*, while retiring new source-unselected 43-position transposition searches. The 17/17 row-word count is not a literal placement rule. Reopen only with a source-selected changing-symbol transformation or an original 76-rune whole-page inverse, not an optimized tie breaker or coordinate alignment.

**Reproduction:** [Original-input CommonJS SFT including matched samples and exact 43/43 positive control](../sims/lp2_p55_inner43_square_permutation_invariant_sft.cjs).

# Two adjacent original punctuation spans: orderless source-text crib gate

**Agent37, 16 November 2026. Classification: bounded plaintext-source exclusion, no recovered unknown-page plaintext or key.** [Windows Node22 successful execution](https://github.com/FlareZ123/liber-primus/actions/runs/43904985511); [read-only CommonJS SFT](../sims/lp2_two_sentence_sourcebag_crib_sft.cjs).

## Decipherment question

The 2016 signed statement about words as map and numbers as direction, together with earlier observed near-random adjacent original word lengths, motivates a *specific* possible plaintext recovery route: a passage of Cicada's earlier chosen books or related prose could have its **whole words permuted independently within each intact printed sentence**. No secret rune alphabet or word-ordering key is required to identify such a copied passage, because all permutations preserve the exact **multiset of its GP29 word lengths**. This tests the strongest finite source-copy form of the hypothesis, rather than fitting a free word permutation to unknown text.

The alternative is genuinely authored unknown plaintext, a different original source, changed word boundaries, or an encryption that alters word lengths. Those mechanisms do not imply a match here.

## Fixed original registers

Read the unchanged original `resources/liber-primus/lp2-transcription.txt` against the 29-symbol `resources/liber-primus/lp2-corpus.json`, asserting *every* rune identity on all 55 rune-bearing unknown pages. Printed minus/hyphen terminates a word; `.`, `&`, `$`, and `§` terminate punctuation spans; page marks and printed line wraps preserve continuing words. This yields exactly **12,956 original runes, 2,896 original complete words and 175 punctuation spans**.

The source corpora are four already pinned historical/literary references: Gibran `resources/control/gibran_prophet_58585.txt`, Emerson `resources/control/emerson_essays_2944.txt`, Shakespeare `resources/control/shakespeare_first300k.txt`, and the three chapter files `resources/external/2013-book-of-law-{I,II,III}.txt`. Source printed line breaks are reflowed, punctuation `[.!?;:]` terminates source sentences, and source words are GP29 normalized by the source-derived `ING`/`IO` and standard GP multigraph conventions, plus `QU→CW`, `V→U`, `K/Q→C`, `Z→S`. The corpus editions and normalization are explicitly finite, not claims about every edition or native GP spelling.

For each pair of **consecutive original punctuation spans**, requiring at least **13 words each**, inspect all source pairs of consecutive punctuation spans with the same minimum word count. Whole-word permutations preserve the multiset of lengths in each span. For a source/LP2 span pair define an exact nonnegative deficit as `max(numberOfWords) - sum_length min(originalCount[length], sourceCount[length])`. The two-span sum is **zero if and only if the two unordered word-length multisets are identical**, irrespective of any within-span order. For efficiency, differences greater than five in either pair's word count cannot produce a newly best result in this registered search. Do not allow swapping words *between* sentences.

## Exact source test

| Independently pinned source | Source punctuation spans | Original/source best combined deficit | Exact two-sentence matches |
| --- | ---: | ---: | ---: |
| Gibran | 1,007 | **6** | **0** |
| Emerson | 4,652 | **5** | **0** |
| Shakespeare | 7,110 | **6** | **0** |
| Crowley *Book of the Law* | 733 | **11** | **0** |

The minimum is over original/source aligned pairs satisfying the predeclared **13+13 words** per sentence in both corpora. Values measure unmatched word lengths, **not decrypted GP symbols** and not a probabilistic p-value. The closest several pairs remain imperfect even if their contained words are freely rearranged. The script prints original span offsets, source span offsets, sentence word counts, and the two individual deficits.

**Source-positive controls:** for each independently pinned source, take an eligible pair of consecutive original source sentences, reverse the words in *each* sentence, then run the same source-bag finder. All four plants recover a zero-deficit alignment at the exact source offset. The read-only SFT passed on the actual repository files under the reusable Windows Node22 workflow [run 43904985511](https://github.com/FlareZ123/liber-primus/actions/runs/43904985511).

## Decision and remaining route

No two consecutive intact LP2 punctuation spans of at least thirteen words can be copied from two consecutive native-GP word-length sentences of these four frozen prose corpora by *only* permuting complete words inside each span. This conclusion is key-independent and survives every secret within-sentence permutation for the tested text files and spelling convention. It closes a direct-plaintext source-crib route that prior ordered-word comparisons did not test.

It does **not** exclude another book, different punctuation, moving words across sentence stops, variable-length encoding, resegmentation, or author-composed prose. It yields no ciphertext-to-plaintext operation or source-selected permutation and does not explain the missing original word-length grammar. A successor should require an *independently selected specific text or an original source-visible rule for moving sentence stops*; a general search for more prose or fitted word permutations has weak causal value.
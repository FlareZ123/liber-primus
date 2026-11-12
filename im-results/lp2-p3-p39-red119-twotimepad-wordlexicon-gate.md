# Physical LP2 p3/p39: 119-rune common-pad cancellation, source-word lexical gate

## Decision for Director Issue #651 (12 November 2026)

**The original shared-additive-pad hypothesis fails a finite, source-word-aligned native-GP English gate.** Using the two actual 119-rune prefixes before the identically positioned p3/p39 red triads, the additive common-pad cancellation is exact: with C3=P3+K and C39=P39+K over GP29, the original difference D=C3−C39 must equal P3−P39 at every corresponding position. This property holds for every possible pad K. An exhaustive word-pair compatibility test on a **30,504-word finite English GP29 lexicon** produces **five mutually word-disjoint impossible overlaps** under the physical page word delimiters. Thus **at least five of the 48 plaintext words must be absent from this finite lexicon** if both original pages used a shared additive pad and preserved their printed word boundaries.

This is a necessary-condition exclusion for *lexicon-constrained* English, not a universal all-English proof or a negative against common pads that encrypt/fractionate word boundaries. No authentic unknown-page plaintext, pad, endpoint, or key was recovered.

### Authentic input and fixed operation

- Canonical resources/liber-primus/lp2-corpus.json, physical p3 and p39, local GP29 positions [0,119) in printed left-to-right order, with all source runes including F counted. The three-rune red spans begin exactly at offset119 and are **not** used or fitted.
- Physical word boundaries: original resources/liber-primus/lp2-transcription.txt, page segments delimited by %, hyphen/full-stop punctuation separating words, / being a printed-line continuation. The prefix has **22 p3 words** and **26 p39 words**, with exact total length119 on each page. The original transcript runes independently match the corpus indices at all 238 positions.
- Native GP spelling: existing GP greedy longest-match tokens, K→C, V→U, Z→S, Q→C, consistent with the repository's native-English comparison convention.
- Independent finite lexicon: resources/control/english_wordfreq_textblob.txt, shakespeare_first300k.txt, gibran_prophet_58585.txt, and the authenticated solved resources/liber-primus/lp1-plaintext-reference.txt; deduplicate normalized GP rune words, retaining complete candidate words of the exact printed rune length. The resulting **30,504 distinct GP words** constitute a broad independent *finite* control, not an exhaustive list of possible English words.
- For each of the **42** word-pair intersections between the two printed word partitions, take the full segment where the p3 word and p39 word occupy the same rune positions. Look for **any** pair of complete lexicon words of those respective GP lengths whose rune differences match the original D on the entire intersection. There is no key search, guessed phase, reversal, altered spelling rule, selected subphrase, or ciphertext-dependent segmentation.

### Exact original failures

Indices below are zero-based for the page-local rune offsets and word numbers. Intervals use exclusive endpoints.

| p3 word | p39 word | Original runes | Exact overlap | Compatible complete lexicon word pairs |
|---:|---:|---:|---:|---:|
| 1 (11 runes) | 2 (5 runes) | [3,8) | 5 | 0 |
| 9 (12 runes) | 12 (7 runes) | [52,59) | 7 | 0 |
| 11 (9 runes) | 15 (7 runes) | [67,73) | 6 | 0 |
| 15 (8 runes) | 18 (6 runes) | [82,88) | 6 | 0 |
| 21 (6 runes) | 25 (6 runes) | [113,119) | 6 | 0 |

All five unsupported edges share neither a p3 word nor a p39 word. Their maximum bipartite matching is **five**, equal to the exact minimum vertex cover; **at least five separate plaintext words** would have to be out of the source-derived finite lexicon to remove these immediate obstructions. The other 37 overlaps each have at least one compatible dictionary pair considered independently. This weaker check deliberately makes no claim about whether those remaining local pairs can be assembled into two coherent paragraphs.

### Positive and independent-pad controls

The standalone reproducible **single-file test** is [sims/lp2_p3_p39_119_twotimepad_lexicon_sft.cjs](../sims/lp2_p3_p39_119_twotimepad_lexicon_sft.cjs). It uses a deterministic xorshift32 seed **0x81cc6fd9**, samples complete GP-native words from each exact original word-length pool, and generates 119-rune plaintext pairs. It then enciphers both with one pseudorandom 119-token GP29 additive pad and checks exact inversion, the cancellation identity, and all overlap supports.

- **30/30 common-pad native-English plants pass**, with zero incompatible overlaps.
- **30/30 independently padded native-English negative controls fail**, with **4–7** zero-support overlaps in each trial. Original: **five**, within this negative-control range.
- The committed SFT was fetched back and executed against all original repository inputs through a JavaScript runtime with read-only file stubs; all assertions passed. In a local checkout, run the file with Node.js for the same output.

These are calibrated positive/negative tests of the *finite lexical constraint* and not a proof that the unknown original plaintext is English or belongs to this dictionary.

### Relevance to the solve path

The matching red triads at local119 and red13 brackets are real manuscript clues, but they alone do not select a reused additive GP29 pad over two full black prefixes. The simple reuse hypothesis predicts a word-aligned English difference stream that the original fails in five independent places. Do not recover the branch by free key phases, rotations, source-word mutations, or loose partial-substring matches. An independently sourced instruction that both preserves a reused pad **and** alters printed plaintext segmentation would justify a distinct follow-up; otherwise, work on discovering the mechanism selected by the images, numerical grid, solved controls, or historical instructions.

**Research classification:** supporting negative experiment (im-results/), not established unknown-page decryption (results/).

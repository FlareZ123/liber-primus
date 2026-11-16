# Direct prior-plaintext symbol lookup: exact shared-table native-GP consensus gate

**Agent45, 16 November 2026. Conditional finite-source exclusion, no recovered LP2 plaintext/key.** A complete new inverse family, distinct from the earlier cumulative-key feedback, was tested on **all 12,956 untouched unknown GP29 runes and their 2,896 source-printed words**. It could have recovered a genuine common secret substitution table if the source-native model held. It does not: the original only admits one compatible other long word per anchor, whereas independent encrypted native-English positive controls support 107–108 and an authentic solved-LP1 positive supports fourteen. This does **not** prove the unknown pages are not meaningful prose; it challenges this precise direct-feedback cipher and vocabulary register.

## Reversible candidate and clue boundary

The original ciphertext has only **86 equal adjacent glyph pairs in 12,901 physical-page pairs**, yet has a word-local fifth-position echo; a statically uniform additive key does not explain both effects. The original first-release *Wisdom* text calls GP rune primes sacred, and the solved p56 uses prime-totient shifting. One relatively simple, human-programmable *hypothetical* method allows each plaintext rune to select a secret 29-way offset for the next rune. For original printed word `w` and internal index `j`:

`C[w,0]=(P[w,0]+seed[w]) mod29` with a freely unknown separate `seed[w]` at **every** word start; for each `j>=1`, `C[w,j]=(P[w,j]+f(P[w,j-1])) mod29`.

The function `f` is any of the **29^29** possible maps from GP29 to a GP29 shift, with no affine, invertible-table or common-start constraint. The cipher is reversible when `seed[w]` and `f` are known. It is a genuinely distinct form from [the existing cumulative feedback experiment](lp2-unknown-plaintext-feedback-dictionary-consensus.md), where `K[j+1]=K[j]+f(P[j])` and `C[j]=P[j]+K[j]`. Here `f` applies **directly to the previous plaintext**; the corresponding table equations and observed candidates differ. **No Cicada-authenticated clue commands this direct scheme**, so its purpose is to search for a recoverable original-cipher secret, not to assert a hidden authorial method.

For any proposed GP-native plaintext word `P` with the exact original word length, every internal ciphertext symbol fixes the table entry `f(P[j-1]) = (C[j]-P[j]) mod29`, completely independently of any secret first-rune seed. A candidate that demands two different values of the same `f[x]` is impossible. Two candidate words can coexist under a globally shared secret `f` only if every overlapping assigned table entry agrees. This is an **exact all-secret gate**; neither the 29 table cells nor word seeds are enumerated.

The lexicon consists of **12,231 distinct GP29-transliterated word types** from the pinned Shakespeare, Emerson and Gibran controls, using the usual historical GP spellings with single ING/IO and QU→CW, V→U, K/Q→C, Z→S. The 109 original printed words with at least ten runes and the 25 of length at least twelve form the source-determined targets and anchors. The source transcription is joined across physical page/line breaks: its 32 genuine cross-page words are preserved.

## Direct original and independently encrypted positive results

| Exact dictionary-consensus quantity | Original unknown LP2 | 109 length-matched English plant | Solved-LP1 native-English plant |
| --- | ---: | ---: | ---: |
| Tested long words | **109** | 109 | 20 |
| Long anchor words, length ≥12 | **25** | 25 | 8 |
| Internally legal anchor candidate maps | **105** | 137 | 35 |
| Largest number of **other** long words sharing any noncontradictory f-table assignment with one anchor | **1 / 108** | **108 / 108** | **14 / 19** |
| Largest number of other long words agreeing on **at least three already assigned f inputs** | **1 / 108** | **107 / 108** | **14 / 19** |

For the original, the strongest conditional candidate is *HYPERBOLICAL* at original printed-word index376, fixing eleven table entries and agreeing with exactly **one** other target word at the three-overlap threshold. That candidate is an investigator's dictionary fit, not recovered plaintext or a selected key. Every original anchor is exhausted, with all same-length dictionary types and every otherwise free table value. The genuine solved-LP1 control has **fourteen** of twenty long words represented in the external dictionary, so its recovered consensus is not an artifact of complete vocabulary coverage.

For the independent length-matched positive, each target's original word length is preserved, its true plaintext comes from the same source-native dictionary, the **same hidden nonlinear function** `f(x)=GPprime(x)+1 mod29` is used throughout, and *every word's first rune has an independently varied seed*. The 109 planted words decrypt exactly with the true hidden f and original first plaintext; no plaintext/secret table is supplied to the consensus algorithm. For the second positive, independently sourced **20 long genuine solved-LP1 text words** are encoded under the same hidden f with different per-word seeds and likewise invert exactly. The comparator then identifies a shared table across fourteen other words; the original's one shared word is dramatically weaker.

## Decision

The original ciphertext supplies **no globally consensual direct previous-plaintext offset table** under the original long-word geometry and tested native-English vocabulary. Retire this particular one-step direct nonlinear key family; do not extend it into independent table per page/word, alternative plaintext tokenization or arbitrary secret outer permutations without an independent original clue. Those additions remove the cross-word conditions that make an unknown key identifiable.

This negative is restricted to lexicon-covered GP-English words and their original printed boundaries. It does not exclude short-word-only clues, intentionally invented vocabulary, plaintext other than English, an evolving table, insertion/deletion of ciphertext, or a completely different cipher. **No previously unsolved original LP2 rune has been authenticated as plaintext; p56/p57 and the unknown status remain unchanged.**

The [Windows Node22 self-contained CommonJS reproducer](../sims/lp2_plain_predecessor_direct_lookup_dictionary_sft.cjs) reads original corpus/words and pinned source texts, asserts all original/positive counts in this report, verifies the complete 12,956-rune source ordering, checks all 32 page-crossing words, and decrypts both planted families symbol-for-symbol. The exact algorithm and results were also computed independently by direct V8 execution on the repository files fetched at 16 November 2026.
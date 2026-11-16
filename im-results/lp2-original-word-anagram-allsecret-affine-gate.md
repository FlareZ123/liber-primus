# All-secret word-affine plus arbitrary word-anagram gate

**16 November 2026; original-source finite-register negative.** This test grants an independent secret affine GP29 substitution to **every original printed word**, followed by any permutation of its rune positions. None of the **109 original 10–14-rune words** matches any of 12,894 source-native English reference entries of the same rune length under any of the 812 affine keys. For all **343** source words of length 8–14, only **17** have even one such reference candidate. Under a Caesar shift with any within-word permutation, the count is **zero of 343**. These figures reject these particular English-lexicon-relative cipher interpretations; they recover no LP2 plaintext or historical cipher key.

## Source, clue and model

The signed 2016 clue concerning *words*, their *numbers* and *direction* makes independently word-processed GP29 text an intelligible design alternative to a global pad. The test also relaxes the standard fixed-order word-affine dictionary search: an author might permute each encrypted word's letters after encipherment, so a failed positionwise match is inconclusive.

Take original source-preserving printed word `w`, its GP29 sequence `P`, and ciphertext `C`. The generous tested architecture is

```text
C_w = any_position_permutation_w( (a_w * P_w + b_w) mod 29 )
a_w in {1,...,28}, b_w in {0,...,28}, independently per word
```

Neither the word position permutation nor affine key is shared between words. Since position permutation does not alter symbol multiplicities, enumerate all **28×29 = 812** reversible affine GP29 transformations on the **original ciphertext word**, then ask whether its resulting 29-symbol count bag exactly matches the count bag of any candidate dictionary word of the same runic length. This is exhaustive over all secret keys and all possible within-word permutations, with no need to enumerate the permutations themselves. Invertible affine transformations form the same family in either ciphertext-to-plaintext or plaintext-to-ciphertext direction.

### Inputs and scope

- **Original ciphertext:** the repository's `resources/liber-primus/lp2-transcription.txt`, parsed by existing `sims/lp2_word_pages.cjs`; 2,896 authentic joined printed words, 12,956 runes. This preserves all 32 cross-page word continuations. Compare `resources/liber-primus/lp2-corpus.json`.
- **Plaintext register:** `resources/control/english_wordfreq_textblob.txt`, restricted to 12,894 words with eight through fourteen runes under the separately validated `encodeSourceNativeGP` implementation. This handles original source-observed `ING` and `IO` spellings, `QU→CW`, `V→U`, and GP29's remaining normalization.
- **No free word split:** all original printed boundaries and runic lengths are held fixed; transposition occurs only within each independently keyed word. Other languages, uncatalogued English words, punctuation-dependent modes, mixed words, variable segmentation, and changing internal registers are outside the exclusion.
- **Control:** 40 independently keyed reference words are affinely encrypted, reversed, and sometimes cyclically rearranged within their words. Every planted source reference word is recovered by the exact same exhaustive bag lookup.

## Original-source results

| Original word length | Words | Any Caesar + any permutation | Any affine + any permutation |
| ---: | ---: | ---: | ---: |
| 8 | 156 | 0 | 15 |
| 9 | 78 | 0 | 2 |
| 10 | 52 | 0 | 0 |
| 11 | 32 | 0 | 0 |
| 12 | 18 | 0 | 0 |
| 13 | 4 | 0 | 0 |
| 14 | 3 | 0 | 0 |
| **Total** | **343** | **0** | **17** |

The surviving seventeen isolated length-eight/nine word positions have only chance-compatible finite-lexicon candidates such as OCCUPIES, DELICIOUS, DARLINGTON, or SHRINKAGE. The test does **not** identify these as plaintext. No complete long-word sequence can be generated under the tested reference because 326 of the 343 words have no candidate, including every one of the 109 length-ten-or-longer words.

**Sharp boundary of the inference:** if an arbitrary GP29 substitution alphabet, unconstrained beyond bijectivity, is allowed separately for *every* word, all 343 original word multiplicity partitions occur in this dictionary. Thus this same corpus **cannot exclude per-word arbitrary substitution followed by arbitrary word anagram**. The evidence distinguishes affine-restricted alphabets from arbitrarily flexible ones. It does not show that such an arbitrary-secret architecture is historically intended or recoverable.

## Reproducer and next decision

Run `sims/lp2_word_anagram_all_affine_original_sft.cjs` in Node 22 with the unchanged repository data. Its output includes every source word that has an affine-bag match, the length census, and the 40 planted positives. It uses the repository's established word parser and source-native orthography helper. The original word-bag and lexicon calculations were also executed independently in a read-only JavaScript research run before writing the script.

This rejects a whole *wordwise affine plus arbitrary transposition* family within an explicit original-source English lexicon, extending the prior direct position-preserving word-affine test. It does not warrant further phase, shift or permutation scans on this branch without independently sourced instructions or withheld plaintext. A potentially productive independent route must supply a creator-selected non-affine word state or an authentic key/decoding instruction that could turn word boundaries into verified continuous plaintext.

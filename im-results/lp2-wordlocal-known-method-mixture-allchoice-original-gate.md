# Original LP2 word-local mixture of the historically solved cipher operations

**Agent40, 16 November 2026. Source-bounded negative.** None of the 1,132 unmodified unsolved GP29 rune words of length five or greater decodes to the independently assembled 12,314-entry source-native GP lexicon when **any one of six genuine previously solved Cicada operations** is restarted at that word. Even if the selector can choose a different operator for each printed word, the candidate decoder has no complete word-level route through those 1,132 lexical targets. This recovers **no unknown plaintext, original key, cipher or destination**.

This is a distinct decision from the five numbered Wisdom paragraphs previously tested under five different historical methods in first-solved order. Here the entire original 2,896-word book is covered and each word receives **every possible method choice**, with no forced pairing between an original passage number and a cipher.

## Human-facing premise and independent sources

The manuscript visibly retains 2,896 printed word boundaries, despite 12,956 unrecognizable GP29 rune symbols. The solved LP1 texts use Atbash, keyword Vigenère and Atbash-plus-three variants; solved LP2 p56 demonstrably uses consecutive prime-totient GP addition with plaintext-F bypass. A human might try choosing the required operation at each word boundary, perhaps using a word's length, first rune or an external selector. Before guessing such a selector, test the stronger necessary condition: **does *any* one-word English reading appear at all** under this tiny already-authored repertoire?

The six exact, independently fixed operations, acting on each complete original rune word at source phase zero, are:

| Method | Original-known transform |
| --- | --- |
| Direct | GP29 identity |
| LP1 *A WARNING* | Atbash: `P=28−C mod29` |
| LP1 *A KOAN* | Atbash plus three: `P=31−C mod29` |
| LP1 *WELCOME* | Vigenère `P=C−K`, `K=DIUINITY` (canonical GP spelling of `DIVINITY`) |
| LP1 second *A KOAN* | Vigenère `P=C−K`, `K=FIRFUMFERENFE` (source-native GP spelling of `CIRCUMFERENCE`) |
| LP2 *AN END* | `P=C−(prime(j)−1)`, first prime 2 |

On keyed methods both the ordinary every-symbol advancing cipher and **the complete authentic plaintext-F-transparent variant** are tested. Literal plaintext F emits ciphertext F and retains the cipher clock; an observed ciphertext F may also represent an encrypted non-F. Every legal bypass interpretation is retained, with no language-based path pruning.

GP29 lexicon sources are the already pinned Shakespeare 300k extract, Gibran *The Prophet*, Emerson *Essays*, editor-normalized solved LP1, and **all exact source-native solved runic words** in the nine records of `resources/external/relikd-solved-gp29-native-v1.json`. English normalizations match the established GP source spelling rules, including QU→CW, ING→NG, V→U and K/Q→C. A rune word is accepted only if its **entire** ordered GP index array exactly matches one independently provided lexicon word. The 12,314 distinct GP words include native solved-source spelling alongside approximate English-to-GP conversion. This is a finite lexical reference, not a complete English dictionary.

All original word breaks are taken from `resources/lp2-transcription.txt`; physical line wraps and page wraps do not end words. The six nonrunic printed Arabic numerals 7 and 1–5 are excluded rather than converted to fictional GP symbols. The concatenated 2,896 source words are asserted exactly equal to the original `lp2-corpus.json` array of 12,956 GP29 indices. Physical p50 supplies no rune text.

## Full-book original-cipher decision

| Exact original rune-word length | Number of source words | With any one of six methods, including all F-bypass histories |
| ---: | ---: | ---: |
| 3 | 720 | 71 |
| 4 | 513 | 7 |
| **5** | **317** | **0** |
| **6** | **256** | **0** |
| **7** | **216** | **0** |
| **8** | **156** | **0** |
| **9** | **78** | **0** |
| **10** | **52** | **0** |
| **11** | **32** | **0** |
| **12** | **18** | **0** |
| **13** | **4** | **0** |
| **14** | **3** | **0** |
| **All lengths 5–14** | **1,132** | **0** |

The small 3- and 4-rune matches arise from the expected ambiguity of short code groups. No dictionary entry with at least five GP runes is recovered under the fixed word-initial key phase. These are finite exhaustive **method-choice** results: if the plaintext consists of words in this lexicon and an independently chosen method from these six is reset at every printed word, at least the longer original words would have to match a candidate, but none does.

A generous robustness extension permits **every initial phase** of the full eight-rune DIVINITY and thirteen-rune FIRFUMFERENFE keys for every word, with every F-bypass history, in addition to all six base operations. It finds **one** five-rune source word: ciphertext transliterated `I F C OE EO` maps to `FLAGS` under DIVINITY at initial phase 3, without a bypass. The match makes no independent original prediction or source-selected phase and is **not authenticated plaintext**. There are **zero six-or-longer original words** recovered under this larger, unselected phase family.

## Positive controls, limitations, and decision

The reproducer implements the genuine p56 85-rune original prime-totient ciphertext, including its unique known transparent plaintext F, and recovers the actual opening `ANENDWITHINTHEDEEPWEB` while spending 84 prime-key steps. It separately constructs **1,132 source-length-matched GP English words**, encrypting them with an independently chosen one of the six methods in round-robin order and applying real plaintext-F transparency for keyed ciphers. The same decoder recovers every planted word exactly with its appropriate method. These controls demonstrate that the scan could recognize an actual mixed historical method cipher in the specified family.

**Decision:** direct word-by-word reuse of Cicada's six proven GP operations does not explain unknown LP2 as lexicon-covered GP English, even granting a freely secret choice of method per printed word. This is more restrictive than an unknown word-level key schedule, arbitrary word-rotor alphabets, different orthography, a larger text vocabulary, non-English plaintext, changed word boundaries, cryptographic layering, or cipher clocks carried continuously across words. It also does not imply a solution from the lone postselected `FLAGS` match. New research should obtain an original, independent operator/key/reset instruction and recover contiguous source-native plaintext before promoting a decoded phrase.

Reproduce with [the exact original-source Windows/Node22 CommonJS SFT](../sims/lp2_wordlocal_known_method_mixture_sft.cjs). It preserves and checks all 12,956 source rune indices, prints the per-length exact counts and the full phase-extended match, and executes all genuine/planted positive controls. A separately triggered [manual workflow](../.github/workflows/agent40-wordlocal-known-mixture-manual.yml) runs `node --check` and this SFT.

# LP2 word-length/position secret alphabets: a key-free original-cipher obstruction

**Agent 33, 11 November 2026. Classification: exact invariant and conditional native-language architectural exclusion. No unknown plaintext, key, historical cipher or destination recovered.** Executable single-file regression: [`sims/lp2_wordlen_position_secret_alphabet_sft.cjs`](../sims/lp2_wordlen_position_secret_alphabet_sft.cjs).

## The question

Suppose the printed word delimiters are plaintext delimiters, and the cipher uses a fresh secret 29-symbol substitution alphabet for **each distinct pair (total rune-word length, position within that word)**. Such a system can make the aggregate ciphertext almost uniform, and it can move two equal plaintext symbols inside one word to *different* output symbols because their positions select different alphabets. It evades the previously documented exact **one alphabet per whole word** equality-partition invariant ([parent constraint](wordwise-equality-invariant.md)).

Allow the key to contain **42 completely arbitrary independent permutations** for all positions in words of length 3 through 9. There is no fixed shift, additive mask, matrix or assumed symbol ordering:

`C[w,j] = sigma_(L,j)(P[w,j]), L = length(w), j = 0..L-1`.

Each `sigma_(L,j)` is an independent unknown bijection `{0..28}->{0..28}`; the same key table is reused when the pair `(L,j)` recurs anywhere in the book. It may be chosen adversarially to match the manuscript. The model is lossless: knowing these permutations gives the unique symbolwise inverse and preserves every original visible word boundary. Its weakest assumption is historical: no authentic Cicada instruction currently selects length-and-position-keyed alphabets. It is an especially permissive **mathematical superfamily** of word-position Caesar, affine and arbitrary polyalphabetic substitutions, tested to avoid blind key hunts.

## Exact key-independent invariant

For any fixed `(L,j)`, take all original ciphertext words with length `L` and count the rune at position `j`. Let `n_(L,j,r)` be the number of occurrences of rune `r`. An arbitrary bijection only renames symbols, so the unordered histogram values and the exact ordered equal-rune pair count

`E_(L,j) = sum_(r=0..28) n_(L,j,r) * (n_(L,j,r)-1)`

are invariant under **every possible secret alphabet** `sigma_(L,j)`. Let `N_L` be the count of length-`L` words and `T_(L,j)=N_L(N_L-1)`. The pooled collision rate `Q = sum E / sum T`, pooling 42 `(L,j)` strata, is therefore invariant for this entire cipher family. Because this is a necessary relation for all secret keys, an English-like plaintext whose corresponding source `Q` is substantially higher cannot have produced the original under this fixed-key architecture.

## Original source and native-language controls

Source of untouched ciphertext: [LP2 transcription](../resources/lp2-transcription.txt) crossed with [GP29 alphabet](../resources/liber-primus/lp2-corpus.json). Join physical lines and pages without creating word breaks, retain original dot/hyphen/section punctuation as actual delimiter positions, keep the first 55 rune-bearing unknown physical pages (original p50 is runeless), and assert the established **2,896 words / 12,956 runes**. The test uses all source words of rune length **3 through 9** without selecting any language-matching subset.

Two independent GP-native language references are [300k-character Shakespeare control](../resources/control/shakespeare_first300k.txt) and [solved LP1 text](../resources/liber-primus/lp1-plaintext-reference.txt), GP29 tokenized by the repository's conventional TH/NG/EO/OE/AE/IA/EA digraph and K→C/V→U/Z→S rules. For a fair length distribution comparison, calculate each reference's `Q_(L,j)` separately and **weight it by precisely the original ciphertext's `T_(L,j)`**. This compares original position marginals to the same-length English marginals without assuming the reference's actual numbers of words match LP2.

| GP29 length-position collisions | Result |
| --- | ---: |
| Original unknown ciphertext, length3–9, strata | **42** |
| Original eligible ordered source-word pairs across strata | **4,068,778** |
| Original equal-rune ordered pairs across strata | **140,454** |
| Original collision rate | **0.0345199467752** |
| Shakespeare GP-English, original-stratum weighting | **0.1079451720091** |
| Independently solved LP1 GP-English, original-stratum weighting | **0.1127598342334** |
| Uniform independent GP29 reference | **1/29 = 0.0344827586207** |

The original result is close to the uniform GP29 rate at every long, well-sampled stratum. For example, the original 720 three-rune words produce positional collision rates **0.03455803, 0.03482074, 0.03458507**. The independent Shakespeare values at those same positions are **0.09644299, 0.14885218, 0.09658738**. For original 513 four-rune words, the four source rates are **0.03367903, 0.03490497, 0.03482121, 0.03494304**, while Shakespeare gives **0.06891563, 0.15060156, 0.08419830, 0.13909066**. Thus the difference is a repeated within-stratum structural feature rather than a failure to recognize the global GP alphabet.

## Reversible native-English positive control

The SFT samples authentic Shakespeare-GP words **with precisely the original length3–9 word-length sequence**, using a fixed xorshift32 seed `0x53013301`. It generates 42 independent secret GP29 alphabet permutations, one for every `(L,j)`; encrypts every rune; applies the 42 inverse permutations; and asserts exact recovery of **every planted rune**. It separately asserts that the integer `E_(L,j)` is **identical between planted plaintext and its ciphertext** for every one of the 42 strata, demonstrating directly that arbitrary secret alphabets cannot erase the English collisions this original-source gate detects. This is an architecture-sensitive implementation control, not evidence of the authentic cipher.

## Decision and remaining mechanisms

**Reject a book-fixed 29-way bijective substitution alphabet chosen by visible word length and within-word position as a direct explanation for ordinary GP-English LP2 plaintext.** Since every conceivable secret table under this exact model preserves the 42 position-conditioned coincidence counts, no key search can rescue the native-English register under printed word boundaries. A globally repeated positional Caesar, affine or alphabet-permutation key is a restricted case and inherits this limitation.

This does not exclude key alphabets changing across pages, sections, word occurrences, or hidden clocks; symbols keyed to preceding ciphertext state; transposition or extra runes; an encrypted intermediate register with uniform symbols; or printed word delimiters having no plaintext role. Those are materially different architectures and need independent source selectors. In particular, the exact comparison is conditional on native GP-English frequencies, since a contrived message can have uniformly spread `(L,j)` histograms without violating the permutation theorem.

**Research consequence:** The book-wide positional-alphabet explanation supplies no inverse and should not motivate another unconstrained permutation scan. Progress requires an original clue that defines a changing key epoch/state or shows how to recover plaintext word boundaries; existing signed-message and p15 clues do not provide that operation by themselves.

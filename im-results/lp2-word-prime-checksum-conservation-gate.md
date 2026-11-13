# Original LP2 word-prime checksum conservation: all-secret necessary-condition obstruction

**Agent 23, 13 November 2026. Classification: a bounded, key-independent exclusion of one specific class of native-word transformations. No unknown plaintext, author-selected key, or destination was recovered.**

## Why this matters to an intended solve path

The signature-verified 2016 Cicada statement explicitly associates **words, numbers, and direction**. Earlier solved stages demonstrate addition of Gematria Primus prime weights for a whole word, and the 2014 LP1 Wisdom magic square uses source word sums. This makes it natural to ask whether **the original ciphertext words carry the same prime-sum numerical value as their plaintext words**, conceivably allowing navigation before decryption. If that were true, the author could secretly permute the runes within a word, or use another keyed, sum-preserving wordwise transformation, while leaving word-number directions visible.

The smallest printed words provide a direct necessary-condition test of this architectural premise, without guessing keys or deciphering any unknown word. The premise assumes the original typographic word boundaries and rune counts are preserved, and that the intended cleartext is ordinary English in its established native GP rune spelling. It does not claim that the Cicada authors explicitly prescribed a sum-preserving cipher.

## Source, invariant, and exact original evidence

Read the canonical 55 rune-bearing unknown LP2 physical pages (p0–55, with p50 runeless) from `resources/liber-primus/lp2-corpus.json`. Join the printed line and page wraps, retaining punctuation and hyphen word boundaries from `resources/lp2-transcription.txt`, using the existing `sims/lp2_word_pages.cjs` conventions. The resulting source has **12,956 GP29 ciphertext runes and 2,896 complete typographic words**, including **83 words of one rune**. Those 83 ciphertext tokens contain **28 distinct** GP glyphs.

Let `w` be a printed rune word and `S(w)` the sum of published GP prime weights of its runes. Consider either frozen, entirely key-agnostic claim:

1. Exact word-prime conservation: `S(C_word) = S(P_word)`.
2. Modular word-prime conservation: `S(C_word) ≡ S(P_word) (mod 29)`.

At length one, even an arbitrary secret permutation or complicated bijective transformation must obey this equality if the word's *rune count* and its numerical checksum are preserved. In ordinary English the complete one-letter words are **A** and **I**; conservatively also admit the archaic English vocative **O**. Their exact native GP prime weights are **97, 31, 7**, and their residues mod29 are **10, 2, 7**.

| Frozen necessary condition on all 83 original one-rune words | Original compatible | Original incompatible |
| --- | ---: | ---: |
| Exact prime sum in {97, 31, 7} | **10** | **73** |
| Prime sum mod29 in {10, 2, 7} | **14** | **69** |

In the modular case, extra ciphertext labels such as **F** and **D** are accepted whenever their prime weights happen to share the permitted residue. Thus the 69 violations are counted after giving the hypothesis this additional freedom. The result is exact over the published source transcription and does not require a statistical reference corpus, a secret-key search, or assuming that the secret alphabet is a simple substitution.

## Control, decision, and limitations

The accompanying CommonJS source test creates 83 authentic native single-rune words from the allowed A/I/O inventory, adds actual solved p57 original rune words (95 runes), and reverses every word as an example of a secret wordwise permutation. Both full and modulo29 prime checksums are conserved identically under that plant, and all **83/83** planted English singleton tokens satisfy the checksum constraints. The script asserts exact original word/rune census, matching rune order against the canonical page corpus, the 73/69 failure counts, and the plant.

**Decision:** A global wordwise cipher that preserves **each word's actual GP prime sum or its residue modulo29**, while preserving the original printed rune lengths and spelling ordinary English, is impossible on the 83 unchanged original single-rune words. This closes even arbitrarily keyed sum-preserving substitution/permutation proposals under those conditions, rather than testing them individually.

The observation neither invalidates using *ciphertext* prime sums to navigate nor excludes a cipher that changes sums, changes plaintext word segmentation, introduces null words, represents non-English/plaintext data, or uses an external book-number convention. It cannot identify a cipher or reveal a single unknown plaintext letter. Future word-number decoding proposals must explain why their operation is compatible with these source one-rune words; merely showing a matching sum on selected longer words is insufficient.

**Reproducer:** [`sims/lp2_word_prime_checksum_conservation_sft.cjs`](../sims/lp2_word_prime_checksum_conservation_sft.cjs), a standalone Node.js 22 CommonJS original-source SFT. [Original repository Windows/Node.js 22 run 43512212466](https://github.com/FlareZ123/liber-primus/actions/runs/43512212466) passed all assertions and printed 83 source singleton words, 28 distinct singleton glyphs, 73 exact and 69 modulo29 violations, plus the authentic p57 plant. The original counts and source transcript geometry were also computed independently from GitHub's published JSON and rune text before the test was committed.

# LP2 printed-word collision: fixed per-word encryption cannot explain English-register repetitions

**Agent 33, 16 November 2026. Evidence class:** an exact key-independent original-ciphertext invariant with source-length-matched GP29 literary controls. This is a bounded architecture exclusion. It recovers **no unknown plaintext, author-selected cipher, secret key, or destination**.

## Source clue and decisive question

The original printed Liber Primus word separators are unusually stable source features. Cicada's authenticated 2016 message describes the book's **words** as a map. A human solver could therefore try a keyed lookup or format-preserving transformation of each whole printed word, possibly with a fresh secret dictionary for each visibly illustrated chapter or each physical page. Such a dictionary could have arbitrarily complex cryptography and a totally unknown key.

The decisive necessary condition for any *deterministic occurrence-independent* word cipher is elementary:

```
For a fixed secret dictionary E_s in section s:
if plaintext_word[i] == plaintext_word[j],
then ciphertext_word[i] == ciphertext_word[j].
```

The encryption can map different words to the same output, but it cannot map two occurrences of **the same plaintext word** to different outputs unless it uses context, a nonce, position, feedback, or a changing key. Assume original word boundaries and GP-word lengths survive this candidate cipher, and word order within each chapter is unchanged. Then any original GP-cipher word with length at least four can coincide with an ordinary GP-English word of that length. This is a fully unknown-key prediction that can be decided directly from the original ciphertext.

The code checks `resources/lp2-transcription.txt` against every original GP rune of `resources/liber-primus/lp2-corpus.json`, joining line and page wraps, including rune-free physical p50 correctly, preserving original word boundaries. It obtains exactly **12,956 original runes and 2,896 complete source words**. There are **1,645 words of GP length 4–14**.

## Exact original observation

**All 1,645 original ciphertext words of length at least four are mutually distinct.** This means **zero exact repeated-word pairs** over all nine unknown illustrated chapters. There are 513 printed four-rune words, 317 five-rune words, 256 six-rune words, 216 seven-rune words, and 343 longer words. Even allowing **nine entirely different unknown word dictionaries**, the same observation holds within each original chapter. A still stronger test below allows **55 independent physical-page dictionaries**, one for each rune-bearing page.

| Original visual chapter | GP runes | Printed words | Length 4+ words | Repeated pairs of length 4+ |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 729 | 158 | 89 | **0** |
| 2 | 1,145 | 255 | 147 | **0** |
| 3 | 1,729 | 383 | 220 | **0** |
| 4 | 1,903 | 437 | 241 | **0** |
| 5 | 1,021 | 224 | 133 | **0** |
| 6 | 1,433 | 326 | 180 | **0** |
| 7 | 1,680 | 378 | 211 | **0** |
| 8 | 3,008 | 669 | 385 | **0** |
| 9 | 308 | 66 | 39 | **0** |

Source-visible chapter cuts are global rune offsets `0,729,1874,3603,5506,6527,7960,9640,12648,12956`, and every cut is between whole printed words. The table is a fixed source inventory, not a tuned partition. Original words of lengths 1–3 do repeat, as expected from the much smaller corresponding rune spaces, so the parser does detect genuine repetitions.

## Native-GP literary positive controls

Three existing, independent reference sources were normalized using the repository's established Gematria Primus tokenizer (greedy multigraphs; QU→CW, V→U, K/Q→C, Z→S). For each original word, sample a **whole** source word from the reference's words having its **exact GP-rune length**. This fixes the precise original 2,896-word length inventory. It neither guesses plaintext values nor fits the original ciphertext. The only statistic is the number of pairs of exactly equal complete GP words of length at least four.

| Native GP source | 2,000 full-book draws: min / mean / max pairs | 1,000 chapter-local draws: min / mean / max | 2,000 page-local draws: min / mean / max |
| --- | --- | --- | --- |
| Shakespeare | **2,085 / 2,714.100 / 3,479** | **297 / 384.071 / 545** | **27 / 49.941 / 85** |
| Gibran, *The Prophet* | **3,350 / 4,642.603 / 7,211** | **470 / 657.305 / 954** | **51 / 85.268 / 134** |
| Emerson, *Essays* | **1,587 / 2,012.912 / 2,674** | **212 / 285.845 / 376** | **18 / 37.158 / 63** |
| Original LP2 ciphertext | **0** | **0** | **0** |

All nine independent control groups have **zero out of 1,000 or 2,000 samples** at or below the original count. These finite source-conditional samples are **not** a universal probability theorem about every possible human language, highly specialized authorial prose, or texts deliberately engineered never to repeat a GP word. The controls are much stronger than counting collisions in alphabet-uniform random strings because they retain native repeated whole-word frequency and the exact original word-length inventory.

**Page-local all-key extension:** Physical page breaks are an additional original-source reset candidate. Of the 2,896 complete words, exactly **32 cross a physical page boundary**. Exclude all 32 entirely before testing any page-specific codebook, leaving **1,617 complete GP length-4+ words** lying fully inside one of the **55 rune-bearing physical pages**. The exact original still has **zero duplicate long-word pairs within each page**. In 2,000 length-matched complete source-book resamples, even the least repetitive held-out author control produces **18 page-local repeated pairs** (Emerson); all three controls are strictly positive in every run. This excludes the direct page-reset deterministic whole-word model without assigning an ambiguous key to a page-crossing word. A cipher that changes keys **inside** a word or depends on that word's occurrence remains outside the excluded family.

As a positive encryption control, construct 2,896 native GP source words with the same original length sequence, then apply a reversible fixed Caesar permutation `r ↦ (r+17) mod29` to *each word*. Its **4,543 length-4+ repeated-word pairs** are preserved exactly under encryption and inverse. This demonstrates the invariant on actual source-shaped English even with a secret rune substitution.

By comparison, a uniform GP29 no-immediate-repeat word generator has **0.209170315** expected same-word collision pairs over the 1,645 original length-4+ slots. Its approximate zero-collision probability is about **0.81** under the small-mean Poisson approximation. Therefore observing zero original collisions is entirely compatible with random-looking encrypted rune output; the discrepancy is specifically with *deterministic encryption of repeated natural-language word types*.

## Cryptanalytic decision and next route

Reject the claim that ordinary repetitive GP-English plaintext is encoded by **one static whole-word dictionary for the entire book, each original visible chapter, or each physical rune-bearing page**, under original word lengths, boundaries and within-chapter order. This applies to arbitrary secret deterministic dictionaries and format-preserving word permutations; replacing a Caesar map with a stronger static cipher cannot overcome the repeated-word invariant.

The observed signal instead demands **occurrence-dependent cipher state or a nonliteral/reshuffled plaintext word segmentation** if ordinary GP-English prose underlies the source. The next useful original decoding hypothesis must specify the source of that changing state or the operation that restores genuine word boundaries. Changing a static dictionary key alone cannot recover ordinary source-like prose. This result does **not** prove the original is a particular cipher family or that the visible separators were intended as plaintext spaces.

The read-only, standalone CommonJS reproducer is [`sims/lp2_longword_collision_static_cipher_sft.cjs`](../sims/lp2_longword_collision_static_cipher_sft.cjs). It asserts source-original rune equality, original word and chapter counts, all collision invariants, native-GP length-matched tests, a reversible planted positive and the random-stream expectation. The same computations were independently executed against current repository tool-returned source bytes during this investigation. No original inputs were modified.

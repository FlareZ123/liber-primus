# Exact repeated two-word phrase at LP2 p27 and p55

**Status: original-ciphertext observation with a quantified conditional word-order control, 14 November 2026. No recovered unknown plaintext or key.** This is a compact new constraint for a prospective source-selected cipher inverse. It does not justify assigning the phrase a guessed English meaning.

## Direct original-source fact

The same complete, printed two-word rune phrase occurs at precisely two places in the unresolved LP2 manuscript:

| Location | Original printed context | Ciphertext start |
| --- | --- | --- |
| **Physical p27, original image 44.jpg** | `... ᛒᚠ-ᛞᛄᚢ-ᛒᛖᛁ-ᚫᚠ ...` | Page-local 0-based rune **28**, book-global **6555** |
| **Physical p55, original image 72.jpg** | `... ᚳᛉ-ᛞᛄᚢ-ᛒᛖᛁ.` | Page-local 0-based rune **70**, book-global **12950** |

The exact six-rune tape is **`ᛞᛄᚢᛒᛖᛁ`**, GP29 indices **[23,11,1,17,18,10]**, or inventory transcription **DJU-BEI** with the genuine printed word division after the third rune. The p27 illustration shows an insect wing above a new red-heading section. P55 ends the last unknown section with the same two words and a full-stop before the known p56; its image shows a winged moth/cicada below the text and a tree above it. The visual parallel is suggestive, but authorship of the repeated phrase as a cipher clue is unproved.

**Both three-rune words appear only twice in the source, and every occurrence of each is in this exact same adjacent pair.** In the 12,956 unmodified unknown rune stream, this is the sole six-rune substring appearing at two distinct positions. There is no recurring seven-rune substring. The two global offsets differ by **6395 = 5×1279**, so the exact duplicates share the same global modulo-five phase. One aligned repeat has a 1-in-5 phase expectation under a uniform phase null, and does not establish a period-five keystream.

Original artwork bytes, supplied with this project: `liber-primus-jpegs/44.jpg` 580,041 bytes, SHA-256 `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e`; `liber-primus-jpegs/72.jpg` 614,928 bytes, SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`. Source text is `resources/transcriptions/liber_primus_master.txt` (original full-text positions 12896 and 22193) and source GP29 indexes are `resources/liber-primus/lp2-corpus.json`. The byte hashes identify the supplied images; the published rune transcription remains derived rather than image-native ground truth. Both phrase locations were also visually inspected on the supplied originals.

## Why a word-preserving coincidence is narrower than a random six-rune match

The runic source's authentic word breaks leave **2,715 directly adjacent complete word-pair slots on individual printed source lines** after joining line wraps. Exactly **one** complete pair repeats anywhere in these 2,715 source slots: `ᛞᛄᚢ-ᛒᛖᛁ`. Thirty-two words continue across page boundaries, so a raw page-fragment tokenizer obtains 2,928 rune tokens rather than the canonical 2,896 complete printed words. This distinction does not affect the observed two pairs.

A controlled null freezes the *positions* of every 3-rune word and all printed spacing/punctuation, then randomly permutes only the **726 original three-rune token identities** among those positions. This holds fixed the exact three-rune-word counts (710 different strings, 15 duplicated identities) and the **174** eligible adjacent 3+3 slots. The observed motif occupies two of those eligible slots. The model asks: how often would **any** 3+3 pair repeat if the rare original word types were merely distributed by chance among the fixed word-length positions?

Rather than rely solely on a simulation p-value, count every possible pair of the 174 slots and analytically bound the chance that two phrase labels collide.

- There are 15,018 unordered pairs of *disjoint* 3+3 slots and 33 unordered pairs sharing one three-rune token position.
- For the exact multiset of 726 three-rune tokens, `Σ n_i(n_i−1)=34`, `Σ [n_i(n_i−1)]²=92`, and `Σ n_i(n_i−1)(n_i−2)=6`.
- Two disjoint slots match with exact probability `(34²−92)/(726·725·724·723)=3.86180319216×10⁻⁹`.
- Two overlapping slots match with exact probability `6/(726·725·724)=1.57448329395×10⁻⁸`.
- The resulting expected count of duplicate 3+3 phrase pairs is **0.0000585161398268**. By Markov/union bound, the probability of *any such duplicated phrase pair* under this precisely declared null is **at most 5.851614×10⁻⁵**. A separate fixed-seed, 500,000-shuffle pilot saw 35 replicates with any duplicated 3+3 phrase (empirical 7.0×10⁻⁵, consistent with sampling uncertainty).

This is **conditional on a global exchangeability model for three-rune words**. It is not a fully discovery-corrected probability that Cicada intentionally authored the repeat; language, section conventions, known ciphertext structure, multiple other investigated features, and possible copy-editing practices all affect interpretation. The model does not test whether the plaintext is the same under different cipher states.

## Causal route and stopping decision

A reasonable human solver could notice the exact two-word terminal phrase, recognize the wing-to-insect visual recurrence, and ask whether the same words mark a refrained statement or key-state reset. The two original ciphertext positions impose a **six-position equality constraint** any proposed encoder must explain. The primary question is whether an **independently source-selected, reversible** transform recovers meaningful text *at both places* while predicting separate untouched original passages. If a stateful cipher encrypts the same plaintext differently depending on state, these identical ciphertexts need not stand for the same plaintext. Do not fix a guessed phrase such as YOU ARE, SEE YOU or ONE DAY to define a six-symbol key. Such a crib is unconstrained.

Useful next investigation: compare wing/p27 and terminal moth/p55 source-selected **local state boundaries or chapter-heading operations** to see whether a common reset actually follows from the images/printed structural clues, with an untouched original page as discriminator. The modulo-five alignment alone is too weak to select the clock. An independently sourced phrase or authenticated historical key would make the recurrence an unusually valuable *two-location crib*; absent that input, this is a high-specificity structural finding and **no unknown plaintext has been decrypted**.

**Exact self-contained reproduction:** [`sims/lp2_p27_p55_duplicate_two_word_sft.cjs`](../sims/lp2_p27_p55_duplicate_two_word_sft.cjs). Reads the unchanged canonical rune corpus and master manuscript, verifies all original addresses, enumerates every original six-rune collision and printed two-word repeat, and computes the exact conditional word-shuffle union bound. Node.js 22 CommonJS; no stochastic optimizer or plaintext fitting.

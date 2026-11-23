# Secret word-length alphabets: all-key second-rune differential obstruction

**Agent16, 23 November 2026. Classification: exact original-cipher, lexicon-conditioned negative decision; no recovered LP2 plaintext, creator-selected cipher or final destination.**

## Why this operation is a candidate

The original 2016 Cicada message says that Liber Primus's **words** are the map and their **numbers** the direction. A human-visible, economical interpretation of a word's number is its *printed GP29 length*. The original solved LP2 p56 supplies authentic modular GP29 arithmetic, so a reversible **cumulative rune cipher with secret alphabets selected by printed word length** is an executable and falsifiable idea. It is **not** prescribed by the signed message: “numbers” might mean a prime sum, location or index rather than length, and no 2014 source identifies this cumulative operation.

For every original printed complete word of length `L`, suppose

```text
C_i = (C_(i-1) + Pi_L(P_i)) mod 29.
```

Here each `Pi_L` can be any secret permutation of all 29 GP symbols, reused by all words of length `L`. At the first rune of a word, allow *any* prior ciphertext state, including a different page or word IV. At the next rune of **every two-rune word**, however, the state cancels:

```text
(C_1 - C_0) mod 29 = Pi_2(P_1).
```

Thus the multiset of differences must be a mere unknown permutation of the multiset of genuine plaintext **second runes** in those words, even across all page resets. No computation of any of the 29! secret assignments is required. This model is distinct from unrestricted timestamp-private alphabets or nonstationary GP30 segmentation.

## Direct source and genuine result

Parse the physically printed LP2 p0–55 rune transcript with page/line wraps preserving words. The unknown book contains **2,896 complete printed words**, including **448 genuine two-rune words** and **32 page-carried words**. Exactly all **29 possible GP29 delta values** occur at least once as the second-rune ciphertext difference of a two-rune word.

The histogram ordered by zero-based GP29 values 0–28 is

```text
[1,13,14,15,15,17,20,17,15,18,13,15,16,10,14,
 9,23,18,20,12,20,11,16,20,20,16,18,21,11]
```

The separate, authentic solved-Cicada source corpus's **178** natural two-rune words use only **nine distinct second-rune GP glyphs**. Under any single fixed secret `Pi_2`, an exact plaintext drawn entirely from that authentic two-rune spelling support could produce at most nine distinct cipher deltas. The original has29, so this **strict register is impossible under any secret key**.

To avoid mistaking the limited original solved donor for the whole English language, use the independent **TextBlob/Norvig English word-frequency lexicon** already preserved in `resources/control/english_wordfreq_textblob.txt`, normalize Latin words into canonical GP29 multigraphs and filter to words exactly two GP runes long. That exceptionally broad list contains **181 distinct possible two-rune spellings**, whose *final rune* occupies **26 distinct GP29 symbols** (missing `TH,J,AE`). The best arbitrary unknown `Pi_2` must assign those26 legal ending categories to the **26 most frequent observed delta values**, so at least the three least frequent original differences, with counts **1,9,10**, remain unmatched. Thus **at least20/448 original two-rune words** would need vocabulary beyond *this entire broad English lexicon*, whatever the secret alphabet or first-rune plaintext might be.

If words are restricted to independently listed English GP2 spellings occurring at least **20 times** in the source dictionary, only **58 distinct spellings** remain, with **18 allowed trailing rune glyphs**. The mathematically most favorable secret assignment still forces **123/448 original two-rune words** outside that frequent vocabulary.

These are exact necessary support bounds conditional on an *intact two-rune word* and a shared secret length-two permutation. The finite lexicon is not a proof about all archaic or invented English words, and an author can choose rare vocabulary. The **29/29 source delta support** is nonetheless unambiguous and unaffected by fitting any GP29 secret permutation.

## Replay and interpretation

The read-only standalone [CommonJS SFT](../sims/lp2_wordlength_delta_suffix_allsecret_sft.cjs) asserts all original counts and its exact 29-bin histogram, independently counts each solved-native donor, normalizes and bins the large English lexicon, computes the optimal unknown-key lower bounds, and generates **448 native two-rune plaintext words encrypted with an arbitrary seeded 29-symbol permutation**. It then verifies exact inverse plaintext reconstruction and that the encrypted native words retain their genuine permitted terminal-symbol support. It **passed Windows Node22 CI [run45121509883](https://github.com/FlareZ123/liber-primus/actions/runs/45121509883)**.

**Decision:** Retire the literal `fixed alphabet selected by printed word length + cumulative GP29 differential` as a direct path to ordinary common-Cicada-register English on intact original word slots. The broader original-sourced full-English lexicon demands at least20 unexpected words among448 even after granting an unrestricted secret permutation, and the solved-Cicada 9-ending register is categorically incompatible. The evidence gives no genuine new plaintext.

Further effort must discover an **independently source-selected new state transition**, changing alphabet by more than word length, or an actual hint allowing word boundaries and key material to be obtained. Blindly broadening the dictionary or adding private exceptions until all29 differences can be absorbed does not identify an authored key or decoder.

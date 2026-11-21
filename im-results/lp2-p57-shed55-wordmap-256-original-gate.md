# PARABLE 55 interior runes as LP2 word addresses: a 256-rune extract, not a cipher breakthrough

**Agent22, 21 November 2026. Classification: original-source-exact exploratory extraction with a decisive conditioned null and original-table decoder negatives. No recovered unknown plaintext, authentic key or destination.**

## Human-visible proposed route and exact output

The authentic clear original p57 PARABLE page says, “WE MUST SHED OUR OWN CIRCUMFERENCES.” The literal 19 black body words have **88** GP29 runes; discard the two outer runes of each word to retain **50**. The original red heading PARABLE has seven GP runes; discard its two endpoints P and E to retain **five** `ARABL`. This was independently proposed and linked to the **50+5** child branches in the provisional original p50 table graph by Agent37 ([earlier report](lp2-p57-title-body-50-5-tree-edge-gate.md)). The new extraction asks whether these **55 source runes** might be physical-page word addresses, prompted by signed 2016 text “WORDS ARE THE MAP ... NUMBERS ARE THE DIRECTION.”

Use the GP rune's **zero-based 0–28 index**, retain the body/interior printed order, map the first50 labels to physical unknown pp0–49, then the last five to pp51–55, and select the printed word that **begins** at that zero-based ordinal on its page, wrapping cyclically only when it exceeds the number of original complete words. Original p55 starts with a continuation of a word beginning on p54; count that complete word on p54, avoiding double counting across physical pages. This uses 55 original source-selected ciphertext words from the 2,896 complete unknown words.

Exactly **two** word-index wraps are needed: the p51 red label A at GP0=24 on a 20-word page selects ordinal4, and p55 red label L at GP0=20 on a 16-complete-word page selects ordinal4. Both are out-of-range without the **additional, unconfirmed cyclic indexing convention**. The 55 selected words contain **256 runes**, exactly equal to the original numeric p50 table's **256** base60 cells. The unique 256-rune Unicode GP sequence has SHA-256:

```text
ec9047f3f9d4ca9466dcc35ff804e318427b077f46a0aa6933aed0e702ae76e3
```

Its GP0-byte sequence has SHA-256 `989cecadf5fbae676d144c332a77461b48fd6ba779e431747260735c92deb3e7`. These hashes are only input identifiers, not the manuscript's known SHA-512 target.

## Original-table inverse: fails

The most direct reversible consumer of matched length is to combine the 256 selected original GP29 rune indices with the 256 original **base60** numeric cell values modulo29, position by position. All calculations use the unaltered source, with no cipher fitting or withheld data:

| Unchanged 256-rune register | GP29 IoC |
| --- | ---: |
| Source-selected ciphertext words | **0.034406** |
| Selected rune − table byte residue (mod29) | **0.032322** |
| Selected rune + table byte residue (mod29) | **0.037163** |
| Native solved p57 plaintext repeated to 256 runes, control | **>0.060** |

Exactly **8 of 256** table byte residues equal the corresponding source rune. This is near the ordinary uniform baseline **256/29=8.83**. Native GP29 source plaintext planted using the same direct table key decodes **256/256 exactly**, validating the inverse's mechanics.

A bounded *second* source-shaped consumer recognizes that each original table byte has the unique decomposition `b=29q+r`, where **q∈0..8**, the count of the nine original LP2 illustrated chapters. Select one red heading from each chapter (the actual eleven-rune *main/lower* title for p15), derive chapter keys by GP0 sum, GP-prime sum, first rune, or last rune, and apply ±chapter-key with/without the original table remainder. Across all **16** fixed, whole-stream native GP29 variants, the highest IoC is **0.03670**. No variant resembles readable GP29 English. No key, language model parameter or source word was fitted to produce this figure.

The same 256-rune selection encoded as Unicode UTF-8/UTF-16, zero-based GP index bytes/hex, GP-prime bytes, padded numeric indices or rune UTF-16BE fails the original solved-p56 **512-bit terminal hash** in each of the three natural `SHA-512`, `SHA3-512` and `BLAKE2b-512` families: **0/21 matching preimages**. The original page does not specify which hash algorithm or representation was intended, so these failures are strictly bounded. The terminal hash itself is already available in the manuscript's solved-p56 research, and this extraction does not prove that the hashed resource is even text from the book.

## Why the exact 256 is weak

The source-selected key order is one among many ways to assign those particular 50 black and five red GP labels to the physical 50+5 pages. To measure whether **256** unexpectedly links two original objects, shuffle the **50 interior labels only within their first 50 pages** and the **five red labels only within their last five pages**. Preserve all actual original page word lengths and the same GP0/cyclic book-address rule. In **200,000 deterministic xorshift32 samples**, **4,777** extracts contain exactly 256 runes, a **2.3885%** frequency. The null mean is **255.364 runes**, SD **16.849**. Thus 256 lies almost precisely at the null mean; observing the exact cell count after exploring reading conventions is **not strong evidence of design**.

This result is sensitive to the reasonable alternative of treating an already-started, page-crossing word as another printed word *on each page*: same label order then selects **242** runes. With complete word starts, reading from opposite page ends gives **248**, incrementing every original selected index by one gives **234**, decrementing gives **254**. None of these conventions is independently excluded by the original instructions.

## Decision

This is a fully reproducible, human-executable candidate navigation from two real Cicada clues, but its attractive **256** count is expected under natural null assignments and its first source-typed crypto consumers fail. **Do not install it as a plaintext key schedule or chase more reader-side tuning.** Revisit only if a new **first-party selector** fixes both complete-word ownership and the wraparound rule, or if a source-selected typed transform directly produces authentic plaintext on a withheld original.

**Reproducer:** [Windows Node.js22 CommonJS, original-source-exact SFT](../sims/lp2_p57_shed55_wordmap_256_source_sft.cjs). The code asserts the exact 55 selected source words, 256-rune hash, two wraps, 16 original-table cipher variants, SHA-512-family negatives, native plaintext plant, the alternative addressing conventions and the full deterministic shuffle census.

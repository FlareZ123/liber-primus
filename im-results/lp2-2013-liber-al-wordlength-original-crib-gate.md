# Cicada's historically authenticated 2013 *Book of the Law*: exact LP2 word-length crib gate

**Agent31, 12 November 2026. Result: no 12-word-or-longer original LP2 phrase matches this independently sourced 2013 book-code key under either of two fixed word-count conventions; no new unknown-page plaintext.** Original-input [complete CommonJS test](../sims/lp2_cicada2013_liber_al_wordlength_exact_sft.cjs), static source [word-length corpus](../resources/derived/cicada2013_liber_al_wordlengths.json).

## Independent source and solve-path motivation

This source is unusually well motivated by *genuine earlier Cicada use*, rather than a thematic similarity: the 2013 Cicada 3301 original riddle about a book dictated to a beast selected **Aleister Crowley's *Liber AL vel Legis* (The Book of the Law)** as its real chapter/line/character book-cipher text. The pinned [original 2013 Cicada archive](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/001-232.jpg/book-of-the-law-I.txt) preserves **chapter I** (1,897 Latin letter-only words under this normalization); its Git blob SHA is `64876892683fab1467481fe87d85743a8ea17982`. A separate [pinned full three-chapter typescript](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/data/keys/armada18/crowley_book_of_the_law_hermetic.txt) preserves **6,030** normalized words (blob `b9ddb5f504f43bbfe170e11d4a9d5dff09a2d5c6`). The full text is a different historical edition/transcription, so both must be identified separately. Previous [four-source original LP2 length crib](lp2-allwords-authored-prose-crib-screen.md) tested Emerson, Gibran, Shakespeare, and solved LP1 **without** this historically authenticated Cicada-2013 book code.

A human could plausibly try a known source-book quotation as plaintext before guessing a new encryption key. LP2's original printed rune word separators may or may not preserve plaintext spaces. This test *conditions* on word-length preservation, an explicit assumption.

## Exact full-corpus alignment

The canonical image-faithful LP2 transcript parses to **2,896 consecutive displayed words with 12,956 original cipher runes** across the 55 rune-bearing unsolved pages (p50 contains a numeric table only). Page breaks and print wrapping do not split a word, and original punctuation does. The existing `sims/lp2_word_pages.cjs` produces all word boundaries, so the test uses **unmodified ciphertext source positions**.

For both historical book-text sources, strip everything except their original ordered A–Z words and build both fixed candidate length representations:

1. **Latin letters:** original plain letter count per word;
2. **GP-runic conventional digraph contractions:** greedily count `ING` before `TH NG EO OE AE IA EA`, with each digraph counted as one rune. This matches the prior original script convention; it does not alter the historical book's spellings.

Index *every* eight-word contiguous original LP2 length vector, find every exact source eight-word vector, then extend **bidirectionally** to the maximum uninterrupted length. No translation or key score enters. This is an exact 8-word seed and full-match enumeration, not a fitted beam search.

| Independently sourced prior-Cicada text | Latin length longest | GP-contracted length longest |
| --- | ---: | ---: |
| Original 2013 preserved **chapter I** (1,897 words) | **0** consecutive eight-word hits | **0** consecutive eight-word hits |
| Full three-chapter **Liber AL** reference (6,030 words) | **8** words | **8** words |

The longest full-book eight-word Latin example is aligned to LP2 original word856, source word2126, starting **`HATE THE HAND THE PEN BUT I AM`**; this is only word-length agreement, not recovered text. All **four** comparisons have **zero** uninterrupted source-plaintext candidates of 12 or more words. The full-book eight-word results occur at assorted unrelated source passages, and there is no independent cipher proof for any of them.

The same exact index-plus-extend algorithm passes an independent positive: insert **16 consecutive original reference-book word lengths** from source index250 into an unchanged LP2 word-length stream at word index1000. For every tested text/version/orthography, the script recovers that exact 16-word source passage with at least16 matching words. Derived arrays are pinned and stored without rewriting the full book, and their original Git blob identifiers permit checking normalization against historical text.

## Research decision

**Retire a direct ≥12-word English quotation from Cicada's own 2013 *Book of the Law* as a word-preserving known-plaintext crib for the unsolved LP2 manuscript**, under the two ordinary orthographies above. This is a stronger *source-selection premise* than searching arbitrary literature, but the observed negative covers only the exact alignment rule and the saved two text versions. It cannot exclude a short citation, altered punctuation, cipher-introduced spaces, further textual transformations, or a different edition.

There is **no original rune-key recovery or decrypted passage**. Any follow-up on Crowley's book requires a new source-identified operation such as real book-code coordinates, rather than continuing arbitrary substring/frequency searching after the absence of long literal matches.

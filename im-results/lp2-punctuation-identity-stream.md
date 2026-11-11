# LP2 punctuation identity stream

**Status: intermediate source finding; not a decryption.**

## Result

The richer LP2 transcription preserves **180 punctuation events** across the 12,956-rune unsolved stream:

| Mark | Transcribed role | Count |
|---|---|---:|
| ⁘ | Sentence/full-stop mark | 145 |
| ⁚ | Comma mark | 4 |
| ⁜ | Chapter/section mark | 31 |
| **Total** | | **180** |

The four comma events occur at p5:110 (global 1317), p11:250 (global 2910), p20:134 (global 4967), p46:96 (global 11329).

## Cross-match to original-image annotations

All **31** `⁜` events match the 31 large-punctuation records in `resources/liber-primus/lp2-ink-annotations.json`, in reading order. There are **29 unique rune offsets** because the source contains duplicated events at offsets **1860** and **3603**. The annotation inventory preserves those duplicate positions as well.

The 31 unsolved-page large marks comprise **28 13-dot marks and 3 10-dot marks**, with **30 red and 1 black** annotation. The event/annotation match is exact, including the duplicated boundary records. This links a punctuation identity that the canonical transcription normalizes to the already catalogued visual marks.

## The 180-way structural alignment

The event count also equals three independently motivated quantities:

1. The interior of the 32×8 numerical table after removing its 76-cell perimeter: `(32−2)×(8−2)=180`.
2. The standard prime sequence p21 through p200: 180 primes. The claim that these are omitted by the historical remote service remains dependent on the historical report, not a locally recovered server capture.
3. The combined rune count of the two terminal solved pages: 85 + 95 = 180.

The manuscript's circumference language makes the 76/180 table split worth retaining. Equal cardinalities alone do not establish that these streams are intended to be combined.

## Bounded tests already performed

The following straightforward interpretations did **not** produce plaintext:

- Converting the 180 punctuation classes to trits and grouping them into 60 GP symbols, testing all six class-to-digit permutations and all three group phases. Five-trit byte and six-trit GP-bigram groupings likewise produced no readable output.
- Comparing punctuation classes with the 180-prime gap modulo four. The best post-selected class/residue mapping scored 110/180; a 100,000-permutation test gave an upper-tail probability of approximately 0.10 (null mean 109.96, SD 3.56). This is not significant.
- Using punctuation classes to select among prime, totient, and prime-index residues, then adding/subtracting those values modulo 29 from the 180 row-major table-interior bytes. Compared with the known 180 terminal-page plaintext runes, the best configuration matched only 11/180.
- Applying constant per-punctuation-segment Caesar shifts from prime/totient/index values or table-interior bytes, and resetting a prime-totient stream at punctuation/chapter events. These did not yield an English-like quadgram signal.

These tests reject only the specified direct encodings. They do not rule out punctuation-driven state transitions, routing, or a layered mechanism.

## Interpretation and next decisive question

The strongest defensible conclusion is that the manuscript carries a recoverable 180-event punctuation-identity stream, and its 31 chapter marks are the same physical locations as the large-punctuation annotations. The 180-way numerical alignment is a useful clue, but the correct operation remains unknown.

The next useful investigation is a **single reversible, source-constrained rule** in which the three punctuation classes control a traversal or state update over the 30×6 interior / 180-prime sequence. It must predict original ciphertext and pass an independent known-Cicada control. Do not repeat unconstrained base-3 grouping or arbitrary key hunts.

## Reproduction

Run `node sims/lp2_punctuation_identity_stream.cjs`. The script verifies the event inventory, exact 31-record image-annotation cross-match, and the three 180-element cardinalities.

## Source and derived-data status

- Rich transcription source: [relikd/LiberPrayground pages](https://github.com/relikd/LiberPrayground/tree/main/pages).
- Derived event coordinates: `resources/liber-primus/lp2-punctuation-identity.json`.
- Original-image cross-reference: `resources/liber-primus/lp2-ink-annotations.json`.
- The external transcription is derivative. Original LP2 JPEGs remain the primary artifacts.

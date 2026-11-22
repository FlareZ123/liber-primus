# Rich punctuation and quote-span channel gate

## Why this lane matters

The canonical LP2 solver stream erases part of the book's presentation layer. The richer relikd transcription preserves three punctuation identities and seven explicit double-quote spans that are absent or conflated in the canonical text:

- `⁘`: 145 derivative full-stop tokens, **at least four of them editorial p15 numeric-row endings absent from the original scan**
- `⁚`: 4 paragraph/comma marks
- `⁜`: 31 section/chapter marks
- 14 double quotes delimiting 7 spans, 405 runes total

The rune stream itself agrees with the canonical transcription across the 12,956 shared unsolved runes, so this is a finite presentation-channel test rather than a competing ciphertext transcription.

## Seven quote spans

The quote-delimited plaintext word-length signatures, measured in runes, are:

1. 18 runes, 4 words: `[6,3,3,6]`
2. 19 runes, 5 words: `[3,3,4,5,4]`
3. 12 runes, 2 words: `[3,9]`
4. 58 runes, 14 words: `[5,7,2,3,4,6,4,3,3,4,4,4,5,4]`
5. 68 runes, 13 words: `[9,8,3,4,6,3,10,2,4,7,6,2,4]`
6. 160 runes, **34 words**: `[4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5]`
7. 70 runes, 14 words: `[5,7,2,3,4,10,3,9,7,3,7,4,3,3]`

A legacy signature comparison screened roughly seventy literary, religious, philosophical, occult and Cicada-adjacent source texts using approximate GP rune lengths (greedy `TH, NG, EO, OE, AE, IA, EA` contractions, V→U and K→C). Its **33-word sixth-quote** result and quoted best squared-distance 98 are obsolete because the authentic full-stop changes the signature to **34 words**. The old nonmatch cannot be used as a valid exclusion of the corrected 34-word original. Other, correctly segmented signatures had no exact hits in that finite historic screen; short spans have many accidental matches. Re-open the long quote-source comparison only with a newly motivated independent text or an updated source-accurate matching method, rather than treating the stale distance as evidence.

This does not prove that no quotation source exists. It rejects the obvious hypothesis that the long marked spans are verbatim quotations from the project's standard source-text candidates.

**Original-word count correction (12 November 2026):** The 160-rune sixth span contains a source-visible full-stop separator at global offset **10,320** (physical p42 local offset 176), separating a three-rune word from the next five-rune word. A legacy length-signature parser silently joined them into one eight-rune item. The full seven-quote signature therefore has **[4, 5, 2, 14, 13, 34, 14] = 86 printed words**, rather than 85. The 2014 transcription and derivative punctuation inventory independently agree on that separator. This distinction matters to any word-index book cipher; it does not prove that the count 86 is intentional.

## Exact 86 repeated-ciphertext events to 86 quote words: finite book-code test

The original physical pages 0–55 contain **86 within-page adjacent equal-rune pairs**. Pairing these events in original reading order with the **86** genuine words inside the seven quoted spans is a new, source-visible, key-free extraction proposal. It uses Cicada's 2016 "words ... map / numbers ... direction" wording as a possible player clue, while recognizing that the event/word cardinality match was noticed after observing the corpus. It is *hypothetical*, not an authenticated instruction.

For each event and corresponding quoted word, select its rune by three fixed original alphabet numbers: the repeated ciphertext rune's **GP29 numeric index** modulo word length, its **GP-prime weight** modulo length, or its GP-prime weight with conventional **one-based indexing**. Keep natural event order, word order, and rune direction; make no arbitrary dictionary or key fit. The 86-rune readouts remain near uniform:

| Extractor | Output IoC |
| --- | ---: |
| GP index mod printed word length | **0.031464** |
| GP-prime mod length | **0.034473** |
| (GP-prime − 1) mod length | **0.027633** |

The authentic solved p57's first 86 runes have IoC **0.059644**. None of the three extraction strings is independently readable GP English, nor does any supply a sourced key. The planted 86-symbol solved-p57 control is recovered **86/86** by each exact index rule. This retires the three direct source-order local-coordinate interpretations while leaving a different, independently instructed word-code mapping open. [Complete reproducible original-input SFT](../sims/lp2_quote_doublet_word_boundary_sft.cjs).

### Source-time constraint on the 86-to-86 escape hypothesis

The matched count of 86 printed quotation words and 86 within-page adjacent-equal rune events was noticed after viewing the original data. A source-local or online escape emitter must make the relevant word available at the relevant event. In the source-ordered one-to-one pairing, **79 of 86 candidate key words appear after their assigned event**, and only **7** are already available. The first event is global rune offset **122** while the first quote begins at **1659**; the last event is offset **12939**, while quoted material ends at **12592**. The assigned word-start delay spans **−350 to +8124** runes.

The nine physically printed chapter groups supply a second fixed boundary test. Their quotation-word counts are **[0,4,0,5,0,0,0,77,0]** and their within-page same-rune event counts are **[4,6,9,10,11,13,12,18,3]**. None matches, which excludes a one-to-one **same-chapter** escape allocation before any secret symbol map. Cross-chapter buffering and whole-book offline lookups remain mathematically possible. There is no original clue selecting the necessary long-range correspondence or lossless side channel.

The independently sourced seven quotes contain **one actual adjacent-equal rune event across 398 real within-quote adjacencies** (global index 5476, physical p22). A second repeat in their concatenated 405-rune artificial stream is created by joining the nonadjacent original positions **1676 and 5459**, which both have rune IA. That seam is a transcription product and must not be mistaken for a second printed event.

**Decision:** retire the natural-order online and chapter-local interpretations of the 86/86 coincidence. Do not optimize arbitrary word/event assignments until a separate source instruction fixes the mapping and an exact reversible inverse. [Original-source standalone test](../sims/lp2_quote_doublet_online_causality_sft.cjs).

## Standalone selected-stream test

Concatenating all seven quoted spans gives 405 ciphertext runes.

- quote IoC: **0.033797824227**
- surrounding unsolved stream IoC: **0.034482625665**
- joined-stream doublets: **2 / 404 adjacencies**, including one artificial join; the original has **1 / 398** within-quote adjacencies
- repeated quote-stream 4-grams: **0**
- repeated quote-stream 5-grams: **0**

The selected stream remains flat and doublet-suppressed like ordinary LP2 ciphertext. It does not reveal a second plaintext-like channel.

## Literal punctuation-token encoding

The **180 derivative punctuation tokens** include **at least four editorial full stops** absent from original p15. In that derivative stream, ordinary `⁘` tokens dominate (145/180). Exhaustive direct base-3 encodings over its three observed symbols and finite symbol permutations, stream directions, grouping phases and digit directions produce repetitive non-language. This is a negative only for the derivative 180-token serialization; it is **not** an exact negative test of the original page-ink punctuation channel. No source-selected standalone message was recovered.

## Solved-mechanic reset gate

The strongest remaining use of the presentation layer is as a keystream reset signal. A finite test therefore restarted only already demonstrated Cicada mechanisms at visible marks:

- Vigenere `DIVINITY`
- Vigenere `FIRFUMFERENFE`
- consecutive prime-totient stream `phi(p_i)=p_i-1`

Reset sets tested:

- no reset
- `⁜` only
- `⁘/⁚/⁜`
- quote marks only
- `⁜` plus quotes
- sentence punctuation plus quotes

Each keyed family was tested with and without the literal all-F non-advance convention. English fitness used the same public KJV-weighted quadgram table employed by the validated Dukotah solver.

The untouched ciphertext baseline scored **−7.44015** per quadgram. Every transformed case was worse. The best transformed result was `FIRFUMFERENFE` with no reset/no F-skip at **−7.47551**. The best actual boundary-reset case was `DIVINITY` with `⁜ + quote` resets/no F-skip at **−7.48705**. No candidate approached the repository's readable-English regime near −4 to −5.

## Consequence

The rich punctuation is real information that the canonical solver stream loses. Four direct interpretations are now bounded negative:

1. punctuation as a standalone ternary message;
2. quote-delimited runes as an independently readable ciphertext channel;
3. visible punctuation/quote marks as reset points for the already solved Vigenere or prime-totient mechanisms.
4. repeated-ciphertext rune values as direct indexes into the 86 source-visible quoted words; a source-local or online ordinal escape assignment also fails the exact source-time test.

The quote marks most plausibly encode discourse structure such as direct speech or emphasis. Their word boundaries remain useful as future cribs if an independently motivated key family appears. Do not reopen a generic punctuation-reset sweep without a new cipher generator or a source-derived rule for how the mark changes state.

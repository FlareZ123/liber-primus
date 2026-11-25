# LP2 Self-Reliance book-code selector audit

**Agent3, 21 November 2026.** Disposition for Director Issue #2005: bounded negative. The 2014 Emerson book code is a verified historical operation, but the available LP2 sources do not select either that book or its exact coordinate convention for reuse.

## What the 2014 source actually selects

The authenticated [2014 Stage 1 signed message](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/zN4h51m.jpg.asc) contains the poem about “the work of a private man” who “trusted himself,” selecting Emerson's *Self-Reliance*. The documented one-indexed paragraph:sentence:word:letter extraction, including the inserted-excerpt paragraph correction, reproduces `auqgnxjtvdbll3pv.onion`. This is a genuine source-selected book code for that 2014 stage. It is not a standing instruction that every later Cicada manuscript uses Emerson or the same coordinate convention.

## LP2 selector check

- The original LP2 images and canonical GP29 transcription do not expose the words “Emerson” or “Self-Reliance” as readable text; the p0–p55 content is still encrypted. The existing original-artifact and historical-solve-path syntheses do not identify a portrait, title, quote, named edition, or other LP2-visible feature that selects this specific book over another text.
- The authenticated 2016 LP2 message says that the book's words are a map, their meanings a road, and their numbers a direction. This is a broad word/number navigation hint. It does not name Emerson, Self-Reliance, paragraph:sentence:word:letter coordinates, one-indexing, or the inserted-excerpt paragraph correction.
- The original LP2 page structure does not supply the four coordinate fields or a specific receiver for the 2014 15-tetrad sequence plus literal characters. A 4×4 table or 13-marker packet elsewhere in LP2 is not, by itself, an instruction to split values into paragraph/sentence/word/letter coordinates.
- `im-results/lp2-tennyson-emerson-historical-quote-gate.md` already tested exact source-word-length reuse from the selected Emerson edition and the historically plausible Tennyson edition. Its negative is limited to verbatim quote reuse; it does not exclude a book cipher. It does, however, provide no positive LP2 cue for this book-code transfer.

## Agent17: exact literal coordinate-capacity obstruction (#2808, 25 November 2026)

The #2808 assignment duplicates #2005's selector question and incorrectly dates the Emerson clue to 2012. The repository's [historical index](../resources/external/cicada-research-repositories.md) records the verified signature timestamp 2014-01-06 04:59:26 UTC. The same signed payload has 15 colon-separated four-field coordinates, one literal digit 3 and six literal domain-suffix characters. The 2012 *Agrippa* and *Britannica* precedents are distinct.

A new necessary-condition result retires even arbitrary reordering of the **unchanged** p49–51 numeric cells into literal four-field coordinates under this exact book grammar. We do not assert that this is an LP2-selected transfer and do not evaluate any candidate ciphertext output.

Using the pinned 55,376-character `resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt` (blob 12a6bc018047a1276e77f2b7f633d5905732fff9), the [original community decoder](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/book-code.py) tokenizer and paragraph correction reproduce the actual Stage 1 result. The 51 physical paragraphs with one skipped excerpt imply maximum corrected paragraph coordinate 50; maximum sentence, word and raw character indices over the source are respectively 25, 105 and 16. These are deliberately independent relaxed bounds; a tuple also has to address an actual position in its chosen paragraph/sentence/word.

| Role cap, sorted | Positive original values at or below cap, radix 59 arithmetic | Radix 60 |
|---:|---:|---:|
| 16 | 10 | 10 |
| 25 | 18 | 18 |
| 50 | 41 | 41 |
| 105 | 101 | 99 |

The radix-59 arithmetic here generously retains all source digits (four printed digits equal 59 and would be illegal in strict radix 59). Both readings contain two zero cells, incompatible with any positive coordinate. More strongly, each valid tetrad requires TWO distinct positive values at most 25 (sentence and character); only 18 such cells exist. Therefore **at most nine disjoint literal historical book-code tetrads** could be formed from the entire 256-cell panel, even granting any permutation of the cells and relaxing all source-dependent field constraints. A full literal parser requires 64 tetrads; even with arbitrary omitted cells it must leave at least 220/256 outside coordinate tuples. This is a permutation-invariant necessary bound, not an exhaustive coordinate/letter search. It excludes full-panel direct literal transfer, not digit splitting, a separately selected transform, a small embedded coordinate packet, or unrelated book codes.

The exact JS gate was executed against the pinned repository source texts in the tool runtime; the standalone Node SFT is preserved at [sims/lp2_emerson_bookcode_capacity_sft.cjs](../sims/lp2_emerson_bookcode_capacity_sft.cjs) (commit b1bf3bb5c156a785c93f0c72025e7616a6af2974). The Node wrapper itself was not executed independently in this runtime. No LP2 letters were extracted, no key sweep performed, and no unknown plaintext recovered.

## Decision

**Negative for transfer selection; no coordinate extraction was run.** The 2014 signed message authenticates a one-off Emerson book code for the Stage 1 onion. The 2016 “words/map/numbers/direction” message may motivate word-aware navigation in LP2, but it does not select the same book or the same coordinate grammar. Both required selectors are therefore absent: LP2 does not independently select Emerson's *Self-Reliance*, and it does not select the one-indexed paragraph:sentence:word:letter convention with its paragraph-offset correction.

The exact missing selector is an original LP2 or authenticated contemporaneous Cicada instruction naming/identifying *Self-Reliance* and specifying the paragraph:sentence:word:letter units, origin, paragraph correction and receiver before output is read. Without both, any book/coordinate sweep would be analyst-created. Preserve the 2014 book code as a historical solve-path control only; do not transfer it to LP2 or search alternate books/offsets.

No unknown plaintext, key, cipher architecture or destination was recovered.

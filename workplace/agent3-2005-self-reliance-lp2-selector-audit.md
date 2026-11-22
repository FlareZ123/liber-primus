# LP2 Self-Reliance book-code selector audit

**Agent3, 21 November 2026.** Disposition for Director Issue #2005: bounded negative. The 2014 Emerson book code is a verified historical operation, but the available LP2 sources do not select either that book or its exact coordinate convention for reuse.

## What the 2014 source actually selects

The authenticated 2014 Stage 1 signed message `resources/historical/cicada2014-stage1-message.asc` contains the poem about “the work of a private man” who “trusted himself,” selecting Emerson's *Self-Reliance*. The documented one-indexed paragraph:sentence:word:letter extraction, including the inserted-excerpt paragraph correction, reproduces `auqgnxjtvdbll3pv.onion`. This is a genuine source-selected book code for that 2014 stage. It is not a standing instruction that every later Cicada manuscript uses Emerson or the same coordinate convention.

## LP2 selector check

- The original LP2 images and canonical GP29 transcription do not expose the words “Emerson” or “Self-Reliance” as readable text; the p0–p55 content is still encrypted. The existing original-artifact and historical-solve-path syntheses do not identify a portrait, title, quote, named edition, or other LP2-visible feature that selects this specific book over another text.
- The authenticated 2016 LP2 message says that the book's words are a map, their meanings a road, and their numbers a direction. This is a broad word/number navigation hint. It does not name Emerson, Self-Reliance, paragraph:sentence:word:letter coordinates, one-indexing, or the inserted-excerpt paragraph correction.
- The original LP2 page structure does not supply the four coordinate fields or a specific receiver for the 2014 16-tuple sequence. A 4×4 table or 13-marker packet elsewhere in LP2 is not, by itself, an instruction to split values into paragraph/sentence/word/letter coordinates.
- `im-results/lp2-tennyson-emerson-historical-quote-gate.md` already tested exact source-word-length reuse from the selected Emerson edition and the historically plausible Tennyson edition. Its negative is limited to verbatim quote reuse; it does not exclude a book cipher. It does, however, provide no positive LP2 cue for this book-code transfer.

## Decision

**Negative for transfer selection; no coordinate extraction was run.** The 2014 signed message authenticates a one-off Emerson book code for the Stage 1 onion. The 2016 “words/map/numbers/direction” message may motivate word-aware navigation in LP2, but it does not select the same book or the same coordinate grammar. Both required selectors are therefore absent: LP2 does not independently select Emerson's *Self-Reliance*, and it does not select the one-indexed paragraph:sentence:word:letter convention with its paragraph-offset correction.

The exact missing selector is an original LP2 or authenticated contemporaneous Cicada instruction naming/identifying *Self-Reliance* and specifying the paragraph:sentence:word:letter units, origin, paragraph correction and receiver before output is read. Without both, any book/coordinate sweep would be analyst-created. Preserve the 2014 book code as a historical solve-path control only; do not transfer it to LP2 or search alternate books/offsets.

No unknown plaintext, key, cipher architecture or destination was recovered.

# Relative-reference book-code gate: source selection fails

**Agent:** Agent22  
**Date:** 2026-11-26  
**Issue:** #3035  
**Disposition:** Retire this relative-reference extension. No relative-offset decoder or parameter search was run.

## Decision

The best first-party cue is the verified 2016 signed payload:

> Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.

This is an authentic navigation metaphor about Liber Primus. It supports looking for a relationship between words and numbers, but it does **not** select a relative-reference serialization. In particular, it does not say that a number is a distance from the current cursor, nor does it specify a carrier, reference unit, start position, forward/backward sign, wrap rule, or literal/reference discriminator. “Direction” could also mean an absolute coordinate, a bearing, or a more general navigation instruction. Choosing a delta receiver from this sentence alone would add the decisive rule rather than recover it.

The issue's source-selection gate therefore fails. Do not infer a relative-offset cipher from the 2013 sender's moving search cursor.

## Evidence compared

### First-party Cicada mechanisms

- **2013 sender:** the reconstructed 46-record book-code sender searches for the first case-sensitive occurrence in the next available verse, wraps on exhaustion, emits an absent character literally, and resets as specified. This is a moving *search procedure* inside the sender. Its emitted records are not “move N places from the previous output” references. It cannot by itself establish a relative-reference receiver.
- **2014 GEB sender:** the signed Onion5 message uses absolute one-based paragraph/sentence/word/letter coordinates. The existing reconstruction recovers the selected letters and address. It supplies an absolute-address control, not a delta convention.
- **2016 signed LP message:** “words are the map … numbers are the direction” is the strongest potential selector. It does not define what a “number” is (rune value, word sum, word length, or another value), what is being traversed, or how a number moves the cursor. It does not distinguish relative offsets from absolute coordinates.

### Original LP2 image check

I inspected the original JPEGs, not derived page renders, for p0, p7–8, p22–23, p32, p49–51, and p55.

| Original page(s) | Visible feature | What it supports | Missing relative-reference selector |
|---|---|---|---|
| p0 | Cover and rune text; a word-like GP transliteration previously read conditionally as “NEWBAS…” | A possible base-related wordplay lead, already tested under a fixed p0 key hypothesis | Not a complete “NEWBASE” instruction; no cursor, distance, or reference unit |
| p7–8 | Stone-tablet illustration and spiral ornament | Cyclic/ritual imagery at most | No numbered path, direction arrow, or relative movement rule |
| p22–23 | Scroll-like borders and red paragraph/rune marks | Text segmentation and emphasis | No displacement unit or current-position reference |
| p32 | 4×4 numeric table, one red entry, and an infinity symbol | A numeric object and a possible cyclicity motif | Infinity does not define a cursor origin, step size, direction sign, or record syntax |
| p49–51 | 32×8 grid of 256 two-character tokens, plus cuneiform-like marks | A structured numeric/token carrier candidate | No source declaration that entries are deltas, no carrier traversal order, and no literal/reference marker |
| p55 | 76 GP runes and a 13-dot red paragraph mark | A real page-level annotation | The 13-dot/76-rune difference is post hoc; the annotation does not say “advance 13” or define a reference cursor |

The original visual objects contain no explicit non-rune instruction selecting “advance this many words/runes from the current cursor.” Their encrypted rune text may eventually yield further clues, but that possibility is not evidence for this particular receiver.

## Why no receiver was tested

A relative-reference decoder needs at least:
1. an ordered carrier;
2. a reference unit (word, rune, character, verse, or another unit);
3. an initial cursor;
4. a rule converting a record into a signed or unsigned displacement;
5. wrap/boundary behavior; and
6. a literal/reference discriminator.

None of the inspected LP2 annotations or first-party book-code examples supplies this set. The 2016 sentence provides a broad navigation metaphor but does not resolve these choices. Testing word sums, rune values, word lengths, arbitrary starting points, or wrap conventions would be unconstrained mechanism fitting.

The 2013 sender's “next available verse” rule is not a substitute: it is an independently reconstructed sender-side search algorithm, not a source-selected LP2 output format.

## Reusable conclusion

- Retire the **relative-reference receiver** as a current LP2 branch.
- Preserve the 2016 “numbers are the direction” sentence as a genuine but underspecified navigation clue.
- Do not claim that the clue proves absolute coordinates either; the representation remains unresolved.
- Reopen only if a newly decoded LP2 passage or first-party instruction explicitly selects a current cursor, a displacement unit, and the record syntax.

## Source trail

- 2016 signed payload: **resources/historical/cicada2016-4gq25-outguess.asc**; source and signature record: **resources/historical/cicada2016-4gq25.md**.
- 2013 signed sender messages: **resources/historical/cicada2013-first-onion-hello.asc**, **cicada2013-welcome-and-congratulations.asc**, **cicada2013-if-you-followed.asc**, **cicada2013-no-more-testing.asc**.
- 2014 signed GEB message: **resources/historical/cicada2014-onion5-signed.asc**.
- Existing sender/receiver synthesis: **im-results/cicada-organizer-bookcode-consumption-convention-gate.md**.
- Existing 2014 absolute-coordinate reconstruction: **im-results/2014-onion5-geb-bookcode-and-key-transfer.md**.
- Existing BASE29/p49–51 source relationship and limits: **im-results/lp2-2014-3301-square-base29-spectral-original-gate.md**.
- Existing p0/p55 annotation and fixed-key gates: **im-results/lp2-2012-signed-ps-base29-p55-gate.md**.
- Original LP2 data: **resources/liber-primus/lp2-corpus.json** and **resources/liber-primus/lp2-ink-annotations.json**.

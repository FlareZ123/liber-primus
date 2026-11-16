# Agent8 follow-up: corrected 256-event candidate using the p49 table opener

This is a separate candidate from the superseded 31×13-dot construction.

## Frozen event definition

In original page/rune order, insert:
- each of the 225 annotated red runes at its page-local offset;
- each of the 30 red 13-dot marks (exclude the p7 black five-dot glyph);
- the single red 10-dot mark at p49 offset 66, immediately before the p50 numerical table.

Use marker codes 29 for red13 and 30 for the p49 red10. Punctuation at offset (k) precedes a red rune at offset (k). This produces exactly 256 events: 225 runes + 30 red13 + 1 red10. The p49 10-dot inclusion is a motivated hypothesis because it immediately opens the table; it is not yet an established instruction.

## Cheap discriminating tests against the canonical 32×8 base-60 table

The corrected tape has 256 events; the p49 red10 is event index 177. Row-major table byte at that position is 131 (mod31 = 7), not the marker code 30.

- Direct event equality with table bytes reduced mod29/mod30/mod31: 15/256, 5/256, and 13/256 respectively.
- Best affine map (a(B mod 31)+b mod31), with (a=1..30,b=0..30): 16/256.
- Best memoryless byte→event codebook: 168/256 matches, leaving 88 unavoidable errors across 65 conflicting byte groups.
- Known p56 red heading `ANEND`: required shifts are [1,2,4,6,10], while aligned table bytes mod29 are [25,13,11,22,27].
- Known p57 red heading `PARABLE`: required shifts are all zero, while aligned table bytes mod29 are [26,13,27,27,6,7,15].

Thus the simple direct modulo/affine and additive-table-key interpretations fail. The exact p56/p57 event positions are unchanged from the old tape because removing the p7 duplicate and inserting the p49 10-dot cancel before p56. No plaintext has been recovered.

## Research consequence

The old 256-event reports are not evidence for a 31×13-dot inventory. If this corrected 256-event candidate is pursued, it must be treated as a distinct model with a different marker alphabet and event positions. Do not silently reuse old 32-byte chunk keys or the old 16×16 mapping results as if they tested this tape.

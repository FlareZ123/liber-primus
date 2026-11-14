# LP2 whole-word movement: source-selector gate

**Agent21 · 14 November 2026 · Director task #866.** Decision: **no new author-selected, reversible whole-word movement rule is presently specified by the original sources.** This is a bounded missing-selector result, not a universal exclusion of word-order encryption. No LP2 permutation or letter-level decryption was run because the required first move is not independently determined.

## Authenticated clue and the missing operation

The byte-exact 2016 signed OutGuess payload says:

> Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.

This authenticates a broad relationship between words, meaning and numbers. It does **not** specify the operational data structure or any of the parameters needed to invert a word movement:

- which word sequence is the map (the 2,896 unknown printed words, the 43 words in the 2016 message, a chapter, or a selected subset);
- whether the geometry is a line, grid, book-coordinate system, or graph;
- the starting word/cell, the numeric-to-direction mapping, the step unit, or the stop condition;
- whether punctuation, chapter boundaries, and the 32 words carried across physical page turns move with the word or define reset points.

The signed text supplies no literal start/stop marker, compass legend, route table, or traversal order. It is a source-authenticated **selector for further interpretation**, not an executable permutation by itself. See `resources/historical/cicada2016-4gq25-outguess.asc` and the exact source record `resources/historical/cicada2016-4gq25.md`.

## Candidate physical operands and why they do not select a traversal

1. **LP1 p05 mixed 5×5 word/number square.** Replacing each of its 13 printed rune words by its unchanged GP-prime sum reproduces all 25 cells of the third historical 2014 magic square; all rows, columns and diagonals sum to 1033. But the period-original Stage10 form tells players to paste the three numerical squares and submit an onion URL. It does not tell them to walk the square. The 2016 signed message does not name this particular square or provide a start, direction conversion, word/number rule, or stop. The source-specific assessment explicitly records these missing slots and rejects guessed residues/rotations: `im-results/lp1-p05-word-number-direction-source-gate.md`.
2. **The p55 tree/moth and repeated tree artwork.** Original LP2 p55 (`resources/liber-primus/72.jpg`) has an unlabelled tree illustration and a moth; the matching tree motif elsewhere supplies no numbered nodes, arrows, path labels, or first-party traversal rule. The 2016 image source note identifies a generic dead-oak clipart candidate and says no route, text, numeral, or processing instruction follows from that asset: `resources/historical/cicada2016-4gq25.md`. A root-to-leaf or branch-following walk would therefore be an invented convention.
3. **The 32×8 table and 32 page-carried words.** The count alignment is real, but the bounded packet test already mapped the 32 right-hand carry-fragment lengths to a fixed table column and obtained 32 bytes with no independently selected byte consumer or plaintext. That report records the missing authored address rule and consumer: `im-results/lp2-pagecarry-grid32-source-packet.md`. The dimensions/count alone do not select a word movement.
4. **Thirteen-dot fragment order and fixed lane layouts.** The source-unique second-column rank sort of the 13-dot fragments was already tested in both directions and weakens the word-length grammar; the stronger all-26!-orders bound is limited to whole-fragment permutation. Fixed 8/32-lane and 16×181 word serializations also fail their source-native grammar controls. See the #720 closure and `im-results/lp2-original-wordlength-grammar-mi.md`. These failures do not justify searching arbitrary new permutations.

The period-authenticated 14-column Stage05 transposition is also not a new candidate: the original p40–53 whole-word application was already tested with a native-text positive control and did not restore source-native word grammar (`im-results/lp2-p40-stage05-14column-wholeword-gate.md`; #830).

## Decision

The independent evidence supplies **no single movement rule with a source-fixed grouping, start, direction, and stop**. Consequently the issue's first gate fails before any LP2 language scoring. Do not rescue it by choosing a center/corner, reducing numbers modulo 4/8/29, selecting a tree branch, reordering words by fitted scores, or treating the 32×8 dimensions as an implicit route.

A successor becomes executable only if an original first-party source supplies the missing discriminator(s): an identified word set, a map geometry or explicit traversal, numeric-to-direction convention, start/stop, and page-carry treatment. Until then, no source-selected whole-word movement is available to combine with a rune inverse. This result retires only the present #866 candidate family; it does not prove that no hidden word-order operation exists.

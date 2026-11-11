# P57 circumference instruction: source-bounded word/ring gate

## Current conclusion

The solved p57 text supports a **lossless boundary/interior split**, but the visible source does not select a reversible, symbol-changing word transform. A ring-only permutation is also insufficient for p55: its 76-rune index of coincidence is below every matched native 76-rune English window. The missing element is an explicit source-derived state/update rule, not another key search.

This is an intermediate negative result, not a claim that the wider p57 clue is irrelevant.

## Source facts and exact counts

The p57 body has **19 words and 88 GP runes**. Its first sentence has **7 words**. Using the natural word-local definition of circumference:

- length 1: keep the sole rune once as the boundary; interior is empty;
- length 2: keep both runes as the boundary; interior is empty;
- length 3 or more: boundary is first and last rune; interior is the middle.

Applied to all 19 p57 body words, this gives **38 boundary runes and 50 interior runes**. Applied to the first seven words only, it removes **14 boundary runes**, leaving **74**. That 74 equals the combined cell count of the paired source-linked **7×7 and 5×5** squares. Their concentric ring sizes are:

- 7×7: 24, 16, 8, 1
- 5×5: 16, 8, 1

There are seven rings and 74 cells in total. This is a notable count concordance: seven first-sentence words, seven rings, and 74 runes after removing the first seven words' endpoints. It is not yet an ordering or cipher rule. If “circumferences” applies to every word, the natural result is 50 interiors, not 74; the source does not explicitly fix that scope.

The p55 page contains **76 runes in 17 page-local word segments**. The first segment is a one-rune continuation: it is the final rune of an **11-rune word that starts on the preceding page** (rune-bearing page index 53) and ends on p55 (index 54). It is not a standalone singleton. There are **16 complete words starting on p55**, comprising five two-rune words and eleven longer words. Counting the incoming word's final boundary rune once, the p55 page contributes **33 boundary runes and 43 interior runes**. A page-local transform that resets at the p55 boundary would split a word and mis-handle that first rune.

## Ring and historical NUMBER checks

The 7×7 square and the paired bottom 5×5 square both have magic sum 1033 in `resources/cicada2014-openpuff-magic-squares.txt`. Under the historical `NUMBER` interpretation documented in `im-results/onion7-magic-center-source-prime-gate.md`:

- 7×7: 41 active cells, 8 `+` cells, 84 prime-factor tokens;
- 5×5: 19 active cells, 6 `+` cells, 44 prime-factor tokens.

The 5×5 active-cell count equals the 19 p57 body words; its 44 factor tokens plus six `+` markers equal the 50 all-word interiors. These are further count-level correspondences, not a demonstrated mapping. In the 19 active 5×5 cell factor sets, only one p57 word's pair of endpoint GP-prime weights occurs exactly: **INSTAR**, whose endpoint weights 31 and 11 match cell 341 = 11×31. The other 18 endpoint pairs do not match any active-cell factor set. At least one factor value (113) also lies outside the 29 GP prime weights, and the source supplies no reduction rule for it.

Thus the count matches preserve a plausible framing hypothesis, but neither the ring geometry nor the historical NUMBER output supplies a complete word-to-cell assignment, a factor-to-GP mapping, or a reversible update function.

## Decisive p55 permutation gate

A pure ring traversal, rotation, reflection, or other permutation preserves symbol frequencies and index of coincidence. The original p55 76-rune stream has:

- p55 IoC: **0.037895**
- minimum over **47,959** body-only Gibran 76-rune GP windows: **0.041754**

The p55 value is below every matched native window. Therefore no permutation-only use of the rings can give p55 the frequency structure of this native English control. This does not exclude every possible English text or a stateful substitution; it means a useful decoder must change symbols, and the source must specify how.

**Register-control clarification (2026-11-11):** The Gibran windows used above are a generic English comparison corpus, not an attribution of the p57 Parable to Gibran. The 2013 761.MP3 ID3 metadata directly contains the p57 Parable text; the exact distinctive phrases “LIKE THE INSTAR”, “CIRCUMFERENCES” and “DIVINITY WITHIN” are absent from this repository's The Prophet control. The source-grounded [GP29 register benchmark](source-register-benchmark.md) compares this legacy control with Blake verse, solved LP1 A-KOAN dialogue, Cicada signed prose, Emerson/Shakespeare and a Latin wrong-language control. At matched 700-rune training size, the broad English models cover the tested source-backed positives; the A-KOAN model narrowly self-ranks on its held-out dialogue. This does not change the p55 IoC exclusion or establish a p57 source attribution.

The earlier literal edge-strip/`DIVINITY` test remains negative: the best direct additive output scored worse than raw p55 and worse than native controls. The old p55-only 43-interior extraction is lossy and is not being repeated.


## Cicada-linked literary-source selector audit (Issue #250)

The p57 Parable is present in the ID3 user-text field of Cicada's 2013 `761.MP3` (see [the audio source report](audio-761-pad-scan.md)). Its wording is a source-visible clue, but it does not uniquely select one of the prior-round literary sources:

- **Liber AL / Crowley:** the archived 2013 PGP-signed book-code message selects `Liber AL vel Legis` through its “book whose study is forbidden” riddle. The exact text in `resources/external/2013-book-of-law-II.txt` has the distinctive pair **centre/circumference** together in II:3; “within” also has a natural echo in I:13 (“I am above you and in you”). This is the strongest single-verse candidate for p57's “shed our own circumferences / find the divinity within.” However, the 2013 book-code coordinate list does **not** contain II:3; it selects other positions, including I:60:11. Under the archived spaces-stripped convention, I:60:11 selects the first `1` in “My number is 11”, not II:3 or a key for LP2.
- **Blake / *The Marriage of Heaven and Hell*:** the exact archived 2012 Cicada MIDI chorus is a secondary transcription of a Blake passage, but it contains none of `road`, `circumference`, `divinity`, or `within`. The wider *Marriage* does contain “Reason is the bound or outward circumference of Energy” and the “road of excess” proverb (see the [validated Wikisource page](https://en.wikisource.org/wiki/Page:Life_of_William_Blake,_Gilchrist.djvu/112)). These make p57's `circumferences` and the 2016 signed clue's `road` semantically compatible with Blake. They do not prove that the wider book, rather than the exact 2012 chorus, is selected as an LP2 source or identify a unique passage/edition.
- **2016 message:** its `road` wording could be read as a pointer to Blake's proverb, but it does not name “excess”, “palace”, or “wisdom”; this remains an associative lead, not a locked selector. The 2016 message/crib is already the subject of #222; no 2016 crib or word-length test is repeated here.

The best candidate allusion is Liber AL II:3, but the same p57 wording can also be read through Blake's *Marriage*, while the 2016 `road` clue can be read through Blake's proverb. No original LP2 clue fixes one exact source **and** a target page/word interval or a reversible key derivation. Consequently there is no frozen original-cipher test to run under #250's gate. **Stop before scanning:** this is a bounded missing-selector result, not an LP2 crib, key, plaintext, or decryption.

## What is and is not determined

The only fully source-compatible reversible word operation presently fixed is the tuple split `(left boundary, interior, right boundary)` with the length-1/2 cases above; concatenating the tuple exactly reconstructs every original word. For p55, the leading one-rune page segment must be carried as the final boundary of the incoming cross-page word, not reclassified as a one-rune word. This is a representation change, not decryption.

The source still does not determine:

1. whether the first seven words alone or every word supplies the circumferences;
2. which word controls which of the seven rings, or the ring start corner and traversal direction;
3. how the two boundary runes update a 29-state register or alter the interior symbols;
4. how square values, prime factors, and `+` markers map to GP29 symbols or shifts;
5. the synchronization/reset rule across short words and page boundaries.

“Tunnel to the surface” can motivate center-outward reading, but it does not settle those missing mappings. The 74-cell and 50-interior count matches, including the INSTAR/341 anchor, should be retained as hypotheses; they do not justify a fitted phase, an arbitrary exterior lookup table, or a free family of word ciphers.

## Reproduction

Run `node sims/instar_circumference_probe.cjs`. The script reports the exact p57/p55 page-local partitions, incoming cross-page word, ring counts, conditional NUMBER outputs, endpoint-factor match, and matched p55/native IoC gate. It uses the original transcription, GP corpus, OpenPuff square resource, and Gibran body control.

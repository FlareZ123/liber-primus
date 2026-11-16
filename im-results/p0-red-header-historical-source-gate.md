# p0 red preamble: bounded historical source gate

**Result:** the finite test finds no exact historical attribution for the original thirteen-rune RED p0 heading. The same-day claim that the 13-rune span did not exist was wrong and is now retracted. This is a source-faithful 13-red-title finite source-panel test, but its negative is scoped to the particular twelve reference texts and the direct/equality-pattern rules used.

**Corrected original-image adjudication (16 November 2026):** The first **eight** GP runes on original p0 are red, followed by a **small ordinary red word dot**, **five additional red GP runes**, then the **large red 13-dot mark at rune offset13**. The first black body rune is **TH** at offset13. A same-day red8/marker8/black5 report confused the small red word dot with the large punctuation and is [retracted](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md). The older derivative annotation of a **13-rune red heading (8+5)** and marker at13 was correct. Calculations depending only on the original first 13 GP values remain unchanged; any physically asserted colour change at8 must be retired.

## Frozen original input

- LP2 p0 is the original scan `resources/liber-primus/17.jpg`; the original 2014 image and historical annotation both record two red title words of 8+5 runes at offset0, then the large red 13-dot mark at offset13.
- Exact glyphs: `ᛋᚻᛖᚩᚷᛗᛡᚠ ᛋᚣᛖᛝᚳ`.
- Canonical GP transliteration: `S H E O G M IA F  S Y E NG C` (`SHEOGMIAF SYENGC` when expanded). The printed word lengths are 8 and 5 runes.
- The first BLACK rune after the complete red title and large red 13-dot mark is `ᚦ` = `TH` at offset13; the `ᛋ` = `S` at offset8 begins the **second red** title word. The first p0 transcription line has rune-word lengths `8,5,4,3`; the black body begins with the four-rune word THJGAE.
- The historical test's first thirteen GP tokens correspond to the true red heading; its following TH at offset13 is the **first black rune** and a legitimate held-out body start, though no hypothesized plaintext follows from that fact.

## Finite source panel

The panel was fixed from pre-2014 Cicada artifacts and literary/historical sources independently selected by LP1's explicit references and the circumference motif. It contains these 12 stored texts:

- `resources/historical/cicada2012-countdown-message.asc`
- `resources/historical/cicada2012-midi-49-words.txt`
- `resources/historical/cicada2013-first-onion-hello.asc`
- `resources/historical/cicada2013-forest-clue.asc`
- `resources/historical/cicada2013-second-onion-everything-you-need.asc`
- `resources/historical/cicada2013-second-onion-icmp-echo.asc`
- `resources/external/2013-do-not-share-this-information-2.asc`
- `resources/external/2013-tcp-server-signed-source.md` (a stored source transcription/reconstruction, not treated as a raw primary artifact)
- `resources/external/2013-book-of-law-I.txt`
- `resources/external/2013-book-of-law-II.txt`
- `resources/external/2013-book-of-law-III.txt`
- `resources/external/2012-marriage-of-heaven-and-hell-page.txt`

The Book of the Law and Blake texts are included as source-relevant literary references, not represented as Cicada-authenticated messages. The often-misdated `resources/external/2013-0-wisdom-source.md` was excluded: the repository's source correction identifies it as a 2014 Stage04 artifact, not a pre-2014 text.

## Tests and result

1. **Direct source transcription.** Searched the normalized source text for the complete 13-rune expanded transliteration and for the same sequence followed by `TH`. Both the canonical `NG` spelling and the documented `ING` alternative were tested. Normalization also handled thorn `Þ` as `TH`, ash `Æ` as `AE`, and the repository's fixed GP spelling conventions `QU→CW`, `V→U`, `K→C`, `Z→S`. There were zero exact 13-token or 14-token matches.
2. **Word-boundary and monoalphabetic holdout.** Preserved the printed 8:5 opening-word split and compared the equality pattern of all 13 red title runes plus the following first black `TH` against every tokenizable three-word window in the same source panel. The target pattern has eight distinct tokens in word one; word two repeats the first and third tokens of word one and introduces three new tokens; the held-out black `TH` is another new token. The scan produced zero candidates under both `NG` and `ING` tokenization.
3. **No arbitrary key fitting.** No Caesar, Vigenère, offset, or unconstrained 13-rune crib search was used. No alternate alphabet was introduced without an independent historical selector.

## The tempting partial overlap is not a source match

Book of the Law II.3 contains the wording `as she, the circumference, is nowhere found`. The first red title word transliterates as starting with `SHE`, and the first black body rune after both red words and the 13-dot marker is `TH`. This is a short, nonunique thematic echo and does not attribute the full thirteen-rune red heading to that source. It accounts for only three opening tokens plus one later post-period token; it does not explain the remaining ten opening tokens, preserve the printed 8:5 grouping, or satisfy the full equality-pattern test. Treat it as thematic overlap, not attribution. Likewise, the 13-rune length matching the 13 letters of `CIRCUMFERENCE` is only a length coincidence without a source-selected reversible operation.

## Conclusion

Retain #446 as a bounded negative test against the actual original 13-rune red-heading input, with a first-black-TH boundary check. It is source-faithful in colour placement but restricted to a finite pre-2014 text panel. The finite panel supplies no exact source phrase and no monoalphabetic source candidate that predicts the held-out post-period black `TH`. Reopen only if a newly authenticated original-era source or a documented alternate alphabet independently selects a complete operation and predicts the full 13-rune red title and first black body symbol. Do not continue the 662/331 arithmetic branch or expand into arbitrary GP29 key sweeps.

## Reproduction

Run `node sims/p0_red_header_source_gate.cjs` from the repository root. The script uses only Node built-ins and the pinned repository resources.
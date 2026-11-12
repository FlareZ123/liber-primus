# p0 red preamble: bounded historical source gate

**Result:** no source attribution survives the finite, independently selected panel. This is a bounded negative, not a claim that the red span is plaintext or that every possible historical source has been excluded.

## Frozen original input

- LP2 p0 is the original scan `resources/liber-primus/17.jpg`; the source-adjudicated red span in `resources/liber-primus/lp2-ink-annotations.json` begins at rune offset 0 and contains 13 runes.
- Exact glyphs: `ᛋᚻᛖᚩᚷᛗᛡᚠ ᛋᚣᛖᛝᚳ`.
- Canonical GP transliteration: `S H E O G M IA F  S Y E NG C` (`SHEOGMIAF SYENGC` when expanded). The printed word lengths are 8 and 5 runes.
- The first black rune after the red span is `ᚦ` = `TH`. The first p0 transcription line has rune-word lengths `8, 5, 4, 3`; the first black word begins with `TH`.
- The red header's 14-token test string is the 13 red GP tokens followed by the held-out first black token `TH`.

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
2. **Word-boundary and monoalphabetic holdout.** Preserved the printed 8:5 red word split and compared the equality pattern of the 13 red tokens plus the first black `TH` against every tokenizable three-word window in the same source panel. The target pattern has eight distinct tokens in word one; word two repeats the first and third tokens of word one and introduces three new tokens; the held-out black `TH` is another new token. The scan produced zero candidates under both `NG` and `ING` tokenization.
3. **No arbitrary key fitting.** No Caesar, Vigenère, offset, or unconstrained 13-rune crib search was used. No alternate alphabet was introduced without an independent historical selector.

## The tempting partial overlap is not a source match

Book of the Law II.3 contains the wording `as she, the circumference, is nowhere found`. The p0 red transliteration begins with `SHE`, and the first black rune is `TH`, so the short `SHE` / `THE` echo is noticeable. It accounts for only three red tokens plus one held-out token; it does not explain the remaining ten red runes, preserve the printed 8:5 grouping, or satisfy the full equality-pattern test. Treat it as thematic overlap, not attribution. Likewise, the 13-rune length matching the 13 letters of `CIRCUMFERENCE` is only a length coincidence without a source-selected reversible operation.

## Conclusion

Close #446 as a bounded no-source result. The finite panel supplies no exact source phrase and no monoalphabetic source candidate that predicts the held-out first black `TH`. Reopen only if a newly authenticated original-era source or a documented alternate alphabet independently selects a complete operation and predicts the full red span plus a held-out symbol. Do not continue the 662/331 arithmetic branch or expand into arbitrary GP29 key sweeps.

## Reproduction

Run `node sims/p0_red_header_source_gate.cjs` from the repository root. The script uses only Node built-ins and the pinned repository resources.
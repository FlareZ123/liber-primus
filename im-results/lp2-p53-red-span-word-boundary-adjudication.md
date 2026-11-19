# p53 red-span source adjudication: the 23/28 split does not reproduce

**Classification:** source-level correction to the proposed `///53` / 5×6 red-dot locator. This is not a decryption and does not challenge the separate 2013 ALL AROUND receiver route.

## Fixed original input

The source annotation identifies LP2 physical p53 as original scan `70.jpg`, with the red span at zero-based rune offsets **128–178 inclusive** (51 runes). The original image SHA-256 is:

`4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548`

This matches the source hash in `resources/liber-primus/lp2-page53-red-span.json`. The page has 179 runes. The exact p53 rune sequence occurs once in the canonical transcription, so the extracted red interval is fixed without choosing a text occurrence.

## Reconstructed printed structure

The red interval begins with rune `ᛏ` at the end of physical line 6. It continues across the line break into the first red word on line 7. The last rune of line 7 and first rune of line 8 also continue one word because no printed word separator occurs at that line break. Counting rune glyphs per physical line gives:

`[1, 24, 22, 4]`

Removing only transcription line/page markers and splitting at the printed hyphen word separators gives these 12 canonical word lengths:

`[5, 4, 4, 11, 2, 3, 2, 6, 5, 5, 2, 2]`

They sum to 51. The first six words contain **29** runes; the last six contain **22**. The cumulative word-boundary positions are:

`[5, 9, 13, 24, 26, 29, 31, 37, 42, 47, 49, 51]`

Neither 23 nor 28 is a word boundary. Therefore the broadcast claim that the p53 red paragraph has first-six/last-six totals **23/28** is not reproducible from the canonical printed word boundaries or the original source image. The reported physical line counts `[17,23,11]` also do not match the red-glyph counts in the original transcription; the source interval spans four line positions as `[1,24,22,4]`.

## Consequence for the 5×6 hypothesis

The 30-block → five 6-bit values → `///53` candidate remains an unverified locator hypothesis. The p53 23/28 split must be removed as corroboration: it depends on word/line counts that the original p53 source does not support. This negative does **not** refute the independent observation that p53 has a 51-rune red span, nor the separate 2013 ALL AROUND → p50 cell252 → p53 receiver construction. It only removes the claimed 23/28 bridge between the proposed 5×6 dot matrix and p53.

Do not use the 23/28 partition to choose a p53 cipher, block boundary, key, or receiver. Reopen that branch only if a source-visible segmentation rule, fixed before inspecting p53, independently yields the claimed partition.

## Reproduction

Run the dependency-free Node script:

`node sims/lp2_p53_red_span_word_boundary_adjudication_sft.cjs`

It verifies the original image SHA-256, unique canonical p53 sequence, exact 51-rune red interval, physical-line rune counts, printed word boundaries, and the absence of a 23/28 split.

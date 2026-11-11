# Agent43 correction: exact edge-window counts and repository-wordlist null

Correction/refinement to my 06:17 handoff:

- The 22 canonical p32 words yield **32 raw four-rune prefix/suffix windows**, **29 unique** after deduplicating identical prefix/suffix windows of four-rune words, and **9 unique** windows whose four GP runes each transliterate to one letter: HOME, SLFD, TYMG, WBSR, BUDS, NWGU, LAOY, UTFJ, TFJT.
- Only HOME and BUDS occur in the repository's 1,809-entry four-letter TextBlob frequency lexicon, resources/control/english_wordfreq_textblob.txt.
- There are five unique geometrically valid SE word-edge pairs separated by 60: starts (4,64), (16,76), (25,85), (33,93), (44,104). Only (33,93) is HOME/BUDS. The other four contain digraphs/nonwords. Of the 36 SE diagonals, three have interior prime sum318; only (3,0)→(8,5) is a word-edge pair. The other two 318 diagonals start at offsets35 and45 and have endpoint sums444 and394 (NE), not E.

Exact conditional null using the repository's TextBlob word-frequency lexicon:
- word-8 prefix: 9 dictionary outcomes / 720 ordered placements of its 10 free runes;
- word-16 suffix: 3 / 1,680 ordered placements;
- 7 endpoint-word pairs yield the E sector;
- the four interior diagonal cells sum exactly318 in 18 / 2,240 within-word placements.
Joint conditional probability = 1/21,504,000 ≈ 4.65×10⁻⁸. A broader CMUdict sensitivity gives 13/30,105,600 ≈ 4.32×10⁻⁷. These are conditional diagnostics, not global p-values; multiplicity from selecting the 4-rune edge operation, +60 displacement, p15 11th spiral item and direction convention remains.

This makes the candidate more interesting, but the selector question remains: does the p15 4×4 structure genuinely prescribe four-rune word-edge windows, and does the p32 11×11 side prescribe the 11th spiral item? The fixed original-image six-tile readout is still the next independent test.

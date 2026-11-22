# Agent 34 — OpenPuff square-key test and historical correction

The first 5×5 / 3301 and second 7×7 / 1033 squares from the 2014 OpenPuff output have now been tested on all 12,956 unsolved LP2 runes. The source-locked row-major mod-29 additive-key family (16 models) and Hill family (96 models) recover no English: best scores are −5.13166 and −5.13033, versus a uniform-random baseline of −5.17313 and held-out English at −2.66335. The third 5×5 / 1033 square is the LP1 page-05 square already covered by the existing report.

Reproducer: \`sims/openpuff_magic_square_remaining_gate.cjs\`
Evidence: \`im-results/openpuff-magic-square-remaining-gate.md\`

Historical correction: the documented OpenPuff 4.0.0 procedure uses password **33011103** with 50% MP3 bit selection. The **33011033** variant is secondary. The sixth-onion page explicitly requests the three squares as a submission plus a Tor upload endpoint, which supports their credential role rather than an LP2 cipher-key role.

This does not test OpenPuff extraction from LP2 JPEGs. The available LibrePuff implementation currently has only a WAV carrier parser; its non-WAV dispatcher path is unimplemented. Please do not cite these key tests as a negative JPEG-steganography test.

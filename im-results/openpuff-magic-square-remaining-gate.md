# Remaining 2014 OpenPuff magic squares as LP2 key material

## Result

No plaintext was recovered. The first two squares from the historical OpenPuff output were tested against all 12,956 runes on LP2 pages 0–55:

- The first 5×5 square has magic constant 3301.
- The second 7×7 square has magic constant 1033.
- The third 5×5 / 1033 square is the LP1 page-05 square and is already covered by [the existing 5×5 investigation](magic-square-5x5-direct-pad.md).

The two remaining squares were tested in two source-constrained roles:

1. **Direct additive GP29 key:** row-major cell values reduced modulo 29; both the full cell count and the count minus the repeated closing cell; both signs; global stream and page-local reset. This is 16 models.
2. **Hill matrix over F29:** the matrix, transpose, inverse, and inverse-transpose; every block phase; global stream and page-local reset. This is 96 models.

The best Hill score was **−5.13033** (7×7, inverse-transpose, page reset, phase 4). The best additive score was **−5.13166** (7×7, period 48, negative sign, page reset). The uniform-random bigram baseline was **−5.17313**; held-out Shakespeare English scored **−2.66335**. These outputs remain essentially random, not partial plaintext.

The matrices are invertible modulo 29 (determinants 10 and 2), so the negative result is not caused by singular matrices. Reproduce with:

\`node sims/openpuff_magic_square_remaining_gate.cjs\`

## Historical interpretation

The archived OpenPuff procedure specifies OpenPuff 4.0.0, the carrier \`interconnected.mp3\`, 50% MP3 bit selection, and password **33011103**. The often-copied **33011033** is an alternate transcription, not the password in that procedure. The sixth-onion page then explicitly asks participants to submit the three magic squares and a Tor hidden-service upload endpoint. That is direct evidence for a submission/credential role; it is not an instruction to reuse the squares as an LP2 cipher key.

The first two squares have now failed the simplest reversible GP29 interpretations tested here. The third square is the 5×5 / 1033 square already tested in the linked report. This makes a direct additive or Hill-key role for the three-square set less plausible, while preserving the historically established submission role.

## Scope and limits

- The key sequence uses the published row-major order and the natural top-left start; no arbitrary key search was performed.
- The Hill test covers the four natural matrix orientations and every block phase.
- This does **not** test every possible use of the squares, such as a different transposition or a separately specified nonlinear schedule.
- This does **not** test OpenPuff steganographic extraction from LP2 JPEGs. The historical OpenPuff stage used an MP3. The available [LibrePuff carrier dispatcher](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier.rs) currently implements the WAV parser and leaves other carrier types unimplemented; its [WAV parser](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/parser/wav.rs) is not a JPEG implementation. Do not treat this key test as a negative JPEG-steganography test.

## Inputs

- \`resources/cicada2014-openpuff-magic-squares.txt\`
- \`resources/liber-primus/lp2-corpus.json\`
- \`resources/control/shakespeare_first300k.txt\`
- Historical procedure: [Interconnected OpenPuff reconstruction](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Interconnected_OpenPuff.md)
- Sixth-onion submission page: [three-square upload instruction](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/assets/stage10/ut3qtzbrvs7dtvzp.onion/index.html)

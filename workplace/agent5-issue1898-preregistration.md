# Original-first preregistration: LP2 p22 and p24–p26

**Owner:** Agent5  
**Issue:** [#1898](https://github.com/FlareZ123/liber-primus/issues/1898)  
**Frozen:** 2026-11-19 13:42 UTC  
**Scope:** at most three observable clue → recognizable operation → original-cipher prediction hypotheses. No p22/p24–p26 candidate outputs or current p22/p23/p27 derived reports were used to select these hypotheses. The p23/AL31 report from the preceding issue is not used here.

## Original-source observations

Original images are the LP2 files `resources/liber-primus/39.jpg` (p22), `41.jpg` (p24), `42.jpg` (p25), `43.jpg` (p26), and LP1 `14.jpg`–`16.jpg`. SHA-256 hashes of the uploaded original JPEGs:

| Page | SHA-256 |
|---|---|
| LP2 p22 | `e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7` |
| LP2 p24 | `62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80` |
| LP2 p25 | `a7d6e597debff4f7c5b3516e1b02ca2e4fa5b37d972f567264ed2ec845013cff` |
| LP2 p26 | `ed88f5fcdca3d1f846538caa8be979aa28cde969eb99c9464d60daa26c1f9af7` |
| LP1 p14 | `de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e` |
| LP1 p15 | `f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9` |
| LP1 p16 | `984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe` |

1. **p22 cross-round artwork:** the reclining figure in LP2 p22 is a horizontal mirror of the body illustration repeated on LP1 p14–p16. A focused ORB comparison after horizontal reflection (3,000 features; Hamming cross-check; distance <55; RANSAC reprojection threshold 3 px) gave 986 inliers and an estimated scale of 0.995. This is a strong image-reuse/mirror observation, not yet a cipher instruction.
2. **Where the 5×5 square actually is:** LP2 p22 itself has no printed 5×5 square and is not a 5×5 word grid. Its 131 runes occupy six lines with word counts `[7,4,5,5,5,4]`. The relevant 5×5/3301 matrix is on LP1 p16, among the LP1 p14–p16 pages returned by the 2014 Stage10 form. Its rows, columns and both principal diagonals sum to 3301:

   ```text
   434   1311   312   278   966
   204    812   934   280  1071
   626    620   809   620   626
  1071    280   934   812   204
   966    278   312  1311   434
   ```

3. **p24–p26 artwork:** each page repeats a bilateral insect illustration. The left crop on p24 and p26 is pixel-identical at the same crop coordinates; p25 is a near repeat with a small raster/placement difference. Visual comparison does not establish that this is the LP1 p05 moth or the LP1 p15/p16 beetle. Treat it as a within-LP2 repeated mirror motif unless a source match is established.
4. **p24–p26 text structure:** the raw rune counts are 270, 273 and 265 respectively; each page has 12 printed lines. The full p24 and p26 rune streams are not equal or exact reversals. No simple outer-page mirror pairing is visible in the source transcription.

## Historical clues available for a human solve path

- The pinned 2014 Stage10 form asks for order-5/3301, order-7/1033 and order-5/1033 squares, plus the solver's onion address; its archived static response links LP1 pages 14–16. [Form source](https://github.com/micheloosterhof/cicada-2014/blob/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage10/index.html). The form's server-side handler is not preserved, so its missing response logic cannot supply an operation.
- The 2016 OutGuess/OpenPGP-signed Cicada text says: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” The signature verifies under the stored key. [Pinned carrier](https://github.com/micheloosterhof/cicada-2016/commit/a4c72e7207e2dac8dc473b6e705e7ba75141e8b1); [preserved signed payload](../resources/historical/cicada2016-4gq25-outguess.asc).
- Earlier successful stages provide recognizable operations with selected operands: 2012 ROT−4 and OutGuess; 2013 book codes with explicit coordinate grammar; 2014 Stage04 Vigenère with an explicitly selected solved-text key. These are precedents for clue-selected operations, not permission to transfer those particular keys or algorithms to LP2.

## Frozen hypotheses and tests

### H1 — literal mirror preprocessing (testable)

- **Clue:** p22 reuses the LP1 body artwork in horizontal reflection; p24–p26 repeat bilateral insect art.
- **Operation:** horizontally reflect the runic text image: reverse rune order within each printed line and reflect each rune glyph. Map reflected glyphs to the closest original GP29 glyph templates using one fixed, global rule; no manual exceptions, Atbash, Caesar shift or language-score tuning.
- **Prediction:** the reflection induces a one-to-one GP29 symbol permutation. The same fixed transform, combined with the already-published p56/p57 decryption implementation and parameters, must preserve the p56/p57 solved controls exactly. Only if both the bijection and controls pass may the transform be applied to p22/p24–p26.
- **Falsifier:** non-injective/ambiguous glyph mapping, failure on either solved control, or no stable plaintext on the target pages. A page-pair reversal alone is already disfavoured by unequal p24/p26 rune counts.

### H2 — LP1 5×5/3301 square as a Polybius/Bifid operand (selector gate)

- **Clue:** p22's mirrored LP1 body points back to pages 14–16; LP1 p16 contains the 5×5/3301 square; the 2014 Stage10 form explicitly requested an order-5/3301 square; p24–p26 add bilateral imagery.
- **Recognizable operation:** a 5×5 Polybius/Bifid-style fractionation.
- **Prediction required for execution:** a source-fixed 25-symbol alphabet, square-cell ordering and period must be specified before reading target output.
- **Falsifier / current gate:** GP29 has 29 rune symbols, while a standard 5×5 Polybius/Bifid alphabet has 25 cells. No authenticated source here specifies which four symbols to merge/omit, how to convert the numeric magic square into a letter square, or a period. Do not search mappings; reject as under-specified unless a historical source supplies the missing selector.

### H3 — 2016 map/road/direction route walk (selector gate)

- **Clue:** authenticated 2016 “words/map, meaning/road, numbers/direction” instruction plus the 5×5/3301 square and mirrored page art.
- **Recognizable operation:** traverse a 5×5 map using numeric directions, with the mirrored art fixing orientation.
- **Prediction required for execution:** one unique start cell, number-to-direction encoding, step scale, wrap/boundary rule and termination rule, all selected by source material.
- **Falsifier / current gate:** the signed message gives none of those parameters, and the Stage10 form's server handler is missing. Without them, a route can be tuned to arbitrary text; do not test a family of moduli, starts or path conventions.

## Comparison rule

After this file is committed, current p22/p23/p27 reports may be consulted **only as controls** to avoid duplicated work and to check whether these frozen predictions were already tested. They must not be used to change the three hypotheses or tune their parameters. Any later test must preserve the original ciphertext, fixed parameters, exact output and a negative/control comparison.


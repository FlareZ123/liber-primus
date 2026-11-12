# First-occurrence keyed alphabet from the p50 76-cell perimeter against p55

**Decision (12 November 2026): bounded negative.** A conventional keyed-alphabet substitution derived from the original 76-cell p50 perimeter does not recover ordinary native-GP English from either the complete 76-rune p55 sequence or its 43 strict-interior runes. No unknown plaintext, authentic key, or cipher mechanism is recovered.

## Human-solver hypothesis and weakest premise

Three original clues make this a plausible, finite experiment:

1. The solved p57 *PARABLE* says to “shed our own circumferences.” Removing the first and last rune of each longer printed word on p55 leaves **43 strict-interior runes** from its 76 original runes.
2. The original pp49–51 numerical table is a printed **32×8** array. Its physical clockwise outer perimeter, starting at the top-left cell, contains **76** values, matching the total p55 rune count.
3. Liber Primus uses the authenticated **29-symbol Gematria Primus** alphabet. Reducing the perimeter values modulo29 therefore gives a natural candidate key phrase over the GP alphabet.

The tested conventional construction is: reduce each perimeter value modulo29; retain the first occurrence of each residue in perimeter order; append the missing GP indices in ascending canonical alphabet order. This yields a 29-symbol keyed alphabet. Decrypt by either natural inverse orientation: (a) plaintext is the ciphertext symbol's rank in the keyed alphabet, or (b) plaintext is the keyed-alphabet symbol at the ciphertext index.

**Weakest assumption:** no original Cicada instruction explicitly says to reduce this table perimeter modulo29, deduplicate it into a keyed alphabet, or append missing symbols in canonical order. The clockwise top-left start is visually natural, but direction is not authenticated. The printed table's radix is also not fully settled: base60 is the conventional reading, while the f-omitting base59 alternative remains possible. This is a source-motivated candidate, not an established cipher.

## Frozen original inputs and construction

- **resources/liber-primus/lp2-corpus.json** Git blob SHA-1: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.
- **resources/liber-primus/base60-grid.json** Git blob SHA-1: 4698c0806e6bab06a39cfbc3c3283b862de58b35.
- **resources/control/shakespeare_first300k.txt** Git blob SHA-1: 94c677ad9dd50771c6670e0c4e4dad9052b46d85.

The perimeter order is fixed: top row left-to-right, right edge top-to-bottom, bottom row right-to-left, left edge bottom-to-top. The only orientation alternative is the exact reversal. For base60, use the preserved byte_rows; for base59, decode the original printed two-character tokens with the alphabet 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx after deleting f. No token correction or secret offset is applied.

The p55 43-interior positions are the source-locked zero-based physical offsets:

[2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,33,34,37,38,39,40,43,44,49,50,51,52,53,56,57,58,59,60,65,66,67,68,71,74].

The test applies the same keyed alphabet to both (i) these 43 interiors in printed order and (ii) all 76 original p55 runes. It does not permute positions, change word boundaries, fit a Caesar shift, choose a phase, or optimize the key.

## Original-cipher results

A GP-native trigram model is trained on the first 75% of the repository's Shakespeare control after the same canonical GP transliteration and longest-rune matching used by the existing p55 ring tests. The remaining 25% supplies **54,657 overlapping 43-rune windows** and **719 nonoverlapping 76-rune windows**. These are empirical reference windows, not independent statistical trials.

| Table radix | Perimeter direction | Decoder direction | Distinct residues before completion | p55 interior score | Full p55 score |
|---|---|---|---:|---:|---:|
| base60 | clockwise | rank in keyed alphabet | 24 | −5.939428347842 | −6.208920826326 |
| base60 | clockwise | keyed alphabet at ciphertext index | 24 | −6.442717364012 | −5.829897646654 |
| base60 | reverse | rank in keyed alphabet | 24 | −6.253900834280 | −6.281440284924 |
| base60 | reverse | keyed alphabet at ciphertext index | 24 | **−5.233392776449** | **−5.598107992264** |
| base59 | clockwise | rank in keyed alphabet | 27 | −5.389125468558 | −5.733968206098 |
| base59 | clockwise | keyed alphabet at ciphertext index | 27 | −6.416502578349 | −5.984209146941 |
| base59 | reverse | rank in keyed alphabet | 27 | −5.959694632055 | −5.844311590744 |
| base59 | reverse | keyed alphabet at ciphertext index | 27 | −6.357061520822 | −5.836368263686 |

The best 43-interior output is the base60 reverse-perimeter inverse, score **−5.233392776449**. The best full-page output is the same variant, score **−5.598107992264**. Both remain below every corresponding held-out native-English window:

- 43-rune controls: minimum **−3.595001913745**, median **−2.355486123613**.
- 76-rune controls: minimum **−3.145569093901**, median **−2.376220928751**.

The raw p55 scores are **−6.015200635868** for the 43 interiors and **−5.693042771543** for the full 76 runes. The best keyed-alphabet inverse improves the score slightly but remains far outside the native reference range. Its 43-rune GP output is:

**E-IA-N-Y-B-EA-L-TH-D-M-AE-C-O-IA-E-OE-M-U-S-T-R-EO-B-L-U-S-N-W-IA-Y-O-Y-EO-N-EA-EA-W-AE-IA-E-M-I-W**

It is not coherent plaintext. Every substitution preserves the original symbol histogram; the 43-interior IoC remains **0.034330011074**.

## Reproducibility and controls

The standalone Node.js 22 reproducer is **sims/p55_ring76_keyed_alphabet_sft.cjs**. It reads only the three listed repository sources, asserts the 32×8 table, 76-cell perimeter, 76-rune p55 page and exact 43 interior offsets, builds all eight fixed keyed alphabets, emits every key and full output, and compares the outputs against the frozen Shakespeare holdout.

For each of the eight variants, a native 43-rune held-out Shakespeare segment and a native 76-rune segment were encrypted with the exact inverse permutation and recovered exactly. These positive controls establish that both inverse orientations are implemented correctly. They do not establish that the source-selected perimeter is a historical key.

## Decision and remaining scope

Reject only this fixed family: base59/base60 table readings; top-left clockwise/reversed 76-cell perimeter; modulo29 residues; first-occurrence deduplication; ascending completion of missing GP symbols; and the two inverse keyed-alphabet directions. All eight original outputs fail the native-GP language control.

This is distinct from the already-tested direct additive, XOR, predecessor-differential and GP28 predecessor-excluding perimeter families. It does **not** exclude other source-selected operations, nonlinear or stateful ciphers, a different historically specified key construction, or a non-English plaintext. Do not broaden this result into a generic rejection of monoalphabetic substitution.

The useful consequence is narrow: the visually natural 76-cell perimeter → GP29 keyed-alphabet construction does not solve p55, despite the 76/76 and 43/43 structural correspondences. A future p55 decoder still needs an independently selected reversible operation and a withheld prediction on the original 76 glyphs, including the 33 exterior runes. No hash preimage, final destination, or unknown LP2 plaintext is recovered.

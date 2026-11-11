# p15→p32 318° map/direction test

**Classification:** provisional source-constrained navigation hypothesis; not a decoder.

## Source instruction and proposed operation

The authenticated 2016 signed message assigns the roles explicitly: “The words are the map, their meaning is the road, and their numbers are the direction.”

The p32 page has 121 runes. Reshaping them row-major into 11×11 is inferred, not printed. Its first-row and first-column GP-prime sums reproduce the signed image dimensions, 563×569. The cumulative tile edges are:

- x: [0, 73, 78, 179, 198, 299, 302, 345, 452, 465, 484, 563]
- y: [0, 73, 96, 101, 124, 203, 262, 315, 394, 453, 562, 569]

The p32 map's side length 11 is a plausible selector for the 11th clockwise p15 spiral entry. That value is 2838:

- 3301 − 2838 = 463 = p90.
- Prime ordinal 90 gives Fibonacci index 89.
- Zero-based p32 offset 89 is the start of printed word 16.
- The p15 grid side length four plausibly selects that word's four-rune suffix, BUDS, at offset 93.

The four-rune HOME prefix is at offset 33. Treating these four-rune word-edge segments as map landmarks gives:

| Landmark | p32 offset | 11×11 coordinate | Image-space center |
| --- | ---: | ---: | ---: |
| HOME prefix | 33 | row 3, col 0 | (99, 112.5) |
| BUDS suffix | 93 | row 8, col 5 | (382, 423.5) |

The 11th p15 value gives 2838 mod 360 = **318°**. From the BUDS center:

- Bearing to image origin (0,0): **317.949316°**.
- Bearing to HOME center: **317.698813°**.
- An exact 318° ray reaches the top image edge at x = **0.679 px**.
- HOME lies **1.838 px** from the BUDS-to-origin ray.
- Among all 16 clockwise p15 values, step 11 is nearest to the origin bearing by 0.0507°; step 12 is next at 312°, 5.9493° away.

The HOME start (row 3, col 0) and BUDS suffix (row 8, col 5) define a five-step down-right diagonal in the inferred index map. Its four interior cells are offsets 45, 57, 69 and 81: B, M, IA, NG. Their GP-prime weights 61+71+107+79 sum to **318**. The p15 value, p32 diagonal and image-space bearing therefore converge on the same direction.

## Discriminating controls

The reproducer tests alternatives rather than reporting only the positive alignment.

- **Wrong spiral orientation:** the counterclockwise 11th value is 1206; 3301 − 1206 = 2095 = 5×419, composite. It produces no prime-rank/Fibonacci address.
- **One-based indexing:** offset 88 lands on the final rune of word 15 (SPTHT), not the word-16 start or BUDS suffix.
- **Unrelated 4×4 control:** the first 16 p0 GP-prime weights, arranged row-major as a control block, have 67 in cell 11; 3301 − 67 = 3234 = 2×3×7²×11, composite. The p32 top-left 4×4 control gives 61 and composite complement 3240.
- **Window length:** among single-letter GP-transliteration word-edge windows, the 3-rune control has 10 windows and no pair within 0.5° of 318°; the 4-rune set has seven windows and exactly one ordered pair, BUDS→HOME at 317.6988°; the 5-rune control has six windows and no such pair.
- **Digraph sensitivity:** allowing all GP digraphs creates 24 four-rune edge windows and an additional near-match, WXIATH→IARTTH at 318.1548° (offset separation 35). The English/single-letter filter is material and must not be hidden.
- **The +60 pair:** HOME/BUDS are 60 offsets apart, but this is an observed cross-check, not a selector. The other +60 edge pair, NGBEOIA→NWGU, has bearing 320.5567° and interior diagonal prime sum 262.
- **Diagonal non-uniqueness:** the sum 318 occurs in three four-cell diagonals in the full matrix. The HOME/BUDS endpoint construction selects this B/M/IA/NG segment; the sum alone is not unique.

## Meaning and limits

B, M, IA and NG are the GP runes Beorc, Mann, Iar and Ing. The Old English Rune Poem offers a suggestive semantic fit with tree/shoots, humanity, a water-surrounded dwelling and an eastward journey. This is not a unique or authenticated continuation, and it does not identify a destination.

The signed instruction makes a words/map, meanings/road, numbers/direction reading plausible. However, the 11×11 reshape, 11th-entry selector, four-rune edge selector and modulo-360 operation are not explicit printed instructions. HOME and BUDS are four-rune edge substrings, not complete whitespace-delimited words. The all-digraph control exposes an alternative near-match. The historical base60 interpretation and 2012-to-2016 image-axis transpose remain separately qualified; neither is required for the bearing calculation.

**Conclusion:** this is a reproducible, source-constrained navigation candidate and a new p15→p32 relationship. It is not recovered plaintext, a cipher key or a final external destination.

## Next decisive test

Test the 318° ray on the original signed 2016 image as a word-anchor-to-origin/empty-path hypothesis, with the candidate ray and matched alternative rays frozen before image scoring. Earlier local-gradient tests used per-cell prime labels and do not test this word-anchor ray. Any use of the B/M/IA/NG meanings should predict a concrete LP2 coordinate or reversible operation before further semantic exploration.

## Reproduction

Run from the repository root:

    python sims/p15_p32_318_direction_sft.py

The script reads the original transcription from **resources/liber-primus/lp2-transcription.txt** and asserts the dimension checksums, p15 prime/Fibonacci address, 318° geometry, diagonal sum, wrong-direction/indexing controls and unrelated 4×4 control.

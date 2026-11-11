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

**Conclusion:** this remains a reproducible but provisional navigation candidate. The first text-extraction gate is negative: the 318° ray yields no readable rune sequence, and the 16 p15 bearings do not form a continuous path through the unambiguous word-edge windows. It is not recovered plaintext, a cipher key or a final external destination.

## Follow-up text/path gate (2026-11-11; negative)

The first source-locked textual follow-up was tested without changing the 11×11 reshape or word boundaries:

- Traversing the 318° ray from the image origin toward BUDS crosses rune offsets [0, 11, 12, 13, 24, 35, 46, 47, 58, 59, 70, 81, 82, 83, 84, 95]. Their GP transliterations are **L, H, W, B, B, M, EO, IA, G, TH, X, NG, IA, EA, J, D**. This is not plaintext.
- The 16 clockwise p15 values modulo 360 are [59, 58, 56, 54, 48, 38, 18, 342, 272, 158, 318, 312, 20, 348, 126, 196]. Against the seven unambiguous single-letter four-rune edge windows, only two directions have a pair within 0.5°: step 4, 54° (UTFJ→BUDS), and step 11, 318° (BUDS→HOME). They do not form a continuous 16-step path. Allowing multi-letter rune transliterations creates additional incidental near-matches, not a chain.
- Direct Vigenère-style shifts of the 16 ray runes by the p15 values modulo 29, by their 3301-complements modulo 29, and by the totient shifts of the prime complements (including both path directions and the two obvious endpoint skips) produce no readable output.
- Treating each p32 word's GP-prime sum modulo 360 as the bearing to the next word also fails: mean angular error 57.86°, median 54.61°, and only 2 of 21 links fall within 5°.

These tests do not disprove the original geometric coincidence, but they do reject the obvious direct textual readings and the full 16-bearing route. The 318° alignment is therefore not, by itself, an extraction rule.

## Next decisive test

No further geometric tuning or unconstrained key-order search is justified. A future attempt must first obtain an independent source clue that specifies a reversible operation and exact rune/word selection on the original p32 ciphertext. Until then, retain this as a navigation hypothesis only; do not promote it to a cipher mechanism or plaintext.

## Reproduction

Run from the repository root:

    python sims/p15_p32_318_direction_sft.py

The script reads the original transcription from **resources/liber-primus/lp2-transcription.txt** and asserts the dimension checksums, p15 prime/Fibonacci address, 318° geometry, diagonal sum, wrong-direction/indexing controls and unrelated 4×4 control.

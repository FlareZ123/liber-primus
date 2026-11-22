# LP1 p05 MOBIUS → LP2 p55 FOLD half-twist source gate

**Decision (18 November 2026): reject before ciphertext.** The proposed 16-cell Möbius half-twist does not have the source geometry claimed by Director #1496 and does not define a unique 16-word permutation without extra conventions. No p55 decoding was run.

## Exact original layout

The pinned original 2014 LP1 p05 `0_wisdom` transcription contains this mixed 5×5 table:

```text
272        138      SHADOWS   131       151
AETHEREAL  BUFFERS  UOID      CARNAL    18
226        OBSCURA  FORM      245       MOBIUS
18         ANALOG   UOID      MOURNFUL  AETHEREAL
151        131      CABAL     138       272
```

The page itself says that primes and the totient function are sacred. The already-established GP-prime-sum expansion maps the word cells to the historical numerical square cell-for-cell. Its middle row is:

```text
226  245  91  245  226
```

Therefore:

- `MOBIUS` is at **row 3, column 5**, on the perimeter, and its GP-prime sum is **226**.
- The antipodal perimeter cell eight steps away is **row 3, column 1**, which is the literal printed number **226**.
- `OBSCURA` is at **row 3, column 2**, one cell inside the perimeter, and its GP-prime sum is **245**.
- The row has a genuine numerical reflection: MOBIUS ↔ printed 226 and OBSCURA ↔ printed 245, with FORM=91 at the center. That symmetry does not move OBSCURA onto the perimeter.

The Director premise that MOBIUS and OBSCURA occupy opposite perimeter cells is therefore false on the original source.

## Exact 16-cell perimeter

Taking the ordinary square boundary and starting at MOBIUS, one clockwise orientation gives the following labeled positions:

| offset | cell | original content | expanded value |
| ---: | --- | --- | ---: |
| 0 | r3c5 | MOBIUS | 226 |
| 1 | r4c5 | AETHEREAL | 366 |
| 2 | r5c5 | 272 | 272 |
| 3 | r5c4 | 138 | 138 |
| 4 | r5c3 | CABAL | 341 |
| 5 | r5c2 | 131 | 131 |
| 6 | r5c1 | 151 | 151 |
| 7 | r4c1 | 18 | 18 |
| 8 | r3c1 | 226 | 226 |
| 9 | r2c1 | AETHEREAL | 366 |
| 10 | r1c1 | 272 | 272 |
| 11 | r1c2 | 138 | 138 |
| 12 | r1c3 | SHADOWS | 341 |
| 13 | r1c4 | 131 | 131 |
| 14 | r1c5 | 151 | 151 |
| 15 | r2c5 | 18 | 18 |

The perimeter is thus two identical eight-value arcs in this orientation:

```text
226 366 272 138 341 131 151 18
226 366 272 138 341 131 151 18
```

This period-eight fact was already established in the existing direct-perimeter study. A half-twist does not create sixteen independent source values.

## Why topology does not supply a unique word permutation

A standard Möbius strip construction takes a rectangular band, reverses one end, and identifies the two ends. It specifies a topology. It does **not** canonically turn one cyclic sequence of 16 labels into a particular linear permutation of 16 p55 word slots.

Even if the erroneous OBSCURA seam were repaired to the actual antipodal r3c1=226 cell, an LP2 consumer would still need source rules for at least:

1. how the square boundary is cut into the two longitudinal edges of the band;
2. which labeled edge is read first after the half-twist;
3. whether paired cells are interleaved, concatenated, or traversed on the single glued boundary;
4. which p55 word receives the first resulting label and how the incoming p54 carry is treated.

Those are cryptographic/readout conventions rather than consequences of the Möbius topology. Different choices give different 16-position permutations while satisfying the same abstract half-twist.

The source does not supply these conventions. The literal word `MOBIUS`, the p55 heading `FOLD`, and circumference language can motivate examining a half-twist, but they do not select one reversible 16-word mapping.

## Disposition

Director #1496 required stopping if the original layout did not yield one unique perimeter order/seam/permutation without extra choices. That gate fails twice:

1. **source mismatch:** OBSCURA is not the opposite perimeter cell;
2. **non-identifiability:** correcting the antipode to the printed 226 still leaves the Möbius-to-word readout underdetermined.

Accordingly no new p55 cipher, key, sign, phase, reset, alphabet, or language-scored permutation was tested. The existing direct perimeter and direct arithmetic Möbius-function negatives remain the relevant bounded consumers.

This result recovers no unknown LP2 plaintext or key. A future reopening would require a first-party source that explicitly fixes the band cut/readout and the p55 consumer rather than another topological convention.

## Source inputs

- `resources/external/2013-0-wisdom.txt` — pinned raw rune/numeric transcription, Git blob `320257b0db6ee6326ef3fc216c5379c9c91694f3`.
- `resources/external/2013-0-wisdom-source.md` — source note identifying the byte-identical 2014 Stage04 original image, Git blob `2829e13812015601ff1014cb4427587b4a8aa3a6`.
- `im-results/2014-magic-square-direction-map.md` — established 25/25 GP-prime-sum expansion and prior direct perimeter / direct μ(n) gates.

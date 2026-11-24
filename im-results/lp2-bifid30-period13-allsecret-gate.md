# 30-symbol period-13 rectangular Bifid: key-independent exclusion

## Decision

The source-motivated **fixed-key 5×6 Bifid hypothesis over GP29 + SPACE, period 13**, does not produce source-native prose from LP2. A key-independent frequency bound excludes every permutation of the 30-symbol square for both transform directions, under continuous, eight-section, and annotated-13-dot reset clocks.

This closes this exact branch. It does **not** establish that Bifid was intended, solve any LP2 page, or exclude dynamic key squares, other periods, other alphabets, or different segmentation transducers.

## Why this was worth testing

The proposed human solve path was deliberately narrow:

- LP2 p15 has a prominent butterfly illustration (original page image, archive page 32), a plausible visual prompt for *Bifid*.
- The p0 red span contains exactly 13 runes, followed by an annotated 13-dot mark at rune offset 13. That suggests a period-13 clock.
- GP29 has 29 symbols; treating word-space as the 30th symbol fills a 5×6 rectangle exactly. The signed 2016 Cicada message's “path lies empty” wording makes SPACE a plausible cipher symbol; its “words / map / numbers / direction” language is at least compatible with coordinate fractionation.
- The p0 red span and its following delimiter were tested both as part of the input and as a removed key/initialization segment. The body-only version removes 13 red runes, their internal word separator, and the following 13-dot delimiter: 15 tape tokens total. The remaining p0–p2 section has 871 symbols, exactly 67 periods of 13.

These are clues motivating a test, not proof of creator intent.

## Exact transform tested

The alphabet is the 29 source GP runes plus SPACE, mapped to a 5-row × 6-column rectangle. The key square is allowed to be **any fixed permutation** of those 30 symbols.

For a period-13 block, Bifid interleaves ciphertext coordinates as
`r_0,c_0,r_1,c_1,\ldots,r_{12},c_{12}`,
then splits the 26 coordinate values into two length-13 streams. Because 13 is odd, the coordinate orientation alternates: even output positions combine row then column; odd positions combine column then row and are transposed back. This makes the rectangular 5×6 variant closed for full 13-symbol blocks.

For decryption, with ciphertext block `C`, plaintext position `i` takes its row and column coordinates from
- `p = floor(i/2)`, `q = floor((i+13)/2)`;
- even `i`: row from `C[p]`, column from `C[q]`;
- odd `i`: row from `C[q]`, column from `C[p]`.

The forward direction was also bounded. Incomplete final blocks are left outside the transform and are reported as remainders.

## Key-independent bound

For each tested block, count ordered source pairs `F[a,b]` used to form a plaintext coordinate pair. For any fixed key square, a plaintext cell occupies one row and one column. Its source pairs therefore lie in a 6-symbol row × 5-symbol column rectangle: at most 30 ordered pairs.

Relaxing the row/column disjointness independently gives the upper bound
`min(sum(top-6 row sums of each row's top 5 pair counts), sum(top-5 column sums of each column's top 6 pair counts))`.
This bound is independent of the key-square permutation.

The 30-symbol source tape is parsed from `resources/lp2-transcription.txt` using the established GP29 rune order and the existing hyphen/full-stop-to-space convention. The eight unsolved-section lengths are `886, 1399, 2122, 2328, 1244, 1758, 2057, 4050` (15,844 symbols total). The body-only tape removes the 15-token p0 red-key/delimiter prefix.

A third clock uses every source-annotated 13-dot mark on p0–p55 as a reset. The page-local mark offsets are converted using `lp2-corpus.json` page rune counts; all 26 annotated p0–p55 marks match transcription delimiters exactly. The first segment is the 13-rune p0 red key plus its internal space and is discarded; the remaining 26 segments are processed independently.

### Results

The reference threshold is the **minimum**, across every sliding window of the same processed length in Shakespeare, Gibran's *The Prophet*, and Emerson's essays, of that window's most frequent GP29+SPACE symbol. This is an empirical source-native language gate, not a universal theorem about every possible English text.

| Input / clock | Direction | Symbols processed | Key-independent cap | Minimum reference | Gap |
|---|---:|---:|---:|---:|---:|
| Full tape / global | Decrypt | 15,834 | 1,718 | 2,727 | 1,009 |
| Full tape / global | Forward | 15,834 | 1,501 | 2,727 | 1,226 |
| Full tape / 8 sections | Decrypt | 15,808 | 1,711 | 2,721 | 1,010 |
| Full tape / 8 sections | Forward | 15,808 | 1,504 | 2,721 | 1,217 |
| Body-only / global | Decrypt | 15,821 | 1,711 | 2,721 | 1,010 |
| Body-only / global | Forward | 15,821 | 1,504 | 2,721 | 1,217 |
| Body-only / 8 sections | Decrypt | 15,795 | 1,715 | 2,719 | 1,004 |
| Body-only / 8 sections | Forward | 15,795 | 1,507 | 2,719 | 1,212 |
| After p0 key / every 13-dot reset | Decrypt | 15,678 | 1,694 | 2,699 | 1,005 |
| After p0 key / every 13-dot reset | Forward | 15,678 | 1,482 | 2,699 | 1,217 |

The frequency ceiling is at least 1,004 below the least demanding reference threshold in every tested case. The 13-dot-reset version is not a rescue: it is also excluded.

## Positive controls

The implementation was checked with a deterministic random 30-cell key permutation (xorshift seed `0x3301b1f1`):

- Global period-13 plant: exact encrypt/decrypt round-trip; the all-key bound was 3,802 against a planted plaintext maximum frequency of 3,166.
- Eight-section plant: exact round-trip; bound 3,789 against planted maximum 3,156.
- Reverse-direction plant: exact round-trip; bound 3,576 against planted maximum 3,166.
- Annotated-13-dot-reset plant: exact round-trip; bound 3,760 against planted maximum 3,129.

Thus the bound admits genuine Bifid plaintexts and the negative result is not caused by an incorrectly implemented transform or an over-tight bound.

## Reproduction

Run:

```bash
node sims/lp2_bifid30_period13_allsecret_gate.cjs
```

The script reads the original transcription, GP29 corpus, ink annotations, and three reference texts. It asserts the p0 key-prefix alignment, all 26 annotated 13-dot delimiter matches, all exclusions, and the positive-control round trips.

Related prior work:
- `im-results/coordinate-fractionation-pair-capacity.md` — fixed-shift 30-symbol coordinate-pair family.
- `im-results/lp2-bifid25-allsecret-period2-exclusion.md` — 25-symbol Bifid tests.
- `im-results/lp2-p0-epiphany-seeks-key-checksum-holdout.md` — conditional p0 known-plaintext key object.

## What remains open

This result excludes only a **fixed** 5×6 GP29+SPACE Bifid square at period 13 under the three tested clock scopes. It does not test a key square that changes per block, a different alphabet, a 6×6 square incorporating punctuation, other periods, or a different source-selected transducer. None of those alternatives should be pursued without an independent source clue that selects the added freedom.

No plaintext or key for the unsolved pages was recovered.

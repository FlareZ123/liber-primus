# LP1 p05 trailer: 5×5 triplet matrix and the 18-cell twist

**Status: intermediate structural observation. No plaintext, key, or intended decipherment has been recovered.**

## Established byte structure

The repository artifact `resources/liber-primus/05.jpg` is 673,066 bytes. Its first JPEG ends at byte offset 336,353 (exclusive). The remaining 336,713 bytes are exactly:

```
360-byte header || byte-reversal(first JPEG)
```

The second component is not merely a pixel-identical duplicate: reversing those 336,353 bytes reproduces the first JPEG byte-for-byte.

The 360-byte header is two LF bytes followed by 358 ASCII hexadecimal characters. Decoding the hex yields 179 bytes. These bytes have a highly regular structure:

- Five row markers `0xA0` occur at offsets `[0, 36, 72, 108, 143]`.
- Each row contains five 3-byte cells, separated by runs of `0x02`.
- Four rows have four 5-byte separators (35 bytes after the row marker).
- The fourth row has a 4-byte separator immediately after its first cell (34 bytes after the marker). This is the only short separator.
- The parse is unique when each cell is three bytes and each separator consists only of `0x02` bytes.

The resulting 5×5 matrix of three-byte cells is:

```
237323  833313  134333  133313  135313
636333  939313  033313  032333  028313
632323  534323  021393  534323  632323
831302  032333  033313  939313  636333
135313  133313  134333  833313  237323
```

These are described as RGB-like triplets only; their intended semantics are not established.

Reproducible fingerprints:

- File SHA-256: `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`
- Trailer SHA-256: `3814d8b9ca2e369477b47cbbead0bbe36779383f6f987d2ef247b3e5da2ed349`
- Decoded 179-byte header SHA-256: `82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa`

## Relation to the visible 5×5 square

The same page's visible 5×5 square, using the established Gematria Primus prime-sum values for its word cells, is recorded in `resources/cicada2014-openpuff-magic-squares.txt`:

```
272  138  341  131  151
366  199  130  320   18
226  245   91  245  226
 18  320  130  199  366
151  131  341  138  272
```

Every row sums to 1033, and the square is exactly symmetric under 180° rotation.

The hidden triplet matrix has the same 180° symmetry everywhere except one pair:

- Visible square cells (row 2, column 5) and (row 4, column 1), both value 18, contain `028313` and `831302`.
- Their byte triples are `[2, 131, 19]` and `[131, 19, 2]`: one is a one-position cyclic rotation of the other.
- The one short `0x02` separator occurs immediately after the latter cell, at row 4, column 1.
- For every other repeated value in the visible square, the corresponding hidden triplets are identical. Thus 18 is the only visible-square value that maps to more than one triplet.

This is the strongest observation in the investigation: the header is not just an arbitrary 5×5 collection of colors. Its equality pattern tracks the visible prime-sum square, with a single, position-specific twist at the pair of 18 cells.

## Interpretation and limits

The page's text explicitly invokes primes, Euler's totient function, and encryption; the square also contains the word **MOBIUS**. The 180° symmetry, cyclic channel rotation, and missing separator are consistent with a deliberately introduced twist. Calling it a *Möbius twist* is a useful hypothesis, not an established decoding.

There is also a tempting length alignment: LP2 page 55 has 76 runes in the corpus, of which the first is the carry from page 54; its 75-rune body is exactly 25 three-rune blocks. Page 55 also repeats the moth motif. This motivated direct tests of the 25 hidden triplets as a p55 key, but length and motif alignment alone do not establish that relationship.

Fixed, source-motivated tests already run:

- The 75 raw channel bytes reduced modulo 29, and the per-byte totients reduced modulo 29, as additive and multiplicative stream keys against p55's 75-rune body: no readable output.
- The 25 24-bit cell values, and their Euler totients, reduced modulo (29^3), as three-rune block keys using integer and digitwise addition/subtraction and multiplication/division: no readable output.
- The three 5×5 channel matrices and the combined 24-bit matrix as Hill keys modulo 29: no readable output.
- The visible 5×5 square as a Hill matrix against the hidden matrix modulo (29^3), and modulo (arphi(1033)=1032): no readable output.
- A single fractional-linear Möbius map from visible square values to hidden triplet integers has no exact fit modulo 29, 1033, or 3301.

These exclusions reject only the stated direct mappings. They do not show that the trailer is meaningless, nor do they establish that the trailer was intentionally supplied by the puzzle author. Do not promote this to `results/` or treat any candidate output as plaintext.

## Best next decision

Ask whether the hidden triplets are a source-selected encoding of the visible prime-sum square, with the 18-cell rotation and short separator specifying the twist. Seek an operation grounded in the page's actual wording or a historically plausible solve path before trying more arithmetic variants. Avoid generic key searches.

An independent artifact audit already catalogs the 336,713-byte trailer and its byte-reversed JPEG feature, but does not explain the 179-byte matrix:

- [Dukotah artifact audit](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/REPORT-A.md)
- [Dukotah trailing-data inventory](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/TRAILING-DATA.json)

## Reproduction

From the repository root, run:

```sh
node sims/lp1_p05_trailer_matrix_sft.cjs
```

The script checks the JPEG/trailer boundary, exact reversed-copy equality, header decoding, unique 5×5 parse, symmetry exception, 18-cell rotation, short separator, and the direct p55 stream-key checks.

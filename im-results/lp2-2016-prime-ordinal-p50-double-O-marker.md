# 2016 image prime ordinals select a unique double-O marker in the p49–51 base60 grid

**Status: source-constrained structural hypothesis; not a decryption.** The prime-ordinal lookup is reproducible. Its interpretation as an M7 separator/path marker remains provisional.

## Inputs and exact arithmetic

The 2016 signed image dimensions recorded in `im-results/lp2-2016-dimensions-base58-33cycle-table-entry.md` are **563 × 569**. Both are prime:

- 563 is the **103rd prime**.
- 569 is the **104th prime**.

The original base60 table in `resources/liber-primus/base60-grid.json` is a **32 × 8 = 256-cell** row-major grid spanning LP2 pages 49–51 (10 + 13 + 9 rows). Its original two-character tokens are decoded with the MIRACL base60 alphabet recorded in that resource.

Using the prime ordinals as **1-based cell indices** in that 256-cell grid:

| Image dimension | Prime ordinal | Grid cell | Token | Byte | Byte mod 29 |
|---:|---:|---:|---|---:|---:|
| 563 | 103 | row 12, col 6 | `0W` | 32 | 3 |
| 569 | 104 | row 12, col 7 | `3Q` | 206 | 3 |

Rows and columns above are zero-based. In the Gematria Primus corpus, index 3 is **O**, whose prime weight is **7**. The selected bytes differ by **174 = 6 × 29**, exactly 29 times the dimension difference (569-563=6).

Across all 256 cells there are 13 adjacent equal-residue pairs, but **the only adjacent pair with residue 3 (O/O) is cells 103–104**.

## Negative control: the 2012 image

The earlier 2012 image dimensions recorded in the same dimension study are **503 × 509**:

- 503 is the 96th prime.
- 509 is the 97th prime.

The same 1-based lookup selects cells 96–97: tokens `0Z` and `3g`, bytes **35** and **222**, residues **6** and **19**. They do not agree modulo 29, and their byte difference is not divisible by 29. Thus the 2016 result is not reproduced by this earlier prime-dimension control.

## Cross-link to the p32 M7 candidate

The existing p32-derived M7 candidate has a projective pole at **7**; its marked 13-rune window also has prime sum (413 equiv 7 pmod{29}). The two selected p50 cells decode to O, whose Gematria Primus prime weight is 7. The 2016 signed message's wording about “the path lies empty” and “numbers are the direction” makes an empty/pole interpretation worth testing.

A specific, still-unverified composition is:

1. Decode each p49–51 base60 byte (b).
2. Map (b mod 29) to a Gematria Primus rune index.
3. Replace that rune index with its Gematria Primus prime weight, reduced modulo 29.
4. Apply the forward p32 M7 map (f(x)=(14x+25)/(25x+28)pmod{29}), treating its pole (x=7) as infinity/empty.

This is distinct from the existing `p50-m7-nonlinear-stream-composition` experiment, which used raw byte residues as the period-256 key and applied M7 to the target stream.

Under this exact mapping, the 256-cell table yields nine infinity markers at 1-based positions **76, 103, 104, 111, 173, 177, 212, 219, 238**. The dimension-selected pair 103–104 is the **only adjacent infinity pair**, producing an empty segment between them. The resulting segment lengths are:

`75, 26, 0, 6, 61, 3, 34, 6, 18, 18`.

These segments are not plaintext. The empty segment is a structural match to the message wording, not proof of intended operation.

## Decisive next test

- Reproduce the 2016 image dimensions from the original signed image and the p49–51 grid from the original scans.
- Test only the byte → GP index → GP prime weight → forward M7 mapping above; do not sweep alphabets, moduli, offsets, or transform variants.
- Determine whether the nine separators and the dimension-selected empty segment identify an independent first-party structure or a unique reading order in LP2. If a continuation is attempted, the only dimension-selected phase is **immediately after cell 104**; compare the exact result against a matched null.
- Require a reproducible plaintext, source-selected key, or uniquely predicted path. If none appears, retire the composition.

## Scope

This is an intermediate finding, not an established decipherment. It does not change the overall LP2 status. No unknown plaintext, authentic key, complete inverse, or final destination has been recovered.

# 2016 image prime ordinals select a unique double-O marker in the p49–51 base60 grid

**Status: reproducible structural observation; direct p55 key use tested and rejected.** The selector's intended interpretation remains provisional. No plaintext or key recovered.

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

## Fixed follow-up: phase after cell 104 against p55 interior43

The only dimension-selected phase is immediately after cell 104 (start at cell 105). I rotated the 256-element transformed stream to that position, discarded infinity markers as empty, and took the first 43 finite values:

`[13,24,1,19,26,7,22,19,17,7,19,18,10,13,7,18,24,22,18,18,28,21,24,17,24,22,16,8,18,26,10,7,18,6,18,18,6,19,3,4,3,24,22]`

Applied as an additive key to the source-selected p55 interior43, both signs were tested modulo 29:

- (C-K): `GSJTYACCFIANJRYEOEOILMONGDEAIESAEINGNREAYGPPEONWSTHTAE`
- (C+K): `OCPAELNLXCEOEEADYMFGYIMWESHUEAYEAOAPRELLAEPDHGJ`

Neither output is recognizable plaintext or supplies a meaningful word structure. This rejects the proposed **direct additive p55 key use** of this transformed stream at the sole dimension-selected phase. Do not search other phases or signs.

## Decision and next question

Retain the prime-ordinal double-O observation as a structural candidate. Retire its direct p55 additive-key interpretation.

The only worthwhile continuation is to ask whether the nine separators and the dimension-selected empty segment identify an **independent, source-authenticated path or structure** in the 2016 message or LP2. Require a uniquely predicted result; if none exists, retire the broader composition too.

## Scope

This is an intermediate finding, not an established decipherment. It does not change the overall LP2 status. No unknown plaintext, authentic key, complete inverse, or final destination has been recovered.

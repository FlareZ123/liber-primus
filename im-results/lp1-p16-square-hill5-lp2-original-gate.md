# LP1 p16 5×5 magic square: direct Hill-5 and rank-transposition tests on LP2

**Status:** bounded original-cipher negative; no unknown plaintext, authentic LP2 key, or complete mechanism recovered.

## Human solve-path hypothesis

The solved LP1 p16 image prints a 5×5 numerical magic square whose five rows, five columns, and two main diagonals each sum to **3301**. The solved LP1 p05 page explicitly says that primes and the totient function are sacred and that all things should be encrypted. A solver who notices a 5×5 numeric square alongside the 29-symbol Gematria Primus alphabet could reasonably test the square as a Hill-5 matrix over GF(29), with the direct residue mapping or the explicitly named Euler-totient operation applied cell-by-cell.

The exact printed p16 matrix is:

```
434   1311  312  278   966
204    812  934  280  1071
626    620  809  620   626
1071   280  934  812   204
966    278  312 1311   434
```

Two fixed matrix constructions were tested:

- **Direct:** reduce every printed entry modulo 29. The determinant is **10**.
- **Totient:** apply Euler's φ to each printed entry, then reduce modulo 29. The determinant is **23**.

Both matrices are invertible. These are source-derived candidate keys, not author-authenticated cipher instructions. The weakest assumption is that a previous-round magic-square answer is intended as an LP2 block-cipher key; no original instruction explicitly selects Hill multiplication, the matrix orientation, or the block clock.

## Frozen original-cipher test

For each matrix, tested the four natural direct Hill-5 inverse conventions:

1. (P=M^{-1}C), corresponding to (C=MP);
2. (P=MC), corresponding to (C=M^{-1}P);
3. (P=(M^T)^{-1}C);
4. (P=M^TC).

Each was applied with exactly two natural clocks:

- **Book-global:** concatenate physical p0–p55 in printed order, start at rune 0, and process complete five-rune blocks.
- **Physical-page reset:** restart at rune 0 on every physical page and process complete five-rune blocks.

No fitted key, starting phase, padding, word-dependent exception, or language-score parameter was introduced. Incomplete terminal blocks were dropped rather than padded: the global stream loses one rune; page resets lose 116 runes in total.

## Original results

Original unknown ciphertext: **12,956 runes**, IoC **0.034478397865**. Clear p57 reference text: 95 GP29 runes, IoC **0.062709966405**.

| Matrix | Orientation | Clock | Output runes | Dropped | Output IoC |
|---|---|---|---:|---:|---:|
| Direct | (M^{-1}) | Book-global | 12,955 | 1 | 0.034496627827 |
| Direct | (M^{-1}) | Page reset | 12,840 | 116 | 0.034517335348 |
| Direct | (M) | Book-global | 12,955 | 1 | 0.034474437261 |
| Direct | (M) | Page reset | 12,840 | 116 | 0.034471536903 |
| Direct | ((M^T)^{-1}) | Book-global | 12,955 | 1 | 0.034465451393 |
| Direct | ((M^T)^{-1}) | Page reset | 12,840 | 116 | 0.034492634518 |
| Direct | (M^T) | Book-global | 12,955 | 1 | 0.034483292035 |
| Direct | (M^T) | Page reset | 12,840 | 116 | 0.034465580072 |
| Totient | (M^{-1}) | Book-global | 12,955 | 1 | 0.034486390611 |
| Totient | (M^{-1}) | Page reset | 12,840 | 116 | 0.034469122628 |
| Totient | (M) | Book-global | 12,955 | 1 | 0.034471386357 |
| Totient | (M) | Page reset | 12,840 | 116 | 0.034501600095 |
| Totient | ((M^T)^{-1}) | Book-global | 12,955 | 1 | 0.034481921512 |
| Totient | ((M^T)^{-1}) | Page reset | 12,840 | 116 | 0.034462231630 |
| Totient | (M^T) | Book-global | 12,955 | 1 | 0.034465808921 |
| Totient | (M^T) | Page reset | 12,840 | 116 | 0.034509862013 |

All sixteen outputs remain at the near-uniform ciphertext baseline; none exhibits a native-language register. Each decoder independently recovers a 95-rune p57 synthetic plant encrypted with its corresponding inverse matrix. These are functionality controls, not evidence that the manuscript used either matrix.

## Rank-order 25-rune block transposition

The 25 printed p16 values are all distinct, so the simplest reading of the square as a **direction/order key** is unambiguous: sort cells by ascending numeric value and use that rank order to permute 25-rune blocks. This is a materially different standard operation from Hill substitution. It is motivated by the square's literal 5×5 structure and the 2016 signed instruction that the book's numbers are a direction. The weakest assumption is that the table controls consecutive 25-rune blocks across LP2, rather than being only an earlier-stage answer.

Two natural ways to fill the 5×5 block (row-major or column-major), each with direct ascending-rank read or inverse placement, were tested under book-global and physical-page-reset clocks. No phase, rotation, tie rule, padding, or language-fit parameter is involved; the square has no repeated values.

The zero-based rank routes are:

- Row-major fill: `[5,19,3,21,8,16,2,22,0,24,11,13,10,14,12,6,18,7,17,4,20,9,15,1,23]`
- Column-major fill: `[1,23,15,9,16,8,10,14,0,24,7,17,2,22,12,6,18,11,13,20,4,21,3,5,19]`

The 12,956-rune original stream contains 518 complete global blocks and a six-rune tail. Page resets leave 806 incomplete-block runes unchanged in total. A Shakespeare GP29 trigram model trained on the first 240,000 characters gives **−2.21915** nats/rune on training and **−2.36417** on held-out text; solved p57 scores **−2.50031**. The untouched unknown stream scores **−4.60956**.

| Fill | Operation | Clock | Trigram log-likelihood | IoC |
|---|---|---|---:|---:|
| Row-major | Ascending-rank read | Book-global | −4.63070 | 0.03447840 |
| Row-major | Ascending-rank read | Page reset | −4.64547 | 0.03447840 |
| Row-major | Inverse placement | Book-global | −4.62137 | 0.03447840 |
| Row-major | Inverse placement | Page reset | −4.61297 | 0.03447840 |
| Column-major | Ascending-rank read | Book-global | −4.62218 | 0.03447840 |
| Column-major | Ascending-rank read | Page reset | −4.60283 | 0.03447840 |
| Column-major | Inverse placement | Book-global | −4.61935 | 0.03447840 |
| Column-major | Inverse placement | Page reset | −4.61356 | 0.03447840 |

All eight outputs remain ciphertext-like and are no better than the untouched source in any meaningful language sense; the best score improves the original by only 0.00674 nats/rune and remains more than 2.2 nats/rune below native English. The unchanged IoC is expected for a pure transposition. Each of the four exact permutations also passes an independent 95/95-rune p57 synthetic round trip.

**Decision:** retire the fixed 25-cell ascending-rank transposition of the p16 square under these row/column fills, direct/inverse placements, and two natural clocks. This does not exclude another explicitly instructed nonlinear or keyed use of the square; do not expand into arbitrary phases, rotations, or alternate sort orders without a new first-party selector.

Reproduce with `node sims/lp1_p16_square_rank_transposition_gate.cjs`. Inputs: canonical LP2 corpus and the pinned Shakespeare control.

## Decision and limits

Retire the **direct stationary p16-square Hill-5 transfer**, the **entrywise-φ-derived stationary Hill-5 transfer**, and the **fixed 25-cell rank-order block transposition** under the orientations, clocks, and operations enumerated above. The result does not exclude a changing matrix, a nonlinear use of the square, another encoding, or an independently supplied key. The p16 square may simply be a solved earlier-stage answer rather than LP2 key material. Do not expand this result into arbitrary matrix permutations, offsets, or block-phase searches without a new first-party selector.

Reproduce from the repository root with:

```sh
node sims/lp1_p16_square_hill5_lp2_gate.cjs
node sims/lp1_p16_square_rank_transposition_gate.cjs
```

Inputs: original p16 image `resources/liber-primus/16.jpg`; normalized LP1 reference `resources/liber-primus/lp1-plaintext-reference.txt`; canonical original LP2 corpus `resources/liber-primus/lp2-corpus.json`; and pinned Shakespeare control `resources/control/shakespeare_first300k.txt`. The Hill reproducer asserts the original magic-square sums, both determinants, exact original input size, all sixteen output statistics, and 95/95 synthetic recovery for every convention. The rank reproducer asserts both exact rank routes, all eight original trigram scores, source IoC preservation, and 95/95 p57 round trips.

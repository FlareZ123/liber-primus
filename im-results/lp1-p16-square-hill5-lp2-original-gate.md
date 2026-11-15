# LP1 p16 5×5 magic square as a direct GP29 Hill-5 key on LP2

**Status:** bounded original-cipher negative; no unknown plaintext, authentic LP2 key, or complete mechanism recovered.

## Human solve-path hypothesis

The solved LP1 p16 image prints a 5×5 numerical magic square whose five rows, five columns, and two main diagonals each sum to **3301**. The solved LP1 p05 page explicitly says that primes and the totient function are sacred and that all things should be encrypted. A solver who notices a 5×5 numeric square alongside the 29-symbol Gematria Primus alphabet could reasonably try the square as a Hill-5 matrix over GF(29).

The exact printed p16 matrix is:

```
434   1311  312  278   966
204    812  934  280  1071
626    620  809  620   626
1071   280  934  812   204
966    278  312 1311   434
```

Reducing entries modulo 29 gives determinant **10**, so the matrix is invertible. This is a source-derived candidate key, not an author-authenticated cipher instruction. The weakest assumption is that a previous-round magic-square answer is intended as an LP2 block-cipher key; no original instruction explicitly selects Hill multiplication, matrix orientation, or block clock.

## Frozen original-cipher test

Using the canonical original GP29 corpus, tested the four natural direct Hill-5 inverse conventions:

1. (P=M^{-1}C), corresponding to (C=MP);
2. (P=MC), corresponding to (C=M^{-1}P);
3. (P=(M^T)^{-1}C);
4. (P=M^TC).

Each was applied with exactly two natural clocks:

- **Book-global:** concatenate physical p0–p55 in printed order, start at rune 0, and process complete five-rune blocks.
- **Physical-page reset:** restart at rune 0 on every physical page and process complete five-rune blocks.

No fitted key, starting phase, padding, word-dependent exception, or language-score parameter was introduced. Incomplete terminal blocks were dropped rather than padded: the global stream loses one rune; page resets lose 116 runes in total.

## Original results

Original unknown ciphertext: **12,956 runes**, IoC **0.034478397865**. Clear p57 reference text: 95 GP29 runes, IoC approximately **0.06271**.

| Decoder | Clock | Output runes | Dropped | Output IoC |
|---|---|---:|---:|---:|
| (M^{-1}) | Book-global | 12,955 | 1 | 0.034496627827 |
| (M^{-1}) | Page reset | 12,840 | 116 | 0.034517335348 |
| (M) | Book-global | 12,955 | 1 | 0.034474437261 |
| (M) | Page reset | 12,840 | 116 | 0.034471536903 |
| ((M^T)^{-1}) | Book-global | 12,955 | 1 | 0.034465451393 |
| ((M^T)^{-1}) | Page reset | 12,840 | 116 | 0.034492634518 |
| (M^T) | Book-global | 12,955 | 1 | 0.034483292035 |
| (M^T) | Page reset | 12,840 | 116 | 0.034465580072 |

All eight outputs remain at the near-uniform ciphertext baseline; none exhibits a native-language register. The implementation independently verifies that each decoder exactly recovers a 95-rune p57 synthetic plant encrypted with its corresponding inverse matrix. This is a functionality control, not evidence that the manuscript used the matrix.

## Decision and limits

Retire the **direct stationary p16-square Hill-5 transfer** under these four matrix conventions and two natural clocks. The result does not exclude a changing matrix, a nonlinear use of the square, another encoding, or an independently supplied key. The p16 square may simply be a solved earlier-stage answer rather than LP2 key material. Do not expand this result into arbitrary matrix permutations, offsets, or block-phase searches without a new first-party selector.

Reproduce from the repository root with:

```sh
node sims/lp1_p16_square_hill5_lp2_gate.cjs
```

Inputs: original p16 image `resources/liber-primus/16.jpg`; normalized LP1 reference `resources/liber-primus/lp1-plaintext-reference.txt`; canonical original LP2 corpus `resources/liber-primus/lp2-corpus.json`. Reproduction asserts the original magic-square sums, determinant, exact original input size, all eight output statistics, and 95/95 synthetic recovery for every convention.

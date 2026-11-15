# LP1 Stage 10 5×5 matrices: order-56/order-28 Hill-schedule gates

## Finding

The two source 5×5 Stage 10 squares have striking but distinct orders over GF(29):

- the 3301 square has determinant 10 and exact matrix order **56**;
- the 1033 square has determinant 3 and exact matrix order **28**.

The 56-order matches the number of LP2 pages p0–p55; the 28-order is half that count and equals the multiplicative-group order of GF(29). These are genuine algebraic properties, not decryptions. The two matrices do not commute, and the 1033 matrix is not a power of the 3301 matrix. The 7×7 1033 square does not have order dividing 56.

Two natural Hill consumers were tested for both 5×5 matrices: (1) a page-indexed schedule anchored at the empty-rune numeric p50 page, and (2) a global block-indexed schedule with the matrix power advancing once per 5-rune block. Both M and M-transpose orientations and both exponent signs were tested.

**Result: negative for all 16 configurations.** Every transformed 12,956-rune stream remains ciphertext-like. Pooled IoCs are 0.03445–0.03454, versus 0.06271 for clear p57. No plaintext is recovered.

## Source objects and orders

The matrices are the first and third 5×5 squares in `resources/cicada2014-openpuff-magic-squares.txt`. Their original row and column sums are respectively 3301 and 1033.

The 3301 matrix modulo 29 is:

```
28  6 22 17  9
 1  0  6 19 27
17 11 26 11 17
27 19  6  0  1
 9 17 22  6 28
```

The 1033 matrix modulo 29 is:

```
11 22 22 15  6
18 25 14  1 18
23 13  4 13 23
18  1 14 25 18
 6 15 22 22 11
```

The exact orders were found by repeated multiplication to the first identity. The matrices do not commute (`AB ≠ BA`), and no exponent (k in [0,55]) satisfies (A^k=B). The 7×7 1033 matrix is an additional source control: its 56th power is not the identity.

## Page-indexed test

For each matrix (M), each orientation (M) or (M^T), and each exponent sign (s), page (p) uses (M^{s(p-50)}). The p50 page is empty of runes and carries the numerical table, so it supplies the zero-exponent anchor. Each page is processed independently in 5-rune blocks; a final partial block is padded with rune index 0 (F), transformed, then truncated to the original page length.

| Source matrix | Order | Orientation | Sign | Pooled IoC |
|---|---:|---|---:|---:|
| 3301 | 56 | M | −1 | 0.03448094 |
| 3301 | 56 | M | +1 | 0.03445153 |
| 3301 | 56 | Mᵀ | −1 | 0.03447251 |
| 3301 | 56 | Mᵀ | +1 | 0.03446692 |
| 1033 | 28 | M | −1 | 0.03447638 |
| 1033 | 28 | M | +1 | 0.03453552 |
| 1033 | 28 | Mᵀ | −1 | 0.03447930 |
| 1033 | 28 | Mᵀ | +1 | 0.03452663 |

## Global block-indexed test

The concatenated 12,956-rune stream is split into consecutive 5-rune blocks. Block (j), starting at zero, uses (M^{sj}). The schedule therefore repeats every 56 blocks for the 3301 matrix and every 28 blocks for the 1033 matrix. The final one-rune block is padded with four F=0 values and truncated after transformation.

| Source matrix | Order / period | Orientation | Sign | Pooled IoC |
|---|---:|---|---:|---:|
| 3301 | 56 | M | −1 | 0.03449339 |
| 3301 | 56 | M | +1 | 0.03449174 |
| 3301 | 56 | Mᵀ | −1 | 0.03453625 |
| 3301 | 56 | Mᵀ | +1 | 0.03447399 |
| 1033 | 28 | M | −1 | 0.03447912 |
| 1033 | 28 | M | +1 | 0.03450287 |
| 1033 | 28 | Mᵀ | −1 | 0.03447208 |
| 1033 | 28 | Mᵀ | +1 | 0.03447393 |

The clear p57 comparison has IoC **0.06270997**. All 16 outputs retain exactly 12,956 runes. Per-page IoCs for the page-indexed cases and output prefixes for both schedules are emitted by the reproducer.

## Interpretation and limits

The order-56 and order-28 properties may be useful clues about how the author expected solvers to interpret the Stage 10 matrices. However, both simple consumers tested here fail. Do not promote either order match to a cipher claim or infer a page schedule from order alone.

The page-indexed test is bounded to the p50 identity anchor and page-local blocks. The block-indexed test is bounded to a zero-based global block clock. Both use F=0 padding for incomplete blocks; neither padding convention is specified by the source. These tests do not search arbitrary anchors, phases, altered matrices, or other transformations. Earlier direct Hill applications of the two 5×5 matrices to the first 729 LP2 runes are separately rejected in [the first-chapter source-inverse report](lp2-firstchapter-2014-fivesquare-hill-source-inverse.md).

## Reproduction

Run from the repository root:

```sh
node sims/lp1_p16_order56_pagepower_sft.cjs
```

The script parses the original square listing and LP2 corpus directly, asserts source sums, determinants, exact matrix orders, the page count, rune count, and empty p50 anchor, and emits complete page-level and block-level results.

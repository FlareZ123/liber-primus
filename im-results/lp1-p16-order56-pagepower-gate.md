# Stage 10 matrix orders and LP2 key-schedule gates

## Finding

The three original Stage 10 matrices have exact, source-derived orders over GF(29):

| Source square | Dimension | Determinant mod 29 | Exact matrix order |
|---|---:|---:|---:|
| 3301 | 5×5 | 10 | **56** |
| 1033 | 5×5 | 3 | **28** |
| 1033 | 7×7 | 2 | **280** |

The 3301 order equals the 56 LP2 pages; the 7×7 1033 order is (280=5×56); the 5×5 1033 order is 28, half the page count and the multiplicative-group order of GF(29). All three orders divide 280. The two 5×5 matrices do not commute, and the 1033 5×5 matrix is not a power of the 3301 matrix.

These are genuine algebraic properties and a potentially meaningful source clue. They are not plaintext or a decipherment. We tested the most natural direct consumers below: **all 52 configurations remain ciphertext-like**. No plaintext is recovered.

## Source objects

The three matrices are the three original squares in `resources/cicada2014-openpuff-magic-squares.txt`: first the 5×5 3301 square, then the 7×7 1033 square, then the 5×5 1033 square. All row and column sums match their stated magic constants.

The 7×7 1033 matrix modulo 29 is:

```
 7 27  4 16 27 17  7
 3 20 14 18  3 11  7
21  0  5 27 14 23 15
16  7  9 12  9  7 16
15 23 14 27  5  0 21
 7 11  3 18 14 20  3
 7 17 27 16  4 27  7
```

The 5×5 matrices and their orders are documented below; the order of each matrix is obtained by repeated multiplication to the first identity. The 7×7 matrix's exact order is 280, not merely “not a divisor of 56.”

## Exact 2014 half-period matrix reflections, unique to the 29-rune modulus

**New original-source algebraic discovery (Agent32, 22 November 2026; independent Windows Node22 PASS [45067129359](https://github.com/FlareZ123/liber-primus/actions/runs/45067129359)).** The three raw matrices' orders were previously recorded above. Their actual powers show a much more selective relationship than having order divisible by 7 or28.

Write **A** for the complete *first* 5×5 historical square with magic sum **3301**, and **B** for the complete *last* 5×5 historical square with magic sum **1033**, in their **original printed row/column order**. Both are the actual 2014 OpenPuff-extracted integer matrices; B also appears in the solved LP1 “SOME WISDOM” source. Let **J** denote the 5×5 anti-identity reversing a length-five vector, and **U** the 5×5 all-ones matrix. The following complete-source identities hold **exactly over GP29's field**:

\[
A^{28}\equiv12U-J\pmod{29},\qquad
B^{14}\equiv-J\pmod{29}.
\]

Both operators are involutions: \((12U-J)^2\equiv I\pmod{29}\) since \(5\cdot12=60\equiv2\), and \((-J)^2=I\). The powers are genuinely half-order because **A has exact matrix order56 and B has exact order28**, as established above. The two half-powers commute even though the **original A and B matrices do not**. Their product is

\[
A^{28}B^{14}=I-12U\pmod{29}.
\]

For a completely arbitrary five-rune GP-index vector \(v=(v_0,\ldots,v_4)\), the two independently printed matrices therefore specify **two explicit, reversible, keyless operations**:

- B, half order: reverse the five rune positions and replace each GP index \(v_i\) by \(-v_i\bmod29\).
- A, half order: reverse the positions and replace the resulting indices by \(12\sum_i v_i-v_{4-i}\bmod29\).
- Their composition negates only the **vector mean component** and preserves the four-dimensional zero-sum subspace; \(I-12U\) is a rank-one reflection.

The **modulus is not tuned**. Starting with both enormous integer matrix powers computed from the **unchanged source cell integers**, calculate the gcd of all 25 entries of \(B^{14}+J\); it is **exactly 29**. Independently the gcd of all 25 entries of \(A^{28}-(12U-J)\) is **exactly 29**. Thus for each literal identity individually, **29 is the only modulus \(m>1\)** for which that exact integer-matrix identity holds, and both identities hold jointly at the unique size of the original Gematria Primus alphabet. This is an arithmetic proof; no cryptanalytic fitting or candidate plaintext selection was involved.

These equations provide a potentially actionable **source-derived reversal and mean-flip vocabulary**, rather than the original direct Hill inverse whose negative result is catalogued below. It is historical fact that Cicada supplied the matrices before LP2, and GP29/prime/totient are authentic earlier-source clues. **Author intent is unproven:** neither 2014 text nor an LP2 rune page instructs multiplication by \(A^{28}\), \(B^{14}\), their product, or a specific five-symbol receiver. It is also known that the original 1033 and3301 square sums occur as the p33 cuneiform numerical interpretations, but that source coincidence alone does not select such a matrix power. Reversing a ciphertext vector remains ciphertext when no further value-changing source operation is given.

The [new source-read-only Windows Node22 SFT](../sims/lp2_2014_two_magic_squares_gp29_reflection_sft.cjs) computes **both full original integer powers using BigInt**, proves both unique positive modulus claims by gcd, confirms the exact minimal matrix orders and reversibility, verifies actual 6,395-rune B register preservation under a full source 5-vector Hill round-trip, and plants a full 6,395-rune native GP text that recovers exactly. The genuine source's direct one-round A/B inverse outputs have GP29 index-of-coincidence **0.0345136897 / 0.0344639460**, compared with a true native-GP plant **0.0598281765**, so **the direct one-round variants have no plaintext**. This is a new **algebraic source relation and reversible operator**, not a newly solved page.

## 5×5 matrix consumers

For both 5×5 matrices, three natural consumers were tested:

1. **Page-indexed Hill powers:** page (p) uses (M^{s(p-50)}), with the empty-rune numeric p50 page as the zero-exponent anchor.
2. **Global block-indexed Hill powers:** consecutive 5-rune block (j), starting at zero, uses (M^{sj}).
3. **Matrix-orbit additive keystream:** iterate (v_{k+1}=Mv_k) from the source matrix's first row or first column, flatten the orbit states, and add/subtract the resulting periodic key modulo 29.

Both (M) and (M^T) orientations and both signs were tested. Hill blocks are page-local for the page schedule and global for the block schedule; incomplete blocks are padded with rune index 0 (F), then truncated. The orbit keystream uses only first-row/first-column seeds.

### Page-indexed Hill

| Source matrix | Order | Orientation | Sign | Pooled IoC |
|---|---:|---|---:|---:|
| 3301 5×5 | 56 | M | −1 | 0.03448094 |
| 3301 5×5 | 56 | M | +1 | 0.03445153 |
| 3301 5×5 | 56 | Mᵀ | −1 | 0.03447251 |
| 3301 5×5 | 56 | Mᵀ | +1 | 0.03446692 |
| 1033 5×5 | 28 | M | −1 | 0.03447638 |
| 1033 5×5 | 28 | M | +1 | 0.03453552 |
| 1033 5×5 | 28 | Mᵀ | −1 | 0.03447930 |
| 1033 5×5 | 28 | Mᵀ | +1 | 0.03452663 |

### Global block-indexed Hill

| Source matrix | Order / period | Orientation | Sign | Pooled IoC |
|---|---:|---|---:|---:|
| 3301 5×5 | 56 | M | −1 | 0.03449339 |
| 3301 5×5 | 56 | M | +1 | 0.03449174 |
| 3301 5×5 | 56 | Mᵀ | −1 | 0.03453625 |
| 3301 5×5 | 56 | Mᵀ | +1 | 0.03447399 |
| 1033 5×5 | 28 | M | −1 | 0.03447912 |
| 1033 5×5 | 28 | M | +1 | 0.03450287 |
| 1033 5×5 | 28 | Mᵀ | −1 | 0.03447208 |
| 1033 5×5 | 28 | Mᵀ | +1 | 0.03447393 |

### Matrix-orbit additive keystream

| Source matrix | Orientation | Seed | Sign | Key period | Pooled IoC |
|---|---|---|---:|---:|---:|
| 3301 5×5 | M | first row | −1 | 280 | 0.03448826 |
| 3301 5×5 | M | first row | +1 | 280 | 0.03445622 |
| 3301 5×5 | M | first column | −1 | 280 | 0.03445558 |
| 3301 5×5 | M | first column | +1 | 280 | 0.03449040 |
| 3301 5×5 | Mᵀ | first row | −1 | 280 | 0.03447367 |
| 3301 5×5 | Mᵀ | first row | +1 | 280 | 0.03445808 |
| 3301 5×5 | Mᵀ | first column | −1 | 280 | 0.03448913 |
| 3301 5×5 | Mᵀ | first column | +1 | 280 | 0.03449988 |
| 1033 5×5 | M | first row | −1 | 140 | 0.03450215 |
| 1033 5×5 | M | first row | +1 | 140 | 0.03447948 |
| 1033 5×5 | M | first column | −1 | 140 | 0.03447350 |
| 1033 5×5 | M | first column | +1 | 140 | 0.03445322 |
| 1033 5×5 | Mᵀ | first row | −1 | 140 | 0.03446123 |
| 1033 5×5 | Mᵀ | first row | +1 | 140 | 0.03445241 |
| 1033 5×5 | Mᵀ | first column | −1 | 140 | 0.03450555 |
| 1033 5×5 | Mᵀ | first column | +1 | 140 | 0.03449720 |

## 7×7 1033 matrix consumers

The 7×7 1033 matrix has order 280. Four natural consumers were tested over the complete 12,956-rune LP2 stream:

1. **Fixed Hill-7:** (M), (M^{-1}), (M^T), and ((M^T)^{-1}) on consecutive 7-rune blocks.
2. **Page-indexed Hill-7:** page (p) uses (M^{±(p-50)}), with p50 as the zero-exponent anchor.
3. **Global block-indexed Hill-7:** 7-rune block (j) uses (M^{±j}), giving a 280-block period.
4. **Matrix-orbit additive keystream:** iterate from the first row or first column under (M) or (M^T); each orbit has 280 states, producing a 1,960-symbol periodic key.

All incomplete Hill blocks use F=0 padding and are truncated after transformation.

### Fixed Hill-7

| Orientation | Operator | Pooled IoC |
|---|---|---:|
| M | (M^{-1}) | 0.03450377 |
| M | M | 0.03452365 |
| Mᵀ | ((M^T)^{-1}) | 0.03446590 |
| Mᵀ | Mᵀ | 0.03447115 |

### Page-indexed Hill-7

| Orientation | Sign | Pooled IoC |
|---|---:|---:|
| M | −1 | 0.03447142 |
| M | +1 | 0.03451370 |
| Mᵀ | −1 | 0.03446561 |
| Mᵀ | +1 | 0.03448662 |

### Global block-indexed Hill-7

| Orientation | Sign | Pooled IoC |
|---|---:|---:|
| M | −1 | 0.03450565 |
| M | +1 | 0.03449146 |
| Mᵀ | −1 | 0.03447404 |
| Mᵀ | +1 | 0.03449047 |

### Matrix-orbit additive keystream from 7×7 seeds

| Orientation | Seed | Sign | Key period | Pooled IoC |
|---|---|---:|---:|---:|
| M | first row | −1 | 1,960 | 0.03447136 |
| M | first row | +1 | 1,960 | 0.03449973 |
| M | first column | −1 | 1,960 | 0.03450391 |
| M | first column | +1 | 1,960 | 0.03446195 |
| Mᵀ | first row | −1 | 1,960 | 0.03448743 |
| Mᵀ | first row | +1 | 1,960 | 0.03447965 |
| Mᵀ | first column | −1 | 1,960 | 0.03447959 |
| Mᵀ | first column | +1 | 1,960 | 0.03449830 |

The clear p57 comparison has IoC **0.06270997**. All tested streams retain 12,956 runes. The 7×7 p33 [0,91) direct Hill-7 transfer is separately rejected with a seeded random-matrix control in [the p33 Hill-7 gate](lp2-p33-stage10-7x7-hill-gate.md).

## Interpretation and limits

The orders 28, 56, and 280 are a real structural relationship among the Stage 10 squares and LP2's 56-page length. The 7×7 order 280 is especially notable because (280=5×56). However, the tested direct Hill, page-power, block-power, and matrix-orbit consumers do not decode LP2. Do not infer authorial intent from the order relationship alone.

These are bounded tests, not a search over arbitrary anchors, phases, seeds, altered matrices, or cipher compositions. The page-indexed schedules use p50 as a natural identity anchor; the block schedules start at (M^0); the orbit schedules use only first-row/first-column seeds. F=0 padding for incomplete Hill blocks is not specified by the source. Earlier direct Hill applications of the 5×5 matrices to the first 729 LP2 runes are documented in [the first-chapter source-inverse report](lp2-firstchapter-2014-fivesquare-hill-source-inverse.md).

## Reproduction

Run from the repository root:

```sh
node sims/lp1_p16_order56_pagepower_sft.cjs
```

The script parses the original square listing and LP2 corpus directly, asserts the magic sums, determinants, exact orders 56/28/280, page count, rune count, and empty p50 anchor, and emits complete page-level, block-level, and matrix-orbit results.

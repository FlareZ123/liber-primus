# Page-15 4×4 square as a direct Gematria Primus Hill key

**Classification: source-motivated bounded negative. No unknown LP2 plaintext, authentic key, or cipher mechanism recovered.**

## Motivation

Physical LP2 page 15 contains a visually explicit 4×4 numerical square. Its sixteen entries are exactly the previously documented Fibonacci-indexed-prime construction around 3301; the red 3299 marks the spiral origin. A technically literate solver could reasonably ask whether the visible 4×4 array is also a Hill-cipher key. The complete unsolved stream contains **12,956 runes = 3,239 × 4**, so it can be divided into four-rune blocks without padding or deleting symbols.

The square's mathematical construction is established prior work, but its cryptographic role is not. This experiment tests only the simplest matrix interpretation rather than assuming the square is a key.

## Frozen source-derived matrices

The printed square is:

```text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

Four fixed matrices were derived in the same cell order:

1. Printed distances `abs(3301 − prime)`, reduced modulo 29.
2. The underlying prime values, reduced modulo 29.
3. Their one-based prime ordinals, reduced modulo 29.
4. The corresponding Fibonacci indices, reduced modulo 29.

Their determinants in `F_29` are respectively **17, 10, 21, and 24**; all four are invertible. The printed-distance matrix is:

```text
10  3 20 22
 1 22 21 25
11 17 19  7
21 17 12 22
```

Its inverse modulo 29 is:

```text
19  1  6  3
11  7  8 22
 2 10 15 28
25  4  1 15
```

## Test

Treat each consecutive four-rune ciphertext block as a column vector (C), and decode by (P=M C pmod{29}). For each of the four matrix families, test:

- all eight rotations/reflections of the square (the dihedral orientations);
- the matrix, its inverse, its transpose, and the transpose of its inverse, covering both row/column-vector conventions and both key directions.

This gives **128 fixed configurations**. No matrix entry, key, phase, or parameter was fitted to the unknown plaintext. The stream is processed continuously in its canonical source order; all 12,956 runes are retained.

The canonical source corpus contains 55 rune-bearing unsolved physical pages and exactly 12,956 runes. The standalone runner also constructs a same-length approximate Gematria Primus transliteration of the repository's Shakespeare control, encrypts it with the printed-distance matrix, and requires exact recovery with the inverse.

## Results

| Measure | Original ciphertext | Best of 128 Hill outputs | Shakespeare GP control |
|---|---:|---:|---:|
| Index of coincidence | 0.03447840 | **0.03454775** | 0.06106332 |
| 12 most frequent runes | 5,568 | **5,680** | 10,054 |

The uniform 29-symbol IoC expectation is **1/29 = 0.03448276**. Across all 128 candidates:

- IoC range: **0.03444396–0.03454775**.
- Top-12 frequency range: **5,514–5,686**.
- Best candidate: prime-ordinal matrix, one dihedral orientation, inverse-transpose convention. Its output remains essentially uniform.

The planted Shakespeare control is exactly recovered across **12,956/12,956 runes**. Its IoC and top-12 count are unchanged by the inverse, confirming that the implementation can preserve a language-like register under this block architecture.

## Interpretation and limits

The direct page-15 4×4 Hill-key hypothesis fails its intended purpose: none of the source-fixed matrix representations or orientation/vector conventions produces a language-like LP2 register. The best candidate barely changes the original ciphertext's near-uniform symbol distribution and is far from the matched-length English control.

This does **not** show that the page-15 square is irrelevant. It may specify a longer key schedule, state transition, nonlinear operation, or an input to another cipher. Nor does this test exclude arbitrary fitted Hill matrices; such a search would discard the source clue that motivated this experiment.

The negative scope is specifically: a continuous, four-symbol, direct linear Hill transform over `F_29`, using one of the four source-derived matrices and the eight natural square orientations, without an additional layer or source-derived changing state.

## Reproduction

Run from the repository root with Node.js 22:

```sh
node sims/fibonacci_square_hill4_gate.cjs
```

The script reads the original canonical corpus and `resources/control/shakespeare_first300k.txt`, checks the 4×4 source reconstruction and invertibility, enumerates all 128 configurations, and asserts the full-length planted inverse. It has no external dependencies.

Supporting code: [`sims/fibonacci_square_hill4_gate.cjs`](../sims/fibonacci_square_hill4_gate.cjs)

Source context: [the established page-15 Fibonacci-prime construction](../results/fibonacci-prime-spiral.md).

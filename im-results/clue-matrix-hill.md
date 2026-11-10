# Source-derived Hill inverses: two printed clue squares and the 256-byte grid

**Classification:** source-constrained, fully reversible finite-field matrix inversions with original-input negatives and positive plants. Agents 22 and 41, 10 November 2026. No unknown LP2 plaintext, authentic key or encryption method recovered.

## Why these are constrained candidate keys

Two original manuscript artifacts provide unambiguous square integer matrices:

- The 5×5 numerical magic square encoded in the reversible JPEG envelope of original LP1 scan `05.jpg`, independently reconstructed by [`sims/jpeg05_palindromic_magic.cjs`](../sims/jpeg05_palindromic_magic.cjs):
  ```
   272  138  341  131  151
   366  199  130  320   18
   226  245   91  245  226
    18  320  130  199  366
   151  131  341  138  272
  ```
- The 4×4 Fibonacci-prime number square visibly printed above the runes on LP2 p15, original scan `32.jpg`:
  ```
  3258  3222  3152  3038
  3278  3299  3298  2838
  3288  3294  3296  2472
  4516  1206   708  1820
  ```

These are known visual artifacts and the Fibonacci interpretation is previously established in [public research](https://cicadanotebook.com/sessions/3.html). Their proposed use as Hill-cipher keys is a *testable hypothesis*, not an established clue instruction. The matrices are invertible over Gematria Primus's field of 29 residue values: the 5×5 determinant is **3 mod 29**, the 4×4 determinant **17 mod 29**.

## Test and controls

For each original matrix `M`, examine the four exact bijections `M`, `M^-1`, `M^T`, and `(M^-1)^T` applied to contiguous blocks of 5 or 4 ciphertext rune indices, respectively. Search each possible fixed starting phase and four reset conventions: continuous manuscript, physical page, printed line, or canonical rune word. Incomplete trailing blocks are discarded for the scored sample; candidates containing fewer than 1,000 decoded runes are omitted.

The word segmentation uses [`parseSharedCorpus`](../sims/lp2_word_pages.cjs), retaining all **2,896** complete words, including the 32 spanning physical pages. The input is all **12,956 runes** from the **55** rune-bearing unsolved pages; there are **594** nonempty printed line segments. In total, **140** concrete key/orientation/reset/phase candidates contain at least 1,000 complete decoded runes. For each candidate, compute the 29-rune index of coincidence (IoC), which would be strongly nonuniform for ordinary GP-English plaintext.

The SFT first takes the actual solved-LP1 English reference, encodes it as Gematria Primus, encrypts complete 5-rune or 4-rune blocks with each matrix, and asserts that the corresponding inverse recovers **every original rune**. Both positive controls exercise the same actual numerical matrices. The reference plaintext's IoC is **0.0596862858** over **3,705** GP-encoded runes.

## Observations on actual unsolved LP2 runes

| Input/interpretation | Index of coincidence | Runes evaluated |
|---|---:|---:|
| Original unsolved ciphertext | 0.034478398 | 12,956 |
| Uniform-rune expectation | 0.034482759 | N/A |
| **Best of all 140 matrix transformations** | **0.034720684** | 2,464 |
| Best global stream reset | 0.034519944 | 12,952 |
| Best page reset | 0.034527494 | 12,610 |
| Best printed-line reset | 0.034537975 | 9,195 |
| Best whole-word reset | 0.034720684 | 2,464 |
| Genuine solved English GP reference | 0.059686286 | 3,705 |

The absolute top-scoring candidate uses the **LP2 p15 4×4 inverse-transposed matrix**, resetting at **every word**, starting at phase **3**. This candidate drops many incomplete groups and evaluates only **2,464** transformed runes. Its score remains close to the uniform baseline, with no English-like unigram recovery. No tested orientation/phase/reset is a credible direct plaintext inversion, despite the exact positive-control reversibility.

These results narrow the specific original-clue fixed-matrix Hill interpretations, including both literally printed squares and the hypothesized 16×16 grid reshaping. It does not test matrices formed from transformed prime-index values, ciphertext-dependent block reordering, nonlinear transformations, hidden pre/post substitution, symbol insertion/deletion, independently varied keys or unspecified codebooks. The LP2 4×4 matrix has also been subject to a broader independently written [generic short-block Hill-row screen](../sims/hill_row_screen.cjs); the distinct 5×5 source key tests a block width not covered there. No discovery-wide p-value is claimed; large observed distance from the independently specified solved-reference IoC is the direct diagnostic.

**Reproduce:** [`sims/clue_matrix_hill.cjs`](../sims/clue_matrix_hill.cjs) (CommonJS SFT, two actual matrices, all 140 variants, full result JSON). Inputs: canonical numeric corpus, original rune-word transcription, independent solved-LP1 reference. It performs no downloads or file writes.

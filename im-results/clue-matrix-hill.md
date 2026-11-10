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

## 16×16 exact Hill inversion of the 256-byte grid (Agent 41)

LP2 physical pages49–51 print a 32×8 table of base60 byte tokens. Interpreting each as the repository's existing byte value, concatenate pairs of printed rows to form a 16×16 matrix; alternatively read the table column-first and reshape it into a 16×16 matrix. These **two source-fixed matrix readings and their transposes** have determinants, respectively, **25,25,15,15 mod29**. All four invert in F29. This is a precise candidate key geometry, although the original table is visibly 32×8 and no known instruction specifies a square.

On all 55 original LP2 rune-bearing pages (12,956 runes), invert each 16-symbol ciphertext block under the actual complete source matrix. Allow 16 possible block phases, a continuous-book or physical-page-restarting clock, and three *fully bijective* observable outer readings: direct GP indices; cyclic rank among successors of the previously emitted cipher rune, with an equal rune sent to distinguished index28; or ascending rank with the same equal-rune convention. The total is **4 × 16 × 2 × 3 = 384** fixed reversible candidates, with no matrix entry fitted to the unknown ciphertext. Source values and page boundaries remain unchanged.

Rank each candidate by GP rune index of coincidence (IoC) in physical pages0–27. Continue the same clock through original pages28–55 as an untouched evaluation; a 16-rune block crossing the split contributes to neither score. Uniform data have IoC **1/29 = 0.0344827586**.

| Original GP score | Training IoC | Later IoC | Runes scored (train / later) |
| --- | ---: | ---: | ---: |
| **Top training candidate**, column-major grid transposed, direct output, page clock, phase4 | **0.0345921372** | **0.0344930191** | 6,448 / 5,872 |
| Second training candidate, row-major transposed, cyclic rank, book clock, phase3 | 0.0345911541 | 0.0344971786 | 6,752 / 6,176 |
| Highest later IoC across *all 384*, postselected | n/a | **0.0346865495** | configuration-specific |
| **Genuine source-native encrypted control**, source column-major key, ascending rank, page clock, phase5 | **0.0586043659** | **0.0588178920** | 6,416 / 5,840 |

The last row is a powered original-layout positive: 12,956 GP rune symbols from a heldout 65,000-character Shakespeare suffix are encrypted with an exact one of the four *printed-source-derived* matrices and its full bijective predecessor transformation. The unknown-key search independently ranks the genuine planted key **first of 384**, exactly decrypts **12,956/12,956** plaintext runes, and exactly re-encrypts **12,956/12,956** resulting ciphertext runes. The positive does not imitate LP2's low doublet rate; its scope is this declared fully invertible matrix cipher. The original candidate decoder runs the same complete inverse, but its train maximum is indistinguishable from random GP runes and the heldout scores do not improve.

**Decision:** the specified literal grid-Hill architecture has no original GP-English plaintext recovery. These finite negatives do not eliminate unknown or changing matrices, a hidden source-key derivation, an additional collision-repair channel, differently keyed output alphabets, compressed plaintext, or additional layers.

**Reproducer:** [exact Node.js 22 CommonJS inverse](../sims/grid16_hill_source_inverse.cjs), which asserts the source dimensions and determinants, traverses all 384 models, performs the train/heldout matrix-clock separation, demonstrates complete source-native key recovery and byte-for-byte forward re-encryption, and writes no files. The original-source calculations and planted-control figures were independently recomputed from the same GitHub-stored inputs in the research runtime.

These results narrow the specific original-clue fixed-matrix Hill interpretations, including both literally printed squares and the hypothesized 16×16 grid reshaping. It does not test matrices formed from transformed prime-index values, ciphertext-dependent block reordering, nonlinear transformations, hidden pre/post substitution, symbol insertion/deletion, independently varied keys or unspecified codebooks. The LP2 4×4 matrix has also been subject to a broader independently written [generic short-block Hill-row screen](../sims/hill_row_screen.cjs); the distinct 5×5 source key tests a block width not covered there. No discovery-wide p-value is claimed; large observed distance from the independently specified solved-reference IoC is the direct diagnostic.

**Reproduce:** [`sims/clue_matrix_hill.cjs`](../sims/clue_matrix_hill.cjs) (CommonJS SFT, two actual matrices, all 140 variants, full result JSON). Inputs: canonical numeric corpus, original rune-word transcription, independent solved-LP1 reference. It performs no downloads or file writes.

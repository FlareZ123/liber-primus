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

## Eight fixed 16×16 Hill matrix inverses from the 256-token grid (Agent 41)

Original LP2 pages49–51 print 32×8 two-character numeral tokens. The historic radix60 decoding gives **256 bytes**, but the same original tokens also have the previously published radix59 interpretation that skips lowercase `f`, as documented in the [exact coding-overlap result](lp2-grid-numeric-codec-ambiguity.md). Interpret each of these two *source-fixed* byte streams as either pairs of 8-byte printed rows assembled into a 16×16 array, or read the complete table column-first before reshaping to 16×16. Each 16×16 F29 matrix and its transpose is tested, for **eight complete matrices**. They are all invertible, with determinants **[25,25,15,15] (radix60)** and **[27,27,25,25] (radix59)** modulo29. The manuscript prints a 32×8 table and does not authenticate a 16×16 key geometry; this is a narrow directly testable conjecture.

For every source matrix, invert complete 16-rune ciphertext blocks under all **16 fixed block phases**, continuous-book or physical-page-restarting clocks, and one of three *bijective* outer predecessor transformations: direct runes; cyclic no-repeat rank where ciphertext equal to its predecessor maps to distinguished value28; and ascending no-repeat rank with the same repeat convention. This gives **2 numeral readings × 2 table traversals × 2 transposition choices × 16 phases × 2 reset policies × 3 outer transforms = 768 complete, reversible models**. Neither the matrix nor its entries are fitted to original ciphertext.

Rank candidates by recovered GP rune index of coincidence (IoC) on physical pages0–27, then freeze the key and score pages28–55. For globally continuous phases, the original matrix clock persists across the split, with any matrix block crossing the boundary removed from both scoring vectors. Uniform-29 benchmark **1/29 = 0.0344827586**.

| Fixed original-input model | Training IoC | Heldout IoC | Scored training / heldout runes |
| --- | ---: | ---: | ---: |
| Best *radix60* training: grid column-major, transpose, direct, page reset, phase4 | **0.0345921372** | **0.0344930191** | 6,448 / 5,872 |
| Best *radix59* training: grid row-major, transpose, ascending rank, page reset, phase13 | **0.0346299037** | **0.0345102044** | 6,192 / 5,680 |
| Highest radix60 heldout IoC, retrospectively selected over 384 models | n/a | 0.0346865495 | configuration-specific |
| Highest radix59 heldout IoC, retrospectively selected over 384 models | n/a | 0.0346631075 | configuration-specific |
| **True-key source-native English plant**, radix60 column-major, original orientation, ascending rank, page reset, phase5 | **0.0586043659** | **0.0588178920** | 6,416 / 5,840 |

The independent positive control derives **12,956 GP runes** from a withheld 65,000-character suffix of the stored Shakespeare source, preserving the actual manuscript's 55 physical page lengths. Encrypt under one exact source-derived matrix, outer map and phase, then search the original-model family blindly. The genuine key ranks first among all 768 candidates (its first-place margin over radix59 alternatives is large because the plant has GP-English-level nonuniformity), exactly recovers **12,956/12,956** plaintext symbols and forward re-encrypts **12,956/12,956** ciphertext symbols. The plant does not force the original doublet rate; these tests exclude the *literal complete model* for native GP-English without an unspecified repair channel, different byte derivation, dynamic matrix or alternate-language intermediate.

**Decision:** none of the **768** predeclared source-numbered original inverses produces English-like GP runes. The best first-half and subsequent-heldout scores in either radix are close to 1/29. A missing-f numerical convention cannot rescue this exact matrix hypothesis. No authentic original plaintext, key, cipher algorithm or destination is recovered.

Reproduction: [complete Node.js22 CJS cipher and positive SFT](../sims/grid16_hill_source_inverse.cjs), reading the source tokens and canonical corpus directly. Its original-source scores and the positive-plant results were independently computed in the connected research runtime. The end-to-end script is committed but its current 768-mode edition has not been independently executed through GitHub Actions CI.

## Tiled 4×4 and 8×8 source-key schedules (Agent 41)

The manuscript explicitly prints one 4×4 numerical square on LP2 p15, while its 256-cell table is **32 rows of eight numeric tokens**. A distinct complete source-key hypothesis uses the latter table *in its original printed geometry*: partition its eight-token rows into sixteen 4×4 tiles, or four 8×8 tiles. In an F29 Hill stream, apply successive tile matrices to successive equally sized GP rune blocks, cycling back to the first tile after the sixteenth/fourth. No secret matrix coefficients are fitted. Both historically documented token decodings, conventional radix60 and f-omitting radix59, are tested.

Every original tile is invertible modulo29. Radix60 4×4 determinants:
`[9,19,6,5,24,15,1,7,27,2,11,19,19,7,8,8]`;
radix59 4×4:
`[2,14,20,6,1,10,27,7,2,23,4,11,12,14,5,4]`.
The four 8×8 tile determinants are `[20,17,14,12]` (radix60) and `[19,15,26,7]` (radix59). Invertibility of these finite source-derived matrices ensures that every proposed cipher can be decrypted *and exactly re-encrypted* without guessed padding bytes.

Enumerate both numeral readings, 4×4 tile order (row-major or column-major), matrix orientation (original or transpose), 8×8 tile order (one original column so only row-major is distinct), forward/backward tile cycle, every within-block phase, page/book key-clock reset, and the same three bijective outer predecessor encodings as the preceding 16×16 study. This yields **384 unique 4×4** plus **384 unique 8×8** test settings: **768 additional complete reversible original-source ciphers**. The split is original physical pages0–27 versus pages28–55 and the uninterrupted book clock is retained across the boundary. As usual, the earlier half is not a research-wide novel holdout, because the source manuscript has been examined extensively.

| Original source-grid tiled inverse | Training IoC | Frozen heldout IoC |
| --- | ---: | ---: |
| Top 4×4: radix59, printed row key order, no transpose, book clock, direct outer, forward tile cycle, phase3 | **0.0346136603** | **0.0344619096** |
| Top 8×8: radix60, original order, no transpose, book clock, ascending outer rank, backward tile cycle, phase1 | **0.0346422171** | **0.0344325367** |
| Native-GP benchmark for 29-symbol uniform ciphertext | 0.0344827586 | 0.0344827586 |

Both original heldout scores are at chance, and the best 8×8 training configuration is also the winner of the combined 768-model finite family. Even retrospectively selecting on heldout across the 1,152 actually computed settings (including the redundant 8×8 column-order duplicates) gives IoC only **0.0346170422**, still near 1/29.

**Powered source-native positives:** encrypt 12,956 GP runes from a heldout Shakespeare excerpt with the exact original page lengths, first using a full original radix60 4×4 matrix cycle (page reset, forward matrix cycle, ascending predecessor rank, phase2) and independently using the radix59 8×8 cycle (book continuous, reverse matrix cycle, cyclic predecessor rank, phase1). Blind original-key searches over all **768** source-derived configurations recover the authentic **first-place key for both plants**, with true first-half IoCs **0.0586545700** and **0.0586103473**, respectively. The exact known-key inverse also recovers all **12,956/12,956** native source GP symbols in each plant. These successful controls test both matrix dimensions, including the one historical alternative numeral alphabet. Their strong original-score contrast is model-conditional, not a calibrated probability of manuscript intent.

**Result:** this physically tiled, cycling-source-matrix family provides no original GP-English recovery. Neither the original base choice nor phase, transpose, tile direction, whole-page reset, or public predecessor rank yields a viable plaintext. Original ciphertext under the top keys can be forward re-encrypted exactly, but this is a necessary code-correctness property shared by every reversible false key. Hidden changing key material, non-GP source bytes or additional original-context transforms remain possible.

**Reproducer:** [self-contained source-grid tiled Hill inverse and both original-shaped native-source controls](../sims/grid_tiled_hill_inverse.cjs), Node.js22 CJS. The original IoC figures and both plant key ranks were independently computed from repository inputs in the connected research runtime. The SFT is registered together with the 16×16 test in the existing *manual-only* [Hill workflow](../.github/workflows/hill-row-screen.yml), option `source-grid-matrices`. Its standalone GitHub Actions run has not yet been recorded.

These results narrow the specific original-clue fixed-matrix Hill interpretations, including both literally printed squares, the 16×16 grid reshaping, and source-preserving 4×4/8×8 tiling. It does not test matrices formed from transformed prime-index values, ciphertext-dependent block reordering, nonlinear transformations, hidden pre/post substitution, symbol insertion/deletion, independently varied keys or unspecified codebooks. The LP2 4×4 matrix has also been subject to a broader independently written [generic short-block Hill-row screen](../sims/hill_row_screen.cjs); the distinct 5×5 source key tests a block width not covered there. No discovery-wide p-value is claimed; large observed distance from the independently specified solved-reference IoC is the direct diagnostic.

**Reproduce:** [`sims/clue_matrix_hill.cjs`](../sims/clue_matrix_hill.cjs) (CommonJS SFT, two actual matrices, all 140 variants, full result JSON). Inputs: canonical numeric corpus, original rune-word transcription, independent solved-LP1 reference. It performs no downloads or file writes.

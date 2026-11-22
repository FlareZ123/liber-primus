# LP2 p15 Fibonacci-prime 16-column whole-word inverse: exact all-order gate

**Decision (Agent 1, 13 November 2026):** The source-visible 4×4 Fibonacci-prime spiral supplies a concrete sixteen-cell order. The full unsolved LP2 contains **2,896 complete printed words**, exactly **16 × 181**. Despite the match, neither the source-selected order nor **any of the 16! possible column orders** recovers the word-length structure typical of the tested native Gematria Primus English controls. An exact globally optimized Shakespeare-trained adjacency model scores the original lower than **93/96** fully reoptimized exact-inventory shuffles and **31/31** independently scrambled English controls. This retires the proposed **single-pass, word-preserving, 16-column transposition as a direct GP-native English word order**. It does not recover a key, plaintext, or the intended route.

## Original clues and the operation fixed before evaluation

The original LP2 physical p15 image, archive `32.jpg`, contains a 4×4 table of sixteen values; its source-confirmed outward spiral from the red central 3299 yields the absolute prime differences:

```text
i                    0  1  2  3   4   5   6   7    8    9   10   11   12    13    14    15
prime(F_i + 1)       2  3  5  7  13  23  43  79  149  263  463  829  1481  2593  4507  7817
abs(3301 - prime) 3299 3298 3296 3294 3288 3278 3258 3222 3152 3038 2838 2472  1820   708  1206  4516
```

The p15 table in original reading order is `[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820]`. Its exact outward-spiral cell indices (zero-based) are `[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]`. The reproducer asserts every cell-to-prime equality. See [the independent original spiral reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md).

The source GP transcription and original page boundaries give **12,956 rune symbols, 2,896 whole printed words and 32 cross-page carried words**, all preserved unchanged in this test. Set a 181-row, 16-column matrix by reading those 2,896 printed words down successive columns. Read across successive rows in the p15 spiral column order, or its reverse. The choice of this matrix and of using the p15 square to order *all words in the book* remains a **hypothesis**. The image prescribes neither 181 rows nor this cross-chapter interleaver.

The stronger challenge grants **all 16! column orders**, keeping the same full set of source word identities and lengths and retaining exactly 181 words in every column. It thereby covers both source orders and any unknown permutation within this one-pass whole-word model; it does **not** allow a secret operation to alter word length, insert/delete words or change the order separately per chapter.

## Exact optimizer and independent calibration

The [CommonJS single-file reproducer](../sims/lp2_p15_spiral_16column_word_dp_sft.cjs) loads the original transcription with `parseSharedCorpus`, derives nine word-length categories 1–8 and 9+, and fits a **fixed 9×9 adjacent-length log-likelihood-ratio model** using 19 nonoverlapping, histogram-matched 2,896-word Shakespeare windows. All input length-histogram ranks are matched without consulting their position adjacency.

For each ordered column pair a→b, sum its 181 within-row transition scores. For each proposed final→first column pair, sum the 180 row-boundary transitions. A Held–Karp subset dynamic program with each of the sixteen possible first columns computes the **exact highest score across all column permutations**, including the boundary adjustment. This is an exact score optimization with 2¹⁶ subsets, not a heuristic permutation sweep or a fitted cipher key.

The exact original results on **Windows Node.js 22** are:

| Tested original-word reading | Trained model total score |
| --- | ---: |
| Original printed word order | **−33.980499** |
| p15 outward-spiral 16-column row read | **−45.601993** |
| Opposite spiral direction | **−29.295299** |
| Best of every 16-column order | **11.232436** |

The all-order optimum is **[10,5,1,13,15,12,14,6,11,9,0,3,2,4,8,7]**, a retrospectively optimized order that the artifact does not select. Its score must be compared with the *same optimizer* on controls:

| Control | Result |
| --- | --- |
| 96 seeded exact-inventory shuffles of original word lengths, each independently optimized | **93/96 ≥ 11.232436**; add-one upper-tail **0.969072**; median optimum **18.322719**; 95th percentile **27.378595** |
| Five held-out GP-native Gibran word-length windows, histogram-matched and enciphered with the exact p15 spiral | **5/5** optimized above original; optimized range **30.695246–41.556549** |
| Twenty-six held-out GP-native Emerson windows, same construction | **26/26** optimized above original; range **24.131815–50.298646** |

All **31** native controls reproduce their full 2,896-word plaintext length order exactly when passed through the independently fixed p15 row-read inverse. The optimizer is evaluated on each scrambled plant without knowing its key. Each positive control is therefore an exact reversible plant with a credible native-text score. The low original optimized score cannot be dismissed as an intrinsically insensitive length-adjacency model in these registers.

**Reproduction:** [Exact CJS test](../sims/lp2_p15_spiral_16column_word_dp_sft.cjs), [manual Windows GitHub Actions workflow](../.github/workflows/lp2-p15-16column-word-dp-manual.yml), [successful original-input and native-plant CI run 43385702437](https://github.com/FlareZ123/liber-primus/actions/runs/43385702437). The fixed null PRNG seed is `0x33011601`; its 96 reoptimizations and their summary are printed in the test output. The source counts, p15 spiral prime equality, 19 model-training windows, native inverse plants and independent optimum score are asserted.

## Decision for the next research route

The authentic **sixteen-cell p15 clue** and the exact **2,896 = 16×181** word count survive as arithmetic observations. The resulting whole-word transposition is unsupported because its source-derived orders do not yield English-like adjacent lengths, and even a completely free 16-column order produces less structure than almost all matched shuffles. Under the tested English register, more work searching column permutations, directions, phases or manually polishing this model is unlikely to yield plaintext.

This evidence is **conditional** on an original word-boundary-preserving single pass and the GP-native English comparison. A genuine second layer that rewrites word segmentation, a different plaintext register, or a source-selected chapter-specific operation is outside this result. Future effort should require an original clue that selects an identity-changing decoder or a different readout before extending this 16-column model. No unknown LP2 rune was recovered.

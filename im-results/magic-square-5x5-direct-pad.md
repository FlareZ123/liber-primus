# LP1 5x5 magic square as a direct GP29 pad and Hill matrix for the LP2 five-dot pages

**Classification:** reproducible LP1 paired-square source structure plus positive-control-backed bounded negatives for direct LP2 key transfers. No unknown LP2 plaintext, authentic key, or continuation recovered.

## Human-visible solve-path hypothesis

LP1 original scan 05 contains a mixed 5x5 word/number grid. Replacing each rune-word by the sum of its Gematria Primus prime weights reconstructs the 5x5 magic square below, with constant 1033. LP1 original scan 16 contains a second 5x5 numeric magic square, with constant 3301, immediately after prose stating that the primes and the totient function are sacred and that all things should be encrypted. Both constants are prime: 1033 is p174 and 3301 is p464. Their prime-ordinal gap is 290 = 10×29, exactly 29 times the ten intervening LP1 image files 06–15. This is a concrete cross-page source relationship, not yet a key.

LP2 physical pages 7 and 23 reuse the same five-dot stencil under an exceptionally close vertical reflection: original scans 24 and 40. The shared five-point artwork is documented in black-dot-template-reflections.md; the numerical square and its reversed-hex container are documented in jpeg05-palindromic-magic-square.md.

A solver could reasonably connect the LP1 squares, the explicit prime/totient language, and the LP2 five-dot structure. The direct GP29 pad, Hill, and matrix-state interpretations below are hypotheses, not established authorial instructions.

## Frozen source key

The LP1 square is:

| 272 | 138 | 341 | 131 | 151 |
|---:|---:|---:|---:|---:|
| 366 | 199 | 130 | 320 | 18 |
| 226 | 245 | 91 | 245 | 226 |
| 18 | 320 | 130 | 199 | 366 |
| 151 | 131 | 341 | 138 | 272 |

All five rows, five columns, and both diagonals sum to 1033.

The row-major GP29 key is:

**[11,22,22,15,6,18,25,14,1,18,23,13,4,13,23,18,1,14,25,18,6,15,22,22,11]**

The vertical-reflection key used on p23 is:

**[6,15,22,22,11,18,1,14,25,18,23,13,4,13,23,18,25,14,1,18,11,22,22,15,6]**

The square begins and ends with the same cell value, so both natural key lengths were tested: 24 (omit the repeated closing cell) and 25 (include all cells). No arbitrary starting phase or unknown rune permutation was fitted.

## Exact inverse tested

For each original page, the tested model is:

C_i = (P_i + s K_j) mod 29

where s is either sign and the key pointer starts at the square's first cell on each page. A key draw is rejected only when it would reproduce the previous published ciphertext rune; the pointer then advances and tries the next key cell. The Viterbi inverse allows zero, one, or two rejected draws per output rune and penalizes each rejection by 3.5 log units.

The page-7 and page-23 orientations are fixed by the source artwork, not chosen from ciphertext scores. The language model is a Gematria Primus bigram model trained on the first 78% of the repository's Shakespeare reference; the final 22% supplies independent synthetic controls. GP digraphs use their corresponding single runes. For scoring only, Q/K map to C, V to U, and Z to S.

## Original LP2 results

| Page | Source-fixed orientation | Best period | Sign | Best score (nats/rune) | Inferred rejected draws |
|---|---|---:|---:|---:|---:|
| 7 (208 runes) | Original row-major | 24 | +1 | **−4.963645** | 4 |
| 23 (213 runes) | Vertical reflection | 24 | −1 | **−4.784409** | 2 |

The best previews remain nonlinguistic. Page 7 begins **YEAIATJYNTRXRWUIALGHIAEIPIAHHWIAP...**; page 23 begins **WIFXBOALGGRAELURSALTXAFEOXEYCFME...**.

## Positive controls and decision

Twenty-four synthetic controls use 12 independent held-out Shakespeare GP windows of the same 208/213-rune lengths, encrypted with the exact candidate key, both periods, both signs, and the same collision-rejection rule. The unchanged inverse recovers **18/24 controls exactly**; every remaining control is within four runes. Mean planted score is **−2.717337 nats/rune** (range −2.841743 to −2.619932). The original best scores are about 2.1–2.2 nats/rune worse than the planted mean.

**Decision:** the direct, source-locked interpretation of the LP1 square as a repeating additive GP29 key for p7/p23 is not supported. This is a useful rejection of the simplest five-dot ↔ 5x5-square solve path. It does not exclude using the square as a transposition, state seed, nonlinear key source, or part of a further cipher layer; those would require independent instructions rather than free parameter expansion.

## Second natural interpretation: 5×5 Hill cipher over F29

The same 5×5 object is not only a 25-symbol sequence; it is also a literal square matrix. Reducing its entries modulo 29 gives:

| 11 | 22 | 22 | 15 | 6 |
|---:|---:|---:|---:|---:|
| 18 | 25 | 14 | 1 | 18 |
| 23 | 13 | 4 | 13 | 23 |
| 18 | 1 | 14 | 25 | 18 |
| 6 | 15 | 22 | 22 | 11 |

Its determinant is **3 mod 29**, so it is invertible and a valid 5-symbol Hill key over the GP29 field. This is a more natural use of the 5×5 square than treating its entries only as a repeating pad. The source-fixed p7 key is row-major; p23 uses the vertically reflected matrix indicated by the five-dot mirror.

Tested 40 page-local inverses: for each page, the source-fixed matrix and its transpose (row/column-vector convention), direct multiplication and inverse multiplication, and all five possible 5-symbol block phases. Incomplete leading/trailing symbols are left unchanged; no padding is guessed. A second, global-stream test applies either the row-major or vertically reflected matrix continuously to all 12,956 unknown runes (rather than resetting at pages), again testing transpose, direct/inverse operation and all five phases: 40 further settings.

| Page | Best of 20 | Best bigram score (nats/rune) | IoC |
|---|---|---:|---:|
| 7 | Printed matrix, direct, phase 3 | **−4.864048** | 0.037022 |
| 23 | Transpose of reflected matrix, direct, phase 1 | **−4.858036** | 0.034458 |

These are not source-consistent settings: the two pages prefer different operations and phases, and the best scores remain far below held-out English GP controls (−2.6823 and −2.6903 nats/rune; IoC 0.06429 and 0.06506). The natural phase-zero results are weaker still: p7 −5.109939 and p23 −4.906512 nats/rune.

All **40/40** synthetic Hill plants recover exactly under the same matrix, orientation, operation and phase used to encrypt them. Thus the inverse is functional; the original outputs are the failure.

The **global continuous-stream** interpretation also fails. The best of its 40 settings is the vertically reflected printed matrix, direct multiplication, phase 4: **−5.125289 nats/rune**, IoC **0.034485**. The best phase-zero setting is row-major printed/direct at **−5.149117**. A held-out 12,956-rune English GP control scores **−2.620232**, IoC **0.057352**. All **40/40** global synthetic controls recover exactly. Thus neither page-local use nor a single continuous global Hill stream produces plaintext.

**Decision:** the direct additive pad, page-local/global 5×5 Hill-matrix interpretations, and this five-dot-rank-seeded matrix-state stream are unsupported for p7/p23 or the global unknown stream. The determinant and visual five-based correspondence are real structural facts, not evidence that either proposed cipher was intended.

## Five-dot rank-seeded matrix-state stream

The measured five-dot reflection report supplies a second way to turn the stencil into a seed, rather than using it only to choose a matrix orientation. Sorting the five measured dot centers by x and ranking their y coordinates gives the one-based permutations p7 [3,5,1,4,2] and p23 [3,1,5,2,4]. Treating these as five-symbol initial states, iterate the source-oriented 5×5 square modulo 29 and concatenate its five-symbol states. The tested seed cycles contain 28 states, yielding a 140-symbol periodic additive stream. This is a source-derived state hypothesis; it is not an established instruction.

The page-local test covers both zero- and one-based rank seeds, row- or column-vector state updates, and both additive signs (16 settings across p7/p23). The best is p23, zero-based seed, row update, sign+1: **−4.743295 nats/rune**, IoC **0.036629**. For a global continuous stream, both dot-derived seeds, row/column updates, time-major/component-major flattening and both signs give 16 settings. The best global score is **−5.147580 nats/rune**, IoC **0.034493**. Held-out English GP scores **−2.620232**, IoC **0.057352**. Synthetic additive plants recover exactly under the same generated key in all **16/16 local** and **16/16 global** controls.

The tested dot-seeded state cycles contain 28 states, and the dot-rank seeds are reproducible structure. Neither the local nor global state stream yields English. This closes this specific five-dot-rank / matrix-power keystream; other state seeds or nonlinear uses would need an independent source rule, not a free search over vectors.


## LP1 p05/p16 prime-totient bridge and original-LP2 tests

### Exact source reconstruction

The p05 mixed grid is converted cell-by-cell as follows: printed decimal cells remain unchanged; each rune-word is replaced by the sum of the prime weights of its GP runes. The source token `ᚫᚦᛖᚱᛠᛚ` uses the EA rune `ᛠ` (prime weight 109), giving 366. It must not be misread as the IA rune `ᛡ` (107), which would give the wrong total. The resulting matrix is:

| 272 | 138 | 341 | 131 | 151 |
|---:|---:|---:|---:|---:|
| 366 | 199 | 130 | 320 | 18 |
| 226 | 245 | 91 | 245 | 226 |
| 18 | 320 | 130 | 199 | 366 |
| 151 | 131 | 341 | 138 | 272 |

Every row, column, and main diagonal sums to **1033**. The word prime sums are: SHADOWS 341, AETHEREAL 366, BUFFERS 199, VOID 130, CARNAL 320, OBSCURA 245, FORM 91, MOBIUS 226, ANALOG 320, MOURNFUL 199, CABAL 341.

The p16 numeric square is:

| 434 | 1311 | 312 | 278 | 966 |
|---:|---:|---:|---:|---:|
| 204 | 812 | 934 | 280 | 1071 |
| 626 | 620 | 809 | 620 | 626 |
| 1071 | 280 | 934 | 812 | 204 |
| 966 | 278 | 312 | 1311 | 434 |

Every row, column, and main diagonal sums to **3301**. Both 5x5 matrices are 180-degree symmetric. Original image SHA-256 values, checked against the repository manifest, are p05 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7` and p16 `984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe`.

The prime ordinals are independently reproducible: 1033 = p174 and 3301 = p464. Thus 464−174 = 290 = 10×29, matching the ten LP1 image files between p05 and p16. The p16 prose supplies an unusually explicit prime/totient clue. This may indicate a source-derived prime schedule, but does not uniquely specify one.

### Periodic 25-symbol additive transfers

The new reproducer tests both source matrices as 25-symbol additive keys over the original 12,956 unknown LP2 runes. For each matrix it tests raw cell values mod 29, Euler φ(cell) mod 29, and the one-based prime-index interpretation φ(p_n)=p_n−1 mod 29; row-major and column-major traversal; addition and subtraction; and book-global and physical-page-reset clocks. This is 48 fixed variants. No phase fitting or ciphertext-selected permutation is used.

The custom GP trigram model is trained on 323,083 GP symbols from the Emerson control. Original ciphertext baseline: IoC 0.0344784, top-12 mass 0.429762, trigram score −14.00447 nats/rune. Authentic solved controls are substantially more language-like: p56 “AN END” (85 runes) IoC 0.070028, top-12 0.823529, score −7.95392; LP1 “A WARNING” (184) IoC 0.064029, top-12 0.804348, score −8.00334; “WELCOME” (116) IoC 0.055472, top-12 0.784483, score −8.02015.

Across all 48 variants, IoC is 0.0344518–0.0345351, top-12 mass 0.428141–0.438793, and trigram score −14.0960 to −13.9830. None approaches the authentic controls. The raw p05 key is a reproduction/control for earlier direct-pad work; the transformed p05 and p16 keys are the new finite cases. This excludes only these direct periodic additive readings.

### Prime-ordinal starts in the solved p56 totient cipher

A second, more direct solve-path hypothesis treats the magic constants' prime ordinals themselves as starting positions in the independently solved p56 key schedule. The p56 cipher uses φ(p_n)=p_n−1 mod 29, subtracts the key, resets at a page, and can treat selected visible F runes as literal, non-consuming symbols. The new test starts that exact schedule at p174 (1033) and p464 (3301), resets at each original physical LP2 page, and exhausts every visible-F skip mask independently on each page.

The authentic p56 positive control recovers its known 85-rune plaintext with literal-F mask 8 and scores −2.38511 nats/rune. Each offset tests 249,802 masks across all 55 rune-bearing unsolved pages (12,956 runes), or 499,604 masks total. With p174, the best page score is −5.65247, median −6.15684, and mean −6.11930. With p464, the best is −5.77056, median −6.08335, and mean −6.12419. **No page under either offset reaches the authentic p56 control score.** These are strong bounded negatives for the direct page-reset prime-totient transfer at the two source-derived offsets; they do not exclude a different stateful or non-additive use of the paired squares.

### Decision and remaining lead

The p05/p16 pair is a real source-level structure: two 5x5 magic squares, prime constants whose prime ordinals differ by ten 29-symbol blocks, and explicit p16 prime/totient language. The direct 25-cell additive transfers and the p174/p464 p56-prime-totient starts do not decrypt LP2. The p05 grid also contains the literal token **MOBIUS**; together with the p16 totient sentence this makes a Möbius/totient construction a plausible next *specific* question, not an established method. Any follow-up should specify one exact operation and key clock from those source clues before scoring original ciphertext. Do not broaden into arbitrary matrix transformations or prime-offset sweeps.

Reproducer: `sims/lp1_magic_square_prime_totient_gate.cjs`. It verifies both original image hashes and both magic-square structures, runs the 48 periodic-key variants, and reuses the p56 inverse helpers for the two exhaustive prime-ordinal offset tests.

## Reproduction

Run node sims/magic_square_5x5_gp_pad_inverse.cjs and node sims/lp1_magic_square_prime_totient_gate.cjs from the repository root with Node.js 22. The script reads the LP2 corpus and Shakespeare control, embeds the measured five-dot center coordinates from black-dot-template-reflections.md, asserts the square's 12 magic sums and the two original page lengths, executes the direct additive-pad models, 40 page-local and 40 global-continuous Hill inverses, and 16 local plus 16 global matrix-state settings. Each family has exact synthetic controls (24 direct-pad, 40+40 Hill, and 16+16 matrix-state). It has no external dependencies and does not write files.

This is intermediate evidence, not an established decryption. The authoritative results/README.md records the bounded negative without promoting it as recovered plaintext.

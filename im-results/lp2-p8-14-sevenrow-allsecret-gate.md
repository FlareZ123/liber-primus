# Seven-page LP2 p8–14: source-motivated seven-column cipher decisions

**Agent17, 13 November 2026.** Two source-bound **key-independent** original-cipher obstructions, with an additional source-fixed historical dense matrix test in Gate C. Neither identifies the actual cipher or recovers an unknown plaintext, genuine key or destination. These results constrain two concrete ways a seven-column clue might be consumed, rather than ruling out all seven-column encoders.

## Original evidence and weakest assumption

The unmodified seven physical pages **LP2 p8–p14** form one source-visible red-heading chapter, with exactly **1,729 GP29 runes = 7 × 247**. Physical **p10** includes the manuscript's lone ordinary-prose Arabic numeral **7**, immediately followed by one-rune **G**, after **169 p10 runes**, or **692** runes from the chapter opening. The other printed digits are the explicit numbered paragraphs 1–5 in pp36–38. The original page trees are re-used graphic stencils alternating between margins, so they establish no traversal or key ([tree-source audit](lp2-p8-14-tree-stencil-source-gate.md)). Cicada's 2014 *A KOAN* stage did use a seven-column operation, but that operation is not an authenticated instruction for LP2.

These independent original-source features suggest **seven columns and 247 rows**, either as 247 successive seven-rune blocks (row-major) or seven 247-rune strands (column-major). No original clue authenticates either layout. The same p10 **7 G** has an existing, independent proposed **7 × GP-prime(G) = 119** interpretation involving original p3/p39 red fragments ([competing source interpretation](../workplace/p10-seven-g-red119-source-bridge.md)). The numeric layout is therefore a **hypothesis**, not a known author-selected decryption.

## Gate A: arbitrary independent secret alphabet per seven-symbol row

Give the hypothetical cipher **247 arbitrary, independent, secret bijections of the entire GP29 alphabet**, one for each group of seven symbols. Also allow every possible permutation of the seven positions inside each row, with no shared column order. The identical-rune pair count within a row is invariant: for any injective f, f(x) = f(y) exactly when x = y. Every one of 29! secret alphabets per row and 7! reordering choices has exactly the **same** total equality-pair count; guessing the key cannot improve this statistic.

There are **247 × 21 = 5,187** unordered within-row rune pairs. Original ciphertext:

| Layout | Original equal pairs |
| --- | ---: |
| Consecutive seven-symbol groups | **139** |
| Seven length-247 strands | **179** |

The three checked-in pre-2014 English controls are independently encoded into native GP29 orthography, with historical substitutions and digraphs. Windows have exactly 1,729 runes and are sampled every 83 source runes, without ciphertext-dependent selection.

| Native source | Windows | Row-major control minimum (mean) | Column-major control minimum (mean) |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 733 | **184** (236.270) | **261** (313.753) |
| Emerson, *Essays: First Series* | 3,851 | **184** (244.112) | **256** (320.552) |
| Shakespeare, first 300k characters | 2,595 | **195** (249.459) | **254** (311.750) |

The 139/179 original counts lie **below all 7,179 pinned native-English windows in both layouts**. A deterministic GP-native 1,729-rune plant encrypted under 247 separate randomized full 29-way secret permutations recovers **1,729/1,729** runes under both layouts, with exact collision invariance.

**Scope:** This excludes only a common **one-symbol map per seven-symbol row** with arbitrary secret alphabet and optional within-row reordering. Mixing positions together, changing secret maps *within* rows, or moving symbols between rows is not covered.

## Gate B: exhaustive GF(29) seven-column sparse Hill inverse

A Hill-style encoder that **linearly mixes** positions within a seven-symbol row survives Gate A. Gate B tests a materially distinct, stronger family: **every constant invertible 7×7 Hill key over GF(29) whose inverse matrix rows each have at most four nonzero coefficients**, plus arbitrary fixed additive offsets at each decoded column and arbitrary row permutations. It is an exhaustive linear-algebra search with no guessed key, phase, column order, or letter-score fitting.

Every decoded plaintext position at a given column is one fixed linear projection of the seven ciphertext symbols in each of 247 rows. For an unknown vector of support k, all nonzero coefficient choices are exhausted modulo multiplication by a nonzero scalar. Scalar multiplication and adding a fixed GP29 offset do not affect the **doubled matching-pair count** among the 247 recovered symbols. Fixing the first nonzero coefficient to 1 therefore covers all possibilities without searching redundant variants.

For each of two layouts, the exhaustive projective search contains:

| Nonzero inverse-row coefficients | Tested relative coefficient vectors | Largest doubled matching-pair count (row-major / column-major) |
| --- | ---: | ---: |
| 1 | **7** | 2,166 / 2,184 |
| 2 | **588** | 2,410 / 2,358 |
| 3 | **27,440** | 2,502 / 2,452 |
| 4 | **768,320** | **2,552 / 2,530** |
| **Total** | **796,355 per layout** | **2,552 / 2,530** |

The denominator for an ordinary within-column coincidence index is **247 × 246 = 60,762** because the pair count is doubled. The best original projection reaches only **2,552 / 60,762 ≈ 0.0420**. Even its best coefficients ([2,3,5,6] → [1,27,3,28] row-major; [2,3,4,5] → [1,9,24,23] column-major) are nonlinguistic in marginal collision capacity.

For a complete native-English plaintext window, at least **one** of its seven source columns must have its own doubled coincidence count. Compute the **maximum of the seven unmodified native-column counts** per window, then take the minimum over each pinned source:

| Native control | Row-major minimum of seven-column maximum | Column-major minimum of seven-column maximum |
| --- | ---: | ---: |
| Gibran | **3,650** | **3,612** |
| Emerson | **3,666** | **3,546** |
| Shakespeare | **3,506** | **3,458** |
| **Original: maximum attainable by any ≤4-sparse inverse row** | **2,552** | **2,530** |

This is an **exact finite-corpus impossibility**, with a large gap. A secret Hill inverse with all seven rows at most 4-sparse could only emit seven columns with doubled coincidence count **at most 2,552** (row-major), or **2,530** (column-major). Every one of the 7,179 native-English controls requires at least **one** column at or above **3,506** (row-major) or **3,458** (column-major). Neither any unknown secret matrix satisfying the support restriction nor any additive offsets or column permutations can reconcile that mismatch.

A nontrivial **positive Hill7 plant** starts from native GP29 Gibran runes, solves the full seven-position triangular system whose inverse is the four-tap transform P_j = C_j + C_(j+1) + C_(j+2) + C_(j+3) (out-of-range coordinates zero), and recovers all **1,729/1,729** runes in each layout. It also preserves the computed projection scores exactly. Hence the rejection is not a coding or inverse-direction failure.

**Scope:** The exact family includes arbitrary unknown invertible 7×7 matrices with inverse-row support 1–4, not only a fixed historical Hill key. It does **not** exclude an inverse with **five to seven nonzero coefficients in any row**, moving rune positions *between* seven-symbol blocks, extra state-dependent cipher layers, or a plaintext unlike the three pinned native-English controls. A sparse *forward* matrix can have a dense inverse; this result concerns the **inverse** support only. The 7 × 247 clue itself remains provisional.

## Gate C: historical 2014 Stage10 dense seven-square key

**Agent15, 13 November 2026; original-source regression executed successfully.** The published 2014 Stage10 [magic-square text](../resources/cicada2014-openpuff-magic-squares.txt) contains a unique 7×7 integer square, with every row and column summing to **1033**. Gates A and B leave dense 7×7 Hill inverses open; this historical artifact is a concrete, complete matrix one could test without guessing its 49 entries. The seven source pages and p10's printed 7 supply an independent *reason to try*, although **no original instruction selects a transfer of Stage10's square to these LP2 runes**.

The exact 7×7 matrix and, separately, its entrywise Euler totients are both invertible over GF(29). The raw source key is primary; entrywise totients are a labelled speculative control. For each matrix, test the matrix itself and its exact inverse, left and right multiplication, and seven sequential ciphertext runes per block or seven 247-rune strands. This is **16 fixed reversible configurations** acting on all **1,729 untouched GP29 runes** of pp8–14. No free phase, fitted parameter, salt, word edit or additional cipher layer enters. Each model also reverses a **1,729/1,729** synthetic native-GP plant using solved p57 runes.

| Original-input measurement | Coincidence index |
| --- | ---: |
| Best of 16 direct source-key outputs | **0.035161** |
| Worst of 16 direct source-key outputs | **0.034351** |
| Genuine native-GP column controls from Gate B | **substantially higher** |

The best original output uses the unchanged historical matrix, left multiplication and the seven-strand layout. Its first 90 GP rune transliterations are:

    IAJEAYPWEAJYXAETFHYNGTHOEGTHGAEOCOFWEOIAEOGOMPPCPXYITUWIAYNGOMLWXAGGAEIAAETPWEAOTEGPIJOJEOEOEAYFDIATHGCAPNGDAERDAE

All 16 outputs remain ciphertext-like (every whole-chapter IoC below 0.04). **No original plaintext, source-authenticated LP2 cipher operator or new key is recovered.** The key is authentic *for its earlier 2014 puzzle stage*, but its proposed LP2 use fails.

[Standalone CommonJS reproducer](../sims/lp2_p8_14_stage10_sevensquare_hill_sft.cjs) was executed in [successful manually dispatched original-source CI run 43523235489](https://github.com/FlareZ123/liber-primus/actions/runs/43523235489), with the [manual-only workflow](../.github/workflows/lp2-p8-14-stage10-sevensquare-hill-manual.yml). The initial dispatch failed at JavaScript syntax parsing, corrected before the successful run. No cryptanalytic conclusion is based on the failed run.

**Decision:** retire this **specific source-fixed 2014 dense Hill7 key transfer**. An arbitrary dense secret 7×7 matrix remains outside these results, but now requires a genuinely independent key/source selector or plaintext anchor before another search.

## Gate D: full dense secret affine Hill7 — exact partial-quotation inverse (Agent11, 27 November)

The sparse-row gate and failed fixed Stage10 key leave every arbitrary dense invertible matrix open. A distinct, constructive attack uses the actual 2012–2014 book-code texts (Blake, the three Liber AL books, and Self-Reliance) plus each of nine exact solved-native rune records separately. Reuse of any such passage as plaintext is a historical-source hypothesis, not an authenticated LP2 instruction. It is cheaper and more specific than a dense key search. No whole-chapter donor, word spacing, same-position start, guessed affine offset, or language scoring is required.

For each natural 247×7 layout let C and P be rows of seven GP29 symbols, with P=C M+b over GF(29), M invertible. The augmented transposes [C|1]^T and [P|1]^T have identical row spaces under every such affine key. Canonical RREF of the 8×10 matrix provides a complete fingerprint of the ten-row affine dependencies. At any matching full-rank alignment, choose the eight pivot rows and recover all 56 coefficients of the inverse uniquely by multiplying the inverse augmented cipher basis by its plaintext basis. Verify the other two fit rows, then four disjoint following rows without refitting. Decode the entire chapter and forward-replay all 1,729 runes for a survivor. Every one of the 234 eligible original starts per layout has rank eight; rank-deficient donor windows cannot match those signatures. This includes all dense/sparse keys and translations in the fixed layouts with ordinary consumption.

| Layout | Donor windows | Original/donor alignments | Fit matches | Held matches |
|---|---:|---:|---:|---:|
| row | 82680 | 19347120 | 0 | 0 |
| column | 73562 | 17213508 | 0 | 0 |

Four deterministic independently keyed native plants, two per layout, embed an 18-row historical-source fragment at a nonzero row in unrelated source-native prose; all four true alignments, full hidden 56-coefficient inverse keys, and 6,916/6,916 plaintext runes recover, with exact forward replay and zero held wrong-source matches. The scan is an exact key-independent prefilter followed by constructive recovery, not a dense-key heuristic. It permits any donor rune offset and any original row start leaving 10 fit and 4 held rows. For the seven-strand layout, a source fragment is sampled in seven strands of length 247, rather than presented as a contiguous 98-rune quote. No original fit or held result may be interpreted as general language or cryptographic impossibility.

**Decision:** No affine-compatible historical source alignment in the specified scope. The named source-quotation route fails if no survivor; arbitrary new prose, shorter cribs, untested orthography and stateful/F-hold or alternate layout models remain outside scope. No unknown plaintext or authentic key recovered. [Reproducer](../sims/lp2_p8_14_dense_hill7_crib_sft.cjs) · [Raw output, exact source blob IDs and keys](./lp2-p8-14-dense-hill7-crib-output.json). Core executed in connected V8; standalone Node wrapper supplied, not separately run. No new CI.


## Gate E: full projective GF(29) inverse-row exhaustion — no dense-key escape (Agent11, 27 November)

Gate B's support cutoff is removed completely. For every possible fixed invertible affine Hill7 inverse, each of its seven output columns is a nonzero linear projection of the 247 ciphertext rows, followed by a constant translation. Multiplying a projection by a nonzero scalar, translating it, applying any fixed per-column alphabet permutation after projection, and permuting rows all preserve its doubled equality count. Normalize the first nonzero coefficient to 1 and exhaust **(29^7−1)/28 = 616,067,011** projective directions per layout. This is an exact ciphertext-only bound, independent of quotation or candidate key fitting.

For each pivot position the remaining six or fewer coefficients are divided into two halves. Precompute both halves' entire 247-value modular projections; add residues and accumulate exact histogram pair counts for each combination. Every tuple occurs once. The actual original 1,729-rune input is pinned to source commit e7a3bf4c4e34c0ce4e26a5bf0c2bb99186ac42de. No source re-encoding or change of layout is introduced.

| Natural layout | Complete directions | Maximum doubled pairs | Maximizing normalized vector | Gate B native floor | Directions reaching floor |
|---|---:|---:|---|---:|---:|
| Consecutive seven-rune rows | 616,067,011 | 2,698 | 1,21,7,11,15,16,4 | 3,506 | 0 |
| Seven 247-rune strands | 616,067,011 | 2,768 | 1,5,9,3,8,0,20 | 3,458 | 0 |

The highest possible original IoCs are 2698/60762 and 2768/60762. Both maxima are below the minimum of the maximum seven-column score across all 7,179 previously pinned native-English windows in Gate B. Thus no fixed invertible GF(29) seven-symbol linear mixer with constant offsets (including arbitrary output alphabet permutations) can produce any such window in either tested layout. All keys are covered, including dense inverses. This is a finite-reference exclusion rather than a universal English impossibility. Additional input substitutions, changing matrices, row-dependent offsets, shifted block boundaries, F-hold consumption and different layouts remain outside the model. The original 7-column hypothesis itself is unverified.

Controls: independent randomly generated invertible dense matrices on 1,729 source-native runes in each layout have exact 1,729/1,729 forward/inverse recovery and preserve each actual inverse-column coincidence score; their maximum scores are 4,078 and 3,954. The optimized split scorer agrees with a direct dot-product scorer for 1,000 dense directions per layout. A complete three-dimensional enumeration of 871 directions agrees with independent direct scoring in each layout. The previous 7,179-window floor is reused without rerunning Gate B.

**Reproduce:** build and run the exact C++ program with OpenMP, using two lines of base-36 digits generated by the companion script:
```sh
node sims/lp2_p8_14_hill7_full_projection_input.cjs > input.txt
g++ -O3 -march=native -fopenmp sims/lp2_p8_14_hill7_full_projection_sft.cpp -o hill7
OMP_NUM_THREADS=4 ./hill7 input.txt
```
[Exact local run stdout](lp2-p8-14-hill7-full-projection-output.txt). The C++ compiled and executed locally, with both complete scans and all assertions passing. The input SHA-256 was 2cb646d5bb95bd67b81a1816afa617fc0ffa3cdcc030f6d2095313537bc490fd; generated from the pinned original numeric rune tape and first 1,729 exact solved-native runes, with length, sum and weighted sum checks. Companion standalone Node generator supplied; the tapes were obtained from connector execution and copied locally, rather than generated by running that wrapper. C++ output SHA-256 6e9b041b9c3181472ac826a606df5095e857b9a8a8289570a2b7b0d04d99dcfe.

**Decision:** retire the entire fixed Hill7 linear-projection family on these two alignments for ordinary GP-English. Do not repeat the dense search. Reopening requires independent evidence of a genuinely different transformation or unusual plaintext. No original plaintext or authentic key recovered.


## Reproduction, sources and next decision

- [Original exact source and independent 247-bijection positive test](../sims/lp2_p8_14_sevenrow_allsecret_sft.cjs); [passing Windows CI 43514671553](https://github.com/FlareZ123/liber-primus/actions/runs/43514671553).
- [Exhaustive 1,592,710 projection attack, full 7,179-window reference envelope and positive Hill7 inverse](../sims/lp2_p8_14_hill7_sparse_inverse_sft.cjs); [passing Windows CI 43517943573](https://github.com/FlareZ123/liber-primus/actions/runs/43517943573). Both natural layouts are tested. The older taxicab branch was not rerun.
- Original inputs: [LP2 numeric rune corpus](../resources/liber-primus/lp2-corpus.json), [printed rune/punctuation transcription](../resources/liber-primus/lp2-transcription.txt), and the three checked-in original-English control corpora under [resources/control](../resources/control/).

**Next research choice:** Fixed Hill7 is exhausted against the pinned native-English reference in both natural alignments. Gate D additionally rejects the tested historical partial-quotation reuse. Do not repeat these searches. A materially different source-selected operation is needed; changing matrices or representations merely to evade the bound is not evidence. These experiments recovered **no unknown plaintext**.

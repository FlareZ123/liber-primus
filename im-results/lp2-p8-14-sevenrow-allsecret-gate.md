# Seven-page LP2 p8–14: source-motivated seven-column cipher decisions

**Agent17, 13 November 2026.** Two complementary, source-bound, **key-independent** original-cipher obstructions. Neither identifies the actual cipher or recovers an unknown plaintext, genuine key or destination. These results constrain two concrete ways a seven-column clue might be consumed, rather than ruling out all seven-column encoders.

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

## Reproduction, sources and next decision

- [Original exact source and independent 247-bijection positive test](../sims/lp2_p8_14_sevenrow_allsecret_sft.cjs); [passing Windows CI 43514671553](https://github.com/FlareZ123/liber-primus/actions/runs/43514671553).
- [Exhaustive 1,592,710 projection attack, full 7,179-window reference envelope and positive Hill7 inverse](../sims/lp2_p8_14_hill7_sparse_inverse_sft.cjs); [passing Windows CI 43517943573](https://github.com/FlareZ123/liber-primus/actions/runs/43517943573). Both natural layouts are tested. The older taxicab branch was not rerun.
- Original inputs: [LP2 numeric rune corpus](../resources/liber-primus/lp2-corpus.json), [printed rune/punctuation transcription](../resources/liber-primus/lp2-transcription.txt), and the three checked-in original-English control corpora under [resources/control](../resources/control/).

**Next research choice:** The seven-column explanation now requires a genuinely different mechanism: **a dense inverse mixing at least five ciphertext symbols into one decoded position**, an additional source-specified layer or a nonstandard plaintext alphabet/genre. Do not launch an unbounded seven-column key search from the coincidence of chapter size and numeral 7 alone. Obtain an independent key, a row-mixing operation or credible plaintext crib before narrowing that surviving space. These experiments recovered **no unknown plaintext**.

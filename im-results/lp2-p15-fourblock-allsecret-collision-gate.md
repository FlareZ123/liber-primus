# Original page-15 four-rune Hill and general fixed-block collision gate

**Agent 32, 13 November 2026. Classification: exact source-ciphertext equality counts and a finite GP-native-English register exclusion.** No unknown LP2 plaintext, authentic new key or decoding operation was recovered.

## Original source and motivated hypothesis

The original LP2 physical p15 (archive scan 32.jpg) prints a reconstructed Fibonacci-prime **4×4** numerical square. A possible human cipher path is to treat its sixteen original row-major values as a 4×4 Hill matrix over the GP29 field and apply it to four-rune groups on the next chapter. The original square is invertible modulo 29: its determinant is **17**, and the inverse of the printed row-major matrix is

    [19,  1,  6,  3]
    [11,  7,  8, 22]
    [ 2, 10, 15, 28]
    [25,  4,  1, 15].

The grid does not explicitly instruct the player to use a Hill cipher, reduce modulo 29, or choose a reset clock. A sharper test grants **every secret bijection** of complete equal-length rune blocks, including arbitrary 4×4 Hill keys, and permits even a different secret block permutation on each physical page. This asks whether the broad architecture can hide native GP English at all before searching matrices.

For a bijective block encoder fixed within a stratum, ciphertext blocks match each other exactly if and only if their plaintext blocks match each other. Thus the sum of unordered equal-block pair counts is preserved **under every key**. Partition the original 12,956 unknown rune indices into nonoverlapping k-rune blocks, independently resetting at the whole book, the nine image-chapter boundaries, or each of the 55 rune-bearing pages. Drop only incomplete trailing k-blocks. The page reset is a more permissive secret-key model than a single global p15 key.

## Original data versus independent natural-language register

The source-calibrated GP29 English encoder follows the actual solved LP1 and LP2 p57 spelling convention, using a single rune for ING and IO where the canonical naive labels would insert an extra symbol. The three checked-in texts are Shakespeare, Gibran and Emerson, **independent of LP2 ciphertext**. For each encoded text, compare full 12,956-rune windows at stride 6,478 (32/8/48 windows, 88 total, **partly overlapping**) and at stride 12,956 (16/4/24 **disjoint** windows). Every control is partitioned by the original page/chapter-length schedule; its own contents determine its collision counts. No ciphertext key, source letter substitution, image feature or window location is fitted.

Each cell below shows **original equal-block pairs / lowest GP-English count among the 88 windows**:

| Block size k | Whole-book fixed map | Secret map per visual chapter | Secret map per physical page |
| --- | ---: | ---: | ---: |
| **4** | **5 / 848** | **1 / 136** | **0 / 27** |
| **5** | **1 / 142** | **0 / 26** | **0 / 4** |
| 6 | **0 / 39** | **0 / 6** | 0 / 0 |
| 7 | **0 / 7** | **0 / 2** | 0 / 0 |
| 8 | **0 / 3** | 0 / 0 | 0 / 0 |
| 9 | 0 / 0 | 0 / 0 | 0 / 0 |

The same conclusions for k=4–5 survive the **44 disjoint windows**: minimum page-local controls **27** and **5** equal-block pairs respectively, versus original **zero**. In disjoint windows, chapter-local k=4 has minimum 138 (original1); k=5 minimum31 (original0). The 88-window source count, corpus spellings, block boundaries and every integer above are asserted by the executable regression.

An original-length known-GP-language plant is encrypted using the **literal source p15 printed Hill4 matrix**, with each page independently aligned and incomplete trailing blocks carried unchanged. The inverse matrix restores **12,956/12,956** plant symbols; the pair statistic is unchanged. The unmodified original ciphertext likewise algebraically round-trips under the matrix, but its page-local block-collision count remains zero and is incompatible with all 88 English controls.

## Author-native LP1 original-plaintext control (corrected 13 November 2026)

The independently preserved [LP1 original rune transcription](../resources/transcriptions/lp1_wulfic_canonical.txt) supplies an authentic cipher-author spelling control without editorial English-to-GP encoding. An earlier version of this report wrongly selected original LP1 **p5, p12 and p13** as printed cleartext. Those three physical pages still contain **encrypted runes**, despite the historically solved plaintext translations of the surrounding chapters. Original p5 begins with unintelligible glyph transliteration HWAEWING; p12 similarly begins ASWAIPUO. The former mixed-cipher **979-rune/8-pair/3-pair** positive reference is withdrawn.

The corrected six *truly source-cleartext* physical LP1 pages are **p3, p8, p9, p10, p11 and p14**, verified by the literal source-readable starts SOME WISDOM, THE LOSS OF DIVINITY, WE HAVE WHAT, MOST THINGS, CE THAT HAVE (a word continuing from the previous page), and AN INSTRUCTION. Their page-local rune counts are **[157, 187, 207, 192, 169, 89]**, totaling **1,001**. These genuinely printed GP plaintext pages have **11 equal nonoverlapping four-rune block pairs**, **4 equal five-rune block pairs**, and **1 equal six-rune block pair**. The original 55 unknown LP2 rune-bearing pages still have **zero** page-local k=4 and k=5 equal-block pairs among **12,956** runes.

This correction makes the genuine-author comparison stronger in direction, while retaining its limitation as a 1,001-rune reference with different page lengths. The separate 88 source-native GP-English-window tests and original-cipher equal-block counts are unchanged. The updated executable test asserts six source-readable original plaintext prefixes to prevent repeating this page-classification error.

## Decision and scope

**Retire direct page-stationary 4-rune and 5-rune bijective block ciphers as explanations of ordinary source-calibrated GP English across these three controls.** This includes every secret 4×4 GF29 Hill key, any key derivation from original p15's square, and even independent secret block permutations per physical page. Whole-book stationary block bijections of lengths 4–8 and chapter-stationary ones of lengths 4–7 also retain collision deficits in this finite control register. This extends the previous independently recorded 2- and 3-rune bijection gates to the source-visible 4×4 architecture.

The first block lengths whose **collision equality alone** cease to discriminate at least one tested window are **six** for independently page-reset keys, **eight** for chapter-reset keys, and **nine** for a single bookwide key. Those are **necessary lower limits only under the listed finite English controls**. A language outside the tested register could have different repeated-block statistics; word-local resets, multiple evolving keys per page, nonlocal transposition, variable-length coding, input preprocessing and multi-stage encryption are open. Neither synthetic invertibility nor absence of blocks reveals an LP2 key or plaintext. Do not search 29^16 candidate Hill matrices to rescue a rejected fixed four-block hypothesis.

**Reproducer:** [self-testing CommonJS original-source gate](../sims/lp2_p15_fourblock_collision_sft.cjs), Node.js 22, with the checked-in original corpus, source-calibrated native English texts and full original-shape Hill inverse positive plant. The earlier p15 grid reconstruction is in [the independently established Fibonacci-prime mechanism](../results/lp2-p15-fibonacci-prime-spiral.md).

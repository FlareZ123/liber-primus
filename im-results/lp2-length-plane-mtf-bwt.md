# Original LP2 length-plane MTF → cyclic BWT: exact rejection (#2785)

**Decision:** retire the exact canonical rank-to-length move-to-front (MTF) followed by cyclic BWT inverse on independently reset visual chapters. Each of the nine original chapters fails **both** LF-cycle legality and rune-count conservation. No primary-index search, new key, or original plaintext is warranted.

## Motivation and fixed model

Historical exposure to bzip2 motivates the order of the two operations, but does not authenticate a length-plane carrier. #2718 ([raw numeric length BWT](lp2-group-length-cyclic-bwt.md)) tested the lengths directly; #2719 ([MTF/BWT on rune values](lp2-original-chapter-mtf-inverse-bwt-lf-gate.md)) tested a different alphabet. #2725 ([length permutation](lp2-length-permutation-exact-gate.md)) tested a shared static relabeling. The repository Git-tree names and these three closure reports revealed no prior execution of this exact composition.

Use the corrected transcription and canonical corpus, preserving complete groups across page turns, matching all 12,956 original rune indices and the nine visual chapter cuts. For each printed length l, select the zero-based rank l−1 from a list initially [1,…,14]; move the selected length to the front. The emitted sequence L is hypothesized to be the cyclic BWT last column of the true ordered lengths. Stable occurrence ranks form the LF permutation. Its cycles must all have equal length (the minimal period of the underlying string), and represent the same cyclic necklace when multiple cycles occur. Any BWT inverse is a permutation of L, so its sum is invariant over primary rows. Since this proposal reflows the unchanged chapter rune tape, sum(L) must equal the number of actual runes. Failure of either condition excludes every primary index without language scoring.

## Original results

| Physical pages | Groups | Actual rune count | Decoded length sum | Excess | LF cycle sizes |
|---|---:|---:|---:|---:|---|
| 0–2 | 158 | 729 | 921 | 192 | 1,8,20,129 |
| 3–7 | 255 | 1145 | 1555 | 410 | 1,1,3,9,45,79,117 |
| 8–14 | 383 | 1729 | 2738 | 1009 | 1,3,379 |
| 15–22 | 437 | 1903 | 2806 | 903 | 13,13,18,89,137,167 |
| 23–26 | 224 | 1021 | 1399 | 378 | 1,2,3,19,34,165 |
| 27–32 | 326 | 1433 | 2133 | 700 | 1,5,33,44,243 |
| 33–39 | 378 | 1680 | 2063 | 383 | 1,1,1,20,62,66,227 |
| 40–53 | 669 | 3008 | 4167 | 1159 | 1,2,3,15,18,29,35,566 |
| 54–55 | 66 | 308 | 337 | 29 | 1,1,1,1,2,4,8,10,11,27 |
| Total | 2896 | 12956 | 18119 | 5163 | Separate chapter resets |

The terminal chapter is independently negative on both exact invariants. No development fitting occurred. Reassigning the primary index cannot change either invariant.

## Controls and limitations

Nine source-native solved sections (740 groups) were encoded with standard cyclic BWT and MTF, then decoded using their actual planted primary rows. All nine recover every original length, cumulative boundary, and exact forward BWT last column. **None of these nine unrestricted encodings conserves the printed-rank sum.** This is a real limitation of the proposed same-tape carrier, not a decoder failure. A genuinely mass-preserving carrier would require the additional equality. Exhaustive ternary toy plants of lengths 1–7 give 3,279/3,279 exact recoveries, including 54 periodic cases and 479 joint mass/legality successes, proving that the joint gate can accept such constructed inputs. These controls supply no historical selector for a primary index.

For each chapter, 2,000 seeded histogram-preserving rank shuffles and 2,000 independent draws from its empirical rank histogram were tested. Across 18,000 draws per class, 62 shuffled and 71 iid cases passed LF legality; 2 and 6 respectively passed mass alone; **zero passed both**. These nulls describe the frozen model, not evidence for the historical cipher. The original exclusions are exact and do not depend on estimated null rates.

## Reproduction

`node sims/lp2_length_plane_mtf_bwt_sft.cjs` from a checkout (CommonJS; built-ins only). [SFT](../sims/lp2_length_plane_mtf_bwt_sft.cjs) · [complete deterministic output](lp2-length-plane-mtf-bwt-output.json). The experiment function was actually run in the connected JavaScript runtime and preserved verbatim in the SFT; standalone Node and GitHub Actions were not run. Input files are listed in the program. Seed 0x2785c1c; no parameter tuning. First evidence commit 808ee1f4097721b33387f2e0b2c205b89a424478.

Scope: this rejects the stipulated canonical initialization, chapter framing and unchanged-rune-tape composition. It does not reject all MTF variants, general BWT, full bzip2 packet framing, alternative source-selected boundaries, or changing the rune tape. No alternative alphabet/offset search is justified by this result.

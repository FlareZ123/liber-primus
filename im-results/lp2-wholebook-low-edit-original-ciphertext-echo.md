# Whole-book low-edit rune echo: all-page source gate

**Original-ciphertext bounded result, Agent34, 15 November 2026.** The previously known six-rune exact shared phrase `D-J-U-B-E-I` (physical p27 and p55) offers a concrete reason to look for longer copies with a handful of altered runes: a slightly corrupted repeated encryption segment, local compositor substitution, or reused ciphertext with sparse edits could leave a long near-identical sequence. This check uses the **entire unmodified 12,956-rune stream**, includes every physical page transition and joins p49→p51 through the non-rune 256-cell grid. The hypothesis is deliberately about **ciphertext reuse under sparse substitutions**. It does not require guessing plaintext or a key.

## Exhaustive source result

For each n-rune window, consider every non-overlapping pair of global positions. Count absolute source GP29 disagreements at exactly aligned coordinates (Hamming distance); require at most k. A partition into k+1 consecutive disjoint chunks guarantees that every candidate pair must agree on at least one complete chunk. Index all chunks, compare candidates exactly and deduplicate. The method is complete for each declared (n,k) without a quadratic full scan.

| Window length n | Allowed substitutions k | Source-pair hits | I.i.d. uniform-GP29 expected hits (illustrative only) |
| ---: | ---: | ---: | ---: |
| 15 | 4 | **0** | 0.00000822 |
| 13 | 3 | **0** | 0.0000517 |
| 12 | 3 | **0** | 0.00115 |
| 11 | 3 | **0** | 0.0251 |
| 9 | 2 | **0** | 0.164 |
| 8 | 2 | **5** | 3.71 |

The baseline comes from `nonoverlap_pairs × Σ[d=0..k] C(n,d) 28^d / 29^n` for independent uniform runes. It is a scale comparison, **not** a calibrated p-value for the observed anti-doublet, unequal page lengths or shared neighboring windows.

All five original eight-rune, two-substitution echoes (page-local offsets 0-based):

| Original source sites | Changed positions | Source GP transliteration |
| --- | --- | --- |
| p5:59 ↔ p8:60 | 0,5 | `Y R EO P NG EO P O` ↔ `EA R EO P NG U P O` |
| p5:60 ↔ p8:61 | 4,7 | `R EO P NG EO P O I` ↔ `R EO P NG U P O TH` |
| p17:128 ↔ p46:101 | 1,5 | `AE G IA J I O R TH` ↔ `AE A IA J I A R TH` |
| **p43:272 ↔ p52:104** | 2,6 | `J T EA U G TH Y TH` ↔ `J T C U G TH F TH` |
| p27:26 ↔ p55:68 | 0,1 | `B F D J U B E I` ↔ `C X D J U B E I` |

The **p43:272** occurrence extends from the last two runes on p43 into the first six on p44. It was missed by a page-confined scan and is the reason whole-book treatment matters. The last row is an extension of the established exact `D-J-U-B-E-I` bookend, not a distinct newly decrypted phrase. The first two rows overlap each other heavily, so five hit windows do **not** mean five independent motif families.

## Operational decision

There is **no original 9-rune span differing at only two sites**, **no original 11-rune span differing at only three sites**, and **no original 15-rune span differing at only four sites**, across the entire rune stream. Thus a proposal that the book secretly repeats a substantial exact ciphertext phrase with just a few *substitutions* has no source support in these ranges. The isolated eight-rune echoes are about the random baseline and select no readable message, reuse period or key.

This is a **bounded exclusion for aligned substitution edits**, not for an inserted/deleted rune, a shifted key schedule, affine rebasing, reused plaintext under different pads, unequal window lengths, or any other untested cipher relation. Those need independently motivated source operations. This result keeps the unique bookend motif available without extrapolating it into a broad sparse-correction mechanism.

**Reproduction:** [single-file CommonJS SFT](../sims/lp2_wholebook_near_repeat_original_sft.cjs) reads [the canonical unchanged GP29 pages](../resources/liber-primus/lp2-corpus.json), checks all six exact original hit counts, prints each site and symbol difference, and recovers a planted 15-rune, four-substitution positive exactly. It completed successfully in [Windows Node22 workflow run 43768096508](https://github.com/FlareZ123/liber-primus/actions/runs/43768096508). No unknown LP2 plaintext or author-authenticated key was recovered.

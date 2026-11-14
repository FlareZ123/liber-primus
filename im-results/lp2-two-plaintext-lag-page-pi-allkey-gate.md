# 55 independently keyed page alphabets: exact two-lag GP29 source invariant

**Agent14, 14 November 2026. Conditional original-source GP-English exclusion for Director [#844](https://github.com/FlareZ123/liber-primus/issues/844), with three blind shared-coefficient positive recoveries. No unknown LP2 plaintext, historical key or decoder recovered.**

## Actual hypothesis and why the new clock matters

The existing [nine-image-chapter all-secret gate](lp2-two-plaintext-lag-chapter-pi-allkey-gate.md) rejected independent secret output permutations on nine source-visible chapters, but expressly left a different **per-original-physical-page rekey** model untested. The original has **55 rune-bearing unknown LP2 physical pages**, 12,956 runes, 2,896 whole printed words, 32 genuine words carried across page breaks, and a rune-free p50 original numeric grid. A plaintext-word split at a physical page boundary is *not* assumed. Two cipher headers on each physical page are excluded from the tested feedback statistics (110 positions).

Fix the earlier equation without adjustment:

```text
ΔC[page,i] = (C[page,i] − C[page,i−1]) mod29
ΔC[page,i] = π_page((P[page,i] + a·P[page,i−1] + b·P[page,i−2]) mod29)
                    for every physical page, at i≥2
```

The ordered coefficients **(a,b)** range over all **841** GP29 pairs and are **globally shared** by all 55 pages. Each page's 29-symbol alphabet **π_page** is an arbitrary, independently chosen bijection of all 29 symbols, granting **(29!)⁵⁵** possibilities with no fitting, affine restrictions or guessed alphabets. The first two runes on each page have a separate invertible header; no assumption about how they carry a continued word is needed for the invariant. The equation itself is conjectural, not selected by a printed instruction or a Cicada-signed decoder.

## Derivation and source-frozen test

For any fixed page and coefficients, let `n_c[x]` count ciphertext differences with value x, and `n_p[y]` count the plaintext two-lag values y. A bijection π merely **permutes the 29 histogram bins**. Therefore the two sorted 29-bin vectors must be identical for each physical page **regardless of all 55 secret alphabets**. This is a strict necessary condition under any possible key, and complete histogram equality would still be insufficient to establish the original sequence's decryption.

A quantitative lower bound for a fixed plaintext and feedback pair is **half the total absolute difference of its two sorted histograms** over all pages. This is the fewest transformed-symbol values that must change even if page bijections are selected optimally to align frequencies. Divide this sum by **12,846** tested transitions to obtain the per-page invariant histogram total-variation mismatch; zero is necessary for a true fit.

The original per-page rarest-bin counts total **80** (compared with nine-chapter rarest-bin sum85). In this finer 55-page clock, ordinary source-native GP-English nontrivial-feedback controls can attain rarest-bin sums as low as **83**, so the single rarest-bin statistic is nearly powerless. The **complete 55×29 sorted-bin invariant** is the discriminator. No additional model parameters, page offsets, phase resets or secret page labels are trained.

The controls preserve the **exact original 2,896 whole-word GP lengths, all 12,956 rune slots and all 55 page seams**; their word-length-matched native GP tokens are independently sampled from authentic Shakespeare, Gibran and Emerson textual sources using the established LP1/p57 source orthography, including source-native one-rune ING/IO. Three independently seeded tapes from each source are used, nine total. Every one of the 841 shared coefficient pairs is tested on every tape. The source-original page profiles are frozen in advance.

| Native full-book control | Minimum histogram edits across 841 pairs | Best invariant TV | Best shared (a,b) |
| --- | ---: | ---: | --- |
| Shakespeare 1 | 490 | **0.03814417** | (6,20) |
| Shakespeare 2 | 502 | 0.03907831 | (3,4) |
| Shakespeare 3 | 490 | **0.03814417** | (23,20) |
| Gibran 1 | 508 | 0.03954538 | (24,11) |
| Gibran 2 | 491 | 0.03822201 | (11,14) |
| Gibran 3 | 504 | 0.03923400 | (14,14) |
| Emerson 1 | 498 | 0.03876693 | (19,13) |
| Emerson 2 | 493 | 0.03837771 | (2,1) |
| Emerson 3 | 491 | 0.03822201 | (18,3) |

**All 9×841 original-versus-native complete-profile comparisons fail exact equality**: the best native candidate requires at least **490** edits to its hypothetical 12,846 GP29 two-lag transformed-symbol emissions to match the original per-page histograms after *optimal* unknown output-alphabet relabeling. The unmodified `(a,b)=(0,0)` native control mismatch TV is 0.22614–0.24171, so simply eliminating feedback does not explain the original.

## Three full-length native positive decoders with hidden page permutations

Generate three independently seeded **12,956-rune** genuinely GP-English complete-book plants from the same fixed original word lengths and physical page boundaries. For each plant, draw **55 unrelated secret nonaffine 29-symbol permutations**, use one of three shared pairs **(10,20)**, **(8,7)** or **(13,11)**, and initialize both page header runes with individually invertible public affine mappings. Encrypt all original-layout pages under the declared equation.

The exact 55-page source-profile invariant is recovered on every planted ciphertext without knowing a secret permutation. Crucially, a **blind all-841-coefficient scan** compares only the known native candidate text and its cipher histogram; it uniquely recovers the hidden coefficient pair in **all three independent plants**, without consuming secret π values. The independently supplied full keys then recover **12,956/12,956 plaintext runes** and re-encrypt **12,956/12,956** source ciphertext runes for every plant. Wrong-page secret permutations do not recover the native plants. These test both the invariant's genuine recovery power and the full reversible equations.

The reproducer is [sims/lp2_two_plain_lag_pagepi_allkey_sft.cjs](../sims/lp2_two_plain_lag_pagepi_allkey_sft.cjs) (Node22 CJS, original source-orthography helper, original canonical pages, 9 controls ×841 pairs, 3 positive full books). It passed unmodified in [GitHub Actions run 43570455350](https://github.com/FlareZ123/liber-primus/actions/runs/43570455350).

## Research decision and exact limits

**Retire the model with one shared two-lag coefficient pair and 55 independent secret page output permutations under the calibrated native-GP-English control register.** Granting over 55 independent 29-symbol output alphabets does not reconcile any of the nine full-length native controls with the original ciphertext's complete per-page difference-frequency profiles; the model's planted native books, by contrast, meet the invariant exactly and permit blind shared-pair recovery. This is a stronger key-independent exclusion under a new source-visible reset clock than the earlier nine-chapter test.

A finite language-reference rejection is **not** a universal theorem excluding every imaginable English, Old English, nonlinguistic or cipher-internal text. Page-specific coefficients, cross-page feedback carry instead of per-page headers, stateful substitutions within a page, and other physical encodings remain outside this architecture. No original ciphertext decryption, independently selected cipher or authentic key was found. Following the Director gate, do not continue splitting into finer alphabets or mutating the equation without a *new* original Cicada-visible reason.

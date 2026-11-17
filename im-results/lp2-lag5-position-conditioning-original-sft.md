# Original LP2 lag-five offset gate (17 November 2026)

**Current result.** The known within-word five-back equality excess is confirmed: on 12,956 unknown runes in 2,896 printed words, 104 symbols equal the rune five positions earlier within the same word (36 at j=5, 68 at j≥6). A new line/page-conditioned analysis shows the excess survives both a segment-multiset null and a more conservative endpoint-fixed sensitivity (104 observed versus 80.124 ± 7.383 expected; 5,000-trial upper tail 0.0008). The apparent concentration in chapters 3–4 is not robust to endpoint conditioning (chapter-total heterogeneity p=0.0844). This is a global key-invariant ciphertext feature, not a recovered key or plaintext.

The global 104-count observation and its significance were already established in prior work. The new comparison is offset-aware and split by original physical-page range. The j=5 contrast was selected after exploratory inspection, so the resulting empirical tails below are **descriptive, not pre-registered independent significance claims**.

## Exact source inputs and reproducible experiment

[CommonJS single-file reproducible test](../sims/lp2_lag5_after_sixth_wordsource_sft.cjs) reads `resources/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`, asserts original 2,896-word/12,956-rune totals and exact original five-back counts, and retains the 32 cross-page words. The runeless physical p50 is absent from the text blocks but accounted for in physical-page indices. A crossing word belongs to its starting physical page.

The test uses **3,000 deterministic conditioned Fisher–Yates shuffles** with seed `0x4a3b2c1d` (LCG), rejection-sampling to preserve original adjacent-doublet site indicators. Exactly 441 repeated-rune words of length≥6 can contribute a five-back equality. All other words remain fixed. The native Windows Node.js 22 script needs no packages or file writes.

| Original pages | Five-back stratum | Observed | Conditioned null mean ± SD | Upper-tail Monte Carlo |
|---|---|---:|---:|---:|
| p0–p26 | All | 56 | 38.68 ± 5.77 | 0.0040 |
| p27–p55 | All | 48 | 37.67 ± 5.74 | 0.0467 |
| p0–p26 | First eligible j=5 | 22 | 16.40 ± 3.79 | 0.0966 |
| p27–p55 | First eligible j=5 | 14 | 14.16 ± 3.60 | 0.5605 |
| p0–p26 | j≥6 | 34 | 22.28 ± 4.35 | 0.0083 |
| p27–p55 | j≥6 | 34 | 23.50 ± 4.54 | 0.0193 |
| p0–p26 | Nonterminal | 38 | 22.17 ± 4.54 | 0.0007 |
| p27–p55 | Nonterminal | 29 | 23.71 ± 4.55 | 0.1513 |
| p0–p26 | Word terminal | 18 | 16.51 ± 3.80 | 0.3845 |
| p27–p55 | Word terminal | 19 | 13.96 ± 3.60 | 0.1073 |

Empirical one-sided tails equal `(1 + number of shuffles with count ≥ observed)/3001`. All comparisons share the same original data and many correlated strata. The reported halves are useful consistency checks, not a prospective holdout.

## Line/page-conditioned chapter fingerprint

The [reproducer](../sims/lp2_lag5_chapter_lineconditioned_sft.cjs) classifies each eligible five-rune window by its original geometry. The source transcription uses `/` for line breaks and `%` for physical page boundaries; p50 is runeless and is restored in physical-page numbering. Words crossing pages are assigned to the chapter containing their first rune. The parser asserts the original 2,896 words, 12,956 runes, 55 rune-bearing page blocks, and 104 five-back matches.

Observed matches: **72 same-line, 30 cross-line, 2 cross-page**. Their eligible windows number 1,645, 428, and 32.

Two deterministic 5,000-trial nulls use seed `0x4a3b2c1d`. Both shuffle within each original word-line/page segment and rejection-sample to preserve the full word-level adjacent-equality indicator vector. All 815 words of length at least six are included; immovable words remain fixed and contribute to every draw.

1. **Segment-multiset null:** preserves each segment's rune multiset; segment endpoints may move.
2. **Endpoint-fixed sensitivity:** additionally fixes each segment's first and last rune, shuffling only its interior.

| Category | Observed | Eligible | Segment-multiset null mean ± SD | Tail | Endpoint-fixed null mean ± SD | Tail |
|---|---:|---:|---:|---:|---:|---:|
| sameLine | 72 | 1,645 | 58.546 ± 7.050 | 0.0366 | 55.577 ± 6.686 | 0.0118 |
| crossLine | 30 | 428 | 17.924 ± 3.782 | 0.0018 | 22.978 ± 3.212 | 0.0262 |
| crossPage | 2 | 32 | 0.783 ± 0.793 | 0.1726 | 1.569 ± 0.680 | 0.4665 |
| **All** | **104** | **2,105** | **77.252 ± 8.072** | **0.0014** | **80.124 ± 7.383** | **0.0008** |

The global excess survives both controls. The cross-line excess is smaller after endpoint conditioning but remains elevated; the two cross-page matches do not.

| Chapter | Physical pages | Observed | Segment-multiset null mean | Endpoint-fixed null mean | Endpoint-fixed z |
|---:|---|---:|---:|---:|---:|
| 1 | p0–2 | 7 | 4.157 | 4.464 | 1.453 |
| 2 | p3–7 | 5 | 6.992 | 6.447 | -0.628 |
| 3 | p8–14 | 18 | 10.654 | 12.411 | 1.943 |
| 4 | p15–22 | 18 | 10.918 | 13.520 | 1.657 |
| 5 | p23–26 | 8 | 6.197 | 5.907 | 1.084 |
| 6 | p27–32 | 9 | 8.260 | 7.686 | 0.550 |
| 7 | p33–39 | 13 | 10.379 | 10.194 | 1.006 |
| 8 | p40–53 | 23 | 17.937 | 17.905 | 1.461 |
| 9 | p54–55 | 3 | 1.759 | 1.589 | 1.267 |

Chapter-total heterogeneity is χ²=18.859 (empirical upper tail 0.0276) under the segment-multiset null, but weakens to χ²=15.256 (upper tail 0.0844) when segment endpoints are fixed. The apparent chapter-3/4 concentration is therefore not robust to a reasonable line-edge sensitivity. This statistic does **not** justify splitting LP2 into chapter-specific ciphers.

## Cryptanalytic consequence

The robust conclusion is a **global five-back equality excess** under source-conditioned word/line/page controls. The apparent chapter-3/4 concentration is sensitive to line-segment endpoints and should not be used to infer separate chapter encoders. The two cross-page events are too few to infer a page reset.

A candidate reversible model must predict the global five-back profile and its same-line/cross-line distribution on original geometry; it must not tune its state rule to the observed counts. The statistic alone does not identify a five-back feedback cipher: positional permutation, another stateful encoder, or residual text structure remain possible. No original instruction selects a specific operation. Future serious testing requires an explicit source-derived key and clock, source-native solved controls, a complete reversible encoder, held-out original ciphertext yielding ≥150 runes of coherent plaintext, and exact forward reconstruction. **All unknown LP2 pages remain unsolved.**

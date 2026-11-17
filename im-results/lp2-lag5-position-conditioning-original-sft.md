# Original LP2 lag-five offset gate (17 November 2026)

**Result.** The known within-word five-back equality excess has a newly resolved position dependence. On 12,956 unchanged unknown runes in 2,896 original printed words, 104 symbols equal the rune five positions earlier within the same word. **36** occur at the first eligible offset (zero-based j=5, sixth rune); **68** occur at j≥6. Under a null that shuffles rune order within each printed word while preserving **both its rune inventory and the exact position of every adjacent equal-rune pair**, expected counts are about **30.56 and 45.78** respectively. This is a possible constraint on a future lossless inverse, not a recovered key or plaintext.

The global 104-count observation and its significance were already established in prior work. The new comparison is offset-aware and split by original physical-page range. The j=5 contrast was selected after exploratory inspection, so the resulting empirical tails below are **descriptive, not pre-registered independent significance claims**.

## Exact source inputs and reproducible experiment

[CommonJS single-file reproducible test](../sims/lp2_lag5_after_sixth_wordsource_sft.cjs) reads the repository's `resources/liber-primus/lp2-transcription.txt` and `lp2-corpus.json`, asserts original 2,896-word/12,956-rune totals and exact original five-back counts, and retains the 32 cross-page words. The runeless physical p50 is absent from the text blocks but accounted for in physical-page indices. A crossing word belongs to its starting physical page.

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

## Cryptanalytic consequence

A candidate word-local five-step cipher should **predict** the first-eligible versus later-position profile on original geometry instead of fitting its state rule to these counts. A delayed initializer or word-final checksum is an imaginable explanation, but an unrelated plaintext/register effect or conditional-null imperfection is also possible. No original instruction selects either operation. Future serious testing requires an explicit source-derived key and clock, source-native solved controls, a complete reversible encoder, held-out original ciphertext yielding ≥150 runes of coherent plaintext, and exact forward reconstruction. **All unknown LP2 pages remain unsolved.**

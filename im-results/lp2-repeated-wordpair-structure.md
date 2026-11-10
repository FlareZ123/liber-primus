# A genuine repeated LP2 two-word ciphertext phrase: section-constrained evidence

**Measured 2026-11-10. Evidence type: exploratory structural anomaly, not a decoded plaintext or key.**

The false seven-rune repeat [has been corrected](lp2-sevengram-boundary-correction.md): its final rune was borrowed from the solved AN END page. However, the true **six-rune** duplication has a stronger *word-boundary property* worth preserving: two exact 3-rune words repeat as one intact **ordered pair**, and the pair occurs twice across widely separated cipher sections.

## Exact, unedited observation

The committed transcription `resources/lp2-transcription.txt` contains 12,956 unsolved runes and 2,896 words. Physical page and printed line breaks are joined before word tokenization. There are eight nonempty `$`-delimited unsolved sections with lengths 158, 255, 385, 435, 224, 326, 378, 735 words.

The two words `ᛞᛄᚢ` and `ᛒᛖᛁ` occur **exactly twice each**, together as the word bigram **`ᛞᛄᚢ-ᛒᛖᛁ`** both times:

- Section 5 (zero-based), word index 5, in LP2 page 27 near the beginning of that section.
- Section 7, word index 733, in LP2 page 54, the final two words of unresolved ciphertext.

Over all 2,896 actual words and all eligible adjacent within-section two-word positions, **this is the sole repeated ordered two-word type of *any* length**. In particular, the six matching runes are authentic and the lexical boundaries are both `3|3`. The preceding assertion about the seventh rune remains false.

## Matched section-local permutation test

To measure how exceptional the *pairing*, rather than just repeated individual words, is, `sims/lp2_repeated_wordpair_probe.cjs` shuffles whole ciphertext words **only among slots of the same word length inside the same of eight sections**. Each shuffle preserves:

- Every ciphertext rune within every word, including the exact two copies of each of the target words.
- Every section's complete inventory of whole words, word lengths, and total size.
- Every position's actual word length, as well as all section boundaries.
- The exact model-free statistic: maximum *combined rune length* over **any** ordered two-word type that occurs twice or more.

Twenty thousand deterministic Fisher–Yates replicates, seeded with `0x33012321`, yielded:

| Statistic | Actual | Null outcome |
|---|---:|---:|
| Longest duplicated ordered word pair (combined runes) | **6** | 4 of 20,000 nulls reached 6 |
| Number of distinct duplicated ordered word pairs with ≥6 runes | **1** | 4 of 20,000 nulls reached 1 |
| Empirical one-sided p, plus-one correction | | **5/20,001 = 0.0002499875** |

Full distribution of the *maximum* repeated pair length in the 20,000 shuffles: **0:19,759, 3:145, 4:69, 5:23, 6:4**. The maximum-over-*all* pair identities/lengths within this family is used, so the reported p-value does not pretend the particular pair was specified before examination. A planted repeated phrase can be checked with the reusable `score` export; it is deterministic and needs no tuned threshold.

The CI workflow `.github/workflows/lp2-repeated-wordpair-null.yml` ran successfully as [GitHub Actions run 42754138148](https://github.com/FlareZ123/liber-primus/actions/runs/42754138148).

## What this establishes and what it does not

**Established:** There is a peculiar exact duplication of an adjacent 3-rune + 3-rune ciphertext word pair near a section opening and at the end of the cipher. Given these same visible words and lengths, random section-local ordering yields an equally long repeated adjacent word pair in only 4/20,000 simulations.

**Limits:** The word arrangement is inherited from the author's manuscript and has other structured constraints. The null deliberately allows adjacent repeated-rune word endpoints that the ciphertext's anti-doublet process suppresses. A content-generating encryption mechanism may produce repeated words or pairs for reasons outside this shuffle null. This is one exploratory family after extensive other investigations, with no global search correction; its p-value does not establish a Cicada-intended clue, plaintext equality, cipher reuse or a key. In particular, it must **not be used to promote the invalid seventh-rune crib**.

**Cryptanalytic next step:** Treat the six runes as a potential repeated ciphertext phrase occurring at a section opening and at book end. Compare candidate generators' probability of repeating both full ciphertext words under identical versus independent plaintext contexts, with stringent controls for cipher anti-repeat and word boundary layout. Require a recoverable key or a held-out plaintext prediction before interpreting them.

Reproduce: run `node sims/lp2_repeated_wordpair_probe.cjs resources/lp2-transcription.txt 20000`. The program asserts 2,896 words, eight sections and the exact unique bigram before doing Monte Carlo; its source and every input are committed.

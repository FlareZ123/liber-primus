# A genuine repeated LP2 two-word ciphertext phrase: section-constrained evidence

**Measured 2026-11-10. Evidence type: exploratory structural anomaly, not a decoded plaintext or key.**

The false seven-rune repeat [has been corrected](lp2-sevengram-boundary-correction.md): its final rune was borrowed from the solved AN END page. However, the true **six-rune** duplication has a stronger *word-boundary property* worth preserving: two exact 3-rune words repeat as one intact **ordered pair**, and the pair occurs twice across widely separated cipher sections.

## Exact, unedited observation

The committed transcription `resources/lp2-transcription.txt` contains 12,956 unsolved runes and 2,896 words. Physical page and printed line breaks are joined before word tokenization. There are eight nonempty `$`-delimited unsolved sections with lengths 158, 255, 385, 435, 224, 326, 378, 735 words.

The two words `ᛞᛄᚢ` and `ᛒᛖᛁ` occur **exactly twice each**, together as the word bigram **`ᛞᛄᚢ-ᛒᛖᛁ`** both times:

- Section 5 (zero-based), word index 5, in physical LP2 page 27 (original scan 44.jpg) near the beginning of that section.
- Section 7, word index 733, in physical LP2 page **55** (original scan **72.jpg**), the final two words of unresolved ciphertext. This is zero-based rune-bearing transcription **segment 54**; the printed number-only page 50 has no rune segment.

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

## Sensitivity to **physical page** placement

The section-level null above permits words to move between physical pages within the same section. The last unresolved physical page **55** (rune-bearing transcript segment 54, archive 72.jpg) actually contains only **16 whole word starts and two 3-rune words**, in consecutive final positions. Thus its pair remains together after shuffling within page and word length; only its *orientation* changes. The earlier copy is on physical page 27 (44.jpg), whose **52 word starts include 13 three-rune words**, with **four adjacent 3+3 slots**.

This gives an exact finite **page-and-length-preserving** target-pair recurrence probability:

\[
\Pr(\text{ordered pair matches on both pages})
=\frac{4}{13\cdot12}
=\frac1{39}
\approx 0.025641.
\]

The final page's two unique 3-rune tokens are randomly reversed with probability 1/2. The earlier page's two copies can occupy any of 13×12 ordered distinct 3-rune slots; four adjacent ordered slot choices match for each final orientation. This exact calculation *conditions on the two already discovered word types and their page allocation*. It does not correct all earlier exploratory selection.

More conservatively, the same finite **maximum over every repeated two-word identity and every length** used in the original 20,000 section-null test was recalculated after shuffling words *within their own physical source page and exact rune length* (seed 0x05e27111, **20,000** samples). There were **491/20,000** simulated books with at least one repeated pair of combined rune length ≥6, for an add-one p of **492/20,001 = 0.0245988**. Exactly **491** also repeated a two-word pair ending at the final word position. Another **200** simulations had repetitions of shorter pairs only. This page-local familywise result matches the target-specific combinatorial probability to sampling precision.

This **does not contradict** the original section-local p=0.00024999 or the separate rune-stream-generator p=0.00010; the null models condition on different source-page information. It demonstrates that **physical page layout is a major contributor** to the duplicate's apparent significance. The more stringent page-stratified control must be part of any claim that a deliberately copied cryptographic marker has been established. Source: [page-conditioned exact test](../sims/bookend_page_conditional_null.cjs); successful manual [CI 42766017212](https://github.com/FlareZ123/liber-primus/actions/runs/42766017212).

---

## Second independent null: source-like random cipher with exactly 86 suppressed-doublet exceptions

The word-reordering null deliberately scrambles ciphertext word endpoints. A genuinely random cipher might instead preserve the observed low rate of equal adjacent runes. We therefore ran a different generator with the **actual eight sections, all 2,896 word-length slots, empirical 29-rune symbol frequencies (in expectation), and exactly 86 adjacent identical-rune pairs among 12,948 within-section eligible positions**. For each synthetic book, the positions of those 86 repeats were sampled uniformly without replacement, non-repeat positions were filled from the source's measured rune marginals conditional on differing from the preceding symbol, and the same *maximum duplicated two-word combined rune length* statistic was recomputed across all candidate bigrams.

Thirty thousand deterministic books, RNG seed `0x3a19f23b`, gave the following empirical family-maximum null outcomes:

| Test | Observed | Null replicate count at least as extreme | Plus-one upper-tail p |
|---|---:|---:|---:|
| Exact duplicated two-word phrase of total length ≥6 | 1 | **2 / 30,000** | **3/30,001 = 0.0000999967** |

The null's maxima were at least length3 in 449 runs, at least length4 in 135, at least length5 in 34, and at least length6 in 2. Every synthetic book **exactly reproduced the observed 86 doublets**, ruling out the simplest concern that the unusual pairing is just the side effect of uniform random letters containing too many immediate repeats. The sampler matches marginal frequencies statistically, rather than fixing every glyph count exactly, and imposes no plaintext syntax or key schedule.

Implementation: [`sims/lp2_repeated_wordpair_markov_null.cjs`](../sims/lp2_repeated_wordpair_markov_null.cjs), a separate generator reusing only the already fixed observable bigram statistic. It completed successfully in [GitHub Actions 42754988338](https://github.com/FlareZ123/liber-primus/actions/runs/42754988338).

## Physical image association, descriptive only

The first copy is on original page image [`resources/liber-primus/44.jpg`](../resources/liber-primus/44.jpg), headed by a **single wing illustration**. The final copy is on [`resources/liber-primus/72.jpg`](../resources/liber-primus/72.jpg), directly before a red dot ornament on the final line, above a large **winged-insect illustration** and pale branching tree. These are genuine source-image features and form an evocative visual parallel, but the pictures and repeated phrase were inspected after the sequence was found. This observation has no independently calibrated probability and establishes no decoded meaning.

## What this establishes and what it does not

**Established:** There is a peculiar exact duplication of an adjacent 3-rune + 3-rune ciphertext word pair near a section opening and at the end of the cipher on **physical LP2 page 55**, not original page 54 (a source-segment numbering ambiguity). Given these same visible words and lengths, random section-local ordering yields an equally long repeated adjacent word pair in only 4/20,000 simulations.

**Limits:** The word arrangement is inherited from the author's manuscript and has other structured constraints. Its page composition is crucial: preserving original physical pages raises the chance of some duplicated six-rune ordered pair from around 0.00025 to about **0.025** under the documented two shuffle mechanisms. The section-level null deliberately allows adjacent repeated-rune word endpoints that the ciphertext's anti-doublet process suppresses. A content-generating encryption mechanism may produce repeated words or pairs for reasons outside this shuffle null. This is one exploratory family after extensive other investigations, with no global search correction; its p-value does not establish a Cicada-intended clue, plaintext equality, cipher reuse or a key. In particular, it must **not be used to promote the invalid seventh-rune crib**.

**Cryptanalytic next step:** Treat the six runes as a potential repeated ciphertext phrase occurring at a section opening and at book end. Compare candidate generators' probability of repeating both full ciphertext words under identical versus independent plaintext contexts, with stringent controls for cipher anti-repeat and word boundary layout. Require a recoverable key or a held-out plaintext prediction before interpreting them.

Reproduce: run `node sims/lp2_repeated_wordpair_probe.cjs resources/lp2-transcription.txt 20000`. The program asserts 2,896 words, eight sections and the exact unique bigram before doing Monte Carlo; its source and every input are committed.

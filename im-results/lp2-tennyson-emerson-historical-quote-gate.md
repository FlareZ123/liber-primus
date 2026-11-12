# Source-selected Tennyson and Emerson quotation test (Director #635)

**Decision (12 November 2026):** Neither independently preselected version of Tennyson's *The Lady of Shalott* matches an original LP2 long quotation for twelve consecutive printed GP word lengths, and Emerson's *Essays, First Series* had already been exhaustively tested across all 2,896 original unsolved words with a maximum of nine. No unknown LP2 plaintext, historical cipher key, or original-cipher inverse is recovered. This closes only the **verbatim source reuse with original printed word boundaries** route for these witnesses.

## Why these two texts

*The Lady of Shalott* is tied to the original 2012 Cicada "second chance" Waterhouse image. The 2012 second-chance book code itself is widely documented as using Blake's *Marriage of Heaven and Hell*, so **the image's literary subject must not be promoted to proof that Tennyson's poem was the historical book-code key**. Tennyson is nevertheless a concrete, pre-LP2, author-associated candidate, rather than an arbitrary corpus after rune scoring. Emerson's *Self-Reliance* is in the original 2014 literary material, and the surviving [Gutenberg Essays First Series edition](../resources/control/emerson_essays_2944.txt) already received a complete whole-book screen in [the independent GP word-length census](lp2-wordlength-literary-crib-census.md). That scan's original maximum was nine in **both** ING normalization conventions, so no 12/13/14/34-word original quote can be intact in that exact edition. Do not repeat the full-source Emerson computation.

The two Tennyson source editions are separately frozen **before** testing the original quotation tapes:

| Source | Exact immutable witness | Words |
| --- | --- | ---: |
| Tennyson, 1832/1833 original poem | [Complete 1832 witness](https://github.com/kjhealy/mptc/blob/6e784a2f90d22b0735a63417bda513349d5be416/files/examples/shalott_1832.txt), Git blob `2856e7777a09d306a7bbd53051a41579fe6aed82`; [local source copy](../resources/external/tennyson-lady-of-shalott-1832-mptc.txt) | 1,052 |
| Tennyson, standard revised 1842 text | [Early Poems, Project Gutenberg 8601](https://github.com/GITenberg/The-Early-Poems-of-Alfred-Lord-Tennyson_8601/blob/master/8601.txt), Git blob `f8b91a01e538f0d5c6400a4da728a27a46b4aff7`, poem body `[135593,141652)`; [local body copy](../resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt) | 1,003 |

Their version differences are significant, so collapsing them into a single unlabelled Tennyson source would be a defective test. The 1832 version and 1842 revision are also independently displayed by the [University of Toronto's Representative Poetry Online](https://rpo.library.utoronto.ca/).

## Original frozen test

The [runnable standalone source-locked SFT](../sims/lp2_tennyson_quote_source_sft.cjs) reads the canonical LP2 runic transcription, derives **2,896 original printed words/12,956 runes**, preserves page/line carry, and verifies all seven preannotated quotation intervals against their original rune SHA-256 hashes. Their exact original word counts are **[4,5,2,14,13,34,14]** (405 total runes). The two source versions are normalized under both GP English conventions with and without ING contraction. The test also accepts and locates a planted 34-word source passage, includes a fixed wrong-order shuffle, and leaves every original rune and printed word boundary unchanged.

### Results

| Original quotation index | Printed words / runes | Tennyson 1832 longest contiguous lengths (ING / no ING) | Tennyson 1842 longest contiguous lengths |
| ---: | ---: | ---: | ---: |
| 0 (pp6–7) | 4 / 18 | 3 / 3 | 3 |
| 1 (p22) | 5 / 19 | 3 / 3 | 3 |
| 2 (p40) | 2 / 12 | 2 / 2; five exact short placements | 2; three exact short placements |
| 3 (p40) | 14 / 58 | 5 / 5 | 4 |
| 4 (p42) | 13 / 68 | 4 / 3 | 4 |
| 5 (pp42–43) | 34 / 160 | 5 / 5 | 5 |
| 6 (p53) | 14 / 70 | 5 / 5 | 4 |

**Complete long quote matches: 0** across either edition, either GP convention, and all four original 13+ word quotations. In the 1832 edition the largest partial match occupies only **21 original GP runes** (five words); the 1842 maximum is **19**. The five-word match in p42–43's 34-word span begins inside the span, not at a quote boundary, and has no justified original-cipher equation. The 1842 fixed shuffled source obtains **eight** matching internal words at that same long quotation, underlining how weak postselected subthreshold partials are.

No candidate even approaches the prospectively specified **twelve consecutive words and 40 true original GP runes**. Consequently no original punctuation-profile test, substitution-key fit, re-encipherment or adjacent-page prediction is authorized. This is an exact-source decision and is **not** a general exclusion of Tennyson themes, all textual editions, paraphrases, hidden-word boundaries or other ciphers.

## Reproduction and research consequence

Run `node sims/lp2_tennyson_quote_source_sft.cjs` in the repository root. The source files, original LP2 inputs, hashes, matched positions, wrong-order control and source-native planted-positive test are included. The existing Emerson [whole-book SFT](../sims/lp2_wordlength_literary_crib_sft.cjs) independently explains and reproduces its nine-word maximum.

**Retire direct quotation reuse from these exact original-source editions.** A new literary key investigation needs a printed selector of an operation, coordinates or a different source-native signal before numerical fitting to the unknown GP text.
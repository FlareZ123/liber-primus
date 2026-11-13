# Original printed-word-length crib search against independent historical sources

**Agent22 / Agent11 / Agent13, 12–13 November 2026.** Source-fingerprint reconnaissance, not recovered plaintext. The complete unsolved original LP2 printed word clock has **2,896 words** and **12,956 GP29 runes** on physical pp0–49 and 51–55. A passage copied verbatim from another text with *preserved word boundaries* should share a long sequence of GP-normalized printed word lengths; a genuine long match could supply an independently selected plaintext crib for the original cipher.

## Source normalization and positive control

The [reproducer](../sims/lp2_wordlength_source_match_sft.cjs) reads the canonical original LP2 runic transcription, treating printed line/page separators as transparent to continued words and punctuation as boundaries. Every extracted rune matches the canonical indices. English candidate words are split on ASCII letters; V→U, K/Q→C, Z→S, ING→NG, and the seven GP digraphs TH/EO/NG/OE/AE/IA/EA reduce their rune lengths. No guessed cipher transform participates in matching.

The independently solved LP2 p57 PARABLE preserves **20 of 20** original word lengths under this convention, including 14-rune CIRCUMFERENCES. Planting its length sequence into an otherwise unknown-page word tape yields a detected 20-word match. The positive control establishes that exact source copying in this style is discoverable.

## Original-input source tests

The deterministic scanner hashes each original eight-word window and extends every exact match. Longest runs below eight are reported as <8; no result below is a recovered crib.

| Fixed candidate source | GP words | Matching eight-word windows | Longest exact run |
| --- | ---: | ---: | ---: |
| Shakespeare, first 300k characters | 55,407 | 35 | 9 |
| Gibran, *The Prophet* | 15,733 | 19 | 9 |
| Emerson, *Essays: First Series* | 77,932 | 25 | 9 |
| Blake, *A Song of Liberty* excerpt | 479 | 0 | <8 |
| Blake, full *The Marriage of Heaven and Hell* | 7,778 | 3 | 8 |
| **Mabinogion, *The Lady of the Fountain* (2012 book-code source chapter, PG5160)** | **10,395** | **12** | **9** |
| **Mabinogion story section (PG5160 chars 16,953–587,423)** | **105,582** | **124** | **11*** |
| Solved LP1/LP2 reference | 942 | 0 | <8 |
| Latin Vulgate NT GP-normalized words | 39,835 | 7 | 9 |
| Old English *Beowulf* GP-normalized words | 10,885 | 4 | 8 |
| **Crowley, *Liber AL vel Legis*, 2013 book code chapter I** | **1,897** | **0** | **<8** |
| **Crowley, chapter II** | **1,968** | **4** | **8** |
| **Crowley, chapter III** | **2,002** | **1** | **8** |
| **William Gibson, *Agrippa* (2012 QR book code)** | **1,682** | **1** | **8** |

The [Gibson *Agrippa* GP word-length profile](../resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json) is derived from a [2013 historical book-code solver source](https://github.com/trizen/experimental-projects/blob/48f253984918d3ec5a2559ed2124da98c0c14384/cicada-3301/book-code.py), pinned by Git blob SHA `a4e13bdcbfa64be9c087e092b51f028126f51cb3`. The complete poem text is not redistributed. Its single exact eight-word length match is LP2 words 2583–2590 against poem words 773–780; it supplies no credible crib. The archived solver's line:character readout differs from a separately reconstructed 2011 historical web edition, so this scan only claims the archived poem's word order, not a unique original page layout.

The 2013 Crowley comparison uses independent archived [chapter I](https://github.com/neuroretransmit/cicada/blob/main/2013/001-232.jpg/book-of-the-law-I.txt), [II](https://github.com/neuroretransmit/cicada/blob/main/2013/001-232.jpg/book-of-the-law-II.txt), and [III](https://github.com/neuroretransmit/cicada/blob/main/2013/001-232.jpg/book-of-the-law-III.txt), whose original Git blob SHAs are pinned in the [derived full three-chapter GP word-length profiles](../resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json). Verse numerals do not generate words. Exact GP-normalized source sequence is preserved separately for each chapter; the experiment deliberately makes no cross-chapter window.

For example, Crowley chapter II source words 181–188 (zero-based) read “pure joy that all the sorrows are but” and match unknown LP2 original words 314–321 in *length only*. The initial phrase is far shorter than the successful 20-word solved control and needs a full original-cipher inversion before it can serve as a real crib.

**Historical source distinction.** The first 2012 book-code stage used *The Mabinogion*; the **2012 second-chance stage** used a Cicada-provided *Marriage of Heaven and Hell* image as the book-code text ([archived explanation](https://uncovering-cicada.fandom.com/wiki/The_second_chance_%282012%29)). The full [Gutenberg Blake #45315](../resources/external/cicada2012-blake-marriage-gutenberg45315.txt) contains that work but is **not the original cropped, line-numbered image** for reproducing its historical book code; it is a candidate full-book crib donor. Crowley's *Book of the Law* was the independently documented 2013 book-code source. The scan does not imply any of these book codes specifies an LP2 cipher.

A second, independent GP29 English word-length normalization has now been applied to the historically selected 2012 source. It uses [Project Gutenberg eBook #5160](https://www.gutenberg.org/ebooks/5160), Lady Charlotte Guest's *The Mabinogion*, pinned to [GITenberg commit `86b1521ce54ddae3caaa235a6fb04a9ae67f2370`](https://github.com/GITenberg/The-Mabinogion_5160/blob/86b1521ce54ddae3caaa235a6fb04a9ae67f2370/5160-0.txt), blob `fd9db1c7bc90e11d41433b7cc2ec3b7e1ccb0cd7`. To match the earlier source selection in [the existing 2012 book-code profile](../resources/derived/2012-bookcode-gp-wordlengths.json), the story section is characters 16,953–587,423; its first 10,395 words are *The Lady of the Fountain*. The new profile is a second normalization, not a new edition or first-ever Mabinogion screen. The derived word-length profile and null reproducer are retained at [profile](../resources/external/cicada2012-mabinogion-gutenberg5160-gp-wordlengths.json) and [SFT](../sims/lp2_mabinogion_wordlength_gate.cjs); the earlier A–Z/longest-match screen remains reproducible at [its SFT](../sims/lp2_2012_bookcode_wordlength_sft.cjs).

## Result and constraints

**No source-specific ten-word crib is supported by the 14 pinned profiles.** The historically selected Mabinogion story section has 124 matching eight-word windows and a longest run of 11; its specific *Lady of the Fountain* chapter has 12 such windows and a longest run of nine, with page-local maximum also nine. The 11-word story-section run is not discriminating: 250 Fisher–Yates shuffles of its word-length sequence (xorshift32 seed `0x3301`) have median longest run 10, 95th percentile 12, maximum 14, and 78/250 at least 11. This is a null calibration of the same 11/9 maxima already found under the earlier, distinct A–Z/longest-match 2012 book-code profile, not a new source discovery. The authenticated 2013 Crowley chapters still max at eight. This excludes only preserved-boundary, verbatim source spans under the exact normalizations, editions and corpus windows tested. It does not rule out shorter quotations, different editions, reordered words, paraphrases, independently generated plaintext, other languages, or letter-changing algorithms that alter word lengths.

The script asserts all input and result counts, the independent solved-page control, and planted matching. The useful next decision is a new source-grounded **long** exact crib or a reversible original-data cipher operator. Neither is supplied by this experiment. No unknown LP2 plaintext/key has been recovered.

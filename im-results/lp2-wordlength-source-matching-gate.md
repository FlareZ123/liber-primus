# Original printed-word-length crib search against independent historical sources

**Agent22 / Agent11, 12 November 2026.** Source-fingerprint reconnaissance, not recovered plaintext. The complete unsolved original LP2 printed word clock has **2,896 words** and **12,956 GP29 runes** on physical pp0–49 and 51–55. A passage copied verbatim from another text with *preserved word boundaries* should share a long sequence of GP-normalized printed word lengths; a genuine long match could supply an independently selected plaintext crib for the original cipher.

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
| Solved LP1/LP2 reference | 942 | 0 | <8 |
| Latin Vulgate NT GP-normalized words | 39,835 | 7 | 9 |
| Old English *Beowulf* GP-normalized words | 10,885 | 4 | 8 |
| **Crowley, *Liber AL vel Legis*, 2013 book code chapter I** | **1,897** | **0** | **<8** |
| **Crowley, chapter II** | **1,968** | **4** | **8** |
| **Crowley, chapter III** | **2,002** | **1** | **8** |

The 2013 Crowley comparison uses independent archived [chapter I](https://github.com/neuroretransmit/cicada/blob/main/2013/001-232.jpg/book-of-the-law-I.txt), [II](https://github.com/neuroretransmit/cicada/blob/main/2013/001-232.jpg/book-of-the-law-II.txt), and [III](https://github.com/neuroretransmit/cicada/blob/main/2013/001-232.jpg/book-of-the-law-III.txt), whose original Git blob SHAs are pinned in the [derived full three-chapter GP word-length profiles](../resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json). Verse numerals do not generate words. Exact GP-normalized source sequence is preserved separately for each chapter; the experiment deliberately makes no cross-chapter window.

For example, Crowley chapter II source words 181–188 (zero-based) read “pure joy that all the sorrows are but” and match unknown LP2 original words 314–321 in *length only*. The initial phrase is far shorter than the successful 20-word solved control and needs a full original-cipher inversion before it can serve as a real crib.

**Historical source distinction.** The first 2012 book-code stage used *The Mabinogion*; the **2012 second-chance stage** used a Cicada-provided *Marriage of Heaven and Hell* image as the book-code text ([archived explanation](https://uncovering-cicada.fandom.com/wiki/The_second_chance_%282012%29)). The full [Gutenberg Blake #45315](../resources/external/cicada2012-blake-marriage-gutenberg45315.txt) contains that work but is **not the original cropped, line-numbered image** for reproducing its historical book code; it is a candidate full-book crib donor. Crowley's *Book of the Law* was the independently documented 2013 book-code source. The scan does not imply any of these book codes specifies an LP2 cipher.

## Result and constraints

**None of these eleven pinned text records contains a ten-word exact GP-length profile matching the unknown LP2 tape.** For the historically authenticated Crowley source, the longest is eight words, indistinguishable at present from short accidental matches. This excludes only preserved-boundary, verbatim source spans of ten or more words under the exact normalization, editions and corpus windows tested. It does not rule out shorter quotations, different editions, reordered words, paraphrases, independently generated plaintext, other languages, or letter-changing algorithms that alter word lengths.

The script asserts all input and result counts, the independent solved-page control, and planted matching. The useful next decision is a new source-grounded **long** exact crib or a reversible original-data cipher operator. Neither is supplied by this experiment. No unknown LP2 plaintext/key has been recovered.

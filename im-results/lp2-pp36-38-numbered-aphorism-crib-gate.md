# LP2 pp36–38 numbered paragraphs: historical aphorism crib gate

**Original-input, bounded negative, Agent20, 13 November 2026.** The five red-numbered passages on physical pp36–38 are not verbatim, GP29-word-length-preserving passages of any of the eight frozen source files screened below. Their longest local exact alignments are 6–8 words. There is **no source-selected original plaintext, cipher operation, authentic key, or destination** in this result.

## Human route and source-independent constraint

The black body of the manuscript's red-numbered 1–5 passage contains exactly five distinct paragraphs across physical pages 36, 37, and 38. Independently verified by original line/page segmentation, their GP-rune lengths are **139, 91, 98, 96, 129** (total **553**), and their printed word counts **30, 20, 25, 19, 28** (total **122**). Each paragraph has its own printed starting numeral, and p4 runs across the p37→38 page boundary. Their within-paragraph full-stop counts are **[1, 1, 1, 2, 2]**; the length-only matcher deliberately ignores these restrictive punctuation constraints.

The [original transcript](../resources/liber-primus/lp2-transcription.txt) fixes the five exact ordered word-length fingerprints before any plaintext source is compared:

- p1 (30): 4,3,8,2,5,3,3,7,3,5,4,2,5,8,5,3,5,6,6,3,2,11,8,3,8,3,2,3,4,5
- p2 (20): 4,4,6,4,10,4,7,6,5,2,4,3,3,5,4,4,2,9,3,2
- p3 (25): 3,4,4,2,5,3,6,2,3,2,3,1,2,3,3,6,3,4,9,4,8,3,8,4,3
- p4 (19): 7,9,7,2,3,2,5,4,6,6,2,4,10,3,4,3,11,5,3
- p5 (28): 6,4,7,1,6,3,5,3,9,2,3,3,2,5,4,9,4,3,7,12,8,3,3,2,5,3,5,2

A plausible *but unproven* historical-literature hypothesis is that the unusual five-item didactic presentation copies a sequence of numbered philosophical maxims. The four independently published pre-2014 English translations of Epictetus's *Enchiridion* provide a source family chosen for that reason; Crossley's *Golden Sayings of Epictetus* and Giles's 1910 *Art of War* are two separately numbered didactic works. A more literal source-conditioned alternative comes from the **Babylonian-style numerals preceding the numbered text on physical pp33–39**. That artwork suggests trying a numbered ancient Babylonian law code, so the full 1903 C. H. W. Johns translation of the *Code of Hammurabi* (Project Gutenberg #17150, posted 2005) was added as a distinct literary-source test. The visual numerals are already understood as 1033/3301; they do not spell Hammurabi or designate a law number. This is a motivated exploratory selection, **not an authenticated indication from Cicada to consult those books**.

## Corrected physical-page carry and exact source-crib rerun (Agent26, 22 November 2026)

The original test's 19-word fourth paragraph fingerprint was previously printed with **7** at ordinal9 and total **97** despite the independently documented **96 GP runes**. The raw p37 last line ends at an explicit word separator and physical-line slash; p38 begins with the six-rune word `ᚢᚫᚳᛇᚳᚣ`. The old `originalParagraphs` parser removed only `"/\\n"` sequences, leaving a stray terminal `"/"` at the p37→p38 seam when joining the two physical-page chunks. This inflated that p38 word's length by one and caused an immediate internal assertion failure **before any external literary-source search**. The original literal runes and image are unchanged.

The corrected parser strips slash line-wrap marks and newlines **independently**, asserts that every token is rune-only, and pins p4 ordinal9 to **6**. Corrected item lengths are **139/91/98/96/129** as originally stated, all 553 runes accounted for. A complete independent GitHub-source API rerun read **all eight exactly pinned source blobs** (the original SHA-1 hashes were identical) and re-executed the six-word seed and maximal bidirectional extension on the corrected targets. Source word totals remain 7,457 / 6,696 / 8,160 / 7,391 / 13,934 / 26,815 / 57,591 / 19,870 = **147,914**. Longest match lengths remain **7 / 7 / 7 / 6 / 7 / 7 / 8 / 7**, respectively. The winner in Giles's `Art of War` matches eight words at numbered item3, independent of the corrected paragraph4. **No 12-consecutive-word/40-GP-rune** qualifying historical quote is recovered. These precise values replace the previously *unexecutably asserted* source count and fingerprint; they do not imply a source-selected cipher.

The corrected self-check now rejects future punctuation/line-wrap leakage at original source boundaries. [Read-only single-file source SFT](../sims/lp2_pp36_38_numbered_aphorism_crib_sft.cjs) retains the same eight fixed historical editions and unchanged maximal-match decision. No new lexical source or post-hoc target choice was introduced.

## Exact original test

Read words as maximal ASCII A–Z spans and count GP symbols using greedy `ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]`, matching the established corpus-wide crib convention. Form all six-word fingerprints for each of the five original paragraphs, search all source text positions, and extend every hit maximally in both directions. This generous **length-only** test ignores punctuation restrictions, so any literal source preserving both word lengths and punctuation would also have to pass the length test.

| Source edition / translator | Source words | Longest local match |
| --- | ---: | ---: |
| *Enchiridion*, Elizabeth Carter | 7,457 | 7 |
| *Enchiridion*, T. W. Higginson | 6,696 | 7 |
| *Enchiridion*, George Long | 8,160 | 7 |
| *Enchiridion*, Percy E. Matheson | 7,391 | 6 |
| *Enchiridion*, separate Gutenberg Higginson edition (edition sensitivity only) | 13,934 | 7 |
| *Golden Sayings of Epictetus*, Hastings Crossley | 26,815 | 7 |
| *The Art of War*, Lionel Giles | 57,591 | **8** |
| *The Code of Hammurabi*, C. H. W. Johns (1903; Gutenberg #17150) | 19,870 | 7 |
| **Total files (not independent translations)** | **147,914** | **8** |

All source URLs, exact Git blob SHA-1s, words, and maximal-match assertions are frozen in [the standalone CommonJS SFT](../sims/lp2_pp36_38_numbered_aphorism_crib_sft.cjs). This test re-parses the original paragraph runes and asserts every word length and all five paragraph rune sums. For each source, a separate planted source-native **20-word** length run is recovered exactly by the unchanged scanner. The literary source HTML/licensing and publication provenance are available from [the Epictetus translation comparison](https://jtauber.github.io/enchiridion/), [Project Gutenberg #45109](https://www.gutenberg.org/ebooks/45109), [#871](https://www.gutenberg.org/ebooks/871), and [#132](https://www.gutenberg.org/ebooks/132) and [#17150](https://www.gutenberg.org/ebooks/17150). The #45109 electronic edition dates to **10 March 2014**, before the May 2014 LP2 release; it is a *different printed representation of the same Higginson translation*, not a fifth independent translation.

**Zero candidate runs meet the precommitted 12 consecutive words / 40 GP runes, followed by five independent words, original-cipher consequence gate.** The 8-word maximum is a short chance match within the Art of War edition, and is not presented as proposed plaintext. In the absence of a qualifying crib, there is no legitimate key equation or original-cipher inverse to run.

## Research decision

The eight **fixed text editions** are a finite exclusion for intact, word-length-preserving quotations. The experiment does not exclude other books, paraphrases, translations, word-order changes, non-English plaintext, or an authenticated source not yet recovered. The original pages themselves offer no title, author, passage address, or distinct cipher instruction selecting a specific pre-2014 aphorism source. Accordingly, further open-ended text collection without independent source evidence is lower priority than obtaining a genuine author-selected key or decoder.

Unlike the already finished [18-book screen of p40–53 quoted material](lp2-quote18-publicdomain-corpus-gate.md), this test targets the five visible pp36–38 numbered paragraphs and eight new source files. It does not repeat that experiment's source texts or target spans. The SFT is deliberately manual and makes no per-commit CI workflow.

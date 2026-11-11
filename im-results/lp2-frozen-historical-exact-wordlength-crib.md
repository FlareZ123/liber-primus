# Frozen historical GP-word-length crib gate on all nine LP2 bodies

**Status: bounded negative for exact contiguous quoted plaintext with preserved printed word boundaries. No unknown LP2 plaintext or cipher key recovered.** Agent4, 11 November 2026; Director Issue [#333](https://github.com/FlareZ123/liber-primus/issues/333).

## Decision

The original unsolved book contains 12,956 GP runes and 2,896 complete rune words. The nine typographically distinguished bodies contain **[158, 255, 385, 435, 224, 326, 23, 355, 735]** words, in rune intervals [0,729), [729,1874), [1874,3612), [3612,5506), [5506,6527), [6527,7960), [7960,8051), [8051,9640), [9640,12956). Every word belongs wholly to exactly one of these intervals.

Against a predeclared, finite group of **13 Cicada-related textual sources** totaling **6,991 words**, the longest *unmodified* contiguous GP-word-length match is **eight words**. It has no withheld extension and no deciphered rune support. Among **2,000 whole-corpus word-length-shuffled controls**, **1,995** reproduce a maximum at least eight, with plus-one upper-tail **1,996/2,001 = 0.99750125**. An unrelated Gibran control independently produces a **nine-word** match against the same original bodies. Therefore the examined sources provide **no credible plaintext crib under this exact-length rule**.

The strong lower-tail placement of the observed *maximum* is consistent with the independently documented weak adjacent-length dependence of the printed ciphertext; it is **not** evidence of deliberate hiding or of an alternative cipher.

## What was frozen

The implementation is [the one-file Node.js reproducer](../sims/lp2_historical_exact_wordlength_crib_sft.cjs). Input is the repository's [canonical 58-page runic transcription](../resources/liber-primus/lp2-transcription.txt), preserving runic word delimiters \`- . & $ §\`. Printed line \`/\` and page \`%\` marks do not break words, so wrapped words remain intact. The numeric-only physical page 50 contributes no runes. This yields the exact nine original-text word inventories above without fitted boundaries.

English source words match ASCII alphabetic runs; GP-rune word length is computed after QU→CW, V→U, K→C, Z→S, with TH/EO/OE/AE/IA/EA/NG contracted in a greedy left-to-right scan and the canonical special ING contraction. The policy is inherited from the repository's [earlier source-neutral crib scanner](../sims/wordlength_crib_scan.js), not tuned to these results.

Positive controls independently agree **20/20** on the exact original solved p57 *PARABLE* title and text, and **13/13** on the opening p56 *AN END* title and clause before its hexadecimal digest. These prove that the test can find GP-word-length continuations under the documented transliteration for actual solved prose. They do not prove that an unknown encrypted passage preserves plaintext spaces.

The 13 **fixed primary/historical** sources were:

| Corpus | GP source words | Longest match in unknown LP2 |
| --- | ---: | ---: |
| Solved LP1 translation reference (excluding later solved p56/p57) | 780 | 7 |
| Exact 2012 Blake MIDI chorus | 56 | <7 |
| 2012 printed Blake *Marriage* excerpt | 120 | 7 |
| 2012 Cicada signed countdown | 19 | <7 |
| 2012 MIDI 49-word sequence | 49 | <7 |
| 2013 Cicada signed forest clue | 15 | <7 |
| 2013 *Liber AL*, chapter I | 1,897 | 7 |
| 2013 *Liber AL*, chapter II | 1,968 | 8 |
| 2013 *Liber AL*, chapter III | 2,002 | 8 |
| 2013 signed-era solved WISDOM message, textual rune paragraph | 16 | 7 |
| 2014 Cicada signed Stage11 reply | 14 | <7 |
| 2016 Cicada signed LP2 instruction | 45 | <7 |
| 2017 Cicada signed verification warning | 10 | <7 |
| **Source set total** | **6,991** | **8** |

The sources are checked-in at \`resources/liber-primus/lp1-plaintext-reference.txt\`, \`resources/control/cicada2012_blake_chorus.txt\`, \`resources/external/{2012-marriage-of-heaven-and-hell-page.txt,2013-book-of-law-I.txt,2013-book-of-law-II.txt,2013-book-of-law-III.txt,2013-0-wisdom.txt}\`, and the corresponding seven \`resources/historical/cicada*.asc/.txt\` files, all explicitly enumerated in the SFT. The script prints each original file's SHA-256, row-level source counts and strongest individual matches.

## Exact leading candidate and withheld prediction

The strongest eight-word match at **body 0, zero-based word 96** corresponds to **2013 Liber AL chapter III, zero-based source word 1,453**:

> she see strike at the worship of Nu

The *source* predicts the following ten GP word lengths: **[3,5,7,5,1,2,2,7,4,2]**. The *original unknown manuscript* instead has **[4,7,3,3,5,3,5,2,2,2]**, agreeing at only the last of ten positions. The best source therefore fails the mandated withheld ten-word continuation decisively; no source text is authorized as an LP2 plaintext placement.

For contrast, the deliberately unrelated Gibran \`resources/control/gibran_prophet_58585.txt\` (15,733 words) matches **nine words**, “that no one has gone his way with empty”, on original body 2 at zero-based word 225. Its ten succeeding GP lengths differ immediately from the original as well. Because this is an unrelated control and the experiment selected a best alignment over many positions, it cannot be treated as a found quotation.

## Familywise shuffled-corpus calibration

For a **seven-word exact seed**, source k-gram indices are built once, then every matching original seed is extended maximally in both directions within its own source file and within one of the nine body bounds. The **45 original historical-source seed hits** produce the best length 8. There are **no** matches of length **18**, which would be required by a prospectively fixed eight-word seed and ten withheld adjacent words. The strongest exact source match is tracked across **all** source/body pairs, not an uncorrected per-source result.

The null shuffles all **2,896** original word lengths as one complete inventory (xorshift32 seed \`0xc1cada33\`) and redistributes them into the nine original body word counts. Each of 2,000 shuffles repeats the full 13-source family scan, yielding this distribution of **familywise maxima**:

| Maximum exact run | Null shuffles |
| ---: | ---: |
| 7 | 5 |
| 8 | 744 |
| 9 | 934 |
| 10 | 262 |
| 11 | 44 |
| 12 | 10 |
| 13 | 1 |

This calibrates only the frozen source set, frozen GP-length convention, and specified permutation null. The null controls are not independent linguistic publications; they test the source-selected alignment procedure under rearranged original counts. The 87-book earlier search in [wordlength-literary-crib.md](wordlength-literary-crib.md) is neither repeated nor counted as new evidence.

## Result and next decision

**Retire exact contiguous quotation matching for this historical source set under preserved GP word lengths.** The outcome does not exclude altered word boundaries, padding, keyed transpositions, paraphrase, a historical source absent from the fixed set, or a plaintext cipher not preserving original spaces. No follow-up source hunt is warranted by these null results alone. Priority should return to independently selected reversible original-rune operations or recoverable genuine original plaintext/key material.

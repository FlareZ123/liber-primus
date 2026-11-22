# Original LP2 quotation spans versus the King James Bible: exact-length crib gate

**Agent 30, 11 November 2026. Classification: one bounded negative known-plaintext-source screen.** No authentic unknown plaintext, GP key, decoding operation, or puzzle destination recovered.

## Human-source premise

Seven pairwise quotation-delimited runic passages are recorded in the richer original LP2 transcription preserved by [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/data/scream314_lp.md), with global rune spans already indexed by `resources/liber-primus/lp2-quote-punctuation-spans.json`. Their lengths are **18, 19, 12, 58, 68, 160 and 70 runes**, or 405 runes in total. A direct quotation could preserve word lengths despite the unknown internal cipher. A historical English Bible is a finite, period-available source worth one explicit check, although nothing in the original scan yet **selects the KJV** or establishes the quotations were copied verbatim.

The four longest source-delimited passages contain **14, 13, 34 and 14** printed words. Their exact printed rune word-length arrays are embedded in the reproduction SFT; each array sums exactly to its original rune interval. The three shorter quotations (4, 5 and 2 words) lack enough constraints for a distinctive source attribution and are excluded from the search. These observations and the original corpus/annotation offsets determine the candidate without inspecting English matches.

## Full fixed-source experiment

Use a pinned public-domain KJV text file from [nigelmsipa/public-domain-bibles](https://github.com/nigelmsipa/public-domain-bibles/blob/a7d5ae6a2ed164416290d849ec5a36f688181243/KJV.txt) at commit `a7d5ae6a2ed164416290d849ec5a36f688181243`, SHA-256 **`1ec99be81dcfcd4d601a5f988f3f8a544382c6b8594b0ec94a94599bcac29d73`**. The text has **823,810** Latin-letter word tokens under the specified parser.

Encode each source word's *length* in the established GP rune spelling convention, treating **ING, TH, NG, EO, OE, AE, IA, EA** as multigraphs, with ING preferred; this follows the independently solved p57 TUNNELING and LP1 THINGS. Search all source positions for any six-word seed from each of four complete original quotation shapes, extending exact identical lengths in both directions. A match means the runic quote and KJV share that many consecutive word lengths; it does not establish plaintext identity by itself. No mismatches, optimal gaps, retokenized words or fitted permutations are permitted. A 34-word source-passage plant is recovered exactly from the source by the same detector.

## Executed original result

[Successful original-input manual CI run 43122680272](https://github.com/FlareZ123/liber-primus/actions/runs/43122680272) executed the script under Node22 with the complete pinned 4.6-MB source.

| Original quote | GP runes | Printed words | Longest exact consecutive KJV-length match |
| --- | ---: | ---: | ---: |
| Span 3, p40 | 58 | 14 | **9** |
| Span 4, p42 | 68 | 13 | **7** |
| Span 5, pp42–43 | 160 | 34 | **9** |
| Span 6, p53 | 70 | 14 | **7** |

The source text at the best nine-word alignment is `THEY HAVE SPOKEN UNTO THEE THEY HAVE WELL SAID`; it matches only quote-span-3 word positions 3–11, not the full 14-word quotation. A separate nine-word sequence matches 9/34 positions of the longer quote; neither gives a unique anchored plaintext or a distinctive complete passage. The **34/34 planted source passage is recovered**, showing this gate can find a real lengthy literal word-length alignment.

**Decision:** none of the four long source-marked quotations is an exact full-sentence KJV word-length match under the fixed transliteration. Retire only this source-specific verbatim KJV quotation possibility. Original LP2 may contain other quoted literature, a different language, variant spellings, or deliberately authored quotations. Advance only when an original image or authenticated period clue narrows the next exact-text source; anonymous corpus expansion is not a substitute for plaintext evidence.

**Reproducer:** [CJS single-file SFT](../sims/lp2_quote405_kjv_source_crib_sft.cjs) and [manual GitHub workflow](../.github/workflows/lp2-quote405-kjv-source-crib.yml), source URI and Git commit frozen. This is `im-results` material, with no change to authoritative decipherment status.

# Source-native GP29 word-length crib retrieval on original LP2 ciphertext

**Classification:** reusable source-text crib search and bounded negative. This does not recover unknown plaintext, identify a key, or establish that the unknown pages quote any particular literary source.

## Why this route could reach plaintext

The original cipher pages retain printed word delimiters. The solved LP2 physical p57 provides an unusually strong calibration: the entire 95-rune, 20-word original lineation agrees word by word with the known orthographic English passage once the historical GP29 multi-letter units are contracted. Consequently a consecutive **word-length signature** can be searched against an external text in its *actual GP29 rune lengths* without knowing a cipher key, selecting a substitution cipher, or modifying any unknown ciphertext. A sufficiently long, independently sourced exact match would be a concrete candidate plaintext crib, suitable for a frozen original-cipher attack. It would still require cipher verification.

## Exact original-input screen

[Single-file CommonJS reproducer](../sims/lp2_original_wordlength_crib_sft.cjs) parses the canonical 2014 [original LP2 rune transcription](../resources/liber-primus/lp2-transcription.txt), ignoring line wrapping and preserving words that cross page turns. The source has **2,896 words / 12,956 runes** on physical pp0–55, including the absent-rune p50; the GP29 spelling clock uses the established orthographic units **ING, TH, NG, EO, OE, AE, IA, EA** from the [2013 source table](../results/2013-original-gp29-source-map.md), with the remaining Latin letters as single runes. The independent [solved-p57 reference](../resources/liber-primus/lp1-plaintext-reference.txt) matches **20/20 original word lengths and all 95 source runes**; the control text is never added to the unknown-page search corpus.

A seven-word length-signature index retrieves matches from the three unchanged corpus files already in the repository; every candidate is then extended to its maximal exact consecutive original-word match. File word counts include Gutenberg metadata and are deliberately left untrimmed, giving a larger, more permissive candidate set.

| Text source | Word tokens | Seven-word matching windows | Longest contiguous word-length match | Matches of at least 10 words |
| --- | ---: | ---: | ---: | ---: |
| [Gibran, *The Prophet*](../resources/control/gibran_prophet_58585.txt) | 15,733 | 104 | **9** | **0** |
| [Emerson, *Essays, First Series*](../resources/control/emerson_essays_2944.txt) | 77,932 | 277 | **9** | **0** |
| [Shakespeare excerpt](../resources/control/shakespeare_first300k.txt) | 55,407 | 270 | **9** | **0** |

The complete original LP2 book yields **zero verbatim runs of ten GP-word lengths** across these 149,072 source tokens. The longest (nine) matches occur in unrelated places, with no independently selected matching text. The index is reproducible and reports candidate page, book word offset, source offset and source phrase. The 20-word original solved-p57 control matches in full; this positive prevents mistaking a misparsed GP alphabet or page-wrap bug for a source-text negative.

## Research decision

The three pinned literary texts do **not** supply an exact 10-word unknown-page plaintext crib under standard source-native GP orthography and preserved word boundaries. This is a useful bounded exclusion of **verbatim borrowing** in these *particular* editions. It says nothing about a paraphrase, non-English prose, changed segmentation, spelling differences, a different literary source, or a cipher that modified word delimiters. No plaintext, key, or mechanism is claimed.

**Actionable use:** index any genuinely source-motivated historical text with the same search routine, then require a long source-original match and cross-validate the resulting proposed plaintext with a complete reversible cipher, preferably on an independently withheld passage. Do not treat a short length match as plaintext or open an unrestricted corpus crawl absent a source lead.

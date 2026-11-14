# The 32 page-carried words match 32 table rows under an ordinary chapter-aware layout null

**Agent23, 14 November 2026. Evidence class: original-layout conditional control; no plaintext or key.** This changes the interpretation of the proposed original 32-byte page-carry packet, rather than its reproducible extraction. The 32 genuine words crossing physical LP2 page breaks still select 32 distinct table rows using their right-side lengths, as reported in [the exact packet study](lp2-pagecarry-grid32-source-packet.md). **The numerical count equality alone supplies no independent evidence of an authored key selector once the actual page and chapter design is respected.**

## Source and question

Original 2014 LP2 has 56 unresolved physical pages, including rune-free numerical p50. Its 55 rune-bearing pages contain exactly **12,956 GP29 runes** and **2,896 complete printed words**. The [original-image chapter map](lp2-global-original-visual-section-map.md) identifies nine chapters, whose original physical terminal pages are **2, 7, 14, 22, 26, 32, 39, 53, 55**. The table on pp49–51 has **32 rows × 8 columns**, and the published page-carry packet proposed assigning one of the 32 crossing words to each row.

Question: does the exact match of **32** page-carried words to **32** table rows indicate a deliberately constructed cardinality, or does ordinary layout plus authored chapter breaks account for it?

Parse only the original `resources/lp2-transcription.txt`. As in the source word parser, the printed `/` line break and `%` page break never terminate a rune word; separators and punctuation do. Mark every gap between successive rune symbols as **internal to a word** or not, then evaluate the original 54 adjacent rune-bearing page transitions. The numeric p50 consumes no runes and does not create a second independent crossing word.

## Unconditional versus chapter-aware comparison

| Model or observable | Original value | Interpretation |
| --- | ---: | --- |
| All source page boundaries | 54; 32 inside words | Exact original packet count |
| Source-visible chapter boundaries | 8; **0** inside words | Eight deliberate sentence/section endings |
| Ordinary within-chapter page boundaries | 46; **32** inside words | Relevant numerator for an ordinary page layout |
| Within-page printed line wraps | 594; 420 inside words | Observed same-manuscript layout pool |
| Naïve shift of all 54 original page boundaries around the 12,956-rune ring | mean 41.9296; 28/12,956 shifts have ≤32 carries | **Misleading** low-tail rate 0.002161 because this destroys the eight chapter ends |
| **Nine-chapter line-wrap conditional null**, sampling each chapter's original number of ordinary page breaks without replacement from its own printed line wraps | mean **32.571550**; **P(X ≤ 32) = 0.482439** | The original 32 carries are typical under the manuscript's own word/line structure |

The conditional null freezes each of nine **original visual chapter ranges** as a separate pool, preserving its observed counts of internal-word line wraps and its number of ordinary page breaks. Each chapter's count has a finite hypergeometric law. Convolution of the nine probability vectors gives the exact total-tail probability above. This uses **no cipher key, original plaintext guess, optimized source phase, freely adjusted chapter cut or Monte Carlo approximation**.

The null is a comparison model, not a claim that creators randomly placed page boundaries. It does not test which table column should be selected from each crossing word. It shows that the **row count** is explained by preexisting visible section boundaries and ordinary line wrapping, so its apparently exact match to the grid is weak independent evidence. The 32 specific row/column addresses and the 32-byte output remain mathematically well-defined, although no first-party cryptographic consumer has been recovered under [Director #837](https://github.com/FlareZ123/liber-primus/issues/837).

## Reproduce and decision

The complete [Node.js CommonJS SFT](../sims/lp2_pagecarry_grid32_boundary_null_sft.cjs) reads the unchanged published runic transcription, counts the 55 rune-bearing pages, verifies 2,896 words/12,956 runes/32 carries and all nine authentic chapter cuts, evaluates all 12,956 naïve cyclic shifts, and computes the nine-chapter exact hypergeometric convolution. It asserts the numerical values above and prints every chapter's sample/population details. The SFT writes no files.

**Decision:** retain the original 32-byte extraction as a provisional source-addressed value; **retire the inference that 32 matching 32 is unlikely to occur without authored design**. Require a distinctive first-party row/column operation or independently predictable authentic plaintext before assigning this packet cryptographic priority.
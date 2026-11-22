# Historical 2014 seven-column order versus printed LP2 page-edge words

**Classification:** bounded original-transcription test; provisional negative for *literal page reorder*. No unknown plaintext, key or decryptor is recovered.

## Source-selected proposal

A documented solved 2014 LP1 puzzle applies seven-column transposition to a 56-character message using key `1736254`. The existing Agent12 [handoff](../communications/broadcast/20261111T1748Z_agent12_2014-56-page-order-hypothesis.md) proposes transferring its exact known 56-position inverse ordering to the **56 physically unknown LP2 pages 0–55**. We test the resulting *reading order of whole printed pages* against page-edge rune-word continuity, an independent feature of the original book. A seven-column transform at some other cipher layer is outside this test.

The canonical [source transcription](../resources/lp2-transcription.txt) has 55 rune-bearing unknown pages; physical page 50 is numerical and has no runes. We insert it as one empty physical slot and preserve page-specific punctuation, the `/` line-wrap convention, and the canonical [word parser](../sims/lp2_word_pages.cjs). The [reproducer](../sims/lp2_2014_page_order_word_join_sft.cjs) asserts **2,896 words and 12,956 runes** before measuring continuations.

For each adjacent pair of physical pages, if the first page ends directly with a rune fragment (ignoring whitespace and line-wrap `/`) and the next starts directly with a rune fragment, their end and start fragments form a **cross-page word**. Punctuation and explicit section delimiters terminate continuations. The test uses only original printed fragments and a prespecified historical permutation; no cipher-language score, key fitting or adjustable offset is involved.

## Exact original-input results

| Reading order | Cross-page word joins | Joins of 12+ GP runes | Joins of 14+ GP runes | Maximum joined length |
| --- | ---: | ---: | ---: | ---: |
| Printed physical p0, p1, ..., p55 | 32 | **0** | **0** | **11** |
| Historical seven-column ordering `[0,6,2,5,1,4,3]` per seven-page group | 31 | **2** | 0 | 13 |
| Inverse of this ordering | 32 | **3** | **3** | 16 |

The historically derived order creates p9→p12 (10+2=12 runes) and p42→p48 (9+4=13 runes). Its inverse creates p9→p13 (10+6=16), p18→p16 (1+13=14), and p42→p46 (9+7=16). For context, only **25/2,896** entire printed original LP2 words reach length 12 or more, and only **3** reach length 14.

A source-relevant null shuffles pages **only within each original consecutive seven-page group**. The deterministic xorshift32 seed `0x357a0ef9` and 100,000 trials yield 2,053 cases with zero joins of length≥12 (2.053%); 51,494 with at most two such joins. Thus the printed order is unusually compatible with boundary-length constraints under this particular controlled null, whereas the 2014 key order is typical of the same null. The 12-rune cutoff is descriptive and was examined after observing the original lengths; this percentage is a calibration, **not** a pre-registered significance test or evidence of decrypted language.

## Decision and remaining unknown

The published order already coordinates original end/start word fragments more cleanly than the source-derived seven-column page permutation or its inverse. Its coherent extended illustrations and section layout also require more machinery to explain after wholesale page rearrangement. This disfavors reading the **actual image pages themselves** in historical seven-column order as a pathway to ordinary preserved-word plaintext.

The result does not reject a columnar transform of an independently identified register *within* those pages, a reading order where plaintext boundaries were rewritten, or some other keyed page-dependent cipher. None is fixed by the historical 56-character solution alone. Without an additional source clue selecting the representation and predicting original cipher output, do not use the improved/altered page order to fit keys.

**Reproduce:** `node sims/lp2_2014_page_order_word_join_sft.cjs` from repository root; the script performs complete corpus-count and exact result assertions and prints its deterministic null histogram.

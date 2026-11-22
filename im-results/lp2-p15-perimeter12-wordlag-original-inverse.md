# Original LP2 12-word lag and p15 perimeter transport: bounded source-clue test

**Agent45, 13 November 2026.** A 12-word-spaced length correlation survives two page/line-aware shuffle nulls after correcting for the 181 lags screened, but the simplest lossless 12-column transposition fixed by the original p15 perimeter does not restore a convincing native-GP word-length order. **No original unknown-page plaintext, key or source-authenticated inverse was recovered.** This is a provisional structural lead and a finite decoder rejection.

## Original source and reason to test exactly twelve

The original p15 scan [32.jpg](../resources/liber-primus/32.jpg) prints a deciphered 4×4 Fibonacci/prime-index spiral, with 12 perimeter cells. The exact numeric construction and original spiral are established in [the p15 artifact result](../results/lp2-p15-fibonacci-prime-spiral.md). Independently, the canonical original LP2 unknown text contains **2,896** complete printed words, with **12,956** GP29 runes and **32** words spanning a physical-page boundary. Unlike earlier already-rejected 8-column (p50) and 16-column (entire p15 grid) transports, this narrowly tests the p15 **12-cell perimeter**. The 12-column body would contain 12×241=2,892 complete words plus a four-word remainder. Neither the creator nor any verified clue specifies the 241-row reshape, remainder position, or plaintext segmentation. These are hypothetical consumer choices, and the count is retrospective.

## Before transformation: 181-lag original word-length screen

Read physical p0–55 in source order, joining words across line/page wraps and preserving all punctuation-delimited word boundaries. Cap word lengths at 10 to reduce the influence of the few extreme values. Define `r(d)` as the pooled-mean, pooled-variance Pearson lag-d length correlation. The original has **r(12) = 0.07288391616042422**, the **largest absolute correlation among lags 1–181**. This lag was selected by that screen; its 12-cell coincidence with p15 is a post-screen interpretation.

Two **500-draw** Fisher–Yates controls use fixed xorshift32 seeds and preserve the exact original data under different constraints:

| Null model | Expected lag-12 correlation | Lag-12 upper-tail p | Familywise upper-tail p over maximum absolute correlation of all 181 lags |
| --- | ---: | ---: | ---: |
| Shuffle all complete words **within each physical starting page**; retain each page's word-length inventory | −0.00115941728242 | 1/501 = 0.001996 | 5/501 = 0.009980 |
| Shuffle whole **printed-line word-length blocks within each starting page**; retain every line's ordered lengths | 0.00173023688432 | 1/501 = 0.001996 | 5/501 = 0.009980 |

Both nulls represent fixed original word identities; no plaintext or translated English was used to select the lag. The printed-line null can move text-block positions and keeps line-internal lengths untouched. These finite Monte Carlo p-values are precision-limited. The 12-lag signal **does not persist harmonically**: raw original r(24) ≈ 0.00912 and r(36) ≈ 0.00128. A pure 12-strand cipher would need further independent evidence.

**Independent within-printed-line control.** In another 500 fixed-seed original-inventory shuffles (xorshift32 `0x3301beef`), freeze the **exact printed line order**, the number of words on each line, and each line's word-length multiset; randomize only the word *order within each line*. This retains the editorial vertical layout and line-length budgets while destroying local left-to-right word order. The null mean r(12) is **0.0087242902**, the marginal upper-tail p is **1/501**, and the 181-lag familywise upper-tail p is **20/501 ≈ 0.03992016**. Thus the original positive lag12 correlation cannot be explained merely by long/short word allocation to particular original lines under this null. In conjunction with the separate whole-line-order shuffle, line allocation *and* the order inside lines each constrain the signal. There remains no source-selected operator, no periodic harmonic at lags24/36, and no evidence that reordering words can decipher them.

## Locked original-input perimeter consumer

The original p15 twelve perimeter cells, read in spiral order, map to zero-based row-major perimeter slots

`[6,4,0,1,2,3,5,7,11,10,9,8]`.

Test this order and its inverse. Arrange the unchanged 2,892-word body row-wise into a 241×12 rectangle; read each selected column top-to-bottom. With the remaining four complete words at the very start or very end, there are four simple lossless candidates, all with an exact forward-reversal identity and source-native Shakespeare positive plant. The test deliberately leaves every original word's rune identities unchanged. Score original and inverse using the 9×9 adjacent-length Pearson χ² from [the preexisting manuscript word-grammar experiment](lp2-wordlength-order-grammar.md), with larger values denoting greater ordered-word-length dependence.

| Ordering | Adjacent-length χ² |
| --- | ---: |
| Untransformed original | **68.2731863819** |
| Spiral, four-word prefix | 80.4837424235 |
| Spiral, four-word suffix | 80.1835964611 |
| Inverse spiral, four-word prefix | 79.6329715291 |
| Inverse spiral, four-word suffix | **81.0891186511** |

For **1,000 exact-original-inventory shuffles**, evaluate the best of the **same four frozen operations** on each shuffled manuscript. **87/1,000** null maxima reach the original optimum, giving add-one familywise **p = 88/1001 ≈ 0.0879121**. The 95th percentile of the null's best χ² is **84.57384**, already above the original's best score. Moreover, the 63 native-GP reference windows in the earlier fixed-inventory source study have χ² ≥95.3856. Thus the four perimeter consumers fail to restore ordinary GP-native adjacent word-length structure under the available controls.

The null test allows no secret column optimization, fitted page key, modified word boundaries or symbol substitutions. It excludes only the four defined original-position transport readings. The independent observation r(12) may reflect unusual editorial organization, language, within-page structure, or an entirely different operation. It cannot be promoted to a source-selected decipherment from this result.

## Separate original p15–22 visual-chapter reset: negative

Because the **p15 numerical square opens the actual physical pp15–22 chapter**, a more source-local reset is an independent and more plausible use of its twelve perimeter cells than a whole-book 241×12 arrangement. This original chapter has **1,903 unchanged runes in 437 complete words owned by starting page**. Its entire-word readout is tested with **36 rows × 12 perimeter columns**, plus **five** complete prefix/suffix remainder words. Keep the p15 source-visible perimeter order and its inverse, the same two remainder placements, and the same nine-class word-length scoring as above.

| Original pp15–22 layout | Adjacent-length χ² |
| --- | ---: |
| Untouched chapter word order | **76.6777642** |
| P15 perimeter spiral / five-word prefix | **71.2761978** |
| P15 perimeter spiral / five-word suffix | 70.4303743 |
| Inverse perimeter / five-word prefix | 70.5447095 |
| Inverse perimeter / five-word suffix | 68.88553896 |

All four original-layout inverses **decrease** the observed word-length dependence. Under **3,000 chapter-inventory-preserving randomized word orders**, each scored by its best of the same four source-frozen candidates, the chapter's best χ² has a selection-adjusted upper-tail p **0.3292235921**. The source-native round-trip plant, the exact chapter 437-word/1,903-rune assertions and the matched null pass in [manual CI 43412502232](https://github.com/FlareZ123/liber-primus/actions/runs/43412502232). This excludes the elementary same-chapter perimeter transpose; it does not infer any revised text, edited word boundaries or hidden position map.

## Reproduce and next decision

[Standalone Node.js 22 CommonJS original-input SFT](../sims/lp2_p15_perimeter12_wordlag_sft.cjs) validates the canonical word/rune totals against the existing shared parser, source p15 numeric values, ring traversal, all four lossless inverse/forward pairs, planted Shakespeare word stream, both 181-lag null controls, and the four-variant matched-shuffle test. The script passed [manual GitHub Actions run 43410445779](https://github.com/FlareZ123/liber-primus/actions/runs/43410445779), on `main` commit `3d539777262a9c5be4cc8796639916283f74d095`. The existing manual workflow was extended with a selectable experiment and still has no automatic commit triggers.

**Decision:** retire this direct p15-perimeter whole-book 241×12 transpose. An independent clue that fixes a **different source-position reading and a full rune decoder**, plus held-out original plaintext, would justify re-entering the branch. More arbitrary 12-column reshapes or uncalibrated word-length optimization would repeat the defeated premise.

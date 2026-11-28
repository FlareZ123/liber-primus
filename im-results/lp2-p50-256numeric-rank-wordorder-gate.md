# Original p50 numeric rank as a 256-word permutation

**Agent 1, 14 November 2026. Evidence class:** bounded original-input negative. No unknown LP2 plaintext, historical cipher key, or destination recovered.

## Independent source-facing premise

The original LP2 pages 49–51 print **256** two-character numerical tokens as **32 rows of 8**. The complete unknown LP2 corpus contains **2,896 original printed words**, precisely **11×256 + 80**; the residual 80 equals the original table's 80 cells on physical p49. Cicada's signed 2016 wording says that the manuscript's *words* are a map and their *numbers* supply a direction. A reader could sort the 256 numbers and use their stable rank order as a reversible whole-word column/route key. This is a distinct transport from the previously tested eight-column readout of 256-word rectangles, and its permutation is actually derived from **all 256 printed numeric values**.

**Critical caveat:** neither the source caption nor the signed statement instructs solvers to sort the table or to apply the result to entire words. The coincidence 2,896=11×256+80 was noticed retrospectively, so this is a motivated original-input candidate rather than authorial evidence.

The candidate operation fixes the original row-major table as 256 source base60 values. Sort their zero-based cell indices by byte value ascending, breaking equal-byte ties by their original printed cell index. This yields a complete deterministic permutation without assuming distinct values; the table has only 161 distinct byte values. On each of eleven consecutive complete 256-word ciphertext blocks, test its rank-reading and inverse, with either (a) the residual 80 words unchanged or (b) ranked by the first 80 table-cell values. No rune is altered. The fixed final-80 alternative is independently motivated by the 80 printed table cells on p49; no free orientation, secret permutation, page phase or cipher key is optimized.

## Exact original-input decision

The canonical original word parser, including words spanning physical line/page boundaries, gives **2,896 words / 12,956 runes**, with exactly 32 cross-page words. Score the adjacency of nine word-length categories (GP rune lengths 1 through 8, 9+) using the previously adopted Pearson 9×9 chi-square. Ordered native English controls give substantially larger adjacency dependence than a randomly permuted inventory.

| Whole-word order | Adjacent-length χ² | Change from original |
| --- | ---: | ---: |
| Original printed LP2 | **68.27318638** | baseline |
| Ascending sorted-rank read, final 80 unchanged | **62.02848183** | −6.24470455 |
| Ascending sorted-rank read, final 80 use table's first-80 rank | **62.12061020** | −6.15257618 |
| Inverse rank read, final 80 unchanged | **58.47071743** | −9.80246895 |
| Inverse rank read, final 80 ranked | **56.93647179** | −11.33671460 |

All four source-fixed inverses **weaken** the already weak original word-length adjacency signal. Under 1,000 fixed-seed full shuffles of the source's exact 2,896-word length inventory, applying the **same five-way selection** over the original and four rank readouts, **739/1,000** control maxima equal or exceed the actual best score 68.27318638. The plus-one familywise upper-tail is **740/1,001 = 0.73926074**; optimized null mean 74.68215771. The observed table-rank result is ordinary for rearranged ciphertext word lengths.

An independently sourced Shakespeare control of 2,896 actual ordered words has 9-class GP-length adjacency χ² **163.89099124**. Applying each source-table rank or inverse reduces the score to **49.69694–53.81436** in the tested first control window, while applying its paired inverse restores **all 2,896** original word positions exactly. The standalone test repeats the complete bijective synthetic recovery on three source windows, all four models. Thus a genuine table-keyed whole-word transposition would have produced a measurable ordered-language signal under native GP-English conditions.

## Research decision

**Retire the exact 256-value stable-rank whole-word transposition in both directions and its source-motivated 80-word tail variant.** It recovers no English word-order structure and no letter identity, and its apparent numerical length fit does not identify a cryptographic operation. This does not reject an actual table-specified *different* route through ciphertext runes, an unknown byte-cipher, source-keyed word selection at different granularity, or a non-native plaintext register.

Reproducer: [sims/lp2_p50_sort256_wordorder_sft.cjs](../sims/lp2_p50_sort256_wordorder_sft.cjs), using only checked-in unchanged source text, numeric cells and independently sourced English positive-control text. It asserts all original source counts, exact four candidate χ² scores, source-key permutation inversion, and the 1,000-null exceedance count. No new key or plaintext is claimed.

## Historical comparison semantics and the exact tie obstruction (Director #3295, Agent12, 28 November 2026)

**Decision:** stable comparison is a genuinely pre-LP2 cryptographic operation, but no Cicada source binds it to this panel or to a complete 256-unit recipient. The base59/base60 ambiguity is irrelevant to ordinary ascending comparison, and the horizontal mirror does not resolve ties in physical cell identity order. Do not repeat the whole-word rank experiment above or infer a new typed receiver from length alone.

A public, dated worked example predating the puzzle is [Programming Praxis, Double Transposition Cipher, 29 May 2009](https://programmingpraxis.com/2009/05/29/double-transposition-cipher/), including [the contemporary solution and 30 May correction](https://programmingpraxis.com/2009/05/29/double-transposition-cipher/2/). The example's keyword COACH yields one-based ranks 25134, separating its two Cs by their original positions. In a 17-character ragged rectangle the complete visit sequence is [2,7,12,0,5,10,15,3,8,13,4,9,14,1,6,11,16]. Exact replay of the published example yields OMRPAGIGIARNXRMPS, and the second STRIPE transposition yields GNPAPARSRIMOIXMGR. The inverse recovers the original 17 characters. Reversing the C tie produces OMRGIAPAGIRNXRMPS instead. The original author explicitly acknowledged a sort-stability implementation problem in the dated comments. This establishes both historical availability and the practical significance of the tie convention; it is not evidence of Cicada authorship or a source used by Cicada.

The stronger same-puzzle example is the signed 2014 XOR-derived 70-character cryptogram (the [pinned participant transcript](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/004-first-three-pages/README.md)). Its five rows of width14 decode using [2,8,9,1,12,13,11,4,5,7,3,0,6,10] to the exact recorded 70-character phrase and truncated onion suffix; all five original rows reconstruct. The transcript describes finding the column order by reordering columns until the message is legible, not deriving it from an ordered numeric register. It contains no duplicate-key ordering demonstration or 256-wide recipient. The [original fourth-onion width7 route](2014-fourth-onion-response-chain.md) is similarly a fixed permutation. The [historical operation-contract synthesis](cicada-authenticated-solvepath-operation-contracts-2012-2016.md) identifies no author-specified stable sort. The 2009 example therefore establishes a possible implementation, whereas the 2014 material establishes actual use of transposition but does not link the two.

On the canonical image-adjudicated original panel (Git blob 2550eae357442912220e05dc51147523a61dd75a), all 32,640 unordered pair comparisons, including equality, agree between base60 and drop-f base59. This follows because both fixed-width encodings preserve the same digit order on observed symbols. There are 161 distinct token spellings, 49 doubletons, 14 tripletons and 6 quadrupletons. **The exact number of index permutations consistent with an ascending comparison but unspecified tie order is**
```
(2!)^49 (3!)^14 (4!)^6
= 8430527379596857675529996470321152
= 2^112.6992500144
```
All 127 equal-value pairs are in different physical rows; 93 also cross physical page boundaries. In particular, all 32 rows have distinct values, consistent with the [earlier row-rank study](lp2-p50-ordered-row-enumerative-rank-gate.md). If the tie convention were stable source visitation, either canonical row-major or horizontal reflection within each row would order **the same physical cell identities** identically: row reflection can only reorder within a row, where no ties occur. The reflected-coordinate labels themselves are of course changed by c→7−c; this does not make reflection a new stable tie rule or establish the coordinate system for a receiver. The ambiguity count is the number of linear extensions of the value preorder, not an estimate of brute-force cryptographic security.

The existing original-layout evidence selects row-major traversal and a mirror operation; neither says to compare globally or preserve row order across ties. A stable sort is deterministic after that convention is chosen, but the convention is not independently selected. The old 256-word block receiver above is an already-negative post-selected size match, not a typed recipient. The historical signed 2014 256-byte objects and the manuscript's 256-cell field likewise do not specify a recipient; the [radix/source gate](lp2-p50-radix-codebook-overlap-source-gate.md) documents the missing link. No new receiver was invented or fitted, and no unknown plaintext/key was recovered. Reopen only on a separately sourced comparator/tie instruction **and** a complete independently typed recipient. The remaining possible sorting route does not need a radix selection if its operation is comparison-only.

[Reproducer](../sims/lp2_p50_stable_comparison_historical_sft.cjs) executes both historical examples, the wrong-tie discriminator, all original pair comparisons, the exact factorial count, and the conditional full stable index permutation plus inverse. Its computation was executed in the connector JS runtime; the standalone Node wrapper has not been separately run. The permutation is a conditional mathematical diagnostic, not a recovered key.

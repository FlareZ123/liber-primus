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

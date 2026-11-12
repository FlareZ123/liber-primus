# Original LP2 pp49–51: fixed 16×16 magic-square gate

**Decision (12 November 2026, [Director Issue #487](https://github.com/FlareZ123/liber-primus/issues/487)):** The natural **16×16 row-major** reshape of the 256 two-character LP2 table cells is **not a magic square** under either documented candidate digit order, and cannot become one merely by altering the common positional radix. This is a bounded rejection of one source-motivated interpretation; no unknown plaintext, key, cipher mechanism, or destination emerges.

## Source and human-solve premise

The original May 2014 LP2 scans [66.jpg](../resources/liber-primus/66.jpg), [67.jpg](../resources/liber-primus/67.jpg), and [68.jpg](../resources/liber-primus/68.jpg) show **32 physical rows × 8 tokens**, with 10 rows on p49, 13 on p50, and 9 on p51. [The original-source layout decision](lp2-p49-p51-printed-order-source-gate.md) selects ordinary physical page-major, top-to-bottom, left-to-right reading. Hence the printed 256 tokens admit one obvious square reshape, **16×16**, without rearranging the physical sequence.

The magic-square precedent is historically real, with an important distinction. The **February 2014 Stage10** challenge, preserved as a signed instruction inside [the original form](../resources/external/cicada2014-onion6-magic-form-and-response.json), requested **order 5 / sum 3301**, **order 7 / sum 1033**, and **order 5 / sum 1033**. The subsequent May **Stage11** message directs solvers to the LP2 book. Neither source selects an order-16 square, or tells solvers to turn the later table into one. The Issue's shorthand referring to a Stage11 magic-square request therefore conflates two stages.

The original tokens are alphanumeric **glyph pairs**, not authenticated decimal values. The technical base60 and base59 positional interpretations remain conditional. [The original-source alphabet audit](lp2-cicada-authenticated-base60-alphabet-audit.md) found no Cicada-authenticated base60 digit legend. The base59 candidate removes an unused lowercase f from the base60 digit alphabet. These are fixed, pre-existing candidate readings, not tuned for the current result.

## Frozen operation and checks

Take exactly the 256 original table cells from [base60-grid.json](../resources/liber-primus/base60-grid.json), with a separate check against [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json). Both derived canonical resources agree **256/256** in physical token order. The earlier source glyph adjudication inspected eleven disputed cell readings using original JPEGs; no fresh claim of complete 256-cell manual rereading is made here.

Place original cells 0–15 in mathematical row 1, 16–31 in row 2, and so on through row 16. Each mathematical row combines two consecutive original printed eight-token rows. **No** rotation, mirroring, transposition, per-page restart, arbitrary row permutation, added values, or alphabet fitting is used.

Convert each printed pair XY as **radix × digit-index(X) + digit-index(Y)**. Use the original standard index order 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx with radix60, and a second fixed order with lowercase f omitted with radix59.

The independent positive control reads **all three original 2014 magic-square matrices** from [the historical square dataset](../resources/cicada2014-openpuff-magic-squares.txt). It verifies their row sums, column sums, and both principal diagonals: **5×5 → 3301**, **7×7 → 1033**, **5×5 → 1033**, all passing.

## Original-table results

| Necessary magic-square property | base60 | base59 |
|---|---:|---:|
| Sum of all 256 cell values | 33,006 | 32,499 |
| Common line sum required by total ÷ 16 | 2,062.875 | 2,031.1875 |
| Main diagonal | 1,937 | 1,909 |
| Opposite diagonal | 1,823 | 1,795 |
| Distinct row sums | 16 of 16 | 16 of 16 |
| Distinct column sums | 16 of 16 | 16 of 16 |
| Is magic? | **No** | **No** |

**All 16 base60 row sums:**

2795, 1751, 1614, 1932, 2154, 2060, 1807, 1912, 2127, 2552, 2613, 1956, 1725, 1734, 2107, 2167.

**All 16 base60 column sums:**

2314, 2429, 1737, 2146, 1924, 1820, 2134, 2105, 2154, 2479, 2268, 1625, 2263, 1607, 2228, 1773.

**All 16 base59 row sums:**

2751, 1725, 1590, 1902, 2120, 2029, 1781, 1882, 2094, 2512, 2572, 1927, 1699, 1708, 2073, 2134.

**All 16 base59 column sums:**

2277, 2392, 1711, 2114, 1894, 1792, 2101, 2072, 2119, 2442, 2235, 1599, 2227, 1583, 2193, 1748.

Both candidates already fail the integer total/16 necessity, before any row or diagonal comparison.

### Stronger exclusion: fixed digit order, arbitrary radix

For any two-character positional reading in one fixed index order, each mathematical row sum is **H × r + L**, where H is its sum of first-character digit indices, L is its sum of second-character digit indices, and r is the common radix.

| Mathematical row | H for either index order | L, base60 index order | L, base59 index order |
|---|---:|---:|---:|
| 1 | 40 | 395 | 391 |
| 2 | 22 | 431 | 427 |
| 3 | 19 | 474 | 469 |

Equality of rows 1 and 2 forces **18r − 36 = 0**, giving **r = 2** under either order. Equality of rows 1 and 3 forces **r = 79/21** under base60's index order, or **r = 78/21** under base59's. These are incompatible. Therefore **no positional radix whatsoever**, even an implausible or invalid one, can make all the rows equal while keeping either original candidate digit index order. This proof does not apply to arbitrary symbol remappings or entirely different arithmetic constructions; the manuscript has supplied no independent instruction selecting those alternatives.

## Disposition and reproducibility

Reject **only** the literal 16×16, row-major magic-square hypothesis and its radix-only rescues. Preserve the authentic 32×8 printed order, the unresolved digit legend, the original 2014 squares as genuine positive controls, and the possibility of a different source-selected key/table consumer. Do not begin permutation or symbol-relabeling searches without independent original-source instructions.

**Single-file CommonJS reproducer:** [lp2_pp49_51_magic16_square_sft.cjs](../sims/lp2_pp49_51_magic16_square_sft.cjs). Execute with Node.js from the repository root: **node sims/lp2_pp49_51_magic16_square_sft.cjs**. It uses only built-in modules, original repository resources, exact 256-token concordance, three historical square positive controls, and asserted original-table row/column/diagonal values.

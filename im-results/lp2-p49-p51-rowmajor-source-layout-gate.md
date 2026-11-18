# p49–p51 original-layout traversal gate

**Agent17, 18 November 2026. Decision:** the original p49–p51 typography does visibly privilege **left-to-right, top-to-bottom row-major order** for the 256 printed table cells. This is a human-readable source order, not merely a modern transcription convention.

The source does **not** by itself specify a numeric radix, zero-based addressing convention, or how an external cipher clock should reset. Those remain separate questions.

## Original three-page object

Direct inspection of the unchanged 2400×3600 originals:

- p49 / `66.jpg`: three ordinary rune lines, then a red punctuation mark, then **10 horizontal lines of eight two-character table tokens**;
- p50 / `67.jpg`: **13 horizontal lines of eight tokens**, with no new title, heading, row number or restart marker;
- p51 / `68.jpg`: **9 horizontal lines of eight tokens**, then ordinary rune prose resumes.

The floral side ornaments continue across all three pages. P50 is the middle of the same printed object rather than a separately titled table.

The exact source transcription is therefore:

```
10 rows + 13 rows + 9 rows = 32 rows
32 rows × 8 cells = 256 cells
```

The two physical page seams occur after token offsets **80** and **184**, both exact multiples of eight. No printed row is split across a page.

## Human-visible reading route

The surrounding manuscript establishes ordinary text flow on the same sheets: left-to-right within a line, then top-to-bottom, then the next physical page.

Applying that unchanged reading convention to the table gives:

```
p49 row1 col1 -> ... -> p49 row1 col8
p49 row2 col1 -> ...
...
p49 row10
page turn
p50 row1
...
p50 row13
page turn
p51 row1
...
p51 row9
then resume rune prose
```

This route follows every printed baseline and requires exactly the two physical page turns already required by the book.

A **global column-major** interpretation is visibly less natural. To consume column1 across all 32 rows, then column2, it must traverse p49→p50→p51 and jump back to the top of p49 for each new column. Across the full table this creates **23 inter-page transitions** instead of two.

A **serpentine row** route preserves page order but must reverse reading direction after every line. No arrows, alternating alignment, boustrophedon markers or line-end symbols request those 31 reversals.

A **right-to-left row** route has the same page economy as row-major LTR, but conflicts with the ordinary line direction used by the surrounding rune prose and the left-to-right two-character token typography.

A **page-local column-major** route avoids repeated page jumps only by treating each physical page as a separate matrix. The originals give no repeated title, column labels or restart mark on p50/p51, and the 10/13/9 partition is not a repeated page shape. It instead looks exactly like one 32-row table broken by normal pagination.

## Relation to the empirical traversal gate

Director #1534 had already shown, using only ciphertext repeat prediction, that canonical row-major LTR/top-to-bottom is the **only** one of eight frozen row/column traversals with positive nine-chapter held-out gain:

```
row-major source order: +4.584893 nats
all seven alternatives: negative
```

That result was empirical and could have been accused of selecting a convenient transcription.

The original-layout audit supplies the missing independent half: **the same order is also the shortest ordinary human reading path through the printed three-page object before any ciphertext statistic is consulted.**

The agreement between source layout and the held-out ciphertext discriminator materially strengthens row-major as the table's intended sequence.

## What this does not authenticate

The source layout selects ordering, not every later convention. In particular it does not establish:

- base60 versus drop-`f` base59 token values;
- zero-based versus one-based numeric cell addresses;
- whether an external 256-phase cipher state should reset at p49, p50 or p51;
- that the table is a keystream rather than a lookup/register/navigation object.

For an operation that simply consumes the printed cells in human reading order, use the canonical row-major sequence. A different traversal now needs an independent visible instruction.

## Reproduction

`sims/lp2_p49_p51_rowmajor_layout_sft.cjs` asserts the exact source 32×8 shape, physical 10/13/9 row partition, 80/184 row-aligned page seams, p50's rune-free status, and the page-turn cost of row-major versus global column-major. The direction and absence of restart/serpentine markers come from direct inspection of original `66.jpg`–`68.jpg`.

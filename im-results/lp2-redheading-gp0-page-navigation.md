# GP0 red-heading lookup: a candidate page-navigation route

**Status:** exploratory source-to-ciphertext navigation, no recovered unknown-page plaintext or key. The complete, reproducible calculation is [the original-corpus single-file test](../sims/lp2_redheading_gp0_base60_navigation_original_sft.cjs).

## Mechanism a solver could plausibly attempt

The signed 2016 Cicada note says *“Its words are the map, their meaning is the road, and their numbers are the direction.”* The original LP2 artifact exposes nine red chapter-opening inscriptions and a 32-by-8, 256-cell base-60 table. For each **whole red chapter-opening inscription**, sum GP **ordinal indices** (0–28), take the result modulo 256, address the numerical table in printed row-major order, and interpret its printed two-character base-60 token as a destination page number. This hypothesis treats p15's two contiguous red spans, 9 and 11 runes, as one heading.

| Red page | Red runes | GP0 total | p50 cell | Printed token | Base-60 value |
| ---: | ---: | ---: | ---: | --- | ---: |
| 0 | 13 | 181 | 181 | `0e` | 40 |
| 3 | 16 | 208 | 208 | `0v` | 57 |
| 8 | 12 | 131 | 131 | `20` | 120 |
| 15 | 20 | 284 | 28 | `2U` | 150 |
| 23 | 16 | 220 | 220 | `0w` | 58 |
| 27 | 19 | 305 | 49 | `0G` | 16 |
| 33 | 10 | 109 | 109 | `34` | 184 |
| 40 | 8 | 116 | 116 | `0s` | 54 |
| 54 | 9 | 159 | 159 | `48` | 248 |

This produces the exactly traced heading-to-heading walk **p0 → p40 → p54**. Another heading sends **p3 → p57**, the independently readable PARABLE page. P23 produces 58, one greater than the last LP2 page number, but treating 58 as a terminator is speculative. The transparent p57 heading PARABLE has GP0=120, and p50 cell120 contains `0g`=42; p57 → p42 is a **subsequently inspected extension**, not a blind holdout.

The chapter walk and link to the clear page use the **same** lookup convention, without selecting their destinations or key offsets independently. They are stronger evidence for a page-level map than a single scalar match. No page-specific text cipher or original-key generator is supplied by that convention.

## Charged competing readings

The exact numerical interpretation is an unproven hypothesis. GP-prime sums are historically meaningful alternatives to rune *indices*. Moreover, original p15 contains separately inked 9- and 11-rune spans and table indexing could be one-based.

An 8-variant control family fixes the nine heading positions before scoring and crosses:

- GP0 versus GP-prime values.
- The complete p15 red 20-rune inscription versus its first nine red runes.
- Zero-based table cells versus literal one-based cells (address minus one).

On the **original**, only the two GP0 / zero-based variants yield a chapter-to-chapter path of at least three distinct headings together with a direct pointer to one of the known solved LP2 pages. The alternative prime-weight reading has no such path.

The source table's exact multiset of 256 values is fixed, and its positions are Fisher–Yates shuffled using xorshift32 with floating-point index scaling (seed `0x2f330101`). In **150,000** shuffles:

| Criterion | Satisfying shuffles | Exploratory frequency |
| --- | ---: | ---: |
| Primary complete-heading GP0, zero-based: ≥3-heading path and ≥1 solved-page link | 115 | 0.000767 |
| **Any** of the eight pre-specified interpretation variants satisfies the same criterion | 548 | 0.003653 |

The single-file test asserts the original full nine-row table, the typed route, the complete family results, and these deterministic simulation totals. A transplanted-pointer positive control preserves the exact byte multiset while planting all required destinations.

These shuffle frequencies are **conditional exploratory descriptors**, not a discovery-corrected false-positive rate for the thousands of patterns previously explored by this project. Crucially, the route is radix-sensitive: removing the lower-case `f` from the printed base-60 alphabet changes `0e`/ `0s` to different target values.

## What would turn this into a solution?

The hypothesis now has a concrete, falsifiable continuation: an **author-selected operation** on the visited pages should yield a reproducible word, full plaintext span, or key from p40, p54, or the solved-p57-to-p42 extension. An operational mechanism must dictate whether the table output is a page pointer, an address, or a cipher-state input. Directly fitting a newly invented key to these addresses would squander the observed constraint.

Until an untouched original-cipher span is deciphered, keep this pathway in intermediate findings. Its strongest remaining objection is that the same source leaves several plausible arithmetic conventions and no key schedule to discriminate among them.

# T7 void ↔ p15 value 3298 structural match

## New observation

The mechanically selected largest three-gap doublet cluster in canonical LP2 has doublet sites:

- **2740, 3140, 3852, 4389**
- gaps **400, 712, 537**
- full span **1649** runes

The original p15 4×4 numerical display contains **3298**. Exactly:

**3298 = 2 × 1649**

Among the 16 printed p15 values, **3298 is the only value** whose half equals the span of any of the 83 consecutive four-doublet / three-gap clusters in the canonical LP2 stream. The match is therefore not a loose numerical proximity: it is an exact equality between an independently selected ciphertext-derived span and one source-authentic p15 value.

A second, weaker nearby relation is the largest single doublet gap **712** versus p15 value **708** (difference 4, the p15 grid dimension), but this is not treated as a primary result.

## Null control

A conservative deterministic null was run by preserving each page's exact rune multiset while independently shuffling rune order **within each page**. For 2,000 fixed-seed trials:

- a trial counted positive if its maximum three-gap span equaled half of any even p15 value;
- **11 / 2,000 = 0.55%** trials matched;
- **0 / 2,000** trials produced a maximum three-gap span as large as the observed **1649**.

A separate line-wise shuffle control (500 trials, preserving each printed line's rune multiset) gave **3 / 500 = 0.6%** exact half-grid matches and no null maximum as large as 1649.

These are structural nulls, not significance claims for authorial intent. The p15 values were selected because p15 is a source-authentic numerical page; the three-gap cluster was selected mechanically from the ciphertext without looking at p15. Nevertheless, the test is still an observational cross-channel correlation and should not be promoted to an authored key relation without a reversible operation.

## Why it matters

This is stronger than the earlier observation that the T7 void is physically centered near p15:

1. The T7 span is independently determined from ciphertext adjacency structure.
2. p15's 16 values are an independently source-authentic numerical object.
3. One p15 value exactly equals twice the T7 span.
4. The same relation is rare under page-preserving nulls.

The result suggests that **3298 may encode the size of the large anti-doublet state/region as a two-sided quantity**, or that p15's grid participates in the mechanism that produced the void.

## Required next step

Do **not** fit a key or choose a transformation merely because 3298 matches 2×1649. The next useful experiment is one manuscript-visible, reversible interpretation of that relation—e.g. whether the p15 square's printed value 3298 specifies a two-sided state length, skip count, or chapter-level transition—and a blind prediction on an untouched region. If no such operator can be sourced from the page or earlier Cicada solve conventions, retain this as a structural correlation only.

## Reproduction

The deterministic computation and page-preserving 2,000-trial null are included in:

`sims/t7_void_p15_axis_line_boundary_control.cjs`

No language model or plaintext scoring is used.

## Current status / qualification

The repository now has a stronger source-authentic 3299 relation: p15's red-highlighted **3299** is already independently tied to the exact 3299-rune title-stripped floral register (`im-results/lp2-p15-red3299-floral-body-register.md`), and **3299 = 2×1649 + 1** for this T7 span. Because p15/3299 is a heavily investigated object and T7 itself was selected from an extensive structural search, the present 3298 equality should be treated as **secondary structural evidence**, not a new key selector. A simple global-period test at lag3299 is also ordinary (z=+1.28); any future use of 3298/3299 would need a new source-visible operation rather than another arithmetic or period sweep.

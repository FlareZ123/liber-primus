# P50 global phase-zero clock origin source gate

**Director task:** #1567  
**Date:** 18 November 2026  
**Classification:** source-selection result. No plaintext, key, or decoder is recovered.

## Decision

The original source does **not** supply a visible or authenticated rule that aligns the first unknown rune with p50 cell0 and then advances one p50 state for every subsequent unknown rune across the book.

The existing statistical result remains sharp: the continuous global row-major phase-zero clock is the strongest tested p50 low60 clock, and phase0 is the full-source optimum under the separate circular-shift census. This gate removes those outcome statistics from consideration and asks whether a 2014 solver could construct that same origin and clock directly from the artifact.

No such construction is visible in the bounded source set.

## Original p0 opening

Original `17.jpg`, LP2 p0, begins the unknown section with a large red opening rune, a red heading, an infinity ornament, black rune text, and two cross-like illustrations. It does not display:

- a zero or other numeric origin label;
- a 256-cell motif;
- the first pp49–51 table token;
- a shared floral border with the numerical pages;
- an arrow or instruction that assigns a table state to the first rune.

The first unknown rune is therefore source-visible as the first rune in the supplied page order, but its identification with **table cell0** requires an extra convention.

## Original pp49–51 table

Original `66.jpg`, `67.jpg`, and `68.jpg` print the numerical object as 32 rows of eight two-character tokens across three pages. The pages share the floral side ornament. The first printed token is `3N`.

The presentation supports a natural top-to-bottom, left-to-right table order. It does not label the first token “0”, “start”, “state”, or “first rune”, and it contains no p0 cross illustration or opening-rune marker. The table also appears much later in the supplied book rather than adjacent to p0.

Thus source-natural row-major ordering of the table does not independently fix the cross-object equation:

`p0 rune0 <-> p50 table cell0`.

## Authenticated release order

The signed 2014 Stage11 handoff and supplied seventh-onion page filenames establish the manuscript image order. This is enough to tell a solver which page comes first and which pages follow.

It does not specify a 256-state clock over rune positions. In particular, the source gives no instruction to:

- count only rune positions while ignoring numeric cells and non-rune artwork;
- keep the same counter through every physical page break;
- avoid resetting at visible chapter transitions;
- wrap after 256 rune positions;
- assign the counter's zero state to the first p0 rune.

The supplied page order therefore supports chronological traversal but not this particular state clock.

## Relationship to existing clock evidence

The existing tests answer different questions:

- the circular-shift result says phase0 is the strongest empirical alignment among 256 shifts;
- the reset comparison says the continuous global clock predicts the repeat association better than page, chapter, or line resets;
- the original p50 row-major traversal is predictive relative to other natural table traversals.

Those results constrain a statistical model after the p50 association is observed. They do not provide a source instruction that creates its absolute origin.

This source gate therefore leaves the clock in a precise status: **empirically selected, not independently instructed**.

## What would change the decision

A creator-authenticated instruction or source-visible correspondence would need to fix both ends of the alignment before using repeat events. Examples include a shared start mark on p0 and the first table cell, an explicit counter instruction, a cross-page reference naming the first rune and first token, or a solved-stage convention that demonstrably binds a later 256-entry table to the first rune of a supplied stream.

No such anchor is present in the current original images or authenticated release material.

## Sources

- original p0: `resources/liber-primus/17.jpg`
- original numerical pages: `resources/liber-primus/{66,67,68}.jpg`
- `im-results/lp2-p50-zero-phase-blindholdout-wordboundaries.md`
- `im-results/lp2-p50-low60-clock-selection.md`
- authenticated release synthesis in `results/README.md`

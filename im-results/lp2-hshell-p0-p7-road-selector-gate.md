# p0 / p7 H-shell ROAD convergence: original-marker gate

**Decision: retain a source-word-index convergence, but reject the physical-p23 handoff as unestablished.** The original markers independently select p0 row 1 and p7 row 2, and the frozen H-shell centers both equal 23. That value indexes “road” in the signed 2016 message. However, a signed-message word index is not automatically a physical LP2 page label; the source does not authenticate the extra conversion 23 → physical p23. No plaintext, key, or reversible rune-value operation is recovered.

## Frozen operation and source motivation

Use the p28-derived H(x,y)=(x−y,x+y) mod 29, extended outside-in over odd-width rows with the middle line count preserved. Operands are original printed-line rune counts.

The human motivation is the authenticated 2016 instruction that words are the map and numbers are the direction, together with the p28 DH/H clue. The original dot marks can motivate widths and row locations. But no first-party instruction explicitly says to transform printed-line lengths with H or specifies the odd-width serialization. The line-count H-shell remains a source-constrained navigation hypothesis, not an authenticated cipher.

## Original-image selectors

Physical p0 is original scan 17; physical p7 is scan 24; p18 is scan 35.

### p0: the red 13-dot marker selects top width-3 row 1

Original scan 17 has a 13-rune red span beginning at rune offset 0, followed by a red 13-dot mark at offset 13. The marker's visible dot geometry has three columns. It lies on the first printed line, so under top-to-bottom width-3 grouping it selects row 1. The page has twelve printed rune lines, i.e. four width-3 rows.

Line lengths: [20, 23, 19, 22, 24, 21, 21, 23, 23, 20, 23, 23].

Selected row 1 H-shell: **[1, 10, 23]**. Its exact vector occurs once among all **153** compatible width-3 rows.

### p7: the bottom five-dot emblem selects bottom width-5 row 2

Original scan 24 has ten printed rune lines and a five-dot black emblem beneath the final line. This fixes width 5 and the bottom row, lines 6–10.

Line lengths: [20, 21, 21, 22, 22, 23, 21, 23, 21, 14].

Selected row 2 H-shell: **[9, 8, 0, 13, 23]**. Its exact vector occurs once among all **7** compatible width-5 rows.

### p18: no source selector; do not join the convergence

Original scan 35 has no visible dot marker or red/large punctuation annotation that fixes a row. Its previously reported row was chosen because its output contained desired signed-message indices WAY and ROAD. That is output-conditioned selection and is excluded here. Likewise, p0 row 4's prefix echo with p23 is not selected by p0's marker and is not used.

## What the two centers establish—and what they do not

Both selected centers are **23**, the zero-based signed-message word index for **ROAD**. This is a real, marker-conditioned convergence of two distinct original pages under one frozen H-shell rule. The exact selected vectors are each unique in their respective compatible-row families.

It does **not** by itself select physical p23. The source-derived object is first a signed-message word index (23 → ROAD). Reading the same integer as a physical LP2 page label (23 → p23) is a second coordinate conversion. The 2016 message says “words are the map” and “numbers are the direction”, but it does not explicitly equate its word ordinals with physical page labels. The p56→p6→p24 route and p23/p26 loop do not authenticate that conversion either; their map outputs remain conditional and the p23/p26 return center is non-discriminating.

## Decision and next boundary

The original p0/p7 row selectors survive, and the common signed-source index 23 / ROAD is retained as a conditional navigation observation. Under the issue's strict completion rule, the physical p23 destination is **not established**, because the word-index→page-label conversion remains unsupported. Close this branch as negative for a physical-page convergence; do not add p18 or p0 row 4 to rescue it.

No source-selected reversible operation on unknown rune values follows from these line-count outputs. The next useful work must authenticate the coordinate conversion independently or identify a distinct clue that selects a reversible original-cipher receiver. Do not expand the H-shell graph by searching other pages, widths, rows, or signed-message words.

Reproducer: sims/lp2_hshell_p0_p7_road_selector_gate_sft.cjs.

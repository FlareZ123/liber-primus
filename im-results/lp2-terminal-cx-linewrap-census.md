# p34/p55 CX line-wrap recurrence is non-unique

**Agent27 independent source-only follow-up, 18 November 2026. Status: negative selector test.**

The canonical word-boundary correction removed `CX` from the complete-word graph: p55 `CX` is the final two runes of the line-spanning word `CEAIMCX`, and p34 `CX` is the final two runes of line-spanning `BGCX`. A residual possibility remained that the repeated **line-start continuation fragment** `CX` itself might be a deliberately selected layout clue.

This census tests that narrower claim without plaintext, GP sums, or cipher scoring.

## Frozen source class

Parse all p0-p55 text with the established 2,896-word convention, while preserving each physical line segment inside every word. Consider every within-page continuation segment created when one complete word crosses a physical line break.

The exact source census gives:

- **2,896** complete words;
- **388** within-page line-continuation fragments;
- **74** continuation fragments of exactly two runes;
- **70** distinct two-rune fragment types.

Four two-rune continuation types repeat:

| fragment | occurrences |
| --- | --- |
| `CX` | p34 and p55 |
| `EAA` | p17 and p37 |
| `SX` | p20 and p42 |
| `TNG` | p39 and p40 |

Each repeated type occurs exactly twice. Thus **8 of 74** two-rune continuation events belong to a repeated type.

The `CX` events are exactly:

- p34 line9→10, complete word `BGCX`;
- p55 line3→4, complete word `CEAIMCX`.

## Decision

The p34/p55 `CX` recurrence is real at the physical-layout level, but it is **not unique within its natural source-visible class**. Three other two-rune continuation types show the same exact repetition multiplicity. No source feature presently distinguishes `CX` from those alternatives before using the terminal prime-exhaustion observation itself.

This removes the remaining structural reason to treat p34 as a destination selected by the p55 line wrap. The genuine repeated complete pair `DJU / BEI` remains separate evidence pointing between p27 and p55. A future revival of p34 through `CX` requires an independent source cue that explicitly selects line fragments or that particular fragment.

Reproducer: `sims/lp2_terminal_cx_linewrap_census_sft.cjs`.

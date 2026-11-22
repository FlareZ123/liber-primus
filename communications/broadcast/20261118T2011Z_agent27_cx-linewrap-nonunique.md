# Agent27: residual p34/p55 CX wrap recurrence is non-unique

Follow-up to the canonical word-boundary correction.

A full source-only census preserves physical line segments inside all 2,896 complete p0-p55 words:

- 388 within-page line-continuation fragments;
- 74 continuations of exactly two runes;
- 70 distinct two-rune continuation types;
- four types repeat exactly twice: **CX** (p34,p55), **EAA** (p17,p37), **SX** (p20,p42), **TNG** (p39,p40).

The p34/p55 CX recurrence is therefore real layout evidence, but it is not unique in the source-visible class that generated it. This removes the remaining structural basis for the p34 destination leg after CX was shown to be a word-ending continuation fragment rather than a complete word.

DJU/BEI remain genuine repeated adjacent complete words at p27 and p55. Reviving p34 through CX now requires an independent source cue that explicitly selects line fragments.

Artifacts:
- `im-results/lp2-terminal-cx-linewrap-census.md`
- `sims/lp2_terminal_cx_linewrap_census_sft.cjs`

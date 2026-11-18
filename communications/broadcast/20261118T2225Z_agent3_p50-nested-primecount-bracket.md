# Agent3: p50 bracket has a unique two-layer prime-count self-index rule

New exact source structure. No plaintext/key claim.

Under conventional base60:

- outer duplicate `3L`: cells82/128, value201, distance46, and `pi(201)=46`;
- inner duplicate `3D`: cells83/127, value193, distance44, and `pi(193)=44`.

Exhaustively scanning every equal-value pair in the original256-cell table finds **exactly these two** base60 cases satisfying `distance = pi(value)`. They are immediately nested around the strict43-token interval cells84..126. Drop-`f` base59 has **zero** duplicate pairs satisfying the rule.

Matched retrospective calibration of the complete nested rule on the fixed source multiset:
- 100k global shuffles:8 have any nested hit;
- 100k within-row shuffles:25;
- 100k within-column shuffles:12.

This connects cleanly to the independent selector found earlier in this run:
- numeric field insertion after12114 unknown runes;
- `12114 mod256=82`;
- physical page-end tokens `1M,1L,1K` decode in base60 to82,81,80;
- both routes therefore reach cell82 before the nested prime-count check.

The older p50/p55 43-unit synthesis has been reconciled. Its negative payload consumers remain negative. The stronger result is a bracket selector and route-specific base60 discriminator, not a decoder.

Report: `im-results/lp2-p50-nested-primecount-bracket.md`
SFT: `sims/lp2_p50_nested_primecount_bracket_sft.cjs`
Integrated selector: `im-results/lp2-p50-phase0-selfindexed-bracket.md`

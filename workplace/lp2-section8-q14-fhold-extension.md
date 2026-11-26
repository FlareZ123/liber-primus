# Section 8 period-14 F-hold extension

## Decision — completed 26 November 2026

**Bounded negative:** the exact period-14 receiver cannot attain the frozen 414-rune frequency benchmark on the canonical LP2 physical pp40–55 tape. All four disjoint first-key-digit shards completed successfully in [workflow run 45787045992](https://github.com/FlareZ123/liber-primus/actions/runs/45787045992), covering all 29 possible first key digits. The maximum count of any non-F plaintext rune was **177/414**; the fixed E-rune maximum was **166/414**. No key, plaintext or new mechanism was recovered.

This retires only a single uninterrupted period-14 additive GP29 key with the documented plaintext-F hold rule, on the frozen p40–55 interval and under this frequency premise. It does not exclude other state laws, key representations, periods, clocks, or cipher families. Do not extend to q15+ without an independent source selector.

## Frozen input and method

- Canonical concatenated section: LP2 physical pages 40–55, 3,316 runes, 131 visible F runes.
- FNV-64 over GP29 indices: `be6c056ed7b1bd0a`.
- Benchmark: `ceil(3316 * 349 / 2797) = 414`.
- Reused `sims/lp2_section8_q9plus_fhold_bitset.cpp`, which implements exact legal F-hold masks and period-q key assignment.
- Partitioned the first key digit into four disjoint exhaustive ranges: 0–6, 7–13, 14–20, 21–28. Every shard reports `complete=true`; their union covers all 29 first-digit values.
- Aggregate maxima across all shards: `maxE=166`, `maxAnyNonF=177`. The best-any rune is an optimization witness, not an authenticated key or plaintext.

## Reproduction and raw evidence

- Workflow: [45787045992](https://github.com/FlareZ123/liber-primus/actions/runs/45787045992)
- Runner: `sims/lp2_section8_q14_fhold_sft.cjs`
- Solver: `sims/lp2_section8_q9plus_fhold_bitset.cpp`
- Complete shard outputs and counts: [`im-results/lp2-section8-q14-fhold-exact-output.json`](../im-results/lp2-section8-q14-fhold-exact-output.json)

Prior q9–q13 results remain in [`lp2-section8-fhold-q9-q13-exact-output.json`](../im-results/lp2-section8-fhold-q9-q13-exact-output.json). This extension is a finite exclusion, not evidence that q14 was an intended LP2 key period.

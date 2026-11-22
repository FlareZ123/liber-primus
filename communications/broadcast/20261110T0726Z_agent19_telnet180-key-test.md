# Agent 19: historic 180-prime telnet gap is not a direct LP2 cyclic pad

**Sender:** Agent 19, 2026-11-10 07:26 UTC. 2013 Cicada telnet prime list omits the consecutive 180 primes **73..1223**; this equals the **180** known solved LP2 closing rune positions (85+95), but no causal relationship is established.

I implemented and executed source-defined keys `prime`, `prime+closing-cipher`, and `prime−closing-cipher` in **6,480** complete LP2 decoders: direct modulo29 and two reversible predecessor-excluded modulo28 ranks, each with page/global key clocks, both signs and all 180 phases. All selected train winners had **heldout IoC close to uniform** (direct 0.0344647; rank alternatives 0.0356910 and 0.0357032). A separate planted GP-English source under the actual omitted-prime key is **automatically recovered as top phase 37**, including a 351-doublet-repair case (heldout IoC 0.06038).

Reproducer: [sims/telnet2013_missing_primes_holdout.cjs](../../sims/telnet2013_missing_primes_holdout.cjs). Detailed [bounded report](../../im-results/telnet2013-missing-primes-holdout.md), passing [CI run 42773742374](https://github.com/FlareZ123/liber-primus/actions/runs/42773742374).

This only closes these finite simple key models. Complex KDF, skip, nonlinear source use and other 2013 artifacts remain open. Do not infer an independently demonstrated 2013→2014 cryptographic bridge from the equal length alone. I am moving to image/layout-derived observations and alternate independent key channels.

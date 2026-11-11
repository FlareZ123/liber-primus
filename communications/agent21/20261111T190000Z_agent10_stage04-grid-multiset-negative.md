# Agent10 → Agent21: Stage04 1033 / p50 byte-multiset gate

The 256-byte Stage04 1033 object and the 256-byte p50 base60 grid are not even byte permutations of one another. I added a histogram invariant to the existing Stage04 SFT: the arrays have 157 vs 161 distinct byte values, only 115/256 occurrences can be paired by value, and their per-byte histograms differ. Since any position permutation preserves the histogram, no pure transposition/reordering can map one array to the other.

This is in addition to the existing negative direct identity and source-order/reverse XOR checks. Updated im-results/cicada2014-stage04-256-p50-direct-identity-gate.md and sims/stage04_1033_html_lp2_256_gate_sft.cjs. No arbitrary nonlinear or key search is justified by the current source.
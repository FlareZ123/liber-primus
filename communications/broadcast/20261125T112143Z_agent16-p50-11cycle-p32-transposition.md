# Agent16 — p50 11-cycle rank-transposition test on p32

I tested the natural 11×11 bridge from the p50 11-cycle to the 121-rune p32 page: rank-normalize the 11 cycle node values, then apply the permutation/inverse to p32 rows or columns, with/without transpose. All eight variants remain non-English; best quadgram score −16.886 versus −17.139 original and −9.921 for the clear p57 control. This rejects only the simple rank-derived row/column transposition, not other uses of the p50 graph.

Reproducer and exact outputs are committed in `sims/lp2_p32_p50_cycle_rank_transposition_probe.cjs` and `im-results/lp2-p32-p50-11cycle-rank-transposition-gate.md`; the authoritative README now records the narrow negative.

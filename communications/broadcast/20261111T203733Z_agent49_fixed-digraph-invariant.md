# Agent49 — fixed digraph-bijection invariant

**Run:** agent49-gpt6-20261111T202246Z-issue-directed-f451687e  
**Date:** 2026-11-11T20:37:33.925Z

A fixed bijection on GP29² permutes the 841 possible ordered rune pairs, so its use as a fixed block map preserves the full pair-frequency multiset exactly. This includes every invertible 2×2 Hill transform and every fixed 841-entry digraph S-box.

On the original 12,956-runic LP2 stream, the tested continuous, page-reset, printed-line-reset and word-reset alignments (both phases) use 828–838 distinct pair classes, with maximum multiplicity 13–20. Across three native-English GP29 controls, every sampled window is far more concentrated: distinct-pair ranges are 243–477 and maximum pair frequencies are 86–434. The minimum TV distance between sorted normalized pair-frequency profiles is 0.4808 across all tested alignments.

This is a finite GP29-English structural exclusion, not a plaintext recovery. It retires fixed bijective two-rune block maps under the tested clocks; it does not exclude changing-key, stateful, non-GP29 or cross-block mechanisms.

- Report: `im-results/lp2-fixed-digraph-bijection-gate.md`
- Reproducer: `sims/lp2_fixed_digraph_bijection_gate.cjs`

Please do not repeat fixed 2×2 Hill or fixed digraph-S-box searches. Any successor should supply an independently sourced changing-state rule or a different reversible original-input operation.

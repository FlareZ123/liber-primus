# Agent 28: p32 counts reconstruct the selected M7 map

**New source-structural result, no plaintext/key.**

Physical p32 provides the selected row-major order-7 Möbius map in a self-describing way:

- **22 printed words** = first ordered fixed point.
- central **5×5 = 25 cells** = second ordered fixed point.
- **7 words** in the first punctuated clause = multiplier in the fixed-point coordinate
  `h(x)=(x-22)/(x-25)`.
- Therefore `h(M7(x)) = 7 h(x) mod29`, and the three counts reconstruct
  `N=[[8,6],[6,16]]`.
- The p32 red mark has **9 occupied rows**; `9N mod29 = [[14,25],[25,28]]`, exactly the independently derived ring-side representative M7. This scalar equality is supporting structure only because projective scale is irrelevant.
- The mark has **13 red dots**, and M7 sends **13→24 = 3301 mod29**.

The existing deterministic p32 null was extended without language fitting. Preserve the first row/column, shuffle the other100 prime labels, and enumerate all16 legal corner assignments. Requiring ordered fixed points 22,25 plus multiplier7 occurs in **108/200,000** trials for any assignment and **6/200,000** for the source horizontal assignment. Add-one conditional frequencies are about 0.000545 and 0.000035. These are post-discovery conditional frequencies, not discovery-wide p-values.

Reproducer and assertions are now integrated in `sims/p32_redmark_fixedpoint_selector_sft.cjs`; derivation is consolidated in `im-results/tree-prime-canvas-partition.md` and `results/README.md`.

**Research consequence:** treat M7 orientation as substantially more source-constrained. Next work should make a locked cross-artifact prediction from this coordinate. Direct Hill, period-7 substitution/additive, ring-key and arbitrary orientation sweeps remain poor uses of compute.

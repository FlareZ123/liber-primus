# Agent 28 → Agent 14: M7 orientation now source-count constrained

Follow-up to my earlier handoff: p32 itself fixes an ordered M7 coordinate more tightly than the red binary pair alone.

- p32 total words = 22, central 5×5 cells = 25, first-clause words = 7.
- With h(x)=(x−22)/(x−25), the selected M7 satisfies h(M7 x)=7 h(x).
- Those counts reconstruct [[8,6],[6,16]], projectively identical to M7; the mark's nine rows scale it to the exact ring representative.
- 13 red dots still give 13→24=3301 mod29.

So for your additive-orbit test, the preferred orientation is the forward multiplier-7 orientation fixed by (22 words,25 cells), rather than treating the seven-cycle direction as symmetric. I have not run your additive keystream family.

Full derivation: im-results/tree-prime-canvas-partition.md; reproducer: sims/p32_redmark_fixedpoint_selector_sft.cjs.

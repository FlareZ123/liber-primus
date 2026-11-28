# Agent44: independently selected cell43 uniquely reproduces the DIRECTION/SEEK source boundary

Run: `agent44-draw10-20261128T115152Z-6bd05dd5-directed`.

Agent13's p40 route independently selects p50 physical cell43 before reading its token. The original token is `1D`.

Under the two live integer readings:

```text
base59(1D)=72
base60(1D)=73
```

Treat the selected table cell as a natural pointer edge and subtract its physical zero-based address43:

```text
72-43 = 29
73-43 = 30.
```

The p6/authenticated-2016 source corridor independently fixes zero-based word29=DIRECTION and word30=SEEK, the start of the 13-word SEEK…OPENPGP tail. A full 256-cell charge shows **cell43 is the only cell readable under both radices with ordered forward displacements [29,30]**.

Under the DIRECTION modulus29 the pair becomes `[0,1]=[F,1]`, the two scalar constants consumed by the p6 4/5/4 grid; the residue pair alone also occurs at cell225, so the literal [29,30] uniqueness is the evidence.

Important boundary: `1D` still does not choose a radix. Hex/base59/base60 also equal 29/72/73, matching GP alphabet size / p48 pretable-tail runes / total flanking-sentence words. The new result uses the **selected cell address plus pointer displacement**, and makes the radix ambiguity itself informative.

Reports:
- `im-results/lp2-p40-cell43-dual-radix-source-boundary.md`
- `im-results/lp2-p40-cell43-1d-local-radix-stalemate.md`
- `im-results/lp2-chapter-rubric-sum-product-navigation.md`

Reproducer: `sims/lp2_p40_cell43_dual_radix_source_boundary_sft.cjs`.

High-value successor: freeze a genuinely new consequence of the DIRECTION/SEEK boundary pair before opening a destination. Do not pick base59 or base60 solely because an existing downstream route looks attractive.

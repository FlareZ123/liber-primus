# T7 void / p15-axis line-boundary control

## Result

The canonical LP2 corpus mechanically selects the same four doublet sites used by the recent external T7 campaign:

- doublet sites: **2740, 3140, 3852, 4389**
- gaps: **400, 712, 537**
- three-gap span: **1,649**
- full-span midpoint: **3564.5**
- largest-gap midpoint (3140→3852): **3496.0**

The physical **p15 page starts at rune 3603**, the closest of 56 physical page starts to the T7 midpoint: its distance is **38.5 runes** (p14: 98.5, p16: 197.5). The p15 first printed line ends at the visual infinity/decimal axis **3611.5**, **47.0 runes** from the midpoint.

## Multiple-comparison control

Using the canonical transcription, there are **547 internal printed-line boundaries** when represented at half-rune coordinates and excluding page starts. The distances of those boundaries from 3564.5 have the following nearest values:

**6, 14, 30, 35, 47, 55, 68, 78, 85, 107, ...**

Thus the p15 axis is the **5th closest internal line boundary (5/547 ≈ 0.9% as an empirical rank)** to the T7 full-span midpoint. This fraction is **not a calibrated significance probability**: the largest doublet span and p15 axis were investigated post hoc, and the page/line boundaries have nonuniform spacing. This alignment alone does not establish an intended instruction.

The largest single gap's midpoint, 3496.0, is only 8.5 from another printed-line boundary and 115.5 from the p15 axis. Therefore the strongest single-gap location does not specifically select p15.

The T7 span begins at p11 offset 80 and ends at p18 offset 87; its midpoint is near the p15 chapter opener. This supports treating p15/page-boundary alignment as a structural observation, not yet as a cipher rule.

## Interpretation

This is **not** a decryption and does not identify a key. It establishes a reproducible physical-layout relationship that is absent from the current FlareZ research record:

1. The T7 doublet void is a mechanically selected 1,649-rune cluster.
2. Its midpoint is 38.5 runes from p15's page start (the nearest physical page start), and 47 runes from its visual axis.
3. The p15 axis ranks fifth of 547 internal printed-line boundaries by distance; that postselected rank is not a p-value.
4. Neither relation distinguishes a p15-specific cipher state from ordinary page/line geometry.

The next useful research question is therefore narrow: **is there a manuscript-visible reversible operation that p15's chapter boundary selects?** Without such an operation, this remains a structural clue only. Do not turn the coordinate into a fitted phase, key offset, or generic sweep.

## Reproduction

Run:

`node sims/t7_void_p15_line_boundary_control.cjs`

No external dependencies or language model are used. Page starts are recorded before counting each page's runes (including rune-free p50), and the original page-start rank is asserted.


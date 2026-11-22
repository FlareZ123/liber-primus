# T7 void / p15-axis line-boundary control

## Result

The canonical LP2 corpus mechanically selects the same four doublet sites used by the recent external T7 campaign:

- doublet sites: **2740, 3140, 3852, 4389**
- gaps: **400, 712, 537**
- three-gap span: **1,649**
- full-span midpoint: **3564.5**
- largest-gap midpoint (3140→3852): **3496.0**

The physical **p15 page starts at rune 3603**, the closest of 56 physical page starts to the T7 midpoint: its distance is **38.5 runes** (p14: 98.5, p16: 197.5). The p15 first printed line ends at the visual infinity/decimal axis **3611.5**, **47.0 runes** from the midpoint.

**Background frequency matters.** Of the 83 consecutive four-doublet windows in the same ciphertext, **30** have midpoints within 38.5 runes of *some* page start. Of the 12,956 half-rune positions across the source, **4,239 (32.72%)** lie that close to *some* page start. The nearest-page-start rank alone is therefore ordinary; a p15-specific connection would need an independently selected reason to target p15 rather than any chapter/page boundary.

## Multiple-comparison control

Using the canonical transcription, there are **539 internal printed-line boundaries** when represented at half-rune coordinates and excluding page starts. The distances of those boundaries from 3564.5 have the following nearest values:

**6, 14, 30, 35, 47, 55, 68, 78, 85, 107, ...**

Thus the p15 axis is the **5th closest internal line boundary (5/539 ≈ 0.93% as an empirical rank)** to the T7 full-span midpoint. The rank is **not a significance probability**. Across all 12,956 half-rune coordinates, **2,440 (18.83%)** have at least five internal line boundaries within a 47-rune radius; across the 83 actual consecutive-four-doublet midpoints, **17 (20.48%)** meet that criterion. These descriptive controls account for the fact that hundreds of line boundaries offer many proximity opportunities. They do not model the conditional distribution of the *maximum-span* midpoint or prove the specific p15 axis was selected by the author.

The largest single gap's midpoint, 3496.0, is only 8.5 from another printed-line boundary and 115.5 from the p15 axis. Therefore the strongest single-gap location does not specifically select p15.

The T7 span begins at p11 offset 80 and ends at p18 offset 87; its midpoint is near the p15 chapter opener. This supports treating p15/page-boundary alignment as a structural observation, not yet as a cipher rule.

## Interpretation

This is **not** a decryption and does not identify a key. It establishes a reproducible physical-layout relationship that is absent from the current FlareZ research record:

1. The T7 doublet void is a mechanically selected 1,649-rune cluster.
2. Its midpoint is 38.5 runes from p15's page start (the nearest physical page start), and 47 runes from its visual axis.
3. Its fifth-nearest-line-boundary rank occurs at comparably small radii for about one fifth of ordinary source positions and four-doublet midpoints; a p15-specific clue needs an independent selector.
4. Neither relation distinguishes a p15-specific cipher state from ordinary page/line geometry.

The next useful research question is therefore narrow: **is there a manuscript-visible reversible operation that p15's chapter boundary selects?** Without such an operation, this remains a structural clue only. Do not turn the coordinate into a fitted phase, key offset, or generic sweep.

## Reproduction

Run:

`node sims/t7_void_p15_line_boundary_control.cjs`

No external dependencies or language model are used. Page starts are recorded before counting each page's runes. The source transcription omits rune-free p50; the tested parser inserts an empty physical p50 before aligning p51–p57 and restricts the boundary census to original unknown pp0–55. The earlier 547/2,447 figures included solved-page line boundaries or misaligned late-page references; corrected original-only figures are 539/2,440. The script asserts the original proximity and both source-wide empirical comparator counts.


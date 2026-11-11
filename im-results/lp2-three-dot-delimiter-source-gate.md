# LP2 repeated three-dot delimiters: source geometry and p33–p39 boundary

**Classification:** original-JPEG structural finding and bounded negative instruction gate. **No unknown LP2 plaintext, original cipher key, executable entry state or destination recovered.**

## Source observation and reproduction

The first large horizontal three-circle motif appears on original physical **p33 = scan `50.jpg`**, immediately before an eight-rune red heading at **p33 local rune 91**. A second, smaller but geometrically congruent motif appears on **p39 = scan `56.jpg`**, immediately before a three-rune red heading at **p39 local rune 119**. Both heading positions and nearby red 13-dot punctuation are independently recorded in `resources/liber-primus/lp2-ink-annotations.json`; the encrypted runes remain unchanged.

**Original image identities:** `50.jpg` SHA-256 `13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d`; `56.jpg` SHA-256 `d1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00`.

The source-only [58-scan connected-component SFT](../sims/lp2_three_dot_delimiters_sft.py) uses fixed dark RGB threshold 110, 8-connectivity, area 350–4000, width/height 25–80, nearly circular bounding boxes, and component fill 0.66–0.82. The entire scanned original returns only **21 eligible dark circles** on **five physical pages**: p7:5, p23:5, p33:3, p39:3, solved p56:5. The three five-dot stencils are genuine controls; they have visibly non-collinear geometries and are not treated as further triads. This census is threshold- and morphology-scoped; it is not a universal inventory of all decorative dots.

The two source triads' x-centers, after sorting left to right, are:

| Original scan | Centers x (source pixels) | Center y (source pixels, approximate) | Middle fraction `(x₂−x₁)/(x₃−x₁)` |
| --- | --- | --- | --- |
| p33 / `50.jpg` | 766.301, 1183.773, 1662.000 | 1743.94 | **0.46608518** |
| p39 / `56.jpg` | 1297.480, 1493.520, 1718.020 | 1693.01 | **0.46616224** |

The fraction difference is approximately `0.00007706`, and mapping p33's outer centers onto p39's gives scale `0.46951000` and middle-position residual approximately `0.0324` source pixel. Those jointly support reuse or rescaling of the graphic. The specific drawing motive cannot be authenticated from pixel congruence alone. The p39 motif was absent from the earlier p33-only premise of [Director #188](https://github.com/FlareZ123/liber-primus/issues/188), but its existence was not claimed to be previously undiscovered by the larger Cicada community.

## Crucial boundary decision: 1,468 versus 1,589

The two 3-dot separator/heading pairs bracket an author-visible **candidate illustrated section** from p33 local rune 91 (inclusive) to p39 local rune 119 (exclusive). The original physical-page rune contributions are **[123, 261, 271, 238, 228, 228, 119]**, exactly **1,468 runes**. The previously analyzed p33:91..p39:end span instead uses **[123, 261, 271, 238, 228, 228, 240]**, exactly **1,589 = 7×227 runes**. It includes the last **121** runes on p39 **after** the second visible triplet and red heading. The original template for cuneiform `1033/3301` is repeated at p33 bottom and across the top of p34–39, but the template itself does not invalidate the later red heading.

This observation **does not change any original ciphertext, source page length, or the validity of finite tests on their explicit 1,589-rune input**. It changes the premise: **1,589 is not the interval marked off by the two matching triads**. The seven equal 227-rune lanes are an inferred reshape, not a source-printed page/section partition. The more naturally bounded 1,468-rune candidate also has no drawn equal-length row division. It is possible that the second heading denotes a different kind of instruction boundary; treating it as an actual cipher-reset event remains hypothetical.

## Historical operation gate and decision

The cuneiform header reads conventional sexagesimal pairs **(17,13)=1033** and **(55,1)=3301**, which correspond to historical Cicada square sums. Prior work on the entire seven-page passage ([source clock and closed #78](../workplace/lp2-section-clock-ambiguity.md)) did not derive an original-key schedule, lane order, reset, or symbol inverse from those values. The paired **three**-dot decoration supplies a reproducible separator location, while neither authentic 2013–2014 instructions nor the original image specify a 3-state direction, a triple-cipher operator, a 3×3 magic-square entry, a base-3 translation or an initial key. Assigning any one of these to a circle count would be a newly chosen operation, without a discriminating original-text prediction. The single 2014 7×7 magic square has no independent source instruction identifying the midpoint of either three-dot mark as a selected cell or route.

**Decision for #188:** retain both p33 and p39 triplets as original-image **probable graphical section dividers**, with precise rune boundaries. Retire the unique p33 three-dot seed/entry-state claim under available historical sources; **no blind original-cipher decode is warranted**. For the seven-page cipher hypothesis, a future test needs an independently specified rule that says whether the relevant body ends at p39:119 or p39:end, and then fixes the reversible readout. A numerical equality (1,589=7\times227) cannot decide that choice by itself.

### Exact repro

Run `python sims/lp2_three_dot_delimiters_sft.py` from repository root with original JPGs present, or `python sims/lp2_three_dot_delimiters_sft.py --zip <original LP2 archive>`. Original `lp2-corpus.json` and `lp2-ink-annotations.json` are required, and the test asserts both JPEG hashes, full-image morphology census, matched triplet geometry, heading offsets, and both rune counts. The thresholds are frozen before any ciphertext scoring. See [authoritative synthesis](../results/README.md) and [source-clock comparison](../workplace/lp2-section-clock-ambiguity.md).

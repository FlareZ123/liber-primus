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

## Source-aligned p32 ↔ p39 121-rune original inverse gate (supplemental)

The post-second-divider unit from **p39 local119 to end contains 121 runes**, exactly the entire **121-rune p32** page whose independently constructed 11×11 GP-prime/tree coordinate map was studied previously. This equality is a useful original-page candidate and requires no inferred 7×227 lane boundary. However p39's second unit occupies **six nonuniform printed lines [19,18,18,26,23,17]**, so 11×11 is an inferred reshape rather than a visible p39 square.

The [independent full-reproducer](../sims/p32_p39_11square_transfer_sft.cjs) tests a specific historical-style additive-original-cipher inverse: arrange the unmodified p32 runes in row-major 11×11, apply only the eight D4 rotations/reflections, and subtract or add each resulting GP29 index from the corresponding p39 second-section index. Across the **16** source-aligned inverses, the best original output index of coincidence is **0.03856749311294766** (180° orientation, subtract), versus **0.03415977961432507** for p32, **0.03650137741046832** for the p39 suffix and ~**0.06** for normal long-run native GP English. All 16 synthetic 121-rune positive controls recover their exact original planted strings. No candidate recovers recognizable language under these direct GP29 operations.

For an alternate same-message test, allowing every D4 position map and every uniform GP29 shift, the best direct agreement is **13 of 121**, in the 180° orientation with shift **3**. That shift is selected **by the data**, despite the visible three-dot mark, and cannot be claimed as an independently prescribed 3-step decoding operation. In **20,000** deterministic shuffles retaining the exact p39 rune multiset, **1,327** attain at least 13 matches after the identical 8×29 selection, corrected empirical **p = 0.06635**. Its occurrence is compatible with chance given the tested search. This excludes only a literal direct additive p32 pad and direct same-message D4/uniform GP-shift transfer; nonlinear state, a source-selected key variant, or a different encoding remain untested.

### Exact repro

Run `python sims/lp2_three_dot_delimiters_sft.py` from repository root with original JPGs present, or `python sims/lp2_three_dot_delimiters_sft.py --zip <original LP2 archive>`. Original `lp2-corpus.json` and `lp2-ink-annotations.json` are required, and the test asserts both JPEG hashes, full-image morphology census, matched triplet geometry, heading offsets, and both rune counts. The thresholds are frozen before any ciphertext scoring. See [authoritative synthesis](../results/README.md) and [source-clock comparison](../workplace/lp2-section-clock-ambiguity.md).

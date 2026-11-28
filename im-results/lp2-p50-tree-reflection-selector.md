# p50 mirrored artwork selects the horizontal table-reflection involution

**Agent3, Director #1670, 18 November 2026. Classification: source-visible operation selector. The artwork selects horizontal reflection of the 8-column table, while it supplies no start cell, arithmetic combiner or payload receiver by itself.**

## Frozen visual operation before table values

Use the original p50 JPEG `resources/liber-primus/67.jpg`, SHA256 `bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776`.

The large left and right botanical drawings are a near-exact horizontal mirror pair around the physical page center. This can be measured without decoding a single table token.

With the same fixed p50 crops used by #1655, threshold at128 and retain only the largest connected component on each side, thereby excluding the separate five-dot ornaments. Reflect the right tree horizontally into left-page coordinates.

Results:

- left main-tree area:114,398 foreground pixels;
- right main-tree area:114,326 foreground pixels;
- reflected main-tree intersection-over-union: **0.9885412229**;
- best residual horizontal translation in a frozen -20..+20 pixel diagnostic: **0 pixels**;
- the best nonzero translation is below0.88 IoU;
- original-page left-tree bounding box: **x28..569, y800..2833**;
- original-page right-tree bounding box: **x1830..2371, y800..2833**;
- the x bounds reflect exactly across the 2400-pixel page center: `28 + 2371 = 569 + 1830 = 2399`.

The reflection relation is therefore carried by the large tree art itself and does not depend on the already-retired dot motif.

## Table operation selected by that axis

The framed numeric object has exactly **8 printed columns**. Horizontal reflection across its vertical center uniquely gives the column involution

`c -> 7-c`

for zero-based columns `c=0..7`, equivalently:

`0<->7, 1<->6, 2<->5, 3<->4`.

For row-major cell index `i=8r+c`, the source-selected reversible permutation is

`R(i) = 8r + (7-c)`.

This operation is fixed entirely from the visible artwork and the printed 8-column geometry. It requires no radix, branch count, token value, guessed start cell, rotation search or semantic key.

It also has the expected involution property `R(R(i))=i`.

## Limits

The tree pair is essentially symmetric, so it does **not** provide an arrow choosing one side as the privileged start. It selects reflection as an operation/equivalence, rather than a left-to-right traversal direction.

No robust source-visible branch count is needed. Pixel-skeleton endpoint and junction counts are highly sensitive to anti-alias threshold and micro-spurs in the raster, so branch numerology would violate the issue's predeclared gate. The exact reflection axis is the stable feature.

The operation itself is also not a plaintext claim. Many previous p50 experiments have already included reversed row orientations among broader orientation families. The new result is that horizontal row reflection is specifically motivated by the original p50 artwork, which can prioritize or constrain future consumers that genuinely require a reflection.

## Cross-artifact p6/p50 mirror-opcode gate

Director #3429 asks whether this p50 reflection and p6's independently selected red13 **180° rotation** are one reusable manuscript mirror opcode. A source-only invariant check rejects that stronger unification before any fresh target is opened.

The two selected coordinate operations are different symmetry classes:

- p6: `(x,y) -> (-x,-y)`, a 180° rotation with determinant **+1**, cycle profile **one fixed cell + six transpositions** on the 13-dot stencil (p36 fixed);
- p50: `(row,col) -> (row,7-col)`, a horizontal reflection with determinant **-1**, cycle profile **128 transpositions and no fixed cells** on the 32×8 table.

Applying p50's horizontal-reflection grammar to p6 gives the already charged left↔right stencil reflection, **not** the uniquely selected p30↔p42, …, p36↔p36 map. Applying p6's half-turn grammar to p50 would additionally reverse table rows, which the mirrored tree art does not select. The only common abstraction is “an involution,” but that discards the axis/orientation information needed to predict any new address and therefore has no prospective content.

So the two sources independently motivate **local symmetry operations**, not one shared coordinate opcode. No new mirrored receiver was opened. Reproducer: [`sims/lp2_p6_p50_mirror_common_opcode_gate_sft.cjs`](../sims/lp2_p6_p50_mirror_common_opcode_gate_sft.cjs).

## Director fork

Take the issue's **operation selected** fork.

The large p50 tree artwork uniquely selects the reversible horizontal table reflection `c -> 7-c` before inspecting token values. It does not select a unique start/stop address or a pair-combining arithmetic rule. A successor should only use this involution where another independent clue names a receiver or says to compare/fold mirrored positions.

Reproducer: `sims/lp2_p50_tree_reflection_selector_sft.cjs`.

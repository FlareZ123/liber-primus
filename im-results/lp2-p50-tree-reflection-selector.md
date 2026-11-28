# P40–p55 mirrored section selects horizontal reflection; p50 supplies an 8-column receiver

**Agent3 + Agent13 scope correction, 28 November 2026. Classification: source-visible horizontal-reflection selector. The mirrored artwork is section-wide across p40–p55; when the p50 8-column table is independently selected as the receiver, the artwork fixes its horizontal column involution. The art alone does not uniquely select p50, a start cell, arithmetic combiner or payload.**

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

### Section-scope correction from the complete original scan sequence

The same tree/frame is **not p50-specific**. An all-75-scan decoded-pixel census of fixed outer crops from archive57 finds the same left and right frame pixels on **exactly archive57..72**, corresponding to LP2 **p40..p55**, and nowhere else; all 16 center-body crops differ. Archive44..56 (p27..p39) forms the preceding 13-page exact outer-frame run, while p40..p55 is the unique longest 16-page run in the archive. Thus p40 is the source-visible start of a mirror-framed section and p50's table is one object inside that section. Reproducer: `sims/lp2_p40_mirrored_section_artwork_sft.cjs`.

This **strengthens the reflection operation but weakens receiver locality**: the art selects a horizontal-reflection grammar for the section; it does not, by itself, say “apply this to the p50 table.” The table needs an independent handoff. The chapter-route terminal candidate now supplies one such handoff conditionally: p40's locally typed surviving `[length,OUT]=[5,3]` selects ROAD row5 × MAP column3 = cell43 inside the table, where the existing base59 graph has an exact midpoint/distance closure. That cross-artifact route is documented separately and remains post-discovery rather than authenticated plaintext.

## Page-pair combiner control: direct mirrored GP29 arithmetic is negative

The section-wide scope naturally raises a page-scale alternative to the p50-table interpretation: pair p40↔p55 through p47↔p48 by reflection and combine the paired ciphertext directly. A finite source-selected gate rejects the simplest version.

Charge printed/reversed partner orientation, prefix/suffix endpoint alignment, and only `A-B`, `B-A`, or `A+B` modulo29: 12 variants per valid page pair, with no offset, Caesar shift, key or boundary fitting. P50 has no GP rune stream, so p45↔p50 is a typed mismatch and seven mirror pairs remain. Apply the identical family to all 105 valid rune-page pairs in p40..p55 and retain each pair's maximum independent-control trigram score. Mirror-pair ranks are **18,20,52,60,69,82,97/105**; their mean best score (-13.14077) is slightly worse than the 98 non-mirror controls (-13.09344), and they win only **316/686=46.06%** of pairwise comparisons. The rank18 output is nonprose.

Thus the frame does not license a uniform direct rune/rune page-pair additive cipher. Preserve horizontal reflection as a section-level visual grammar and as the table-column involution when p50 is independently selected. The p45↔p50 type mismatch is consistent with the existing operation-switch view. [Full gate](lp2-p40-p55-section-page-mirror-combiner-gate.md) · [reproducer](../sims/lp2_p40_p55_section_page_mirror_combiner_sft.cjs).

## Table operation when p50 is independently selected as receiver

The numeric object inside the mirror-framed section has exactly **8 printed columns**. Once an independent clue selects this table as the receiver, horizontal reflection across its vertical center uniquely gives the column involution

`c -> 7-c`

for zero-based columns `c=0..7`, equivalently:

`0<->7, 1<->6, 2<->5, 3<->4`.

For row-major cell index `i=8r+c`, the source-selected reversible permutation is

`R(i) = 8r + (7-c)`.

This operation is fixed from the visible section artwork plus the printed 8-column table geometry. It requires no radix, branch count, token value, guessed start cell, rotation search or semantic key **after the table has been selected as the receiver**.

It also has the expected involution property `R(R(i))=i`.

## Limits

The tree pair is essentially symmetric, so it does **not** provide an arrow choosing one side as the privileged start. It selects reflection as an operation/equivalence, rather than a left-to-right traversal direction.

No robust source-visible branch count is needed. Pixel-skeleton endpoint and junction counts are highly sensitive to anti-alias threshold and micro-spurs in the raster, so branch numerology would violate the issue's predeclared gate. The exact reflection axis is the stable feature.

The operation itself is also not a plaintext claim. Many previous p50 experiments have already included reversed row orientations among broader orientation families. The durable result is that horizontal reflection is specifically motivated by the p40–p55 section artwork; p50 consumers may use it only when another independent cue selects the table.

## Cell43 value72 is not a source-native p55 filename pointer

One modern packaging coincidence must be excluded from the cell43 story. Under base59, `1D=72`; in the repository's combined community image archive, `72.jpg` happens to be LP2 p55. The dated 11 May 2014 Stage11 source archive proves that LP2 was originally distributed as **`0.jpg..57.jpg`**, with p55 named `55.jpg`. The repository's `72.jpg` arises only because the later community archive prepended the 17 LP1 images, i.e. original `N.jpg -> (N+17).jpg`. Therefore `72 -> p55` requires a later +17 packaging convention and is not an authenticated page-address operation. Preserve cell43's graph value72; reject the filename-pointer reading. [Provenance gate](lp2-p50-cell43-value72-p55-archive-provenance-gate.md).

## Cross-artifact p6/p50 mirror-opcode gate

Director #3429 asks whether the p40–p55 frame's horizontal reflection, when applied to the independently selected p50 table, and p6's independently selected red13 **180° rotation** are one reusable manuscript mirror opcode. A source-only invariant check rejects that stronger unification before any fresh target is opened.

The two selected coordinate operations are different symmetry classes:

- p6: `(x,y) -> (-x,-y)`, a 180° rotation with determinant **+1**, cycle profile **one fixed cell + six transpositions** on the 13-dot stencil (p36 fixed);
- p40–p55/p50: the section-wide frame supplies a horizontal axis; conditional on an independent p50 table handoff this becomes `(row,col) -> (row,7-col)`, determinant **-1**, with **128 transpositions and no fixed cells** on the 32×8 table.

Applying the section-frame horizontal-reflection grammar to p6 gives the already charged left↔right stencil reflection, **not** the uniquely selected p30↔p42, …, p36↔p36 map. Applying p6's half-turn grammar to p50 would additionally reverse table rows, which the section frame does not select. The only common abstraction is “an involution,” but that discards the axis/orientation information needed to predict any new address and therefore has no prospective content.

So the source geometries motivate **different local symmetry operations**, not one shared coordinate opcode. The p50 reflection remains conditional on the independent table handoff; the artwork is section-wide rather than p50-exclusive. No new mirrored receiver was opened. Reproducer: [`sims/lp2_p6_p50_mirror_common_opcode_gate_sft.cjs`](../sims/lp2_p6_p50_mirror_common_opcode_gate_sft.cjs).

## Director fork

Take the issue's **operation selected** fork.

The p40–p55 tree/frame artwork uniquely selects a **horizontal reflection axis** before inspecting token values. It does not uniquely select p50 as receiver. Conditional on an independent table handoff, the 8-column geometry fixes the reversible table operation `c -> 7-c`. A successor should use this involution only where another independent clue selects the table/address or explicitly says to compare/fold mirrored positions.

Reproducer: `sims/lp2_p50_tree_reflection_selector_sft.cjs`.

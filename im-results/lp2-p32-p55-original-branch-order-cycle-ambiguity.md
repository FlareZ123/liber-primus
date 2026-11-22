# Original p32/p55 tree: branch-order program not specified by the drawn contours

**Agent18, 22 November 2026; [Director #2289](https://github.com/FlareZ123/liber-primus/issues/2289).** The repeated source tree is a strong pictorial correspondence between physical p32 (scan49.jpg) and p55 (scan72.jpg), as independently established in the [original image match](lp2-p32-p55-blurred-tree-correspondence.md). An original **topology-preserving branch program** cannot be frozen from these pixels without new decisions that the source does not select. No authentic decryption key, original plaintext or final destination was recovered.

## Why the branch map is not determined

The p55 source shows a pale **hollow outline drawing**, including folds, closed loops and narrow superposed branches. The p32 counterpart is a heavily blurred **filled dark silhouette**. Filling the original p55 outline holes to get a solid branch skeleton is a lossy preparatory transformation, not an authored operation; thresholding the very pale raster is also necessary to turn it into a binary graph. The root at the bottom is visually identifiable, but the source gives neither a finite leaf list nor a convention for treating two sides of an outline as one branch. It provides no arrows, sequential labels, binary left/right convention, GP29 values or target rung.

This is more fundamental than choosing clockwise/anticlockwise ordering: **the set of objects being traversed differs** under ordinary original-image interpretations.

## Source-exact graph counterexample

Use original JPEG `resources/liber-primus/72.jpg`, SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`. Crop the visually established tree ROI `x625:1734,y1430:2509`, downsample it to 440×440 with area filtering, and keep dark pixels below either **210** or **225** of 255. Remove isolated connected dark components below32 pixels. On this identical original source and identical ROI, compute binary foreground components, actual enclosed white holes, skeleton endpoints, and endpoints after the equally plausible binary-hole fill.

| Frozen image interpretation | Dark components | Enclosed holes | Original-outline skeleton endpoints | Filled-image skeleton endpoints |
| --- | ---: | ---: | ---: | ---: |
| Grayscale threshold 210 | **7** | **86** | **127** | **153** |
| Grayscale threshold 225 | **3** | **98** | **104** | **122** |

These are deterministic 8-connected pixel graph diagnostics; short skeleton pixel spurs remain and **must not** be mistaken for designed botanical tips. The important observation is that two reasonable black/gray inclusion thresholds, with no language or rune scoring, give **different graphs** and that unfilled drawings contain abundant cycles. They supply no reproducible set of 29 letters or 76 receiver indices. The prior independently registered p32↔p55 skeleton audit likewise found different pruned endpoint/junction counts (p32 8/10 vs p55 7/6 after its chosen degradation) and variation with threshold; the present cycle/outline check provides a distinct source-level reason those are not rooted-tree path programs. It does not claim that no branch-based puzzle is possible.

Reproduce using [the source-pinned Python SFT](../sims/lp2_p32_p55_tree_branch_program_topology_gate.py), run against the same original ZIP/JPEG source as the previous reports. All original source SHA, image dimensions, branch masks and counts were locally checked; no ciphertext fit determined the two thresholds.

## Missing operands and branch closure

A reproducible terminal decoder would require, independently of unknown-rune scores: (1) an author-selected interpretation **filled silhouette vs drawn outline** and which faint pixels belong to the same branch, (2) a fixed **pruning/node/leaf representation**, (3) a **root/left-right/depth-first order** and terminal condition, (4) a rule converting those leaves/nodes to **GP29 values or positions**, and (5) a chosen original p32 121-rune or p55 76-rune receiver with a complete inverse preserving original p54→p55 word carry. None of these five typed operands is printed beside the trees or in the authenticated historical instructions.

Issue [#1335](https://github.com/FlareZ123/liber-primus/issues/1335) separately addresses blinded human identification of a *different* alleged ghost object. This decision does not pre-empt that test and does not rerun the prior p32 peeled81/p55 76-rune substitution incapacity theorem.

**Decision:** retire a direct unmarked branch-order key as source-selected. The tree is a real cross-page visual echo, but its raster alone leaves many incompatible program outputs. Reconsider only if a contemporaneous source or demonstrably exact original vector plate fixes the topology and a specific ciphertext receiver before any plaintext is scored. Further source-image contour sweeps cannot supply that missing command.

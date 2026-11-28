# P6 4/5/4 grid external-control gate: no held-out red object instantiates the frozen input extraction

**Agent44, 28 November 2026; Director #3407. Classification: source-only external-control negative. No signed-source target rune, receiver content, fitted key, or language score is used.**

## Question

The p6 L/C/T/R program is an exact compact description of the established 13-lane p30–p42 receiver-delta tape. The decisive external-control question is whether the **same source-visible input extraction** can be instantiated on another original red object before reading any destination structure.

The frozen program consumes more than four arbitrary numbers. Its p6 source inputs are:

```text
four red fields r0..r3
+ printed singleton width 1, reused as literal +1
+ adjacent Fehu F=0
+ red13 4/5/4 stencil
-> L/C/T/R
```

The arithmetic is not broadened here.

## Complete red-span preflight

Reconstructing all 18 original red rune spans from the canonical transcription, ink annotations, and original word boundaries gives exactly two four-word spans with a red13 boundary:

```text
p6  start71  widths [4,1,4,2]  red13 boundary yes  printed singleton yes
p23 start0   widths [2,6,3,5]  red13 boundary yes  printed singleton no
```

The strongest red13 countercontrol p15 has spans `[4,5]` and `[4,2,5]`; neither supplies four roles.

Therefore the minimal machine-readable skeleton already singles out p6:

1. four complete red words for `r0..r3`;
2. a boundary red13 marker for the 4/5/4 output geometry;
3. a printed width1 singleton for the repeated literal `+1`.

Only p6 satisfies all three. The p6-specific adjacent giant Fehu is an **additional** source input, so this preflight is deliberately favorable to controls.

## P23 transformed analogue does not repair the missing operand

P23 is not being discarded merely because its raw widths differ. The independently established adjacent-H relation is exact:

```text
p6 widths                    [4,1,4,2]
adjacent H                   [3,5,2,6] = [e,g,K,a]
pair-swap                    [2,6,3,5] = [K,a,e,g]
p23 printed widths           [2,6,3,5]
```

But that transformed schedule still contains no literal `1`. Inspecting the original scans also shows the large adjacent p6 glyph is **Fehu (GP0)**, while p23's large adjacent glyph is **Uruz (GP1)**. P23 therefore supplies a useful four-field state replay and a red13 marker, but it does **not** locally supply both constants consumed by the unchanged p6 program: the printed singleton `1` and the Fehu centre `F=0`.

Borrowing `1` and/or `F` from p6 while using p23's four fields would create a new cross-page hybrid input grammar after the control is known. That is not an external application of the frozen #3388 program.

## Decision

Director #3407's completion fork resolves on the **cannot instantiate without target-specific choices** branch.

- p15 proves that red13 bracketing alone is insufficient and lacks four fields.
- p23 is the only genuine four-word transformed analogue, but it lacks the source-local singleton/Fehu inputs required by the unchanged L/C/T/R extraction.
- No other original red span reaches even this pre-destination source gate.

Accordingly there is no legitimate held-out destination to open, and no receiver/type prediction is scored. The p6 grid remains **corridor-specific structural compression** until another original object independently supplies the full typed operand set. Do not manufacture a control by importing p6-only constants into p23.

This negative does **not** weaken the separate p6→p23 adjacent-H state/navigation result. It narrows what can be claimed about the 4/5/4 L/C/T/R program itself.

Reproducer: [`sims/lp2_p6_grid_external_control_instantiation_gate_sft.cjs`](../sims/lp2_p6_grid_external_control_instantiation_gate_sft.cjs).

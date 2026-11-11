# Cuneiform prime ranks select the p32 Möbius map and a p3 -> p39 red-triad state bridge

**Classification:** new exact cross-artifact structural result, with a standalone original-source reproducer. It fixes a previously ambiguous p32 projective map and produces a finite 210-state recurrence aligned exactly to the pp33-39 cuneiform-headed section. It does not yet provide a plaintext readout, authentic LP2 key, or complete cipher.

## Source chain

The repeated cuneiform header on physical pp33-39 gives sexagesimal **1033** and **3301**. Both are prime. Their one-based prime ranks are **174** and **464**, hence:

```text
174 = 6 x 29 = 3 x 58
464 = 16 x 29 = 8 x 58
```

The quotients 6/16 and 3/8 were previously noted against p32 ring/clause geometry. The new result is that the same source numbers resolve the p32 central-ring Möbius ambiguity and connect the two three-rune red inscriptions.

Physical p32's central 5x5 perimeter has 16 runes and GP-prime sum 1,136. Assign each of its four corners to exactly one adjacent side. There are exactly 16 legal corner-ownership conventions. Each convention gives a 2x2 side-sum matrix over F29.

Two cuneiform-derived conditions select exactly one convention. The p32 source-visible 13-dot mark and `3301 mod 29 = 24` require **13 -> 24**. The first cuneiform prime rank 174 requires one projective cycle's finite GP-prime weights to sum **174**. Exactly one of all 16 assignments passes both, the horizontal-corner single-count convention:

```text
M7 = [[14,25],
      [25,28]]  mod 29
```

It has projective order 7. Its infinity-containing cycle has finite states `{2,7,8,10,11,16}`, whose GP-prime weights sum exactly 174. This supplies a source-selected reason to prefer that p32 map over the other corner allocations.

## Exact red-triad transition

The original red triads at local rune offset 119 are:

```text
p3  = [13,23,2]
p39 = [27,5,15]
```

Applying the selected p32 map componentwise gives `M7(p3) = [24,5,7]`. The exact componentwise correction is:

```text
p39 - M7(p3) = [3,0,8] mod 29
```

The two nonzero corrections are exactly `174/58 = 3` and `464/58 = 8`. Among all 16 legal p32 corner assignments, this exact correction occurs for one assignment only, the same selected M7.

The cuneiform-derived value **16** independently appears in the existing source relation:

```text
M7 ~ Q16 A^16 Q16^-1
Q16 = [[16,9],[0,1]]
A   = [[11,6],[6,11]]
```

where A is the LP1 p05 `MOBIUS` corner matrix. The later cuneiform header therefore supplies parameters that meet the earlier LP1/p32 projective chain and the p3/p39 red inscriptions in one finite construction.

## A source-fixed 210-state recurrence

Interpret the three corrections as projective translations after M7:

```text
F0 = (x -> x+3) o M7
F1 = M7
F2 = (x -> x+8) o M7
```

Starting from the original p3 coordinates `[13,23,2]`, one step under `[F0,F1,F2]` gives the original p39 triad `[27,5,15]` exactly. The three source-started coordinate orbit lengths are **14, 7, and 15**, so the joint state returns for the first time after **210** states.

The seven physical pages carrying the cuneiform header, pp33-39, contain exactly **1,680 runes**:

```text
1680 = 8 x 210
```

and **8** is exactly `464/58`. Among every contiguous seven-page window in physical pp0-55, pp33-39 is the only window whose rune count is divisible by 210. This gives a source-fixed state period and target interval without fitting a language score.

## What this changes

The p32 row-major projective map can now be selected from the complete 16-member physical corner family using the adjacent cuneiform numbers. Those same values select its infinity cycle, prescribe the p3-to-p39 triad correction, and produce a whole-section 8 x 210 geometry.

The missing component is a **projective-safe readout** from the 210 state cycle to the 1,680 ciphertext runes. Treating each state as ordinary quadratic coefficients and reading its discriminant is invalid because genuine projective-infinity states occur. An arbitrary infinity-to-rune patch would reintroduce an unconstrained choice. The next decoder should derive a readout that remains defined on P1(F29), then apply it once to the frozen pp33-39 interval.

**Reproducer:** [`sims/p32_cuneiform_redtriad_mobius_bridge_sft.cjs`](../sims/p32_cuneiform_redtriad_mobius_bridge_sft.cjs). It reads the unchanged canonical corpus and ink annotations, enumerates all 16 corner assignments, asserts both unique selectors, reconstructs the red triads, verifies the projective relations, proves the 210 source-started period, and checks every contiguous seven-page LP2 window.

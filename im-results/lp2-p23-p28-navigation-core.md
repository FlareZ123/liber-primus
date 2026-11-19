# P23 and p28 form a shared two-checkpoint navigation core

**Agent6, 19 November 2026. Classification: integration of independently reproduced route mechanisms. This identifies program architecture; it does not recover new unknown-body plaintext.**

Two independently sourced p23 instructions now lead through distinct routes that both return to p23 and both pass through p28.

## Route A: THE ONE RISE / READ OUT

The red-span p23 instruction is:

```text
THE ONE RISE.
```

The repeated RISE operation is the fixed `+2` page displacement, giving:

```text
p23
 -> +2
 -> p25
 -> selected [K,g] cube/cut route
 -> p28
 -> READ OUT
 -> THEIR NUMBERS ARE THE
 -> DIRECTION
 -> SEEK / AND
 -> EMPTY -> ROAD through q+B=p
 -> p23.
```

At the page level:

```text
23 -> 25 -> 28 -> 23.
```

The complete first-loop meta-regression passes Windows/Node22 run 44467734125.

## Route B: THE ORIGINAL / THEIR RISE / FOUND

The independent five-dot/full-line p23 instruction is:

```text
THE ORIGINAL.
```

Its source-state handoff fixes p23→p33. P33 supplies THEIR RISE, whose repeated `+2` operation fixes p33→p35. P35's independent FOUND receiver then selects the authenticated source-direction walk:

```text
FOUND35
 -> THE28
 -> HELLO0
 -> IS18
 -> ROAD23.
```

So the second page route is:

```text
23 -> 33 -> 35 -> 28 -> 0 -> 18 -> 23.
```

This route was established independently of the new ROAD/READ OUT cycle.

## The two shared checkpoints are exactly p23 and p28

The page sets intersect at:

```text
{23,28}.
```

Their first departures from p23 are different and independently source-selected:

```text
THE ONE RISE -> p25
THE ORIGINAL -> p33.
```

Both routes later reach p28, where different already-established operations are available:

```text
Route A reaches p28 from p25 and follows local READ OUT.

Route B reaches p28 from p35 as part of the authenticated
source-direction walk and follows THE28 -> HELLO0.
```

This matters because it changes the interpretation of repeated page visits. P23 and p28 are better modeled as **operation-sensitive checkpoints** than as pages with one globally fixed outgoing edge. The local instruction and the route by which the solver arrived determine which established operation is active.

## No YOU wrap is required

Neither closed route includes project p32:

```text
Route A: 23,25,28,23
Route B: 23,33,35,28,0,18,23.
```

The canonical 21-word p32 correction therefore does not obstruct either branch. YOU33 remains the sole absent direct numbered **word** coordinate, while the main navigation core can execute without inventing a receiver for it.

This is a useful discriminator for future proposals. Any claimed p32 operation should explain why the puzzle needs to leave this already closed p23/p28 core, and should be selected by a new source-visible instruction rather than by repairing the rejected modulo22 wrap.

## Program interpretation

The current evidence supports a small state-machine view:

```text
p23 checkpoint
  THE ONE RISE -> RISE operator -> p25
  THE ORIGINAL -> state handoff -> p33

p28 checkpoint
  READ OUT context -> readout operator -> DIRECTION / SEEK AND -> p23
  source-direction context -> THE28 direction edge -> p0 -> p18 -> p23
```

The operations themselves come from separate charged families. This report only composes them and identifies the shared checkpoints.

The strongest next target is an independently selected **exit** from this p23/p28 strongly connected core. Additional closed-loop confirmations have diminishing value unless they reveal such an exit, new plaintext, or an authentic operand.

## Reproduction

Run:

```text
node sims/lp2_p23_p28_navigation_core_sft.cjs
```

The SFT executes the established Route A, p23→p33 handoff, and p33/p35 FOUND-route regressions, then verifies both closed page routes, their exact intersection `[23,28]`, their distinct first destinations, and the absence of p32. Windows/Node 22 run **44468466550** passes the full composition.

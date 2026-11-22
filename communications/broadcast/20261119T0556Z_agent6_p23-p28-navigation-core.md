# Agent6: p23 and p28 form a shared two-checkpoint navigation core

Run: `agent6-gpt5.6sol-20261119T045717Z-draw4-issue-directed-harumi`
Date: 2026-11-19

Two independently selected p23 instructions lead through distinct closed routes that intersect exactly at p23 and p28.

```text
Route A / THE ONE RISE:
23 -> 25 -> 28 -> 23

Route B / THE ORIGINAL:
23 -> 33 -> 35 -> 28 -> 0 -> 18 -> 23

intersection = {23,28}
```

Route A is the newly passing ROAD/RISE/READ OUT/DIRECTION cycle.
Route B composes the established p23->p33 state handoff, p33 THEIR RISE -> p35, and p35 FOUND authenticated direction walk.

The important architecture is operation-sensitive checkpoint behavior:

```text
p23:
  THE ONE RISE -> RISE/+2 operator -> p25
  THE ORIGINAL -> state handoff -> p33

p28:
  READ OUT context -> readout/DIRECTION route -> p23
  source-direction context -> THE28 -> HELLO0 -> IS18 -> ROAD23
```

Neither route uses p32 or a YOU wrap.

Meta-SFT:
`sims/lp2_p23_p28_navigation_core_sft.cjs`

Report:
`im-results/lp2-p23-p28-navigation-core.md`

Windows/Node22 PASS: **44468466550**

The meta-run also exposed a stale domain bug in the p23 origin-state SFT. The documented family has 188 five-word lines, nine with terminal GP0=0 outside the positive one-based cardinal serializer, leaving 179 serializer-valid lines. The SFT now enforces that exact existing domain before charging THEORI prefix hits; the unique p23 hit survives.

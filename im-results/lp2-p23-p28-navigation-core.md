# P23 and p28 form a conditional two-checkpoint navigation hypothesis

**Agent6, 19 November 2026; Critic reconciliation. Classification: integration hypothesis only. The apparent routes share candidate p50 low-digit transitions, whose generalization failed #1787; the GOOD LUCK GP0→p50 address also remains unselected under #1903. This does not establish program architecture or recover unknown-body plaintext.**

Two p23 structures suggest distinct outgoing operations, but the apparent returns through p28 depend on conditional p50 pointer edges. The shared graph is therefore a hypothesis, not two independently established source-selected routes.

## Route A candidate: THE ONE RISE / READ OUT

The red-span p23 instruction is:

```text
THE ONE RISE.
```

The repeated `[3,5]` RISE packet supports the `+2` page handoff from p23 to p25. The continuation from p25 to p28 is conditional: it uses a candidate GP0→p50 address and low-digit pointer, with the latter's generalization rejected by #1787. The p25 top-line first-word receiver also missed its frozen THEIR prediction (17 versus34). Under those caveats, the proposed composition is:

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

## Route B candidate: THE ORIGINAL / THEIR RISE / FOUND

The independent five-dot/full-line p23 instruction is:

```text
THE ORIGINAL.
```

Its p23/p56 half-turn page rise independently points to p33; applying T to page labels23 and33 is the post-discovery AL=31 candidate. The DH B→p50→base60 pointer is a separate conditional convergence. P33's THEIR RISE supports p33→p35, and p35 has a strong local FOUND candidate; however the p35→p28→p0→p18→p23 continuation uses the same candidate low-digit direction graph and is not an authenticated route after #1787:

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

This route is not independent validation of the low-digit map; it shares the same conditional transition family.

## The two shared checkpoints are exactly p23 and p28

The page sets intersect at:

```text
{23,28}.
```

Their first departures are different, but their selection status differs:

```text
THE ONE RISE -> p25 (source-constrained navigation candidate)
THE ORIGINAL -> p33 (post-discovery AL/state candidate).
```

Both proposed routes later reach p28 only if the candidate low-digit direction graph is accepted:

```text
Route A reaches p28 from p25 and follows local READ OUT.

Route B reaches p28 from p35 as part of the authenticated
source-direction walk and follows THE28 -> HELLO0.
```

If independently validated, this graph would support operation-sensitive checkpoints. At present, the shared low-digit dependency means it is not independent evidence for a state machine; keep that interpretation provisional.

## No YOU wrap is required

Neither proposed route includes project p32:

```text
Route A: 23,25,28,23
Route B: 23,33,35,28,0,18,23.
```

The canonical 21-word p32 correction does not alter the proposed graph. But because its low-digit edges are conditional, it is premature to claim that a navigation core executes without a YOU receiver.

This is a useful discriminator for future proposals. Any claimed p32 operation should explain why the puzzle needs to leave this already closed p23/p28 core, and should be selected by a new source-visible instruction rather than by repairing the rejected modulo22 wrap.

## Program interpretation

The current evidence motivates, but does not establish, a small state-machine hypothesis:

```text
p23 checkpoint
  THE ONE RISE -> RISE operator -> p25
  THE ORIGINAL -> state handoff -> p33

p28 checkpoint
  READ OUT context -> readout operator -> DIRECTION / SEEK AND -> p23
  source-direction context -> THE28 direction edge -> p0 -> p18 -> p23
```

The operations themselves come from separate charged families. This report only composes them and identifies the shared checkpoints.

The strongest next target is an independently source-selected low-digit operation and a prospective untouched transition, or a new exit that does not reuse the current conditional pointer graph. Do not treat additional closed-loop confirmations as progress unless they reveal new plaintext or an authentic operand.

## Reproduction

Run:

```text
node sims/lp2_p23_p28_navigation_core_sft.cjs
```

The SFT executes the component regressions and verifies the proposed page sequences, their computed intersection `[23,28]`, and the absence of p32. Windows/Node 22 run **44468466550** passes the arithmetic composition; it does not authenticate the low-digit transitions or establish the proposed state machine.

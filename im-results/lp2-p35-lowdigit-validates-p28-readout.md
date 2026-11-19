# P35 supplies the independent low-digit p50 consumer required by p28 READ OUT

**Agent50, 19 November 2026. Classification: cross-branch operator validation. The p35 receiver was selected independently of the p28 READ OUT loop, then exposed the manuscript's unique adjacent mutual p50-low GP0 cycle. This satisfies the explicit external-consumer gate left by the p28 self-closure work.**

## Upstream gate

The p28 READ OUT self-closure selected one p50 component convention from a finite 16-mode family:

```text
native base60
low token digit
zero-origin digit value
forward source order
```

Under that operation:

```text
READ GP0=55 -> 20
OUT  GP0=20 -> 42
FIND GP0=42 -> 28
```

giving:

```text
READ -> OUT -> FIND -> p28
```

Agent24 explicitly left the operation provisional because READ OUT, FIND, p50, and p28 were all known before the low-digit self-closure was recognized. The stated next gate was an independently selected consumer outside the READ OUT/FIND/p28 loop.

Upstream report:
`im-results/lp2-p28-readout-lowdigit-selfclosure.md`.

## Independent p35 selection

P35 is selected through a different route:

```text
p23 red heading -> THE ONE RISE
p23/p56 visual U(1) -> O(3) rise = +2
p23/p56 page gap -> p33
p33 red heading -> THEIR RISE
p33 + 2 -> p35
signed word35 = FOUND
```

The p35 destination was frozen before the p35 word-level GP0/p50 adjacency scan.

Nothing in that selector uses READ, OUT, FIND, the p28 center/page-word object, or the p28 low-digit closure.

## Held-out p35 consumer

P35 complete words 6 and7 are:

```text
offsets25..26: GP0=36
offsets27..29: GP0=54
```

Apply the exact p28-selected p50 component operation:

```text
p50[36] = 0s -> low60(s) = 54
p50[54] = 2a -> low60(a) = 36
```

so:

```text
36 <-> 54
```

Across all **2,873** within-page adjacent complete-word windows on every unknown rune-bearing p0..p55 page, this is the only mutual low-digit GP0 pair.

The authenticated source supplies:

```text
GP0(FOUND)=36
GP0(ROAD)=54
GP0(PATHS)=54
```

and the already frozen direction graph puts FOUND in ROAD's basin while PATHS enters the other basin.

Thus the independently selected p35 target contains a unique, semantically coherent external consumer of the same low-digit p50 operation.

## Consequence for READ OUT

The p35 result changes the chronology of the low-digit operation.

Before this result, the p28 route was an internally discriminating self-closure with no untouched external consumer.

After this result:

1. p33/p23/p56 source structure selects p35 without low-digit p50.
2. A manuscript-wide p35 adjacency census is opened.
3. The exact p28-selected low-digit operator has one mutual adjacent hit anywhere.
4. That hit is on p35 and matches authenticated FOUND to ROAD/PATHS source states.
5. The source direction graph resolves the collision toward ROAD.

This is the external validation requested by the p28 report.

The low-digit p50 transition should therefore be treated as a substantially stronger manuscript state-pointer opcode rather than a READ OUT-specific compression.

The p28 READ OUT plaintext candidate also gains support because its downstream self-closure uses an operator now selected independently elsewhere.

## A second independent p28 selector

The same p35 branch independently selects physical p28 through the established direction graph:

```text
FOUND35 -> THE28
```

Physical p28 then exposes the unique literal DH line whose fragment geometry and reconstructed DH state select the cube exponent and center/page-word object yielding READ OUT.

Thus p28 now has two incoming routes from the p35 branch:

- the source direction graph selects **physical p28**;
- p35's held-out adjacency selects the same **low-digit p50 opcode** used by READ OUT.

These routes do not consume the READ OUT plaintext while selecting the page and pointer convention.

## What remains

This validation strengthens the p28 mechanism substantially, though it still does not turn READ OUT into authenticated unknown-page plaintext by itself. The cube transform and exact p28 source object remain local to the p28 mechanism.

The next productive use is operational: because the FOUND direction walk continues

```text
p35 -> p28 -> p0 -> p18 -> p23
```

treat p28 READ OUT as an instruction encountered on a source-selected route and test it on the next source-selected object, p0, using only an outer/edge object fixed before plaintext inspection.

## Reproduction

- p35 route and uniqueness: `sims/lp2_p33_p35_found_road_map_sft.cjs`
- p35 report: `im-results/lp2-p33-p35-found-road-map.md`
- p28 low-digit closure: `sims/lp2_p28_readout_lowdigit_selfclosure_sft.cjs`
- p28 report: `im-results/lp2-p28-readout-lowdigit-selfclosure.md`
- p28 DH geometry selector: `sims/lp2_p28_dh_fragment_length_readout_sft.cjs`

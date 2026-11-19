# P35 contains a unique mutual low-digit pair; general-opcode promotion fails

**Agent50, 19 November 2026. Classification: specific cross-branch structural correspondence, not general operator validation. The p35 receiver was selected independently of the p28 READ OUT loop and contains the only adjacent mutual pair under the candidate low-digit p50 map. The later #1787 prospective gate rejects generalization (0/84 preferred-mode adjacent transitions; sealed GOOD→LUCK miss).**

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

Thus p35 contains a unique, semantically coherent mutual pair under the candidate low-digit p50 map. This is a specific cross-branch structural correspondence, not evidence that the map is a general authenticated opcode.

## Consequence for READ OUT

The p35 pair is a useful specific correspondence. The p33→p35 selector is independent of the p35 GP0 values, and the full 2,873-window census finds exactly one mutual pair under the candidate low-digit map. The authenticated source labels FOUND=36 and ROAD/PATHS=54, so the match is semantically coherent.

It does not validate a general low-digit opcode. Director #1787 later froze the preferred base60/low/zero/zero convention and tested it on 84 adjacent pairs in authenticated 2016 plus solved p56/p57, obtaining 0/84; the sealed GOOD→LUCK prediction also missed (GP0(GOOD)=35 maps to39, not LUCK=31). That gate rejects broad promotion of the transition rule. It does not erase the p35-specific pair, but the pair must remain a conditional structural match, not an authenticated pointer operation.

The p28 READ OUT self-closure and the p35 pair therefore do not authorize further unknown-page low-digit walks. Keep the READ OUT transform and the 36↔54 correspondence separate; require a new source-selected operation and untouched prediction before treating the low-digit map as a reusable opcode.

## A second independent p28 selector

The same p35 branch has a candidate route to physical p28 through the proposed low-digit direction graph:

```text
FOUND35 -> THE28
```

Physical p28 then exposes the unique literal DH line whose fragment geometry and reconstructed DH state select the cube exponent and center/page-word object yielding READ OUT.

Thus p28 has two related p35-side correspondences under the same candidate low-digit map:

- the source-direction graph proposes a p35→p28 path;
- p35's unique adjacency is a specific match under that map.

These are not independent authentication of a general opcode, because both depend on the same candidate transition.

## What remains

This specific correspondence is useful structural evidence, but #1787 prevents treating it as validation of a general low-digit mechanism. READ OUT remains a candidate local transform; no authenticated unknown-page plaintext or reusable low-digit opcode follows.

The next productive use is operational: because the FOUND direction walk continues

```text
p35 -> p28 -> p0 -> p18 -> p23
```

do not extend the low-digit walk to p0 until a first-party selector fixes the transition and a single untouched receiver; the current route is conditional after #1787.

## Reproduction

- p35 route and uniqueness: `sims/lp2_p33_p35_found_road_map_sft.cjs`
- p35 report: `im-results/lp2-p33-p35-found-road-map.md`
- p28 low-digit closure: `sims/lp2_p28_readout_lowdigit_selfclosure_sft.cjs`
- p28 report: `im-results/lp2-p28-readout-lowdigit-selfclosure.md`
- p28 DH geometry selector: `sims/lp2_p28_dh_fragment_length_readout_sft.cjs`

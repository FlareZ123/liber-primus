# P6 red13 4/5/4 stencil generates the 13-lane receiver-delta program

**Agent10, 28 November 2026; Director #3388. Classification: source-local p6 operator-schedule compression with a finite internal holdout. The grammar was recognized after the receiver-delta stream existed, so this is not a temporally blind plaintext prediction and does not authenticate any fitted corridor word or key.**

## Question

The p30–p42 candidate corridor already had a target-independent receiver-address serializer, but its exact ordered delta stream was expressed using first-rune fields from the authenticated 2016 source. Director #3388 asks for something stricter: can the **original p6 page itself** supply an executable operator/order rather than merely a bag of numerics?

It can, under one compact visual grammar. The p6 four-word red packet supplies the values; the adjacent Fehu supplies the center state; and the large 13-dot punctuation supplies the 4/5/4 physical layout.

## Independent source inputs

Original-image work already established that every 13-dot large mark is the same stencil, with column populations:

```text
[4,5,4]
```

This is not a per-instance hidden alphabet. On p6, two such 13-dot marks bracket the only doubly-bracketed four-word red span. Its printed widths are:

```text
[q,1,q,K] = [4,1,4,2].
```

The already frozen outside-in H4 transform gives:

```text
H4([4,1,4,2])
= [K,-e,g,a]
= [2,26,5,6].
```

The adjacent large Fehu supplies:

```text
F = 0.
```

Separately, the existing target-independent p30–p42 receiver scheduler gives local-word ordinal deltas from the DIRECTION-folded page/source residues:

```text
D =
[26,1,3,2, 26,1,0,1,3, 20,6,1,3].
```

No unknown LP2 plaintext rune, fitted additive key coordinate, or language score is needed below.

## Literal p6 grid grammar

Write the four H4 title coordinates as:

```text
[r0,r1,r2,r3] = [K,-e,g,a].
```

Use the 13-dot stencil's **left / center / right = 4 / 5 / 4** columns. The p6-only program is:

```text
L = [ r1, 1, -r1, r0 ]

C = [ r1, 1, F, 1, -r1 ]

T = [ -r3, r2, -r0, 1 ]

R = L + T  (coordinatewise mod29).
```

With the printed p6 fields:

```text
L = [-e,1,e,K]
  = [26,1,3,2]

C = [-e,1,F,1,e]
  = [26,1,0,1,3]

T = [-a,g,-K,1]
  = [23,5,27,1]

R = [qg,a,1,e]
  = [20,6,1,3].
```

Column-major readout is exactly:

```text
L || C || R
=
[26,1,3,2, 26,1,0,1,3, 20,6,1,3]
=
D.
```

Thus the fixed 13-dot geometry is not being read as thirteen independent secret bits. Its **three physical column heights** type the arity of a p6-derived receiver-address program.

The center column maps naturally onto corridor pages p34–p38. Its central Fehu coordinate is the p36 lane, so the source-visible center predicts the only zero delta in the 13-lane program at p36. This is exactly the exceptional page whose independently selected numbered receiver uses the q-center removal rule.

## Finite role/sign/orientation charge

Because the formula was recognized after `D` was already known, charge the obvious p6-visible role freedom instead of scoring only the successful orientation:

- all 24 permutations of the four H4 title coordinates;
- all 16 independent signs of those four roles;
- both signs of the visible singleton `1`;
- left-to-right versus right-to-left column order;
- top-down versus bottom-up vertical order.

Total:

```text
24 * 16 * 2 * 2 * 2
= 3,072 serializers.
```

Results:

```text
first nine lanes (left+center) exact: 8 / 3,072
first nine + terminal right column:   1 / 3,072
full thirteen-lane exact:             1 / 3,072
```

The sole full survivor is the printed H4 role order, all positive role signs, singleton `+1`, left-to-right columns and top-down reading. The terminal p39–p42 four-lane column is therefore a genuine **internal held-out discriminator inside the charged family**: eight variants survive the first nine lanes, and one survives the terminal four.

This is not a claim of temporal preregistration. The family itself was formulated after the existing delta tape was known.

## Original p15 countercontrol

The earlier p6 red13 control matters here. P15 also has an 11-rune red span bracketed by 13-dot marks, so the equation `11 + K = 13` is not unique. But p15's span has only three printed words:

```text
[4,2,5],
```

whereas p6 is the only double-red13 span with **four** words:

```text
[4,1,4,2].
```

The grid grammar requires that four-field H4 title seed before the 4/5/4 marker can be populated. The p15 control therefore rejects “any 11-inside-13 bracket means this schedule” while preserving the p6-specific four-word operator hypothesis.

## What changes

Before this result, the clean 13-lane receiver delta order was described with signed-source first-rune atoms `V/O/L/G` plus p6 `K/F`. The original p6 object now generates the entire numeric order by itself:

```text
four printed title widths
+ frozen H4
+ adjacent Fehu
+ fixed 13-dot 4/5/4 stencil
-> complete receiver-address delta tape.
```

That is a materially better human-puzzle path: a solver can read every operand from one original page after the p6 packet is identified. It also explains why the 13-dot mark's **geometry** is relevant without inventing per-dot bits or subpixel states.

What it still does **not** provide is the coordinatewise additive-key serializer. The p30–p42 plaintext candidates remain provisional, and exact fitted keys remain unauthenticated. The next high-value test is to freeze this visual receiver grammar before a genuinely fresh receiver transfer, or to find a similarly source-visible p6 rule that refines the already fixed per-page key sums into complete ordered key vectors.

## Reproduction

Run:

```text
node sims/lp2_p6_red13_grid_receiver_delta_serializer_sft.cjs
```

The SFT reconstructs the p6 H4 title fields, the 4/5/4 grid program, all 3,072 charged role/sign/orientation variants, the eight first-nine-lane survivors, and the unique terminal/full survivor.

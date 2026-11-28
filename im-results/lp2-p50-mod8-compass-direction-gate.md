# P50 literal mod-8 compass reading of “their numbers are the direction” fails immediately

**Agent9, 28 November 2026. Classification: source-first bounded negative. No plaintext, key, or receiver recovered.**

## Premise

The p49–51 numeral field is physically a **32×8** grid. The authenticated 2016 sentence says:

`THE MAP, THEIR MEANING IS THE ROAD, AND THEIR NUMBERS ARE THE DIRECTION.`

The established p50 scaffold localizes the zero-origin working sequence:

- source index17 THE at row27 column3;
- source index18 MAP at row26 column3;
- source index19 THEIR at row25 column3.

Because indices17..24 form exactly one complete residue system modulo8, a natural literal hypothesis is:

> source-word number modulo8 is an eight-way compass direction on the eight-column MAP.

Freeze the strongest version: one global **bijection** from residues0..7 to the eight compass directions. No page key, plaintext, or unknown rune output is consulted.

## Exact contradiction

The first two scaffold transitions are already:

~~~text
17 THE   row27,c3
   -> north
18 MAP   row26,c3
   -> north
19 THEIR row25,c3
~~~

But:

~~~text
17 mod8 = 1
18 mod8 = 2
~~~

So residue1 and residue2 would both have to encode **NORTH**.

That contradicts a one-to-one eight-direction code before the missing rank20 / MEANING distance step is even considered. Rotating or reflecting the compass cannot repair it; every global dihedral orientation preserves the fact that two distinct codes must map to the same direction.

## Decision

Reject the strict literal interpretation:

`source index mod8 -> one globally fixed eight-way compass direction`

for the p50 MAP scaffold.

This does **not** weaken the established MAP/ROAD geometry or the source-clause reconstruction. It only blocks the especially tempting inference that the table's eight columns directly turn source word numbers modulo8 into compass moves. Any non-bijective code, context-dependent direction table, or separate rule for repeated north steps is a new hypothesis and needs an independent first-party selector.

## Reproduction

Run:

`node sims/lp2_p50_mod8_compass_direction_gate_sft.cjs`

The SFT reads the pinned original p50 grid and authenticated signed source, reconstructs the rank17/18/19 anchors under the already established mixed-radix scaffold, and asserts the two incompatible north transitions.

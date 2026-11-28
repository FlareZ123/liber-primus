# P27 path serializer gate: BASE29 quotient uniquely matches the signed-source opening, but no fresh EMPTY-row consumer follows

**Agent4, 28 November 2026. Director task #3464. Classification: bounded serializer adjudication with a preregistered negative fresh consequence. No plaintext or new key consumer is established.**

## Decision

The frozen p27 route selects the base59 pointer walk

```text
186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189
```

with authenticated public-share hop count `A=8`. The eight preterminal addresses are therefore fixed independently of any serializer.

The authenticated 2016 warning begins with the nine zero-based source positions

```text
0 HELLO
1 THE
2 PATH
3 LIES
4 EMPTY
5 EPIPHANY
6 SEEKS
7 THE
8 DEVOTED
```

A post-observation source pattern suggested that the path might select one of the table representations explicitly licensed by #3464. The complete bounded charge below tests that claim and then applies a fresh held consequence.

## Complete licensed scalar-view charge

For the eight frozen preterminal addresses, charge these source-visible representations without DH labels:

- raw address;
- historical BASE29 quotient and remainder;
- physical 32×8 row and column;
- printed-token high and low digit values under the already live missing-`f` base59 alphabet;
- first differences of BASE29 quotient and remainder across the eight fixed pointer edges.

The exact vectors are:

```text
raw               [186,19,33,112,72,161,214,247]
BASE29 quotient   [  6, 0, 1,  3, 2,  5,  7,  8]
BASE29 remainder  [ 12,19, 4, 25,14, 16, 11, 15]
row8              [ 23, 2, 4, 14, 9, 20, 26, 30]
col8              [  2, 3, 1,  0, 0,  1,  6,  7]
token high59      [  0, 0, 1,  1, 2,  3,  4,  3]
token low59       [ 19,33,53, 13,43, 37, 11, 12]
q29 edge diff     [ 23, 1, 2, 28, 3,  2,  1, 27]
r29 edge diff     [  7,14,21, 18, 2, 24,  4,  0]
```

Require only the set equality forced by the source observation: eight distinct values equal to the opening indices `0..8` with `EMPTY=4` absent,

```text
{0,1,2,3,5,6,7,8}.
```

Exactly one charged representation passes:

```text
historical BASE29 address quotient.
```

This is a real source-facing compression: the p27-selected A=8 path visits every BASE29 quotient/source index in the opening 0..8 register except EMPTY.

It does **not** by itself establish why EMPTY should be omitted or how to use the remainders. The pattern was recognized before #3464 was claimed, so it cannot serve as the task's fresh receiver test.

## Fresh EMPTY-row consequence: negative

After claiming #3464, the next table consequence was frozen **before opening the relevant row**:

> If the BASE29 quotient is the selected serializer and EMPTY=4 is the sole missing source row, the cheapest completion is a one-edge predecessor from BASE29 row4 into the already fixed p27 pointer path. Charge all 29 cells with address quotient4. Success requires at least one such direct predecessor; a unique source-typed predecessor would be strong evidence.

Reveal:

```text
BASE29 row4 addresses = 116..144
cells whose base59 pointer lands on any node of
{186,19,33,112,72,161,214,247,189}: 0 / 29
```

The preregistered direct completion therefore fails cleanly. The rule is not rescued with two hops, a different radix, a shifted row, or a new low-digit convention.

## Relation to independently known Q states

There are attractive cross-links that remain supporting context rather than this task's fresh validation:

- solved p56 has frozen Q coordinate `[4,5]=[EMPTY,EPIPHANY]`;
- p27 itself has Q coordinate `[9,5]`, with first component the next source index `LIBER=9`;
- Agent4's separate solved-p56 navigation result finds `29*4+5=121=GP0(EPIPHANY)` and a ROAD23/SEEK30 route through p50.

Those facts make the missing EMPTY quotient worth preserving, but they were already opened before the #3464 holdout and are not counted as a prospective success here.

## Issue decision

The bounded serializer family gives a useful answer to the representation question:

```text
BASE29 quotient is the only licensed scalar view that exposes the signed-source opening-index set.
```

But the first source-typed fresh consumer test is negative. Therefore #3464 should **not** promote the p27 BASE29 tape to an executable producer yet. The tape remains a strong structural/state compression with a newly isolated source-facing quotient view and no authenticated consumer.

A future successor should require a new original-artifact clue that fixes the missing row's low digit or names a receiver before any table content is opened. Do not reopen p49/p51 additive use or extend the failed row4 test by tuning hop count.

Reproducer: [`sims/lp2_p27_base29_source_prefix_serializer_gate_sft.cjs`](../sims/lp2_p27_base29_source_prefix_serializer_gate_sft.cjs).

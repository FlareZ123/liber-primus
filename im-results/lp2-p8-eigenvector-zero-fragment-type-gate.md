# P8 root-eigenvector zero coordinate: four-way fragment selector is source-type non-identifying

**Agent 9, 28 November 2026. Classification: bounded source-type negative for Director #3430. Candidate rune identities were not used to choose an interpretation.**

## Frozen invariant

The p8 rooted-tree route independently fixes the native root `lambda=24=-g` and the top-anchored right eigenvector:

`[14,7,7,3,25,0,4]`.

Its unique zero is coordinate 5 in zero-based mathematical notation. Per #3430, charge exactly row/column × zero/one-based human interpretation.

The black p8 fragment-length matrix is:

```text
3  2  3  9  4  3  4
2  2  6  3  7  3  4
3  8  4  3  4  5  5
2  3  4  4  7  5 10
6 12  4  5  3  2  6
10 4  9  6  5  6  8
8  3  2  9  6  6  1
```

## Four source-type candidates

Without revealing rune values:

```text
zero-based row6 : [10,4,9,6,5,6,8]  starts 172,182,186,195,201,206,212
one-based  row5 : [6,12,4,5,3,2,6]   starts 134,140,152,156,161,164,166
zero-based col6 : [3,3,5,5,2,6,6]    starts 33,60,89,119,164,206,248
one-based  col5 : [4,7,4,7,3,5,6]    starts 29,53,85,112,161,201,242
```

The two column candidates are seven non-contiguous fragments distributed through the page; neither is a single printed line, punctuation-bounded phrase, or illustration-adjacent physical object.

The two row candidates are contiguous seven-fragment slices because **every matrix row** is defined that way. Their strongest boundary cues split the origin choice symmetrically:

- one-based row5 begins immediately after a period;
- zero-based row6 ends immediately before a period.

Both cross printed line boundaries internally. Neither is a single physical line.

Thus source geometry does not choose zero versus one origin. Choosing the mathematically natural right-eigenvector/column interpretation still leaves the same origin ambiguity and produces no contiguous source object.

## Decision

The eigenvector zero is a real coordinate-free algebraic feature, but the complete four-way row/column × origin family does **not** identify a source-typed p8 fragment object.

Per #3430, candidate rune contents remain unused and no fresh decoder/address consequence is promoted. Keep the rooted-tree eigenvector as state/layout structure until another first-party cue specifies matrix axis and coordinate origin.

Reproducer: `sims/lp2_p8_eigenvector_zero_fragment_type_gate_sft.cjs`.

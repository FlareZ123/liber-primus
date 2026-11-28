# P6↔p23 red adjacent-H morphism continues into their black successor H streams

**Agent16, 28 November 2026. Director #3403. Classification: positive source-constrained structural continuation; no unknown plaintext, body key, or universal decoder recovered.**

## Decision

The independently established red-span relation is:

```
p6 red word lengths [4,1,4,2]
 -- adjacent H, then swap the two H pairs -->
p23 red word lengths [2,6,3,5].
```

The Director task asked whether that exact red relation dies at the decorative boundary or continues into the immediately following black text under the same small H/pair/order family.

It continues.

Take only the **complete black word immediately following each red span** and apply one unchanged canonical outside-in H transform:

- differences from outside to inside;
- preserve an odd center;
- then sums from inside to outside.

For the independently fixed p6 and p23 successors:

```
p6 successor
raw [6,9,28,25,6,21,23]
descriptor (length,sum,product) = [7,2,3]
H = [12,17,22,25,5,1,0]

p23 successor
raw [28,6,15,25,13,7,19,28]
descriptor = [8,25,16]
H = [0,16,8,12,9,22,25,27].
```

The two H streams share the exact coordinate set

```
{0,12,22,25}.
```

More importantly, they share one **ordered adjacent H-coordinate pair**:

```
[22,25].
```

No plaintext, DH labels, dictionary words, or fitted additive keys are used to define that comparison.

## Finite red-successor control

There are exactly **16** red spans on p0–p57 whose red span is followed immediately by a complete black word.

Using the same one-H transform on all 16 successors:

- from p6, p23 is the **unique** other successor with the maximum exact H-coordinate-set overlap: 4 shared values; the next best overlap is 2;
- from p23, p6 is the **unique** maximum-overlap successor: 4 shared values; the next best overlap is 3;
- among the other 15 successors, **p23 alone shares any ordered adjacent H pair with p6**;
- that sole ordered-pair overlap is exactly `[22,25]`.

Thus p6 and p23 are mutual unique nearest neighbors in this source-selected successor family under the same H coordinate representation that the red-span route already motivates.

The ordered-pair statement is stronger than the value labels. Even if `22,25` are later recognized as familiar state residues, the finite test does not choose them from the state vocabulary: it first takes all six adjacent pairs in the frozen p6 H stream, then asks which red-successor H streams repeat any of them.

## Supporting boundary relation

The same H application places GP `F=0` at opposite outer boundaries:

```
p6  H(...)= [...,0]
p23 H(...)= [0,...].
```

This is supporting structure rather than a unique selector. Four of the 16 red successors have a zero on an H boundary:

```
p3@119  left
p6@71   right
p15@0   right
p23@0   left.
```

The p6↔p23 significance comes from the independently selected red morphism plus the much stronger H-coordinate and ordered-pair overlap, not from boundary zero alone.

## Descriptor holdout and broader calibration

The two adjacent black successor objects are themselves manuscript-unique by complete canonical descriptor:

```
p6  [length, GP0 sum, GP0 product] = [7,2,3]
p23 [length, GP0 sum, GP0 product] = [8,25,16].
```

Across all **2,928** complete unknown-page words, each descriptor occurs once.

The shared pair `[22,25]` is not globally rare: 18 complete words contain it somewhere in their one-H ordered stream, and 63 complete words share at least one of p6's six ordered H pairs. This is why the result should be read as a **receiver-family continuation**: the red morphism fixes p6 and p23 before the black words are compared. It is not evidence that `22,25` is intrinsically a unique key or opcode.

## What this changes

The strongest rival for the p6↔p23 red relation was that it was a decorative arithmetic coincidence with no continuation into black text.

That rival is now weaker. Two independent source layers agree on the same pair of pages:

```
red layer:
p6 four-word lengths -- adjacent H / pair swap --> p23 four-word lengths

black-successor layer:
p6 complete successor -- outside-in H --> unique red-successor nearest neighbor p23
p23 complete successor -- outside-in H --> unique red-successor nearest neighbor p6
ordered H-pair intersection = [22,25].
```

This is still not a body cipher. The exact overlap statistic was inspected after the two H streams were opened, so its selectivity is retrospective/conditional rather than a blind discovery probability. The useful conclusion is narrower: **the p6↔p23 relation demonstrably survives across the red/black boundary under the same H algebra, so their successor words are justified state-consumer candidates for a future source-selected opcode.**

A next experiment should predict what the shared `[22,25]` packet *does* before opening another receiver. Renaming it with DH state fields is not enough.

## Reproduction

Run:

`node sims/lp2_p6_p23_black_successor_h_overlap_sft.cjs`

The SFT reconstructs all 16 red-successor objects from the canonical transcription and ink annotations, verifies both unique descriptors, applies the fixed H transform, performs the bidirectional nearest-neighbor and ordered-pair controls, and records the broader manuscript calibration.

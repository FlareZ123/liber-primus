# Exact visual frame spacing serializes the chapter PRODUCT register

**Agent13, 28 November 2026. Classification: independent original-artifact corroboration of the chapter PRODUCT field; post-discovery finite-family result. It strengthens PRODUCT-as-OUT but does not recover plaintext or define a new dead-end navigation opcode.**

## Independent source structures

Two structures were developed independently before this comparison:

1. The nine red-rubric chapter operands use the first complete black word after the opening rubric. The pre-existing #3445 gate fixed `IN = GP29 rune SUM` and charged a frozen natural family of eight candidate OUT statistics:
   `length, rune PRODUCT, prime SUM, prime PRODUCT, first rune, last rune, first+last, first*last`.

2. A decoded-pixel census of all 75 original JPEGs partitions LP2 by exact outer-frame reuse. The six non-singleton LP2 frame runs start at

```text
p1, p4, p15, p27, p40, p56
```

so their five forward start spacings are

```text
[3,11,12,13,16].
```

No chapter value was used to choose those frame starts.

## Complete source-register charge

The nine chapter `IN=SUM` values are

```text
{2,5,9,15,19,22,23,25,27}.
```

Take the union of that independently supported chapter-IN register with the exact visual frame-start spacings:

```text
R = {2,3,5,9,11,12,13,15,16,19,22,23,25,27}.
```

Charge the complete distinct value vocabulary of every already-frozen OUT statistic against `R`.

```text
OUT statistic       covered / distinct values
length                   3 / 6
rune PRODUCT             8 / 8
prime SUM                 3 / 7
prime PRODUCT             3 / 8
first rune                5 / 8
last rune                 4 / 8
first+last                4 / 8
first*last                2 / 8
```

**Rune PRODUCT is the only statistic whose entire distinct output vocabulary is typed by the combined source register.**

The stronger instance-level statement does not need the label “dead end.” For each OUT statistic, first send every chapter output whose value appears in the chapter-IN register to that source-visible recipient class; ask whether the remaining output **multiset** fits inside the six exact cyclic frame-start gaps `[11,12,13,16,3,3]`. PRODUCT alone passes:

```text
chapter-IN recipients: [23,2,19,27]
frame-gap recipients:  [11,13,16,3,3]
unused frame gap:       [12] = u=aK
```

No rival statistic's non-IN output multiset is a submultiset of the frame gaps. Thus all nine PRODUCT instances are typed by one of two independently visible registers, with one extra visual state marker left over.

The split is exact. PRODUCT values that have chapter-IN recipients are

```text
{2,19,23,27},
```

while the four distinct PRODUCT values without IN recipients are

```text
{3,11,13,16}.
```

All four of those otherwise-unconsumed values occur in the five exact frame-start spacings. The sole visual spacing not used by any chapter PRODUCT is **12**, independently named in the established state register as `u=aK`.

## Ordered serialization, not just set overlap

The ordering relation is stronger.

There are 58 LP2 pages, p0..p57. Start the non-singleton frame-start cycle at **p4**, the first such boundary immediately after the first PRODUCT-dead-end chapter p3. The cyclic frame-start spacings are then

```text
p4 -> p15   11
p15 -> p27  12
p27 -> p40  13
p40 -> p56  16
p56 -> p1    3   (cyclic over 58 pages)
p1 -> p4     3

frame-gap tape = [11,12,13,16,3,3].
```

The five PRODUCT-dead-end chapters in printed chapter order are

```text
p3, p15, p23, p33, p40
```

and their PRODUCT outputs are

```text
[11,13,16,3,3].
```

That is **exactly the frame-gap tape after deleting the single `12=u` entry**.

Charge the same rule against every member of the frozen #3445 OUT family: allow any cyclic rotation of the six visual gaps and deletion of exactly one value, then require the resulting five-value sequence to equal that statistic's values on the same five PRODUCT-dead-end chapters in printed order.

Only **rune PRODUCT** has any match. Its match is unique:

```text
rotation = 0
delete index = 1
deleted value = 12 = u=aK
[11,12,13,16,3,3] -> [11,13,16,3,3].
```

LENGTH, prime SUM, prime PRODUCT, first rune, last rune, first+last and first*last have zero one-deletion cyclic matches.

## Interpretation

This closes the specific deficiency recorded by #3445: PRODUCT no longer lacks a **common** source-side cue. A single visual structure, exact frame spacing, serializes every PRODUCT instance not consumed by the SUM-address graph, and does so in the same chapter order with one independently named state marker inserted. Instance-by-instance, the nine PRODUCT outputs partition exactly into four chapter-IN recipients and five frame-gap recipients, leaving only `12=u`; no competing natural OUT statistic admits that two-register partition.

The evidence remains post-discovery: the SUM→PRODUCT route existed before this visual comparison, and the visual tape does not tell us what action to take when a PRODUCT value matches a frame spacing. Therefore:

- upgrade PRODUCT from “best retrospective statistic with no common cue” to **source-supported OUT/state statistic**;
- keep the exact p0→p8→p27→p54→p40 route as a strong candidate rather than a proved decryption path;
- do **not** revive `OUT=3 -> physical p3`; frame-spacing matches are state/structure evidence, not page-address fallback semantics;
- PRODUCT-dependent Vieta constructions remain conditional on their separate p3 pointer problem;
- prioritize consumers where a PRODUCT value is typed by an independently visible receiver rather than inventing a fallback.

## Reproduction

`sims/lp2_frame_gap_chapter_product_gate_sft.cjs` runs the original-scan frame census, reconstructs the canonical nine chapter operands, charges the pre-existing #3445 OUT family, verifies complete combined-register coverage, and exhausts the ordered cyclic one-deletion comparison.

# P25 segment-sum coordinate continuation: frozen fresh consequence is negative

**Agent 9, 28 November 2026. Classification: prospectively frozen structural negative for the independently selected p25 cube operand. No PATHS, MEANING, p40 ciphertext, or fitted p40 key is used in the test.**

## Frozen upstream object

The selected p25 side object is already fixed independently as

```text
[18] | [3,20,10,11,16]
```

where the left field is the predecessor boundary rune and the right field is one complete five-rune word.

Apply the pre-existing cube/reciprocal operation unchanged:

- boundary rune: `x^3 mod 29`;
- five word runes: `x^27 mod 29`.

This gives

```text
[3] | [10,16,3,8,20].
```

The source-visible 1|5 segmentation exists before interpreting the output.

## Prospective precommit

Before opening p3 or p57 target structure, issue #3410 froze the following minimal consequence:

1. preserve the native 1|5 segmentation;
2. sum each segment as an ordinary integer, with no mod29 reduction;
3. obtain `3 | 57`;
4. interpret the two fields as `page | rune-offset`, charging swapped field order;
5. charge zero-based and one-based rune offsets;
6. require the selected rune to be the **predecessor boundary of a complete five-rune word**, matching the exact input object type.

The only allowed target coordinates were therefore

```text
p3  offset57   (zero-based)
p3  offset56   (one-based interpretation of 57)
p57 offset3    (zero-based)
p57 offset2    (one-based interpretation of 3)
```

No plaintext or language scoring was permitted.

Precommit: issue #3410 comment 7238639641.

## Result

All four frozen coordinates fail the typed target condition.

None is the predecessor boundary of a complete five-rune word.

Therefore the literal continuation

```text
selected boundary|word
-> cube/reciprocal
-> preserve 1|5 geometry
-> integer segment sums
-> page|offset
-> same boundary+five-rune receiver type
```

is rejected on untouched original input.

## Manuscript-wide matched control

Apply the same transform and segment-sum coordinate grammar to the complete pre-existing family of **627** five-rune predecessor/successor side objects on physical p0-p55.

For each source object, charge:

- native versus swapped segment-sum field order;
- zero-based versus one-based rune offset;
- the same target condition: predecessor boundary of a complete five-rune word.

There are **32** generic self-selection events across that complete control family.

The selected p25 source object contributes **0** of them.

Thus this grammar is not only negative at the frozen p25 prediction; the target type itself is common enough under the charged family that a hit would have required additional discrimination. The p25 object receives no such hit.

## Decision

Preserve the independently selected p25 operand and its earlier structural/cross-source evidence, but stop extending it through this literal segment-sum coordinate grammar.

This result does not weaken the upstream p6->p23->p25 receiver selection or the fixed cube/reciprocal transform. It removes one natural fresh consumer of the transformed vector before any p40/PATHS interpretation.

Reproducer: `sims/lp2_p25_segment_sum_coordinate_holdout_sft.cjs`.

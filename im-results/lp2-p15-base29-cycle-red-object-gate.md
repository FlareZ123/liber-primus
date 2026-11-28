# P15 BASE29 p6↔p8 / p7-fixed map: common marked-object consumer is non-identifying

**Agent 9, 28 November 2026. Classification: source-type consumer gate for Director #3411. No candidate rune values or language scores were opened.**

## Frozen route

The upstream p15 full-integer outside-H/BASE29 page-count serializer gives the already established map:

```text
F(6)=8
F(7)=7
F(8)=6
```

with p6↔p8 and p7 fixed. The exact map is frozen before this consumer test.

## Smallest common source-visible object class

Among p6, p7 and p8, the smallest common physically marked object class is the page's sole red span. Source-type inventory, without rune identities:

```text
page  start  runes  red-word lengths  placement   large-13 marks
p6      71     11   [4,1,4,2]         internal    at both span boundaries
p7     194     14   [2,4,3,2,3]       terminal    at span start/end
p8       0     12   [4,8]             initial     none
```

Immediate-neighbor availability is correspondingly:

```text
p6: predecessor + successor
p7: predecessor only
p8: successor only
```

Thus no uniform predecessor or successor object exists across all three selected pages.

## Why the page map does not type a consumer

Transporting 'the red span' under `6↔8, 7→7` is tautological: every selected page has exactly one such span, so the map merely chooses the destination page already encoded by F(s). It predicts no span coordinate, orientation, length, contents, or downstream action.

The obvious next object classes fail at the source-type level:

- immediate successor is undefined on terminal-red p7;
- immediate predecessor is undefined on initial-red p8;
- large-13 bracket is absent at p8;
- the three red spans have different word counts and different placement categories.

Using a red-span start, length, word count, or some derived arithmetic as a destination offset would introduce an additional serialization not supplied by the p15 map. No such rule is source-selected by #3411's starting evidence, so opening rune values after choosing one would be post-hoc.

## Matched manuscript context

The earlier source census already establishes p6,p7,p8 as the only consecutive triple of red-bearing unknown pages. This supports the navigation selection itself, but it cannot distinguish a consumer: the heterogeneity above is exactly within that uniquely selected triple.

## Decision

The p15 BASE29 cycle remains a structural/navigation result. It does **not** type a common p6/p7/p8 operand or next object under the natural red-span / immediate-neighbor family.

Per #3411, stop before target values rather than invent a second coordinate. Reopen only if a first-party clue supplies an operation on the selected red spans (for example, a specific boundary, direction, or serialization).

Reproducer: `sims/lp2_p15_base29_cycle_red_object_gate_sft.cjs`.

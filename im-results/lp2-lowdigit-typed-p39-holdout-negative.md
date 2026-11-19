# Native-base60 low digit: typed page-anchored opcode holdout fails

**Agent12, 19 November 2026. Classification: prospective negative.**

## Decision

Director #1803 asked whether the native-base60 low digit can be promoted from several strong route-specific uses to a typed manuscript opcode.

Freeze the existing operator:

```text
f(n) = zero-based low digit of native-base60 p50[n]
```

Known positives remain:

```text
p28 READ(55) -> OUT(20)
p35 FOUND-state(36) <-> ROAD/PATHS-state(54)
```

The prior #1787 source-only holdout `GOOD -> LUCK` missed. Its apparent p36 GOOD receiver was later retracted after canonical word parsing, so that negative did not test a page-anchored local object.

## Typed eligibility family

Before opening the holdout cell, three nested predicates were frozen in Issue #1803 comment 7000470042:

1. **E0 selected page:** independently selected without the low-digit result.
2. **E1 page-anchored source object:** E0 plus a local source-linked object fixed before lookup.
3. **E2 page-anchored semantic adjacency:** E1 plus a destination fixed before lookup by local or authenticated-source adjacency.

E2 is the narrowest simple predicate covering both positives:

- p28 supplies local `READ -> OUT`;
- p35 supplies the fixed adjacent local states `36,54`, assigned to `FOUND -> ROAD/PATHS`.

## Blind p39 holdout

P39 was selected without consulting `p50[77]`:

- authenticated zero-based word39 is `FALSE`;
- the existing numbered-page route selects physical p39;
- original p39 visibly carries the dominant red X warning;
- authenticated word40 fixes immediate partner `PATHS`.

Canonical source values were fixed before lookup:

```text
GP0(FALSE) = 77
GP0(PATHS) = 54
```

Precommitted prediction:

```text
f(77) = 54
```

Reveal:

```text
p50[77] = 2O
low60(O) = 24
24 != 54
```

Exact miss. No reverse edge, extra step, neighboring address, radix/origin change, source-index reinterpretation, or alternate target is admitted.

## Consequence

Retain the p28 READ OUT closure, p35 mutual pair, p23 branch, and other already documented low-digit relations within their bounded routes. The p39 holdout rejects promotion to the page-anchored E2 typed opcode. Combined with #1787, further low-digit walks require a new first-party selector that specifies why a particular object consumes this component.

Reproducer: `sims/lp2_lowdigit_typed_p39_holdout_sft.cjs`.

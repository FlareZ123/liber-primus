# P28 READ OUT -> HERE familywise audit and blind local continuation

**Agent2, 19 November 2026. Director #1736. Classification: negative promotion gate with a selective local observation preserved. HERE remains unusually exceptional under the charged family, while the precommitted untouched continuation fails. Retain HERE as post-discovery corroboration and stop HERE-indexed continuation/key menus.**

## Question

The prior p28 result observed that READ OUT can be read literally at the page start. With the source-derived DH state

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
```

p28 line1 has visible geometry

```text
[total runes, fragment count, first length, second length]
= [23,5,2,5]
= [p,g,K,g]
```

and its first two fragments satisfy

```text
PC       -> H(P,C) = HE
JTHBIW   -> H(J,W) = RE
```

giving HERE.

The issue required two things before promotion: a full familywise audit of object/transform freedom and one untouched local consequence frozen before opening.

## Charged object family

Use original physical line and fragment boundaries only.

A state-pair object is an adjacent pair of multi-rune printed fragments whose ordered lengths equal the values of two distinct recovered DH fields. There are 42 ordered field-label pairs before corpus matching.

The issue family is the union of every such object on p28 and every such object on a manuscript line whose visible four-slot geometry `[line rune count, fragment count, first length, second length]` consists entirely of recovered DH-state values.

```text
DH-typed manuscript lines     22
p28 state-pair objects         4
issue-family source objects   34
all manuscript state-pairs   305
```

The broader 305-object family is an additional control.

## Charged transform family

Core family:

```text
map:                H or H^-1
endpoint order:     source or reversed
fragment order:     forward or reversed
output components:  as produced
```

This gives 8 variants per object. A conservative extension also charges swapping each mapped pair's output components, giving 16 variants per object.

The finite lexical register is exactly the pre-existing register used by the HERE report: the repository English-frequency blob plus fixed Gibran, Shakespeare, Emerson, and LP1 plaintext controls. A stricter authenticated register uses LP1 plaintext words only. Both registers were frozen before scoring.

## Familywise result

Issue family:

```text
34 objects x 8 core variants = 272 configurations
finite-register hits: HERE, WIRY
authenticated-register hits: HERE
exact HERE hits: 1

34 objects x 16 conservative variants = 544 configurations
finite-register hits: HERE, WIRY
authenticated-register hits: HERE
exact HERE hits: 1
```

Broader manuscript state-pair family:

```text
305 x 8 = 2,440 core configurations
finite-register strings:
CLAN, HERE, HUGE, LUTE, MULE, RIFE, WIRY
authenticated-register hits: HERE
exact HERE hits: 1

305 x 16 = 4,880 conservative configurations
finite-register strings:
CLAN, HERE, HOWE, HUGE, LUFF, LUTE, MULE, REND, RIFE, TWOT, WIRY
authenticated-register hits: HERE
exact HERE hits: 1
```

Thus the widened family does not erase the local selectivity. HERE is the sole authenticated-register output and occurs exactly once even in the 4,880-configuration conservative audit.

This is a familywise statement within a frozen source/transform family, rather than an authorship probability.

## Frozen untouched consequence

Before opening a new receiver, issue comments froze the first physical line-boundary pair after the HERE carrier:

```text
final multi-rune fragment of p28 line1
then first multi-rune fragment of p28 line2
```

The exact source is:

```text
TDXY | ERD
```

The frozen operation permits no retuning:

```text
H(x,y)=(x-y,x+y) mod29
source endpoint order
source fragment order
outer endpoints only
```

Result:

```text
TDXY | ERD
 -> [19,13,24,12]
 -> MPAEO
```

`MPAEO` is absent from the prior finite lexical register and the authenticated LP1-word register.

The precommit explicitly prohibited H/H^-1 fallback, endpoint reversal, fragment reversal, component swapping, skipped fragments, neighboring boundaries, p50/p0 receivers, and HERE-derived keys. The miss is decisive under the issue's completion rule.

## Decision

Director #1736 takes the negative fork:

- preserve HERE as an unusually selective, reproducible post-discovery local echo of READ OUT;
- do not promote HERE to authenticated unknown plaintext or an authored continuation checkpoint;
- retire HERE-indexed `4D`, GCD, pointer, and key-menu extensions from the active route;
- require a new independent first-party selector or genuinely prospective external receiver before reviving HERE as state.

The surviving research priority is upstream: continue attacking the independently selected READ OUT mechanism and its p28 two-part power assignment, or find fresh receivers that do not depend on the failed HERE continuation.

## Reproduction

- SFT: `sims/lp2_p28_here_familywise_audit_sft.cjs`
- Windows Node22 PASS: run **44456533404**
- Holdout precommit: Director issue #1736 comment **6999403343**
- Holdout output: `TDXY | ERD -> MPAEO`

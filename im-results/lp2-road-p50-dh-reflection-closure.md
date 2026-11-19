# ROAD number-direction p50 cell closes onto the p28 DH state

**Agent15, 19 November 2026. Classification: downstream structural corroboration of the current ROAD candidate. ROAD was known before this closure was inspected, so this is not blind plaintext recovery.**

## Frozen upstream inputs

Use only mechanisms already selected upstream:

- p28 DH23 state `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)`;
- cube exponent `e=3`;
- p50 width `A=8` and source-visible horizontal reflection `c -> A-1-c`;
- current ROAD candidate `[4,3,24,23]`;
- Agent11's number-direction consumer: interpret ROAD as a base29 numeral, reduce modulo256, and use one-based reception because that origin alone lands on p50's intrinsic drop-f-base59 self-pointer.

ROAD gives:

```text
base29(ROAD) = 100798
100798 mod256 = 190
one-based cell = 189
```

## Cell189 is a DH state record

Zero-based cell189 has:

```text
row = 23 = p
col = 5  = g
token = 3C
```

Under the p50 character alphabet, token characters are:

```text
3 = e
C = 12 = K*a
```

and under drop-f base59 the whole token is an intrinsic self-pointer:

```text
base59(3C) = 3*59 + 12 = 189
```

Thus ROAD's one-based residue selects:

```text
(p,g) -> [e,K*a] -> self
```

with no new fitted key.

## Horizontal reflection closes to B

The already source-selected p50 reflection sends column g to:

```text
A - 1 - g = 8 - 1 - 5 = 2 = K
```

so:

```text
cell189 (p,g) <-> cell186 (p,K)
```

Cell186 contains token `0J`. Its second character value is19 and the leading digit is zero, so both base60 and drop-f base59 decode the complete token identically:

```text
0J = 19 = B
```

The full closure is therefore:

```text
ROAD
 -> base29 mod256, one-based
 -> cell189 = (p,g), token 3C = [e,K*a], base59 self-pointer
 -> horizontal reflection
 -> cell186 = (p,K), token 0J
 -> 19 = B
```

The reflected result also reconnects to the already visible p50 state address `B=19`, whose table token is `0X`; no continuation from that fact is claimed here.

## Charged target family

Take every distinct authenticated 2016 signed-message word whose canonical GP representation has exactly four runes:

```text
LIES, THEIR, MEANING, ROAD, SEEK, WILL, GOOD, LUCK, PATHS
```

For each of the nine targets, evaluate its base29 numeral modulo256 under both zero-based and one-based reception, for **18 frozen target/origin cases**.

Require the complete ROAD closure:

1. selected cell is row p, column g;
2. selected token is a drop-f-base59 self-pointer;
3. horizontal reflection reaches row p, column K;
4. reflected token decodes to B under both base59 and base60.

Exactly one of the18 cases passes:

```text
ROAD / one-based
```

The zero-based ROAD rival lands at cell190 `(p,a)` and fails the self-pointer/reflection-token conditions.

## Decision

This substantially strengthens the interpretation of ROAD as the intended four-rune plaintext at the p0 receiver because its independently derived number executes a source-selected table operation and lands on a compact DH state record.

The chronology remains retrospective. Promotion to established plaintext should still be tied to the full upstream THE/ROAD receiver/key evidence or to an untouched downstream consequence that recovers new plaintext.

## Reproduction

```text
node sims/lp2_road_p50_dh_reflection_closure_sft.cjs
```

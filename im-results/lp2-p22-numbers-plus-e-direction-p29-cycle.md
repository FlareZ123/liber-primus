# P22 NUMBERS plus square-derived e selects DIRECTION29 and closes through the p29 state packet

**Agent13, 19 November 2026. Classification: source/state navigation candidate. Every arithmetic step is exact and uses pre-existing state/register conventions. The `+e` semantic translation was recognized after the source register was known, so preserve the route as strong intended-architecture evidence rather than a blind plaintext discovery.**

## Inputs already fixed independently

Authenticated 2014 square metadata fixes `e=3`.

P22 visibly mirrors the 809-centered source square. Under the independently selected BASE29 read:

```text
809 = [27,26]_29
mirror -> [26,27] -> NUMBERS ARE
```

A separate marker/source analysis establishes the exact state translation in the signed instruction:

```text
WORDS15   +e -> MAP18
MEANING20 +e -> ROAD23
NUMBERS26 +e -> DIRECTION29.
```

## P22 NUMBERS reaches DIRECTION29

Take `26 = NUMBERS` from the mirrored p22 square and apply the square-derived field:

```text
26 + e = 26 + 3 = 29 = DIRECTION.
```

Charging direct shifts by the reconstructed state fields `{g,a,b,A,B,K,e,q}`, only `e` lands on source index29 DIRECTION. Under the already established zero-based source-index/project-page convention, `DIRECTION29 -> p29`.

## P29 returns e from DIRECTION's same-numbered object

DIRECTION is zero-based source index29 and one-based source word30. Project p29 is physical LP2 page30, so the established numbered-object convention selects canonical word30:

```text
offset108
[11,26,11,18].
```

Apply the fixed four-rune H serialization:

```text
[x0-x3, x1-x2, x1+x2, x0+x3] mod29
 -> [22,15,8,0]
 -> [p-1,b,A,0].
```

This gives `p=23,b=15,A=8`, hence:

```text
e = b^-1 mod(p-1)
  = 15^-1 mod22
  = 3.
```

The local cycle is therefore:

```text
p22 square
 -> NUMBERS26
 -> +e=3
 -> DIRECTION29
 -> p29 word30
 -> [p-1,b,A,0]
 -> e=3.
```

## Why this matters

The p22 BASE29 branch previously consumed ARE27 through the numbered route. This bridge gives the other emitted source word, NUMBERS26, a direct state-native consumer. It reaches an independently exceptional p29 object whose H packet reconstructs the same state field that powered the hop.

## Evidence boundary

Exact and reproducible: center809 gives mirrored register values26,27; square metadata gives `e=3`; `26+3=29`; only `e` among the reconstructed state fields maps NUMBERS26 to DIRECTION29; DIRECTION selects p29 under the existing convention; p29 word30 H-decodes to `[22,15,8,0]`; that packet reconstructs `e=3`.

Interpretive: the author intended `+e` as an executable navigation operation, and this local cycle belongs to a larger route. No p29 body plaintext is recovered.

## Reproduction

```text
node sims/lp2_p22_numbers_plus_e_direction_p29_cycle_sft.cjs
```

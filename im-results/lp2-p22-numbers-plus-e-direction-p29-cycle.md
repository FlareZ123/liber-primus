# Conditional P22 value26 + e reaches 29; DIRECTION/p29 interpretation is register-origin dependent

**Agent13, 19 November 2026. Classification: source/state navigation candidate. Every arithmetic step is exact and uses pre-existing state/register conventions. The `+e` semantic translation was recognized after the source register was known, so preserve the route as a conditional architecture hypothesis rather than independent corroboration or a blind plaintext discovery.**

## 28 November source-origin correction (#3354)

The arithmetic `26 + e = 29` is exact. Its labels are origin-dependent: zero-origin gives 26=NUMBERS and29=DIRECTION; one-based word numbering gives 26=THEIR and29=THE. The signed 2016 text does not choose an origin, so the cycle below is only a conditional zero-origin construction and does not independently select p29. See [the register-origin gate](lp2-p50-signed-register-index-origin-gate.md).

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

Charging direct shifts by the reconstructed state fields `{g,a,b,A,B,K,e,q}`, only `e` lands on numeric register value29 from26. Under the **conditional zero-origin** lookup that value is DIRECTION and may be read as p29; under the one-based textual rival it is THE, so the page handoff is not source-selected.

## P29 returns e from DIRECTION's same-numbered object

Conditional on zero-origin lookup, DIRECTION is source index29 and one-based word30. The proposed branch then maps that number to project p29 / physical page30 and selects canonical word30:

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

The p22 BASE29 branch previously consumed ARE27 through the numbered route. This bridge gives the other emitted source word, NUMBERS26, a direct state-native consumer. It reaches the previously identified p29 object whose H packet reconstructs the same state field that powered the hop. Both branches reuse DIRECTION's numbering, H4 and the known DH state; the loop is arithmetic consistency, not an independent prediction. The 26 November Critic recount also shows that all 509 wholly page-contained four-rune groups have distinct H4 packets (see the [p29 packet report](lp2-p29-direction-selfindex-packet.md)); exact packet uniqueness alone cannot distinguish this object.

## Evidence boundary

Exact and reproducible: center809 gives mirrored numeric values26,27; square metadata gives `e=3`; `26+3=29`; p29 word30 H-decodes to `[22,15,8,0]`; that packet reconstructs `e=3`. Conditional on zero-origin lookup, 26 and29 are NUMBERS/DIRECTION and numeric29 is used as p29; one-based lookup changes them to THEIR/THE.

Interpretive: the author intended `+e` as an executable navigation operation, and this local cycle belongs to a larger route. No p29 body plaintext is recovered.

## Reproduction

```text
node sims/lp2_p22_numbers_plus_e_direction_p29_cycle_sft.cjs
```

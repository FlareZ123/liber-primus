# Rising square centers expose THE ROAD AND

**Agent11, 19 November 2026. Classification: strong source-constrained cross-era instruction readout candidate. No unknown LP2 body plaintext or reusable page cipher is claimed.**

## Fixed upstream family

Agent7's three-square holdout fixes the three authenticated 2014 square centers and their only joint source-register interpretation across every radix 2..809 and every whole-pair mirror mask:

```text
809 -> BASE29 [27,26] -> mirror -> [26,27] = NUMBERS ARE
331 -> BASE29 [11,12]           -> [11,12] = IS THE
 91 -> BASE29 [ 3, 4]           -> [ 3, 4] = LIES EMPTY
```

The upstream family has one survivor: BASE29 with only the 809 square reversed, matching the independently visible p22 mirror. This report keeps that radix and orientation fixed.

## Literal RISE order

The authenticated centers occur in source order as `809,331,91`, strictly descending. The repository independently recovers **THEIR RISE** from p33 and already uses RISE as increasing direction. Apply literal numeric rise:

```text
91 < 331 < 809.
```

The fixed BASE29 pairs become `[3,4] [11,12] [26,27]`. Apply the established GP29 pair operation `H(x,y)=[x-y,x+y] mod29`:

```text
H(3,4)   = [28, 7]
H(11,12) = [28,23]
H(26,27) = [28,24].
```

The difference coordinate is forced by unit adjacency:

```text
[28,28,28] = THE THE THE.
```

The varying sum coordinate is:

```text
[7,23,24] = THE ROAD AND.
```

Only source-register lookup occurs after the arithmetic.

## Complete order/channel charge

Charge all six center orders and the two global H channels, for 12 configurations. Map each output through the authenticated 43-word 2016 register and ask whether the lexical triple occurs contiguously anywhere in that source.

Exactly one configuration hits:

```text
center order  [91,331,809]
channel       sum
values        [7,23,24]
words         THE ROAD AND
source start  22
```

Every other center order and the difference channel yield zero contiguous source-trigram hits.

The uniquely located source span is:

```text
22 THE
23 ROAD
24 AND
25 THEIR
26 NUMBERS
27 ARE
28 THE
29 DIRECTION
```

The new readout therefore lands at the exact beginning of **THE ROAD AND THEIR NUMBERS ARE THE DIRECTION**. Center809 already emits `NUMBERS ARE` at 26..27, and the p28/p29 route independently supplies `THE DIRECTION` at 28..29.

## Human solve-path interpretation

The source-visible route is compact:

```text
SHED authenticated squares to centers
-> BASE29 fixed by all three centers
-> RISE the center values
-> H the adjacent index pairs
-> invariant difference channel / varying sum channel
-> THE ROAD AND.
```

The source order is descending, so RISE selects its exact reverse without a free permutation. Once every pair is a forward unit step, the H difference channel carries no center-specific information and the sum channel is the varying channel.

The final RISE/H composition was recognized after the three-center BASE29 holdout, so its chronology remains retrospective. The complete 12-case downstream charge bounds the immediate ordering and channel freedom.

## Decision

Preserve the rising-center H-sum readout as strong intended-route evidence. It strengthens the interpretation that the authenticated 2016 message was designed as an executable lexical register for earlier Cicada numerical artifacts. Continuous LP2 prose and a general symbol-changing inverse remain unresolved.

## Reproduction

```text
node sims/lp2_three_square_centers_rise_h_road_and_sft.cjs
```

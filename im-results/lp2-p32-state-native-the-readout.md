# P32 state-native north readout yields THE

**Agent15, 19 November 2026. Classification: second source-constrained p32 extraction candidate. The already reconstructed DH23 state selects two original p32 cells at offsets `p+g` and `p-a`; the independently frozen MAP consumer supplies north, and the cells read exactly THE. This was recognized retrospectively, so it remains candidate recovered instruction material rather than a whole-page decipherment.**

## Fixed inputs

The calibrated state is:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3.
```

The source-selected p32 object has:

```text
side = a+g = A+e = 11
runes = 121.
```

The independent signed-source/table route has already frozen the direction consumer:

```text
GP0(MAP)=56
p50[56]=4E
0x4E = ASCII N
56 --north one p50 row--> 48 = GP0(HERE).
```

The same exact MAP-to-north interpretation has a held-out solved-text transfer in the existing WAY -> MAP -> HERE result. No new direction parser is introduced here.

## State-native p32 read

Use two direct state addresses:

```text
start = p+g = 28
end   = p-a = 17.
```

Because the p32 row width is `a+g=11`:

```text
28 - 11 = 17.
```

Thus the pair is exactly one northward p32 step.

The original p32 runes are:

```text
p32[28] = 2  = TH
p32[17] = 18 = E
```

so the source-state north readout is:

```text
(p+g) --N--> (p-a)
TH             E
= THE.
```

The terminal E at offset17 is independently the third selected cell of the SEEKS-route ARE extraction `[49,26,17]`. The two p32 extractions therefore meet on the same original rune without changing either selector.

The authenticated 2016 context at zero-based indices16..18 is:

```text
ARE THE MAP
```

so the new p32 word is exactly the source word immediately after the independently recovered ARE candidate.

## Finite address/direction charge

To avoid selecting `p+g` after reading the output, charge a compact source-state address family.

Starting addresses are every DH field and every ordered pair under `+`, `-`, and `*`, collapsed to distinct in-range p32 offsets. This yields **49 distinct numeric addresses**.

Targets are every distinct authenticated 2016 source word with exactly two GP runes:

```text
THE = [2,18]
IS  = [10,15]
BE  = [17,18].
```

Charge all four cardinal directions from every in-bounds state-derived address.

There is exactly one hit:

```text
start 28 = p+g
direction N
end 17 = p-a
output THE.
```

Thus the THE result does not depend on choosing north after inspecting the p32 values. North is also the independently frozen MAP direction.

## Matched square-page control

Among unknown rune-bearing pages p0-p55, only two have nonzero perfect-square rune counts:

```text
p6  = 196 = 14^2
p32 = 121 = 11^2.
```

Applying the same state-derived address family, the same authenticated two-rune targets, and all four cardinal directions gives:

```text
p6:  BE only, under an eastward move 14 -> 15
p32: THE, under the northward p+g -> p-a move.
```

With the already frozen MAP direction **N**, p32 is the only square-page hit.

## Relation to the ARE extraction

The two p32 candidates now form a state-linked local instruction:

```text
SEEKS p=23 route
  -> final e-window [g^e, GP0(THE), GP0(DEVOTED)]
  -> p32 cells [49,26,17]
  -> ARE

p+g = 28
  -- MAP-supplied N / one p32 row -->
p-a = 17
  -> THE
```

Both use the same p32 side `a+g=A+e=11`, and both terminate at the same E cell17.

This is stronger than finding a second English fragment by free search because the address family and cardinal move are bounded by the already reconstructed state. It still does not establish a general p32 cipher or continuous plaintext, and the discovery order is retrospective.

## Follow-up: exact three-cell MAP extension is negative

The report's next prescribed step was to seek MAP under a predeclared state grammar. Agent11 charged the smallest unchanged extension of the successful THE family:

- keep the same eight DH fields and the same **49** distinct p32 state-derived addresses;
- keep the same 11×11 geometry and four cardinal directions;
- extend the cardinal read from two cells to exactly three;
- charge every distinct authenticated three-GP-rune word: `PATH / WAY / ITS / ARE / MAP / AND / YOU`;
- apply the identical family to the matched square page p6.

Result:

```text
p32 authenticated 3-rune hits: 0
p6  authenticated 3-rune hits: 0
```

Therefore the source continuation `ARE THE MAP` does **not** extend by simply continuing the state-address/cardinal read to a three-cell word. Preserve the two-rune THE extraction, and require a new first-party selector before attempting a different p32 MAP geometry. Do not tune start expressions, turns, wraps, or broken paths around this miss.

The strengthened reproducer is `sims/lp2_p32_state_native_the_readout_sft.cjs`.

## Decision

Preserve **ARE THE** as the leading p32 source-linked instruction fragment, with two distinct selectors:

- ARE from the source-selected SEEKS route and printed-coordinate closure;
- THE from direct state addresses and the independently frozen MAP -> N direction.

The next useful step is to seek MAP or the next operational object under a **predeclared state grammar**. Do not widen to arbitrary arithmetic expressions or free scattered-cell assembly.

## Reproduction

Run:

```text
node sims/lp2_p32_state_native_the_readout_sft.cjs
```

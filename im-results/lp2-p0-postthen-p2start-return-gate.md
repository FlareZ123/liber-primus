# Post-THEN physical p2-start return gate

**Agent28, 19 November 2026. Classification: intermediate source compression.** This result simplifies the conditional p0-p2 27x27 route immediately after `THEN`. The physical page-start relation was recognized after the public continuation `THE` was known, so it does not authenticate unknown plaintext.

## Upstream state

The existing source-only conditional route fixes block17 before this test:

- key node `IA(25,22)-IA(26,22)-IA(27,22)`;
- ciphertext `L(25,25) -> T(25,26) -> W(25,27)`;
- endpoint `W(25,27)` on the right matrix edge;
- carried read direction RIGHT.

The same route had already selected the physical p2 start `OE(20,16)` as a source landmark while deriving the earlier block5-through-IDEA boundary chain.

## Direct page-start return

Freeze the prior key-center rune and carried direction. The prior center is `IA=27`:

```
phi(27)   = 18
phi^2(27) = 6
radius    = 3
```

At each of the three original physical page starts in the 27x27 p0-p2 square, advance one cell in the carried RIGHT direction. Test all four straight grid axes with radius3. Exactly one equal-outer node exists:

```
physical p2 start  OE (20,16)
one step RIGHT     M  (20,17)

N (17,17) - M (20,17) - N (23,17)
```

Use the same scale6 as the inward displacement from the right-edge endpoint and half-scale3 as the tangential displacement. Of the two tangent signs, only one stays in bounds:

```
W (25,27) + (-3,-6) = J (22,21)
```

One more totient fixes length:

```
phi(6) = 2
```

so the selected source cells are:

```
J (22,21) -> W (21,20)
```

Only after these choices are fixed, the existing center-totient/Mobius key operation gives:

```
N-M-N -> N-E-N
J-W - N-E = TH-E
```

The conditional output is the same public candidate `THE`.

## Matched source control

The original p0-p2 grid contains 22 source-native vertical radius1 equal-outer mirrors. Pair each with a right-edge endpoint aligned to either outer row, giving 44 source states. Apply the page-start return rule without language scoring.

Only two of the 44 states have one source node and one in-bounds ciphertext start. Both use the exact `IA-IA-IA` prior node centered at `(26,22)`, both return to the same p2-adjacent `N-M-N` node, and they differ only in which prior outer row exits at the edge:

```
endpoint (25,27)  actual upstream THEN endpoint
endpoint (27,27)
```

The upstream state already fixes `(25,27)`.

The earlier DEATH left-edge state is a direct negative control. Its prior center rune is `B=17`, so `phi^2(17)=8` and radius4. Advancing one cell LEFT from every physical page start yields zero qualifying equal-outer nodes.

## Charge against the broad post-THEN family

The previous all-grid audit showed that the older edge/totient transform is common. The new SFT therefore charges the physical page-start relation inside that already frozen broad family.

Across its D4 source-state census:

```
996 framed states select exactly one Block18 mirror
4 framed states put that center one Manhattan step from a physical page start
2 distinct physical source states remain after D4 deduplication
```

The two physical states differ in sign relative to a page start. One center is `(10,19)`, the rune immediately before the p1 start. The actual THEN state selects `(20,17)`, the rune immediately after the p2 start in the carried RIGHT direction.

Charging the signed carried-direction relation leaves:

```
2 framed hits
1 distinct physical source state
```

That sole physical state is:

```
prior center  (26,22)
endpoint      (25,27)
next center   (20,17)
```

which is the actual upstream THEN state.

## Interpretation

This removes one weak semantic choice from the older post-THEN construction. That rule used `phi(previous-key-center column=22)=10` as an outer placement scale and searched a 47-geometry family. The physical-boundary version reuses an already selected original artifact boundary, carries the established RIGHT direction, and uses `phi^2(IA)=6` for the radius and inward displacement.

The result makes the p2 physical start a repeated route landmark and gives a shorter causal path to the exact `N-M-N / J-W` source geometry. The timing still matters: the public `THE` continuation existed before this relation was recognized. Keep `THE` as conditional and do not use this result to authorize the later `KEY / IS TO GO...` sequence.

A decisive successor must supply an independent source instruction or a genuinely unseen edge transition that consumes this frozen page-start return rule.

## Reproduction

```
node sims/lp2_p0_postthen_p2start_return_sft.cjs
```

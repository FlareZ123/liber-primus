# p0 post-IDEA mirror-walk parser candidate

**Agent 29, 18 November 2026. Classification: substantial post-hoc source-only parser candidate, not yet authenticated plaintext.**

The source-bounded p0-p2 bootstrap conditionally reaches `IDEA` on original cells `(15,20) -> (16,19) -> (17,18)` under key `U-A-A`. The last source cell is `D (17,18)`. Starting from that frozen state, the original 27x27 rune grid contains a compact mirror-incidence walk that reconstructs the next five public-route blocks **without consulting their plaintext while selecting cells**.

This materially narrows the earlier underselection result. It does not erase the central caveat: the walk rules below were reverse-engineered after the public route was already known, so they still require a prospective or independently authored confirmation.

## 1. Source mirror graph

Enumerate every horizontal, vertical, or 45-degree three-cell node whose outer runes are equal and equally spaced. The untouched p0-p2 matrix contains **479** such mirror nodes.

At the conditional `IDEA` endpoint:

- `D (17,18)` is the center of exactly one mirror: `J-D-J`, radius 2.
- Of its two outer `J` cells, only `J (19,16)` is itself a mirror center.
- That center has exactly one mirror: `OE-J-OE`, radius 1.
- The same shared `J (19,16)` touches exactly one further mirror after those two are removed: `J-B-J`, radius 4.

Thus the next three key-source nodes are fixed by local source incidence:

```
J-D-J  ->  OE-J-OE  ->  J-B-J
```

Their ordinary center-totient/Mobius-phase keys are respectively:

```
J-OE-J
OE-OE-I
J-J-T
```

## 2. One reusable geometric tie-break

The new walk uses **smallest mirror radius** whenever the stipulated local continuation family has more than one candidate. The same rule makes four later choices:

- at `F (19,15)`, forward horizontal alternatives have radii 4 and 5, selecting `F-X-F` radius 4;
- after the END endpoint, the two H-side same-axis continuations have radii 6 and 11, selecting `H-L-H`;
- from the D pivot, the two perpendicular mirror centers are `B (23,12)` with radius-4 `J-B-J` and `U (19,8)` with radius-7 `F-U-F`, selecting B;
- from the two `J-B-J` endpoints, the shortest outer-role alternatives have radii 1 and 2, selecting the `J-C-J` side.

No English score, dictionary, checksum, or desired word participates in those choices.

## 3. Deterministic reconstruction of stages 09-13

### Stage 09

At shared `J (19,16)`, reflect the unit direction toward the old `J-D-J` center across the vertical `OE-J-OE` axis. This maps NE to NW, giving start `X (18,15)`. The Manhattan-nearest cell of `OE-J-OE` is its upper `OE (18,16)`.

With key `J-OE-J`:

```
X OE -> O F
```

### Stage 10

Reflect the previous eastward read direction across the vertical `OE-J-OE` axis, giving west. The next key node `J-B-J` shares `J (19,16)`, so the minimum two-rune approach is:

```
A (19,17) -> J (19,16)
```

With key `OE-OE-I`:

```
A J -> TH E
```

### Stage 11

Reflect west across the `J-B-J` diagonal, giving south. Continue one cell west from the previous endpoint to `F (19,15)`. Among horizontal mirror bounces crossing to the opposite side, the minimum-radius choice is `F-X-F` radius 4, whose opposite F is `(19,23)`.

Read south until the first post-start cell with exactly one mirror incidence:

```
F (19,23) -> L (20,23) -> I (21,23)
```

The final I belongs to exactly one mirror, `I-R-I`. With key `J-J-T`, the block decrypts to:

```
E N D
```

### Stage 12

Enter the unique `I-R-I` and switch at its R center to the only other same-axis centered mirror, `H-R-H`. Both H outers offer a same-axis continuation; the minimum-radius rule selects the left `H-L-H` radius 6 over right `H-O-H` radius 11. At its L center, the only other same-axis centered mirror is `EO-L-EO`. Continue left to `EO (21,9)`, then bounce east.

The first new mirror center encountered outside that traversed chain is immediately `D (21,10)`:

```
EO (21,9) -> D (21,10)
```

With the `H-R-H` derived key `TH-H-H`, this decrypts to:

```
I S
```

### Stage 13

At `D (21,10)`, the shortest centered mirror not parallel to the incoming eastward read is `E-D-E`, radius 2. Moving one radius perpendicular to it lands on two mirror centers:

```
B (23,12): J-B-J radius 4
U (19,8):  F-U-F radius 7
```

The same minimum-radius rule selects B. At the two `J-B-J` endpoints, the shortest alternative outer-role mirrors have radii 1 and 2, selecting `J (27,8) -> J-C-J` radius 1. Its center `C (26,7)` is an outer of exactly one other mirror, `C-OE-C`, which carries the walk to `C (26,3)`.

Continue away from that C center to the physical matrix boundary:

```
C (26,3) -> I (26,2) -> E (26,1)
```

Reusing the selected `J-B-J` key `J-J-T` gives:

```
D EA TH
```

The final source cell at `(26,1)` has no mirror incidence, and the read is physically stopped by the left matrix boundary.

## 4. Locked aggregate check

Only after all five blocks are selected and decrypted, combine their output runes:

```
O F | TH E | E N D | I S | D EA TH
```

The aggregate is exactly:

```
12 runes
rune-index sum 151
GP-prime sum 553
```

Those values match the already-locked post-`THE IDEA` five-word residual. The parser does not use those values to choose any node, cell, direction, or stopping point.

This is stronger than the earlier one-ray test: the simple single-key 12-rune family had **0/105** checksum hits, whereas the mirror walk produces the exact five-block residual through source geometry.

## 5. Scientific status

This is the first local post-IDEA construction in this repository that selects the exact published stage-09 through stage-13 ciphertext cells without reading their English during selection. It also replaces several apparently unrelated public-route movements with one source graph, reflection operations, unique-incidence pivots, physical boundary stopping, and one repeated minimum-radius tie-break.

The result remains **post-hoc**. The public cells were known before this parser was formulated, so the rule set may encode them indirectly. Do not promote `OF THE END IS DEATH` to established LP2 plaintext yet.

The decisive next test is a genuinely prospective passage transition or an independent original clue that selects these walk primitives before its target cells are inspected. A failure there should retire or simplify this parser rather than add another local exception.

## Reproduction

Run the committed CommonJS SFT:

```
node sims/lp2_p0_postidea_mirror_incidence_sft.cjs
```

It reads only `resources/liber-primus/lp2-corpus.json`, enumerates all 479 mirrors, derives stages 09-13 from the frozen IDEA state without plaintext feedback, asserts the exact selected source cells, decrypts them, and checks the aggregate only at the end.

# p0 conditional finite continuation from GO through TO THE

**Agent 29, 18 November 2026. Classification: post-hoc finite source selector, conditional on the existing key-signature recurrence.**

The preceding finite selectors reach block 22:

```
key: TH-G-TH centered at G(12,14), radius 7
ciphertext: H(9,20) -> C/K(9,21)
plaintext runes: G O
```

This note extends the source-selected candidate route by two blocks while keeping the new coordinate families finite and plaintext-blind during selection.

## Block 23: 32 key geometries -> one mirror

From current radius `r=7`:

```
phi(r) = 6
phi^2(r) = 2
r - phi^2(r) = 5
phi(r)/2 = 3
```

Take next radius 6. Around the current key center (12,14), enumerate:

- center displacements `(5,3)` and the swapped `(3,5)`;
- all four sign pairs;
- all four grid axes.

After bounds there are **32** source-node geometries. Exactly **one** is an equal-outer node:

```
signs: +row / +column
center: N (17,17)
radius: 6
axis: down-right diagonal
node: D (11,11) - N (17,17) - D (23,23)
```

The remaining smaller radius-derived pair is `(3,2)`. Under the selected sign pair, test `(3,2)` and its swap from the previous endpoint C/K(9,21):

```
(3,2) -> (12,23)
(2,3) -> (11,24)
```

Require continuity with the previous key center's row 12. This leaves **(12,23)**.

Read horizontally toward the selected next key center column 17, retaining the current two-rune length:

```
OE (12,23) -> Y (12,22)
```

The standard center-totient/Mobius operation on `D-N-D` gives aligned key `G-D-D`, and only after selection the block decrypts to:

```
T O
```

The row-continuity condition is the weakest new assumption in this stage and remains explicitly post-hoc.

## Block 24: two geometric candidates -> one predicted signature

For the selected block-23 key:

```
radius = 6
half radius = 3
phi(center column 17) - 3 = 13
```

Couple the same sign pair to:

```
next center = (17,17) + (signRow*3, signCol*13)
next start  = previous endpoint (12,22) + (signRow*3, signCol*3)
```

The current ciphertext is horizontal, so use a perpendicular vertical three-cell source with radius 3.

Bounds leave exactly **two** geometries:

```
(-,-):
  center X (14,4)
  start T (9,19)
  direct node L-X-S
  direct-key Mobius signature (0,+1,0)

(+,-):
  center L (20,4)
  start Y (15,19)
  direct node S-L-TH
  direct-key Mobius signature (0,0,+1)
```

The existing Direct/+0 next-key signature recurrence is fixed independently of this new coordinate family. Applied to block 23, with outer state 1 and leftmost cell Y(12,22), it predicts:

```
phase 1
next outer state 0
signature (0,+1,0)
```

Only the first geometric candidate matches.

Because its source is non-mirror, use the public route's direct-node key rule at this stage. Phase 1 rotates:

```
L-X-S -> X-S-L
```

Read horizontally toward the selected key center:

```
T (9,19) -> R (9,18)
```

and the block decrypts to:

```
TH E
```

## Conditional passage

The source-selected candidate path now reaches:

```
... THE KEY IS TO GO TO THE EAST
```

The original post-GO gates remain:

```
block 23 key:   32 geometries -> 1 mirror
block 23 start: 2 nested starts -> 1 row-continuity survivor
block 24:       2 geometries -> 1 predicted-signature survivor
```

Agent12 then replaced the former block-25 coordinate exception with a widened physical-boundary/successor gate. Starting only from the selected THE state and the already frozen Reports 01–08 forecasts, it enumerates every original key node across all axes/radii, permits both direct and center-totient derivations, requires a physical-row-20 outer and a Report06-valid start, exhausts every compatible diagonal ciphertext length, and tests whether each candidate can hand off to any next source state. The family contains eight key/start candidates and leaves exactly one current block: direct `E-O-D`, start `(14,24)`, down-left for three cells, which decrypts only after selection to `EA-S-T`.

Detailed gate: `im-results/lp2-p0-east-successor-gate.md` · reproducer: `sims/lp2_p0_east_successor_gate_sft.cjs`.

## Honest breakpoint

The EAST successor gate also source-selects the following unit mirror `H-T-H` at center `(19,26)`, because only the east-adjacent physical-boundary cell `(20,25)` belongs to a unit equal-outer mirror. Its next ciphertext start remains underdetermined: the widened all-four-cardinal `phi(center)` construction leaves both `(4,10)` and `(6,12)` compatible with the next-state forecasts. The public route uses `(6,12)`, but this test does not select it. The finite-selector chain therefore now stops **after EAST and before OF**.

## Status

The selection counts are genuine within their stated finite families. The coordinate families, block-23 row-continuity condition, Reports 01–08 recurrence, and block-25 physical-boundary/successor grammar were all formulated after the public route was known. EAST no longer requires a target-specific coordinate formula inside the widened gate, while the mechanism remains conditional and post-hoc rather than authenticated LP2 plaintext.

## Reproduction

```
node sims/lp2_p0_postgo_finite_selectors_sft.cjs
node sims/lp2_p0_east_successor_gate_sft.cjs
```

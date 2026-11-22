# p0 finite source continuation from KEY through GO

**Agent 29, 18 November 2026. Classification: conditional post-hoc finite source selectors.**

The post-THEN edge/totient gate selects the conditional block-19 state:

```
key: TH-H-TH centered at H(12,16), radius 1
ciphertext: N(21,4) -> L(20,4) -> EA(19,4)
decrypted runes: C/K E Y
```

This note continues from that frozen state. Each transition defines a small source family before decryption, then uses bounds and equal-outer source geometry to select the surviving node.

## Block 20: 8 geometries -> 1 mirror

From the block-19 endpoint `EA(19,4)`:

```
next length = phi(endpoint column 4) = 2
next radius = [phi(key-center row 12) + phi(key-center col 16)] / 2
            = (4 + 8) / 2
            = 6
```

For every row/column sign pair, place:

```
start  = endpoint + (signRow * current radius,
                     signCol * current ciphertext length)

center = start    + (signRow * current radius,
                     signCol * next length)
```

Test all four grid axes at radius 6.

There are **8** in-bounds geometries. Exactly **1** is an equal-outer node:

```
signs: up/right
start: X (18,7)
center: I (17,9)
node: W (17,3) - I (17,9) - W (17,15)
radius: 6 horizontal
```

Read two cells back toward the prior endpoint quadrant:

```
X (18,7) -> OE (19,6)
```

The standard center-totient/Mobius key is `R-W-W`, producing:

```
I S
```

## Block 21: carried or reversed direction -> 1 in-bounds mirror

From the selected block-20 state, allow only the current diagonal read direction and its exact reverse.

For each direction:

```
start = previous endpoint
      + direction * current original center-rune index

center row = current center row
           + direction.row * current center column

center col = current center col
           + direction.col * phi(current center row)

next radius = current radius / 2 = 3
```

Test all four axes.

The carried direction exits the 27x27 matrix. The exact reverse gives one in-bounds node geometry:

```
direction: up/right
start: U (9,16)
center: M (8,25)
node: X (5,25) - M (8,25) - X (11,25)
radius: 3 vertical
```

It is an equal-outer node. Reusing the current two-rune length gives:

```
U (9,16) -> NG (8,17)
```

with key `X-E-X`, producing:

```
T O
```

## Block 22: 10 key geometries -> 1 mirror; 2 starts -> 1

From the block-21 key center `M(8,25)`:

```
d = phi(row 8) = 4
next radius = current radius 3 + d = 7
```

Around the block-21 endpoint `NG(8,17)`, enumerate all four sign pairs:

```
candidate center =
  endpoint + (signRow*d, signCol*current radius)
```

and all four axes at radius 7.

This yields **10** in-bounds key geometries. Exactly **1** is a mirror:

```
TH (5,14) - G (12,14) - TH (19,14)
```

For the ciphertext start, shift the previous block's start `U(9,16)` horizontally by `+/- d`:

```
(9,12) or (9,20)
```

The selected key radius gives:

```
phi(7) = 6
```

Require the start's horizontal distance to the selected key center column 14 to equal 6.

```
(9,12): distance 2, fails
(9,20): distance 6, passes
```

Read two cells in the chosen horizontal direction:

```
H (9,20) -> C/K (9,21)
```

The node derives constant key `TH-TH-TH`, producing:

```
G O
```

## Conditional continuation now selected

Combining the earlier source gates with these three finite selectors gives the conditional candidate passage through block 22:

```
... SEE YOU SOON THEN THE KEY IS TO GO
```

The strongest new finite counts here are:

```
block 20: 8 in-bounds geometries -> 1 mirror
block 21: carried/reversed direction family -> 1 in-bounds mirror
block 22: 10 key geometries -> 1 mirror
          2 ciphertext starts -> 1 distance match
```

No plaintext score or dictionary test selects the survivors.

## Status

These formulas were discovered after the public route was known. Their finite source selectivity is real, while the choice of transition formula at each stage remains post-hoc. They therefore improve source compression and reproducibility without authenticating the candidate plaintext.

The public route changes mechanism class again after GO, introducing a new mirror placement and then non-mirror keys with direct or transformed centers. Any continuation should be required to reuse one of the already-derived selectors or supply an independent source clue. Adding new stage-specific formulas solely to preserve the English continuation would weaken the evidence.

## Reproduction

```
node sims/lp2_p0_postkey_finite_selectors_sft.cjs
```

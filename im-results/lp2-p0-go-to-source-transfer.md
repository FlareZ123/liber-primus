# p0 GO -> TO source-state transfer

**Agent45, 18 November 2026. Classification: conditional source-selected continuation.**

The frozen p0-p2 route had reached block 22:

```
plaintext     GO
source node   TH-G-TH
key center    (12,14)
key radius    7
ciphertext    H(9,20) -> C/K(9,21)
```

This note advances one block without an English score or dictionary lookup. The selected cells decrypt to `T-O` only after the source geometry is fixed.

## Key placement

Reuse the half/full placement shape already present in the p0 route. Derive the scale and radius only from the frozen GO key geometry:

```
placement scale = 2 * phi(center row 12) = 8

next radius = phi(center column 14) = 6
            = phi(current radius 7)       = 6
```

From the current endpoint `(9,21)`, enumerate both coordinate shapes

```
(+/-8, +/-4)
(+/-4, +/-8)
```

and all four grid axes at radius 6. Bounds leave **11** physical geometries. Exactly **one** has equal outer runes:

```
D(11,11) - N(17,17) - D(23,23)
radius 6, down-right diagonal
```

Its center-totient key is

```
D-N-D -> D-G-D
```

and the standard Mobius phase is 1, giving aligned key `G-D-D`. Its signature `(+1,-1,+1)`, phase 1, and odd/odd center also agree with the already-frozen forecast from GO.

## Ciphertext placement

The new radius is 6, so its half-radius is 3. From the frozen GO start `H(9,20)`, enumerate all eight radius/2 moves. Require the candidate start to lie exactly one new-radius Chebyshev step from the selected key center `(17,17)`.

All eight moves are in bounds. Exactly **one** satisfies the distance condition:

```
(9,20) + (+3,+3) = OE(12,23)
d_infinity((12,23),(17,17)) = 6
```

Carry the current two-rune block length. The frozen GO forecast requires a horizontal next block with its endpoint as the leftmost cell, fixing a leftward read:

```
OE(12,23) -> Y(12,22)
```

Only after those choices are fixed, subtract the selected `G-D-D` key:

```
OE(22) - G(6)  = T(16)
Y(26)  - D(23) = O(3)
```

Therefore the conditional continuation is:

```
... THE KEY IS TO GO TO
```

Forward reencryption exactly returns `OE,Y`.

## What changed

This removes the immediate post-GO breakpoint for the conditional 27x27 route. The transition is finite and source-only at selection time:

- **11** in-bounds half/full key geometries -> **1** equal-outer mirror;
- **8** radius/2 start moves -> **1** distance survivor;
- fixed two-rune length and the pre-existing GO direction forecast then determine the ciphertext cells.

The radius has an independent source cross-check because both `phi(14)` and `phi(7)` equal 6.

The placement formulas were recognized with the public candidate route available, so this remains intermediate evidence rather than authenticated LP2 plaintext. The useful next decision is stricter: attempt the same already-existing selector families from this new TO state. If none transfers to block 24 without a new target-specific formula, preserve TO and stop extending this mechanism.

## Reproduction

Run:

```
node sims/lp2_p0_go_to_source_transfer_sft.cjs
```

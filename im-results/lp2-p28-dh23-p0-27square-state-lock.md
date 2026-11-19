# The p28 DH23 state locks the p0-p2 27x27 opening geometry

**Agent24, 19 November 2026. Classification: strong independent cross-object lock on an existing conditional original-cipher route. The test uses no English or candidate plaintext to select its DH state relations. The route operations were reconstructed after the public 27x27 candidate existed, so the resulting words remain conditional rather than authenticated unknown-page plaintext.**

## Result

The independently source-selected p28 line6/word28 object fixes the standard Diffie-Hellman state

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4)
```

where `e=g-K=3` and `q=e+1=4`.

That state unexpectedly types the pre-existing p0-p2 27x27 route at every scale from chapter size to page boundaries, source nodes, movement lengths, key values, and the first p1 branch.

The strongest new relation is that the independently recovered state fixes the 27x27 object itself:

```text
e^a = 3^6 = 729 = p0+p1+p2 rune count
-K mod29 = 27
729 = 27^2
```

So the already visible 729-rune opening chapter has both its area and side supplied by the p28 state.

## Physical page boundaries are state coordinates

With the 729 runes placed row-major in the existing 27x27 square, one-based physical page boundaries are:

```text
p0 end   = (10,19) = (-B, B)
p1 start = (10,20) = (-B, p-e)

p1 end   = (20,15) = (p-e, b)
p2 start = (20,16) = (p-e, K-b)

p2 end   = (27,27) = (-K,-K)
```

These identities are exact arithmetic under the independently derived state. No candidate plaintext participates.

The visible p0 red heading/delimiter count is also state-typed:

```text
13 = b-K
phi(13) = 12
```

so the pre-existing red13/totient anchor `(13,12)` is now connected directly to the same DH state.

## Block 1: the opening node is an exact state packet

At the existing anchor `(13,12)`, the horizontal radius-one node is:

```text
AE - J - EA
25   11   28
```

and its values are exactly

```text
[-q, B-A, -1].
```

Across every canonical horizontal, vertical, and diagonal radius-one triple in the original 27x27 grid, that ordered value triple occurs exactly once, at:

```text
(13,11) (13,12) (13,13).
```

Its center follows a closed totient ladder through the state:

```text
B-A = 11
phi(11) = 10 = -B
phi(10) = 4 = q

phi(11) + phi(10)
= 10 + 4
= 14
= -b.
```

The existing movement distance therefore has a direct state value. Starting at the first outer cell and moving fourteen cells east lands at:

```text
(13,25) = (b-K, -q),
```

which is the existing block-1 ciphertext start.

Transforming the node center once gives the fixed key:

```text
[-q,-B,-1]
=
[25,10,28]
=
AE I EA.
```

## The endpoint is a second unique state packet

The existing equal-outer endpoint `X-OE-X` is:

```text
[14,22,14]
=
[-b, p-1, -b].
```

It is also unique among all canonical radius-one triples in the original 27x27 grid, at:

```text
(14,4) (14,5) (14,6)
=
(-b,q) (-b,g) (-b,a).
```

Its center has the same first totient result as the opening node:

```text
phi(p-1)
=
phi(22)
=
10
=
-B.
```

Adding that displacement to the endpoint's first column gives:

```text
q + (-B) = 4 + 10 = 14 = -b,
```

so the endpoint lands exactly on the 27x27 matrix center:

```text
(-b,-b) = (14,14).
```

The already fixed row-major segment from `(13,25)` through the first endpoint cell therefore decrypts under the state-derived key to:

```text
AS I GO THE
```

with exact forward replay.

This plaintext was already proposed by the external 27x27 route. The new evidence is the independent p28-state explanation of its source operands and movement, not the English output itself.

## Blocks 2 and 3 remain inside the same state geometry

Applying the existing center-totient and rotation rule to the endpoint produces:

```text
X X I
[14,14,10]
=
[-b,-b,-B].
```

The existing block-2 path starts at the exact state center `(-b,-b)`, has length `g=5`, ends at column `A-B=18`, and sits immediately before the physical p0 boundary column `B=19`. It decrypts to the pre-existing candidate:

```text
WEATHER
```

The block-3 source key is:

```text
H NG C
[8,21,5]
=
[A,-A,g].
```

The selected source object is the existing vertical radius-`-B=10` packet centered at:

```text
(-b,p) = (14,23)
```

with endpoints:

```text
(q,p) = (4,23)
(-g,p) = (24,23).
```

There is one other `[A,-A,g]` triple elsewhere when all radii are opened, so the values alone do not choose this source. The already established p0 half-turn geometry selects the `(-b,p)` instance.

The fixed block-3 path starts at:

```text
(-b,B) = (14,19)
```

and ends at the physical p0 terminal coordinate:

```text
(-B,B) = (10,19).
```

Its length is again `g=5`. Under `[A,-A,g]` it gives:

```text
TURNS
```

with exact forward replay.

## First p1 branch: COLD is state-typed too

The already published COLD source node is the unique canonical radius-one occurrence of:

```text
H TH H
[8,2,8]
=
[A,K,A].
```

Its source coordinates are:

```text
(-q,B) = (25,19)
(-e,B) = (26,19)
(-K,B) = (27,19).
```

Transforming the center by Euler totient and applying the already frozen route rotation gives:

```text
[1,A,A]
=
U H H.
```

The pre-existing COLD ciphertext path is:

```text
(-b,g+K) -> (B-A,g+K)
(14,7)   -> (11,7)
```

and contains exactly `q=4` runes.

The formerly exposed 12-step post-TURNS geometry is now also state arithmetic:

```text
phi(b-K) = phi(13) = 12

(-b,B) -> (-e,B)   = DOWN 12
(-b,B) -> (-b,g+K) = LEFT 12.
```

The independent p50 shared-secret ring had already supplied the ordered directions DOWN / LEFT / UP for this branch. The DH state now explains the numeric endpoints reached by those directions. The resulting fixed original cells decrypt to the pre-existing candidate:

```text
COLD
```

with exact forward replay.

## What this changes

The p0-p2 27x27 route was previously held below authenticated plaintext because its transition grammar was reconstructed after the public English candidate and because later stages branch heavily.

The p28 DH23 state was recovered from an independent unknown-page source object. It now supplies a dense cross-object holdout for the already existing opening route:

```text
chapter area       = e^a = 729
square side        = -K = 27
red count          = b-K = 13
p0 physical end    = (-B,B)
p1 physical start  = (-B,p-e)
p1 physical end    = (p-e,b)
p2 physical start  = (p-e,K-b)
p2 terminal corner = (-K,-K)

block1 source      = [-q,B-A,-1]
block1 phi ladder  = B-A -> -B -> q
block1 movement    = -b
block1 start       = (b-K,-q)

endpoint source    = [-b,p-1,-b]
endpoint location  = (-b,q..a)
matrix center      = (-b,-b)

block2 key         = [-b,-b,-B]
block3 key         = [A,-A,g]
block4 source      = [A,K,A]
```

This is substantially harder to explain as a mere English-selected local path than the earlier route alone. It links an independently recovered cryptographic state to original chapter dimensions, original physical page boundaries, and several pre-existing route operands.

The chronology still matters. The 27x27 route and its English candidates predated this DH-state interpretation. This is therefore a strong **cross-object authentication signal**, not a prospective plaintext prediction.

## Decision

Promote the p28-DH23 / p0-p2-27x27 relationship as a leading structural route. Preserve the existing opening candidate:

```text
AS I GO THE WEATHER TURNS COLD
```

as strongly state-locked intermediate plaintext.

Do not promote it to authenticated unknown-page plaintext until the combined state/geometry mechanism predicts a genuinely untouched transition before its output is read.

The decisive successor is now concrete: use only the frozen DH state, page geometry, p50 ring directions, and already accepted totient/H operations to predict a later 27x27 source node, path, key order, and stop that were not used to discover this state lock.

## Reproduction

```text
node sims/lp2_p28_dh23_p0_27square_state_lock_sft.cjs
```

The SFT derives DH23 from the original p28 layout, reconstructs the original 729-rune p0-p2 square, checks the physical page-boundary identities, exhausts the exact block-1/endpoint/block-4 radius-one packets, records the block-3 duplicate control, decrypts the four frozen candidate blocks, and verifies exact forward replay.

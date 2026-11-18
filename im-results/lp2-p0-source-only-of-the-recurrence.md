# P0 source-only recurrence from IDEA: OF THE, then END geometry

**Agent7, 18 November 2026. Classification:** strong source-derived continuation. The input state is the independently reached IDEA endpoint and read direction from the existing p0 continuation bootstrap. No dictionary, downstream checksum, or expected plaintext selects OF or THE.

## Input state

The existing continuation reaches IDEA on the original p0-p2 square with:

```text
IDEA endpoint       D (17,18)
IDEA read direction down-left = (+1,-1)
```

From that state, the next two blocks follow a deterministic local recurrence.

## OF

### 1. Unique mirror at the endpoint

`D (17,18)` centers exactly one equal-outer mirror in the whole 27x27 square:

```text
J (15,20) -> D (17,18) -> J (19,16)
```

This `J-D-J` mirror supplies the key. Center totient plus the established Möbius rotation gives:

```text
J-D-J -> J-OE-J
```

### 2. Unique mirror centered on a primary outer

Of the two outer J cells, only `J (19,16)` centers another equal-outer mirror:

```text
OE (18,16) -> J (19,16) -> OE (20,16)
```

The two secondary outer cells have Chebyshev distances 2 and 3 from the IDEA endpoint, so the nearer outer is uniquely `OE (18,16)`.

The secondary mirror is vertical. Project the prior IDEA read direction `(+1,-1)` onto its perpendicular axis. The nonzero perpendicular component points left:

```text
(0,-1)
```

Step one cell left from the near outer:

```text
OE (18,16) -> X (18,15)
```

Use that as the new start and read one step back to the mirror:

```text
X (18,15) -> OE (18,16)
```

Decrypt with `J-OE-J`:

```text
X - J   = O
OE - OE = F
```

The block is **OF**.

## THE

The same secondary `OE-J-OE` mirror now becomes the next key. Its derived and rotated key is:

```text
OE-J-OE -> OE-OE-I
```

The OF endpoint is the near outer `OE (18,16)`. Move one cell inward along the mirror axis to its center `J (19,16)`. Then step one cell in the prior OF read direction, which is right, and read back to the center:

```text
A (19,17) -> J (19,16)
```

Decrypt:

```text
A - OE = TH
J - OE = E
```

The block is **THE**.

This is a source-only extension of the independent candidate:

```text
... NOW THE IDEA OF THE
```

## Next stage: END geometry is already strongly constrained

At the new endpoint `J (19,16)`, exclude the two mirrors already consumed by OF/THE. Exactly one unused incident mirror remains:

```text
J (19,16) -> B (23,12) -> J (27,8)
```

Its derived key is `J-J-T`, and its radius is 4.

Continue one cell in the prior THE read direction, left, reaching `F (19,15)`. Among mirrors for which this F is an outer endpoint, exactly one both aligns with that inherited horizontal direction and has radius 4 matching the new key mirror:

```text
F (19,15) -> X (19,19) -> F (19,23)
```

Traversing to the far F fixes the next ciphertext start at **F (19,23)**.

The vector from the prior endpoint to the new key center has positive row sign. Taking the perpendicular of the horizontal bridge with that sign fixes the read direction as **down**.

The first three cells are:

```text
F (19,23) -> L (20,23) -> I (21,23)
```

and `J-J-T` decrypts them to `E-N-D`.

The start, key and direction are source-derived here. The current recurrence does not yet independently derive the three-rune stop length, so END remains a one-step weaker claim than OF and THE. The separate full-checksum suffix gate tests that stop and the remaining IS/DEATH continuation.

## Reproduction

```text
node sims/lp2_p0_source_only_of_the_sft.cjs
```

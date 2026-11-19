# Agent25 precommit: block6 endpoint mirror predicts block7 start

**Sealed before inspecting the published block7 geometry/walkthrough.**

After the block6 start holdout failed, keep only source-visible geometry already exposed by block6 itself.

The block6 ciphertext ends at:

```text
(17,16) = (p-a,K-b)
```

and that exact cell is the right outer endpoint of the horizontal mirror:

```text
S - IA - S
(17,4) (17,10) (17,16)
```

The mirror is also completely DH-state typed:

```text
raw values = [15,27,15] = [b,-K,b]
center      = (17,10) = (p-a,-B)
radius      = 6 = a
```

This resembles the immediately preceding block5->block6 transition, where the previous ciphertext endpoint was an outer endpoint of the next key-node mirror.

## Withheld prediction

Freeze the simplest source-visible continuation before inspecting block7:

> The opposite outer endpoint of the newly exposed block7 mirror, **(17,4)**, is the next ciphertext start.

This is a one-coordinate prediction. No plaintext spelling, dictionary score, alternate state expression, rotation, or nearby coordinate search is allowed.

## Gate

If block7 starts at (17,4), retain the endpoint-mirror handoff as a two-step transition candidate. If block7 starts elsewhere, reject this exact opposite-endpoint start rule.


## Outcome after opening block7

**FAIL.** The published block7 ciphertext starts at `(11,16)`, not the predicted opposite mirror endpoint `(17,4)`. Retire this exact opposite-endpoint start rule.

The opened block7 object is nevertheless DH-state compatible under the already fixed state:

```text
key node OE-J-OE:
  [22,11,22] = [p-1,B-A,p-1]
key center:
  (19,16) = (B,K-b)
radius:
  1 = e-K
center transform:
  phi(B-A)=phi(11)=10=-B
aligned key:
  [p-1,p-1,-B] = [22,22,10]

ciphertext start:
  (11,16) = (B-A,K-b)
ciphertext end:
  (15,20) = (b,p-e)
path length:
  g=5
```

This retains local state compatibility while rejecting the tested reusable transition law.

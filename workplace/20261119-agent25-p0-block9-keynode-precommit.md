# Agent25 precommit: block8 endpoint-center predicts block9 key node

**Sealed before inspecting the published block9 geometry/walkthrough.**

Fixed p28 DH23 state:

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)
```

Block8 ciphertext ends at:

```text
(17,18) = (p-a,A-B)
```

That exact cell is the center of the untouched diagonal radius-`K=2` mirror already visible before opening block8:

```text
J - D - J
(15,20) (17,18) (19,16)
[11,23,11] = [B-A,p,B-A]
```

The first outer endpoint `(15,20)` is also block8's ciphertext start, so block8 traverses from one outer endpoint of this state packet to its center.

## Withheld prediction

> **Block9 uses the exact `J-D-J` diagonal node at `(15,20),(17,18),(19,16)` as its key-source node.**

Only the source node is predicted. No plaintext, center transform, key rotation, ciphertext path, path direction, or length is part of this gate.

## Gate

A positive requires exact node identity and coordinates. Any other source node rejects this transition hypothesis. No larger-radius or value-equivalent rescue is allowed.

## Outcome after opening block9

**PASS.** The published block9 key-generating node is exactly:

```text
J (15,20) - D (17,18) - J (19,16)
```

with center `(17,18)`, radius2, and raw indices `[11,23,11]`, exactly the sealed prediction.

The published derivation transforms the center by `phi(23)=22`, yielding `J-OE-J`; no part of that transform or the candidate plaintext `OF` was used to select the node.

This is a prospective source-geometry hit. It authenticates one transition component only; the block9 ciphertext start, direction, length, and plaintext were not predicted by this gate.

# Agent25 precommit: connected block9 mirror predicts block10 key node

**Sealed before inspecting the published block10 geometry/walkthrough.**

Fixed DH23 state:

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)
```

The prospectively correct block9 key node is:

```text
J - D - J
(15,20) (17,18) (19,16)
[11,23,11] = [B-A,p,B-A]
```

Its lower outer `J (19,16)` is simultaneously the center of the vertical radius-one mirror:

```text
OE - J - OE
(18,16) (19,16) (20,16)
[22,11,22] = [p-1,B-A,p-1]
```

The center coordinate is `(B,K-b)=(19,16)` and radius `e-K=1`. This is a pre-existing original-grid object and the exact same source node used earlier for block7.

## Withheld prediction

> **Block10 uses `OE-J-OE` at `(18,16),(19,16),(20,16)` as its key-source node.**

No plaintext, transform, key rotation, ciphertext path, direction, or length is predicted.

## Gate

Exact node identity and coordinates are required. Any different node rejects this transition hypothesis; node reuse is allowed because the prediction itself explicitly specifies the prior node.

## Outcome after opening block10

**PASS.** The published block10 key-generating node is exactly:

```text
OE (18,16) - J (19,16) - OE (20,16)
```

with radius1 and raw indices `[22,11,22]`, exactly as sealed. The published block transforms `J` by `phi(11)=10` and rotates the resulting key; neither transform nor candidate plaintext `THE` was used in the node prediction.

This is the second consecutive prospective key-node hit after block9. As before, it authenticates the source-node transition component only; ciphertext start, direction, length, and plaintext remain outside the prediction.

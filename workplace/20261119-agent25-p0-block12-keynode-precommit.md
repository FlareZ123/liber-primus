# Agent25 precommit: unique block11 endpoint mirror predicts block12 key node

**Sealed before inspecting the published block12 geometry/walkthrough.**

Fixed DH23 state:

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)
```

Block11 ciphertext ends at `(21,23) = (p-K,p)`. Exhausting canonical horizontal, vertical, and diagonal mirrors through that exact original cell finds one mirror only:

```text
I - R - I
(21,21) (21,22) (21,23)
[10,4,10] = [-B,q,-B]
radius = e-K = 1
center = (p-K,p-1)
```

## Withheld prediction

> **Block12 uses `I-R-I` at `(21,21),(21,22),(21,23)` as its key-source node.**

No plaintext, center transform, key rotation, ciphertext path, direction, or length is predicted.

## Gate

Exact node identity and coordinates are required. Any other key source rejects this hypothesis; no alternate mirror search is allowed after inspection.

## Outcome after opening block12

**FAIL.** Block12 uses the larger same-center mirror `H-R-H`, not the unique endpoint mirror `I-R-I`.

The actual key source is nevertheless fully DH-state typed and shares the predicted center:

```text
H - R - H
(21,17) (21,22) (21,27)
[8,4,8] = [A,q,A]
radius = g=5
center = (p-K,p-1)
```

The rejected endpoint mirror `[−B,q,−B]` and actual key mirror `[A,q,A]` share center `R(21,22)` and, after center totient, share the same totient signature. This connection was published in block12 but was not part of the sealed gate.

# Agent25 precommit: connected block12 H-L-H mirror predicts block13 key node

**Sealed before inspecting the published block13 geometry/walkthrough.**

Fixed p28 DH23 state:

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)
```

Block12 key source is `H-R-H` at `(21,17),(21,22),(21,27)`. Its left outer `H (21,17)` is simultaneously the right outer endpoint of the connected mirror:

```text
H - L - H
(21,5) (21,11) (21,17)
[8,20,8] = [A,p-e,A]
radius = a=6
center = (p-K,B-A)
```

Block12's published route continues through this exact mirror toward its ciphertext start, so it is source-visible before block13.

## Withheld prediction

> **Block13 uses `H-L-H` at `(21,5),(21,11),(21,17)` as its key-source node.**

No plaintext, transform, key rotation, ciphertext path, direction, or length is predicted.

## Gate

Exact node identity and coordinates are required. Any other source node rejects this hypothesis; no substitution with the adjacent `EO-L-EO` mirror is allowed.

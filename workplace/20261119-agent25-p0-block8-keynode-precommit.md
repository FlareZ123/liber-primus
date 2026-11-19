# Agent25 precommit: predict block8 key node from the block7 start state packet

**Sealed before inspecting the published block8 geometry/walkthrough.**

Fixed p28 DH23 state:

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)
```

The recorded block7 ciphertext starts at:

```text
(11,16) = (B-A,K-b)
```

That exact original cell is the top endpoint of the nearest vertical radius-one mirror:

```text
TH - H - TH
(11,16) (12,16) (13,16)
[2,8,2] = [K,A,K]
```

This is a simple state packet and is the outer/inner transpose of the already established block4 source packet `[A,K,A]`.

## Withheld prediction

> **Block8 uses the original vertical radius-one `TH-H-TH` node at `(11,16),(12,16),(13,16)` as its key-source node.**

Only the source node is predicted. No plaintext, ciphertext path, key-center transform, path direction, or block length is included in the gate.

## Gate

A positive requires the published block8 source node to be exactly those three original cells. Any other node rejects this exact transition hypothesis. No nearby-node, larger-radius, rotated-axis, or value-equivalent rescue is allowed.

## Outcome after opening block8

**FAIL.** Block8 uses the diagonal radius-three node `A-TH-A` at `(8,13),(11,16),(14,19)`, not the predicted vertical `TH-H-TH` node.

The actual block8 geometry is itself compactly DH-state typed:

```text
source node values:
  [24,2,24] = [-g,K,-g]
source center:
  (11,16) = (B-A,K-b)
radius:
  e=3

ciphertext start:
  (15,20) = (b,p-e) = exact block7 endpoint
ciphertext end:
  (17,18) = (p-a,A-B)
path length:
  e=3
```

The tested `[K,A,K]` node rule is retired. No axis/radius rescue is permitted.

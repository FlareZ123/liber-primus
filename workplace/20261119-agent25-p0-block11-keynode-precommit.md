# Agent25 precommit: state-native block10-start mirror predicts block11 key node

**Sealed before inspecting the published block11 geometry/walkthrough.**

Fixed p28 DH23 state:

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)
```

Block10 ciphertext starts at `(19,17) = (B,p-a)`. Exactly two original mirror triples contain that cell:

```text
1. A-EA-A, horizontal radius4
   (19,9) (19,13) (19,17)
   [24,28,24] = [-g,-1,-g]

2. AE-A-AE, diagonal radius6
   (13,11) (19,17) (25,23)
   [25,24,25] = [-q,-g,-q]
```

Freeze the second object because every rune value, its radius, its center, and both endpoint coordinates are supplied by the already fixed DH state:

```text
values  = [-q,-g,-q]
radius  = a
center  = (B,p-a)
endpoints:
  (b-K,B-A)
  (-q,p)
```

The horizontal rival is explicitly retained as the alternative before inspection.

## Withheld prediction

> **Block11 uses `AE-A-AE` at `(13,11),(19,17),(25,23)` as its key-source node.**

No plaintext, transform, key rotation, ciphertext path, direction, or length is predicted.

## Gate

Exact node identity is required. If block11 uses the frozen horizontal rival or any other node, this prediction fails; no post-inspection state-expression rescue is allowed.

## Outcome after opening block11

**FAIL.** Block11 uses `J-B-J` at `(19,16),(23,12),(27,8)`, not the frozen `AE-A-AE` node. The explicitly frozen horizontal rival is also not the key source.

The actual source node is nevertheless exactly DH-state typed:

```text
values:
  [11,17,11] = [B-A,p-a,B-A]
radius:
  q=4
center:
  (23,12) = (p,phi(b-K))
endpoints:
  (19,16) = (B,K-b) = exact block10 endpoint
  (27,8)  = (-K,A)
```

The candidate plaintext and path were not used to derive these identities. The tested block11 node-selection rule is retired.

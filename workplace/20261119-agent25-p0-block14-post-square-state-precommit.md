# Agent25 precommit: post-three-square-state block14 key-node holdout

**Sealed after the independent three-square DH-state extractor was published and before inspecting the published block14 geometry/walkthrough.**

The authenticated 2014 magic squares now independently recover the DH23 tuple:

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)
```

through square order/center/sum BASE29 metadata (`im-results/lp2-three-square-dh-state-extractor.md`). This gate therefore treats the state as independently source-derived, rather than relying on the p28 route.

Block13 ciphertext starts at original coordinate `(26,3)=(-e,e)`. Exactly two mirror triples contain that cell. One is the already consumed horizontal `C-OE-C` connector. The other is an unused vertical radius-one mirror:

```text
C - N - C
(24,3) (25,3) (26,3)
[5,9,5] = [g,A+(q-e),g]
radius = q-e = e-K = 1
coordinates:
  (-g,e), (-q,e), (-e,e)
```

## Withheld prediction

> **Block14 uses `C-N-C` at `(24,3),(25,3),(26,3)` as its key-source node.**

No plaintext, center transform, key rotation, ciphertext start, axis, direction, or stop is predicted.

## Gate

Exact node identity and coordinates are required. Any other source node rejects this hypothesis. The already-used `C-OE-C` connector is excluded before inspection, and no other connected-node rescue is allowed.

## Outcome after opening block14

**FAIL.** Block14 uses `EA-J-EA` at `(25,2),(25,6),(25,10)`, not the sealed `C-N-C` node.

The actual node is densely state-typed after inspection:

```text
values:
  [28,11,28] = [-1,B-A,-1]
radius:
  q=4
coordinates:
  (-q,K), (-q,a), (-q,-B)
```

This retrospective compression does not rescue the failed prospective gate. The result shows that even with the DH tuple independently recovered from authenticated square metadata, the current connected-mirror heuristic does not specify the next 27x27 key node. Do not extend this heuristic to block15 without a new independent selector.

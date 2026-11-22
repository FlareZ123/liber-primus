# Agent25 precommit: block5 state lock predicts block6 ciphertext start

**Sealed before inspecting the published block6 geometry/walkthrough.**

The independently recovered p28 DH23 state is:

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)
```

The already published p0 block4 COLD geometry ends at ciphertext coordinate:

```text
(B-A, g+K) = (11,7)
```

and its key center is:

```text
(-e,B) = (26,19).
```

The published block5 I MAY geometry, inspected before this precommit, is completely state-typed:

```text
next key center = (b,A) = (15,8)
movement from prior ciphertext endpoint:
  (11,7) + (q,e-K) = (15,8)

raw node values:
  [p-K,p-a,p-K] = [21,17,21] = NG-B-NG
node radius:
  K = 2

block5 ciphertext start:
  previous block4 key center = (-e,B) = (26,19)

block5 ciphertext end:
  (-e,K-b) = (26,16)
block5 path length:
  q = 4
```

This reveals a concrete cross-block handoff in block4->block5: **the next ciphertext begins at the previous key center**.

## Withheld prediction

Without inspecting block6's published node/path coordinates, freeze one exact prediction:

> **Block6 ciphertext start = block5 key center = (b,A) = (15,8).**

No plaintext spelling, dictionary score, node identity, path direction, or block length is used in this prediction.

## Gate

If the published original-cell block6 path starts at (15,8), retain this as a one-step reusable handoff candidate. If it starts elsewhere, reject immediate key-center -> next-ciphertext-start reuse and do not tune coordinate transforms to rescue it.


## Outcome after opening block6

**FAIL.** The published block6 ciphertext starts at `(19,16)`, not the predicted `(15,8)`. Retire immediate key-center -> next-ciphertext-start reuse.

The failed holdout nevertheless reveals a separate state lock that was not used in the prediction:

```text
block6 raw node E-X-E:
  [18,14,18] = [A-B,-b,A-B]

node center:
  (25,16) = (-q,K-b)
radius:
  1 = e-K

center transform:
  phi(-b)=phi(14)=6=a

ciphertext start:
  (19,16) = (B,K-b)

ciphertext end:
  (17,16) = (p-a,K-b)

path length:
  e=3
```

Thus the route remains strongly state-compatible locally, while the tested reusable transition law is false.

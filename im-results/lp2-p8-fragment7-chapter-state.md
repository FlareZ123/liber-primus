# P8 page-local 7x7 fragment-length state square and seven-page base29 packet

**Agent20, 28 November 2026. Classification: new state serialization on two already-known source geometries. No unknown plaintext or body cipher.**

## What is new

Two p8 facts were already established before this report:

1. physical p8 has **49 page-local black fragments** after its red heading, but the 49th is only the one-rune tail of a six-rune word that continues onto p9; and
2. the botanical chapter p8–p14 has **1,729 runes**.

This result does not claim either count as new. It connects both source geometries to the independently reconstructed DH23 state using the canonical outside-in H transform.

The p15→p7→chapter route independently addresses p8, and the adjacent [p8 red-H state circuit](lp2-p8-red-h-state-circuit.md) reconstructs

```text
(p,g,a,b,A,B,K,e,q,F)
= (23,5,6,15,8,19,2,3,4,0).
```

The p8 red packet also exposes `g+K=7`. That value is enough to motivate the physically available 49-fragment p8 body as a 7×7 source object.

## The 49 page-local fragment lengths form a 7×7 state square

The exact page-local black-fragment lengths, in printed order, are

```text
3  2  3  9  4  3  4
2  2  6  3  7  3  4
3  8  4  3  4  5  5
2  3  4  4  7  5 10
6 12  4  5  3  2  6
10 4  9  6  5  6  8
8  3  2  9  6  6  1
```

The raw row sums are

```text
[28,27,32,35,38,48,35]
```

and modulo29 they are

```text
[28,27,3,6,9,19,6]
= [-1,-K,e,a,q+g,B,a].
```

The column sums reduce to

```text
[5,5,3,10,7,1,9]
= [g,g,e,Kg,g+K,1,q+g].
```

Apply the **same canonical H7 transform** already used elsewhere in this route:

```text
H7(row sums)
= [22,8,23,6,12,17,5]
= [p-1,A,p,a,aK,b+K,g]

H7(column sums)
= [25,4,25,10,10,6,14]
= [-q,q,-q,Kg,Kg,a,-b].
```

The 7×7 fragment-length matrix is invertible over GF29 with determinant

```text
18 = p-g.
```

The determinant is supporting structure; no cipher claim depends on interpreting it.

### Finite manuscript control

Keep the rule fixed: take every same-page window of **49 consecutive page-local fragments**, reshape its literal fragment lengths row-major to 7×7, reduce row and column sums modulo29, and apply canonical H7.

Across p0–p55 (excluding the nonrunic p50 representation) there are **479** such windows. Exactly **one** matches both p15-state-predicted H7 vectors above:

```text
physical p8, first black fragment at local rune12.
```

That same unique window has determinant18.

This is a finite post-discovery discriminator. The row/column target grammar was recognized after examining p8, so the 1/479 specificity is not a discovery-wide authorship probability.

## Seven physical page lengths are a base29 state packet

The source-visible chapter p8–p14 has exact rune counts

```text
[255,268,263,273,261,272,137].
```

Writing each count in base29 as quotient and remainder gives

```text
quotients:
[8,9,9,9,9,9,4]
= [A,q+g,q+g,q+g,q+g,q+g,q]

remainders:
[23,7,2,12,0,11,21]
= [p,g+K,K,aK,F,A^-1,-A].
```

Canonical H7 gives a second pair of state rows:

```text
H7(quotients)
= [4,0,0,9,18,18,12]
= [q,F,F,q+g,p-g,p-g,aK]

H7(remainders)
= [2,25,2,12,2,18,15]
= [K,-q,K,aK,K,p-g,b].
```

Across **all 50 contiguous seven-page intervals** p0–p55, p8–p14 is the sole interval with either the exact quotient/remainder packet or the exact pair of H7 images.

Its already-known total now has a state-native factorization:

```text
1729
= 7 * 13 * 19
= (g+K)(b-K)B.
```

The integer 1,729 and factorization 7×13×19 were already documented in the repository's taxicab/Onion7 work. The new evidence is that all three factors are fields of the independently reconstructed local DH state, while the individual page counts serialize further state in base29.

## Cipher decision

A 7×7 matrix plus a 1,729-rune, seven-page receiver superficially invites Hill-7. That route is **already exhausted more strongly** by the existing [seven-row all-secret gate](lp2-p8-14-sevenrow-allsecret-gate.md): Gate E enumerates all 616,067,011 projective inverse-row directions for both natural seven-channel layouts and rules out every fixed invertible affine Hill7 matrix against the pinned native-English register. There is no value in retesting this newly observed length matrix as another direct Hill key.

The right interpretation of this result is therefore **state/layout serialization**. It supplies a highly structured, source-visible state object and a stronger intended-path clue, while the operation that consumes it remains unknown.

## Next decision

The next useful test must explain why the author would serialize the same DH state simultaneously in:

- the p8 red H packet;
- the adjacent p8 first-black `(length,sum,product)=[e,p,K]` transition;
- the 7×7 page-local fragment-length square; and
- the p8–p14 base29 page-length packet.

A successor should use one of these source-visible structures to predict an untouched receiver, key coordinate, or representation **before** scoring language. Reopening arbitrary Hill7, taxicab, magic-square, or 13×133 transforms would retread stronger existing negatives.

## Reproduction

```text
node sims/lp2_p8_fragment7_chapter_state_sft.cjs
```

The SFT reconstructs the state from original p15 material, rebuilds the p8 page-local fragment matrix, performs the 479-window census, verifies the seven-page base29 packet and scans all 50 seven-page intervals.

# P8 fragment-length matrix encodes the DH state algebraically

**Agent20, 28 November 2026. Classification: new original-artifact state/layout closure, with two bounded direct-consumer negatives. No unknown plaintext or body key.**

## Decision

The already-known p8 geometry—**49 page-local black fragments** after the red heading—and the already-known p8–p14 chapter length of **1,729 runes** are not merely attractive 7-based counts. When read through the independently reconstructed DH23 state

```text
(p,g,a,b,A,B,K,e,q,F)
= (23,5,6,15,8,19,2,3,4,0),
```

they form a coupled algebraic state packet.

The strongest new result is the characteristic polynomial of the literal **7×7 p8 black-fragment length matrix**. It is exactly predicted by the state and factors entirely into state-derived coefficients:

```text
χ_M(x)
= x^7 + 6x^6 + 11x^5 + 10x^4 + 14x^3 + 10x^2 + 21x + 11

= x^7 + a x^6 + A^-1 x^5 + Kg x^4 - b x^3
    + Kg x^2 - A x + A^-1

= (x+g)
  (x^3 + g x^2 - q x + a)
  (x^3 - q x^2 + x + A^-1)            (mod 29).
```

Consequently

```text
trace(M) = -a = 23 = p
det(M)   = -A^-1 = 18 = p-g.
```

The matrix has exact multiplicative order

```text
ord(M) = 29^3 - 1 = 24,388
```

in `GL(7,29)`: direct exponentiation gives `M^24388=I`, while division of the exponent by each prime factor `2,7,13,67` breaks identity.

This is substantially stronger than assigning familiar names to isolated residues. The complete degree-seven polynomial, its compact factorization, trace, determinant, and order all belong to one exact source matrix.

## Source matrix

P8's two red heading words reconstruct the DH state under the canonical outside-in H transform in the companion [p8 red-state circuit](lp2-p8-red-h-state-circuit.md). In particular they expose `g+K=7`.

The 49 page-local black fragments then give this literal row-major length matrix:

```text
3  2  3  9  4  3  4
2  2  6  3  7  3  4
3  8  4  3  4  5  5
2  3  4  4  7  5 10
6 12  4  5  3  2  6
10 4  9  6  5  6  8
8  3  2  9  6  6  1
```

These are **page-local fragments**, not 49 complete words: the last one-rune p8 fragment is the beginning of a six-rune printed word that continues onto p9. The matrix preserves the physically visible p8 page-local segmentation established by the earlier seam audit.

### Row/column state checks

The raw row sums are

```text
[28,27,32,35,38,48,35]
```

and modulo29

```text
[28,27,3,6,9,19,6]
= [-1,-K,e,a,q+g,B,a].
```

The column sums reduce to

```text
[5,5,3,10,7,1,9]
= [g,g,e,Kg,g+K,1,q+g].
```

Canonical H7 then gives

```text
H7(rows)
= [22,8,23,6,12,17,5]
= [p-1,A,p,a,aK,b+K,g]

H7(columns)
= [25,4,25,10,10,6,14]
= [-q,q,-q,Kg,Kg,a,-b].
```

These checks are supporting evidence. The characteristic polynomial is the more discriminating algebraic closure.

## Manuscript-wide finite charge

Freeze the source rule: on every same-page window of 49 consecutive page-local fragments, reshape literal fragment lengths row-major to 7×7 and compute its characteristic polynomial over GF29.

There are **479** such windows on p0–p55, excluding the rune-free p50 representation. Exactly **one** has

```text
χ(x)
= (x+g)
  (x^3 + g x^2 - q x + a)
  (x^3 - q x^2 + x + A^-1):
```

**p8, beginning at black local rune offset12.**

The same p8 window is also the sole window matching both state-predicted H7 row- and column-sum vectors.

This is a finite post-discovery discriminator, not a discovery-wide probability. The factorization was recognized after the p8 matrix was inspected, so it must not be reported as a blind 1/479 authorship probability.

## Seven physical page lengths serialize the same state in base29

The source-visible p8–p14 page rune counts are

```text
[255,268,263,273,261,272,137].
```

Writing each length as `29·quotient + remainder` gives

```text
quotients:
[8,9,9,9,9,9,4]
= [A,q+g,q+g,q+g,q+g,q+g,q]

remainders:
[23,7,2,12,0,11,21]
= [p,g+K,K,aK,F,A^-1,-A].
```

Canonical H7 gives

```text
H7(quotients)
= [4,0,0,9,18,18,12]
= [q,F,F,q+g,p-g,p-g,aK]

H7(remainders)
= [2,25,2,12,2,18,15]
= [K,-q,K,aK,K,p-g,b].
```

Across all **50** contiguous seven-page intervals p0–p55, p8–p14 is uniquely selected by the complete quotient/remainder packet, by the complete pair of H7 images, and by the total **1,729**.

The known chapter total also has the state-native factorization

```text
1729
= 7 * 13 * 19
= (g+K)(b-K)B.
```

The integer 1,729 and the factorization 7×13×19 were already documented in the older taxicab/Onion7 branch. The new evidence is the coupling to the independently reconstructed local state and the individual base29 page-length packet.

## Direct cipher consumers: two bounded negatives

The matrix structure suggests an immediate stateful cipher that the earlier fixed-Hill7 exclusions do **not** cover: use successive powers of `M` on the chapter's **247 consecutive seven-rune blocks**.

Freeze the eight conventional variants only:

- column-vector or row-vector/transposed convention;
- `M^t` or `M^-t`;
- clock origin `t=0` or `t=1`.

Every model is exactly reversible. All eight original outputs remain ciphertext-like:

```text
native-GP score range:  -1.64223 .. -1.48481
IoC range:               0.03436 .. 0.03456
raw chapter score:      -1.57409
solved-native minimum:  +0.70997
```

No variant recovers coherent GP-native prose.

A second literal consumer treats each page length itself as a per-page affine key. If

```text
length = 29a+b,
```

decode that page as

```text
P = a^-1(C-b) mod29.
```

For p8–p14 this deterministic inverse scores **−1.57381** with IoC **0.03463**, again far below the same solved-native register. Its exact forward map recovers every ciphertext rune.

These negatives retire the two most direct uses of the new state serialization. They do not invalidate the structural packet.

The repository's stronger [seven-row all-secret gate](lp2-p8-14-sevenrow-allsecret-gate.md) already excludes every **fixed** invertible affine Hill7 matrix in the two natural seven-channel layouts, so no additional fixed-matrix Hill search is warranted.

## Research implication

P8 now contains four mutually adjacent/contained representations of the same state:

1. the red H packet reconstructs the DH23 state;
2. the immediately following first black word has `(length,sum,product)=[e,p,K]` and `H3=[A^-1,q+g,-b]`;
3. the 49 black page-local fragment lengths form a 7×7 matrix whose **entire characteristic polynomial factors in DH-state coefficients**;
4. the seven physical page lengths p8–p14 serialize the state in base29.

This materially changes the route ranking. The evidence points to deliberate **state/layout metadata** rather than a direct mono-layer Hill cipher.

The next decisive question is not which extra matrix phase improves language. It is what source-visible operation uses this state packet to select an **untouched receiver or external object**. A successor should predict that recipient or a key coordinate before inspecting its ciphertext outcome.

## Reproduction

Run:

```text
node sims/lp2_p8_fragment7_chapter_state_sft.cjs
```

The SFT reconstructs the state from original p15 material, rebuilds the p8 fragment-length matrix, proves the characteristic polynomial/factorization/order, scans all 479 49-fragment windows, verifies the seven-page base29 packet over all 50 intervals, and executes/reverses both direct consumer families.

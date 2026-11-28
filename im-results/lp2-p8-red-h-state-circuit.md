# P8 red heading closes the p15→p7→chapter state circuit

**Agent20, 28 November 2026. Classification: new original-artifact state/navigation closure on an independently selected chapter, plus a manuscript-wide finite discriminator. No unknown LP2 plaintext, authenticated body key, or complete inverse is recovered.**

## Decision

The existing p15→p7 cross-holdout does more than select a 27-rune operand. P15 reconstructs the DH23 state, predicts the older p7 printed-order circulant inverse row

```text
[p,K,g,K,B] = [23,2,5,2,19],
```

and those five values address chapter first-black **SUM** labels, selecting

```text
p8, p27, p33, p27, p54.
```

The first addressed chapter, **p8**, contains a previously undocumented source-side state packet. Its two red heading words have printed lengths `[4,8]=[q,A]`. Applying the repository's already-established outside-in H transform gives

```text
H4([14,10,14,19])
 = [24,25,24,4]
 = [-g,-q,-g,q]

H8([1,14,19,5,2,13,3,17])
 = [13,11,6,3,7,3,17,18]
 = [b-K,A^-1,a,e,g+K,e,K+b,p-g].
```

Those ordered fields reconstruct the complete ordinary DH state

```text
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4)
```

without reading a plaintext target. The immediately following black word then supplies a second source-local closure:

```text
[27,9,16]
(length, sum, product) = [3,23,2] = [e,p,K]
H3 = [11,9,14] = [A^-1,q+g,-b].
```

This exact three-rune word is manuscript-unique under both complete predicates.

The strongest interpretation is therefore **state/navigation**, not decryption: the p7 ring addresses p8 by its chapter IN value `p=23`; p8's red heading reconstructs the state that predicted the p7 ring; and p8's adjacent black word literally implements the chapter edge `p -> K` under the already published SUM→PRODUCT rule.

## P8 reconstructs the state without importing the historical tuple

The H packet can be read as an executable algebraic system rather than as coordinate-by-coordinate state naming.

Let

```text
h4 = H4(first red word)
h8 = H8(second red word).
```

Require only the observed internal symmetries

```text
h4[0] = h4[2]
h4[1] = -h4[3]
h8[3] = h8[5].
```

Then derive

```text
g = -h4[0]
q =  h4[3]
e =  h8[3]
a =  h8[2]

K = (h8[6] - h8[0]) / 2 mod29
b = (h8[6] + h8[0]) / 2 mod29
p = h8[7] + g.
```

For p8 this gives

```text
g=5, q=4, e=3, a=6,
K=2, b=15, p=23.
```

Now demand the ordinary DH closure and the one remaining visible H relation:

```text
A = g^a mod p = 8
B = g^b mod p = 19

A^-1 mod29 = h8[1] = 11
h8[4] = g+K = 7

A^b mod p = 2 = K
B^a mod p = 2 = K
b*e mod(p-1) = 1.
```

All conditions hold exactly. This construction is deterministic once the H packet grammar is stated; it does not search state labels, keys, plaintext words, or language scores.

### Manuscript-wide finite discriminator

Scan source-aware complete printed words across the runic p0–p49 and p51–p55 tapes, treating a physical page break as *not* a word separator. There are **2,895** adjacent complete-word pairs. Exactly **27** have lengths `[4,8]`.

Apply the exact H-symmetry → DH-closure procedure above to all 29. There is **one** hit:

```text
p8 start0.
```

Independently, the ink annotation corpus has seven red spans that consist of exactly two printed words. Only **one** has arity `[4,8]`: again p8 start0, and it is the sole red-span DH closure.

This is a finite post-discovery specificity result, not a discovery-wide probability. The p8 packet grammar was recognized after p8 had already been selected by the p7/chapter route. Its value is that the complete ordered algebra is selective across the original manuscript and closes an independently reconstructed state.

## Immediate black continuation: a unique `[e,p,K]` word

The red span ends at rune offset12. The first complete black word is

```text
offset12  [27,9,16].
```

Before interpreting its values as text, its three elementary source statistics are

```text
length  = 3  = e
sum     = 23 = p
product = 2  = K.
```

The same canonical H transform gives

```text
H3([27,9,16])
= [11,9,14]
= [A^-1,q+g,-b].
```

Across all **720** source-aware complete three-rune words on p0–p55, this p8 word is the sole word with descriptor `(3,23,2)`, and independently the sole word with H3 `[11,9,14]`.

This continuation is especially important because the chapter navigation graph already defines each opener's first black word as

```text
IN  = GP0 sum
OUT = GP0 product.
```

P8 is addressed by `IN=p=23`, and its adjacent word emits `OUT=K=2`. Thus the local p8 object does not merely share state numbers: its red state header directly borders the exact `p -> K` graph transition.

## P8 predicts the older p7 red-product register

The p8-derived state independently predicts the complete five-value p7 product row:

```text
[A^-1, B^-1, A, K^-1, K]
=
[11,26,8,15,2].
```

Those are exactly the five original p7 red-word products in printed order.

The resulting original-artifact circuit is therefore

```text
p15 lower red + grid
  -> DH23 state
  -> predicts p7 inverse row [p,K,g,K,B]

p7 inverse row
  -> chapter IN addresses
  -> first address is p8

p8 red H packet
  -> independently reconstructs the same DH23 state
  -> predicts the complete p7 red-product row

p8 first black word
  -> (sum,product) = (p,K)
  -> supplies the first chapter navigation transition.
```

No external 2013/2016 DH tuple is required for this loop, although those authenticated sources independently corroborate the same state elsewhere in the repository.

## Held-out chapter OUT field gives a second p7-style state packet

The p7 inverse row chooses the five itinerary chapters **only from their IN/sum labels**:

```text
[p,K,g,K,B]
-> [p8,p27,p33,p27,p54].
```

Their unused OUT/product labels are therefore

```text
[K,B,e,B,-K]
=
[2,19,3,19,27].
```

Applying the same canonical outside-in transform gives

```text
H5([2,19,3,19,27])
=
[q,F,e,q+g,F]
=
[4,0,3,9,0].
```

Now form the same printed-order right-circulant used at p7. Its determinant is

```text
26 = B^-1 mod29,
```

and its inverse first row is

```text
[b-K,F,-b,B,F]
=
[13,0,14,19,0].
```

All ten natural cyclic/reversal presentations of the p7 ring still address legal chapter IN labels. Only the **original printed p7 orientation** yields both exact held-out OUT packets above.

A fixed-marginal charge keeps all nine observed chapter IN labels and the complete multiset of nine observed OUT products, then permutes OUT assignments over the nine chapter labels. The exact five-value OUT row occurs in **240 / 362,880 = 1 / 1,512** labeled permutations. This is a conditional diagnostic after the chapter system and target state were known, not an authorship probability.

## Source geometry on p8

The same state also appears in coarse p8 geometry:

```text
red heading length = 12 = a*K
black body length  = 243 ≡ 11 = A^-1 (mod29)
whole page length  = 255 ≡ 23 = p (mod29).
```

The five addressed chapter words concatenate to the already published 27-rune operand. Its source-native aggregate descriptor is

```text
(length,sum,product)
=
(27,22,18)
=
(-K,p-1,p-g) mod29.
```

These are supporting structural closures, not cipher instructions.

## Independent original-JPEG component-run reconstruction and Q bridge (Agent 2, 28 November 2026)

The manuscript's visible decorated/plain page partition independently reconstructs the same p8 state relative to rune algebra. Original May-2014 JPEG component mode preserves this partition exactly: every decorated red/illustrated page is RGB and every undecorated black-only page is one-component. Exactly **23** JPEGs are grayscale, in **five** maximal source-order runs `[6,2,4,8,3]`. Thus `p=23`, `g=5`; assigning the run vector in physical order to `[a,K,q,A,e]` reconstructs full ordinary DH and is the **only** one of all 120 role permutations that does so. Its `[q,A]=[4,8]` is this page's uniquely selective red-word-length receiver, while terminal `e=3` is the length coordinate of p8's unique adjacent `[e,p,K]=[3,23,2]` black word.

The carrier also links p8's state to the independently derived p3 quotient: H has a 28-step orbit on the vector, and the same `g=5` selects `H^5([6,2,4,8,3])=[17,24,4,18,22]=[b+K,-g,q,p-g,p-1]`. The leading `[17,24]` is exactly `E(Q)`, uniquely on the orbit; p3's field equation is simultaneously `u^2=e*u+A`. This places p8's packet inside a longer source route ending at Q's fixed THE MAP / AND PATH matrix.

The export/page-design rival remains substantial: every annotated red-span page is RGB and the whole set shares a common Artifex pipeline. The carrier supplies an independent **state/route cross-lock**, not proof of intentional JPEG metadata or p8 plaintext.

[Original-byte carrier route](lp2-2014-original-distribution-carrier-gate.md) · [p3/Q route](lp2-p3-red-field-route-p15-p57-quotient.md).

## Evidence boundary and next decision

This result materially strengthens the p15→p7→chapter route because an independently selected recipient, p8, contains a complete ordered H/DH state packet and an adjacent black word that realizes the route's own `p -> K` transition. The broad manuscript census shows that the full p8 H→DH grammar is not a generic consequence of every `[4,8]` word pair.

It still does **not** identify how the 243 black runes of p8 are encrypted. The packet grammar was recognized after p8 selection, canonical H is imported from an already established repository operation rather than explicitly named by the p8 artwork, and state-expression saturation makes isolated coordinate labels weak evidence. The evidentiary weight comes from the complete coupled equations, manuscript-wide selectivity, adjacency, and closure back onto the independently older p7 register.

Do not rescue the previously failed p8 direct consumers by adding phase/sign/reset freedom. The useful next gate is a **source-visible operation on the p8 state/header or the 27-rune itinerary operand that predicts an untouched ciphertext transform before language grading**.

## Reproduction

Run:

```text
node sims/lp2_p8_red_h_state_circuit_sft.cjs
```

The SFT reconstructs the p15 state, p7 ring, chapter records, held-out OUT row, p8 H packet, complete manuscript-wide `[4,8]` pair census, unique three-rune continuation, p8→p7 closure, and the 9! fixed-marginal chapter OUT charge from repository source files.

# P3/Q numbers-as-direction cross-lock: p15 output selects the p23 and p8 DH-state registers

**Agent14, 28 November 2026. Classification: source-licensed structural/navigation cross-lock plus a preregistered direct-consumer negative; no unknown LP2 plaintext, body key or complete cipher.**

## Decision

The existing p3 polynomial route fixes one operation before this result:

```text
p3 marked triad -> u²=3u+8
p15-second - solved-p57 -> quotient Q
E(Q) = [17,24]
E(Q) * E(p15 first-red9) = [23,8]
```

That output already has two independently meaningful readings:

- canonical GP transliteration: **D H**;
- authenticated 2016 zero-based words: **ROAD / DEVOTED**.

The authenticated 2016 message also gives an explicit use for the **numbers** themselves: “Its words are the map, their meaning is the road, and their numbers are the direction.” Taking the already-frozen coordinates literally as zero-based physical LP2 page numbers gives:

```text
[23,8] -> physical p23 and p8.
```

Those two receivers were not manufactured for this route. Both already carry independently documented, manuscript-selective DH-state registers:

- **p23** is one of exactly two complete four-word red spans. Whole-word GP29 products `[24,13,18,13]` under the already-fixed adjacent H grammar give **`[11,8,5,2]=[A^-1,A,g,K]`**. Its immediately adjacent black word is independently fixed at start16.
- **p8** is the unique red two-word `[4,8]` packet satisfying the published H→DH closure. Its H rows reconstruct `p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3,q=4`, and its immediately adjacent black word has `(length,sum,product)=[3,23,2]=[e,p,K]`.

Thus the frozen p15 Q output now does more than equal `[p,A]` or spell `DH`: under a first-party signed “numbers are the direction” instruction, it points directly to **two independently established manuscript pages that each encode the same DH state**.

This is a navigation/state cross-lock. It still does not tell us how either black body is encrypted.

## Exact source reconstruction

The reproducer reads only canonical repository sources and recomputes the following.

### P15 direction packet

```text
Q = [5,5,14,9,10,4,27,17,25]
E(Q) = [17,24]

E(p15 first red9) = [24,6]
E(Q)E(p15 first red9) = [23,8]
canonical GP = DH
```

The signed-2016 source is read directly and the exact sentence containing “their numbers are the direction” is asserted before the page interpretation is accepted.

### Directed receiver p23

The sole p23 red span is offsets0–16. Its four complete printed words have:

```text
lengths  = [2,6,3,5]
products = [24,13,18,13]

adjacent-H(products)
         = [11,8,5,2]
         = [A^-1,A,g,K].
```

This is the already-published p6/p23 four-word source class, where p23 is a manuscript-wide singleton for this exact H vector.

### Directed receiver p8

The sole p8 red span is offsets0–12 with two complete words of lengths `[4,8]`. The frozen outside-in H transform gives:

```text
H4 = [24,25,24,4]
H8 = [13,11,6,3,7,3,17,18].
```

The published deterministic H symmetry/ordinary-DH closure reconstructs the full DH23 state. The first complete black word immediately after the red header is `[27,9,16]`, whose direct descriptor is:

```text
(length,sum,product) = [3,23,2] = [e,p,K].
```

The p8 report's manuscript-wide control leaves p8 start0 as the sole `[4,8]` complete-word pair closing the full DH grammar and the first black word as the sole three-rune word with `(sum,product)=(23,2)`.

## Generic red-page targeting is not the evidence

A weaker observation would be “both coordinates happen to name pages containing red ink.” That is not selective enough to carry the claim. In a fixed-field charge over all 840 nonzero scalar multipliers, using all 18 complete red-span outputs and counting coordinates that land on the eight red-bearing pages below29, the actual Q map has 13 such coordinate hits; **276 / 840** multipliers do at least as well.

Therefore this report does **not** treat red-page membership as evidence. The useful discriminator is that the two directed pages were independently established as unusually complete **DH-state receivers** before this navigation interpretation.

## Preregistered direct successor-word gate: negative

Before reading the next two outputs, the direct continuation was frozen in
[`workplace/agent14-p3-q-direction-successor-prereg.md`](../workplace/agent14-p3-q-direction-successor-prereg.md).

The receiver selection was fixed by the new direction link. The operand on each receiver was fixed independently by existing work: the first complete black word immediately adjacent to its red heading. The unchanged operation was exactly one Q multiplication after p3-field evaluation. No reversal, phase, sign, scalar, alternate modulus or coordinate swap was allowed.

The fixed positive family was:

1. ordered adjacent pairs of the ordinary DH chain `[p,g,A,B,K]=[23,5,8,19,2]`;
2. the signed-example pair `[p,A]=[23,8]`;
3. canonical GP transliteration equal to a complete signed-2013 TCP request token.

Results:

```text
p23 black successor start16
  values       = [28,6,15,25,13,7,19,28]
  E(word)      = [13,4]
  Q product    = [3,1]
  GP readout   = OU
  fixed-family = no hit

p8 black successor start12
  values       = [27,9,16]
  E(word)      = [10,28]
  Q product    = [7,6]
  GP readout   = WG
  fixed-family = no hit
```

This is a clean negative. Do not tune alternate word choices, phase, sign, orientation or modulus to rescue the direct continuation.

## Scientific boundary

What is established by exact computation:

1. the frozen p15 Q result is `[23,8]`;
2. canonical GP makes that output `DH`;
3. the authenticated 2016 source explicitly says its numbers are the direction;
4. literal physical p23 and p8 each independently contain manuscript-selective DH-state packets;
5. the obvious preregistered direct-Q use of their adjacent black successors fails its fixed typed family.

What is **not** established:

- that the author intended zero-based physical page numbering for every Q output;
- that Q is a body cipher or key;
- that p23/p8 black text should be consumed by Q after the state headers;
- any unknown plaintext.

The causal gain is a source-licensed receiver interpretation for the previously unexplained numeric output `[23,8]`: it lands on two pre-existing DH-state pages and therefore links the p3/Q route to independent manuscript state structure. The immediate body-adjacent extension is closed, so the next useful test must obtain a new receiver/operation from original geometry or authenticated instructions rather than adding presentation freedom.

Reproducer: [`sims/lp2_p3_q_direction_p23_p8_sft.cjs`](../sims/lp2_p3_q_direction_p23_p8_sft.cjs).

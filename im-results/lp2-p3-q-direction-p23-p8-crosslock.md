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

## Independent p29 DIRECTION route fixes the same ROAD23 / DEVOTED8 pair

This receiver interpretation is not merely semantic naming after the Q output. A separate, already-published p28→p29 DIRECTION route fixes a zero-origin signed register locally and gives:

```text
p29 word29 H2 -> [22,23] -> THE ROAD
ROAD23 -> physical p23

p29 word30 H4 -> [22,15,8,0]
                 [p-1,b,A,F]
```

That packet independently reconstructs `p=23`, `e=3`, `K=2`, and explicitly records the signed-source identities:

```text
ROAD    = index23 = p
DEVOTED = index8  = A
```

Therefore the p15 Q output is exactly the same ordered pair in all three fixed namespaces:

```text
numeric state:       [23,8] = [p,A]
signed-2016 words:   [23,8] = [ROAD,DEVOTED]
canonical GP:        [23,8] = DH
```

The first half, **ROAD23 -> p23**, already existed as an independent p29 navigation handoff. The signed “numbers are the direction” rule applied to the complete Q pair supplies the parallel second handoff **DEVOTED8 -> p8**. P8 then independently reconstructs `p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3,q=4`, so the newly directed recipient closes back onto the same state that names DEVOTED8 as `A`.

This is the strongest causal reading of the Q output currently available: a manuscript-derived pair reproduces the already-established p29 `ROAD23 / DEVOTED8 = p/A` register, repeats its ROAD23 physical handoff, and extends the same source rule to a second physical receiver whose state packet is independently complete. It does **not** establish that all signed-word indices globally map to same-numbered pages; the p29 route itself only fixes zero origin locally.

[Independent p29 DIRECTION packet](lp2-p29-direction-selfindex-packet.md) · [origin-selected p28→p29 route](lp2-p28-origin-selected-p29-p40-route.md).

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

## Original-art path independently reconstructs the second direction

The first directed receiver also exposes a simple image-only route to the second. Original p23 has **five isolated dots**, so the signed numbers-as-direction grammar sends p23→p5. Original p5 has a bilaterally mirrored ornament with **four spiral curls on each side, eight total**, so the same grammar sends p5→p8.

```text
Q predicts [23,8]
p23 --5 dots--> p5 --8 curls--> p8
```

This is important because the endpoint8 was already frozen by Q. The visual walk therefore reconstructs the second Q coordinate from the first receiver rather than choosing an endpoint after the count. Under the DH opcode it yields `p=23,g=5,A=8`, and `5^a mod23=8` has the unique ordinary-range solution **a=6**. That is a new source-visible route to a6 independent of p15's disputed lower-red descriptor-role assignment.

The five-dot motif is reused elsewhere in LP2 and p5's curl count was recognized after the state was known, so no discovery probability is claimed. The route depends on p23 already being selected by Q/ROAD23. No p8 tree count is promoted; the obvious continuation to b15 is not currently source-selected.

[Original-art p23→p5→p8 audit](lp2-p23-p5-p8-visual-dh-navigation.md).

## P23 completes the state; p8 independently reproduces it

The directed receivers support an executable state reconstruction, not only coordinate labels.

Start only from the frozen Q output:

```text
[p,A] = [23,8].
```

Apply the already-used H pair grammar:

```text
[b,K] = [p-A,p+A] mod29 = [15,2].
```

The independent p29 DIRECTION packet requires the private exponent to be invertible modulo `p-1`, giving:

```text
e = b^-1 mod(p-1) = 15^-1 mod22 = 3.
```

Now follow the first directed page. P23's independently established four-word red register is:

```text
[A^-1,A,g,K] = [11,8,5,2].
```

The Q-derived `A=8,K=2` type two slots and leave `g=5` directly. With no remaining fitted state coordinate:

```text
5^a mod23 = 8   -> unique a=6 in 1..21
B = 5^15 mod23  -> 19
19^6 mod23      -> 2 = K.
```

So **Q + directed p23 reconstructs the complete ordinary state**:

```text
(p,g,a,b,A,B,K,e)
= (23,5,6,15,8,19,2,3).
```

The second directed receiver p8 then acts as a manuscript-side cross-check rather than a necessary source for missing fields. Its already-published red rows are exactly:

```text
H4 = [-g,-q,-g,q]
H8 = [b-K,A^-1,a,e,g+K,e,K+b,p-g]
```

with `q=4`, and its adjacent black word descriptor is `[e,p,K]`. Thus DEVOTED8→p8 independently reproduces every state field recovered through ROAD23→p23.

The chronology remains important: this complete circuit was assembled after the component p23 and p8 registers had been published. Treat it as an exact cross-route state reconstruction and consistency lock, not a prospectively calibrated discovery probability. It materially removes label freedom from the directed pages and supplies a complete state packet, but still does not specify a black-body cipher.

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

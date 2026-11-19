# P23 carries two distinct hidden instructions: THE ORIGINAL and THE ONE RISE

**Agent42, 19 November 2026. Director #1797 reconciliation. Classification: both constructions survive as distinct source-object serializers with different numeric holdouts. They share four p23 word lengths and the solved-p56 positive-cardinal map, while their remaining operands and transforms are independently source-selected. Neither result decrypts p23 body ciphertext.**

## Decision

The two p23 readings do **not** compete for the same segmentation.

```text
full five-dot-selected first line:
[2,6,3,5,4]
  + dot5 + terminalGP0 25 + source23 + DH destination33
  --T-->
THE ORIGINAL

exact red span only:
[2,6] [3,5]
  + forward H on each printed pair
  --T-->
THE ONE RISE
```

They share only the first four printed word lengths `[2,6,3,5]` and the independently solved serializer

```text
T(n) = (p_n - 1) mod29.
```

The red span ends after those four words. The complete selected line contains a fifth black word of length4. That visible color/extent distinction fixes which source object belongs to each construction before either English output is scored.

## 1. THE ORIGINAL family

The exact p7→p23 five-dot mirror selects p23 line1. Its complete word lengths are

```text
[2,6,3,5,4] -> THEORIG.
```

The copied stencil count5 and that selected line's terminal rune GP0=25 extend the local packet:

```text
[2,6,3,5,4,5,25] -> THE ORIGIN.
```

Across the manuscript there are **188** five-word printed lines. Nine end in GP0=0, which is outside the positive one-based prime-cardinal domain and are excluded before serialization. Among the remaining **179 serializer-valid** lines, even granting every line the same dot cardinal5 plus its own terminal GP0, p23 line1 is the only packet beginning `THEORI`; it yields the complete `THEORIGIN`.

The three five-dot motif-adjacent controls remain:

```text
p7 terminal  -> THGRTHRIH
p23 initial  -> THEORIGIN
p56 terminal -> THTHGRRGIB.
```

The selected five lengths also equal the independently reconstructed source state order

```text
[K,a,e,g,q]=[2,6,3,5,4],
```

with physical p=23. Charging all 53 five-word lines on prime physical pages under all 120 role assignments gives 54 DH closures and four closures whose B state maps through native p50 to any physical page. The sole closure whose destination also reproduces its `[K,A]` and `[e,g]` source packets is p23→p33 under the authenticated role order.

Appending source page23 and destination33 through the unchanged T serializer gives

```text
THE ORIGINAL.
```

### Numeric holdout for THE ORIGINAL

Grant the complete `[lengths,dot,terminal,source page,destination page]` grammar to all four physical-page DH handoffs. Only the p23 packet satisfies either of the following held-out equalities:

```text
GP0(THE ORIGINAL) = 97
p_25 = 97
```

where 25 is the selected p23 line's terminal GP0, and

```text
p50[97] = 2U = 150
150 = 5*29+5
=> [5,5]
```

which returns the source-visible five stencil dots and five words on the selected line.

The other physical handoffs fail both the terminal-prime closure and the `[5,5]` source-pair closure.

These checks were recognized after the English phrase, so they are post-discovery numeric validation rather than blind probabilities.

## 2. THE ONE RISE family

The p23 red annotation is an exact 16-rune span. Its complete printed words have lengths

```text
[2,6,3,5].
```

Group only the printed pairs and apply the already fixed forward H:

```text
H(2,6) = [25,8]
H(3,5) = [27,8].
```

The resulting positive cardinals are

```text
[2,6,25,8,3,5,27,8]
 -> THE ONE RISE.
```

This serializer never consumes the fifth word of p23 line1, the five-dot count, the terminal rune, p23 as a page cardinal, or p33.

Charge every red span whose complete printed words form adjacent pairs, with every independent H/H^-1 polarity per pair. There are **24** valid serializer variants in the fixed annotation corpus. Exactly one yields `THEONERISE`: p23's red span under forward/forward H.

### Numeric holdout for THE ONE RISE

The complete output has

```text
GP0(THE ONE RISE) = 88.
```

The untouched canonical p50 cell gives

```text
p50[88] = 3V
native base60 = 211
211 = 7*29 + 8
=> [7,8].
```

That is literally a **one rise** from physical p7 to p8, beginning at p7, the other unsolved page in the exact five-dot p7↔p23 stencil relation.

More importantly, this is familywise rather than an English gloss: among all **24** charged red-span H/H^-1 variants, p23 forward/forward is the only one whose output GP0 addresses any consecutive p50 pair `[x,x+1]`. Its pair is exactly `[7,8]`.

This holdout is not globally unique across unrelated serializers. Two charged p41 DH physical-handoff rivals from the THE ORIGINAL family also have serialized GP0=88 and therefore hit the same p50 pair. They do not arise from the red-span H serializer and fail the ORIGINAL prime/`[5,5]` holdouts. That collision is preserved explicitly.

## 3. Prospective p8 receiver validation

The `[7,8]` consequence was frozen before opening p8 as a new target. The landing then exposes a compact state checkpoint without using p8 ciphertext language:

```text
physical page = 8 = A

p50[8] = 1W
native base60 = 92
92 = 3*29 + 5
=> [e,g] = [3,5]

p8 complete red heading word lengths = [4,8] = [q,A]

H^-1([q,A])
= H^-1([4,8])
= [6,2]
= [a,K].
```

There are eight exact two-word red spans in the annotation corpus. P8 is the only one with lengths `[q,A]=[4,8]`, and it is the only span whose physical page address simultaneously returns `[e,g]` while inverse H returns `[a,K]`.

The byte for `[e,g]` is 92. It appears at p50 addresses8 and146; p8 is its only occurrence in the physical page-address range0..57. Thus the frozen ONE-RISE endpoint does not merely land on the next page. It lands on the unique physical page carrying a three-part replay of the authenticated state:

```text
page number -> A
page p50 cell -> [e,g]
red heading -> [q,A] ->H^-1 [a,K].
```

The original p8 image also visibly opens with an enlarged red initial beside a rising tree-like illustration. That artwork is consistent with the route, while the acceptance test above uses only the numeric/layout state packet.

This is the discriminating untouched receiver consequence requested by Director #1797 for the ONE-RISE branch.

## 4. What is shared, and what is independent

The overlap is now exact:

```text
shared source values:
  first four p23 line lengths [2,6,3,5]
shared operation:
  solved-p56 T serializer

THE ORIGINAL only:
  complete fifth word length4
  five-dot count5
  terminal rune GP0=25
  physical p=23
  charged DH destination p33

THE ONE RISE only:
  exact red-span boundary after word4
  H(2,6)=[25,8]
  H(3,5)=[27,8].
```

The numeric value25 appears in both routes for different source reasons: it is the literal terminal rune GP0 in the full-line packet, and independently the difference coordinate of `H(2,6)` in the red-span packet. That convergence does not mean one serializer contains the other.

## Director fork

Both instructions survive the charged source families and have different held-out numeric closures. P23 should therefore be treated as a **multi-instruction checkpoint**:

```text
five-dot/full-line/state route -> THE ORIGINAL
red-span/H route              -> THE ONE RISE.
```

The stronger next decision is to use each instruction only where its own source-selected consequence identifies a receiver. Do not merge them into one English sentence, and do not transfer operands between the two serializers.

The `[7,8]` holdout now has a prospective receiver validation at p8: page8=A, p50[8]=[e,g], and its unique two-word red heading `[q,A]` maps under inverse H to `[a,K]`. The ORIGINAL branch remains tied to its p23→p33 state route and its `97=p_25`, `[5,5]` closures. Any next target test should preserve that branch separation.

## Reproduction

- Reconciliation SFT: `sims/lp2_p23_instruction_reconciliation_sft.cjs`
- THE ORIGINAL upstream: `im-results/lp2-p23-fivedot-totient-origin.md`
- THE ONE RISE upstream: `im-results/lp2-p33-p35-found-road-map.md`
- Full-phrase numeric closure: `im-results/lp2-p23-original-gp0-p50-closure.md`

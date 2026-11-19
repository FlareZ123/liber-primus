# READ OUT THE DIRECTION self-locates p29 word30 and yields a DH/derivative packet

**Agent1, 19 November 2026. Classification: source-selected structural operation candidate with a prospective numeric consequence on p29.** The held-out p28 recovery now gives a physically contiguous `READ OUT THE`. Authenticated source word29 is THE and its immediate one-based follower word30 is DIRECTION. Project p29 is physical LP2 page30, so the same source number selects canonical **word30 on physical page30** before that word's rune values are interpreted. Applying the already fixed outside-in H serialization to that four-rune object yields:

```text
[22,15,8,0] = [p-1,b,A,F].
```

Those numbers reconstruct `p=23`, `e=b^-1 mod(p-1)=3`, and `K=A^b mod p=2`. The recovered `e=3`, obtained from the local DIRECTION object before inspecting the derivative, applied to the independently fixed p29 repeated root24 gives `P'''(24)=7=W`. This supplies a new local source path to the derivative order used by the existing WAY candidate.

No p29 body plaintext is claimed here. The four-rune packet is numerical state material.

## Source-selected object

The held-out p28 result gives:

```text
p28 offsets134..139 -> READ OUT
p28 offsets140..141 -> THE
```

The recovered THE is canonical p28 word29. It also aligns with authenticated one-based source word29:

```text
29 THE
30 DIRECTION
31 SEEK
```

Project p29 is physical LP2 page30. Use the immediate authenticated follower's one-based source number literally:

```text
source word30 DIRECTION
physical page30 = project p29
canonical word30 on that page.
```

The object is fixed before its values are read.

Canonical p29 word30 is:

```text
offsets108..111
[11,26,11,18].
```

## READ OUT with the fixed H serialization

Use the canonical outside-in four-rune serialization already employed throughout the current route:

```text
H4([x0,x1,x2,x3])
= H(x0,x3) || H(x1,x2)
= [x0-x3, x1-x2, x1+x2, x0+x3] mod29.
```

Then:

```text
H4([11,26,11,18])
= [22,15,8,0].
```

The packet is exactly:

```text
[22,15,8,0]
= [p-1,b,A,F].
```

Here `F=0` is the GP zero rune/sentinel.

The three nonzero values are independently authenticated source-position state values:

```text
p-1 = 22
b   = 15 = source index WORDS
A   = 8  = source index DEVOTED.
```

The packet is sufficient to reconstruct:

```text
p = 22 + 1 = 23

e = 15^-1 mod22
  = 3

K = 8^15 mod23
  = 2.
```

These agree exactly with source indices:

```text
ROAD  = 23 = p
LIES  = 3  = e
PATH  = 2  = K.
```

Thus the local DIRECTION object regenerates a coherent subset of the authenticated DH state rather than merely containing four convenient residues.

## Page-numbered object family

The relevant object-selection grammar is finite and source-visible:

> on each physical LP2 page, take the canonical word whose one-based ordinal equals the physical page number.

For project p0..p55:

- **49** pages contain such a word;
- **7** of those selected words have exactly four runes, so H4 applies directly;
- among those seven, **p29 word30 is the only one whose H4 outer-sum coordinate is zero**.

The unique object is:

```text
project p29
physical page30
word30
offset108
H4=[22,15,8,0].
```

This does not prove the semantic role labels after the fact. It shows that the source-selected page/word object has a manuscript-unique H geometry within the exact numbered-object family.

## Manuscript-wide exact-packet control

Across p0..p55 there are **520 complete canonical four-rune words**.

Apply the same fixed H4 serialization to all 520. Exact packet:

```text
[22,15,8,0]
```

occurs once:

```text
p29 word30, offset108.
```

This is a post-observation packet control, so treat it as selectivity evidence rather than a discovery probability.

## Prospective derivative consequence

Independent existing evidence fixes p39's visible red triad as:

```text
G(X)=15X^2+5X+27
    =15(X-24)^2 mod29,
```

so root24 is selected before this local packet is used.

The p29 rune polynomial has:

```text
P(24)=0
P'(24)=0.
```

The DIRECTION packet independently reconstructs:

```text
e=3.
```

Use that order without scanning derivative outputs:

```text
P^(e)(24)
=P'''(24)
=7
=W.
```

This reproduces the W component of the existing p29 WAY route through a new local source-selected order derivation.

The existing cross-source route supplies `AY=[24,26]` separately from the authenticated 2013/p9 factor packet. Its assembly with W remains a separate candidate-level step. This report's new contribution is the local causal chain selecting derivative order3.

## Human solve-path hypothesis

The current literal route can now be written:

```text
p28 -> READ OUT THE
source word29 THE -> source word30 DIRECTION
DIRECTION's number30 -> physical page30 / p29 word30
READ OUT via fixed H4
-> [p-1,b,A,F]
-> derive p,e,K
-> e=3 tells derivative order at independently selected root24
-> W.
```

This is a substantially more direct reading of the authenticated sentence:

```text
their numbers are the DIRECTION
```

because DIRECTION's own source number selects a page and same-numbered word whose contents are numerical DH state, and one recovered number determines the next mathematical operation.

## Evidence boundary

Preserve as a **source-selected structural operation candidate**:

```text
READ OUT THE DIRECTION
 -> p29 word30
 -> H4=[p-1,b,A,0]
 -> e=3
 -> p29 derivative order3 at root24
 -> W.
```

The packet extraction uses an H serialization already fixed elsewhere, while applying READ OUT to this particular numbered object is a new interpretation recognized after the p28 phrase was recovered. The derivative consequence is numeric and prospective relative to the local packet, while the derivative/W relationship itself existed in prior repository work.

Do not use the packet to open arbitrary state-expression menus or invent a new whole-page cipher. Its value is the exact numbered-object selection and its concrete downstream derivative order.

## Reproduction

Run:

```text
node sims/lp2_p29_direction_selfindex_packet_sft.cjs
```

The SFT parses canonical words without splitting line wraps, selects page30/word30 from authenticated DIRECTION's number, verifies the exact H4 packet, performs the numbered-object and manuscript-wide controls, reconstructs `p,e,K`, and applies the recovered derivative order to p29 at root24.

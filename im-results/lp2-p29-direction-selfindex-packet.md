# READ OUT THE DIRECTION self-locates p29 word30 and yields a DH/derivative packet

**Agent1, 19 November 2026; paired source-number extension by Agent42, 27 November 2026. Classification: conditional structural operation candidate with an exact, previously known numeric consequence on p29 and a new source-numbered ROAD handoff.** The held-out p28 recovery now gives a physically contiguous `READ OUT THE`. Authenticated source word29 is THE and its immediate one-based follower word30 is DIRECTION. Project p29 is physical LP2 page30, so the same source number selects canonical **word30 on physical page30** before that word's rune values are interpreted. Applying the already fixed outside-in H serialization to that four-rune object yields:

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

## Paired THE / DIRECTION readout: the preceding numbered word says THE ROAD

The recovered instruction does not name DIRECTION in isolation. It is literally:

```text
READ OUT THE DIRECTION
```

and the authenticated one-based source register fixes the adjacent pair:

```text
29 THE
30 DIRECTION
```

Once DIRECTION's number30 selects physical page30 / project p29, retain both source-numbered canonical objects on that same page rather than discarding THE29. Canonical p29 word29 is immediately before the already selected word30:

```text
word29 offsets106..107 = [8,15]
word30 offsets108..111 = [11,26,11,18]
```

Apply the same two-rune H map already used by the numbered-source grammar:

```text
H2([8,15])
= [8-15, 8+15] mod29
= [22,23].
```

Those are authenticated zero-based source indices:

```text
22 THE
23 ROAD

=> THE ROAD.
```

The following word30 retains the established four-rune result:

```text
H4([11,26,11,18]) = [22,15,8,0] = [p-1,b,A,F].
```

So the exact source-numbered pair selected by `THE DIRECTION` yields two typed outputs side by side:

```text
THE29       -> THE ROAD
DIRECTION30 -> [p-1,b,A,F] -> p=23,e=3,K=2.
```

### Finite pair-family control

Charge the same coordinate grammar across every project page. For physical one-based page number `n`, take canonical words `n-1` and `n` when both exist. There are **48** such adjacent numbered pairs. Seven have a two-rune predecessor, so H2 can emit a two-coordinate source interval without any width change.

Exactly one of those seven predecessors gives an **increasing consecutive authenticated-source pair**:

```text
project p29 / physical30
canonical word29
H2 = [22,23] = THE ROAD.
```

The same page's current numbered object, word30, is independently the sole one of the seven numbered four-rune objects whose H4 outer-sum coordinate is zero. Thus the two observations meet on the same source-selected page/word pair; they are not assembled from separate page searches.

Across all **448** canonical complete two-rune words on unknown p0–55, exact H2 `[22,23]` occurs only at p29 word29. Exact-packet uniqueness alone is not a discovery statistic because H2 is invertible; the discriminating control is the finite numbered-pair family and the ordered consecutive-source predicate.

[Windows Node22 reproduction **45915515638 PASS**](https://github.com/FlareZ123/liber-primus/actions/runs/45915515638).

### Direct ROAD handoff to the existing p23 instruction

The new output ends on source index **23 ROAD**. Under the already used source-number-as-project-page convention this points to project p23 without consuming the polynomial-root orientation at all. P23 had independently yielded the hidden red-heading instruction:

```text
THE ONE RISE.
```

That earlier route prospectively interpreted one rise from source/project23 to24, selecting authenticated **AND24**. The established numbered-diagonal p24 checkpoint then gives:

```text
AND24 -> p24 canonical word25 -> H2 [12,13] -> THE WAY.
```

The new p29 result therefore connects already established pieces as:

```text
READ OUT THE DIRECTION
 -> DIRECTION30 selects physical page30 / p29
 -> p29 word29 H2 = THE ROAD
 -> ROAD23 selects p23
 -> p23 THE ONE RISE
 -> one rise 23 -> 24 AND
 -> AND24 numbered checkpoint = THE WAY.
```

This is a different p23 selector from the old reciprocal-root23 proposal. The source-selected polynomial orientation remains root24; nothing here revives or overrides the retired root23 branch.

The chain is structural source-register navigation, not continuous unknown-page prose. The remaining promotion gate is a genuinely new reversible ciphertext receiver selected by this route, rather than another coordinate correspondence.

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

Across p0..p55 there are **509 complete four-rune groups wholly contained within a physical page**, as defined by the linked SFT (2,864 wholly contained groups in total; 32 additional groups cross pages). All 509 four-rune inputs are distinct. The 26 November Critic recount on transcription blob `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7` and corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` also confirms 49 numbered objects, seven of length four.

Apply the same fixed H4 serialization to all 509. Exact packet:

```text
[22,15,8,0]
```

occurs once:

```text
p29 word30, offset108.
```

H4 is invertible: for output [a,b,c,d], the input is [(d+a)/2,(c+b)/2,(c-b)/2,(d-a)/2] in GF(29). Since every four-rune input is distinct, **every one of the 509 self-selected H4 packets is unique**. This control has zero discrimination among these objects, rather than merely being post-observation. It does not invalidate the numerical equality to the historical DH target; that equality requires its own preselected target, roles and selection grammar for evidential weight. For illustration only, under iid uniform GP29 inputs the probability that a selected four-rune packet has no duplicate among 508 others is (1−29⁻⁴)^508 ≈ 0.999282. The unique zero outer-sum among seven numbered four-rune groups has iid uniform descriptive probability 7(1/29)(28/29)^6 ≈ 0.19555 (not an LP2 discovery p-value).

## Reproduction of the previously known derivative consequence

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

This reproduces the W component of the existing p29 WAY route through a conditional local order derivation; W and the DH exponent were already known.

The existing cross-source route supplies `AY=[24,26]` separately from the authenticated 2013/p9 factor packet. Its assembly with W remains a separate candidate-level step. This report's new contribution is the local causal chain selecting derivative order3.

## Human solve-path hypothesis

The current literal route can now be written:

```text
p28 -> READ OUT THE DIRECTION
DIRECTION's number30 -> physical page30 / p29
source-numbered word29 THE -> H2 [22,23] -> THE ROAD -> ROAD23/p23
source-numbered word30 DIRECTION -> H4 [p-1,b,A,F]
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
 -> p29 words29/30
 -> word29 H2=[22,23]=THE ROAD -> ROAD23/p23
 -> word30 H4=[p-1,b,A,0]
 -> e=3
 -> p29 derivative order3 at root24
 -> W.
```

The packet extraction uses an H serialization already fixed elsewhere, while applying READ OUT to this particular numbered object is a new interpretation recognized after the p28 phrase was recovered. The derivative consequence is an exact arithmetic consistency check; the historical exponent e=3 and derivative/W relationship both existed before this packet interpretation, so this is not a new out-of-sample prediction.

Do not use the packet to open arbitrary state-expression menus or invent a new whole-page cipher. Its value is the exact numbered-object selection and its concrete downstream derivative order.

## Reproduction

Run:

```text
node sims/lp2_p29_direction_selfindex_packet_sft.cjs
```

The SFT parses canonical words without splitting line wraps, selects page30 from authenticated DIRECTION's number, verifies the paired source-numbered words29/30, checks word29 H2=`[22,23]`=`THE ROAD`, performs the 48-pair / 448-two-rune controls, verifies word30's H4 packet, reconstructs `p,e,K`, and applies the recovered derivative order to p29 at root24. Historical Windows Node22 run: **44461973002**. Paired-readout extension: **45915515638 PASS**. The Critic independently replayed the parser and derivative arithmetic against the current pinned blobs (49 numbered objects, 509 distinct four-rune groups, derivatives [0,0,25,7]); the SFT assertion of 48 was corrected to 49. The historical run is not a rerun of the corrected SFT.

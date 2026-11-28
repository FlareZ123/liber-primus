# P21 H4 reconstructs MEANING IS THE ROAD and cross-locks SEEKS / p22 / cell254

**Agent8, 28 November 2026. Classification: source-selected navigation cross-lock / authenticated-source semantic readout; no unknown LP2 plaintext, body key, or cipher inverse.**

## Decision

The independently selected corridor

```text
p47 -> p46 -> p21
```

ends at physical p21 under the already frozen H-pair/BASE29/mod256/p50 literal-page consumer. That route fixes **p21/group21** before this result is read.

P21/group21 is the four-rune group

```text
[13,8,15,22]
```

and canonical outside-in H gives

```text
H4 = [20,22,23,6].
```

This packet has an exact first-party semantic reading in the authenticated January 2016 word register.

## Locked source phrase

The signed 2016 message says:

```text
Its words are the map, their meaning is the road,
and their numbers are the direction.
```

The independently established zero-based word numbering has

```text
20 MEANING
21 IS
22 THE
23 ROAD
 6 SEEKS
```

The selected object is page/group **21**. Insert that already fixed current index between the first two H outputs:

```text
H4 first three = [20,22,23]
current page   = 21

[20,21,22,23]
= MEANING / IS / THE / ROAD.
```

The unused fourth H output is

```text
6 = SEEKS.
```

This is unusually literal: the source-selected manuscript object reconstructs the authenticated instruction fragment **MEANING IS THE ROAD**, while its one remaining coordinate selects the authenticated source word **SEEKS**.

### Familywise control

There are **48** self-indexed page/group objects `pN/groupN` in unknown p0-p55 and only **10** have H-length4.

For every one of those 10 H4 objects, test all four positions for inserting its already-known current page number among H's first three outputs. Also test reversed H-first-three order as an orientation control.

Exactly one object produces four consecutive signed-word indices in either orientation:

```text
p21/group21
H=[20,22,23,6]
insert page21 at position1
-> [20,21,22,23]
-> MEANING IS THE ROAD.
```

The reversed control adds no rival.

This control charges the sequence property directly; it does not score English after searching arbitrary permutations.

## SEEKS closes the corridor back to p47

The remaining H coordinate **6** selects authenticated source word **SEEKS** under the same zero-based register. This is not a new source role: prior repository work established the exact first-party relation

```text
H(GP(SEEKS))
= [HELLO, WAY, MAP, ROAD, THE]
```

and separately uses **GP0(SEEKS)=71** as the source-selected start of the existing p32 route.

Under that already published route:

```text
SEEKS word6
 -> GP0(SEEKS)=71
 -> canonical raw p50 base60-byte pointer transition for p=23 steps
 -> state32
 -> original p50 byte at cell32 = 115
 -> p50 cell115 token = 47
 -> physical p47.
```

Thus the new p21 packet conditionally closes a source-semantic circuit back to the p47 page that generated the corridor:

```text
p47 -> p46 -> p21
              |
              +-- H4 remaining 6 = SEEKS
                    -> 71 --23 pointer steps--> 32
                    -> cell115 -> literal47
                    -> p47.
```

The p32/SEEKS route remains conditional navigation rather than a body decryptor; this result does not upgrade its existing evidence classification. The new fact is that **the source-selected p21 H packet supplies SEEKS itself** with no word search.

## Neighbor branch converges on p22 and cell254

P21's H packet also exposes its two immediate neighboring signed/page indices directly:

```text
H4 starts [20,22] = [page-1,page+1].
```

The exact ordered neighbor predicate is unique among all 10 self-indexed H4 objects. Extending it by H's third coordinate gives the stronger unique geometry

```text
[h0, current page, h1, h2]
= [page-1, page, page+1, page+2]
= [20,21,22,23].
```

Take the two explicitly named neighboring pages as a conditional branch.

### p20 -> p22 under the frozen table consumer

Self-indexed p20/group20 has

```text
H4 = [28,20,11,23].
```

Read its adjacent H pairs with the already established BASE29/mod256 p50-address rule:

```text
[28,20] -> 28*29+20 = 832 -> cell64 -> token22
[11,23] -> 342             -> cell86 -> token1p.
```

Exactly one output is a legal literal physical-page numeral: **22**. It names the other p21 neighbor already fixed by the p21 H packet.

### p22 -> cell254

Self-indexed p22/group22 has

```text
H4 = [17,17,11,7].
```

The same adjacent-pair rule gives

```text
[17,17] -> 510 mod256 = cell254 -> token39
[11, 7] -> 326 mod256 = cell70  -> token2n.
```

Across **all 48** self-indexed page/group H packets, p22/group22 is the **only** object with any adjacent H pair mapping to p50 **cell254**.

Cell254 is not being selected here because token39 looks interesting. It is already an independently selected source cell in the p27 red13 route, where original p27 geometry fixes row31/column6 -> cell254 before the table token is read. The p21 neighbor branch therefore cross-locks an existing p27 source junction from a different source-selected manuscript object.

The conditional branch is:

```text
selected p21/group21
 -> unique H neighbor bracket [20,22]
 -> p20/group20 --frozen H-pair table rule--> literal22
 -> p22/group22 --same frozen rule--> cell254
 -> independently established p27/DH junction.
```

## Evidence boundary

Three things are established exactly:

1. The source-selected p21/group21 H packet is `[20,22,23,6]`.
2. Inserting the already-known current page21 into H's first three outputs uniquely yields authenticated signed-word indices `[20,21,22,23]` = **MEANING IS THE ROAD** across the declared self-indexed-H4 family; the leftover coordinate is authenticated word6 **SEEKS**.
3. Under the pre-existing adjacent-H-pair table consumer, p20 points to literal22 and p22 uniquely hits independently selected cell254.

The interpretive step is treating the p21 neighbor bracket as an instruction to inspect both neighboring self-indexed groups. That branch is therefore a **strong intended-route hypothesis**, not recovered plaintext.

The SEEKS closure requires less new interpretation: the authenticated clue itself says its words are the map and their numbers the direction, zero-based source-word indexing is already established elsewhere, and SEEKS already has an independent navigation role. Even so, the downstream p32→p47 route remains a conditional navigation construction.

No generic cipher search follows from this result. The next useful test is a first-party operation at the p27/cell254 junction that consumes the converged route, or an independently fixed receiver that turns the p21 semantic packet into unknown plaintext.

## Reproduction

Run:

```text
node sims/lp2_p21_meaning_road_seeks_cell254_sft.cjs
```

The SFT reads the canonical transcription/corpus/grid, exhausts the self-indexed H4 insertion/orientation family, reproduces the SEEKS→p32→cell115→p47 closure, and checks the p20→p22→cell254 branch plus the all-self-indexed cell254 uniqueness control.

Related:
- [Authenticated 2016 source record](../resources/cicada2016-4gq25.md)
- [SEEKS authenticated H checksum](lp2-signed2016-seeks-h-navigation-checksum.md)
- [p32→cell115→p47 route](lp2-p32-p47-lowdigit-road-map.md)
- [p27-selected cell254 route](lp2-p27-p50-base29-pointer-state-tape.md)
- [p47→p46→p21 corridor](lp2-p47-receiving-line-raw-dh-state.md)

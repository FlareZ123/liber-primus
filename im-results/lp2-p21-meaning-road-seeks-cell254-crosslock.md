# P21 H4 fixes numeric 20–23 and locally selects MEANING IS THE ROAD / SEEKS

**Agent8, 28 November 2026. Classification: source-selected numeric navigation cross-lock with a locally discriminated zero-origin source reading; no unknown LP2 plaintext, body key, or cipher inverse.**

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

This packet has an exact source-number structure. Its text reading depends on source-index origin; the downstream frozen SEEKS/EPIPHANY comparison below locally selects the zero-origin branch for this circuit.

## Locked numeric sequence; zero-origin semantic branch

The signed 2016 message says:

```text
Its words are the map, their meaning is the road,
and their numbers are the direction.
```

Under the zero-origin candidate register:

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

The manuscript-fixed result at this point is the numeric packet `[20,21,22,23]` plus omitted coordinate `6`. Under zero origin these read **MEANING IS THE ROAD / SEEKS**; under one-based numbering they read **THEIR MEANING IS THE / EPIPHANY**. The frozen downstream comparison below discriminates those rivals locally.

### Familywise control

There are **48** self-indexed page/group objects `pN/groupN` in unknown p0-p55 and only **10** have H-length4.

For every one of those 10 H4 objects, charge the larger finite family:

- omit each of the four H coordinates in turn;
- preserve the remaining H order or reverse it as the only orientation control;
- insert the already-known current page number at each of the four possible positions.

That is **32 configurations per H4 object / 320 total configurations**. Exactly one produces four consecutive numeric source indices:

```text
p21/group21
H=[20,22,23,6]
omit H coordinate3 = 6
keep [20,22,23] forward
insert page21 at position1
-> [20,21,22,23]
-> numeric interval 20..23.
```

Thus omitted coordinate **6 itself is fixed by the sole familywise numeric-sequence hit**. Its `SEEKS` label belongs to the locally favored zero-origin branch; it is not a coordinate chosen after recognizing English. No reversed orientation or alternate omitted coordinate yields a rival.

This control charges the sequence property directly; it does not score English after searching arbitrary permutations.

### Source-index origin rival: this circuit locally selects zero origin

The numeric sequence `[20,21,22,23]` is origin-independent, but its source-text reading is not:

```text
zero-origin source[20..23] = MEANING IS THE ROAD
one-based words20..23      = THEIR MEANING IS THE.
```

Likewise the omitted coordinate6 reads:

```text
zero-origin source[6] = SEEKS
one-based word6       = EPIPHANY.
```

Charge those two conventional rivals under the **same already frozen downstream operations**, without changing a step count or consumer.

Zero-origin:

```text
GP(SEEKS)=[15,18,18,5,15], GP0=71
H(GP(SEEKS))=[0,13,18,23,1]
             = HELLO / WAY / MAP / ROAD / THE
23 raw p50 byte-pointer edges from71 -> cell32
p50 byte32=115 -> token115=47 -> p47.
```

One-based rival:

```text
GP(EPIPHANY)=[18,13,10,13,8,24,9,26], GP0=121
H(GP(EPIPHANY))=[21,4,15,5,21,5,22,15]
23 raw p50 byte-pointer edges from121 -> cell114
p50 byte114=197 -> token197=1t.
```

EPIPHANY's H shell contains none of the complete `{WAY=13, MAP=18, ROAD=23}` navigation triad, and the same pointer consumer does not return to p47.

Therefore this **specific p21 semantic circuit favors zero-origin source indexing by two independent frozen consequences**: coherent ROAD selection and closure to the already selected source page. This is a local route discriminator, not evidence that every Cicada textual coordinate system is universally zero-based. Preserve Agent10's broader origin warning outside this circuit.



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

## Preferred semantic successor: ROAD=23 selects the p23 instruction checkpoint

The already-established authenticated-source checksum for the newly selected word SEEKS is:

```text
GP(SEEKS) = [15,18,18,5,15]

H(GP(SEEKS))
= [0,13,18,23,1]
= [HELLO, WAY, MAP, ROAD, THE].
```

Across all 43 authenticated source words, SEEKS is uniquely the word whose H shell contains the complete navigation triad `{WAY=13, MAP=18, ROAD=23}`; this relation predates the present route.

P21's reconstructed sentence now types which one to take:

```text
MEANING IS THE ROAD
                 ^^^^
H(SEEKS) supplies ROAD at source index23.
```

The authenticated sentence immediately says that the words' **numbers are the direction**. Therefore the source-defined semantic continuation is:

```text
p21/group21
 -> remaining coordinate6 = SEEKS
 -> H(SEEKS) contains WAY / MAP / ROAD
 -> p21 instruction says choose ROAD
 -> ROAD source number = 23
 -> physical p23.
```

This reaches the existing p23 instruction checkpoint **without importing the conditional mixed p47 DH-role grammar**. P23 is already independently source-constrained by the p7↔p23 five-dot relation and carries the established source-object serializers:

```text
complete five-dot-selected line -> THE ORIGIN
exact red span                  -> THE ONE RISE.
```

The p47 conditional state route also lands on p23, so the two paths now converge:

```text
p47 conditional descriptor route -> p23
p21 authenticated semantic route  -> p23.
```

The second route is the stronger clue-level explanation for **why a human solver should go to page23**: it uses only fixed H, an authenticated source word, the authenticated sentence's own semantic instruction, and the already established zero-based source-number convention.

This does not decrypt p23 body ciphertext. It upgrades p23 from a mostly numerically convergent receiver to a destination with an independently reconstructed semantic instruction path.



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

### Literal `39` is also an authenticated FALSE direction

The selected cell's literal token supplies an independent semantic continuation under the same zero-based source-number convention already used by p21:

```text
cell254 token = 39
signed source word39 = FALSE
physical p39 = the independently source-assigned FALSE page.
```

This reading does not need a radix choice: `39` is the printed token itself. It also does not need to choose between “source-word number” and “page number,” because the established number-as-direction convention identifies both with index/page39.

P39 is not a blank semantic target. Director #1784 had already prospectively fixed p39 offsets132..136 as the first complete `g=5` word after the page's sole red span, using authenticated word39 FALSE and the original red-X route **before those rune values were opened**. A later independently derived p6/warning key replays that fixed receiver exactly to `FALSE`; its key grammar remains retrospective, so this new cell254 route strengthens the **source assignment and receiver navigation**, not the cipher proof.

The resulting clue-shaped path is:

```text
p21/group21 H4
 -> MEANING IS THE ROAD
 -> neighbor p22
 -> p22/group22 H-pair
 -> p50 cell254
 -> literal 39
 -> source word39 = FALSE
 -> physical p39
 -> prospectively fixed FALSE receiver.
```

This is precisely the kind of behavior suggested by the authenticated sentence: a manuscript-derived **number** acts as the **direction**, while its authenticated **meaning** names the road/receiver semantics.

### The semantic 39 route reconstructs the numeric radix junction

The literal token has two source-visible numeric readings already live in p50 research:

```text
base59("39") = 186
base60("39") = 189.
```

The semantic direction route independently reaches the conventional-base60 side. Reuse the same self-index convention on physical p39:

```text
p39/group39 values = [21,2,9,5,14,16,21]
H7 = [0,15,24,5,23,18,13].
```

Its adjacent H-pair table addresses are:

```text
[0,15]  -> cell15
[24,5]  -> cell189
[23,18] -> cell173.
```

Under the independently established base59 pointer graph, **cell189 is the unique fixed point / global sink**. Thus the p39 direction branch has a natural stopping event at exactly **189**, the conventional-base60 value of the original `39` token.

The original p50 mirror-tree artwork then fixes horizontal reflection:

```text
cell189 = row23,col5
mirror col5 -> col2
-> cell186,
```

and **186 is exactly base59("39")**.

So one printed token now supports a commuting source circuit:

```text
cell254 token39
  | numeric base60                     | number-as-direction
  v                                    v
cell189 <--- p39/group39 H-pair --- physical p39 / FALSE
  |
  | original p50 horizontal mirror
  v
cell186 = numeric base59("39").
```

The p39 H packet has three pair addresses and the choice of 189 is justified by the pre-existing unique base59 fixed-point stopping condition, not by matching the desired numeral afterward. Across all self-indexed groups p24 also has an H pair that reaches189, so “H-pair→189” is **not globally unique**; the evidence here comes from p39 being selected first by the literal token39.

This circuit materially narrows why both radix readings of the p27-selected token are relevant, but it still does not specify a body-cipher consumer.





The conditional branch is:

```text
selected p21/group21
 -> unique H neighbor bracket [20,22]
 -> p20/group20 --frozen H-pair table rule--> literal22
 -> p22/group22 --same frozen rule--> cell254
 -> literal39 -> signed word / physical p39 = FALSE
 -> prospectively fixed p39 FALSE receiver

and independently:
cell254 -> established p27/DH junction.
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

The SFT reads the canonical transcription/corpus/grid, exhausts the 320-configuration self-indexed H4 omission/orientation/insertion family, reproduces the ROAD23 and SEEKS→p32→cell115→p47 closures, checks the p20→p22→cell254→39/FALSE branch and token39 semantic/radix circuit, and charges all-self-indexed cell254 uniqueness. The canonical signed-word fixture excludes numeric `3301`, matching the established alphabetic tokenizer; an intermediate CI failure exposed and corrected that implementation detail. The corrected full SFT passed Windows/Node22 GitHub Actions run **46151595502**.

Related:
- [Authenticated 2016 source record](../resources/cicada2016-4gq25.md)
- [SEEKS authenticated H checksum](lp2-signed2016-seeks-h-navigation-checksum.md)
- [p32→cell115→p47 route](lp2-p32-p47-lowdigit-road-map.md)
- [p27-selected cell254 route](lp2-p27-p50-base29-pointer-state-tape.md)
- [p47→p46→p21 corridor](lp2-p47-receiving-line-raw-dh-state.md)

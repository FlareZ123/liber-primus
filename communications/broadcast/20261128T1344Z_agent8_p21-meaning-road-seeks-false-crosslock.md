# Agent8: p21 H4 fixes numeric20–23; frozen rival test locally selects ROAD/SEEKS

**28 November 2026, ~13:44 UTC. Classification: source-selected navigation/authenticated-source semantic cross-lock; no unknown LP2 plaintext or cipher inverse.**

The p47→p46 corridor now terminates at source-selected **p21/group21** before this semantic readout is opened.

Canonical H of p21/group21 is:

```text
H4 = [20,22,23,6].
```

The numeric packet is origin-independent. Under the zero-origin candidate register:

```text
20 MEANING
21 IS
22 THE
23 ROAD
 6 SEEKS
```

Insert the already fixed current page/group index21 among H's first three outputs:

```text
[20, 21, 22, 23] = MEANING IS THE ROAD
remaining H output 6 = SEEKS.
```

Familywise control: there are 48 self-indexed pN/groupN objects and only 10 H4 objects. For each H4 packet, omit each of four coordinates in turn, preserve/reverse the remaining H order, and try every current-page insertion position: **320 configurations total**. Exactly one consecutive numeric hit survives: p21, omit coordinate6, keep [20,22,23] forward, insert page21 at position1. The coordinate6 itself is fixed by this hit; its text label depends on source-index origin.

Origin rival: zero-origin reads `[20..23]=MEANING IS THE ROAD`, coordinate6=`SEEKS`; one-based reads `THEIR MEANING IS THE`, coordinate6=`EPIPHANY`. Under the **same frozen consumers**, SEEKS has H shell `[HELLO,WAY,MAP,ROAD,THE]` and its 23-step raw-byte pointer closes to p47, while EPIPHANY's H shell lacks the complete navigation triad and the identical pointer ends at cell114→`1t`. This specific circuit therefore **locally favors zero origin**; it does not establish a universal source-index convention.

The same SEEKS coordinate supplies a stronger typed successor. The independently established authenticated checksum is

```text
H(GP(SEEKS)) = [0,13,18,23,1]
             = HELLO / WAY / MAP / ROAD / THE.
```

Under the locally favored zero-origin branch, p21 reads **MEANING IS THE ROAD**, selecting ROAD from that shell; the signed source immediately says word **numbers are the direction**, so `ROAD=23` independently selects **physical p23**. That converges on the existing p23 `THE ORIGIN / THE ONE RISE` instruction checkpoint without using the disputed mixed p47 DH-role serializer.

Under that same locally favored branch, the omitted **SEEKS** coordinate conditionally closes back to p47 through the already-published route:

```text
SEEKS GP0=71
 -> 23 raw p50 byte-pointer edges
 -> p32
 -> p50 cell115
 -> literal47
 -> p47.
```

A separate neighbor branch is also source-locked:

```text
p21 H starts [20,22]=[page-1,page+1]
p20/group20 H-pair -> p50 cell64 token22 -> literal p22
p22/group22 H-pair [17,17] -> p50 cell254 token39.
```

Across all 48 self-indexed groups, **p22 is the only one with any adjacent H pair landing on cell254**. Cell254 was independently selected by the p27 red13 source geometry before its token was read.

Under the same locally favored zero-origin source register, literal token **39** has an especially clean number-as-direction continuation:

```text
signed source word39 = FALSE
physical p39 = the already source-assigned FALSE page.
```

Director #1784 had prospectively fixed the p39 FALSE receiver before its rune values were opened; the later local key grammar remains retrospective, so this new route strengthens the page/receiver assignment rather than proving the cipher.

The same token's numeric and semantic readings now commute:

```text
base60("39") = 189

39 -> p39/group39
H7=[0,15,24,5,23,18,13]
adjacent H-pair addresses = [15,189,173]
189 = unique base59 fixed sink

original p50 horizontal mirror: 189 -> 186
base59("39") = 186.
```

So the authenticated “meaning/road/numbers/direction” wording now participates in a concrete source circuit rather than only an interpretation:

```text
p21 -> MEANING IS THE ROAD / SEEKS
  |                         |
  |                         +-> SEEKS pointer route -> p47
  |
  +-> neighbor22 -> cell254 -> literal39/FALSE -> p39 -> sink189 -> mirror186
                         |
                         +-> independently established p27/DH junction
```

Evidence boundary: p21's **numeric** interval reconstruction and p22's unique cell254 hit are exact; the English ROAD/SEEKS reading is locally selected by the frozen SEEKS-vs-EPIPHANY rival test, while treating the p21 neighbor bracket as an instruction to inspect both neighbors remains an intended-route hypothesis. No body-cipher consumer has been recovered.

Files:
- `im-results/lp2-p21-meaning-road-seeks-cell254-crosslock.md`
- `sims/lp2_p21_meaning_road_seeks_cell254_sft.cjs`
- `im-results/lp2-p47-receiving-line-raw-dh-state.md`

The p47 corridor report was also corrected after the Critic audit: preserve frozen navigation/raw vectors as evidence; do not count mixed descriptor→DH-role labels as a proved serializer.

Independent corroboration arrived concurrently from Agent10: fixed p50 prime-rank geometry yields **THE MAP / IS / THE ROAD** across the uniquely live base59/base60 codecs and a separate DIRECTION29 bridge. That work is methodologically disjoint from p21's H4 sequence; together they reconstruct complementary portions of the same authenticated map/meaning/road/numbers/direction instruction without claiming body plaintext.

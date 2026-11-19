# p57 reconstructs the p50 nested bracket: EMERGE=83, DIUINITY=105, center `13`

**Agent5, 18 November 2026. Classification: high-priority source-internal solve-path hypothesis. Every numerical and artifact statement below is reproduced from original/curated source inputs. The remaining inference is the instruction that solved p57 words should be summed in canonical GP0 and used as zero-based p50 addresses. No unknown LP2 plaintext or key is recovered.**

## Human-first reconstruction from the solved instruction

Solved p57 says:

`WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIUINITY WITHIN AND EMERGE.`

The original p57 image also visibly prints the red title `PARABLE` followed immediately by a red 13-dot mark; the terminal punctuation is a red 23-dot mark. The curated ink annotations reproduce those two marks at offsets7 and95.

Use the canonical GP0 indices already native to LP arithmetic.

`EMERGE = E M E R G E = 18+19+18+4+6+18 = 83`.

Zero-based p50 **cell83 is `3D`**. The same token occurs at cell127. One cell immediately outside each endpoint gives cells82 and128, and both are **`3L`**. This reconstructs the independently discovered nested pair directly from the instruction:

- outer pair: cells82/128, token `3L`, base60 value201, separation46 = π(201);
- inner pair: cells83/127, token `3D`, base60 value193, separation44 = π(193);
- both pairs have the same linear midpoint **105**;
- shedding both endpoint pairs leaves strict interior cells84..126, exactly43 cells.

Now apply the next named object in the instruction:

`DIUINITY = [23,10,1,10,9,10,16,26]`, whose canonical GP0 sum is **105**.

Thus the word **DIUINITY lands exactly at the common center of both reconstructed circumferences**. Cell105 prints literal token **`13`**, and `13` occurs once in the entire 256-token table.

The core path is therefore:

`EMERGE --GP0--> 83 --duplicate 3D / outer 3L--> nested circumferences --shed endpoints--> 84..126 --center--> 105 <--GP0-- DIUINITY`

This is materially stronger than discovering the bracket first and fitting p57 afterward: a solver starting from the solved instruction can use EMERGE to enter the table at one boundary, recover both nested duplicate pairs by local inspection, verify both prime-count separations, shed the boundaries, then find DIUINITY at their exact shared center.

Across all 20 complete p57 words, the only GP0 sums that hit the five bracket-special addresses `{82,83,105,127,128}` are **EMERGE=83** and **DIUINITY=105**. Other arithmetic conventions can produce isolated special hits, so the evidence is the paired semantic match rather than a claim that GP0 is the only imaginable encoding.

## The same frozen GP0 addressing exposes a word-level instruction chain

The authenticated 2016 Cicada message says: `Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.` The route below directly instantiates that grammar: solved **word meanings** select actions such as EMERGE, WITHIN, CIRCUMFERENCES, SHED and FIND, while canonical GP0 **word numbers** select p50 addresses and table values supply navigation outputs.

Once GP0→p50 address is fixed by EMERGE/DIUINITY, the remaining p57 words provide an independent table prediction.

- `WITHIN` has GP0 sum38. Cell38 is `2D`; base59 gives **131**, exactly the GP0 sum of `CIRCUMFERENCES`. Base60 gives133, so the p57-word hit selects base59.
- `SHED` has GP0 sum64. Cell64 is `22`; base59 gives **120**, exactly the GP0 sum of the title `PARABLE`. Base60 gives122. An independent historical input to this same address is the archived 2013 OS screen “The key is all around you”: its adjacent words ALL and AROUND both have GP0=64. In the fixed local 2013 text corpus (eight PGP-clear-signed messages plus the OS screen), this is the only adjacent equal-GP0 pair whose common address lies on the outer ring. It strengthens the local SHED=64 → PARABLE edge, but does not select base59 globally; token22 repeats at104 and the p57 word-family has multiple matches. See the all-around report and wordwise SFT.
- `CIRCUMFERENCES` has GP0 sum131. Cell131 is `20`; base60 gives **120**, independently converging on `PARABLE`. Base59 gives118.
- `PARABLE` has GP0 sum120. Cell120 is `0g`; base60 gives **42**, exactly the GP0 sum of `FIND`. No source token decodes to42 under base59.
- `FIND` has GP0 sum42. Cell42 is `0S`; both base59 and base60 decode it as **28**.

The connected source-word path is:

`WITHIN --base59--> CIRCUMFERENCES --base60--> PARABLE --base60--> FIND --> 28`

A second inbound edge independently gives:

`SHED --base59--> PARABLE`

The radix split is semantically coherent at the first edge: SHED uses the alphabet with one symbol removed, and the 2013 OS ALL/AROUND pair independently selects the same address64. This supports the local base59 edge but does not establish a global base59 codec. It is mechanically forced by the actual source tokens if the target is PARABLE=120: `22` reaches120 only in base59, while `20` reaches120 only in base60.

### Conditional matched-token diagnostic

Treat the named GP0 addresses64,131,120 as frozen by the source words and randomly permute the exact 256-token p50 multiset.

For the exact observed radix assignment:

`P = (2/256) × (1/255) × (2/254) = 1/4,145,280`.

If either base59 or base60 is allowed independently at the two inbound PARABLE edges, there are three source token copies capable of yielding120 under at least one radix, while the PARABLE→FIND edge still requires one of the two `0g` copies:

`P = (3/256) × (2/255) × (2/254) = 1/1,381,760`.

These are conditional selectivity diagnostics, not universal familywise p-values over every possible word subset, numerical convention, or semantic interpretation. Their value is that the GP0 addressing convention was identified independently by the EMERGE/DIUINITY bracket reconstruction before this complete p57-word graph was enumerated.

The resulting **28** is a concrete blind destination. A page-number reading is natural in the original 2014 release because the distributed LP2 files were literally named `0.jpg` through `57.jpg`; source `28.jpg` is physical p28, mirrored locally as archive `45.jpg`. A second page-number control exists: `TUNNELNG` (GP0=94) lands on p50 cell94 `0u`, whose two frozen radix readings are **55 and56**, exactly the final unknown p55 / solved p56 pair.

## Independent receiver now types FIND → 28 as p27 offset28

A concurrent independent source route materially sharpens terminal byte28. Historical `prime_echo` exhaustion at p55 selects the intact repeated pair `DJU / BEI`; its only other adjacent occurrence is on **p27**, so that finite source independently supplies the receiver page.

Under the same GP0→p50 byte grammar:

`FIND = 42 → T[42] = 28`.

Original p27 rune offset28 is exactly the start of `DJU`, followed immediately by `BEI` at offset31. The canonical p27 slice at offsets28..33 transliterates `D J U / B E I`.

Page27 and offset28 now come from independent source-selected routes: finite `prime_echo` exhaustion and duplicate-word geometry select p27, while p57/2016 GP0-table navigation selects offset28. The older retrospective `(x+y,x-y) mod29=(27,28)` mnemonic is no longer needed.

Agent23 independently reproduced the same operator on authenticated 2016 words, including the unique `EMPTY / EPIPHANY → 236 / 237` p0 boundary circuit, in [the signed-2016 GP0 table circuit](lp2-2016-gp0-table-word-pointer-circuit.md).

## Secondary page-number reading: FIND → p28 → π(269) = 57

The byte28 now has a stronger typed receiver at p27:28. A page-number reading remains a coherent secondary interpretation because the original distribution used filenames `0.jpg` through `57.jpg`, and it closes a source-selected loop. It should not displace the independently selected p27 receiver.

The earlier player-first p28–p31 audit had already established an unusual source fact before this route existed: physical pp28–31 are the **only consecutive four-page window in p0–p55 whose four rune counts are all prime**. Their counts are:

`[269, 277, 263, 269]`.

That work stopped because the pages themselves supplied no instruction to select the window or apply prime counting. The present route supplies both missing ingredients independently:

1. `PARABLE → FIND → 28` selects original source page `28.jpg` before its length is inspected.
2. The p50 nested bracket has already selected the prime-counting function π twice, through separations `44=π(193)` and `46=π(201)`.

Physical p28 contains exactly **269 runes**. It is prime, and:

`π(269) = 57`.

Thus the route returns directly to the solved page that supplied the instruction:

`p57 instruction → p50 bracket/word graph → FIND 28 → p28 length269 → π(269)=57 → p57`.

Applying the already selected π operation to the entire unique p28–p31 prime-length run gives prime ordinals:

`[57, 59, 56, 57]`.

The p28 closure is the relevant blind consequence because page28 was selected first. The other values are retained as context, especially the appearance of 59 beside solved pp56/57, but they do not by themselves establish a further operation.

This closure is selective at the route level rather than at the raw page-count level. Six LP2 pages have rune counts269 or270 and therefore π(count)=57: pp20,24,28,31,45,46. The evidential point is that **FIND has already selected p28 before the count is taken**. No choice among those six is made after observing the result.

The alternative reading of 28 as GP rune index28 is weak here: rune28 (`EA`) occurs **14 times** on p28 and supplies no unique object or source-selected continuation. The source-file/page reading is therefore the first interpretation that produces a deterministic, clue-constrained closure without adding a cipher search.

## Complete word-graph familywise control (Agent6)

The complete p57-word family is less selective than the named semantic chains alone suggest. The 20 p57 words have **17 distinct GP0 sums**. Across the exact 256-token p50 multiset, **36 tokens** decode under base59 or base60 to at least one of those 17 sums. The original table places such tokens at **5/17** frozen p57-word addresses: WITHIN→CIRCUMFERENCES, SHED→PARABLE, TUNNELNG→AND, PARABLE→FIND, and CIRCUMFERENCES→PARABLE.

Under exact without-replacement permutation of the p50 token multiset, the expected count is **2.390625** and the exact hypergeometric tail for at least five hits is **0.0721127149**. This is only modest enrichment. The tiny conditional placement probabilities for particular named semantic edges must therefore not be treated as familywise evidence over the complete word graph.

The stronger EMERGE/DIUINITY bracket reconstruction uses additional duplicate-pair, prime-count, midpoint and unique-center structure, so this calibration does not demote that route. Full control: [report](lp2-p57-wordgraph-multiset-control.md) and [SFT](../sims/lp2_p57_wordgraph_multiset_control_sft.cjs).

## EMERGE pointer walk is not independent evidence

A tempting continuation is to start at center105 and follow base59 table pointers until “emergence.” The path reaches the unique base59 fixed point189 in28 hops. An all-start census rejects this as validation: **all 256 p50 starting cells eventually reach189**. Six starts, including105, do so in exactly28 hops. The fixed point therefore adds no evidence for the p57 bracket route.

## Printed center `13` and the red-13 punctuation family

The center token is visibly `13`, not merely a radix-decoded number. The original p57 page places a red 13-dot punctuation mark immediately after the red title PARABLE, giving a same-page visual motif a human solver could notice.

The manuscript nevertheless uses 13-dot marks as a recurring punctuation class, and solved-page controls do not establish their dot count as a numeric operand. Therefore this continuation stays conditional.

If the center `13` is taken as a cue to inspect red 13-dot marks, then requiring an immediately preceding red span to possess a one-based 13th rune leaves exactly six original pages:

`p0, p3, p7, p23, p27, p53`.

Their red-span GP-prime sums are `662,742,766,786,1109,2262`; only p27 is prime, **1109 = prime #186**. Its one-based 13th rune is `I` with GP prime31, its residual length after position13 is6, and `31×6=186`. That is the existing p27 red13 object whose DH/table continuation has already survived an independent familywise audit around 1 in130,000.

This gives the red13 route a plausible upstream human clue for the first time, while the exact interpretation of the printed center token remains unresolved.

## Center-out receiver follow-up (Agent6)

The source reconstruction makes one distinct receiver worth testing before any broader cipher search: after `DIUINITY` identifies center cell105, read the 43-cell strict interior **outward from the center**, interpreting p57 `EMERGE` as the serialization cue, and pair that stream with the 43 strict p55 word interiors selected by `SHED OUR OWN CIRCUMFERENCES`.

That finite receiver is now closed for the two center-out tie orders, raw-byte/totient GP29 registers, and every global affine additive pair `a,b mod29` (**3,364 candidates**). The best original candidate scores **-11.92144509** on the calibrated within-word GP29 trigram model, below the worst of **2,000** exact-word-shape native controls (**-8.96495606**). A source-shaped planted receiver recovers **43/43** and scores **-7.65777251**. See [the bounded receiver gate](lp2-p57-divinity-emerge-centerout-p55-gate.md) and [SFT](../sims/lp2_p57_divinity_emerge_centerout_p55_sft.cjs).

This negative leaves the `EMERGE=83 / DIUINITY=105` bracket reconstruction unchanged. It only rejects the simplest center-out stationary affine use of the 43 bracket values as a p55 key stream.

## TUNNELNG 55/56 authentic-transfer follow-up (Agent6)

The secondary alignment `TUNNELNG GP0=94 → p50 cell94 0u → base59/base60 = 55/56` now has its most direct adjacent-page receiver closed. The authentic solved-p56 prime/totient/F-transparent rule cannot decode original p55 in printed order: the exact inverse becomes impossible at zero-based rune39. Among eight predeclared source-layout orientations, only reversing each of p55's four printed lines admits any complete paths, but p57 does not select that reflection and all three surviving outputs are nonprose with first word `TTHO`.

This preserves the 55/56 page-pair alignment while excluding direct transfer of the genuine p56 cipher mechanism. See [the TUNNELNG transfer gate](lp2-p57-tunnelng-p55-p56-authentic-transfer-gate.md) and the existing [p56-rule p55 inverse](lp2-p55-fourline-mirror-p56-key-source-gate.md).

## TUNNELNG TO THE SURFACE pointer-path follow-up (Agent6)

The first p57 sentence now supplies a second source-internal navigation object. `TUNNELNG=94` selects p50 cell94, while `SURFACE=67` selects token `3C`, whose base59 value is **189**, the unique fixed point of the p50 base59 pointer map. Following base59 pointers from94 to189 visits exactly **19 cells**:

`94,55,79,81,57,116,53,168,236,234,193,153,33,112,72,161,214,247,189`.

Because p55 has **76=4×19** runes, Agent6 froze the cheapest direct consumer before scoring: visited-cell or emitted-pointer values mod29, repeated four times, with either additive sign. The best of four original outputs scores **-13.55240052**, fully **5.18748291** below the worst of 2,000 exact-word-shape native controls (**-8.36491761**); a source-shaped plant recovers76/76 at **-7.13590610**. This closes the direct periodic additive-key reading while preserving the phrase-selected pointer path ([gate](lp2-p57-tunnel-surface19-p55-gate.md), [SFT](../sims/lp2_p57_tunnel_surface19_p55_sft.cjs), [CI 44416665712](https://github.com/FlareZ123/liber-primus/actions/runs/44416665712)).

## Native-base60/base29 DH state register and zero-cycle handoff (Agent6, 19 November)

A stronger reading of the same frozen GP0→p50 grammar is now reproducible without changing the p57 word addresses. Decode each selected p50 token in the table's native base60 alphabet and divide the resulting integer by29:

```
value60 = 29 * high29 + low29.
```

The six-word tail gives:

| p57 word | GP0 | p50 | base60 | base29 pair |
|---|---:|---|---:|---|
| FIND | 42 | `0S` | 28 | `[0,28]` |
| THE | 20 | `1g` | 102 | `[3,15]` |
| DIUINITY | 105 | `13` | 63 | `[2,5]` |
| WITHIN | 38 | `2D` | 133 | `[4,17]` |
| AND | 56 | `4E` | 254 | `[8,22]` |
| EMERGE | 83 | `3D` | 193 | `[6,19]` |

Under the independently recovered p28 DH state these are exactly:

```
FIND      [0,-1]
THE       [e,b]
DIUINITY  [K,g]
WITHIN    [q,b+K]
AND       [A,p-1]
EMERGE    [a,B]
```

The four central state pairs recover `e=3,b=15,K=2,g=5,q=4,A=8,p=23,a=6,B=19` directly. The remaining pair checks and the DH equations all close:

```
g^a mod p = A
g^b mod p = B
B^a mod p = A^b mod p = K
b^-1 mod (p-1) = e
p-B = B-b = a-K = g-1 = q
```

This is broader than the tail. Every coordinate of all 19 body-word pairs lies in the same compact DH-derived vocabulary `{0,1,K,e,q,g,a,g+K,A,K*g,b,b+K,p-g,B,p-1,p,p+1,p+K,-e,-K,-1}`.

The same native-base60 map also turns several literal p57 meanings into exact graph links when the already recovered shared secret `K=2` is used as the hop count:

```
CIRCUMFERENCES 131 -> 120 PARABLE -> 42 FIND
WE              25 -> 198         -> 105 DIUINITY
DIUINITY        105 -> 63         -> 51 MUST
SURFACE          67 -> 192        -> 0
WITHIN            38 -> 133        -> 141
THE               20 -> 102 DEVOTED -> 32
```

The `WITHIN` endpoint 141 is exactly the start of the four-rune p0 receiver used by the existing WILL inverse. The `THE` path reproduces the independently source-selected p32 handoff. These observations were recognized after the receiver and p32 route were already known, so they are mechanism compression rather than blind plaintext predictions.

`SURFACE -> 192 -> 0` is especially useful because zero is the entry point of the established native-base60 p50 cycle:

```
0 -> 203 -> 68 -> 199 -> 47 -> 76 -> 114 -> 197 -> 115 -> 247 -> 192 -> 0
```

Dividing each emitted next state by29 gives:

```
[g+K,0]
[K,K*g]
[a,p+K]
[1,p-g]
[K,p-g]
[e,-K]
[a,p]
[e,-1]
[A,b]
[a,p-g]
[0,0]
```

so the whole authored zero-cycle is itself a DH-state register under the same serialization. This gives a source-coherent reading of p57's `SURFACE ... EMERGE` language: the solved prose enters and closes a p50 graph whose values repeatedly encode the same state.

A new SFT freezes the complete p57 body packet, direct state recovery, DH equations, the six exact `K=2` graph links above, the zero-cycle pairs, and the p0:141 receiver: `sims/lp2_p57_p50_dh_state_register_sft.cjs`. Windows Node22 run **44450264975** passes.

### Bounded p33 consumer negative

Agent50 independently selected the p33 first 81-rune black body from the p32 center. Because that body is 9×9 and the state has nine canonical fields `[p,g,a,b,A,B,K,e,q]`, the lowest-description direct additive consumer was charged in exactly two geometry-preserving orientations: the nine fields repeated across each row, or one field assigned per row, each under both additive signs. All four outputs remain unreadable; no phase, field permutation or tuned schedule was introduced. Keep the p33 receiver, retire this direct nine-field additive consumer.


## Decision

Promote the **p57 EMERGE/DIUINITY → p50 nested bracket** route as a leading intended-solve-path hypothesis. It explains how a player could be led to the nested prime-count structure from solved text, rather than merely recognizing the structure statistically.

The primary typed continuation is now **FIND → 28 → p27:28 DJU / BEI**, because p27 is independently selected by the historical `prime_echo` handoff. This replaces the older weak retrospective sum/difference coordinate support with an independent offset selector.

The page-number interpretation remains a secondary closed loop: p28 contains269 runes and the bracket-selected prime-count operation returns57. It is useful corroborative structure, though it is less tightly typed than the p27 receiver.

Neither continuation decrypts unknown runes. Further work should exploit the now-replicated GP0 word/table navigation grammar to select a reversible operation or a new untouched receiver.

The printed center `13` → red13 continuation is promising but still one inference short of authentication. The universal base59 attractor189 must not be counted as corroboration.

Reproducer: `sims/lp2_p57_divinity_p50_center13_bridge_sft.cjs`.
Windows Node22 passes: **44412420619** (initial center bridge), **44413029291** (global-attractor correction), **44414174775** (expanded EMERGE/DIUINITY reconstruction plus the frozen p57 word-chain), and **44415056582** (WITHIN edge plus FIND→p28→π(269)=57 closure).

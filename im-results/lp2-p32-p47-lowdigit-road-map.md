# p32–p47 low-digit road-map cross-link

**Status:** exact intermediate arithmetic with a newly source-selected p47 page cue from p50 cell115. The p32↔p47 navigation loop is reopened as a conditional route; no plaintext, key, or complete decipherment is recovered.

## Source-selected inputs

The p50 32×8 table is represented by 256 base-60 bytes in resources/liber-primus/lp2-grid-256.json. Define the low-digit transition

    T(x) = bytes[x] mod 60, for 0 <= x < 256.

The 2016 PGP-authenticated message supplies the vocabulary anchors ROAD/PATHS = GP0 54 and FOUND = GP0 36. The existing p28 low-digit report shows that these form the two-cycle 54 ↔ 36 under T. Across the full 256-state map, the cycles are fixed points 9 and 6 plus the two-cycle {54,36}; the latter has a 28-state basin.

Separately, the 2016 signed-message route report selects p32 through the EPIPHANY/SEEKS/THE/DEVOTED clause. The route from SEEKS=71 reaches p32 after 23 transitions, and p50[32]=115 enters the 11-cycle

    115 -> 247 -> 192 -> 0 -> 203 -> 68 -> 199 -> 47 -> 76 -> 114 -> 197 -> 115.

The original ink annotations record p32's red 13-dot punctuation at rune offset 121; p32 has 121 runes. They also record p55's red 13-dot punctuation at rune offset 76; p55 has 76 runes. Thus the selected p32 page and the later 11-cycle state 76 both coincide with the marked endpoints of original pages.

## Word-level low-digit map

Using the current canonical transcription, word boundaries are obtained by treating hyphens and periods as separators, removing slash line-wraps, ampersands, dollar markers and whitespace. For each word, compute GP0 as the sum of its rune indices. Follow T from that GP0 value and select the word exactly when its terminal cycle is {54,36}. The script sims/lp2_lowdigit_road_page_map.py reproduces the full page inventory and asserts the p32/p47 values below.

### p32

Six of 22 parsed words enter the ROAD/PATHS/FOUND cycle:

| 0-based word | Transliteration | Rune length | GP0 | GP-prime sum |
|---:|---|---:|---:|---:|
| 3 | WNGHWBMSOEEIIA | 11 | 171 | 613 |
| 7 | HOMEXWDSLFD | 11 | 150 | 540 |
| 12 | UBHEA | 4 | 54 | 196 |
| 13 | WNGUHEONGIAEAJ | 9 | 136 | 497 |
| 14 | SPTHT | 4 | 46 | 160 |
| 17 | EAROE | 3 | 54 | 203 |
| **Total** | | **42** | **611** | **2209** |

The aggregate identities are exact:

- Selected rune length: 42, equal to GP0(FIND); the existing low-digit route has T(42)=28, pointing to p28.
- Selected GP0 sum: 611 = 13 × 47.
- Selected GP-prime sum: 2209 = 47².

Across pages p0–p55 with runic text, p32 is the **only** page whose selected-word GP0 sum is 13m and selected-word GP-prime sum is m² for the same integer m in 0–55. Here m=47, independently naming p47. This is the strongest new cross-page signature. The factor 13 is consistent with p32's original 13-dot endpoint marker.

### p47

Eight of 59 parsed words enter the same cycle:

| 0-based word | Transliteration | Rune length | GP0 | GP-prime sum |
|---:|---|---:|---:|---:|
| 10 | IAYEOEIAGAEFNW | 11 | 166 | 626 |
| 21 | LTI | 3 | 46 | 163 |
| 22 | AEJE | 3 | 54 | 205 |
| 29 | AENG | 2 | 46 | 180 |
| 39 | HTH | 2 | 10 | 28 |
| 42 | EOBOEAE | 4 | 76 | 286 |
| 48 | LEOEA | 3 | 60 | 223 |
| 58 | AOAAE | 4 | 76 | 302 |
| **Total** | | **32** | **534** | **2013** |

The selected rune length 32 points back to p32. The selected GP-prime sum is exactly 2013, the year of Cicada's second public round (the first was in 2012). That historical-year match was observed after computing the selection and is therefore supporting context, not an independently pre-registered prediction.

## Interpretation and limits

The strongest provisional structure is a p32/p47 pair: the p32 selected-word sums independently point to 47 through both 13×47 and 47², while p47's selected-word rune length points back to 32. The p32 selected-word length 42 also meets the existing FIND -> p28 low-digit route. The 11-cycle's 47 and 76 states align with p47's page number and p55's marked 76-rune endpoint.

This is a navigation/readout hypothesis, not a cipher solution. The 54/36 cycle is source-anchored, but applying it to every page word and aggregating selected word lengths/sums is an inferred extension. The 28/256 basin and p32's 6/22 selected words are not, by themselves, decisive statistical evidence; the simple uniform-address binomial tail for at least six hits is about 0.027 before accounting for page-wide selection. The p47 printed-group segmentation has been independently adjudicated against original scan 64; the 59 groups and eight selected spans agree. See [source check](lp2-p43-p48-source-first-human-solve-path-gate.md#p47-original-image-word-boundary-adjudication). This establishes the printed groups, not their identity as plaintext words. The 2013-year match is post hoc.

Several direct key transfers have already failed: using the p50 11-cycle as an additive GP29 key on p55 (full 76 and inner 23), using the p47 selected 32-rune stream as an additive key on p32, concatenating the p32/p47 selected streams plus the two cycle states as a 76-symbol key for p55, and applying the p56 prime-totient clock to p47 from prime ordinals 47 or 115. None yielded plaintext. Do not repeat generic Vigenere/prime-totient variants without a new source instruction.

## Source-first decision after the independent cell115 selector

The earlier source-first audit correctly found that the p32/p47 arithmetic by itself did **not** tell a player to visit p47. Original p32 visibly has a blurred tree and a terminal red mark; original p47 sits inside the reused botanical frame. Neither image supplied a unique word selector or a visible p32→p47 arrow. The stronger artwork correspondence remains p32↔p55. Those source observations are unchanged.

A later, materially independent navigation chain now supplies the missing page cue.

### Independent route to p50 cell115

The authenticated 2016 clause **EPIPHANY SEEKS THE DEVOTED** had already selected physical p32 under a finite 560-case source family:

```
GP0(SEEKS)=71
follow canonical base60 byte pointers for DH p=23 steps
...
20 = GP0(THE)
102 = GP0(DEVOTED)
32 = physical p32
rune_count(p32)=121 = GP0(EPIPHANY)
```

The very next canonical byte-pointer step is fixed:

```
32 -> 115.
```

Independently, the p27 B/K receiver discovered later sheds to the eight-rune core `NSOOCAEY`. Its already-frozen H8 state packet, read as adjacent BASE29 pairs under the pre-existing zero-based mod256 address convention, starts four canonical byte-pointer trajectories at `[118,3,3,122]`. Their earliest joint node is again **115**, with first-arrival distances **[6,6,6,3]=[a,a,a,e]**. That exact node/distance signature occurs once among all 12,571 contiguous unknown eight-rune windows. The p27 core's GP-prime sum is `376=DIUINITY`; node `115` is `GP-prime(WITHIN)`.

Thus cell115 is now selected by two materially different routes: the authenticated signed-source p32 path and the p27 H8 terminal-state path.

### Cell115 supplies the previously missing p47 cue

Original cell115 prints the literal token:

```
47
```

The token `47` occurs twice in the whole 256-cell panel, at cells12 and115, so the glyph itself is not unique. The upstream pointer routes select **cell115 specifically** before its token is read.

Reading a two-digit table token as a physical page number remains a conditional semantic convention, but it is not new to this result: earlier p50 source-number work had already tested literal tokens such as `33`, `49`, and `00` as page/file-number pointers. Under that pre-existing convention, selected cell115 names **p47**.

This is exactly the page that the older low-digit aggregation had independently predicted from p32:

```
p32 selected GP0 sum       611 = 13 * 47
p32 selected GP-prime sum 2209 = 47^2
```

and p47 returns:

```
p47 selected rune length = 32.
```

The new table token therefore closes the previously underselected loop:

```
signed source -> p32 -> cell115 -> literal 47 -> p47
                                         |
p32 arithmetic --------------------------+
p47 ROAD/FOUND selection -> 32 ----------+
```

### Selected p47 page-local group47 visibly reconstructs the DH state

The literal cell115 token `47` has a natural page-local ordinal reading, but the transcription convention matters. Physical p47 shows **59 punctuation-delimited page-local groups/fragments**. Because the page begins and ends with words carried across page boundaries, only **57** are globally complete words. The literal ordinal selects:

```
p47 page-local group47
zero-based local index 46
rune offsets 206..211
GP0 indices [19,1,10,27,11,3]
transliteration MUIIAJO
```

This selected group is itself a complete word; in the global complete-word census it is **p47 complete word46**. The zero-based local-group rival (local group48) is the six-rune object at offset212 with GP0 sum89 and GP-prime sum326.

#### The printed line wrap is a direct four-field DH source

The selected group visibly crosses the original line9 -> line10 wrap after its first rune:

```
line9   [19]
line10  [1,10,27,11,3]
split   1 | 5
```

Without applying H or a cipher, the four source-visible quantities are:

```
total group length       6  = a
right-fragment length    5  = g
left singleton rune     19  = B
right-fragment GP0 sum  52 ≡ 23 mod29 = p
```

These four values reconstruct the complete DH register uniquely under the ordinary DH relations already present elsewhere in LP2:

```
p = 23
g = 5
a = 6
B = 19

b = unique x in 1..22 with 5^x mod23 = 19 = 15
A = 5^6 mod23 = 8
K = 19^6 mod23 = 2
  = 8^15 mod23
e = 15^-1 mod22 = 3
q = e+1 = 4
```

Thus this one source-selected, visibly wrapped ciphertext group reconstructs

```
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4).
```

This is materially simpler than recognizing a post-hoc algebraic role label in an H packet.

#### Manuscript-wide controls

Use the canonical cross-page parser so carried page fragments cannot be mistaken for complete words.

- Unknown p0-p55 contains **2,864 globally complete words**, of which **251** have length6.
- The selected group is the only complete word with `(length, raw GP0, GP-prime)=(6,71,256)`.
- Its canonical H6 `[16,19,12,8,12,22]` is also unique among the 251 complete six-rune words.
- There are **388 globally complete words that cross a printed line wrap**, including **58** six-rune crossings.
- The exact visible descriptor
  `(total length6, split1|5, left GP0=19, right GP0 mod29=23)`
  occurs **once**: p47 page-local group47 / complete word46 at offset206.

The local page-group census gives the same selected object: among 2,928 page-local groups/fragments, its `(6,71,256)` triple is unique. The distinction is now explicit rather than calling all page-local fragments “complete words.”

#### Independent numeric and H confirmations

The selected group also carries two untouched scalar checks:

```
raw GP0      71  = GP0(SEEKS)
GP-prime sum 256 = p50 table size
```

Its canonical H6 remains a useful independent checksum:

```
H6([19,1,10,27,11,3])
= [16,19,12,8,12,22]
= [K-b,B,aK,A,aK,p-1].
```

The word's zero-based rune start is **206**; original p50 cell206 is the table's unique literal token `27`, conditionally returning to the upstream p27 receiver.

The GP0=71 equality closes through the independently authenticated signed route:

```
71 = GP0(SEEKS)
71 -- canonical p50 byte walk, depth p=23 --> p32
p32 -> cell115 -> literal47 -> p47 local group47.
```

#### Immediate local group48: bounded negative plus unique H-difference

The immediately following page-local group48 is also six runes, fixing one same-length receiver. Repeating H6(group47) as a direct GP29 additive key fails both natural directions:

```
group48 GP0 indices = [15,12,25,12,21,4]

group48 - H6(group47) = [28,22,13,4,9,11]  -> EAOEPRNJ
group48 + H6(group47) = [ 2, 2, 8,20,4,26]  -> THTHHLRY
```

Retire that exact additive transfer; do not tune phase, sign schedules, or permutations.

The fixed H-domain comparison is still a structural holdout:

```
H(group47) - H(group48) mod29
= [5,28,28,0,8,3]
= [g,-1,-1,F,A,e].
```

Across the 19 adjacent **page-local** six-rune group pairs in unknown p0-p55, this exact ordered vector occurs once, at p47 group47 -> group48. This is state architecture, not plaintext.

#### P49 supplies a canonical base60 return to cell115

The selected group47 H6 packet also fixes a return through p49. Its three adjacent BASE29 pairs map under the pre-existing zero-based `mod256` address rule to tokens:

```
[16,19] -> 483 -> cell227 -> literal49
[12, 8] -> 356 -> cell100 -> 1N
[12,22] -> 370 -> cell114 -> 3H
```

Only the first canonical pair yields a literal legal LP2 page number.

On p49, the already frozen recursive-SHED complete-word operation yields centers `[20,19,19,14,4]`, count `g=5`, middle `B=19`, and GP0 sum76. Under canonical base60:

```
p50[76] = byte114
114 -> 197 -> 115   (exactly K=2 pointer edges)
cell115 -> literal47.
```

Across all physical p0-p55 pages, p49 is the only recursive-SHED page object whose center sum -> base60 byte -> K=2 pointer walk lands at115. Within p49, K=2 is the only reconstructed state depth that lands on any byte-sized solved-p57 word sum, and that hit is `115=GP-prime(WITHIN)`.

The resulting circuit is:

```
p27 receiver
 -> H8/p50 -> cell115/WITHIN -> literal47
 -> p47 local group47
      visible 1|5 wrap -> (B | g runes summing p)
      total length a -> full DH reconstruction
      GP0 71 = SEEKS
      prime sum256 = table size
      H6 unique state checksum
      start206 -> cell206 literal27
 -> H6 first pair -> literal49 -> p49
 -> recursive SHED -> byte114 -> K=2 -> cell115
 -> SEEKS route -> p32 -> cell115
```

This materially strengthens a human-facing navigation/state architecture. It does **not** establish plaintext for p47/p49 or revive previously failed generic decoders.

Reproducer for the line-wrap/state result: `sims/lp2_p47_group47_linewrap_dh_state_sft.cjs`.

### Rival controls

The canonical 11-cycle contains only three literal decimal tokens that are legal LP2 page numbers:

| selected cycle cell | literal token | target page | ROAD/FOUND-selected rune total |
|---:|---:|---:|---:|
| 203 | 18 | p18 | 29 |
| **115** | **47** | **p47** | **32** |
| 192 | 00 | p0 | 33 |

Only the selected `47` closes to p32 under the already frozen low-digit selector.

Across the entire table there are 42 literal decimal-page token occurrences. Across all p0-p55, the pages whose ROAD/FOUND-selected rune total is32 are `p7,p39,p47`. Of those, literal page tokens present in the panel are `39` (cells151,254) and `47` (cells12,115). This is why the claim is **selected-cell closure**, not global uniqueness of the numeral47 or of the return length32.

The older p32 dual-square census remains stronger and unchanged: p32 is the only page whose selected-word aggregates satisfy `GP0=13m` and `GP-prime=m^2` for the same page-number-range integer `m`, and that integer is47.

### Current decision

**Reopen the p32↔p47 structure as a conditional navigation loop.** The specific source-first objection that no independent cue selected p47 is now resolved by the independently reached cell115 literal `47`.

This does **not** revive the already failed p32/p47 additive, XOR, prime-totient, or p55 key-transfer consumers. It also does not authenticate the low-digit word selector as a cipher. The actionable consequence is narrower: p47 is again a justified receiver for a **new, source-selected operation**. Future work should seek a player-visible p47 operand or an untouched prediction that uses this page selection; do not repeat the retired generic decoder families.

Cross-route reproducer: `sims/lp2_p27_within_cell115_p47_reopen_sft.cjs`.

## Reproduction

Run from the repository root:

    python3 sims/lp2_lowdigit_road_page_map.py

The script reads only the original transcription, the current GP29 corpus and the p50 base-60 byte table. It prints per-page selected-word aggregates, the low-digit cycle basins, the p32/p47 selected words and the unique dual-square signature.

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

### The selected p47 word47 is a held-out DH-state navigation packet

The literal page token has a second natural ordinal reading because p47 has 59 printed groups. Charge the two ordinary origins before inspecting any rune transformation:

| interpretation of literal `47` | selected group | length | raw GP0 | GP-prime sum |
|---|---|---:|---:|---:|
| **one-based word47** | p47 index46, offset206 | **6** | **71** | **256** |
| zero-based word47 | p47 index47, offset212 | 6 | 89 | 326 |

The one-based group is source ciphertext `MUIIAJO` under GP transliteration. Its three untouched numeric metrics are independently meaningful:

```
length       6   = DH a
raw GP0      71  = GP0(SEEKS)
GP-prime sum 256 = number of p50 table cells
```

Across all **2,928 complete words** on unknown p0-p55, this exact `(length,GP0,prime)=(6,71,256)` triple occurs **once**, at this selected p47 word. There are only six words with prime sum256 at all; their raw GP0 values are 69,70,68,66,**71**,69.

The GP0 value closes directly onto the already authenticated signed navigation route:

```
p47 word47 GP0 = 71 = SEEKS
71 -- canonical p50 byte walk, DH p=23 --> p32
p32 -> cell115 -> literal 47 -> p47 word47
```

The word's source position supplies a second conditional return. Its zero-based rune start is **206**. Original p50 **cell206 is the unique literal token `27`** in the entire 256-cell table. Thus the same selected word conditionally points back to the upstream p27 receiver if original rune offsets are reused as table addresses. Twelve manuscript words happen to begin at offset206, so the offset alone is not selective; the selected p47 word is uniquely fixed by the `(6,71,256)` triple and by the preceding cell115 page/ordinal cue.

Most importantly, apply the same canonical outside-in H transform that was already fixed by the p27 receiver:

```
p47 word47 GP0 indices
[19,1,10,27,11,3]

H6
[16,19,12,8,12,22]
= [K-b, B, aK, A, aK, p-1].
```

This exact six-coordinate H output occurs **once among all 252 complete six-rune words** on unknown p0-p55: the selected p47 word47. The zero-based p47 word47 rival instead gives `[11,20,13,8,4,19]`.

This is a genuine held-out rune-level prediction in the navigation branch: page and word were fixed by independent table routing before H inspected their symbols. It still does not decrypt the word into prose; it shows that the selected ciphertext group itself re-emits the same DH register.

A final supporting table closure uses no new arithmetic family. Pair the H6 output adjacently as BASE29, reuse the already frozen zero-based mod256 table address rule, and inspect the first canonical pair:

```
[K-b,B] = [16,19] -> BASE29 integer 483 -> cell227 -> literal token 49.
```

Physical p49 is the opening page of the 256-cell numerical panel. Cell227/token49 was independently present in earlier source-number work, so this is supporting convergence rather than a new operation selector.

The strongest current circuit is therefore:

```
p27 B/K receiver
  -> H8/table convergence cell115 = WITHIN
  -> literal 47
  -> p47 one-based word47
       length6 = a
       GP0 71 = SEEKS
       prime sum256 = table size
       H6 = [K-b,B,aK,A,aK,p-1]
       start206 -> cell206 literal27
  -> SEEKS route returns p32
  -> p32 -> cell115
```

The loop materially strengthens navigation and the repeated-H state architecture. It does **not** revive previously failed p32/p47 decoder families or establish that these selected ciphertext groups are plaintext.

#### Immediate same-length neighbor: bounded negative plus unique H-difference

The selected one-based word47 is immediately followed by another six-rune word, so one direct receiver is fixed without a phase or span choice. Using the selected word47 H6 packet as a six-rune GP29 additive key on word48 fails both natural directions:

```
word48 GP0 indices = [15,12,25,12,21,4]

word48 - H6(word47) = [28,22,13,4,9,11]  -> EAOEPRNJ
word48 + H6(word47) = [ 2, 2, 8,20,4,26]  -> THTHHLRY
```

Neither readout is source-native prose. Retire this exact direct additive transfer; do not tune phase, sign schedules, or permutations.

The same fixed neighbor does, however, supply a structural holdout under the already canonical H transform:

```
H(word47) = [16,19,12,8,12,22]
H(word48) = [11,20,13,8, 4,19]

H(word47) - H(word48) mod29
          = [5,28,28,0,8,3]
          = [g,-1,-1,F,A,e].
```

There are only **19** adjacent complete-word pairs in unknown p0-p55 where both words have length6. Charging this exact ordered H-difference over all 19 leaves **one** hit: p47 word47 -> word48. This remains a state-architecture checksum, not plaintext recovery.

#### P49 supplies a canonical base60 return to cell115

The selected p47 word47 H6 packet also fixes a return through p49 without reviving the old base59 fork. Its first adjacent BASE29 pair `[K-b,B]=[16,19]` gives integer483, zero-based `mod256` address227, whose original literal token is **`49`**.

On p49, the already frozen recursive-SHED complete-word operation yields centers `[20,19,19,14,4]`, count `g=5`, middle `B=19`, and GP0 sum76. Under canonical base60, p50 cell76 is byte114; advancing the established byte pointer for exactly `K=2` edges gives

```
114 -> 197 -> 115 -> literal47.
```

Across all physical p0-p55 pages, p49 is the **only** recursive-SHED page object whose center sum, base60 byte lookup, and K=2 pointer walk lands at115. P55, the only other five-core page, lands at46.

This closes a p47 -> p49 -> cell115 -> p47 loop under the leading radix. The older conditional base59 p49 output `DIRECTION` remains reproducible but is no longer needed for the continuation.

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

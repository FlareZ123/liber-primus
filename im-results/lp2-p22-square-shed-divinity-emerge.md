# Source-linked p22 square literally executes SHED CIRCUMFERENCES -> DIVINITY WITHIN -> EMERGE

**Agent49, 19 November 2026. Classification: source-constrained structural mechanism with a reproduced finite rival family. No unknown LP2 plaintext is claimed.**


## Radix reconciliation

**Radix reconciliation (Critic, 19 November):** The original p50 images provide no explicit digit legend or byte serialization (#1890). The authenticated 2013 `THE KEY IS ALL AROUND YOU` clue supplies a source-conditioned discriminator: its complete GP0 value fixes cell252, an outer-ring cell; base60 `30→180` matches both the 180-cell interior and the p56+p57 rune total, while base59 gives177 ([report](../im-results/lp2-2013-all-around-p50-p53-receiver.md)). This makes base60 the leading source-selected interpretation, but not a literal byte legend. Base59-only results below remain conditional and, where they imply DIRECTION/CIRCUMFERENCES/EMERGE, conflict with the leading base60 reading until independently reconciled.
## Route into the object

The p55 recursive-SHED receiver now gives:

```text
p55 cores [1,6,2,11,18]
 -> GP0 38
 -> p50[38]=2D
 -> conditional base59 131 = CIRCUMFERENCES
 -> unique 131-rune page p22
```

P22 independently carries a mirrored reuse of the original LP1 p14-p16 illustration sequence. The original source pages visibly provide:

```text
VOICE OF THE CIRCUMFERENCE
DISCOVER TRUTH INSIDE YOURSELF
KNOW THIS
```

followed by the original 5x5 integer square:

```text
434   1311  312   278   966
204    812  934   280  1071
626    620  809   620   626
1071   280  934   812   204
966    278  312  1311   434
```

Every row, column and main diagonal sums to 3301.

Solved p57 independently commands:

```text
WE MUST SHED OUR OWN CIRCUMFERENCES
FIND THE DIVINITY WITHIN AND EMERGE
```

The new p55->p22 handoff supplies a direct reason to apply that literal instruction to this already source-linked square.

## Literal operation

Recursively remove the current square's circumference.

For the 5x5 square:

```text
5x5
 -> shed outer 16 cells
 -> 3x3
 -> shed outer 8 cells
 -> 1x1
 -> 809
```

There is no starting corner, traversal direction, phase or cipher key to choose. Any circumference removal leaves the same center.

The center **809 is the only prime-valued cell among all 25 cells**.

Thus the source wording has a literal structural reading:

```text
SHED ... CIRCUMFERENCES
 -> recursively remove square borders

FIND THE DIVINITY WITHIN
 -> center 809, the square's sole prime cell
```

The interpretation of prime as the relevant "divinity" is supported by Cicada's pervasive prime-number machinery, while the stronger evidence is the next exact table consequence.

## EMERGE consequence

The p50 object has 256 cells and the established navigation origin is zero-based. Reduce the emerged integer to the table:

```text
809 mod 256 = 41
p50[41] = 1O
conditional base59(1O) = 83
GP0(EMERGE) = 83
```

So the literal center selected before the table read returns the final word of the solved instruction:

```text
... FIND THE DIVINITY WITHIN AND EMERGE
                              809 -> EMERGE
```

This exact `809 -> 41 -> 1O -> 83 -> EMERGE` route was not present in earlier repository commits; searches for `809 EMERGE` and `809 mod256` were empty before this result.

## Circumference checksum under the same fixed state

Use the same zero-based modulo256 address and the same conditional post-SHED base59 interpretation on all 25 source-square cells.

Exactly three cell positions land on solved-p57 GP0 words:

```text
row1 col2   1311 mod256=31 -> p50[31]=2D -> base59 131 = CIRCUMFERENCES
row3 col3    809 mod256=41 -> p50[41]=1O -> base59  83 = EMERGE
row5 col4   1311 mod256=31 -> p50[31]=2D -> base59 131 = CIRCUMFERENCES
```

The two `1311` cells are 180-degree symmetric and both lie on the outer circumference. The center is the unique non-circumference hit.

So the conditional base59 square read has the exact topology:

```text
outer circumference -> CIRCUMFERENCES
center               -> EMERGE
```

No inner 3x3 non-center cell maps to a solved-p57 word under this fixed read.

## Radix rival preserved

Base60 is a real upstream rival and is not hidden.

Under zero-based modulo256 with base60, the solved-p57 hits are the two symmetric outer `966` cells:

```text
966 mod256=198
p50[198]=1j
base60(1j)=105=GP0(DIVINITY)
```

Those are at row1 col5 and row5 col1.

The current report holds base59 fixed because the upstream p55/p49 work used that branch before this square was examined. That chronology prevents local radix switching, but it does not authenticate base59: the 2013 ALL AROUND selector favors base60, under which the symmetric outer cells return DIVINITY. All base59 EMERGE/CIRCUMFERENCES outputs here remain conditional; base60 is the leading source-conditioned alternative.

## Authenticated three-square holdout and NUMBERS cross-register hit

The original 2014 submission stage supplied exactly three authenticated squares. Apply the same orientation-free circumference shedding to all three, then the same zero-based modulo256/conditional-base59 consumer:

```text
5x5, sum3301 -> center809 -> address41 -> 1O -> 83
7x7, sum1033 -> center331 -> address75 -> 2v -> 174
5x5, sum1033 -> center 91 -> address91 -> 0n -> 48
```

The two untouched 1033-square controls hit neither the solved-p57 GP0 register nor the authenticated signed-2016 word GP0 register.

The p22-linked 3301-square center is the sole typed center. Its output83 has a stronger cross-register identity:

```text
GP0(EMERGE)  = 83   // solved p57
GP0(NUMBERS) = 83   // authenticated 2016
```

The signed source says:

```text
their numbers are the direction
```

Across the complete solved-p57 and signed-2016 word registers, only four GP0 values are shared:

```text
20 : THE / THE
25 : WE / IS
56 : AND / MAP,AND,SEEK
83 : EMERGE / NUMBERS
```

The value83 is therefore a source-authored collision between two semantically relevant words, rather than a generic common function word.

This does not prove that every p57/signed GP0 collision is intentional. It strengthens the specific square route because the p22-linked center was selected structurally before its table output was compared with either lexical register, while the two authenticated square controls miss both.

Windows holdout PASS: `44473196144`.

## Mirrored BASE29 center emits NUMBERS ARE and enters the existing ARE27 bridge

The emerged center has a second direct source-register reading that does not use p50:

```text
809 in canonical BASE29 = [27,26]
p22 reuses the source illustration in mirrored form
mirror the digit order     = [26,27]

signed-source index26 = NUMBERS
signed-source index27 = ARE
```

This representation is sharply selected. Charge every integer radix from 2 through43, the full size of the authenticated signed-word register. Require the mirrored digits of 809 to form an ascending consecutive source-index run. **Base29 is the sole hit**, with `[26,27]`. Under the same BASE29 rule across all25 cells of the source 5x5 square, **809 is also the sole cell** whose complete mirrored digit list is an ascending consecutive run.

The two untouched authenticated 2014 square centers provide a stronger same-operation holdout. Charge every radix2..809 and all eight whole-pair mirror masks across centers `[809,331,91]`; require each center to become a forward unit-step pair of valid signed-source indices. Exactly one of **6,464** configurations survives: **base29, reversing only809**. The three reads are `809 -> [26,27] = NUMBERS ARE`, `331 -> [11,12] = IS THE`, and `91 -> [3,4] = LIES EMPTY`. Even without orientation, base29 is the sole radix making all three raw center pairs adjacent source indices. The winning reversal mask independently matches the visible p22 mirror on the reused 809 square. This turns the two other authenticated centers into held-out controls for the radix/register interpretation. [Three-square report](lp2-three-square-centers-base29-source-pairs.md) · [SFT](../sims/lp2_three_square_centers_base29_source_pairs_sft.cjs) · Windows Node22 PASS `44474459983`.

A later full-cell scan preserves that chronology and supplies a second holdout. With BASE29 already fixed by the centers, non-center source cells `121=[4,5]`, `151=[5,6]`, and `181=[6,7]` extend center91 `[3,4]` into the exact overlapping signed-source chain **LIES EMPTY EPIPHANY SEEKS THE**. Across every radix2..1311, base29 alone has a forward-adjacent square-cell start run of length4; every other radix tops out at length2. In particular, literal square value **151 independently selects `[5,6]=EPIPHANY SEEKS`** without using the p22 route or p0 ciphertext. The next chain value211 is absent from the source squares and fails the direct pp49-51 cell receiver, so the chain is stopped there. [Full-cell report](lp2-square-cells-base29-source-chain.md) · [SFT](../sims/lp2_square_cells_base29_source_chain_sft.cjs) · Windows Node22 PASS `44475812105`. The two source squares sharing magic sum1033 also order this chain spatially: 91 is radius0 at the 5x5 center, 121 occupies radius1 in the 7x7, 151 occupies radius2 corners of the 5x5, and 181 occupies radius3 corners of the 7x7. Charging every radix2..456 and every valid signed-source start leaves exactly one radius0→3 forward-adjacency chain, BASE29 start3. The geometry therefore orders `LIES EMPTY EPIPHANY SEEKS THE` center-out. Solved p57's `EMERGE` is a plausible human instruction for this outward traversal, while the exhaustive geometry result does not depend on that intent reading. [1033 center-out report](lp2-1033-squares-base29-emerge-chain.md) · [SFT](../sims/lp2_1033_squares_base29_emerge_chain_sft.cjs) · Windows Node22 PASS `44476497378`.

The output therefore reads the authenticated clause fragment:

```text
NUMBERS ARE
```

Those two source numbers have an already established consumer. Under the canonical page/word direction rule:

```text
NUMBERS26 -> physical p26, canonical word27
          -> raw [2,6,11]
          -> Hpair [20,13,6]
          -> MEANING WAY SEEKS

ARE27     -> physical p27, canonical word28
          -> raw [0,20,15,1]
          -> one literal shed -> [20,15]
          -> H2 [5,6]
          -> EPIPHANY SEEKS
```

The p27 result predates this center reading. The new evidence supplies a source-selected **upstream entry** into that route. It does not claim discovery of the ARE27 transform itself.

The ordered pair `[5,6]` is robust to the two live four-rune H serializations. Hpair gives `[28,1,5,6]`; Hsplit gives `[28,5,6,1]`. Across the numbered source objects, each serialization has exactly one adjacent `[5,6]` hit, this ARE27 receiver. The authenticated words at indices5 and6 are `EPIPHANY SEEKS`, the sole adjacent signed-source pair with native GP lengths8+5, matching the physical p0 red-title shape without consulting its 13 ciphertext values.

This creates a compact human-facing chain:

```text
p55 CIRCUMFERENCES -> p22
 -> shed the mirrored source square
 -> center809
 -> mirrored BASE29 [26,27]
 -> NUMBERS ARE
 -> ARE27 numbered direction
 -> shed + H
 -> [5,6]
 -> EPIPHANY SEEKS
```

It strengthens the source selection of the p0 phrase. The 13-atom additive key ordering on p0 remains a separate unresolved provenance question.

Reproducer: `sims/lp2_p22_809_numbers_are_epiphany_seeks_sft.cjs`. Windows Node22 PASS: `44473420144`.

## Center rival family

For the center, charge four source-native numerical representations:

```text
raw center       809
phi(center)      808
prime ordinal1   140
prime ordinal0   139
```

For each, charge zero/one address origin and base59/base60 output, for 16 configurations.

Only one configuration reaches any solved-p57 word:

```text
raw809
zero-based mod256 address41
base59
 -> EMERGE
```

All 15 alternatives miss the complete p57 GP0 register.

## Exact token-multiset control

The two decisive fixed addresses require token classes:

```text
address31 -> 2D -> CIRCUMFERENCES
address41 -> 1O -> EMERGE
```

In the exact 256-cell table multiset:

```text
2D occurs 2 times
1O occurs 3 times
```

Under a uniform permutation preserving the exact token multiset, the probability of these two preselected distinct addresses receiving those exact token classes is:

```text
(2/256) * (3/255) = 1/10880
```

This is a supporting fixed-address null, not a standalone proof.

## Independent 809 echo

An older p7 investigation, committed 14 November before this route, had already isolated source-linked prime **761** and a visible five-step clue. In the ordinary prime sequence:

```text
761 is prime #135
809 is prime #140

five successors after 761:
769, 773, 787, 797, 809
```

That older work correctly rejected direct p56-style prime-totient cipher starts from these values. The negative remains valid.

The newly selected integer also licenses one narrow historical-byte check that earlier audio work could not preselect: keep the authentic 2013 raw-file XOR primitive and byte-native p50 receiver, and start the original `761.MP3` pad at byte809. The frozen output is random-like: first16 `cbe7a7ba61ed7eb75cf99cdef704b7d4`, printable ratio0.3828, entropy7.2966 bits/byte, with no recognized leading file magic. Windows run `44472593829` passes. This closes that exact offset809 consumer without reopening arbitrary audio offsets.

The new square mechanism supplies an independent literal route to **809** and preserves the older cipher negatives. The two paths converge on the same prime object.

## Relation to the older p22 square negative

Director #1080's 15 November p22 test used one hypothesized clockwise outer-in ordering of all 25 square numbers as a repeating additive GP29 key. It failed language tests and was retired.

Its report explicitly identified the missing premise: no first-party instruction selected the proposed square consumer.

The present result does not rescue that cipher. It supplies a different, literal consumer that is now source-selected by:

1. p55 `CIRCUMFERENCES=131` routing to p22;
2. the p22-linked LP1 source's own circumference/inside wording;
3. solved p57's explicit `SHED ... CIRCUMFERENCES / FIND ... WITHIN / EMERGE` instruction.

The old additive-key inverse stays negative.

## Audited downstream consumer: EMERGE returns to SURFACE

The square result now has a pre-existing same-type consumer that was established before this square route.

The independently audited zero-based GP0 address primitive places:

```text
PILGRIM   82 -> p50[82]  = 3L
EMERGE    83 -> p50[83]  = 3D
DIVINITY 105 -> p50[105] = 13
             -> exact shared midpoint

p50[127] = 3D
p50[128] = 3L
```

Thus the new square-derived `EMERGE=83` enters an already familywise-audited nested bracket centered on `DIVINITY=105`.

A second frozen operation gives an independent continuation. `GP-prime(EMERGE)=300`, so the visible 256-cell table starts at44. Following the fixed base59 pointer map for exactly EMERGE's six runes gives:

```text
44 -> 226 -> 72 -> 161 -> 214 -> 247 -> 189
```

Cell189 is token `3C` and is a base59 fixed point. The seven visited columns are:

```text
[4,2,0,1,6,7,5]
```

so the unique missing table column is3. The complete `3C` class occurs at addresses `67,162,189,247`; address67 is the only same-token copy in missing column3, and:

```text
GP0(SURFACE) = 67
```

Recharging the complete 20-word solved-p57 family under this unchanged rule leaves exactly one completion:

```text
EMERGE -> fixed 3C at189 -> missing-column copy67 -> SURFACE
```

This supplies a source-constrained continuation of the new square result:

```text
square center809 -> EMERGE83 -> SURFACE67
```

It also restores the parable's literal motion: after finding the divinity within and emerging, the route returns to the named `SURFACE`.

The later interpretation that SURFACE restores base60 and exits through192 to p0 is **not** promoted here. It remains conditional because no first-party sentence explicitly states that numeral-state restoration.

Reproduction:

```text
node sims/lp2_p22_square_emerge_surface_bridge_sft.cjs
Windows PASS 44472446748
```

## Interpretation

This is a plausible intended human solve step because every major action is visible and motivated:

```text
p55 says CIRCUMFERENCES and selects p22
 -> p22's mirrored art points to LP1 p14-p16
 -> source says CIRCUMFERENCE / INSIDE / KNOW THIS
 -> p57 says SHED CIRCUMFERENCES, FIND DIVINITY WITHIN, EMERGE
 -> peel square borders
 -> sole-prime center809
 -> p50 mod256/base59
 -> EMERGE
 -> mirrored BASE29
 -> NUMBERS ARE
 -> existing ARE27 route
 -> EPIPHANY SEEKS
```

It recovers an authentic instruction-state transition and a concrete source-derived prime **809**. The new BASE29 branch independently routes to the leading p0 phrase candidate without opening p0 ciphertext values. Continuous unknown-page prose and the p0 key serialization remain unresolved.

## Reproduction

```text
node sims/lp2_p22_square_shed_divinity_emerge_sft.cjs
```

Windows GitHub Actions:

```text
run 44471959972
windows-latest
Node 22
PASS
```

Supporting commits:

```text
601ae88e31d61fc23a6c6693c4a9790d103571ad  initial SFT
14b3ebc4021b38789b1fb713de8fd365ab6d405f  workflow
bce2850b3af477ff4227c837b89bb403a97853e1  exact token-null control
```

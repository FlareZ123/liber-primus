# P50 prime-rank geometry reconstructs the signed MAP/ROAD clause and BEWARE FALSE PATHS

**Agent10, 28 November 2026. Classification: new source-exact structural warning / map-recognition candidate; no unknown LP2 plaintext, key, cipher inverse or destination.** This audit opens a consequence of the already documented signed-2016 PATH route without changing its coordinates: PATH selects p39, p39 supplies `SW`, p50[39]=`05` supplies five southwest steps to cell74, p50[74] interpreted in base60 supplies 205, and prime rank205 selects the authentic first p57 clause, **LIKE THE INSTAR TUNNELING TO THE SURFACE**. The prior report then projected straight upward from cell74=(row9,col2) to surface cell2=(row0,col2). This invocation inspected that already selected physical column before choosing any new receiver.

## Frozen consequence of the existing SURFACE projection

Read the literal column2 tunnel from the surface toward the established endpoint:

```text
cells  2, 10, 18, 26, 34, 42, 50, 58, 66, 74
tokens 2l,2a,0F,2r,3H,0S,0l,2Q,0P,3P
B60    167,156,15,173,197,28,47,146,25,205
```

The first two prime-valued cells encountered from the surface are:

```text
cell2  = 2l = 167 = the 39th ordinary prime
cell26 = 2r = 173 = the 40th ordinary prime
```

The authenticated 2016 source register already uses zero-based word indices elsewhere in the current p28/p29 route. Under that exact convention:

```text
source[39] = FALSE
source[40] = PATHS
```

so the frozen tunnel begins **FALSE PATHS**. This is not a decryption of p50; it is a typed readout of two source-visible prime-valued table cells under the same base60/ordinary-prime machinery already used by the PATH route.

The older endpoint-only observation `cell2=167 -> 39 -> PATH` therefore omitted a more discriminating consequence of opening the selected tunnel. Treat the closed PATH loop as, at minimum, a possible recognition/warning circuit rather than evidence that PATH itself names the next ciphertext decoder.

## Full physical-line census

To avoid selecting the two attractive tunnel cells after seeing them, enumerate the entire printed 32×8 p50 field. For every physical row and column, scan both directions, keep only base60 values that are ordinary primes with ranks <=42, and record adjacent entries in that prime-valued subsequence whose ranks increase by exactly one.

There are exactly three such base60 edges:

| Physical line | Cells | Values | Prime ranks | Zero-based authenticated words |
| --- | --- | --- | --- | --- |
| column2 downward | 2 -> 26 | 167 -> 173 | **39 -> 40** | **FALSE -> PATHS** |
| column3 upward | 219 -> 211 | 59 -> 61 | **17 -> 18** | **THE -> MAP** |
| column6 downward | 126 -> 182 | 163 -> 167 | **38 -> 39** | **BEWARE -> FALSE** |

The two warning edges join through the duplicated original token/value `2l=167`: cell182 terminates **BEWARE -> FALSE**, while cell2 begins **FALSE -> PATHS**. At the rank graph level, p50 therefore contains the only two-edge consecutive chain:

```text
38 -> 39 -> 40
BEWARE FALSE PATHS
```

The other edge is independently notable because it reads **THE MAP**, exactly the noun phrase used by the signed source: “Its words are the map.” This full-field enumeration was fixed before interpreting any additional token and contains no language-scored row/column choice.

## Stricter adjacent-cell dual-radix recognition

The warning-chain census above deliberately treats composites as transparent within a physical line. A stricter family asks for **immediately adjacent printed cells** whose decoded values are ordinary primes of consecutive rank.

The radix choices are not symmetric free parameters. The printed p50 alphabet has 60 glyphs, but across all 512 token characters exactly one alphabet glyph is unused: lowercase `f`. Deleting that one absent glyph gives the live 59-symbol codec uniquely; there is no choice of which visible digit to drop.

Under the full base60 alphabet, there is exactly **one** physically adjacent consecutive-prime-rank pair anywhere in all 472 undirected grid adjacencies:

```text
cell219 (row27,col3) = 0x = 59 = prime#17
   north one cell
cell211 (row26,col3) = 11 = 61 = prime#18
source[17..18] = THE MAP
```

Under the uniquely source-visible base59 codec there are two such adjacent pairs globally, but only one lies inside the authenticated 43-word register:

```text
cell40 (row5,col0) = 1K = 79 = prime#22
   east one cell
cell41 (row5,col1) = 1O = 83 = prime#23
source[22..23] = THE ROAD
```

The other base59 adjacency is prime ranks49→50, outside the signed register. Thus the strict source-range family selects **THE MAP** in base60 and **THE ROAD** in base59, exactly the two named objects in the signed instruction.

Those two physical support lines are orthogonal. The MAP pair fixes column3; the ROAD pair fixes row5. Their unique intersection is **cell43**, whose original token is `1D`; under base60 it is 73, the **21st prime**, and `source[21] = IS`. The geometry therefore supplies the exact signed-register backbone:

```text
THE MAP  ...  IS  THE ROAD
17  18        21  22  23
```

The omitted source words are indices19–20, **THEIR MEANING**. The first is a cell readout: the cell immediately north after MAP, cell203 at row25/column3, is 67=prime#19 under base59 and therefore reads **THEIR**.

The second is supplied by the already fixed geometry rather than another token. MAP's strict adjacency points **north**. Continue on that same MAP support column from THEIR at row25 until the ROAD support line at row5, whose crossing cell is already fixed as **IS**. The traversal is exactly **20 northward edges**. Under the same zero-based authenticated source register used by all prime-rank labels, `source[20] = MEANING`. No cell on this segment has prime rank20 under either base60 or base59; in fact value71 has no base60 occurrence anywhere in the table and its two base59 occurrences are off this support line. The missing word is therefore a distance readout, not a hidden alternate-radix cell.

This gives one contiguous reconstruction with a single frozen physical line and no turn, wrap or third codec:

```text
row27 col3: base60 prime#17 -> THE
   north one edge
row26 col3: base60 prime#18 -> MAP
   north one edge
row25 col3: base59  prime#19 -> THEIR
   north 20 edges to the ROAD support line -> source[20] = MEANING
row05 col3: base60 prime#21 -> IS
row05 col0: base59  prime#22 -> THE
   east one edge
row05 col1: base59  prime#23 -> ROAD
```

Thus the exact signed-source interval **17..23** is recovered as **THE MAP THEIR MEANING IS THE ROAD**. The three vertical source anchors also expose the same fixed distance grammar without selecting the target word after the fact: rank17 at row27 is 22 edges from the ROAD line and `source[22]=THE`; rank18 at row26 is21 edges away and `source[21]=IS`; rank19 at row25 is20 edges away and `source[20]=MEANING`. These are structural source-register relations, not unknown LP2 plaintext.

There is one further source-exact cell on the same frozen support. The cell immediately north of THEIR is cell195 at row24/column3, token `1T`; under base60 it is **89 = prime#24**, hence `source[24] = AND`. It is the unique base60 rank24 occurrence in the table. The MAP support therefore contains direct labels **THE / MAP / THEIR / AND** in four consecutive rows, while its 20-edge relation to the ROAD support supplies the intervening **MEANING / IS / THE / ROAD** structure. Physical encounter order is not claimed to be sentence order: AND lies at the first edge of the 20-edge segment, and its source rank24 places it after ROAD in the authenticated register. The stronger fact is that the fixed geometry now contains every source index **17 through24** without inventing another radix, turn or cell.

A finite follow-up also combines the observed physical directions (MAP points north; ROAD points east) into a northeast ray from the `IS` intersection. That ray does not produce a consecutive signed-register instruction under either codec. Treat N/E as geometry selected by the signed-word reconstruction, not a general eight-direction byte opcode.

This result changes the local radix interpretation: inside this exact adjacency/prime-rank family, base60 and the uniquely absent-`f` base59 reading look **complementary** rather than one simply defeating the other. Do not generalize that dual-radix conclusion to unrelated p50 branches without an equally source-constrained discriminator.

## DIRECTION bridge into the existing p29 numbered packet

Two further finite checks make the map/road geometry operationally relevant without turning it into a plaintext claim.

First, the selected MAP/ROAD intersection token has a second source-native numeric reading. Cell43 is `1D`: base60 gives 73 = prime#21 = **IS**, while ordinary hexadecimal gives `0x1D=29`. Hexadecimal is independently present in the same authenticated 2016 message through the OpenPGP key ID `7A35090F`; zero-based source index29 is **DIRECTION**. The token `1D` occurs four times in p50, so this dual reading is not unique by token value; the map/road geometry is what selects cell43.

Second, enumerate every p50 token whose values under the two source-visible radices are both ordinary primes with authenticated source ranks below43 and whose ranks differ by exactly one. There are exactly **two**:

| Cell | Token | base59 | source | base60 | source |
| ---: | --- | ---: | --- | ---: | --- |
| **24** | `1n` | 107 = prime#28 | **THE** | 109 = prime#29 | **DIRECTION** |
| 223 | `2V` | 149 = prime#35 | FOUND | 151 = prime#36 | GOOD |

The second token does not continue to LUCK by an adjacent cell under either radix, so no phrase is extended there. Cell24 is different, and the completed MAP support now supplies an independent reason to select it: cell195 on that already fixed support is `89 = prime#24 = AND`. The authenticated instruction immediately continues “AND THEIR NUMBERS ARE THE DIRECTION.” Taking the recovered prime rank/word number **24** literally as the next p50 address — the same GP/word-number-to-table-address primitive used by established navigation routes — lands on `p50[24]=1n`, the unique signed-range address whose two live radices form the consecutive pair **THE / DIRECTION**:

```text
fixed MAP support cell195 = 1T
  base60 89 = prime#24           -> AND
  recovered number 24            -> p50 address24
p50[24] = 1n:
  base59 107 = prime#28           -> THE
  base60 109 = prime#29           -> DIRECTION
```

This is stronger than selecting cell24 merely because its cell index can itself be read as source index24. Across **every signed-range prime hit on the complete THEIR→ROAD support segment**, rank24 is the only recovered rank whose same-number table dereference lands on a dual-radix consecutive signed pair. Globally there are only two such dual-radix consecutive tokens, at addresses24 and223; only 24 is itself an authenticated source index. The p28 fixed structural readout **THEIR NUMBERS ARE THE** remains an independent corroborating scaffold, but it is no longer needed to choose address24.

The literal continuation is therefore a compact candidate handoff: **AND24 → address24 → THE/DIRECTION29**. It operationalizes “their numbers are the direction” more directly than the earlier cell-index observation. It still does not prove that every prime rank should be recursively dereferenced; the uniqueness statement is restricted to the already selected MAP/ROAD segment and the authenticated signed register.

The same zero-based 29 now gives a cleaner selector for the already documented p29 packet: **DIRECTION = source[29] -> project p29 -> canonical zero-based word index29** (one-based word30). That object is p29 offsets108..111 `[11,26,11,18]`, whose fixed H4 is `[22,15,8,0]`. The immediately preceding zero-based word28, offsets106..107 `[8,15]`, has H2 `[22,23]` = **THE ROAD**. This exact phrase independently equals the strict base59 p50 adjacency above.

This does not make DIRECTION p28 plaintext and does not recover any unknown body text. It removes one awkward mixed-origin step from the conditional navigation scaffold: source index29, project page29 and the selected canonical word index29 now share the same zero-based number. The pre-existing p29 H2/H4 arithmetic remains conditional on the fixed H serialization and its semantic packet roles.

A broader hex/base60 dual-reading null is important. Six distinct p50 token types have both a valid signed-range hexadecimal source index and a base60-prime signed index, so `1D -> IS/DIRECTION` is **not** evidentially unique in isolation. Its value here comes from being fixed first as the unique MAP/ROAD support-line intersection. Directly dereferencing the four OpenPGP key-ID bytes `7A 35 09 0F` as table addresses yields composite values under both source-visible radices, so that tempting extension is a negative and is not used.

Reproducer for this bridge: [map/road/direction p29 SFT](../sims/lp2_p50_map_road_direction_p29_bridge_sft.cjs).

## Radix rival and stopping rule

Repeat the identical physical-line family after deleting lowercase `f` from the printed alphabet (the live base59 rival). Only two edges survive, both rank22->23, at column5 downward and row5 right. There is **no two-edge consecutive rank chain**. Thus the **warning-chain** structure remains specific to base60 even though the stricter immediate-adjacency family above gives the complementary base59 phrase THE ROAD.

The source immediately continues:

```text
38 BEWARE
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
```

Base60 value179 (41st prime) exists once at cell129, but 181 (42nd prime) is absent from the table. Therefore the table does **not** encode an automatic `VERIFY OPENPGP` continuation under this rule. Stop at **BEWARE FALSE PATHS**; do not repair the missing 181 with another radix, wrap, offset, or table transform.

## Row/column-preserving geometric null (Director, 28 November)

The direct full-cell random-shuffle null is a weak comparator for a designed 32×8 numerical table: it destroys every physical row and column. A more conservative exact null uniformly permutes the **32 complete rows** and **8 global column labels independently**, retaining row inventories, column inventories, and every token's original row/column incidence. The source-phrase-conditioned event is fixed as follows: in base60, signed indices 17→18 (THE→MAP) point **north** in one column; in base59, indices 22→23 (THE→ROAD) point **east** in one row; their intersection has base60 rank21 (IS). The stronger event also requires base59 rank19 (THEIR) immediately north of MAP. This is a benchmark for the *already observed* candidate, **not a blinded discovery test**.

The pinned table has two base60 rank17 tokens in MAP's column3 (rows6 and27), exactly one rank18 in that column (row26), and a base59 rank19 in row25 of that column. The ROAD row5 contains rank22 at column0 and rank23 at column1 in base59. The base60 rank21 IS token already sits at their column3/row5 crossing. Consequently any global row/column permutation that preserves the two ordered adjacent pairs **automatically preserves IS**: this crossing is not an independent third lucky event. Exact null probabilities, proved by uniform permutation adjacency rather than an independence guess, are:

| Event conditional on the discovered indices/radices | Exact row×column permutation probability |
| --- | ---: |
| North-directed THE→MAP and east-directed THE→ROAD meeting at IS | (2/32)×(1/8) = **1/128 ≈ 0.7813%** |
| Same, plus THEIR immediately north of MAP in the other radix | (2/(32×31))×(1/8) = **1/3968 ≈ 0.0252%** |
| Same, plus the THEIR→ROAD-line northward distance equals source index20 = MEANING | **1/345216 ≈ 0.0002897%** |
| Same, plus base60 rank24 = AND immediately north of THEIR | **1/119040 ≈ 0.0008401%** |
| Same, plus both AND adjacency and the 20-edge MEANING distance | **1/9666048 ≈ 0.00001035%** |

All rows are exact under this same null. For the MEANING-only row, conditional on the fixed ordered three-row block THEIR/MAP/THE, its northmost row is uniformly one of30 possible positions. Exactly10 positions permit the independently permuted ROAD row to lie20 rows north, and that ROAD row then occupies one specified position among the29 remaining rows. The extra conditional factor is therefore `(10/30)×(1/29)=1/87`, so `(1/3968)×(1/87)=1/345216`.

For AND, the fixed row24 object must extend the ordered block to **AND/THEIR/MAP/THE**. A specified ordered four-row block has probability `2/(32×31×30)` because either of the two rank17 THE rows may close it; multiplying the independent east-directed ROAD column factor `1/8` gives `1/119040`. Conditional on that four-row block, there are29 possible block starts; exactly10 leave the ROAD row exactly20 positions north of THEIR, and that specific ROAD row occupies one of28 remaining row positions. The additional distance factor is `(10/29)×(1/28)=5/406`, giving **1/9666048** for the complete observed AND+distance structure.

[Executable original-source reconstruction and distance-null derivation](../sims/lp2_p50_maproad_meaning_distance_sft.cjs); [earlier crossing null](../sims/lp2_p50_maproad_row_column_null.cjs). These are **reference frequencies under one constrained null**, not corrected p-values: the relevant signed words, direction choice, radix mixture, distance interpretation, and extension were recognized after observing p50 and related fitted routes; the broad earlier family search has not been charged. The strengthened geometry now reconstructs the complete signed MAP/ROAD clause, but it still does not supply an unknown-cipher inverse, key, typed recipient or destination. A proposed cipher branch still needs an **independent source-selected receiver with a prediction on untouched original material**, not merely the smaller structural null rate.

## Evidence boundary

Established computational facts under the frozen representation:

- p50 base60 has exactly the three forward consecutive-prime-rank physical-line edges listed above for signed indices through42;
- those edges map under the existing zero-based authenticated register to **THE MAP**, **BEWARE FALSE**, and **FALSE PATHS**;
- the warning edges share the same prime value/token 167/`2l`, yielding the rank chain **BEWARE FALSE PATHS**;
- the already selected cell74-to-surface column2 begins with prime ranks39 and40, hence **FALSE PATHS**;
- the same census under base59 has no two-edge consecutive warning chain;
- the strict MAP/ROAD support geometry reconstructs every source index17..24: **THE MAP THEIR MEANING IS THE ROAD AND**. THEIR is the base59 prime#19 cell immediately north of MAP, MEANING is the exact20-edge northward distance from that cell to the ROAD support line, and the next support cell is the unique base60 prime#24 = AND;
- no prime#20 cell occurs anywhere on that vertical support segment under either live radix, so MEANING is specifically a distance readout rather than an omitted cell hit;
- prime rank42 / OPENPGP cannot continue because value181 is absent.

Interpretive dependencies remain substantial. Ordinary prime rank is one-based while the signed register lookup is zero-based; that convention is already active in the current source-index research but is not independently stated by Cicada. The two warning edges occupy different columns and are joined by a duplicated rank39 token, so **BEWARE FALSE PATHS** is a rank-graph chain, not a single straight printed phrase. The SURFACE-to-top-row reading itself remains provisional. These facts materially strengthen the hypothesis that p50 participates in the signed map/road clue: strict adjacency independently yields THE MAP under base60 and THE ROAD under the uniquely absent-f base59 codec, THEIR is the immediately continued base59 rank, IS is their line intersection, the intervening physical distance supplies MEANING, and the next MAP-support cell supplies AND24 whose number uniquely dereferences to THE/DIRECTION29 within the signed-range dual-radix family. They simultaneously warn against treating the PATH/SURFACE loop as an authenticated decoder. The row/column-preserving null above prevents treating the geometric IS crossing as an independent validation, and the new 1/345216 reference rate remains conditional on a post-discovery distance interpretation rather than a blinded global significance claim.

## Research decision

Preserve the complete **THE MAP THEIR MEANING IS THE ROAD AND** support reconstruction and the bounded **AND24 → p50[24] → THE/DIRECTION29** handoff as source-constrained map/navigation evidence. Redirect effort away from extending the terminal PATH loop by additional fitted receivers. The newly resolved MEANING step closes the local signed-clause gap but does not itself type a ciphertext operand. A productive successor must obtain an independently authored operation that converts this map structure into a reversible transform of unknown LP2 ciphertext. In particular, do not turn distance20 into an arbitrary page/key index or resume p55 key sweeps merely because the clause now closes.

Reproduce with:

```text
node sims/lp2_p50_prime_rank_signed_warning_sft.cjs
```

The SFT reads only the pinned original p50 table and authenticated signed-2016 cleartext, reconstructs ordinary prime ranks, enumerates the complete row/column family under base60 and base59, verifies the frozen SURFACE column consequence, and asserts the failed VERIFY/OPENPGP continuation.

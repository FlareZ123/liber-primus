# P50 base60 prime-rank geometry reproduces THE MAP and BEWARE FALSE PATHS

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

The omitted source words are exactly indices19–20, **THEIR MEANING**. There is one additional constrained near-continuation: the cell immediately north after MAP, cell203, is 67=prime#19 under base59 and therefore reads **THEIR**. The next cell north, cell195, is not prime#20 under either codec, so the literal straight phrase stops before **MEANING**. No turn, wrap or third numeric codec is authorized.

A finite follow-up also combines the observed physical directions (MAP points north; ROAD points east) into a northeast ray from the `IS` intersection. That ray does not produce a consecutive signed-register instruction under either codec. Treat N/E as descriptive geometry, not a newly recovered opcode.

This result changes the local radix interpretation: inside this exact adjacency/prime-rank family, base60 and the uniquely absent-`f` base59 reading look **complementary** rather than one simply defeating the other. Do not generalize that dual-radix conclusion to unrelated p50 branches without an equally source-constrained discriminator.

## DIRECTION bridge into the existing p29 numbered packet

Two further finite checks make the map/road geometry operationally relevant without turning it into a plaintext claim.

First, the selected MAP/ROAD intersection token has a second source-native numeric reading. Cell43 is `1D`: base60 gives 73 = prime#21 = **IS**, while ordinary hexadecimal gives `0x1D=29`. Hexadecimal is independently present in the same authenticated 2016 message through the OpenPGP key ID `7A35090F`; zero-based source index29 is **DIRECTION**. The token `1D` occurs four times in p50, so this dual reading is not unique by token value; the map/road geometry is what selects cell43.

Second, enumerate every p50 token whose values under the two source-visible radices are both ordinary primes with authenticated source ranks below43 and whose ranks differ by exactly one. There are exactly **two**:

| Cell | Token | base59 | source | base60 | source |
| ---: | --- | ---: | --- | ---: | --- |
| **24** | `1n` | 107 = prime#28 | **THE** | 109 = prime#29 | **DIRECTION** |
| 223 | `2V` | 149 = prime#35 | FOUND | 151 = prime#36 | GOOD |

The second token does not continue to LUCK by an adjacent cell under either radix, so no phrase is extended there. Cell24 is different: its **cell index itself is source index24 = AND**. Independently, the p28 fixed structural readout already emits **THEIR NUMBERS ARE THE**. Thus the source/register objects meet without fitting a new ciphertext string:

```text
cell index24                    -> AND
p28 fixed D4 structural readout -> THEIR NUMBERS ARE THE
p50[24] = 1n:
  base59 107 = prime#28         -> THE
  base60 109 = prime#29         -> DIRECTION
```

The repeated THE at the p28/p50 boundary is a consistency check, not a license to count it twice. The resulting authenticated clause is **AND THEIR NUMBERS ARE THE DIRECTION**.

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

[Executable source checks and null derivation](../sims/lp2_p50_maproad_row_column_null.cjs). These are **reference frequencies under one constrained null**, not corrected p-values: the relevant signed words, direction choice, radix mixture, and extension were selected after observing p50 and related fitted routes; the broad earlier family search has not been charged. The data still identify an interesting cross-radix geometric coincidence, but do not supply a cipher, key, typed receiver, or a licensed continuation after THEIR. A proposed new branch needs an **independent source-selected operation with a prediction on untouched original material**, not merely smaller shuffle probabilities.

## Evidence boundary

Established computational facts under the frozen representation:

- p50 base60 has exactly the three forward consecutive-prime-rank physical-line edges listed above for signed indices through42;
- those edges map under the existing zero-based authenticated register to **THE MAP**, **BEWARE FALSE**, and **FALSE PATHS**;
- the warning edges share the same prime value/token 167/`2l`, yielding the rank chain **BEWARE FALSE PATHS**;
- the already selected cell74-to-surface column2 begins with prime ranks39 and40, hence **FALSE PATHS**;
- the same census under base59 has no two-edge consecutive chain;
- prime rank42 / OPENPGP cannot continue because value181 is absent.

Interpretive dependencies remain substantial. Ordinary prime rank is one-based while the signed register lookup is zero-based; that convention is already active in the current source-index research but is not independently stated by Cicada. The two warning edges occupy different columns and are joined by a duplicated rank39 token, so **BEWARE FALSE PATHS** is a rank-graph chain, not a single straight printed phrase. The SURFACE-to-top-row reading itself remains provisional. These facts materially strengthen the hypothesis that p50 participates in the signed map/road clue: strict adjacency independently yields THE MAP under base60 and THE ROAD under the uniquely absent-f base59 codec, with IS at their line intersection. They simultaneously warn against treating the PATH/SURFACE loop as an authenticated decoder. The row/column-preserving null above also prevents treating the geometric IS crossing as an independent validation; its evidence remains conditional on post-selected indices and mixed radices.

## Research decision

Preserve this as a source-constrained map-validation result and redirect effort away from extending the terminal PATH loop by additional fitted receivers. A productive successor must obtain an independently authored operation that converts the map structure into a reversible transform of unknown LP2 ciphertext. In particular, do not resume p55 key sweeps merely because the PATH route closes numerically.

Reproduce with:

```text
node sims/lp2_p50_prime_rank_signed_warning_sft.cjs
```

The SFT reads only the pinned original p50 table and authenticated signed-2016 cleartext, reconstructs ordinary prime ranks, enumerates the complete row/column family under base60 and base59, verifies the frozen SURFACE column consequence, and asserts the failed VERIFY/OPENPGP continuation.

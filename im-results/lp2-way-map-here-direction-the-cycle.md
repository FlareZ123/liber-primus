# WAY -> MAP -> HERE and DIRECTION -> THE table closures

**Agent10, 19 November 2026. Classification: strong clue-constrained solve-path candidate with a held-out solved-text transfer. No continuous unknown-page plaintext is claimed.**

## Result

The authenticated 2016 THE-position scaffold fixes the ordered followers `PATH DEVOTED WAY MAP ROAD DIRECTION`, and the independently selected p29 derivative bridge later recovers candidate instruction **WAY**. Opening the p50 table only at that already fixed WAY address gives:

```text
GP0(WAY) = 57
p50[57] = 1w
GP0(MAP) = 56
```

The supplied original scan `66.jpg` visibly confirms the row containing `4E 1w 2Q 19 1k 3G 24 0p`. On the physical 32x8 table, state57 is row7/column1. Reading the printed token by its direct navigation syntax, **1w = one west**, lands exactly one cell left:

```text
57 --1w--> 56 = GP0(MAP)
```

Under the simple case-insensitive grammar `digit 1..9 + N/S/E/W`, this is the **only directed movement edge among all 30 ordered pairs** of the six fixed follower states, and the only hit among the five actual consecutive follower pairs.

At fixed source state57 and fixed target state56, exactly three of the 256 printed table-token instances would perform that move: two `1W` tokens and the single `1w` token. A token-instance permutation of the fixed table therefore gives the conditional calibration `3/256 = 0.01171875`. This does not charge the fact that the movement grammar was recognized from the visible token.

## Composition with the frozen MAP consumer

Agent20 froze the MAP consumer before the later signed scaffold and before derivative WAY was recovered:

```text
GP0(MAP)=56
p50[56]=4E
0x4E = ASCII N
one cell north: 56 -> 48
48 = GP0(HERE)
```

The new edge composes without changing that rule:

```text
WAY -> 1w -> MAP -> 4E -> N -> HERE
```

A complete table-wide census makes the composite much sharper. Across all 256 source cells, **state57 is the only source** whose digit+cardinal token makes an in-bounds first move to a cell whose token then decodes as a hexadecimal ASCII cardinal and permits the second move:

~~~text
57  1w  -> 56  4E/N -> 48
~~~

There is no second two-stage `literal move -> hex-cardinal move` transition anywhere else in the printed table.

Together with the existing local `HERE -> THE`, signed `DIRECTION -> p29`, and p29 derivative `-> WAY` route, this yields the candidate state circuit:

```text
HERE
 -> THE
 -> signed DIRECTION
 -> p29 repeated-root / derivative bridge
 -> WAY
 -> p50[57] = 1w
 -> MAP
 -> frozen p50[56] = 4E = N
 -> HERE
```

This is a more causal route than treating WAY, MAP, and HERE as separate English coincidences. The new `1w` opcode remains a first-use interpretation and still needs independent transfer.

## Held-out solved-text transfer

After fixing the exact two-stage operation above, test it against the independently solved GP29 corpus in `resources/external/relikd-solved-gp29-native-v1.json`.

The frozen composite is:

```text
source word GP0
 -> source token as literal digit+cardinal move
 -> intermediate state
 -> intermediate token as hexadecimal ASCII cardinal
 -> one grid step
 -> compare with next solved word GP0
```

Across all **731** adjacent solved word pairs, **81** source positions expose an in-bounds first-stage digit+cardinal move. The raw one-stage rule has **zero** direct next-word hits.

Only **11** solved adjacencies admit the full two-stage composite because the intermediate cell must also decode as a hexadecimal cardinal direction. Exactly **one** of those 11 reaches the next solved word:

```text
WELCOME, adjacent solved words: WAY HERE

WAY GP0 57
 -> p50[57] = 1w
 -> west to 56
 -> p50[56] = 4E
 -> 0x4E = N
 -> north to 48
 -> GP0(HERE) = 48
```

Thus the exact `WAY -> MAP -> HERE` route independently transfers to a solved Liber Primus plaintext adjacency. The intermediate MAP label comes from the authenticated 2016 source, while the solved WELCOME text supplies the untouched endpoints **WAY HERE**.

This is stronger than a manuscript-internal loop because the solved corpus was opened only after the composite operation had been fixed, and the same two-stage operation is table-wide unique before any solved plaintext comparison. It does **not** prove that every digit+cardinal or hexadecimal-cardinal table token is an opcode. In fact, the zero direct-movement hits across the solved corpus argue against that broad generalization.

## DIRECTION -> THE return

The last scaffold word supplies a separate short return:

```text
GP0(DIRECTION)=98
p50[98]=1C
1C(base59)=71
1C(base60)=72
GP-prime(THE)=72
```

Charge the six fixed followers as sources, both live radices 59/60, and the two natural target numberings GP0/GP-prime for the already fixed carrier word THE. Across these 24 configurations there is exactly one hit:

```text
DIRECTION
 -> GP0 address98
 -> p50[98]=1C
 -> base60 72
 -> GP-prime(THE)=72
```

This relation is not globally unique across the authenticated 2016 vocabulary. A whole-message control finds five distinct full-base60-byte to authenticated-word GP-prime links. Its evidential value therefore comes from the fixed roles of DIRECTION as the final scaffold follower and THE as the carrier being returned to, rather than from an unusually sparse global mapping family.

## Decision

Preserve these as source-constrained candidate transitions:

```text
WAY 57 -> 1w -> west -> MAP 56
MAP 56 -> 4E -> hex N -> north -> HERE 48
DIRECTION 98 -> 1C(base60)=72 -> GP-prime(THE)=72
```

Do not generalize digit-cardinal parsing to every table cell. Do not infer that every table byte should be compared against both GP0 and GP-prime. The composite WAY -> MAP -> HERE rule now has an independently solved plaintext transfer. The next decisive test is a second independently selected state or an unknown-ciphertext receiver predicted before inspection, using the same exact operation without widening the parser.

## Reproduction

Windows Node 22 complete-gate PASS: [run 44446988632](https://github.com/FlareZ123/liber-primus/actions/runs/44446988632).


Run:

```text
node sims/lp2_way_map_here_direction_the_cycle_sft.cjs
```

The SFT reparses the authenticated 2016 source, canonical GP alphabet, and original 256-cell table. It verifies follower order, all six addresses, the unique WAY -> MAP movement edge, the `3/256` fixed-target token-permutation calibration, composition with MAP -> HERE, the 24-way DIRECTION -> THE family, and a whole-message non-uniqueness control.

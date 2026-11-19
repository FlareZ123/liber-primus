# THEIR RISE: fixed six-row p50 opcode passes source controls, p29 transfer fails

**Agent14, 19 November 2026. Director #1802. Classification: positive for a source-selected 2D p50 movement opcode; negative for the first sealed unknown-page same-state receiver transfer.** The independently recovered instruction `THEIR RISE` fixes a literal upward movement of six printed rows in the original 32×8 p50 table. Under a complete eight-compass-direction and zero/one-address-origin charge, north is strongly distinguished. It alone reproduces both the historical `SEEKS -> ROAD/p` relation and a source holdout `BEWARE -> PATHS`; it also maps solved-p57 `EMERGE -> FOUND`. A prospectively sealed consequence on physical p29 fails, so the movement opcode is retained as authenticated-source navigation rather than generalized into a same-index plaintext/receiver rule.

## 1. Frozen selector

P33 independently yields:

```text
THEIR RISE
```

The authenticated 2016 message contains `THEIR` at zero-based positions:

```text
19, 25
```

so the source-visible rise is:

```text
25 - 19 = 6 = a.
```

The original p50 table is visibly 32 rows × 8 columns. The issue claim froze the literal operation before the full source scan:

```text
address = GP0(authenticated source word)
RISE    = move upward exactly a=6 printed rows
width   = 8
north destination = GP0 - 6*8 = GP0 - 48
```

Movement is rejected when it exits the printed table. There is no wrap, token decode, word-dependent depth, modulo reduction, or later choice of direction.

This differs from the earlier Agent4 variable-depth rule `GP0 - 8*source_index`. The present Director task fixes a single authored displacement, six rows, for every word.

## 2. Charged geometry family

Charge every authenticated 2016 word and both natural address origins:

- origin0: first printed cell is address0;
- origin1: first printed cell is address1.

For each origin, charge all eight compass directions with exactly six grid steps:

```text
N, NE, E, SE, S, SW, W, NW.
```

Two target classes are frozen for the census:

1. destination is one of the nine basic DH/state values
   `{p,g,a,b,A,B,K,e,q} = {23,5,6,15,8,19,2,3,4}`;
2. destination is a legal authenticated signed-word index0..42.

The exact counts are:

```text
origin direction  legal moves  DH hits  signed-index hits
0      N           24           9        20
0      NE           9           2         6
0      E           12           0         2
0      SE          12           0         0
0      S           43           0         0
0      SW          11           0         0
0      W           11           0         5
0      NW           6           1         5

1      N           24           9        20
1      NE           3           2         2
1      E            8           0         4
1      SE           8           0         0
1      S           43           0         0
1      SW          10           0         0
1      W           10           0         2
1      NW           8           4         7
```

North is the clear maximum for both declared target classes.

The zero/one origins produce exactly the same north destinations. That is an algebraic property of a pure vertical translation: subtracting or adding one to define the cell origin cancels when the same origin is restored after the move. The source family therefore selects north, while this operation cannot adjudicate the address-origin convention.

## 3. Historical discovery object becomes an exact source-word transition

The issue was motivated by:

```text
SEEKS GP0 = 71
71 - 48  = 23 = p.
```

The destination has an additional authenticated source meaning:

```text
signed word23 = ROAD.
```

So the fixed six-row operation gives:

```text
SEEKS -> ROAD.
```

Across all 16 direction/origin variants, only the two algebraically equivalent north variants produce exactly `SEEKS -> 23 -> ROAD`.

## 4. Source holdout: BEWARE -> PATHS

The operation was frozen in the #1802 claim before the full authenticated-word scan.

A materially independent source word then gives:

```text
BEWARE GP0 = 88
88 - 48    = 40
signed word40 = PATHS
```

hence:

```text
BEWARE -> PATHS.
```

This is the exact warning phrase endpoint inside:

```text
BEWARE FALSE PATHS.
```

Again, only north under the two origin aliases produces `BEWARE -> 40 -> PATHS`.

The same fixed operation exposes a compact authenticated navigation graph:

```text
BEWARE -> PATHS
PATHS  -> SEEKS
SEEKS  -> ROAD
ROAD   -> SEEKS
```

because:

```text
GP0(PATHS) = 54 -> 6  -> signed word6  SEEKS
GP0(ROAD)  = 54 -> 6  -> signed word6  SEEKS
GP0(SEEKS) = 71 -> 23 -> signed word23 ROAD.
```

No word-specific displacement is used.

## 5. Solved-page cross-control: EMERGE -> FOUND

The earlier p50 geometry audit used solved-p57 `EMERGE` as a held-out plaintext word. Its canonical GP0 is:

```text
GP0(EMERGE) = 83.
```

Apply the already frozen rise:

```text
83 - 48 = 35
signed word35 = FOUND.
```

Thus:

```text
EMERGE -> FOUND.
```

Among all eight compass directions and both address origins, only north yields destination35/FOUND. South is the only other geometrically legal move from GP0 83 and lands at131, outside the authenticated source indices.

This solved-page/source relation was not used to notice the original SEEKS71->23 coincidence.

## 6. Prospectively sealed unknown-page transfer: FAIL

After the source and solved controls passed, a separate unknown-page consequence was frozen before reading p29 word states:

`workplace/agent14-their-rise-p29-direction-precommit.md`

commit:

`0a1c2057df70ecaae3c0ea480a127599ea737177`.

Use:

```text
20 MEANING
GP0(MEANING) = 77
77 - 48      = 29
29 DIRECTION.
```

The precommit interpreted destination29 simultaneously as signed word29 and physical LP2 p29, then required physical p29 to contain exactly one complete printed word with the canonical DIRECTION state:

```text
DIRECTION
GP-rune length = 8
raw GP0        = 112.
```

Canonical continuous printed-word segmentation of p29 gives three complete eight-rune words:

```text
start138  GP0=132
start239  GP0=128
start247  GP0=131.
```

There are:

```text
0 complete p29 words with length8 and GP0=112.
```

The sealed transfer therefore fails.

No neighboring word, fragment, slash-split line fragment, alternate GP sum, target substitution, or different destination is admitted.

## 7. Decision

Director #1802 is **positive for a source-selected 2D p50 movement opcode**:

```text
THEIR RISE
-> THEIR19 -> THEIR25
-> rise6=a
-> move six printed rows upward on the 32×8 p50 table
-> authenticated source navigation.
```

The full charged family distinguishes north from the seven compass rivals, and the operation survives two independent source/solved controls:

```text
SEEKS  -> ROAD
BEWARE -> PATHS
EMERGE -> FOUND.
```

This genuinely reopens p50 geometry after #1789, whose negative result concerned direct row/column **state-pair encodings**. The new operation combines an authored direction word, an independently fixed movement magnitude, source GP0 addresses, and the printed table geometry.

The first unknown-page consumer fails:

```text
MEANING -> DIRECTION -> p29 same-state receiver
```

is rejected.

Therefore do not generalize the six-row opcode into a rule that destination word numbers automatically identify plaintext on same-numbered physical pages. Future uses should stay inside authenticated source navigation unless another original clue specifies a concrete physical-page consumer.

## Reproduction

`sims/lp2_their_rise_sixrow_p50_geometry_gate_sft.cjs`

The SFT reproduces all 16 geometry variants, the SEEKS/BEWARE source controls, solved-p57 EMERGE control, and the sealed p29 failure.

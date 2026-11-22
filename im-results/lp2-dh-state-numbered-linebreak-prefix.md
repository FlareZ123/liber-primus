# DH state values B19 and p23 recover the authenticated source prefix from numbered receivers

**Agent14, 19 November 2026. Classification: source-selected original-cipher readout. The independently reconstructed DH state selects two authenticated source numbers whose original numbered receivers recover source indices0..5 under one fixed physical-line-break H rule.**

## Upstream selectors

Independent state:

```text
B = 19
p = 23
```

Authenticated source register:

```text
19 = THEIR
23 = ROAD
```

The signed instruction says their numbers are the direction, so the fixed numbered diagonal selects:

```text
THEIR19 -> p19 canonical word20
ROAD23  -> p23 canonical word24
```

No ciphertext statistic is used to choose these two pages.

## Fixed line-break readout

For every numbered receiver:

1. preserve original physical line breaks inside the canonical word;
2. compute H on the complete word;
3. compute H on each physical fragment;
4. take the set union of those H coordinates;
5. report the longest complete consecutive source-index run in the union.

This is the same original-wrap operation already used in the p0 marker-prefix work.

Charge all 42 valid numbered receivers before judging the state-selected pair.

## B19 / THEIR19

```text
THEIR19
-> p19 canonical word20
-> [21,16,18,17,20,14,8]
-> physical break 2|5
```

Whole-word and fragment H union:

```text
{0,1,2,3,5,8,9,10,13,17,20,26,27}
```

Its longest consecutive run is:

```text
0,1,2,3
=
HELLO THE PATH LIES
```

Across the complete 42-receiver census, p19 word20 is the only receiver whose longest line-break-H run is exactly source0..3.

## p23 / ROAD23

```text
ROAD23
-> p23 canonical word24
-> [22,7,0,26,21,1,26,10]
-> physical break 6|2
```

Whole-word and fragment H union:

```text
{1,3,4,5,7,10,12,15,16,18,21,23,26,28}
```

Its longest consecutive run is:

```text
3,4,5
=
LIES EMPTY EPIPHANY
```

Across the same complete census, p23 word24 is the only receiver whose longest line-break-H run is exactly source3..5.

## Combined state-selected consequence

The two DH state coordinates overlap at source index3:

```text
B19 -> 0..3
p23 ->    3..5
```

Their union is the authenticated prefix:

```text
0 HELLO
1 THE
2 PATH
3 LIES
4 EMPTY
5 EPIPHANY
```

or:

```text
HELLO THE PATH LIES EMPTY EPIPHANY
```

The state/source bridge then continues numerically:

```text
g=5     -> EPIPHANY
a=6     -> SEEKS
g+K=7   -> THE
A=8     -> DEVOTED
```

so the independently reconstructed state and these two original receivers jointly cover source0..8:

```text
HELLO THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED
```

## Full 42-receiver control

Only nine numbered receivers have a line-break-H union whose longest consecutive run has length at least3:

```text
p0  -> 8..10
p1  -> 6..9
p9  -> 20..24
p17 -> 13..16
p19 -> 0..3
p22 -> 23..25
p23 -> 3..5
p40 -> 22..24
p42 -> 0..2
```

Among the state-addressed source values:

```text
2,3,4,5,6,7,8,15,19,23
```

only `B19` and `p23` produce runs of length at least3 under this rule.

## Relationship to the source-state mechanism

This result gives a direct operational meaning to two state values already identified as source landmarks:

```text
B19 = THEIR
p23 = ROAD
```

They are not only labels. Their numbers address original manuscript receivers that reconstruct the authenticated opening prefix.

This supports a causal chain:

```text
reconstructed DH state
-> authenticated source-word number
-> numbered manuscript receiver
-> physical-wrap H readout
-> authenticated source register
```

See also:

- `im-results/lp2-dh-state-signed-source-register.md`
- `im-results/lp2-numbered-diagonal-unitrun-direction-grammar.md`
- `im-results/lp2-p0-red13-hinv-state-palindrome.md`

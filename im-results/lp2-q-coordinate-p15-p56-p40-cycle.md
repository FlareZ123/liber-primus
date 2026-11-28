# Q-coordinate graph has a unique p15→p56→p40 3-cycle on q/g/A and EMPTY/EPIPHANY/DEVOTED

**Agent4, 28 November 2026. Classification: exact finite structural discovery over all nonzero original red-span Q coordinates. It supplies a new cross-page navigation/state relation but does not decode unknown body plaintext.**

## Frozen inputs

The p3/p15/p57 quotient defines a fixed field multiplier `Q` of order840. For every complete nonzero red span in the canonical ink annotations, its field residue has a unique exponent `k` on the Q orbit; historical BASE29 serializes that exponent as

```text
k = 29*row + col,  with row,col in 0..28.
```

Seventeen annotated red spans have nonzero Q-orbit coordinates. No page/body language score enters this result.

## Complete directed-graph charge

Treat each Q coordinate `[r,c]` as a directed edge `r→c` on the 29 BASE29 digits. Charge the complete 17-edge set for directed cycles.

There are:

```text
2-cycles: 0
3-cycles: exactly 1
```

The unique directed 3-cycle is

```text
p15 first red9 : [8,4],  k236   8 -> 4
p56 solved red5: [4,5],  k121   4 -> 5
p40 opening red8: [5,8], k153   5 -> 8
                                      |
                                      +---- closes to 8
```

so, starting at the solved p56 edge,

```text
p56 [4,5] -> p40 [5,8] -> p15 [8,4] -> p56.
```

No other three distinct red spans among the 17 form a directed coordinate cycle.

## Two independent first-party readings of the vertices

The vertex set is `{4,5,8}`.

In the established GP/DH state vocabulary:

```text
4 = q
5 = g
8 = A
```

so the cycle is exactly

```text
[A,q] -> [q,g] -> [g,A] -> [A,q].
```

The same raw numbers are authenticated 2016 signed-source word indices:

```text
4 = EMPTY
5 = EPIPHANY
8 = DEVOTED
```

which gives

```text
[DEVOTED,EMPTY] -> [EMPTY,EPIPHANY] -> [EPIPHANY,DEVOTED].
```

The middle and final edges are visibly source-native: index4→5 is the adjacent phrase `EMPTY EPIPHANY`, and index5→8 brackets the exact clause `EPIPHANY SEEKS THE DEVOTED`.

This is not obtained by attaching a free descriptor to the coordinates; both readings use independently fixed numeric dictionaries.

## Relation to the solved-p56→unknown-p40 handoff

A separate Agent4 result established an operational table transition:

```text
Q(p56) exponent121 --ROAD/DH-p=23 base59 hops--> exponent153 = Q(p40),
```

unique among all six Q-derived p50-valid starts and both live table radices. The new coordinate cycle shows that the same two pages are also adjacent in the complete Q-coordinate graph:

```text
p56 [4,5] -> p40 [5,8].
```

Thus the solved p56→unknown p40 handoff is supported by two different representations of the fixed Q states:

1. exponent/address navigation: `121 --23 hops--> 153`;
2. BASE29-coordinate adjacency: the target digit5 of p56 is the source digit5 of p40.

The third edge identifies p15 as the unique page that closes this coordinate route.

## Evidence boundary

This is an exact graph property discovered after the Q coordinates were already available. It is therefore a post-discovery structural route, not a sealed prediction or a probability claim. The semantic source reading strengthens human plausibility but does not by itself specify a cipher operation on p40 black text.

The next productive test should require an original clue to choose how the `q→g→A→q` state cycle acts on a receiver. Do not turn the three values into an arbitrary periodic additive key; direct short periodic p40 uses have already failed.

Reproducer: [`sims/lp2_q_coordinate_unique_p15_p56_p40_cycle_sft.cjs`](../sims/lp2_q_coordinate_unique_p15_p56_p40_cycle_sft.cjs).

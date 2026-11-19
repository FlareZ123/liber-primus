# The authenticated 2014 magic squares encode the DH state in BASE29

**Agent13, 19 November 2026. Classification: source-constrained cross-object state mechanism. The metadata equations are exact. The final 7x7 coordinate read for `p,b` was recognized after the DH state was already known, so preserve that step as a strong retrospective closure until an independent clue explicitly selects those coordinates. No unknown LP2 prose is claimed.**

## Starting evidence

Three facts were established independently before this analysis:

1. the authenticated 2014 source supplies exactly three magic squares, in source order:
   - 5x5, sum3301, center809;
   - 7x7, sum1033, center331;
   - 5x5, sum1033, center91;
2. the three centers independently select BASE29 under the complete radix/mirror family;
3. literal p55 shedding independently reconstructs the DH state

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

This report asks a narrower question: once BASE29 and the state are fixed independently, do the square orders, sums, and centers themselves reproduce that state with a compact deterministic grammar?

They do.

## The two equal-sum 1033 squares recover seven state fields

The two squares with the same magic sum1033 have orders5 and7 and centers91 and331.

Take the smaller one first.

Its order is:

```text
5 = g.
```

The order difference is:

```text
7 - 5 = 2 = K.
```

Its center in the already selected BASE29 is:

```text
91 = [3,4]_29 = [e,q].
```

The larger center is:

```text
331 = [11,12]_29.
```

Subtract the smaller center digits coordinatewise:

```text
[11,12] - [3,4] = [8,8] = [A,A].
```

Thus the two equal-sum squares directly give:

```text
g=5
K=2
e=3
q=4
A=8.
```

Now read the shared magic sum in BASE29:

```text
1033 = [1,6,18]_29.
```

The first digit is the already reconstructed unit step:

```text
1 = q-e = e-K.
```

The second digit is:

```text
6 = a.
```

The third digit is:

```text
18 = A-B mod29.
```

With `A=8`, this fixes:

```text
B = A - 18 mod29 = 19.
```

So low-degree metadata from the equal-sum pair alone recovers seven fields:

```text
(g,a,A,B,K,e,q)
=
(5,6,8,19,2,3,4).
```

No internal square cell has been consulted at this point.

## The derived state quantities label the complete 7x7 axis

The values already recovered from metadata give:

```text
q-e = 1
K   = 2
e   = 3
q   = 4
g   = 5
a   = 6
g+K = 7
```

Therefore the state quantities fill the 7x7 coordinate axis exactly once:

```text
[q-e, K, e, q, g, a, g+K]
=
[1,2,3,4,5,6,7].
```

This makes the 7x7 square a natural state-addressed object without inventing an external coordinate alphabet.

## The remaining p,b pair appears twice in state-addressed symmetric positions

Use the derived row `e=3`.

At columns `a=6` and `g+K=7`, the original authenticated 7x7 square contains:

```text
square[e,a]     = square[3,6] = 23
square[e,g+K]   = square[3,7] = 15
```

These are exactly:

```text
[p,b] = [23,15].
```

The 180-degree symmetric positions use the derived row `g=5` and the first two state-axis coordinates:

```text
square[g,q-e] = square[5,1] = 15 = b
square[g,K]   = square[5,2] = 23 = p.
```

So the same pair appears reversed:

```text
[p,b] <-> [b,p].
```

The coordinate choice was recognized after the state was known. It is therefore a strong closure and a concrete candidate for intended lookup, while it is not yet an independently selected decoder instruction.

## The recovered tuple closes every DH equation

The square-derived tuple is:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

It satisfies all established state equations exactly:

```text
5^6  mod23 = 8
5^15 mod23 = 19
8^15 mod23 = 2
19^6 mod23 = 2
15*3 mod22 = 1
q = e+1 = 4.
```

Swapping the two terminal values fails immediately because15 is not a valid prime modulus for the established DH system and the equations no longer close.

## The 3301 square supplies independent state checks

The first authenticated square is 5x5, so its order again gives:

```text
5 = g.
```

Its center is:

```text
809 = [27,26]_29
    = [-K,-e]_29.
```

P22 visibly mirrors this source illustration, and the independently selected mirrored read is:

```text
[26,27] = [-e,-K].
```

The magic sum itself is:

```text
3301 = [3,26,24]_29
     = [e,-e,-g]_29.
```

The other magic sum has the complementary state form:

```text
1033 = [q-e,a,A-B]_29.
```

Thus the two historically supplied magic-sum constants are themselves compact BASE29 state packets.

## Why this matters

The three-square BASE29 result previously established a lexical register:

```text
809 -> NUMBERS ARE
331 -> IS THE
 91 -> LIES EMPTY.
```

The new state reading explains why those center pairs are consecutive rather than leaving adjacency as an isolated numerical fact:

```text
91  -> [e,q]                 with q=e+1
331 -> [A+e,A+q]             preserving the same unit step
809 -> [-K,-e]               with e=K+1
```

The same source objects therefore support two compatible readings:

- authenticated 2016 source-word indices;
- independently reconstructed DH-state arithmetic.

That is a plausible human-puzzle bridge between the 2014 square stage and the later LP2/OpenPGP state machinery.

It also creates a concrete alternative to treating the DH tuple as a collection assembled only from later clues. Most of the tuple is recoverable from authenticated 2014 square metadata under the already selected BASE29 representation.

## Evidence boundary

Exact and reproducible:

- square orders, centers, and magic sums;
- BASE29 digit representations;
- seven-field recovery from the equal-sum square metadata;
- the complete 1..7 state-axis labeling;
- the two symmetric `23,15` cell pairs;
- closure of every DH equation;
- the 3301 and1033 magic-sum state packets.

Interpretive:

- assigning the state-addressed 7x7 cells specifically as the intended source of `p,b`;
- treating the complete metadata/state correspondence as authorial rather than an exceptionally dense cross-object coincidence.

The best next test is prospective: use this square-derived state grammar to predict an operation or state packet on an untouched original object before opening its rune values. Do not broaden into arbitrary square-cell expression mining.

## Reproduction

```text
node sims/lp2_three_square_dh_state_extractor_sft.cjs
```

Windows Node 22 PASS: `44476954417`.

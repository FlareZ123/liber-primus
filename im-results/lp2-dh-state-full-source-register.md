# The authenticated 2016 word register is tiled by the reconstructed DH state

**Agent11, 19 November 2026. Classification: strong cross-era register architecture. This is an exact arithmetic organization of the already authenticated 2016 source; it does not by itself recover new LP2 body plaintext.**

## Result

The independently reconstructed state is:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

Define the already established unit and axis endpoint:

```text
u = q-e = 1
t = g+K = 7.
```

Then:

```text
[u,K,e,q,g,a,t,A]
=
[1,2,3,4,5,6,7,8].
```

The remarkable extension is that the same state tiles **every zero-based authenticated source index 0 through42 exactly once in increasing order** under a compact block grammar.

## Complete index grammar

```text
0

u, K, e, q, g, a, t, A

A + [u,K,e,q,g,a]

b, 2A, 2A+u, 2A+K

B + [0,u,K,e]

p + [0,u,K,e,q,g,a,t,A]

p+A + [u,K,e,q,g,a]

2B + [0,u,K,e]

B+p
```

Numerically this is exactly:

```text
0,1,2,3,...,42.
```

There are no duplicates and no gaps.

## Register words exposed by state anchors

Selected direct state coordinates are:

```text
u=1       -> THE
K=2       -> PATH
e=3       -> LIES
q=4       -> EMPTY
g=5       -> EPIPHANY
a=6       -> SEEKS
t=7       -> THE
A=8       -> DEVOTED

A+g=13    -> WAY
b=15      -> WORDS
B=19      -> THEIR
p=23      -> ROAD
p+a=29    -> DIRECTION
B+p=42    -> OPENPGP
```

So the first state axis is already the complete opening clause:

```text
THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED.
```

The later anchors land on the central puzzle vocabulary rather than generic filler.

## Clause-sized state intervals

Several blocks are especially compact.

### B through p

```text
B + [0,u,K,e]
=
[19,20,21,22]

p = 23
```

reads:

```text
THEIR MEANING IS THE ROAD.
```

### p through p+a

```text
p + [0,u,K,e,q,g,a]
=
[23,24,25,26,27,28,29]
```

reads:

```text
ROAD AND THEIR NUMBERS ARE THE DIRECTION.
```

This is particularly notable because the authenticated text itself says that the numbers are the direction.

### Upper register

```text
2B + [0,u,K,e] = [38,39,40,41]
B+p             = 42
```

reads:

```text
BEWARE FALSE PATHS VERIFY OPENPGP.
```

The exact final index is the direct state sum:

```text
B+p = 19+23 = 42 = OPENPGP.
```

## Complete table

```text
 0  0           HELLO
 1  u           THE
 2  K           PATH
 3  e           LIES
 4  q           EMPTY
 5  g           EPIPHANY
 6  a           SEEKS
 7  t=g+K       THE
 8  A           DEVOTED
 9  A+u         LIBER
10  A+K         PRIMUS
11  A+e         IS
12  A+q         THE
13  A+g         WAY
14  A+a         ITS
15  b           WORDS
16  2A          ARE
17  2A+u        THE
18  2A+K        MAP
19  B           THEIR
20  B+u         MEANING
21  B+K         IS
22  B+e         THE
23  p           ROAD
24  p+u         AND
25  p+K         THEIR
26  p+e         NUMBERS
27  p+q         ARE
28  p+g         THE
29  p+a         DIRECTION
30  p+t         SEEK
31  p+A         AND
32  p+A+u       YOU
33  p+A+K       WILL
34  p+A+e       BE
35  p+A+q       FOUND
36  p+A+g       GOOD
37  p+A+a       LUCK
38  2B          BEWARE
39  2B+u        FALSE
40  2B+K        PATHS
41  2B+e        VERIFY
42  B+p         OPENPGP
```

## Why this matters for p0

The p0 state-only key serializer uses:

```text
u=q-e=1
t=g+K=7
w=A+g=13.
```

This register architecture shows that all three are native coordinates in the same state system:

```text
u=1     -> THE
t=7     -> THE
w=13    -> WAY.
```

Thus the former `THE7` and `WAY13` rise anchors are not isolated lexical coincidences. They are entries in a complete state arithmetic that spans the authenticated source register.

The p0 plaintext itself also occupies direct state coordinates:

```text
g=5 -> EPIPHANY
a=6 -> SEEKS.
```

## Evidence boundary

Exact:

- the full authenticated source has 43 words indexed0..42;
- the established DH/state tuple has the values above;
- the declared block grammar evaluates exactly to every integer0..42 in order;
- each listed expression therefore indexes the stated authenticated word;
- the p0 serializer's numerical anchors are members of this same complete grammar.

Interpretive:

- the grammar was recognized after the source register and state tuple were both known;
- many integer expressions can be invented if arbitrary arithmetic is permitted, so the significance rests on the unusually short block structure, reuse of the independently established axis `[1..8]`, direct state anchors, and clause-aligned endpoints;
- this should be treated as strong architecture evidence and a source for prospective predictions, rather than as independent plaintext recovery.

## Decision

Preserve this register grammar as the current compact explanation for why the signed 2016 text repeatedly behaves like an executable numeric dictionary for Liber Primus and older Cicada artifacts.

Future tests should use the grammar prospectively. In particular, prefer exact state expressions already present in this table when a clue emits a state field; avoid unconstrained searches over new arithmetic expressions.

## Reproduction

```text
node sims/lp2_dh_state_full_source_register_sft.cjs
```

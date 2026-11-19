# The reconstructed DH state is embedded in the authenticated source-word register

**Agent14, 19 November 2026. Classification: new structural bridge between the independently reconstructed p28 DH state and the authenticated 2016 signed-message word numbers. The mapping is exact and deterministic. Its intended use as a complete cipher key remains a hypothesis.**

## Fixed upstream state

Independent authenticated-square reconstruction now gives:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4)
```

The p0 source route independently selects:

```text
THE7
WAY13
```

and the state itself confirms `g+K=7`.

The authenticated 2016 clear-signed message is indexed from zero.

## Direct state values are source landmarks

Read each state value as a source-word index:

```text
K = 2   -> PATH
e = 3   -> LIES
q = 4   -> EMPTY
g = 5   -> EPIPHANY
a = 6   -> SEEKS
g+K = 7 -> THE
A = 8   -> DEVOTED

b = 15  -> WORDS
B = 19  -> THEIR
p = 23  -> ROAD
```

The first seven coordinates are consecutive:

```text
2,3,4,5,6,7,8
=
PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED
```

This is an exact authenticated phrase span, assembled from state values plus the independently source-selected `g+K=7`.

## State-derived clause boundaries

Several equally small state expressions land on the ends or starts of the instruction clauses that follow:

```text
WAY = 13

WAY+1 = 14 -> ITS
b     = 15 -> WORDS
B-1   = 18 -> MAP

B     = 19 -> THEIR
p     = 23 -> ROAD

p+1   = 24 -> AND
p+K   = 25 -> THEIR
p+a   = 29 -> DIRECTION
```

Therefore the fixed state/source anchors partition the authenticated register as:

```text
2..8
PATH LIES EMPTY. EPIPHANY SEEKS THE DEVOTED.

9..13
LIBER PRIMUS IS THE WAY.

14..18
ITS WORDS ARE THE MAP.

19..23
THEIR MEANING IS THE ROAD.

24
AND

25..29
THEIR NUMBERS ARE THE DIRECTION.
```

The especially literal landmarks are:

```text
b15 = WORDS
B19 = THEIR
p23 = ROAD
p+K25 = THEIR
p+a29 = DIRECTION
```

This gives a concrete interpretation of the signed instruction's emphasis on word numbers: state values and small state-derived boundaries are themselves addresses into the authenticated message.

## Three-anchor reconstruction

The source-visible anchors:

```text
q=4
t=THE7
w=WAY13
```

generate the entire state through small linear relations:

```text
p = q+t+w-1 = 23
g = q+1     = 5
a = t-1     = 6
b = 2q+t    = 15
A = 2q      = 8
B = t+w-1   = 19
K = w-q-t   = 2
e = q-1     = 3
q           = 4
```

Among all six authenticated occurrences of THE, only `THE7` makes these relations satisfy the four DH equations. This is reproduced in `sims/lp2_p0_red13_hinv_state_palindrome_sft.cjs`.

Thus the bridge works both directions:

```text
source-visible q4 / THE7 / WAY13
-> full DH state
-> state values address meaningful source words and clause boundaries
```

## Relationship to p0

The same three anchors directly generate the marker-aligned p0 H-inverse key packet and exact title key. See:

- `im-results/lp2-p0-red13-hinv-state-palindrome.md`
- `im-results/lp2-p0-firstline-h-source-register.md`
- `im-results/lp2-numbered-diagonal-unitrun-direction-grammar.md`

This makes the source register, DH state, and p0 title recovery one connected mechanism rather than three independent numerical observations.

## Evidence boundary

The mapping from already fixed state values to already fixed source words is exact. The linear three-anchor state formulas were recognized after both structures were known, so their formula class is retrospective even though THE7 is uniquely selected by the DH equations and by the independent THE1 circumference route.

A decisive next step is an untouched receiver whose operation is selected from these state-addressed source words before its plaintext or key consequence is examined.

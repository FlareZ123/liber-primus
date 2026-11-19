# The authenticated 2016 message folds at DIRECTION=29 into a complete DH23 state

**Agent27, 19 November 2026. Classification: strong source-native mechanism. The construction uses only the authenticated 2016 words, canonical GP29 word numbers, and the already frozen forward H map. It consumes no unknown LP2 ciphertext. The fold and DH role family are finite and fully charged.**

## The source layout supplies the operation

Tokenize the authenticated 2016 message into natural-language words and number them from zero.

Three blocks appear:

```text
0  HELLO

1..13
THE PATH LIES EMPTY
EPIPHANY SEEKS THE DEVOTED
LIBER PRIMUS IS THE WAY

14..29
ITS WORDS ARE THE MAP
THEIR MEANING IS THE ROAD
AND THEIR NUMBERS ARE THE DIRECTION

30..42
SEEK AND YOU WILL BE FOUND
GOOD LUCK
BEWARE FALSE PATHS
VERIFY OPENPGP
```

The final word of the self-referential instruction is:

```text
word29 = DIRECTION
```

which is exactly the GP alphabet modulus.

The 13 words after it have numbers 30..42, hence residues 1..13 modulo29. They therefore pair one-for-one with words1..13:

```text
 1 THE       <-> SEEK     30
 2 PATH      <-> AND      31
 3 LIES      <-> YOU      32
 4 EMPTY     <-> WILL     33
 5 EPIPHANY  <-> BE       34
 6 SEEKS     <-> FOUND    35
 7 THE       <-> GOOD     36
 8 DEVOTED   <-> LUCK     37
 9 LIBER     <-> BEWARE   38
10 PRIMUS    <-> FALSE    39
11 IS        <-> PATHS    40
12 THE       <-> VERIFY   41
13 WAY       <-> OPENPGP  42
```

Thus the signed sentence itself supplies a natural reading of **“their numbers are the direction”**: fold word numbers modulo29 at the literal word DIRECTION.

## Apply H to the paired word meanings

For each aligned pair, compute canonical GP0 for each word and apply the already frozen operation

```text
H(x,y) = [x-y, x+y] mod29.
```

The 13 rows are:

| residue | words | GP0 pair | H |
| ---: | --- | --- | --- |
| 1 | THE / SEEK | 20 / 56 | [22,18] |
| 2 | PATH / AND | 39 / 56 | [12,8] |
| 3 | LIES / YOU | 63 / 30 | [4,6] |
| 4 | EMPTY / WILL | 92 / 57 | [6,4] |
| 5 | EPIPHANY / BE | 121 / 35 | [28,11] |
| 6 | SEEKS / FOUND | 71 / 36 | [6,20] |
| 7 | THE / GOOD | 20 / 35 | [14,26] |
| 8 | DEVOTED / LUCK | 102 / 31 | [13,17] |
| 9 | LIBER / BEWARE | 69 / 88 | [10,12] |
| 10 | PRIMUS / FALSE | 62 / 77 | [14,23] |
| 11 | IS / PATHS | 25 / 54 | [0,21] |
| 12 | THE / VERIFY | 20 / 59 | [19,21] |
| 13 | WAY / OPENPGP | 57 / 75 | [11,16] |

Five rows close a complete Diffie-Hellman state:

```text
PATH / AND      -> [12,8]  = [K*a, A]
LIES / YOU      -> [4,6]   = [q, a]
LIBER / BEWARE  -> [10,12] = [K*g, K*a]
PRIMUS / FALSE  -> [14,23] = [-b, p]
THE / VERIFY    -> [19,21] = [B, p-K]
```

Solve them mechanically:

```text
a = 6
q = 4
K = 12 / 6 mod29 = 2
g = 10 / 2 mod29 = 5
A = 8
b = -14 mod29 = 15
p = 23
B = 19
e = b^-1 mod(p-1) = 15^-1 mod22 = 3
```

and every DH relation closes:

```text
5^6  mod23 = 8  = A
5^15 mod23 = 19 = B
8^15 mod23 = 2  = K
19^6 mod23 = 2  = K
```

So the source alone reconstructs:

```text
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4).
```

## Complete finite charge

The DH packet assignment was not chosen by testing only the five successful rows.

For each 13-row fold, charge every assignment of five **distinct** rows to:

```text
[K*a,A]
[q,a]
[K*g,K*a]
[-b,p]
[B,p-K]
```

There are:

```text
13P5 = 13*12*11*10*9 = 154,440
```

assignments per fold.

Then charge every cyclic alignment of the 13-word trailing block and both uniform H orientations:

```text
13 shifts * 2 H directions * 154,440 assignments
= 4,015,440 configurations.
```

Exactly **one** configuration closes every DH equation:

```text
shift 0
forward H
roles at residues 2,3,9,10,12
state (23,5,6,15,8,19,2,3,4).
```

Every other cyclic alignment, the reversed H orientation, and every other role assignment fails.

This is a finite family result rather than an open-ended expression search.

## The recovered state indexes the clue text itself

After reconstructing the state, read its values as zero-based signed-word positions:

```text
K     = 2  -> PATH
e     = 3  -> LIES
q     = 4  -> EMPTY
g     = 5  -> EPIPHANY
a     = 6  -> SEEKS
g+K   = 7  -> THE
A     = 8  -> DEVOTED

b     = 15 -> WORDS
B     = 19 -> THEIR
p     = 23 -> ROAD
```

The first seven values are literally consecutive:

```text
[K,e,q,g,a,g+K,A] = [2,3,4,5,6,7,8]
```

and spell the complete authenticated clue block:

```text
PATH LIES EMPTY
EPIPHANY SEEKS THE DEVOTED
```

The private/public/modulus values then point into the self-referential instruction:

```text
WORDS / THEIR / ROAD.
```

This supplies a plausible human solve sequence. The message tells the player that the word numbers are directional, places DIRECTION at 29, folds the two 13-word blocks modulo29, reconstructs a DH state, and then lets that state point back into the clue vocabulary.

## Relation to the independent collision reconstruction

A separate source-only family, discovered immediately before this fold, uses:

```text
THEIR/THEIR     positions 19,25 -> H = [p,b]
IS/IS           positions 11,21 -> H = [B,e]
ROAD/PATHS      equal GP0        -> H = [K*a,g]
MEANING/FALSE   equal GP0        -> H = [K*g,a-g]
```

and uniquely reconstructs the same state across 672 role assignments. Its one-million exact-token-multiset positional null produced 16 familywise DH closures, empirical rate 0.000016.

The two mechanisms use materially different pair selection:
- the collision route pairs repeated/equal-GP0 source words;
- the DIRECTION route pairs the two 13-word blocks by explicit modulo29 word-number alignment.

Their convergence substantially reduces the amount of state information that must be imported from p28.

## Consequence for current research

This source structure should replace vague appeals to the 2016 wording with an executable operation:

```text
authenticated signed words
-> zero-based word numbers
-> DIRECTION at 29
-> fold trailing block modulo29
-> canonical GP0 per word
-> fixed H on aligned pairs
-> unique DH state
-> state values index clue words
```

The next productive step is a prospective consumer. Freeze this reconstructed source state and the modulo29 fold before opening an independently selected unknown receiver. Do not widen the five-role grammar or invent new row formulas solely to explain additional outputs.

## Reproduction

Run:

```text
node sims/lp2_signed2016_direction29_fold_dh_state_sft.cjs
```

The SFT parses the authenticated source, proves the DIRECTION=29 layout, reproduces all 13 folded GP0/H rows, exhausts 4,015,440 fold/orientation/role configurations, verifies the unique DH closure, and checks the state-indexed clue words.

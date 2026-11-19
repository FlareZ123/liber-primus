# DH23 state anchors align with the signed 2016 register; the full tiling is retrospective

**Agent11, 19 November 2026; adversarially re-audited by Agent1, 19 November 2026. Classification: source-constrained DH23 state and direct lexical anchors survive; the complete nine-block partition is retrospective and not source-selected. No unknown LP2 plaintext is recovered.**

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

A compact arithmetic grammar can be written that covers **every zero-based authenticated source index 0 through42 exactly once**. That coverage is exact, but the nine-block order was recognized retrospectively and is not yet selected by an authenticated source instruction.

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

The later direct anchors land on central puzzle vocabulary. This is a meaningful cross-era correspondence, but it does not select the remaining block boundaries or establish a ciphertext operation.

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

## Adversarial evidence boundary

### Established by source reconstruction

- The original 2014 square metadata gives orders **5, 7, 5**, magic sums **3301, 1033, 1033**, and centers **809, 331, 91**.
- Ordinary BASE29 conversion gives **91=[3,4]**, **331=[11,12]**, and **1033=[1,6,18]**.
- With the 2013 signed protocol's DH equations, these fix **(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)**. The independent equations are A=g^a mod p, B=g^b mod p, A^b=B^a=K mod p, b·e=1 mod(p−1), and q=e+1.
- The authenticated 2016 source has **43 alphabetic words** under the stated tokenization (numeric 3301 and the OpenPGP key ID 7A35090F are not counted as words).
- Eight direct expressions hit eight exact words: g=5→EPIPHANY, a=6→SEEKS, A+g=13→WAY, b=15→WORDS, B=19→THEIR, p=23→ROAD, p+a=29→DIRECTION, and B+p=42→OPENPGP.
- Two archived signed 2013 text controls yield **552** contiguous 43-word windows. The maximum is **one of eight** direct-anchor hits; no window contains any complete proposed phrase block. This is a limited specificity control, not a blind significance test.
- Exhausting all **362,880** assignments of the nine state values finds one DH-valid tuple. Of the **720** assignments that also make u=q−e, A, a, and q positive and satisfy the proposed 43-position length identity, the correct tuple is the only 8/8 direct-anchor match. One wrong tuple reaches 7/8 and two reach 6/8.

### Why the full partition is not source-selected

- The proposed block lengths are **[1,8,6,4,4,9,6,4,1]**, with boundaries **[0,1,9,15,19,23,32,38,42,43]**.
- Holding the nine-block count and exact length multiset fixed still leaves **15,120** distinct block orders. The proposed order matches only **6 of 12** source punctuation boundaries. **150** alternatives match seven boundaries and **8** alternatives match eight; the proposed order is not uniquely selected by punctuation or clause structure.
- The eight-field axis [u,K,e,q,g,a,t,A]=[1..8] has a natural ascending order, and that order reads the striking opening phrase. But the source does not specify the later nine-block sequence, the use/order of 2A, 2B, p+A and B+p, or a general additive address grammar.
- The 2013 signed TCP specification defines BASE29 as a radix conversion and DH as a standard exchange. Its NEXT command stores client-supplied text; it is not an automatic next-state transition or block generator. The DH23 numerical example is also a conventional pedagogical exchange, not by itself an LP2 cipher key.
- The 43-word inventory uses alphabetic tokenization and a zero-based array offset. That is a workable convention, but the source does not explicitly say that the 2016 words are zero-based ordinals; treating the values directly as one-based ordinals leaves one position invalid and the final word unaddressed.
- **No genuine blind holdout was performed.** The complete signed message and proposed 0..42 table were already visible in the repository before this audit. The earlier full-message SFT is a retrospective arithmetic reproduction, not a held-out prediction.

### Relation to the p55 H/line-wrap register

The separate p55-directed H/line-wrap report claims recovery of the same 0..42 signed-source register from original LP2 ciphertext/layout receivers. That route uses original page/word material and the H transform; this DH tiling uses only the 2014 square metadata and the already-known signed 2016 text. They share the target register, not an independent unknown-page receiver. The DH tiling adds no new ciphertext prediction, typed LP2 output, or recovered plaintext. It should not be counted as independent confirmation of the H route.

The audit did not use the candidate p0 key, p50 receiver outputs, or unknown-page language to select the grammar.

## Decision

Preserve the independently reconstructed DH23 tuple, the [1..8] opening axis, and the eight direct lexical anchors as a meaningful cross-era structural correspondence. Preserve the full index table as a reproducible **retrospective arithmetic organization**, not as an established source-selected word map, state machine, cipher, or decryption.

Do not commission more variants of the nine-block arithmetic partition without a new original-source selector. A positive upgrade requires (1) an authenticated instruction that fixes the word origin and exact block order/expression grammar, (2) a genuinely blind held-out clause or terminal block, and (3) a new locked receiver or prediction on original unknown LP2 ciphertext. The missing link is the source-selected operation from this known text register back to an original ciphertext state.

## Reproduction

```text
node sims/lp2_dh_state_full_source_register_sft.cjs
node sims/lp2_dh_state_register_adversarial_sft.cjs
```

# P6 Fehu/title packet matches all four scheduled receiver-block GP0 sums

**Agent17, 28 November 2026. Classification: target-rune-blind aggregate receiver constraint and p40 tie-break. The serializer was recognized after the corridor receivers were known, so this is a finite post-discovery mechanism result, not plaintext authentication.**

## Result

P6 already supplies the source-tail block schedule through its printed red-title word lengths:

```text
[q,1,q,K] = [4,1,4,2].
```

Apply that same partition to the eleven already selected manuscript receivers p32..p42, after only the independently established marker removals on p36, p41 and p42. The prepared receiver GP0 values are:

```text
p32..p35  [5,28,6,3]
p36       [16]
p37..p40  [9,1,18,25]
p41..p42  [6,6]
```

The four scheduled receiver-block sums are therefore:

```text
Cblock = [13,16,24,12].
```

This is an exact literal p6 red-title packet. Let `F=0` be the adjacent large red Fehu, let the first red-title word be

```text
W1 = [24,16,14,17],
```

and the terminal red-title word be

```text
W4 = [14,12].
```

With the repository's frozen pair map `H(x,y)=[x-y,x+y] mod29`,

```text
H(F,W1[1]) || [W1[0],W4[1]]
= H(0,16) || [24,12]
= [13,16,24,12]
= Cblock.
```

Equivalently in the established p6 state notation:

```text
Cblock = [b-K,K-b,-g,aK].
```

The relation uses only p6's visible red object and selected ciphertext receivers. It does not use the rune spelling of YOU..OPENPGP, fitted coordinatewise keys, or English scoring.

## Distinction from the q-block edge relation

The published q-block edge result compares corresponding GP0 values in p37..p40 against p32..p35 and obtains the p6 physical-edge packet `[q,K,aK,p-1]`. This result instead collapses **all four schedule blocks**, including singleton p36 and terminal p41/p42, to four block totals and matches those totals directly to a Fehu/title-rune packet.

```text
q-block lane delta:
GP0(C37..40)-GP0(C32..35) = [q,K,aK,p-1]

all-block checksum:
sum GP0(C) inside [q,1,q,K] blocks = [b-K,K-b,-g,aK].
```

## Target-rune-blind p40 tie-break

The p6 block3 residue/arity grammar fixes p37 start146, p38 start57 and p39 start132 uniquely. On p40 it leaves exactly three complete four-rune candidates with start residue13:

```text
start13   GP0=3
start71   GP0=25
start216  GP0=27.
```

Substitute each candidate into the full four-block receiver checksum:

```text
p40 start13   -> [13,16, 2,12]
p40 start71   -> [13,16,24,12]
p40 start216  -> [13,16,26,12].
```

Only start71 equals the literal p6 packet. This supplies an aggregate tie-break independent of the separate p6 address71 route and without using `GP0(PATHS)`.

**Later chronological cross-holdout.** This p40 candidate set and start71 selection were already present in commit `59f78d11810630de64cee1924478f5fe33c0b9f2` at 10:00:11Z. Four minutes later, the independently developed chapter-rubric sum→product route first appeared. Its terminal p40 first-black word has `(sum,product)=(27,3)`: exactly the two GP0 residues rejected here, while this checksum retains25. Across all 53 original black words on p40, that unordered `{3,27}` pair occurs once, on the route-selected first black word. This strengthens cross-structure coherence without changing this report's evidence boundary: the connection was recognized after both analyses and still supplies no ordered full rune key.

Cross-reproducer: `sims/lp2_p40_route_rejected_residue_crossholdout_sft.cjs`.

P32 remains unresolved by this checksum: its two residue/arity candidates at starts1 and30 both have GP0=5, so the existing first-full-stop endpoint is still needed to choose start30.

## Finite p6-visible family charge

Because the exact field roles were recognized after the corridor, charge a broader visual family. Use all eleven runes printed in the p6 red title. Let `x`, `y` and `z` independently range over all eleven title positions, including repeats. Form

```text
H(F,x) || [y,z] = [-x,x,y,z]
```

and grant all 24 coordinate permutations. This is

```text
11^3 * 24 = 31,944 labeled constructions
```

which collapse to **5,856 distinct numeric four-vectors**.

Test the three p40 residue/arity candidates while holding every other scheduled receiver fixed. Exactly one resulting checksum belongs to this broad family:

```text
start13   [13,16, 2,12]  -> no
start71   [13,16,24,12]  -> yes
start216  [13,16,26,12]  -> no.
```

The successful direct printed-order representation is

```text
x = W1[1] = 16
y = W1[0] = 24
z = W4[1] = 12
[-x,x,y,z] = [13,16,24,12].
```

This is a bounded post-discovery charge, not a discovery-wide probability.

## Block-total key-sum consequence

The source-only p6 corridor selector established authenticated-source block GP0 totals

```text
Pblock = [13,6,18,18].
```

Subtracting source totals from receiver totals gives the aggregate additive-key sums:

```text
Cblock - Pblock
= [0,10,6,23]
= [F,K*g,a,p].
```

Under frozen H4 this is

```text
H4([0,10,6,23])
= [6,4,16,23]
= [a,q,K-b,p].
```

This aggregate shift has a direct **inner-title** realization, which is stronger than merely relabeling its four residues with the saturated state vocabulary. P6's singleton title word and second q-word are:

```text
W2 = [19]
W3 = [6,27,15,17].
```

The fixed endpoint H pair for W3 is:

```text
H(W3[0],W3[3])
= H(6,17)
= [18,23].
```

Therefore the complete block-key shift is read from the inner title as:

```text
D
= [F, -W2[0], W3[0], Hsum(W3 endpoints)]
= [0,10,6,23].
```

This gives a causal checksum grammar:

```text
source block totals P = [13,6,18,18]
p6 inner-title shift D = [0,10,6,23]
------------------------------------------------
predicted receiver totals C = P + D
                            = [13,16,24,12].
```

No unknown receiver GP0 is needed to compute the prediction.

Charge the inner-title extraction broadly. Keep the visible Fehu `F=0`; allow either sign of the singleton W2 rune; choose any of the four W3 runes; choose either endpoint-H coordinate of W3; and allow all 24 coordinate permutations. This gives exactly

```text
2 * 4 * 2 * 24 = 384
```

labeled constructions, all **384 numerically distinct**.

For the three target-blind p40 residue/arity candidates, subtract the independently source-selected `Pblock` from each candidate receiver-block checksum:

```text
p40 start13   -> D=[0,10,13,23] -> no family hit
p40 start71   -> D=[0,10, 6,23] -> one family hit
p40 start216  -> D=[0,10, 8,23] -> no family hit.
```

The successful vector has exactly **one labeled realization** in the 384-case family:

```text
W2 sign       = negative
W3 rune       = first
W3 endpoint H = sum
coordinate order = printed block order

=> [F,-W2[0],W3[0],Hsum(W3 endpoints)]
 = [0,10,6,23].
```

The frozen H4 image of the same key-block shift is also literal p6 title data:

```text
H4(D)
= [6,4,16,23]
= [W3[0], len(W1), W1[1], Hsum(W3 endpoints)].
```

Thus the title supplies both raw and H-serialized forms without invoking a coordinatewise state-name search.

This remains an aggregate constraint: it predicts the four **block key sums**, not any page's complete ordered rune key. The grammar was recognized after the corridor, so it is a post-discovery mechanism candidate rather than plaintext authentication.

## Page-level key-sum serializer

The aggregate shift can be resolved further: the eleven **individual page-key sums** have compact p6 title/Fehu shells by the same printed block partition.

The fitted local keys imply the following page sums, grouped by p6's `[q,1,q,K]` title lengths:

```text
block1 p32..p35: [4,0,0,25]
block2 p36:      [10]
block3 p37..p40: [7,0,28,0]
block4 p41..p42: [5,18].
```

These are not merely short state labels. Each complete block vector is generated from literal p6 title fields under the already frozen H serialization.

### Block1: the two q-word lengths plus Fehu

The two q-length title words W1 and W3 have lengths 4 and4. Their sum is 8. With the visible Fehu `F=0`:

```text
shell1 = [len(W1)+len(W3), F, F, F]
       = [8,0,0,0].

H4^-1(shell1)
= [4,0,0,25].
```

### Block2: negate the singleton title rune

The singleton title word is:

```text
W2=[19].
```

Thus:

```text
keysum36 = -W2[0] mod29
         = 10.
```

### Block3: W1 endpoint difference and singleton length

The endpoints of W1 are 24 and17, so:

```text
Hdiff(W1 endpoints) = 24-17 = 7.
len(W2) = 1.
```

Use the symmetric shell:

```text
shell3
= [Hdiff(W1 endpoints), len(W2), -len(W2), Hdiff(W1 endpoints)]
= [7,1,28,7].

H4^-1(shell3)
= [7,0,28,0].
```

### Block4: W1 second rune and W3 endpoint sum

P6 exposes:

```text
W1[1] = 16
Hsum(W3 endpoints) = 6+17 = 23.
```

Therefore:

```text
shell4 = [16,23].

H2^-1(shell4)
= [5,18].
```

Concatenating the four blocks predicts the complete page-key checksum tape:

```text
Ksum32..42
= [4,0,0,25 | 10 | 7,0,28,0 | 5,18].
```

Its p6 block totals are exactly the inner-title shift already derived above:

```text
[4+0+0+25, 10, 7+0+28+0, 5+18] mod29
= [0,10,6,23].
```

### Receiver prediction from signed-source GP0

The authenticated source interval has page-aligned GP0 values:

```text
YOU WILL BE FOUND | GOOD | LUCK BEWARE FALSE PATHS | VERIFY OPENPGP
 1   28   6   7   |  6   |  2     1     19   25   |   1      17
```

Add the p6-predicted page-key sums:

```text
predicted receiver GP0
= [5,28,6,3 | 16 | 9,1,18,25 | 6,6].
```

These are exactly the GP0 values of the independently prepared corridor receivers.

For the residue/arity grammars, this checksum tape makes an operational prediction. P32 retains starts1/30 because both have GP0=5. P33, p34, p35, p37, p38 and p39 already have unique residue/type receivers and all meet their predicted GP0. P40's three residue/arity candidates have GP0 `3,25,27`, so the predicted value25 selects start71 uniquely without the address71 rule. The exceptional p36/p41/p42 receiver transformations independently land on GP0 `16,6,6`, matching the schedule.

Thus source GP0 + p6 title/Fehu predicts a per-page receiver checksum across the entire eleven-page schedule.

### Finite blockwise role charges

Because the serializer was found after the fitted keys, charge each block against broad title-local role families.

**Block1.** Choose an ordered pair of the four printed title-length roles, sum them, allow either sign, place the resulting value in any of the four H4-shell coordinates, and fill the other three with Fehu zero. The family has 128 labeled forms and 48 distinct output key-sum vectors. The observed block1 vector has one numeric shell, `[8,0,0,0]`; its four labeled aliases are only the repeated q-role choices `W1/W3`.

**Block2.** Allow either sign of any of the eleven printed title-rune positions. The 22 labeled forms collapse to 14 numeric outputs. The observed value10 has exactly one labeled realization: negative W2's singleton rune19.

**Block3.** Choose either endpoint-H coordinate from either q-word, choose any printed title-length role `u`, form `[x,u,-u,x]`, and grant all 24 coordinate permutations. The 384 labeled forms give 144 distinct output vectors. The observed block3 vector has one numeric shell, `[7,1,28,7]`; its two labeled hits are the identical permutation caused by repeated x, with x fixed to W1 endpoint difference7 and u fixed to W2 length1.

**Block4.** Choose any of the eleven title-rune positions, either endpoint-H coordinate from either q-word, and either two-coordinate order. The 88 labeled forms give 71 distinct outputs. The observed `[5,18]` has exactly one labeled realization: shell `[16,23]` from W1[1] and the W3 endpoint sum.

These counts are post-discovery finite-family diagnostics. They show that the published page-sum tape is not automatically produced by the obvious p6 title-local role freedoms, but they do not convert a retrospective checksum fit into an authenticated full key schedule.

### Consequence

The central key problem is now narrower than “find eleven arbitrary page keys.” P6 supplies a candidate **page-level key-sum scheduler** that predicts the GP0 delta for every scheduled page. A complete cipher still needs the within-page coordinate serializer: many equal-sum key vectors remain possible, and the exact local keys were originally obtained using known targets.

A decisive next test should therefore preserve these eleven p6-predicted sums while deriving coordinate order/values from an authored source object, or prospectively apply the same checksum grammar to a genuinely fresh receiver family. The page-sum schedule should be retired rather than tuned if such a transfer fails.

## Thirteen-page boundary checksum shell

The signed-tail boundary object is thirteen words, p30..p42: the p6-selected eleven-word core plus the independently motivated omitted `K=2` prefix `SEEK AND`. The earlier boundary report already derives complete p30 and p31 geometry keys from p6 title endpoints:

```text
key30 = [6,14,23,6]  -> sum20
key31 = [17,14,7]    -> sum9.
```

See [the skipped-K2 boundary report](lp2-p6-skipped-k2-seek-and-boundary.md). Those complete keys predate the page-sum schedule derived here.

Prefix their sums to the new p32..p42 tape:

```text
Ksum30..42
= [20,9,4,0,0,25,10,7,0,28,0,5,18].
```

Apply the frozen split H serialization to this odd-length 13-vector. Its outer-to-inner differences, center, then inside-to-outside sums are:

```text
Hsplit(Ksum30..42)
= [2,4,4,1,0,18 | 10 | 3,0,28,4,14,9].
```

The **entire six-coordinate difference half plus center** is literal p6 title/Fehu data:

```text
[2,4,4,1,0,18 | 10]
=
[len(W4), len(W1), len(W3), len(W2),
 F, Hdiff(W3 endpoints) | -W2[0]].
```

Numerically:

```text
len(W4)=2
len(W1)=4
len(W3)=4
len(W2)=1
F=0
Hdiff(6,17)=18
-W2[0]=-19=10 mod29.
```

This gives six symmetric page-sum constraints and a center constraint:

```text
k30 - k42 =  2 = len(W4)
k31 - k41 =  4 = len(W1)
k32 - k40 =  4 = len(W3)
k33 - k39 =  1 = len(W2)
k34 - k38 =  0 = F
k35 - k37 = 18 = Hdiff(W3 endpoints)
k36         = 10 = -W2[0].
```

The first two are especially useful because they cross the 11-page core boundary. Starting only from the p6-derived core sums:

```text
k42=18 -> k30 = 18+len(W4) = 20
k41=5  -> k31 =  5+len(W1) =  9.
```

Those are exactly the sums of the **previously independently derived complete** p30/p31 geometry keys. Thus the new core page-sum scheduler predicts a property of the older skipped-prefix inverses rather than merely restating an in-core fit.

### Broad seven-field prefix charge

Charge the ordered seven-field Hsplit prefix without keeping the successful title roles fixed:

- permute the four printed title-word **roles** in all 24 orders and emit their lengths;
- choose either endpoint-H coordinate from either q-word (4 roles);
- choose either sign of any of the eleven printed title-rune positions for the center (22 roles);
- keep the visible Fehu zero in the fifth difference slot.

This gives:

```text
24 * 4 * 22 = 2,112 labeled constructions.
```

Because the two q-word lengths are both4 and several title rune values repeat, these collapse to **672 distinct numeric seven-field prefixes**.

The observed prefix

```text
[2,4,4,1,0,18,10]
```

has exactly **two labeled representations**, differing only by swapping the two q-length word roles W1/W3 in positions that both emit4. The endpoint role is uniquely W3 difference; the center role is uniquely negative W2. So the nontrivial fields are not supplied by a large collection of interchangeable title coordinates.

Again, this is a post-discovery finite charge. Its value is cross-boundary consistency and a concrete H-difference skeleton for the page-sum tape, not a calibrated authorship probability.

### Complete candidate 13-shell from the held-out boundary source

The remaining Hsplit sum half is:

```text
[3,0,28,4,14,9].
```

There is now one compact source/title construction for all six coordinates. The independently selected boundary source pair is:

```text
SEEK = [15,18,18,5], length4
AND  = [24,9,23],    length3.
```

The earlier p30/p31 boundary serializer used SEEK's endpoints and AND's **last** rune; it explicitly held out `SEEK[1:3]=[18,18]` and `AND[0:2]=[24,9]`. Therefore `AND[1]=9` is an independently held-out source coordinate relative to those complete key formulas.

The full sum half is:

```text
[len(AND), F, -len(W2), len(SEEK), W4[0], AND[1]]
= [3,0,28,4,14,9].
```

Together with the already established difference half and center, the complete candidate shell is:

```text
Hsplit(Ksum30..42)
=
[
  len(W4), len(W1), len(W3), len(W2), F, Hdiff(W3 endpoints),
  -W2[0],
  len(AND), F, -len(W2), len(SEEK), W4[0], AND[1]
]

= [2,4,4,1,0,18,10,3,0,28,4,14,9].
```

Inverting the frozen Hsplit transform gives exactly:

```text
Ksum30..42
= [20,9,4,0,0,25,10,7,0,28,0,5,18].
```

This is the first single p6 + authenticated-boundary-source serializer in this investigation that predicts the **complete thirteen-page key-sum tape**.

### Finite charge for the sum half

Because the successful six roles were recognized after the checksum tape, charge them broadly while preserving only their semantic types:

1. first coordinate: either boundary-word length, SEEK or AND;
2. second coordinate: fixed visible Fehu zero;
3. third coordinate: either sign of any of the four printed title-word length roles;
4. fourth coordinate: either boundary-word length;
5. fifth coordinate: either sign of either W4 endpoint;
6. sixth coordinate: either sign of any of the four source coordinates explicitly held out by the earlier p30/p31 key formulas: SEEK's two interior runes and AND's first two runes.

This is:

```text
2 * 8 * 2 * 4 * 8 = 1,024 labeled constructions,
```

collapsing to **576 distinct numeric sum halves**.

Exactly **one labeled realization** equals the observed sum half:

```text
first length   = AND length3
signed title length = -len(W2) = -1 = 28
fourth length  = SEEK length4
signed W4 endpoint = +W4[0] = 14
held-out source coordinate = +AND[1] = 9.
```

Combined with the previous seven-field prefix charge, the p6/source construction now covers all thirteen Hsplit coordinates. The family counts are post-discovery diagnostics, not calibrated probabilities.

### Receiver-GP0 consequence across the full p30..p42 boundary

SEEK and AND both have GP0 residue27. The newly unified checksum shell predicts their receiver GP0 values before reading the receiver runes:

```text
p30: 27 + k30(20) = 18 mod29
p31: 27 + k31(9)  =  7 mod29.
```

The independently established p30/p31 receivers satisfy exactly:

```text
p30 start112 [21,3,12,11] -> GP0 18
p31 start126 [12,23,1]    -> GP0 7.
```

Together with the core prediction already shown, the complete receiver checksum tape is therefore:

```text
p30..p42 predicted/observed GP0
= [18,7,5,28,6,3,16,9,1,18,25,6,6].
```

The receiver locations themselves still come from the independently documented page-local shell/residue/numbered grammars. This checksum serializer constrains and cross-validates them; it does not replace those receiver selectors.

### Evidence boundary for the complete checksum serializer

This result materially changes the checksum frontier: the p6 title, visible Fehu, and authenticated `SEEK AND` boundary source now specify a complete thirteen-page **key-sum** tape under one Hsplit shell.

It still does **not** specify the within-page key coordinates. Equal-sum rune vectors remain plentiful, and the p32..p42 complete local keys were originally obtained from known-source inverses. The serializer is also retrospective in discovery order. Promotion to a cipher mechanism therefore still requires a source-selected coordinate serializer, a prospective transfer to a fresh receiver, or another independent clue that fixes the per-rune distribution rather than only its page sum.

## Evidence boundary and decision

Preserve:

```text
p6 schedule [q,1,q,K]
+ independently selected/prepared receivers p32..p42
-> receiver block GP0 sums [13,16,24,12]
-> exact visible p6 packet H(F,W1[1]) || [W1[0],W4[1]]
-> broad title-family charge rejects both wrong p40 residue candidates.
```

This materially strengthens the claim that p6 organizes receiver state across the **entire** 11-page corridor rather than only supplying isolated local scalars. It also removes address71 as the sole tie-break for the block3 residue grammar under this post-discovery family.

It does **not** authenticate YOU..OPENPGP as unknown plaintext. The central remaining gate is an authored ordered serializer that predicts complete value-changing keys, preferably before target scoring or on a genuinely fresh receiver.

## Reproduction

Run:

```text
node sims/lp2_p6_receiver_block_gp0_packet_sft.cjs
```

The SFT reconstructs canonical page-local words, the p6 red title, all scheduled receiver preparations used here, the three p40 residue/arity candidates, the four block totals, and the complete 31,944-label / 5,856-vector visual family.

# Source-linked p22 square literally executes SHED CIRCUMFERENCES -> DIVINITY WITHIN -> EMERGE

**Agent49, 19 November 2026. Classification: source-constrained structural mechanism with a reproduced finite rival family. No unknown LP2 plaintext is claimed.**

## Route into the object

The p55 recursive-SHED receiver now gives:

```text
p55 cores [1,6,2,11,18]
 -> GP0 38
 -> p50[38]=2D
 -> base59 131 = CIRCUMFERENCES
 -> unique 131-rune page p22
```

P22 independently carries a mirrored reuse of the original LP1 p14-p16 illustration sequence. The original source pages visibly provide:

```text
VOICE OF THE CIRCUMFERENCE
DISCOVER TRUTH INSIDE YOURSELF
KNOW THIS
```

followed by the original 5x5 integer square:

```text
434   1311  312   278   966
204    812  934   280  1071
626    620  809   620   626
1071   280  934   812   204
966    278  312  1311   434
```

Every row, column and main diagonal sums to 3301.

Solved p57 independently commands:

```text
WE MUST SHED OUR OWN CIRCUMFERENCES
FIND THE DIVINITY WITHIN AND EMERGE
```

The new p55->p22 handoff supplies a direct reason to apply that literal instruction to this already source-linked square.

## Literal operation

Recursively remove the current square's circumference.

For the 5x5 square:

```text
5x5
 -> shed outer 16 cells
 -> 3x3
 -> shed outer 8 cells
 -> 1x1
 -> 809
```

There is no starting corner, traversal direction, phase or cipher key to choose. Any circumference removal leaves the same center.

The center **809 is the only prime-valued cell among all 25 cells**.

Thus the source wording has a literal structural reading:

```text
SHED ... CIRCUMFERENCES
 -> recursively remove square borders

FIND THE DIVINITY WITHIN
 -> center 809, the square's sole prime cell
```

The interpretation of prime as the relevant "divinity" is supported by Cicada's pervasive prime-number machinery, while the stronger evidence is the next exact table consequence.

## EMERGE consequence

The p50 object has 256 cells and the established navigation origin is zero-based. Reduce the emerged integer to the table:

```text
809 mod 256 = 41
p50[41] = 1O
base59(1O) = 83
GP0(EMERGE) = 83
```

So the literal center selected before the table read returns the final word of the solved instruction:

```text
... FIND THE DIVINITY WITHIN AND EMERGE
                              809 -> EMERGE
```

This exact `809 -> 41 -> 1O -> 83 -> EMERGE` route was not present in earlier repository commits; searches for `809 EMERGE` and `809 mod256` were empty before this result.

## Circumference checksum under the same fixed state

Use the same zero-based modulo256 address and the same post-SHED base59 table state on all 25 source-square cells.

Exactly three cell positions land on solved-p57 GP0 words:

```text
row1 col2   1311 mod256=31 -> p50[31]=2D -> base59 131 = CIRCUMFERENCES
row3 col3    809 mod256=41 -> p50[41]=1O -> base59  83 = EMERGE
row5 col4   1311 mod256=31 -> p50[31]=2D -> base59 131 = CIRCUMFERENCES
```

The two `1311` cells are 180-degree symmetric and both lie on the outer circumference. The center is the unique non-circumference hit.

So the fixed base59 square read has the exact topology:

```text
outer circumference -> CIRCUMFERENCES
center               -> EMERGE
```

No inner 3x3 non-center cell maps to a solved-p57 word under this fixed read.

## Radix rival preserved

Base60 is a real upstream rival and is not hidden.

Under zero-based modulo256 with base60, the solved-p57 hits are the two symmetric outer `966` cells:

```text
966 mod256=198
p50[198]=1j
base60(1j)=105=GP0(DIVINITY)
```

Those are at row1 col5 and row5 col1.

The current route uses base59 because that state was independently fixed by the post-SHED p50 consumer before this square was examined. The base60 `DIVINITY` pair is retained as secondary structure rather than being mixed into the primary operation.

## Center rival family

For the center, charge four source-native numerical representations:

```text
raw center       809
phi(center)      808
prime ordinal1   140
prime ordinal0   139
```

For each, charge zero/one address origin and base59/base60 output, for 16 configurations.

Only one configuration reaches any solved-p57 word:

```text
raw809
zero-based mod256 address41
base59
 -> EMERGE
```

All 15 alternatives miss the complete p57 GP0 register.

## Exact token-multiset control

The two decisive fixed addresses require token classes:

```text
address31 -> 2D -> CIRCUMFERENCES
address41 -> 1O -> EMERGE
```

In the exact 256-cell table multiset:

```text
2D occurs 2 times
1O occurs 3 times
```

Under a uniform permutation preserving the exact token multiset, the probability of these two preselected distinct addresses receiving those exact token classes is:

```text
(2/256) * (3/255) = 1/10880
```

This is a supporting fixed-address null, not a standalone proof.

## Independent 809 echo

An older p7 investigation, committed 14 November before this route, had already isolated source-linked prime **761** and a visible five-step clue. In the ordinary prime sequence:

```text
761 is prime #135
809 is prime #140

five successors after 761:
769, 773, 787, 797, 809
```

That older work correctly rejected direct p56-style prime-totient cipher starts from these values. The negative remains valid.

The new square mechanism supplies an independent literal route to **809** rather than reviving the failed cipher. The two paths now converge on the same prime object.

## Relation to the older p22 square negative

Director #1080's 15 November p22 test used one hypothesized clockwise outer-in ordering of all 25 square numbers as a repeating additive GP29 key. It failed language tests and was retired.

Its report explicitly identified the missing premise: no first-party instruction selected the proposed square consumer.

The present result does not rescue that cipher. It supplies a different, literal consumer that is now source-selected by:

1. p55 `CIRCUMFERENCES=131` routing to p22;
2. the p22-linked LP1 source's own circumference/inside wording;
3. solved p57's explicit `SHED ... CIRCUMFERENCES / FIND ... WITHIN / EMERGE` instruction.

The old additive-key inverse stays negative.

## Interpretation

This is a plausible intended human solve step because every major action is visible and motivated:

```text
p55 says CIRCUMFERENCES and selects p22
 -> p22's mirrored art points to LP1 p14-p16
 -> source says CIRCUMFERENCE / INSIDE / KNOW THIS
 -> p57 says SHED CIRCUMFERENCES, FIND DIVINITY WITHIN, EMERGE
 -> peel square borders
 -> sole-prime center809
 -> p50 mod256/base59
 -> EMERGE
```

It recovers an authentic instruction-state transition and a concrete source-derived prime **809**. It does not yet specify an unknown-page decryption key or recover unknown prose.

## Reproduction

```text
node sims/lp2_p22_square_shed_divinity_emerge_sft.cjs
```

Windows GitHub Actions:

```text
run 44471959972
windows-latest
Node 22
PASS
```

Supporting commits:

```text
601ae88e31d61fc23a6c6693c4a9790d103571ad  initial SFT
14b3ebc4021b38789b1fb713de8fd365ab6d405f  workflow
bce2850b3af477ff4227c837b89bb403a97853e1  exact token-null control
```

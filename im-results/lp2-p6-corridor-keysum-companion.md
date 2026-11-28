# P6 companion packet serializes additive key sums across all eleven corridor pages

**Agent44, 28 November 2026. Classification: new source-visible, corridor-wide additive-key-sum serializer. It predicts one scalar invariant per prepared receiver, not the complete coordinatewise key. The construction was recognized after the local inverses and is therefore a finite post-discovery mechanism result, not plaintext authentication. Its value is that one ordered p6 packet now explains the required key sum on every p32..p42 page and independently reselects authenticated source words32..42 from all 33 eleven-word source windows.**

## Inputs fixed before this construction

The p6 source selector fixes the eleven-rune red title against the eleven-word corridor:

~~~text
title runes T
[24,16,14,17 | 19 | 6,27,15,17 | 14,12]

source schedule
[q=4] YOU WILL BE FOUND
[1]   GOOD
[q=4] LUCK BEWARE FALSE PATHS
[K=2] VERIFY OPENPGP
~~~

The current target-blind receiver program, after only its independently selected marker removals on p36, p41 and p42, gives prepared receiver GP0 values:

~~~text
C =
[5,28,6,3 | 16 | 9,1,18,25 | 6,6].
~~~

No fitted coordinatewise key is needed below.

For any candidate source word with GP0 value P, additive subtraction requires only the scalar invariant

~~~text
sigma = GP0(key) = C - P mod29.
~~~

The question is whether p6 supplies the eleven sigma values in one ordered grammar rather than eleven independent fitted sums.

## The companion equation

For authenticated source32..42, the exact required key sums are:

~~~text
sigma =
[4,0,0,25 | 10 | 7,0,28,0 | 5,18].
~~~

Subtract the aligned p6 title rune at each page:

~~~text
D = sigma - T
  = [9,13,15,8 | 20 | 1,2,13,12 | 20,6].
~~~

This companion vector preserves the printed p6 block schedule exactly.

More importantly, each block has a concrete p6 artifact readout under the already frozen H pair transform.

### First q block

~~~text
D1 = [9,13,15,8]

H4(D1)
= [1,27,28,17]
= [len(W2), W3[1], -len(W2), W1.last].
~~~

Thus

~~~text
D1 = H4^-1([1,-K,-1,K+b]).
~~~

### Singleton

~~~text
D2 = [20],
~~~

the p6 physical line width20 that occurs once on each side of the red title divider.

### Second q block

The title shares one physical line with seven following black runes. Counting all runes on that physical line gives 18.

~~~text
D3 = [1,2,13,12]

H4(D3)
= [18,18,15,13]
= [title-line-count,
   title-line-count,
   W3[2],
   closing red marker].
~~~

The closing marker is the established red value13 immediately after W4.

### Terminal K block

~~~text
D4 = [20,6]

H2(D4)
= [14,26]
= [W4.first, GP0(W4)].
~~~

Therefore the complete scalar serializer is

~~~text
sigma_i = T_i + D_i mod29

D =
H4^-1([len(W2),W3[1],-len(W2),W1.last])
|| [balanced20]
|| H4^-1([titleLine,titleLine,W3[2],redMarker13])
|| H2^-1([W4.first,GP0(W4)]).
~~~

Numerically:

~~~text
T =
[24,16,14,17 | 19 | 6,27,15,17 | 14,12]

D =
[ 9,13,15, 8 | 20 | 1, 2,13,12 | 20, 6]

sigma = T + D =
[ 4, 0, 0,25 | 10 | 7, 0,28, 0 |  5,18].
~~~

These are exactly the sums of the eleven independently published local additive keys.

## Broad typed family charge

Because the exact field roles were recognized after the corridor, do not freeze them without charging nearby choices.

Build four typed companion-block families.

### Block1 family

Choose:

- any printed p6 title-word length L from [4,1,4,2];
- any title rune y;
- any title rune z;

and form

~~~text
H4^-1([L,y,-L,z]).
~~~

This gives **243 distinct numeric block1 companions**.

### Singleton family

Choose any distinct full physical p6 rune-line count from

~~~text
{3,18,19,20,22,24},
~~~

giving **6** possibilities.

### Block3 family

Choose:

- any full physical p6 rune-line count r;
- any title rune y;
- the fixed closing red marker13;

and form

~~~text
H4^-1([r,r,y,13]).
~~~

This gives **54 distinct numeric block3 companions**.

### Terminal family

Choose:

- either W4 rune x;
- GP0 of any of the four title words g0;

and form

~~~text
H2^-1([x,g0]).
~~~

This gives **8 distinct numeric terminal companions**.

The Cartesian family therefore contains

~~~text
243 * 6 * 54 * 8
= 629,856
~~~

distinct eleven-lane companion packets.

The successful roles are:

~~~text
block1:
L=1, y=27, z=17
H4^-1([1,27,28,17])
= [9,13,15,8]

singleton:
20

block3:
r=18, y=15
H4^-1([18,18,15,13])
= [1,2,13,12]

terminal:
x=14, g0=26
H2^-1([14,26])
= [20,6].
~~~

## Source-window holdout inside the authenticated message

Do not test only the already known words32..42.

For each of all **33 contiguous eleven-word windows** in the authenticated 43-word signed source:

1. compute canonical GP0 values P[0..10];
2. hold the prepared manuscript receiver GP0 vector C fixed;
3. hold the aligned p6 title rune vector T fixed;
4. derive the only companion vector that could satisfy additive key sums:

~~~text
D_required = C - P - T mod29;
~~~

5. test whether its four blocks belong to the 243 × 6 × 54 × 8 typed p6 family above.

Exactly **one source window survives**:

~~~text
source32..42

YOU WILL BE FOUND
GOOD
LUCK BEWARE FALSE PATHS
VERIFY OPENPGP
~~~

with

~~~text
P =
[1,28,6,7 | 6 | 2,1,19,25 | 1,17]

D_required =
[9,13,15,8 | 20 | 1,2,13,12 | 20,6].
~~~

No other eleven-word authenticated source window has a required key-sum companion in the broad typed p6 family.

This is a finite family result, not a discovery-wide probability. The companion syntax was found after the corridor. Its significance is causal compression: p6, the target-blind prepared receivers and an authenticated source window now determine all eleven additive-key sums under one grammar without opening any coordinatewise fitted key.

## Relation to the earlier block-total checksum

Agent17 independently established prepared receiver block totals

~~~text
Cblock = [13,16,24,12]
~~~

and source block totals

~~~text
Pblock = [13,6,18,18],
~~~

so aggregate key sums are

~~~text
sigmaBlock = [0,10,6,23].
~~~

The new companion serializer refines that four-block checksum to all eleven lanes.

Its companion block totals are:

~~~text
sum(D blocks)
= [16,20,28,26]
= [W1[1], balanced20, -1, GP0(W4)].
~~~

Adding the four title-word GP0 values [13,19,7,26] gives exactly [0,10,6,23] mod29.

Thus the lane serializer is consistent with, and strictly more informative than, the independently published block-total constraint.

## Evidence boundary and next decision

Preserve the following necessary invariant for any complete corridor decoder:

~~~text
GP0(key_i)
=
alignedTitleRune_i
+
p6Companion_i
mod29.
~~~

This reduces the ordered-key problem materially: a future coordinatewise serializer no longer has freedom in its total sum on any of the eleven pages.

It still does **not** specify the ordered key coordinates. Many different keys have the same sum, and the exact local keys remain post-target objects unless a source-visible coordinate rule is found.

The strongest next step is therefore narrow: find a coordinatewise refinement whose per-page output automatically has these frozen sums, preferably one that transfers prospectively to an unseen receiver or is explicitly licensed by a first-party visual instruction. Reject candidate serializers that do not reproduce this eleven-lane sum packet.

## Reproduction

Run:

~~~text
node sims/lp2_p6_corridor_keysum_companion_sft.cjs
~~~

The SFT reconstructs the authenticated source GP0s, p6 title and line fields, the 629,856 numeric typed companion family, all 33 source-window requirements, and the unique source32..42 survivor.

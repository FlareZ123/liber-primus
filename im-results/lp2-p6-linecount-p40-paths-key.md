# P6 physical line counts and red-title atoms reconstruct the p40 PATHS key

**Agent3, 28 November 2026. Classification: source-literal finite key reconstruction for the route-selected p40 PATHS candidate; post-discovery template, not yet an authenticated reusable key.**

## Why this test became meaningful

The p40 PATHS inverse was historically retrospective: once PATHS was assigned, its exact subtraction key was `[20,20,12,6]`, and H mapped that key to a compact DH shell. Agent3's p28 D4 origin charge now fixes the signed-source/page convention upstream, so the p25 route selects `40=PATHS -> p40` before the p40 key is examined. That makes key sourcing—not target sourcing—the remaining local question.

P6 is independently selected by `SEEKS=6` and `a=6). Its red-title packet was previously charged globally over 47,221,704 role/state assignments and is unique in printed order. No p40 value is needed to locate it.

## Literal p6 source values

The ten non-empty physical rune lines on p6 have counts:

~~~text
20, 24, 24, 3, 18, 19, 20, 24, 22, 22
~~~

Therefore the set of **repeated** line counts is:

~~~text
R = {20,22,24}.
~~~

The four red-title words at starts 71,75,76,80 are:

~~~text
[24,16,14,17]
[19]
[6,27,15,17]
[14,12]
~~~

so their literal rune-value set is:

~~~text
T = {6,12,14,15,16,17,19,24,27}.
~~~

The previously established packet grammar independently labels two of those values:

~~~text
6  = a
12 = aK.
~~~

## Charged source-literal key family

Do not select `20,12,6` directly. Charge the full visible family:

1. choose any repeated p6 line count `r in R`;
2. choose any ordered `x,y in T`;
3. form `[r,r,x,y]`;
4. test subtraction and addition.

This gives **243 distinct fixed-order keys**.

Use the same finite receiver population already established by the four-rune calibration: every authenticated four-rune signed-source occurrence against project pages0..42, keeping only page/target pairs with exactly one complete word of matching length and exact GP0. There are **62** such typed pairs.

The fixed-order family has exactly one hit:

~~~text
source index40 PATHS
page p40
receiver offsets71..74 [4,15,14,21]
direction subtraction
key [20,20,12,6]
plaintext [13,24,2,15] = PATHS.
~~~

## Charge coordinate ordering too

The fixed order was noticed after the known key, so grant every unique permutation of every `[r,r,x,y]`. This produces **1,389 distinct numeric keys**. Only **52** have total GP sum0, as any equal-GP0 target/receiver key must.

Across the same 62 typed pairs and both directions, the result is unchanged: **one hit**, p40 PATHS with `[20,20,12,6]`. The matched source tail is `12=aK`, `6=a`; the two leading 20s are the two occurrences of the selected repeated line count.

For a still broader null, permit every key coordinate independently to be any direct `K/e/g/a` state value or any of those multiplied by any visible title length `1,2,4`. That 10-atom Cartesian family has 10,000 keys and gives three hits across the 62 pairs (SEEK/p40-add, LUCK/p19-sub, PATHS/p40-sub). Thus arbitrary p6 arithmetic is not identifying; the repeated-line/title structure is the discriminating source constraint.

## Relationship to the old H shell

The same key obeys:

~~~text
H([20,20,12,6]) = [14,8,3,26] = [-b,A,e,-e].
~~~

That shell is still valid. It is no longer the only way to regenerate the key: the source-literal p6 family reaches `[20,20,12,6]` directly, without choosing H-shell roles.

The new family also has a compact state reading:

~~~text
[20,20,12,6] = [p-e,p-e,aK,a] = [qg,qg,qe,a].
~~~

Those algebraic equalities are descriptive and not counted as independent evidence; small DH-expression grammars provide multiple alternate labels for the same coordinates.

## Evidence boundary

This materially strengthens the p40 candidate in two ways:

- the **target/page/origin** are now selected upstream by the p28→p29→p23→p25 route;
- the **complete numeric subtraction key** is the sole hit of a finite family made only from literal p6 line counts and red-title rune values, even after coordinate permutation.

It still does not make PATHS an established unknown plaintext. The key-family template itself was recognized after the PATHS inverse, and no second prospectively selected receiver is available in the same four-rune class: the family is p40-local in the 62-pair calibration. A decisive upgrade requires a first-party cue that selects this extraction form before the target, or a genuinely fresh receiver predicted under the frozen family.

## Reproduction

`node sims/lp2_p28_origin_selected_p29_p40_route_sft.cjs`

The integrated SFT reconstructs p28's origin discriminator, the p29/p25 route, p6 line counts and title atoms, both charged p6 key families, the p40 inverse, and the negative p41/p42 transfers.

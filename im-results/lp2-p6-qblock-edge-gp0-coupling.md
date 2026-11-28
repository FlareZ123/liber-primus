# P6 edge packet couples the two q-blocks by receiver GP0

**Agent44, 28 November 2026. Classification: new source-visible coupled receiver constraint for the p32–p40 corridor. P6 independently supplies a complete per-page arity schedule and a four-coordinate physical edge packet. Applied as a GP0 difference between corresponding positions of the two q-blocks, that packet predicts the p33 and p35 receivers uniquely and narrows p32/p34 to two candidates each. The cross-block GP0 operation was discovered after the existing corridor receivers, so this is a strong retrospective unification and a prospective grammar candidate, not an authenticated cipher or new plaintext.**

## 1. P6 supplies the complete 11-page arity schedule

The established p6 red title has printed word lengths

```text
[4,1,4,2] = [q,1,q,K]
```

and the fixed outside-in transform gives

```text
H4([4,1,4,2]) = [K,-e,g,a] = [2,26,5,6].
```

Thus the source-visible layout already fixes

```text
K=2, e=3, q=4, g=5, a=6.
```

The authenticated signed-source interval selected independently by p6, words32..42, has canonical GP-rune lengths

```text
YOU     WILL BE FOUND | GOOD | LUCK BEWARE FALSE PATHS | VERIFY OPENPGP
 3        4  2     5  |   4  |   4      6     5     4 |      6       7
```

which is exactly

```text
[e,q,K,g | q | q,a,g,q | a,g+K]
= [3,4,2,5 | 4 | 4,6,5,4 | 6,7].
```

This is stronger than the previously published four block sums: p6 supplies a page-by-page arity for every one of the eleven candidate receivers.

### Finite source-only charge

Keep the printed p6 block widths `[q,1,q,K]`, but forget the discovered within-block ordering. Charge:

```text
first q-block:  every permutation of {K,e,q,g}      24
singleton:      q                                     1
second q-block: every permutation of {q,q,g,a}       12
terminal block: both permutations of {a,g+K}          2
```

This gives 576 arity strings per contiguous 11-word source window. Across all 33 windows, exactly one matches: source32..42.

For a broader discovery-order control, permute the four labeled block roles themselves in all 24 orders. This is 456,192 labeled configurations across the source. There are only two labeled hits, both on source32..42:

```text
Q1, ONE, Q3, K4   <- printed p6 order
Q1, Q3, ONE, K4   <- boundary ambiguity because GOOD/PATHS both have q=4 length
```

No other 11-word source window survives. The printed p6 order resolves the only internal block-boundary ambiguity.

These counts are finite family diagnostics, not discovery-wide probabilities. The family was recognized after the corridor was already known.

## 2. The two q-blocks are coupled at the source level

Write the two q-block length vectors as

```text
L1 = [e,q,K,g] = [3,4,2,5]
L3 = [q,a,g,q] = [4,6,5,4].
```

Their componentwise difference is

```text
L3 - L1 = [1,K,e,-1]
        = [1,2,3,-1].
```

The same paired positions also have a compact canonical-GP0 relation. Modulo29:

```text
GP0(YOU,WILL,BE,FOUND)      = [1,28,6,7]
GP0(LUCK,BEWARE,FALSE,PATHS)= [2, 1,19,25]

difference = [1,K,b-K,p-g]
           = [1,2,13,18].
```

This establishes a source-side reason to treat the two q-blocks as paired four-lane objects rather than eight unrelated words.

## 3. A literal p6 edge packet equals the selected receiver-GP0 delta

P6 exposes a second four-coordinate object without using any candidate plaintext or unknown-page rune values:

```text
first red-title word length = q   = 4
last red-title word length  = K   = 2
last red-title rune         = aK  = 12
final physical line width   = p-1 = 22
```

In printed edge order this is

```text
E = [q,K,aK,p-1] = [4,2,12,22].
```

The final line width is literal in the original p6 line structure. The established physical rune-line counts are

```text
[20,24,24,3,18,19,20,24,22,22].
```

Now use the already independently selected second-q-block receivers:

```text
p37 start146  GP0=9   (double-index / raw next-state route)
p38 start57   GP0=1   (numbered section5 / LUCK->BEWARE route)
p39 start132  GP0=18  (prospectively fixed first g-word after red span)
p40 start71   GP0=25  (p6 self-address / width20 route)
```

The existing first-q-block receiver GP0 residues are

```text
p32 start30      GP0=5
p33 start132     GP0=28
p34 start4       GP0=6
p35 starts25..29 GP0=3
```

and therefore

```text
[9,1,18,25] - [5,28,6,3] mod29
= [4,2,12,22]
= E.
```

The relation is exact lane by lane.

## 4. Use E prospectively as a receiver constraint

The important test is not whether E can describe the known receivers. Fix the second-q-block anchors above and ask what E predicts on p32..p35 before using the source targets' GP0 values.

P6 already supplies the first-block arities `[e,q,K,g]=[3,4,2,5]`. On each first-block page, enumerate every contiguous sequence of complete printed groups whose total rune count equals that scheduled arity. The pool sizes are:

```text
p32 arity3:  3
p33 arity4: 10
p34 arity2: 10
p35 arity5: 16
```

The edge packet predicts required GP0 residues

```text
p32:  9 - q     =  5
p33:  1 - K     = 28
p34: 18 - aK    =  6
p35: 25 - (p-1) =  3   mod29.
```

The surviving arity-compatible group sequences are:

```text
p32 GP0=5:  starts 1 and 30
p33 GP0=28: start 132 only
p34 GP0=6:  starts 4 and 249
p35 GP0=3:  start 25 only (the established adjacent 2+3 packet ending29)
```

So the coupled rule independently reproduces the exact p33 and p35 receiver locations and reduces p32 and p34 to their already-known two-way ambiguities.

Those remaining ambiguities have independent source/layout resolutions already in the repository:

- p32: the self-indexed first full-stop endpoint selects start30 rather than start1; the new p6 arity `e=3` supplies the length requirement without consulting `YOU`.
- p34: the p33 `THEIR RISE` source operation predicts the `[B,0]` H2 key and selects start4 rather than start249.

Thus p6 arity + the q-block edge coupling + pre-existing independent tie-breakers reproduce all four first-q-block receivers from the four second-q-block anchors without using `GP0(YOU/WILL/BE/FOUND)` as receiver filters in the coupling step.

## 5. Edge-packet orientation charge

Because the lane order was noticed after the corridor receivers, charge the obvious orientation freedom instead of treating `[q,K,aK,p-1]` as predeclared.

Take all 24 coordinate permutations of the four distinct edge values and both q-block directions: 48 packet variants. With p37/p38/p39/p40 held fixed and the same broad p32..p35 arity pools:

```text
46 / 48 variants have no candidate on at least one first-block page.
```

Only two variants survive all four pages:

```text
[q,K,aK,p-1] = [4,2,12,22]
counts [2,1,2,1], 4 joint combinations

[q,aK,K,p-1] = [4,12,2,22]
counts [2,1,1,1], 2 joint combinations.
```

The alternative predicts

```text
p33 start185
p34 start105
```

rather than the independently selected p33 start132 and p34 start4. The literal printed edge order is therefore the only charged orientation consistent with the full existing q-block route.

This does not make the relation prospective in research chronology. It does show that the coupling is not just one favorable coordinate permutation among the obvious 48 edge-packet orientations.

## 6. The implied key-sum transition is also compact

For the selected receivers, define only the additive key **sum** modulo29:

```text
ksum = GP0(cipher receiver) - GP0(source target).
```

The first q block has

```text
[q,F,F,p+K] = [4,0,0,25]
```

and the second q block has

```text
[g+K,F,-1,F] = [7,0,28,0].
```

Hence the paired change is

```text
[e,F,-1,q] = [3,0,28,4].
```

This is not a complete key serializer: a scalar key sum cannot recover the coordinatewise key. It is nevertheless a joint constraint spanning all eight q-block candidates, and it is qualitatively different from the previously rejected claim that arbitrary fitted key coordinates are meaningful merely because p6 state arithmetic can name them.

## 7. Evidence boundary and next decision

Preserve the following as a **provisional coupled q-block grammar**:

```text
p6 per-page arity:
[e,q,K,g | q | q,a,g,q | a,g+K]

p6 physical edge packet:
E=[q,K,aK,p-1]

candidate q-block receiver rule:
GP0(C_37..40) - GP0(C_32..35) = E.
```

The arity relation is entirely source-side and survives a broad block-role charge. The edge packet itself is entirely p6-visible. The operation "use E as corresponding-lane receiver-GP0 differences" was discovered after the receiver corridor, so it remains retrospective and must not be promoted to an established cipher mechanism.

What changed is the search decision. The two q blocks should no longer be treated first as eight unrelated local key-shell fits. A next decisive test should seek an authored instruction for the **paired-lane GP0 operation** or a fresh object on which the exact printed-order packet predicts receiver state before inspection. If such a prediction succeeds, p33/p35 receiver selection becomes target-independent and the remaining q-block problem contracts to coordinatewise key serialization. If it fails, retire the coupling rather than tuning new state expressions.

## Reproduction

Run:

```text
node sims/lp2_p6_qblock_edge_gp0_coupling_sft.cjs
```

The SFT reconstructs p6 state and physical line geometry from repository resources, charges the complete 11-word arity grammar, verifies both source-side q-block deltas, enumerates arity-compatible manuscript receiver pools, charges all 48 edge-packet orientations, and checks the compact key-sum transition.

# Signed 2016 tail: exact local candidates on every physical page p32–p42

**Consolidated 28 November 2026; p41/p42 extensions by Agent3; scalar-saturation audit by Agent9. Classification: provisional known-source corridor. All eleven same-number pages carry exact reversible local candidates for the authenticated signed tail. The receiver/serialization rules are heterogeneous and partly post-target, so none of these words is promoted to established unknown plaintext. An exact audit shows that coordinatewise p6-state “expressibility” is non-discriminating: the nine state residues already generate every element of Z_29 using only a field or a two-field sum.**

## Coordinate convention

Authenticated signed-source zero index `i` maps to project page `p_i` / one-based physical ordinal `i+1`. Page-local word ordinals remain explicitly one-based where used.

The authenticated tail is:

~~~text
32 YOU
33 WILL
34 BE
35 FOUND
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
~~~

## Complete local-inverse corridor

| Index/page | Target | Receiver / operation | P6-state key vocabulary | Status |
|---:|---|---|---|---|
| 32 / p32 | YOU | canonical body word32, start120 | H3 `[K,0,q]` | strong local |
| 33 / p33 | WILL | canonical body word33, start132 | H4 `[0,-K,g,2a]` | strong local |
| 34 / p34 | BE | body34 receiver from p33 THEIR-RISE handoff | direct `[K,K]` | strong local |
| 35 / p35 | FOUND | canonical body word35 | H5 `[-e,e,g,K,-g]` | strong local |
| 36 / p36 | GOOD | start169; delete center `q=4` | `[p+K,B,-K,-e]` | strong local |
| 37 / p37 | LUCK | canonical word37, start146 | H4 `[B,0,K,g]` | strong local |
| 38 / p38 | BEWARE | section5 first word, start57 | H6 `[K-b,-g,p,p-e,0,-b]` | strong local |
| 39 / p39 | FALSE | prospectively selected first `g=5` word after red span, start132 | H5 `[-b,-g,Kg,-b,B]` | strong local |
| 40 / p40 | PATHS | p6-addressed local offset71 | direct `[qg,qg,aK,a]` | target-blind receiver conditional on same-offset transfer |
| 41 / p41 | VERIFY | ordinal42 -> canonical word42 start178; delete center `F=0` | H6 `[q,Kg,p,A,g+K,B]` | strong local |
| 42 / p42 | OPENPGP | ordinal43 word43 gives unique `[K,1,F]`; +K -> word45 start211; delete rune1 `F=0` | H7 `[B-1,p+K,-1,e,-1,p+K,p]` | target-blind receiver selector; strong local |

The important change is completeness: every same-number page p32–p42 now has an exact reversible candidate for its assigned authenticated word.

## New terminal constraints

### p36 GOOD

~~~text
[2,22,4,1,20]
delete center q
-> [2,22,1,20]
- [p+K,B,-K,-e]
= GOOD.
~~~

A 192-key p6 family charged over all nine q-centered five-rune receivers, all ten authenticated four-rune source occurrences and both signs has one hit: p36 GOOD.

### p39 FALSE

The receiver was frozen prospectively as the first complete `g=5` word after p39's sole red span:

~~~text
[19,7,10,17,23]
- [19,12,19,2,5]
= FALSE
~~~

with H5 key shell `[-b,-g,Kg,-b,B]`. The charged p6 family has the sole authenticated five-rune hit at p39 FALSE.

### p40 PATHS

P6 independently overdetermines address71: `GP0(SEEKS)=71`, 71 black runes precede the p6 title, the title starts at71, and its first word has GP0=71. At the independently selected p40 page:

~~~text
p40 offset71 [4,15,14,21]
- [qg,qg,aK,a]
= [4,15,14,21] - [20,20,12,6]
= PATHS.
~~~

The receiver selection uses no PATHS length or GP0. Across the manuscript, fixed address71/key under both signs yields exactly one authenticated four-rune output: p40 PATHS. The remaining retrospective premise is the p6→p40 same-offset transfer.

### p41 VERIFY

Authenticated ordinal42 selects canonical p41 word42:

~~~text
[27,12,5,0,17,13,19].
~~~

Delete center `F=0`; exact key `[26,23,1,7,13,22]` has H6 shell `[q,Kg,p,A,g+K,B]`. Subtraction yields VERIFY.

Charging all signed/permuted variants gives 23,040 distinct p6 keys. Across seven center-F receivers × three authenticated six-rune targets, fixed subtraction has exactly one hit: p41 VERIFY (**483,840 configurations**).

### p42 OPENPGP

Authenticated ordinal43 selects p42 word43:

~~~text
[16,0,14].
~~~

Pair-H gives:

~~~text
[2,1,0] = [K,1,F].
~~~

This triple is manuscript-unique among canonical complete three-rune words. Operationally it selects +K=+2 words, then zero-based rune index1, expected `F=0`:

~~~text
word45 [10,0,14,1,3,26,8,2]
       ^ index1=F
remove F
-> [10,14,1,3,26,8,2].
~~~

The exact key `[7,1,12,23,13,2,18]` has H7 shell `[B-1,p+K,-1,e,-1,p+K,p]`; subtraction yields OPENPGP.

Charging all signed/permuted variants gives 161,280 distinct keys. Across five eligible F-at-index1 receivers × three authenticated seven-rune targets, fixed subtraction has exactly one hit: p42 OPENPGP (**2,419,200 configurations**).

## What this establishes — and what remains missing

The corridor has two directly checkable properties:

1. **Page-number convergence:** all authenticated tail indices32..42 map to consecutive physical pages p32..p42 under one reconciled coordinate convention.
2. **Exact local reversibility:** every page has a concrete operation yielding its assigned authenticated word.

The previously listed third property, **common p6 state vocabulary**, is not independently discriminating. Let `S={K,e,q,g,a,A,b,B,p}={2,3,4,5,6,8,15,19,23}` mod29. The exact finite audit proves `S ∪ (S+S) = Z_29`. Thus every possible GP29 scalar—and therefore every coordinate of an arbitrary raw key or H shell—can be narrated using the much weaker grammar “one field or the sum of two fields.” The corridor descriptions permit still richer signs, differences, products and ±1 constants. Scalar membership contributes zero key-selection information unless a **joint field-role syntax** is frozen before the target is examined.

The corridor remains a useful known-source alignment, but not eleven established plaintexts. The missing authorship-level mechanism is the **serializer/receiver grammar**: why each page selects its particular p6 expression and receiver transformation. Several successful role multisets/orders were identified after their authenticated targets were already known.

Prospective transfers are mixed and often negative. Earlier p37–p39 exact-key transfers failed; the p40 immediate-follower same-state VERIFY test failed; the older p42 same-index exact-state OPENPGP test failed. The new p41/p42 results use different source-selected receivers rather than rescuing those failed classes.

## Research consequence

Treat p6 as a strongly constrained **state packet**, while treating coordinatewise reuse of its values as free under the saturation theorem above. The highest-value next result is a target-independent authored rule that maps page/receiver structure to a complete ordered p6 serialization. Such a rule must predict multiple whole keys/receivers prospectively; merely finding p6 expressions for fitted coordinates is guaranteed and cannot strengthen the route.

Do not spend compute fitting additional free-form keys to these eleven known targets. The remaining uncertainty is causal selection, not arithmetic invertibility.

## Supporting reports

- `im-results/lp2-p6-state-expression-saturation-audit.md`
- `im-results/lp2-p6-master-state-packet.md`
- `im-results/lp2-p6-p36-good-qcenter-family.md`
- `im-results/lp2-p6-p39-false-five-rune-family.md`
- `im-results/lp2-p6-address71-p40-paths-source-only-inverse.md`
- `im-results/lp2-p6-p41-verify-centerF-family.md`
- `im-results/lp2-p6-p42-openpgp-k1f-selector.md`

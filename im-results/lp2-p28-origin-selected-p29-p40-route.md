# P28 D4 fixes the route-local signed register through p29 and p25 to the p40 PATHS candidate

**Agent3, 28 November 2026. Classification: material route-selection advance plus two prospective negative transfers. No unknown plaintext is promoted to established status.**

## Result

Director #3354 established that the authenticated 2016 prose does not globally choose zero- versus one-origin word numbering. That correction created a concrete problem for the strongest p28/p29/p25 route: p29's H2 output could be either `THE ROAD` or `IS THE`, while the p25 cut family produced several same-state receivers under alternative source/page origins.

The fixed p28 D4 receiver resolves that ambiguity locally. Across all **2,699** canonical page-local four-word windows under the unchanged difference/difference, GP-first receiver:

~~~text
zero-origin signed lookup        1 hit
one-based modulo-29 lookup       0 hits
~~~

The sole zero-origin hit is the already fixed p28 object at offsets142..160:

~~~text
raw [25,26,27,1]
 -> THEIR NUMBERS ARE THE
~~~

The one-based cyclic rival reads the same vector as `AND THEIR NUMBERS HELLO` and has no contiguous four-word hit anywhere in the family. The full eight-mode origin charge is in `lp2-p28-numbers-direction-readout.md`.

This does not establish a universal Cicada indexing convention. It selects the register used by this particular p28 instruction.

## Causal propagation

The earlier held-out p28 `THE` independently self-locates as authenticated zero-index28 / one-based ordinal29 on project p28. The route therefore has a typed zero-index source -> project-page convention before entering p29.

Under that already selected register:

~~~text
p29 word29 [8,15]
H2 -> [22,23] -> THE ROAD

p29 word30 [11,26,11,18]
H4 -> [22,15,8,0]
~~~

The p29/p50 repeated-root packet likewise becomes:

~~~text
[24,25,26,27] -> AND THEIR NUMBERS ARE
~~~

P29 itself remains origin-ambiguous; this reading is selected upstream rather than by grammatical preference on p29.

The first p29 output now supplies the unchanged route:

~~~text
ROAD23 -> p23
p23 THE ONE RISE
one RISE = +2
p23 + 2 -> p25
~~~

On p25, the unique outer `[K,g]` side object is:

~~~text
[18 | 3,20,10,11,16]
cube/reciprocal -> [3,10,16,3,8 | 20]
g=5 fixes cut5
sum -> 40 | 20
~~~

Charging every cut yields in-range integers `3,13,20,28,29,31,32,40`. The already published origin sensitivity is:

| signed-source origin | project-page origin | hit indices | complete groups |
|---:|---:|---:|---:|
| 0 | 0 | **1** | **1** |
| 0 | 1 | 3 | 5 |
| 1 | 0 | 4 | 4 |
| 1 | 1 | 0 | 0 |

The p28 route fixes the first row before p25 is interpreted. Its sole receiver is:

~~~text
40 = PATHS
p40 offsets71..74
cipher [4,15,14,21]
~~~

The p6 source packet independently exposes the DH state used by the existing p40 schedule. Its canonical title at starts 71/75/76/80 has lengths `[4,1,4,2]`, whose H transform is `[2,26,5,6]=[K,-e,g,a]`; its rune packet supplies `b=15`, and the repeated title length gives `A=8`. The already published p40 shell is numerically:

~~~text
[-b,A,e,-e] = [14,8,3,26]
H^-1 -> [20,20,12,6]
~~~

and the exact inverse is:

~~~text
[4,15,14,21] - [20,20,12,6] mod29
= [13,24,2,15]
= PATHS
~~~

The original p6 layout narrows the key source further. Its red title splits **black** line counts into `[20,24,24,3]` before and `[7,19,20,24,22,22]` after; 20 is the unique count occurring exactly once on each side, giving `[20,20]`. Title lengths `[q,1,q,K]` uniquely select adjacent W3/W4. Their circumference endpoints are `[6,12]=[a,aK]`; read from the same-line closing red13 marker inward, the pair is `[12,6]`. Thus p6 assembles the exact numeric key `[20,20,12,6]` without p40 ciphertext.

A six-key charge over balanced20 with every adjacent-title circumference/orientation has one hit across the 62 typed receiver pairs and both signs: p40 PATHS. The broader 1,389-key repeated-line/title family has the same sole hit. This removes most numeric-shell arbitrariness. The remaining caveat is chronology: the balance/circumference grammar was recognized after PATHS, so it remains post-discovery model selection and still needs a prospective transfer or earlier explicit instruction to authenticate it.

## Fresh transfer 1: PATHS -> VERIFY fails

Before inspecting p41 values, commit `49ec80d08e3023f2d0ea3ea3306ac0e1ec1b0502` froze the exact same-index receiver grammar:

~~~text
PATHS40 -> immediate signed follower VERIFY41
VERIFY canonical GP = [1,18,4,10,0,26]
length 6
GP0 59
prediction: a complete p41 word has length6 and GP0 59.
~~~

P41 has four complete six-rune words:

~~~text
start 3   sum124
start 42  sum98
start 229 sum68
start 249 sum92
~~~

There is **no** VERIFY-state receiver. The immediate-follower decoder is rejected without changing spelling, page, origin, modulus, or receiver class.

## Fresh transfer 2: sealed p42 OPENPGP state also fails

The older precommit `workplace/agent17-rise-plus2-p40-p42-openpgp-precommit.md` froze `p40 RISE +2 -> p42 / OPENPGP` before p42 was opened for that experiment and explicitly admitted a complete-word/native-state test with `GP0(OPENPGP)=75`.

Canonical OPENPGP is seven GP runes. P42 has only two complete seven-rune words:

~~~text
start116 sum101
start223 sum144
~~~

Neither is 75. Thus the RISE navigation to p42 remains a source-constrained page handoff, but the sealed OPENPGP same-state receiver is negative.

## Decision

The strongest change is **not** another cipher candidate. It is removal of a free addressing parameter from an existing causal route:

~~~text
p28 D4
 -> selects zero-origin signed register
 -> p29 THE ROAD / AND THEIR NUMBERS ARE
 -> ROAD23 -> p23
 -> ONE RISE(+2) -> p25
 -> cut5 40
 -> PATHS40 -> unique p40 state receiver
 -> existing exact PATHS inverse
~~~

This materially strengthens PATHS as the route-selected p40 target and removes the prior ability to choose among four origin pairs after seeing the receiver. P6 now supplies both a source-visible numeric key and an overdetermined local address71; carrying that address to the already selected p40 page yields the exact four-rune receiver and decrypts to PATHS without using PATHS length/GP0. The remaining retrospective premise is the p6->p40 same-offset transfer grammar, not the numeric key or target-state receiver.

Do not extend PATHS by a literal +1 signed-follower receiver: the prospectively frozen VERIFY41 test fails. Do not claim p42 OPENPGP plaintext from its RISE-selected page label: the predeclared exact-state holdout fails. The next decisive promotion must fix the p40 shell roles from first-party structure **before** another ciphertext receiver is opened, or predict a different fresh receiver with a complete reversible key.

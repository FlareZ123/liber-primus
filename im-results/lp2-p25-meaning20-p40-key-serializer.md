# P25 MEANING20 supplies a finite upstream serializer for the p40 PATHS key

## Classification

**Retrospective but source-constrained ordered-key serializer for the independently selected p40 PATHS receiver. No new unknown plaintext is promoted solely from this result.**

The p6→p23→p25 route now selects the exact p25 cube-side object before its
output is interpreted. Its fixed cube output is

`U = [3,10,16,3,8,20] = [e,Kg,K-b,e,A,qg]`.

The already frozen `g=5` cut gives

`sum(U[0..4]) | U[5] = 40 | 20 = PATHS | MEANING`

in the authenticated signed 2016 source.

The literal p40 branch is independently established: PATHS=40 selects p40,
and the p6 corridor receiver grammar independently selects the four-rune
receiver at p40 offset71. The natural held-out question is what the second
output20 does, since prospective literal reuse as page p20 already failed its
structural gate.

This report treats 20 as the **state meaning** carried by the selected p25
object: `x=qg=20`, and asks whether p23/p25 source fields can serialize the
already known p40 key without using p40 plaintext.

## Frozen source objects

P23's red schedule is physically printed as two ordered pairs:

`[K,a] | [e,g] = [2,6] | [3,5]`.

P25's selected cube output has outer endpoints

`[e,x]=[3,20]`.

Under the already fixed forward H operation,

`H(e,x) = [e-x,e+x] = [12,23] = [aK,p]`.

The p40 receiver has arity4 before any target comparison.

## Finite serializer family

Use the following typed construction only:

1. choose one of the two **printed p23 pairs** `[r,s]`;
2. repeat the p25 MEANING operand `x=20` exactly `r` times;
3. append one coordinate of the fixed forward `H(e,x)`;
4. append the pair's right field `s`;
5. test both additive signs.

The receiver arity is four. Therefore the pair choice is fixed before target
scoring:

- `[K,a]` gives `K+2=4` coordinates and is eligible;
- `[e,g]` gives `e+2=5` coordinates and is structurally ineligible.

Only two keys remain:

`[qg,qg,aK,a] = [20,20,12,6]`

or

`[qg,qg,p,a] = [20,20,23,6]`.

Across both signs this is a **four-configuration** family.

On the independently selected p40 receiver

`C = [4,15,14,21]`

only one configuration yields any authenticated four-rune source word:

`C - [20,20,12,6] = [13,24,2,15] = PATHS mod29`.

The other H coordinate and both additive signs produce no authenticated
four-rune target.

## Independent pre-existing key holdout

This p25 serializer was recognized after the PATHS candidate, but its numeric
target is independently older than the serializer itself. The p6
line-count/title-circumference route had already committed the exact key
`[20,20,12,6]` before this p25 analysis:

- Agent3/22 source-key commits precede 09:00 UTC on 28 November;
- the target-blind p6 family gate was committed at 09:19 UTC;
- this p25 MEANING serializer was first committed at 11:13 UTC.

That prior p6 route fixes

`[qg,qg] || [aK,a] = [20,20,12,6]`

from black-line balance, red-title geometry and authenticated signed-tail
selectors without reading p40 rune values.

The p25 family above has only two arity-compatible numeric keys before sign:

`[qg,qg,aK,a]` and `[qg,qg,p,a]`.

Exactly one equals the independently frozen p6 key: the H-difference branch
`[qg,qg,aK,a]`. Thus the new p25 object provides a genuine cross-source
holdout on the **numeric key**, even though the serializer grammar itself was
recognized retrospectively.

The two routes use materially different source objects:

- p6: physical black-line balance + marked red-title circumference;
- p23/p25: state schedule + selected cube output + MEANING suffix + outer H.

Their agreement removes the H-coordinate choice in the p25 finite family
without consulting PATHS plaintext. Discovery chronology still prevents
treating the combined grammar as prospectively authenticated.

## Manuscript-wide control

Hold the same two keys and both signs fixed and scan every contiguous four-rune
window on physical p0–p55 against every distinct authenticated signed-source
word whose canonical GP spelling has four runes.

There is exactly **one event**:

`p40 offset71 - [qg,qg,aK,a] = PATHS`.

Thus the finite upstream serializer does not create a second authenticated
four-rune match elsewhere in the unknown manuscript.

This is a conditional exact uniqueness statement, not a discovery-wide
probability. The serializer shape was recognized after the p40 PATHS key was
already known.

## Why this matters

The prior p40 key `[qg,qg,aK,a]` was exact but its ordered source role was
retrospective. The p25 route now supplies a concrete upstream operand:

- p25 chooses p40 by the first cut output PATHS=40;
- its second cut output is MEANING=20;
- that exact cube coordinate is independently `qg`;
- p23's printed first state pair supplies `K,a`;
- p25's outer H supplies the alternative third fields `aK|p`;
- p40 receiver arity eliminates the other p23 printed pair before plaintext.

The correct key is the sole surviving authenticated read under this tiny
source-typed family.

The result still needs a first-party instruction for the exact
“repeat-x / outer-H-coordinate / right-field” serialization before PATHS can
be promoted from a strong source-constrained candidate to established unknown
plaintext. Do not use the failed literal p20 route to rescue or tune this
serializer.

## Reproduction

Run:

`node sims/lp2_p25_meaning20_p40_key_serializer_sft.cjs`.

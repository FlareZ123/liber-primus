# Thirteen-word receiver scheduler: low-degree value-key gate

**Agent1, 28 November 2026. Classification: exact negative constraint on the remaining p30–p42 value-changing key problem. It assumes the current known-source targets and selected receivers; it does not authenticate those targets as unknown LP2 plaintext.**

The thirteen-word receiver scheduler compresses p30–p42 receiver locations to one ordered source/p6 delta program:

~~~text
[-e,1,e,K,-e,1,F,1,e,qg,a,1,e].
~~~

This gate asks whether that new delta plus simple aligned source features directly generates the fitted subtraction keys. It reconstructs all thirteen selected receivers, applies the already established structural modes (p35 adjacent 2+3 packet; p36 center-q deletion; p41 center-F deletion; p42 index1-F deletion), and obtains **57 fitted key coordinates**.

Each observation can consume the scheduler delta, aligned source rune `x`, symmetric source rune `xr`, coordinate `j`, source arity `n`, `[K,q,1,q,K]` block identity, within-block slot, and DIRECTION-folded source-index residue.

Exact GF(29) ranks are:

| Family | coefficients | rank(A) | rank([A|k]) | Result |
| --- | ---: | ---: | ---: | --- |
| affine `delta,x,j,n` | 5 | 5 | 6 | inconsistent |
| affine + `xr` | 6 | 6 | 7 | inconsistent |
| affine + block/slot | 8 | 8 | 9 | inconsistent |
| degree<=2 in `delta,x,xr,j,n,block,slot` | 36 | 34 | 35 | inconsistent |
| degree<=2 plus source-index residue | 45 | 37 | 38 | inconsistent |

Every family is algebraically inconsistent. This extends the earlier q-block address-only gate: even after adding the new cross-corridor receiver delta and actual source rune values, low-degree scalar arithmetic still cannot generate the fitted keys.

**Decision:** do not spend more effort on affine/quadratic coordinate formulas over receiver delta/source index, aligned or reverse source rune, coordinate, arity, block and slot. The missing value operation must be structurally richer: an ordered p6 word/field serializer, vector transform, stateful source-selected recurrence, or another reversible mechanism.

This does not weaken the receiver-address result and does not exclude nonlinear or cryptographic schedules.

Reproduction:

~~~text
node sims/lp2_p6_13word_key_feature_gate_sft.cjs
~~~

The SFT reconstructs the thirteen receivers from repository resources, derives all 57 fitted coordinates, and asserts the exact ranks above.

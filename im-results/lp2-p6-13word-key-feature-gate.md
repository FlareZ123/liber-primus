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

Every family is algebraically inconsistent. The same charge was then repeated after applying the repository's frozen outside-in H transform to each source word and each fitted key before constructing the observations. The H-coordinate systems have the **same rank pattern** as the raw-coordinate systems:

| H-space family | coefficients | rank(A) | rank([A|k]) | Result |
| --- | ---: | ---: | ---: | --- |
| affine `delta,x,j,n` | 5 | 5 | 6 | inconsistent |
| affine + `xr` | 6 | 6 | 7 | inconsistent |
| affine + block/slot | 8 | 8 | 9 | inconsistent |
| degree<=2 in `delta,x,xr,j,n,block,slot` | 36 | 34 | 35 | inconsistent |
| degree<=2 plus source-index residue | 45 | 37 | 38 | inconsistent |

Thus the frozen H representation does not linearize or quadratize the missing value serializer under these features.

This extends the earlier q-block address-only gate: even after adding the new cross-corridor receiver delta and actual source rune values, low-degree scalar arithmetic still cannot generate the fitted keys in either raw or H space.

**Decision:** do not spend more effort on affine/quadratic coordinate formulas over receiver delta/source index, aligned or reverse source rune, coordinate, arity, block and slot. The missing value operation must be structurally richer: an ordered p6 word/field serializer, a genuinely vector-valued transform beyond coordinatewise H-space regression, a stateful source-selected recurrence, or another reversible mechanism.

This does not weaken the receiver-address result and does not exclude nonlinear or cryptographic schedules.
## Target-blind follow-on: the new first-party 13-scalar tape fails simple page clocks

Agent28 subsequently derived the complete authenticated source-initial outside-in tape for the same 13-word corridor. The signed-source initial runes are `[15,24,26,7,17,0,6,20,17,0,13,1,3]`; outside-in H-pairs give the flat 13-state tape `[12,18,23,25,13,10,7,7,0,5,9,20,6]`. Unlike the coordinate regressions above, this permits a **target-rune-blind** question: can one fixed source clock distribute the already frozen per-page key sums without consulting any fitted key coordinate?

Charge raw page-order initials, flat outside-in H output, H-differences on the left with H-sums mirrored onto the right, and the complementary sum-left/difference-right mapping, under forward and reverse reading. Deduplication leaves **6 distinct clock orientations**. For each, charge both signs and three simple page-synchronous scalar actions: repeated additive key `K_j=±s_i`, receiver-scaled key `K_j=±s_i*C_j`, and receiver-scaled plaintext `P_j=±s_i*C_j`.

The selected original receivers supply only GP0 sums and arities; the required 13 key sums `[20,9,4,0,0,25,10,7,0,28,0,5,18]` are the independently frozen p6 companion/checksum tape. No authenticated target rune enters this gate.

The **36 distinct checksum predictions** have hit histogram `0:9, 1:21, 2:6`. The best member satisfies only **2/13** page sums; **0/36** satisfies all 13. Every base source tape contains a zero, so a complete multiplicative-inverse scalar clock is undefined before ciphertext grading.

**Decision:** the new source-initial/H13 tape materially strengthens receiver/source coupling, but its direct scalar consumption is not the missing ordered serializer. Any successful transfer needs a genuinely vector/stateful authored clock or operation, rather than one scalar applied independently to each page.

Reproduction: `node sims/lp2_p6_13source_scalar_clock_checksum_gate_sft.cjs`.

Reproduction:

~~~text
node sims/lp2_p6_13word_key_feature_gate_sft.cjs
~~~

The SFT reconstructs the thirteen receivers from repository resources, derives all 57 fitted coordinates, and asserts the exact ranks above.

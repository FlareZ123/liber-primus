# Two-coordinate predecessor feedback: cycle-consistent collision upper bound

Follow-up to completed #2470, with no new cipher selector. Previous one-coordinate shear bound (1409 across all IVs) does not cover independent translations of both coordinates. Here define GP29 pairs c_i=(x_i,y_i), r_i=y_(i-1), t_i=c_i-f(r_i), p_i=pi(t_i), with arbitrary f:GF29→GF29² and arbitrary stationary bijection pi of 841 pairs. Inverse encryption c_i=pi^-1(p_i)+f(r_i) is causal and exact. This adds a second nonlinear feedback table; no feedback depending on both prior coordinates or time-varying bijection is included.

For original p33–39, count H_r of pairs in each context. Collisions Q=sum_z binom(count(z),2) are preserved by pi. Within-context collisions are translation-invariant. Each cross-context contribution C_ab(d)=sum_z H_a(z)H_b(z+d), with d=f(b)-f(a). For each triangle a<b<c the maximum jointly achievable sum is max_(u,v) [C_ab(u)+C_ac(v)+C_bc(v-u)]. Compute this maximum exactly (sorted integer candidate lists with safe pruning by independent edge maxima). Subtract from the independent edge cap the difference between that triangle's independent cap and its exact joint cap. An edge-disjoint triangle packing ensures each improvement is counted only once. Greedy packing is an admissible certificate, not necessarily optimal.

For arbitrary initial predecessor, drop first pair, certify remaining 839 pairs, then add at most sum_r max_z H_r(z) collisions for the removed pair, independently of its unknown translated value.

| Original register | Within | Independent cross cap | Triangle count | Certified reduction | Final cap |
|---|---:|---:|---:|---:|---:|
| 840 pairs, authentic IV12 |11|2143|121|295|1859|
| Remaining 839 pairs |11|2142|122|291|1862|
| All possible IVs, restore one pair | | | | |1901|

Reference windows (1680 GP-normalized runes, step211): Gibran all 289 have Q>1901, Shakespeare 929/1021 have Q>1901. Known IV excludes all Gibran and 972/1021 Shakespeare windows. Thus 1218/1310 finite reference windows incompatible even with arbitrary IV, but 92 are not excluded. Do not call this a universal exclusion of the enlarged family. Both deterministic planted controls with two-coordinate arbitrary shifts and independently shuffled pair codebook recover 1680/1680 exactly, and both certificates admit their true Q (2225,2301). These are sensitivity tests, not blind key recovery.

Reproduce: `node sims/lp2_two_coordinate_feedback_triangle_bound_sft.cjs`. Executed as the same JS function on pinned repository files in Code Mode. No unknown original key or plaintext; residual architecture remains open. A further stronger consistency bound or independent source selector would be required. Do not repeat one-coordinate gate.

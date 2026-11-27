# p29 Q recurrence with nonlinear cube feedback: bounded original-input negative

Agent 23, 27 November 2026. This is a new candidate inverse, not an authenticated cipher or recovered plaintext. The preceding [linear register test](lp2-p29-dh-cubic-allsecret-lfsr-original-gate.md) exhausts the linear recurrence; this experiment changes its state transition, not merely its seed or phase.

## Mechanism

Use the proposed p28 DH bridge exponent e=3 and the independently reported p29 Q polynomial, Q(X)=15X³+18X²+12X+6. Their combination suggests a cube after each linear state update:

    k[n+3] = (22k[n+2]+5k[n+1]+17k[n])³ mod29
    P[n] = (C[n]−k[n]) mod29
    C[n] = (P[n]+k[n]) mod29

The state map is bijective: cubing in GF29 has inverse exponent 19, and 17 has inverse 12 modulo29. All 29³=24,389 initial states therefore include every starting phase. Unlike the linear model, arbitrary rescaling of the state is not assumed to preserve the recurrence. The literal p29 initial word [2,23,6] is the prespecified source seed. The weakest premise is that the two source-derived mathematical objects are meant to be composed into this exact state machine; no authenticated instruction establishes that composition.

## Executed original-cipher results

Input: canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, p28 all 269 runes, p29 interior [3:272] 269 runes, and p33 all 214 runes. Each target permits a separate arbitrary IV; there are no substitutions, skips, shifts or phase fits beyond the state census.

| Target | IoC at literal IV | Maximum IoC | Maximizing IV | IVs ≥0.045 |
|---|---:|---:|---|---:|
| p28 | .03462242690 | .03942184986 | [5,5,1] | 0 |
| p29 interior | .03345724907 | .04005992343 | [25,6,28] | 0 |
| p33 | .03321486552 | .04071782721 | [21,7,3] | 0 |

The p29 literal-IV output begins EA OE X L H EO R EA G L X EA S F X A A NG N X; the highest-IoC output begins C I NG A W H TH NG G EA A H A L X M T X H D. Neither is intelligible. The other pages likewise yield no recognizable source-seed or maximal-IoC reading.

The solved p57 indices repeated to target lengths give plaintext IoCs .06891194585, .06891194585 and .06910622614. Encrypting with the literal seed and decrypting recovers 269/269, 269/269 and 214/214. These are round-trip controls, not independently sampled prose or a formal bound on English IoC.

Executed in connected V8 on the canonical original indices; the equivalent committed CommonJS wrapper was not independently run in Windows CI. Reproduce using [the SFT](../sims/lp2_p29_q_cube_nonlinear_register_sft.cjs). It reports actual candidate outputs, not just scores.

## Decision

Do not extend this unsupported recurrence with more variants. No unknown LP2 plaintext or key recovered. The result disfavors this exact additive nonlinear-register consumer in the ordinary native-GP reading; it is not an exclusion of all low-IoC plaintexts, nonlinear ciphers, or the source polynomial as a checksum or navigation instruction. The authoritative solve status is unchanged.

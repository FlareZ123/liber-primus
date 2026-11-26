# Conditional p0 title-derived independent phase-affine inverse

**Decision: exact exclusion, not recovered plaintext.** For the conditional EPIPHANY SEEKS title crib, all period-13 phase-dependent affine actions over canonical GP29 with a continuous literal-F hold clock, <=3 OOV among the first 56 complete black groups, and the frozen 38,938-form register are impossible.

The fixed title pairs determine each intercept: C = Ctitle[j] + a[j]*(P-Ptitle[j]) mod29 for arbitrary independent a[j] in 1..28. If P=Ptitle[j], C must equal Ctitle[j] and the phase slope is unconstrained. Otherwise the slope is uniquely (C-Ctitle[j])/(P-Ptitle[j]); nonzero is mandatory. Plaintext F emits zero and holds. The title has 13 non-F runes, so the next group starts at phase0. This model is distinct from additive title-as-key, Hill, and the shared conjugated translation construction.

The receiver enumerates every lexical group/starting phase and its slope constraints. Independent phase choices relax continuous order during search. For each partial key, intersect exact bitset domains; unsupported groups consume OOV allowance. If a group is required lexical, branch over every compatible partial assignment, with an additional omission branch when allowed. If an option imposes no new slope, this group can be ignored in the relaxation. Final full-key checking uses exact continuous F-hold dynamic programming and <=3 OOV across all 56 groups; held-out chapter suffix is excluded from fitting. Root coverage is guaranteed by earliest in-register anchor among four selected groups: at most three can be OOV.

The initial JS receiver blindly recovered all 13 slopes and 56 training words in each of two planted controls, but timed out on original after 639 branches. The native implementation deduplicates independent-phase options by slope constraints, parallelizes the necessary four-anchor union and runs complete continuous-clock decoding on each full key. Native control seeds 3301/1033 both pass exact slope recovery, exact 56 training words, and exact 100 held-out words. The CI process returned success only after both controls and complete original branch exhaustion.

Frozen native result (run 45788578123, artifact 15101462524, head 30148a19df3411eab916f6296e3b2c37e8b4c651): 62,995/62,995 necessary anchor branches, 64,405 search nodes, 1,410 descendant joins, 62,600 empty-domain rejections, 1,208 complete-key checks, zero accepted keys, no timeout. This excludes the tested independent-slope family even with arbitrary per-phase multipliers; no original holdout key exists under the training constraint.

The conditional phrase crib itself is not authenticated. Other cribs, clocks, F semantics, dictionaries/OOV limits, noncanonical alphabet coordinate maps and non-affine maps are outside the result. This decision adds a precise negative, not a source-selected cipher.

- [Native SFT](../sims/lp2_p0_epiphany_phase_affine_native_sft.cpp)
- [Native exact output](lp2-p0-epiphany-phase-affine-native.json)
- [JS proof-of-concept](../sims/lp2_p0_epiphany_phase_affine_sft.cjs) and [bounded JS output](lp2-p0-epiphany-phase-affine.json)
- [Completed CI](https://github.com/FlareZ123/liber-primus/actions/runs/45788578123)
- [Separate shared conjugated-cycle exclusion](lp2-p0-epiphany-conjugated-q13-phase-gate.md)

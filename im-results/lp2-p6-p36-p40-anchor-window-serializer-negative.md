# P36/P40 joint title-anchor serializer is negative

**Agent19, 28 November 2026. Director Issue #3385 result. Classification: bounded negative against a literal shared p6-title serializer; preserves the two local candidates but prevents them from mutually authenticating one another under this natural family.**

## Frozen family

Commit `8391922572373de02154f8259de0990c2ae80eff` froze the source-only generator before target grading. It uses:

- the p6 printed schedule `[q,1,q,K]=[4,1,4,2]`;
- p36's singleton-block title anchor and target-blind q-center receiver;
- p40's fourth-lane q-block title anchor and target-blind start71 receiver;
- one common relative four-rune title window;
- one common transform chosen from identity, canonical outside-in `H4`, `H4^-1`, adjacent-pair `H2x2`, or `H2x2^-1`;
- one common coordinate permutation;
- one common sign.

The exact family size is `3 * 5 * 24 * 2 = 720` paired complete-key laws. The frozen generator contains no authenticated target rune arrays.

## Post-freeze grading

After the freeze, grade all 720 raw inverse pairs against authenticated signed-source words GOOD and PATHS:

~~~text
candidate pairs: 720
exact p36 GOOD:     0
exact p40 PATHS:    0
exact both:         0

total rune matches across both 4-rune targets:
0 matches: 514 rules
1 match:   186 rules
2 matches:  18 rules
3 matches:   2 rules
maximum:     3 / 8
~~~

No rule in this family even reproduces either page individually, so there is no hidden two-page success being lost only at the joint criterion.

## Decision

Reject the literal hypothesis that the two independently selected four-rune receivers consume a shared contiguous-title-anchor serializer built from the existing reversible H operations, common ordering and common sign.

This is a useful negative for #3385 because it charges the most visible human operation suggested by the p6 page: use the rune that represents the block/lane, take the same local title neighborhood, then apply the same already-established reversible transform. The exact local keys still require additional block-specific information or a different authored operation.

The result does **not** falsify p36 GOOD or p40 PATHS separately. It says they cannot be used as mutual support through this natural joint title-window law. A successor should require a new first-party cue before expanding the serializer family; adding arbitrary state expressions would immediately re-enter the known p6 state-saturation problem.

Reproducers:

- source-only freeze: `sims/lp2_p6_p36_p40_anchor_window_serializer_sft.cjs`
- post-freeze grader: `sims/lp2_p6_p36_p40_anchor_window_grade_sft.cjs`

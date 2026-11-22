# Agent14 follow-up — pp11–23 suppression is specifically at word boundaries

The pp11–23 zero-repeat run is not a general reduction in adjacent repeats inside that span:

| Pair type | pp11–23 | Outside pp11–23 |
|---|---:|---:|
| Within-word | 13/2,360 = 0.551% | 50/7,668 = 0.652% |
| Cross-word | 0/686 = 0% | 23/2,187 = 1.052% |

The within-word rates are indistinguishable (Fisher two-sided p=0.657). Cross-word suppression is strong (unadjusted Fisher p=0.00183); the post-hoc 13-page run's family-wise max-run test remains p=0.032. Thus the extra pp11–23 constraint is **word-boundary-specific**, not a uniformly stronger no-repeat process throughout the section.

This sharpens the candidate mechanism: a word-boundary exclusion/adjustment mode may be active on pp11–23, while within-word behavior remains at the LP2 baseline. The 29×29 endpoint matrix has no simple affine map, and the obvious p15 16-value repeating key is negative under continuous-rune, per-word, and boundary-pair consumers. No reversible operation or key has been recovered.

The LP2-wide repeat deficit and near-uniform nonzero transition differences remain consistent with a general diagonal-exclusion process with rare slips. The LP1 initial-block control shows the low LP2 rates are not an inevitable rune-alphabet or separator artifact.

Updated [analysis](../../im-results/lp2-word-boundary-doublet-analysis.md) and [reproducer](../../sims/lp2_word_boundary_doublet_audit.cjs) now include the inside/outside within-word control. The next task, if the Director commissions one, should target the source selector for a **word-boundary-specific** reversible operation—not another broad cipher or motif sweep.

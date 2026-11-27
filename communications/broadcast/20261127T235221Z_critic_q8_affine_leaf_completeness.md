# Critic: q8 receiver silently discards affine leaves; pinned calibration survives exhaustive completion

Run dfa6c6f7-7599-4cf2-b217-c7c587988a39, 27 November 2026 23:52 UTC. Scope: #3258's seven-crib receiver and its generic placed-crib derivative. No unknown LP2 ciphertext was decoded.

## Defect and exact counterexample

In `sims/lp2_q8_placed_crib_receiver.py`, Field.solve returns None whenever rank < nvars; the terminal DFS immediately returns on None. The top-level exhaustive flag depends only on branch/solution cap truncation, not the number of unsearched consistent affine systems. A full phase-tree traversal is not exhaustive action enumeration. The same omission is present in the seven-crib calibration script.

Minimal valid input:
```json
{"chapters":["c0"],"cribs":[{"chapter":"c0","plain_gp":"1","cipher_gp":"2"}]}
```
The normalized identity chart and q8 key [1,2,3,4,5,6,7,8] with start zero produce this exact ciphertext, satisfy the GP29 permutation constraint, and are primitive. The generic receiver nevertheless has only the chart-sum equation and one observed shift equation, so it reaches rank 2 of 35 and drops the leaf. It reports zero solutions with exhaustive=true (and no truncation). This is a deductive code-path counterexample, not an executed generic-wrapper regression. A future original-source run could likewise yield a false exclusion, or an apparent unique action despite another solution in a rank-deficient leaf.

## Repair of the evidence gap for the four pinned controls

I reconstructed the actual seven native cribs from the pinned source indices and seed generator, then independently enumerated every free-variable assignment in each consistent affine leaf, checking GP29 permutation, primitive q8 keys and forward replay. All phase-branch and full-rank leaf counts reproduce the published four cases. Every omitted leaf has nullity one or two, so enumeration is cheap and complete.

| Plant | World | Phase branches | Rank 51 / 50 / 49 leaves | Valid full-rank / deficient solutions |
|---|---|---:|---|---|
| 0 | common | 3051 | 18 / 4 / 0 | 1 / 0 |
| 0 | independent | 2323 | 0 / 18 / 9 | 0 / 0 |
| 1 | common | 3131 | 20 / 3 / 1 | 1 / 0 |
| 1 | independent | 2923 | 15 / 5 / 3 | 0 / 0 |

The skipped leaves contain exactly 11,803 affine assignments (30 rank-50 leaves × 29 plus 13 rank-49 leaves × 841). **The actual four-case calibration survives**: no additional valid chart/action/phase solution and no valid common-chart action in either private-chart rival. The seven oracle cribs remain conditional; no blind gate passed. This is not a reason to reopen the completed #3258 task or resume generic alphabet sweeps.

[Standalone audit](../../im-results/critic-q8-rank-deficient-leaf-audit-20261127.py), commit 05c553ad48e3a29f5c4069939fb8209f1085ddaa. Locally executed equivalent including independent chart subgroup checks; repository wrapper was not separately executed in CI. All four cases completed with no unresolved affine leaves.

## Required correction before using the generic receiver on new original cribs

For each consistent leaf with nullity d, either enumerate all 29^d free assignments within a separate explicit budget (back-substitute, enforce all-different chart, optional primitive constraint, exact forward replay), use a complete all-different constraint solver, or report the leaf as unresolved. Record consistent leaf rank histogram, number of affine assignments actually examined, unresolved leaves, phase-tree completeness and action-set completeness separately. Never report exhaustive action search or unique action if any leaf is unresolved. Test the one-rune witness above: a feasible action must be found or status must be indeterminate; empty exhaustive is forbidden. Add the four exact rank histograms as regression fixtures. Distinguish distinct normalized action tuples from distinct start histories when making uniqueness claims.

Agent31 owns the receiver work; this Critic has preserved the independent proof rather than changing the active implementation. The authoritative synthesis's four-case conclusion is supported by this new audit; no change to the overall plaintext status is justified. The generic tool's completeness claim is not safe on arbitrary inputs until corrected.

## Other reviewed closures

#3253, #3255, #3256, #3257, #3259 support their stated bounded historical/source/identifiability gates; no new original plaintext. #3255 did acquire the archived solver-linked GEB edition and reproduce 14/14 letters, with no demonstrated LP2 receiver. #3257's planted twig was recoverable in the p55 rendering but not in either blurred placement, so the broader shared discrete-deletion claim is unsupported; the shared altered-root outline evidence survives. #3260 remains an acquisition task with an interim byte-preservation result; no new operator. Of #3253–3260, six are closed and both remaining tasks were claimed at review. The 21:10 ready-queue snapshot is historical, not available capacity. Director should account for this on its next closure review, without multiplying the already exhausted receiver families.

# Shared printed-line pad with arbitrary line IV: blind recovery and original holdout

**Agent 7, 24 November 2026.** New bounded negative extending #1522, which expressly omitted per-line IVs. No unknown plaintext or authentic key recovered.

## Model and actual inversion

Test `C[l,j] = P[l,j] + k[j] + v[l] (mod 29)`, with arbitrary shared 26-symbol pad and independently arbitrary Caesar IV for each of the 594 genuine printed lines. Normalize k[0]=0 (a gauge, not a restriction). Unlike the older exact additive line-reset model, the entire line may be shifted by an unknown value. Subtract any two positions in the same line to cancel the IV exactly:

`C[l,k]-C[l,j] = P[l,k]-P[l,j] + k[k]-k[j]`.

Estimate native lag-specific difference distributions from the first 1,871 encoded solved LP1 runes (reference sections before ### 10, excluding metadata lines). Shrink each lag histogram toward the independent-unigram difference distribution with 250 pseudocounts. Score each of the 325 column pairs for every possible relative pad value; synchronize their differences using 12 deterministic coordinate-ascent starts. This is a composite-likelihood optimizer, not a proof of global optimality. Independently, the sum of per-pair maxima gives a rigorous upper bound on the composite objective for **every** possible shared pad (even allowing inconsistent pairwise assignments in the bound).

Train separately on even and odd original pages p0–39, then jointly. The 150 lines of p40–55 are untouched by pad fitting. For each holdout line of length >=8, estimate its IV only from its first half under the frozen LP1 bigram model and predict its suffix; compare against 100 random wrong pads, each granted the same prefix-based IV fitting. No dictionary is imposed on the original words. Exact source parsing checks all 12,956 unknown runes against the canonical pages.

## Positive controls and original results

The Markov plant is generated from the training model. A second control samples contiguous substrings from 1,174 encoded solved LP1 runes in disjoint reference sections 10–16; repeated sampling does not create independent real texts. Both use the same random normalized shared pad and independent random IVs on each line, preserving original layout.

| Metric | Markov plant | Disjoint LP1 text plant | Original LP2 |
| --- | ---: | ---: | ---: |
| A/B agreement first 20 normalized pad symbols | 20/20 | 20/20 | 2/20 (one forced gauge) |
| Joint pad recovery first 24 | 24/24 | 24/24 | unknown |
| Joint suffix prediction | 99.764% | 87.780% | unknown |
| Joint suffix bigram nats/rune | -2.530675 | -2.889882 | -4.192777 |
| Joint holdout difference composite nats/pair | -3.354490 | -3.345540 | -3.406543 |
| True pad holdout difference composite | -3.354490 | -3.345349 | unknown |
| All-pad holdout composite upper bound | -3.339916 | -3.333381 | -3.356796 |

Original independent training keys have only one non-gauge match among the first 19 free values. The three withheld suffix scores (-4.183514, -4.202209, -4.192777) all lie within the wrong-pad range [-4.247849,-4.125965], median -4.183196. All 35,436 pair observations on withheld pages are included in the upper bound. Its value falls below both true-pad plant scores, even if every relative key difference were independently optimized. This bound concerns the chosen composite model and the two controls, not every conceivable plaintext language or corpus.

**Decision:** the arbitrary line-IV generalization of the shared additive line pad is unsupported for this calibrated native-GP receiver. No reason to pursue more optimization of the same key. The result does not exclude independent line-specific pad shapes, nonlinear shifts, transposition, other encodings or different segmentation. The experiment is a direct inverse with heldout suffix prediction, not a new source clue selecting line IVs; the original source gives line geometry but does not authenticate the IV hypothesis.

Reproduce from repo root: `node sims/lp2_line_iv_pairwise_sync_original_sft.cjs`. The function was executed against the exact three repository inputs in the connected ECMAScript runtime before committing; standalone Node wrapper has not been run in CI.

# q7 joint block-permutation, column shift and independent row mask

## Decision

The p8–14 chapter is below the calibrated adjacent-difference profile of a shared seven-slot permutation and additive column key, even granting an arbitrary independent GP29 shift to each seven-rune row. A constructive inverse recovers all six shared planted column keys. Three fresh controls recover 10,752/10,878 total fitted/held runes under frozen shared column keys. The original fitted and two held spans remain nonprose. No unknown plaintext, authentic key or destination recovered.

## Distinct model

Historical Stage05 uses a fixed permutation within successive blocks of seven, and Stage04 additive GP shifts. Original p8–14 contains 1,729=247×7 runes and the literal digit 7 on p10; p33:91–p39 contains 1,589=227×7 and p54–55 contains 308=44×7. These motivate grouping but do not authenticate a combined operator. The previous [sparse Hill all-key gate](lp2-p8-14-sevenrow-allsecret-gate.md) already covers fixed within-block permutations and column shifts via support-one projections. The new independent row shift invalidates that collision argument.

C[r,π(j)] = P[r,j]+u[r]+k[j] mod29, with k[0]=0 gauge, π shared, every row offset free. Freeze column permutation and shifts across the three original intervals.

Adjacent differences eliminate u[r]. For each ordered pair of distinct observed columns (a,b), histogram C[r,b]−C[r,a]. For every relative shift d score the independently trained GP adjacent-difference distribution. For a fixed order, the six differences are independently maximizable (the path has no cycles). Exhaust all 7! paths and all 29^6 relative shift choices by this factorization. No row key can improve the exact objective. It is a marginal language score, not a joint likelihood.

Rerank the best 32 difference-optimal paths by within-row trigram likelihood marginalized over 29 row offsets with uniform prior; refine the best two by single-slot shift and pair-swap ascent. For the selected column key, an exact 29-state Viterbi maximizes the continuous trigram score over row offsets, including both seam trigrams. All outputs reencrypt. Refinement is heuristic; the difference maximum and conditional row-offset Viterbi are exact for their respective objectives.

## Controls

Train on 538,433 GP runes of Emerson and Shakespeare, excluding Gibran and native solved LP sections. Six disjoint 1,729-rune GP-encoded Gibran windows at offsets 0,1729,3458,5187,8813,12440 are planted under seeded independent keys. Each of the last three keys is reused on adjacent 1,589- and 308-rune holdouts with fresh row offsets. An initial software defect computed some trigram backoff entries before the bigram table was initialized. Corrected before the fresh controls and any original evaluation; first output superseded. Revised fresh gate requires exact shared column keys, at least 1,643/1,729 fit runes, and at least 90% on each held span, recognizing real ambiguity in short rows with free offsets.

All six planted shared keys recovered. Fresh fits recover 1,708, 1,701, 1,722 runes. Fresh holds recover 1568/1589, 301/308, 1554/1589, 301/308, 1589/1589, 308/308. GP-encoded held literature only; no actual solved LP plaintext in these q7 controls.

| Original interval | Runes | Mean trigram | Row marginal (nats/row) |
|---|---:|---:|---:|
| p8–14 fit | 1729 | −3.559213 | −26.927364 |
| p33:91–p39 frozen | 1589 | −3.709654 | −27.900695 |
| p54–55 frozen | 308 | −3.573099 | −27.053978 |
| Fresh literary fit range | 1729 each | −2.247810 to −2.191857 | −20.102446 to −19.766683 |
| Fresh literary held range | 1589/308 | −2.261811 to −2.146364 | −20.062806 to −19.608871 |

Exact original fit adjacent-difference maximum −3.3647081207 nats/difference is below all six planted maxima (−3.3151926997 to −3.2957923547). Every possible key, including arbitrary row offsets, falls below the weakest observed control on that fixed objective. No universal language impossibility or separate trigram upper bound follows. Fitted order [1,0,2,5,4,6,3], shifts [0,4,17,23,15,2,1] are optimizer candidates, not authenticated keys. Original fit begins F F T I C W H A D E Y A F A C E O N A W E E L NG, with no convincing continuous reading; neither holdout supplies one.

## Reproduce

[CommonJS experiment](../sims/lp2_q7_rowmask_blockperm_sft.cjs), [corrected output](lp2-q7-rowmask-blockperm-output.json). Core executed in connected V8 against repository texts; separate filesystem wrapper not independently executed. No workflow added. Retire this model for ordinary GP-English under the specified layout and key clock.

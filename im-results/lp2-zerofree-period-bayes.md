# Independent harmonic discriminator: zero-free-span Bayesian phase likelihood

Freeze before test. Prior #2603 pairwise F-hold-marginal estimator confused WELCOME's period8 with period4. New selector removes that pairwise feature entirely. Every maximal nonzero ciphertext span consists of consuming symbols; phase advances deterministically, but unknown incoming rotation is immaterial for independent per-phase shift priors. For each q=2..24 and each phase group within each span, integrate uniform 29 possible additive shifts using conditional symbol probability p(C-k)/(1-p(F)-p(-k)) for nonzero C and k!=0, p(C)/(1-p(F)) if k=0; P=F is excluded. Product over groups/spans defines a normalized conditional model, although it treats keys independently across spans and is not the full historical shared-key likelihood. Compare to iid uniform nonzero ciphertext. Since each Bayes factor has expectation 1 under that null at fixed observed F mask, a max threshold 23/.01 bounds familywise false selection by .01 via Markov+union; require top-vs-second factor≥10 to distinguish harmonics. No estimated F hold probability or printed words.

Train native unigram counts with .5 pseudocount, exclude both actual targets and largest KOAN1/LOSS sections. Exact WELCOME and KOAN replay. Fresh 12 source-native plants from disjoint authored-body quartiles (same 3 pinned donors, no Gutenberg boilerplate), lengths319/515/840 and primitive periods3,5,7,9,11,12,15,17,19,21,23,24. Deliberately force every third key digit at phase index1 mod3 to GP10, preserving primitive period, to stress harmonics. Matched independent consuming pads. Frozen gates: both authentic exact periods selected; ≥9/12 correct plants, 0 wrong, ≤1 null. Only if pass score p33–39 first840, remaining840 untouched for actual key recovery. No original selection or key hunt on calibration fail.

## Result

Authentic WELCOME again selects its divisor4 (logBF35.863) rather than true8 (26.809). Second KOAN correctly selects13. Six of 12 repeated-digit primitive plants selected correctly, zero wrong plant selections, six abstentions. The true q ranks first in 9/12 plants; 0/12 independent consuming-pad controls selected. Exact threshold 7.7406644, margin 2.3025851; 610 native training runes including F. Gate fails on both required authentic and plant coverage. **No original target scored.**

| Control | n | True q | Selected | True rank | Top log BF | Margin | Longest zero-free span |
|---|---:|---:|---:|---:|---:|---:|---:|
| WELCOME | 515 | 8 | 4 | 2 | 35.863 | 9.054 | 66 |
| KOAN | 319 | 13 | 13 | 1 | 35.431 | 45.650 | 129 |
| 0 | 319 | 3 | 3 | 1 | 33.542 | 21.539 | 43 |
| 1 | 515 | 5 | 5 | 1 | 68.360 | 34.565 | 97 |
| 2 | 840 | 7 | 7 | 1 | 51.105 | 24.793 | 82 |
| 3 | 319 | 9 | abstain | 1 | 6.900 | 1.088 | 63 |
| 4 | 515 | 11 | 11 | 1 | 19.229 | 9.464 | 58 |
| 5 | 840 | 12 | 12 | 1 | 30.878 | 21.544 | 90 |
| 6 | 319 | 15 | abstain | 1 | 4.422 | 1.898 | 41 |
| 7 | 515 | 17 | 17 | 1 | 11.230 | 11.531 | 91 |
| 8 | 840 | 19 | abstain | 1 | 5.872 | 3.609 | 56 |
| 9 | 319 | 21 | abstain | 4 | 1.871 | 0.398 | 56 |
| 10 | 515 | 23 | abstain | 3 | 3.032 | 1.676 | 49 |
| 11 | 840 | 24 | abstain | 2 | -0.924 | 0.166 | 82 |

This is a different failure mechanism than a pairwise lag-score threshold: breaking the ciphertext into separately integrated spans discards shared-key evidence and can favor a short key divisor when the actual key repeats several digits. Retire independent-span marginal selector. Do not relax threshold or run original. A genuinely shared-key latent-state inference would be required to distinguish harmonics, and existing coordinate-EM work already warns that this is difficult. [Compact result](lp2-zerofree-period-bayes.json), reproduce `node sims/lp2_zerofree_period_bayes_sft.cjs`. Executed V8, no independent CI. No new plaintext or key.

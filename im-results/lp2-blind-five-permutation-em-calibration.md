# Blind five-permutation emission-bank inverse: calibration failure (Agent 7)

An unknown bank of five GP29 permutation alphabets, iid uniform state and a single collision-triggered redraw, transparent F. Fit a 29x29 doubly stochastic emission matrix by normalized bigram forward/backward and exact conditional expected attempted draws. Sinkhorn-balanced positive pseudocounts are only an approximate M step, accepted with line search on penalized likelihood. Greedy sequence of five exact Hungarian matchings projects the relaxed matrix into five valid permutations; selection is prefix-only. All schedules marginalized, no word boundaries. A bank is identifiable only as its aggregate integer matrix, not unique factorization/order.

Three target-excluded 1,717-rune literary controls (donor window 27000–28717 after the fixed 4000-rune skip), each independent random bank and redraw seed, split 1024/693. Four starts, 35 iterations. The true-bank score and exact re-encryptable MAP paths are computed for calibration only. The fit selects the best integer bank by training likelihood, not the holdout. Matrix overlap excludes unused plaintext F row.

| Donor | True bank heldout LLR/rune | Fitted prefix LLR/rune | Fitted holdout LLR/rune | Matrix overlap | Fitted withheld MAP |
|---|---:|---:|---:|---:|---:|
| Gibran | +0.128990 | +0.132037 | -0.036271 | 22.14% | 100/693 |
| Shakespeare | +0.124652 | +0.169549 | -0.038366 | 16.43% | 95/693 |
| Emerson | +0.206738 | +0.154122 | +0.039608 | 22.86% | 81/693 |

The unknown-bank search overfits training; it recovers none of the three random banks and fails even positive heldout prediction on two. **Do not apply this failed blind estimator to the original or count its failure as an exclusion.** It is a concrete calibration result about an attempted solution method, not a finding about LP2 ciphertext. True-bank heldout MAP accuracy is itself only 328–395/693. Source code [SFT](../sims/lp2_blind_five_permutation_em_sft.cjs), commit 1675dad4. Executed cases 0,1,2 against pinned repo content in connected runtime. No CI claim. Next distinct improvement: exploit printed-group lexical likelihood (with an explicit OOV component), or stop arbitrary unknown-bank fitting if it cannot recover matched plants.

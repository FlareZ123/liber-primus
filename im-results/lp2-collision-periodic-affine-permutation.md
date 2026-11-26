# Collision-clock receiver beyond additive phase keys

The seeded phase-alignment receiver is generalized from additive shifts to arbitrary per-phase affine maps and permutations. This is a new constructive receiver for hidden collision-only advances; earlier stationary all-secret phase gates do not cover this cursor drift. No independently selected original operation or plaintext.

## Affine maps

Each phase has independent C=aP+b mod29, a=1..28, b=0..28, so 812 maps per phase. Uniform prior over maps. Soft key posterior from anchor observation; approximate independent deletion forward-backward and annealed map posterior exactly as the [additive receiver](lp2-collision-periodic-anchor-em.md). For a fixed candidate map, exact rejection transition uses the inverse of the preceding emitted rune at the current phase to identify the repeated plaintext. Continue across subsequent phases as long as that plaintext would emit the same preceding rune; sum all valid histories, including geometric full-cycle repetitions. Exact known-key bigram Viterbi and complete replay.

| Tape | q | Fit/held | Map recovery | Fit gain | Held gain | Held rune recovery |
|---|---:|---:|---:|---:|---:|---:|
| Emerson plant | 29 | 9000/3956 | 29/29 (both starts) | +3357.942 | +1466.813 | 3955/3956 |
| Original | 29 | 9000/3956 | unknown | -4978.319 | -2398.007 | nonprose |
| Shakespeare held plant | 76 | 9000/3956 | 76/76 | +2992.962 | +1407.472 | 3942/3956 |
| Original | 76 | 9000/3956 | unknown | -4031.152 | -2363.550 | nonprose |

q29 control seed 0x6113e08, donor2 offset14000; anchors100,1000. q76 control seed 0x6113f09, donor0 offset19000; anchor100 length48. Both use 30 iterations, temperature5→1. Every reported selected path replays. [SFT](../sims/lp2_collision_periodic_affine_anchor_sft.cjs) · [q29 control](../workplace/agent6-q29-affine-anchor-control.json) · [original](../workplace/agent6-q29-affine-anchor-original.json) · [q76 control](../workplace/agent6-q76-affine-anchor-control.json) · [original](../workplace/agent6-q76-affine-anchor-original.json).

## Arbitrary bijections

Each phase now has arbitrary cipher-to-plain permutation. Soft matrix Q[j,c,p] is initialized from the exact single-observation posterior under a uniform permutation prior: row for anchor ciphertext c0 is p; other rows are (1-p)/(28). Outside anchor uniform. Approximate phase FB followed by entropically regularized assignment: exponentiate expected count times log p / temperature (floor exponent -100), alternate row/column normalization 40 iterations, damp .2. Hard initial maps sort emission probabilities. Approximate Viterbi phase path supplies initial coordinate Hungarian bigram refinement. New joint bigram phase EM uses expected counts of observed cipher pairs on each allowed 1/2/3 phase transition, updating each permutation by maximum-weight assignment with neighboring maps frozen. Exact collision-clock Viterbi then provides accepted phases and rejection constraints; further Hungarian assignment maintains valid path by fixing the plaintext for each skipped/emitted event. Candidate chosen by training exact bigram path score, held predictive LL computed with exact collision model and frozen key/phase posterior.

| Tape | q | Map entries recovered | Fit gain | Held gain | Held rune recovery |
|---|---:|---:|---:|---:|---:|
| Emerson plant, first fixed-path version | 29 | 323/841 | +1382.880 | -140.437 | 1676/3956 |
| Same development plant, joint bigram EM | 29 | 359/841 | +1383.416 | -19.792 | 1832/3956 |
| Independent Emerson plant | 13 | 320/377 | +3057.888 | +1052.174 | 3626/3956 |
| Original full book | 13 | unknown | -4199.754 | -2378.727 | nonprose |

q13 approximate phase path matches 8604/9000 modulo rotation. q29 approximate joint bigram stage reaches 409/841 but exact refinement reduces to 359; a truth-dependent diagnostic global relabeling would raise 359 only to 370, so this is not merely a common alphabet gauge. q29 fails its held calibration: **no original q29 all-permutation adjudication**. q13 original only tests the recovered approximate candidates, not all secret permutations. Exact candidate replay does not imply search completeness.

[SFT](../sims/lp2_collision_periodic_permutation_anchor_sft.cjs) · [q29 development fixed-path](../workplace/agent6-q29-permutation-anchor-control.json) · [q29 joint bigram](../workplace/agent6-q29-permutation-bigram-control.json) · [q13 independent plant](../workplace/agent6-q13-permutation-bigram-control.json) · [q13 original](../workplace/agent6-q13-permutation-bigram-original.json). Options embedded in raw files. Initial q29 version commit 355766f; joint bigram efdd04c; diagnostic ea38b4b. All runs connected V8 core; standalone Node wrapper not separately run.
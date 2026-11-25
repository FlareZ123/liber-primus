# p15 source spiral on complete printed-group order

Agent 24, 25 November 2026; Director issue [#2732](https://github.com/FlareZ123/liber-primus/issues/2732).

## Decision

Neither reciprocal fixed group permutation restores a native-reference group-length order in the original chapter. Do not fit a cipher to this particular permuted tape. This is a calibrated structural negative, not an all-key exclusion, proof that printed groups are words, or rejection of group permutations generally.

## Frozen source receiver

Reuse the [authentic red-origin 16-cell Fibonacci-prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md), row-major indices [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]. The source selects its geometric order but supplies no instruction to apply it to groups; this transfer is exploratory.

The [image-corrected transcription](../resources/transcriptions/lp2-image-corrected.txt) is joined across lines and physical pages p15–22, preserving cross-page group carries. Remove the first five rubric groups (20 runes), as in the source-corrected adjacent boundary-plane test #2724. This gives 1,883 runes and exactly 432 complete printed groups. Anchor the group permutation at this independently selected chapter body start, so the p16–22 region inherits the phase from the preceding p15 black body; no new p16 reset. Apply the same route to aligned blocks of 16 **whole groups**, using both read and write orientations; a partial final block would stay unchanged (none here: 27 full blocks). Both exact original group-string inverses round-trip. The test differs from #2724, which only rearranges boundary bits.

## Model and frozen gate

Train length-only native transition and short phrase-window models on the first 80% of the three pinned literary sources, using the same greedy GP-style token lengths as #2724, with 12+ in the terminal bin. The first statistic is the average pair log likelihood ratio against the independent unigram distribution, with conditional smoothing weight20. The second is the average log likelihood ratio for the **sorted multiset of lengths of four consecutive groups**, against the corresponding iid length multiset probability, with 1,000 total smoothing weight. This local phrase-bag proxy removes order *within* four-group windows; it is not lexical or semantic phrase recognition. Unigram inventory is exactly invariant under every whole-group permutation.

Require both statistics to meet the empirical fifth-percentile native floors, both improve over the unmodified input, and both have empirical fixed-block-permutation upper-tail fraction <=0.025 for the tested orientation. Charge both reciprocal orientations, with no block offset or other geometry search. The same gate is applied to the algorithmically blind controls before scoring the original. Random fixed 16-position permutations provide the conditional null, with the same permutation applied throughout each tape. Use 399 null permutations per control and 1,999 per original orientation.

## Calibration

The held 20% donor tails yield 18 windows of exactly 432 groups and total rune count within 5% of the original (6 Shakespeare, 12 Emerson; no Gibran match). Windows overlap at stride100; the finite calibration is descriptive, not an independent population-level significance test. The separate exact solved GP corpus contains 740 groups but no eligible 432-group window at the same rune-count tolerance; thus exact solved-source language is not a matched control here. No relaxed matching or threshold tuning after original scoring.

Both fixed directions are planted, yielding 36 binned-length inversions with exact restored bins, 32/36 correct orientations pass the full gate and 4/36 wrong orientations pass. The latter is a measured direction ambiguity, not independent evidence of an authentic operation. Neither source-fixed inverse on original passes, despite good measured control sensitivity.

| Receiver | Conditional adjacent length lift (nats/group) | Four-group bag lift (nats/window) | Upper-tail fractions (pair, bag) |
|---|---:|---:|---:|
| Printed order | −0.006222095 | −0.067857737 | — |
| Read spiral | −0.020759561 | −0.084982706 | 0.592, 0.742 |
| Write spiral | −0.007553572 | −0.064647640 | 0.105, 0.4765 |
| Native floors | 0.001695024 | −0.072860492 | — |

Read spiral worsens both scores; write spiral modestly improves the bag statistic but worsens the adjacent transition statistic and fails the conditional null gate. Neither restores the native pair floor. The original printed order also misses that floor. Hence no source-supported preference for a restored group order, and no downstream rune-key fit, held-out key prediction, or plaintext claim.

## Scope and next action

Retire this fixed aligned 16-group route under the length-order prediction. The experiment cannot rule out a real permutation which does not manifest a measurable native length-order signal, alternative plaintext framing, or another independently source-selected operation. The exact numeral formula remains established; its use as a group-order instruction remains unsupported. No unknown plaintext or authentic key recovered.

## Reproduce

`node sims/lp2_p15_spiral_group_order_sft.cjs`

[Executed V8 core and CommonJS reproducer](../sims/lp2_p15_spiral_group_order_sft.cjs) · [raw outputs and pinned source blobs](lp2-p15-spiral-group-order.json). The standalone Node filesystem wrapper was not CI-run.

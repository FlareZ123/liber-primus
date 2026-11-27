# Quadratic feedback: exact all-secret black-body closure

**27 November 2026, Agent7.** No new LP2 plaintext or authentic key. This extends the [ciphertext-forced scalar result](lp2-quadratic-cipher-forced-state-allsecret-inverse.md) by removing the red p40 heading entirely and handling plaintext-driven feedback, including nonlinear GP-prime input. Retire this direct affine-output, quadratic scalar, consuming-F receiver. Arbitrary row maps, additional state, different transport, and other nonlinear update laws remain outside the result.

## Algebraic closure

Over GF29, let a consuming step satisfy P=aC+bs+d with a,b nonzero and an authentic literal F step emit C=0, P=0 without advancing s. Normalizing a nonzero-leading quadratic state law by an invertible affine change gives s'=s²+u·w+v. The original p39 red triple [27,5,15] supplies G(k)=27+5k+15k²; its normalized law is (u,v)=(15,17) when adding one forcing value.

For ordinal feedback, the broader mixed law s'=s²+uC+tP+v becomes s'=s²+tb·s+(u+ta)C+v+td. Put r=s+tb/2. Then r'=r²+(u+ta)C+v+td+tb/2−(tb/2)², with another affine output P=aC+br+(d−b·tb/2). On transparent F the change of coordinates preserves the freeze. Thus every ordinal-linear mixture of C and P reduces to ciphertext forcing or, if u+ta=0, an autonomous quadratic. This is exact, not another sampled menu. GP-prime P forcing is nonlinear in the unknown P, so cannot be absorbed by this argument.

The exact original receiver is the 3,000 black runes on p40–53, removing all eight red p40 heading runes and retaining 13 nonempty page segments (223,273,272,274,273,270,270,274,271,66,92,263,179); 124 displayed F. This avoids the possibility that an independently encoded heading caused the earlier full-chapter contradiction.

## Exact results

Maintain the complete 29-bit reachable state set, starting with all states. For each C, add the frozen-state branch if C=0; add consuming transition only when affine P is nonzero, using C ordinal, GP(C), or GP(P) as specified. The terminal empty set rejects every secret IV and every F interpretation, without language or word-boundary assumptions. C-driven or autonomous state updates allow division of output coefficients by a for the zero test; GP(P) requires all 28 scales.

| Forcing | Distinct coefficient classes | Longest continuous legal black prefix | Full survivors | Independent page starts, common coefficients |
|---|---:|---:|---:|---:|
| C ordinal | 659,344 | 683 | 0 | 0 |
| GP(C) | 659,344 | 773 | 0 | 0 |
| GP(P) | 18,461,632 | 1,042 | 0 | 0 |
| Autonomous | 23,548 ratios (all 28 scales) | 3,000 | 812 ratios, all static tails | not tested |

The fixed p39 normalized law has 22,736 affine output choices for GP(P), with longest legal prefix 581 and zero survivors. The independently seeded black page-prefix intersections for GP(P) are 259,109 / 2,947 / 50 / 4 / 0 after p40/p41/p42/p43/p44. Source p39 fixed ordinal or GP(C) maxima on the black body are 390/408 respectively. All original input is exhausted in each stated family. Coefficients are common across the scope; independently rekeying coefficients per physical page is not tested.

The autonomous cancellation case is not a literal impossibility for the entire family: all 812 surviving ratio classes have only fixed terminal state s satisfying s²+v=s and bs+d=0 (after normalization by a). A deterministic 29-state map enters its terminal cycle within at most 29 consuming steps. The first 30 black ciphertext runes contain 29 nonzero C, so every surviving path is fixed thereafter, yielding P=aC for the entire remaining tail. The two largest tail counts are 123 and 120, so top-two plaintext count is at most 30+123+120=273. The prior exhaustive 3,008-rune donor floor is 518; a 3,000-rune window can be extended by eight runes in each long donor, making 510 a conservative lower bound. This excludes the autonomous continuous survivors as the tested native GP-English register. It is not an arbitrary-language exclusion. The b=0 state-independent output class is separate: d≠0 impossible because every ciphertext symbol occurs; d=0 gives static rescaling.

## Blind native controls, actual key recovery

Use the same native GP encoding and independent trigram training on Gibran first 40,000 and Shakespeare first 150,000 encoded runes. Encrypt 3,000-rune disjoint later donor windows (offsets 55,000 and 190,000) with prime-P state update. All 18,461,632 coefficient classes searched on only first 1,200 ciphertext runes. Rank surviving classes by exact Viterbi using the frozen trigram model, preserve the selected state/history at the split, and decode the next 1,800 without refitting.

| Plant | Exact planted and recovered (u,v,a,b,d,IV) | Training candidates | Train exact | Held exact | Replay |
|---|---|---:|---:|---:|---:|
| Gibran | (15,17,7,13,5,24) | 26 | 1193/1200 | 1762/1800 | 3000/3000 |
| Shakespeare | (22,7,13,6,19,9) | 1 | 1200/1200 | 1800/1800 | 3000/3000 |

The 45 errors in the first plant demonstrate the remaining latent-F/causal ambiguity even with the correct key and exact replay. No original candidate was scored after infeasibility.

## Remaining gap and compute decision

A fixed source-law arbitrary-row, consuming-F experiment was attempted. The previous independent-row relaxed upper bound 697/689 does not exclude native prose. Alternating exact path DP with row top-two choice yielded relaxed scores 476/497 (some rows consume all 29 labels and therefore cannot reserve a unique F preimage). A 12-second ordinal HiGHS aggregate-flow MIP relaxation returned incumbent 462 and upper bound 620.997, still above the native floor. This is inconclusive, not a key recovery. The unconstrained 29×29 row table is not supplied by p39 and further optimization is lower priority than a new authored mechanism.

## Reproduce

[C++20 engine](../sims/lp2_quadratic_feedback_allsecret_sft.cpp) and [Node CommonJS driver](../sims/lp2_quadratic_feedback_allsecret_sft.cjs), code commit 24faba235819a9b4eefa1c59df0d3896f1372f8f. Compile with a C++20 compiler, for example `g++ -O3 -std=c++20 sims/lp2_quadratic_feedback_allsecret_sft.cpp -o quadratic-feedback-sft`, then `node sims/lp2_quadratic_feedback_allsecret_sft.cjs ./quadratic-feedback-sft`. The original engines were compiled and executed locally on the exact fetched canonical black tape; two control key scans ran locally and the frozen scoring/holdout code ran in connected V8. The combined Node spawning wrapper has not been run as one process in this container because the complete repository is not mounted. [Raw output](lp2-quadratic-feedback-allsecret-black-body-output.json). Corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; full 3008-rune numeric tape SHA256 260fc1ff6eee3d7a108ed43d5b8112cc5c332fa2f4460e71c563ad504de2a6b7.

# Fixed p15 numeral spiral on the boundary plane

**Decision (Agent 11, 25 November 2026):** neither reciprocal source-selected route makes the original p15–22 word-length sequence more native. Both are substantially worse than the unmodified boundary mask; no q8 key fitting is justified. This excludes only the stated finite route transfer, not a general decoy-boundary cipher.

## Exact receiver

The [established numeral spiral](../results/lp2-p15-fibonacci-prime-spiral.md) fixes the row-major route [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]. Remove the two red headings (9+11 runes) from p15, join physical pages 15–22 with line/page carry intact, and encode a cut-after-rune bit for each of the remaining 1,883 body runes. Fix the chapter-end cut. Read or write the exact spiral per 16-bit block from the first body rune; restrict the route to the residual block's existing positions. Both inverses round-trip the original bit mask and preserve all 432 cuts; no ciphertext rune is moved. Unlike the prior [rune-transposition test](lp2-p15-spiral-q16-fhold-inverse.md), this acts only on the boundary plane.

## Calibration and outcomes

Fit a smoothed native GP word-length unigram and bigram model on the first 80% of the three pinned literary donors. Compare 1,883-rune held-tail windows within 5% of the original group count. A first calibration attempt found only 11 disjoint windows (under the minimum 12) and did not score original routes. The final calibration uses stride 100 donor words and up to 12 windows per donor, with 15 eligible windows (3 Shakespeare, 12 Emerson; no Gibran window meets the count constraint). These overlap and are not independent samples. Both planted directions restore every original bit exactly in all 30 round trips. Train and held donor words are disjoint; last word is clipped at the fixed chapter end. Use empirical fifth-percentile floors as descriptive calibration, not a claimed formal population-level significance test. Require both floors, improvement over printed bigram likelihood, and one-sided random-permutation tail fraction <=0.025 for either charged direction.

| Mask | Groups | Singletons | Length >=10 | Unigram nats/group | Bigram nats/group |
|---|---:|---:|---:|---:|---:|
| Printed | 432 | 18 | 15 | -2.144428 | -2.153348 |
| Read spiral | 432 | 53 | 26 | -2.412073 | -2.415531 |
| Write spiral | 432 | 49 | 23 | -2.369758 | -2.374633 |
| Native lower floors | — | — | — | -2.133966 | -2.113819 |

Against 1,000 random fixed block permutations, the two spiral routes are less destructive than most (empirical bigram upper-tail fractions 0.002997 and 0.000999). This is **not** evidence of restoration: both decrease bigram likelihood by 0.262183 and 0.221285 nats/group relative to the actual printed mask and fail both native floors. The printed mask itself narrowly misses the floors. No claim that printed cuts are authentic words follows. The test does not fit any key and does not reopen arbitrary block origins, orientations or permutations.

## Reproduction

[Executed core / Node CommonJS SFT](../sims/lp2_p15_spiral_boundary_plane_sft.cjs) · [complete result](lp2-p15-spiral-boundary-plane-output.json). Actual core executed against fetched repository inputs in connected V8; standalone Node wrapper and CI not independently executed. Input blob hashes in output.

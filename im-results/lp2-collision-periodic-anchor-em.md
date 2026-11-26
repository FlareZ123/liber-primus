# Seeded soft alignment for long periodic collision-rejection keys

## Constructive method

The previous [partial-key cyclic mixture](lp2-collision-periodic-partialkey.md) succeeds for q13/q29 but assumes full-cycle clean windows in its proposal likelihood. A subperiod version [SFT](../sims/lp2_collision_periodic_shortwindow_sft.cjs) loses the true q76 prefix by depth5 at width96/stride15; dense width128/stride5 keeps one correct prefix through depth4, not a solved long key. Do not interpret that failed narrow search as exclusion.

The new [seeded alignment SFT](../sims/lp2_collision_periodic_anchor_em_sft.cjs) initializes a soft posterior on each key digit from a short unaligned ciphertext anchor: Q[j,k]=p(C[start+j]-k). Uncovered digits have uniform posterior. Approximate forward-backward uses phase-dependent mixed emissions sum_k Q[j,k] p(C_i-k) and a geometric independent deletion clock with jumps 1,2,3 (probabilities 1-eps, (1-eps)eps, eps²; eps=.028). For three iterations the anchor phases are constrained sequentially; the constraint is then removed. Expected phase/rune occupancies update each key posterior by annealed softmax of expected native log likelihood, with damping .2 and temperature 5→1 over 24 iterations. This is an approximate key-proposal model, not the true collision process. Final hard key proposals ranked by the exact original collision-rejection forward likelihood from the earlier SFT (rho=.81), then frozen for continuation. Bigram Viterbi independently replays emitted and rejected ciphertext attempts.

Native language model is unchanged (first 80% of Shakespeare, no printed boundaries). q76 full-anchor and q256 48-rune partial-anchor tests use N=12956, fit9000, held3956. q76 and q256 are suggested by original p55 length and p50 256 cells, but no source authenticates a periodic additive key of either length.

## Executed results

| Tape | q | Anchor starts | Key match | Fit gain | Held gain | Held correct |
|---|---:|---|---:|---:|---:|---:|
| Emerson plant, seed 0x6113b05, donor offset5000 | 76 | 100,1000,2000,3000 | 76/76 from every start | +3342.820 | +1405.383 | 3955/3956 |
| Original, first pair | 76 | 100,1000 | unknown | -4817.943 | -2379.907 | nonprose |
| Original, second pair | 76 | 2000,3000 | unknown | -4593.786 | -2317.435 | nonprose |
| Shakespeare held donor, seed 0x6113c06, offset12000 | 256 | 100 | 255/256 | +3215.200 | +1262.595 | 3938/3956 |
| Emerson plant, seed 0x6113d07, offset10000 | 256 | 1000 | 256/256 | +3289.479 | +1526.659 | 3953/3956 |
| Original | 256 | 100 | unknown | -3899.816 | -2331.148 | nonprose |
| Original | 256 | 1000 | unknown | -3368.758 | -2385.303 | nonprose |

Every selected output exactly replays the respective ciphertext. q76 plant fit8987/9000, skips12936/12956; q256 Shakespeare fit8937/9000, skips12934/12956, Emerson fit8990/9000, skips12940/12956. Original candidate texts are nonprose. No authenticated original key or plaintext. Key proposals approximate, no all-key exclusion.

## Reproduction and raw results

- [q76 control](../workplace/agent6-q76-anchor-em-control.json), [original A](../workplace/agent6-q76-anchor-em-original-a.json), [original B](../workplace/agent6-q76-anchor-em-original-b.json).
- [q256 control A](../workplace/agent6-q256-partial-anchor-control-a.json), [control B](../workplace/agent6-q256-partial-anchor-control-b.json), [original A](../workplace/agent6-q256-partial-anchor-original-a.json), [original B](../workplace/agent6-q256-partial-anchor-original-b.json).
- [Failed q76 subperiod narrow beam](../workplace/agent6-q76-shortwindow-control.json), [dense partial beam](../workplace/agent6-q76-dense-control.json).

Each JSON includes exact options and all layer histories. Run committed CJS SFT with JSON options as single argument. The q76 initial implementation logged exact scores each iteration; subsequent revision only scores final unless scoreEvery is supplied. Key proposals unchanged. Connected V8 function executed; standalone Node wrapper not separately run. Key recovery is constructive on controlled synthetic encryption of held native donor prose; all original results are negative.
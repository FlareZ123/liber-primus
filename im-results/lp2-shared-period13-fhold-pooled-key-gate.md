# Cross-chapter pooled period-13 F-hold key inference

**Decision — Agent6, 2026-11-24, #2546:** Pooling two independently framed short segments of the authentic LP1 second KOAN recovers FIRFUMFERENFE exactly and all 319 native runes, including a 100-rune prospective continuation. It improves over independently fitted short-segment keys. The transfer to original p23–26 plus the first 208 runes of p54–55 fails: no selected shared key predicts the withheld final 100 runes. Retire this bounded pooling procedure, not every possible shared period-13 key.

## Frozen model and data

Same authentic additive GP29 transducer as #2520: non-F plaintext adds the current periodic shift and advances; plaintext F emits F and holds. Ciphertext F can also be an ordinary encrypted symbol. Key period 13 is fixed by the solved KOAN. One common key; first unit initial phase zero, second freely chosen from 13 possibilities with a constant log(13) cost. No key-language prior, crib, independently fitted per-unit shift, or phase changes inside a unit.

#2521 leaves only p23–26 and p54–55 under relaxed period-13 native collision bounds (1/96 and 2/96 control-window passes, not demonstrated feasible keys). Use full p23–26 (1021) and p54–55 prefix (208) for fitting. Reserve the final 100 runes of the second scope. Known control uses exact original LP1 KOAN ciphertext 319 runes with training splits 110/109 and held-out 100; exclude the whole control plaintext section from native model training. Mismatched control independently re-encrypts the second native interval with a seeded random period-13 key and phase7.

## Two inference procedures

1. **Random-key annealed coordinate EM:** 600 deterministic restarts, soft illegal-advance penalties 2 and7 followed by infinite penalty; eight coordinate sweeps per stage. Joint per-phase ciphertext histograms update the common key under a GP29 unigram model. Exact latent Viterbi legality at final stage; deduplicate keys and rerank top80 by native trigram Viterbi. The second frame carries the charged free initial phase.
2. **Constructive hold-path initialization:** For each candidate hold mask, compute a per-phase histogram. A shift k is legal iff that histogram contains zero instances of ciphertext k; otherwise it would decrypt an advancing position to forbidden plaintext F. For any fixed pair of hold masks and relative initial phase, optimize the additive key exactly under the summed unigram scores. Enumerate all hold schedules in the short controls and all eight schedules of the original second prefix, with all13 relative phases. Sample at most4096 first-unit hold masks using predeclared hold probabilities .25,.5,.75,.1,.9 and fixed seed. Deduplicate keys, exact Viterbi re-evaluate and rerank top80 by trigram score. This does not enumerate all 2^37 first-unit masks or all legal keys per mask; it is exact conditional unigram optimization, not exhaustive trigram optimization.

## Authentic and mismatched controls

The random-key approach recovers the authentic key up to one-position cyclic rotation, 208/219 fitting runes and 100/100 withheld; neither independently fitted unit recovers the exact cyclic key. Constructive path initialization improves this to the **exact anchored authentic key** [0,10,4,0,1,19,0,18,4,18,9,0,18], true initial phases0/4, 219/219 training and 100/100 holdout. All replays exact. The top-vs-runner-up trigram margin is3.3310 nats, so the authentic result is not an enormous score separation. One mismatched planted control is a calibration example, not population-level sensitivity/specificity.

| Constructive comparison | Shared fit trigram score | Independent fit score sum | Shared training exact | Shared held-out exact | Independent second held-out exact |
|---|---:|---:|---:|---:|---:|
| Authentic same key | -575.4475 | -672.8410 | 219/219 | 100/100 | 92/100 |
| Mismatched keys | -769.6650 | -672.8410 | 69/219 | 36/100 | 92/100 |

These are achieved heuristic objectives; the shared candidate set may outperform a less effectively searched independent set. They are not nested-model optimum likelihood ratios.

## Original results and boundary audit

Random-key EM produces zero legal pooled candidates and zero first-unit candidates; the 208-rune second prefix alone yields five. Constructive initialization removes that practical barrier:

- 3,968 distinct sampled first-unit masks; 1,626 individually feasible.
- 104 second-prefix mask/relative-phase profiles.
- 28,693 jointly feasible mask/profile pairs; 21,020 distinct conditional-best common keys.
- Selected common key `[0,0,12,27,11,11,21,14,23,0,15,14,12]`; relative phase9; training trigram score -4502.4788; runner-up -4505.1556. Exact training replay.
- Independent selected keys `[19,0,12,11,13,23,12,14,16,23,6,7,27]` and `[6,16,20,15,24,27,17,4,13,26,17,19,14]`; score sum -4501.7696. Neither is coherent native text.

Frozen pooled second-prefix boundary (phase6 and previous GP symbols21,11) has no legal withheld path. Exact fixed-key full second-unit DP with its frozen start phase9 also has **no full path**, so this is not just loss of a weaker boundary state. Retrospectively allowing all initial phases at the same frozen key does admit a phase6 full path, with prefix penalty3.8801 nats and withheld score -3.5810 nats/rune; the output is nonlinguistic:

`GDDCAMAEWXJWLHNXEOETHEARTRGXDXHEOENGBEACOEOGJRXFTOOJUNGMCEAFXIANGMDNGDIALYCODIAUFMYUPIAAEAOAEDXGOLRUIBASTHOEEAIWWOEOMTDEA`

That diagnostic replays exactly but does not meet the frozen-phase prospective test. The independently fitted second-prefix key has no full path at any initial phase. The authentic same-key control holdout scored -2.6379 nats/rune. The original training and holdout provide no coherent text or authenticated key. No key refit or runner-up rescue against holdout is authorized.

## Consequence

Constructing legal keys from hold paths is more useful than random-key starts on long original input. Retain as a reusable initialization algorithm and a real authentic control. Retire this exact original shared-key inference route; do not claim all shared keys impossible. Any extension should use an independent source-selected absolute key/clock or a clearly different model, not resample this failed holdout until a better score appears.

[CommonJS reproducer](../sims/lp2_shared_period13_fhold_pool_sft.cjs). Principal calculations and fixed-key boundary diagnostic executed directly in the connected JS runtime. No CI run claimed. [Director #2546](https://github.com/FlareZ123/liber-primus/issues/2546).

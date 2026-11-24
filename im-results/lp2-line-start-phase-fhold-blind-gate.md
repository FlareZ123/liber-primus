# Unknown independent physical-line start phases: blind transparent-F periodic inverse

**Agent 7, 24 November 2026.** Bounded negative for q8/q13 shared GP29 additive keys with arbitrary line start phases. This differs from #1522 (fixed phase zero), the arbitrary line-IV additive model, and the later all-secret direction/F-hold bound (which still resets at phase zero). No authentic unknown plaintext or key.

## Fixed mechanism and inference

At each genuine physical printed line, choose any phase 0..q-1 of a common cyclic key. Plaintext F emits literal F and holds the phase, as in historical solved LP1/LP2; every other plaintext rune adds its key value modulo29 and advances phase. Ordinary consuming output may also be F. The two authentic LP1 key lengths q8/q13 are fixed before fitting. Line reset geometry is original; no source independently selects the unknown phase clock.

A scaled forward/backward HMM exactly marginalizes all line starting phases and all latent holds under a fixed smoothed unigram emission model. The M-step chooses a discrete shift at every phase maximizing expected complete-data emission log likelihood. Anneal consuming-emission uniform noise 0.15 -> 0.04 -> 0.005; transparent F probability is unchanged. Noise is a numerical training relaxation, **not** part of the proposed historical cipher. Fit 16 random starts for each positive control and 24 for each original split, at most 22 EM iterations per stage. Keys are canonicalized only by rotation, which is unidentifiable with independent line phases. This is a heuristic blind optimizer, not exhaustive key enumeration.

Train on disjoint even/odd pages p0–39 and jointly. Freeze key before any p40–55 scoring. A separate exact bigram Viterbi decoder permits only legal transparent-F or non-F consuming emissions. For each holdout line with >=8 runes, choose the best phase/last-plaintext state from its first half, then freeze that state for decoding the remaining half. The withheld suffix itself does not choose its starting phase. An infeasible suffix is counted as a failed line, not silently skipped; language score and accuracy on surviving suffixes are reported separately. Training language model uses 1,871 encoded LP1 runes before section 10; native controls sample contiguous fragments from the disjoint 1,174-rune sections 10–16. These fragments are repeated draws, not independent authored texts.

## Actual blind recovery

| q | Native control A/B/joint exact keys (up to rotation) | Native suffix correct among surviving runes | Native failed lines /149 | Original A/B best rotation agreement | Original joint failed lines /149 |
|---|---:|---:|---:|---:|---:|
| 8 | 8/8, 8/8, 8/8 | 96.517% of 1,694 | 0 | 1/8 | 34 |
| 13 | 13/13, 13/13, 13/13 | 97.833% of 1,661 | 3 | 3/13 | 37 |

For q13 the known true key has the same three frozen-prefix failures (the best short prefix phase may be wrong). Counting those 33 missing suffix runes as incorrect gives approximately 95.93% over all 1,694 suffix slots. q8 control recovers the native key in all three independent fits.

The exact recovered positive keys, canonicalized by rotation, are:

- q8: `0,7,27,26,26,3,15,6`
- q13: `2,24,6,3,24,19,9,11,28,19,9,20,3`

Original joint keys: q8 `0,12,6,18,7,10,23,16`; q13 `0,18,14,22,22,13,7,15,28,18,23,24,4`.

| q | Native true-key holdout smoothed marginal nats/rune | Original A / B / joint | Original wrong-key range (100 random pads) |
|---|---:|---:|---:|
| 8 | -3.034439 | -3.782393 / -3.749100 / -3.768745 | -3.911136 to -3.759970 |
| 13 | -3.047031 | -3.759458 / -3.731916 / -3.730297 | -3.792449 to -3.701137 |

The q8 B score slightly exceeds the 100-key random comparison maximum, but the A/B keys are unrelated and the joint model does not reproduce that improvement. All original suffix paths are nonprose, with scores about -4.10 to -4.15 on surviving runes, compared with -2.79/-2.82 for the native controls. In addition, the exact phase-frozen original decoder fails 31–40 of the 149 eligible lines, versus 0/3 on the true-key plants.

**Decision:** do not optimize the same two shared line-phase models further without independent key/clock evidence. The blind recovery works on source-shaped native controls but fails the original stability and withheld prose gates. This is not an all-key impossibility theorem and says nothing about different periods, private section keys, reversed lines, another alphabet or nonadditive states. No source-selected key or unknown plaintext recovered.

Reproduce: `node sims/lp2_line_start_phase_fhold_blind_sft.cjs`. Core executed against exact three repository inputs in connected ECMAScript runtime; no standalone Node/CI run claimed.

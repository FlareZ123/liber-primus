# Native bigram q8 M04 hold-repair receiver (#2728)

## Decision

A practical exact-path receiver for the explicit M04 channel can identify unknown compact cyclic keys: three independent hidden q8 keys recovered from 232-rune native prefixes, with **224/228 withheld runes correct**, despite repair events and residual repeats. The same bounded key-search pipeline on original p54 yields no supported key or prose on p55. **Retire this bounded receiver on this original chapter, not the entire M04 family.** Key search is heuristic; the likelihood for each key is exact under the specified first-order language prior.

## Fixed channel and language model

Reference: [pinned M04 Phase15](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase15_m04_baseline.md) and [local #2672 crosswalk](pnotisdev-pinned-20261024-crosswalk.md). Ordinary GP29 additive encryption, every plaintext rune consumes unless a would-be collision with the previous emitted ciphertext is repaired. If repaired, replace uniformly among the other 28 ciphertext symbols and **hold the key phase**. The plaintext advances on both branches. No transparent F, insertion, T6, private replacement rule or word reset. Fix q = 1 − 29×86/12947 = 0.8073685023557581 from the original repeat-rate reference (iid-uniform approximation, not fitted here).

Train a spacing-free GP29 unigram/bigram prior on the first 80% of the three pinned literary rune tapes, with pseudocounts 1/0.5 respectively. Donor tails remain out of training. Source-normalization choices match existing native-register experiments. The initial phase is marginalized uniformly (rotations of the same tape are equivalent).

## Exact likelihood and constructive unknown-key recovery

At step i, ciphertext c_i and preceding c_(i−1) are observed. With pre-step phase s, a normal emission has p=c_i−K_s mod29 and advances to s+1; its weight is 1 except for a surviving collision, weighted 1−q. A repair is possible only when c_i differs from c_(i−1): p=c_(i−1)−K_s, phase stays s, emission weight q/28. Multiply either by native plaintext-transition probability. First emission has no previous ciphertext and must advance. After any emission the current plaintext rune is a deterministic function of phase and whether the last transition held, so the full first-order latent state needs only 16 cells, not a large beam. Scaled forward sums all legal paths; forward-backward produces posterior rune and repair probabilities. Viterbi returns a legal single path; the program verifies every emission and clock transition, including each repair's required collision and permitted replacement.

Unknown key proposal: for each overlapping window length 40,64,96 (half-window stride), ignore holds solely for seed construction. Accumulate native bigram log-likelihoods on the eight adjacent-phase key-pair edges. Condition on each of 29 initial masks and use cyclic max-plus DP to find the best complete key for that initial mask; retain three best windows' key classes per window. Rank all deduplicated cyclic key classes using the **exact hold-aware forward likelihood on the entire fit**. Coordinate-ascent refine six best seeds, up to four passes with all 29 choices at each phase. This is a bounded search, not an exhaustive proof over 29^8 keys. The key and all channel/language parameters are frozen before evaluating the final 76 runes; held score is log L(full)−log L(prefix), compared with the exact key-independent uniform-prior likelihood. Viterbi reconstruction may smooth over the seam using held observations but never changes the fitted key.

## Calibration

Frozen positive gate: all three hidden key classes recovered, each held segment at least 90% rune-accurate and >0.15 nats/rune gain above uniform. All three independently random nonperiodic key-stream nulls must score <0.1 on holdout. No original is scored if this fails. Actual independent tail windows and PRNG seeds are in the runnable source and raw output.

| Donor | Planted repairs / residual repeats | Hidden key | Held correct | Held gain (nats/rune) | Independent-key null gain |
|---|---:|---|---:|---:|---:|
| Gibran | 7 / 1 | exact rotation | 76/76 | +0.739046 | −0.459577 |
| Shakespeare | 7 / 2 | exact rotation | 76/76 | +0.420945 | −0.734686 |
| Emerson | 7 / 0 | exact rotation | 72/76 | +0.500683 | −0.674862 |

The seed stage already finds the correct key class in all three positive cases; the hold-aware score distinguishes them from competing seeds. The decoder with the known true key also recovers 76/76,76/76,72/76 held runes, so the four Emerson errors reflect path/LM uncertainty even with correct key. Actual repair-event posteriors include 0.0463 and 0.00757 on two true events, and 0.395/0.476 on others. The receiver does not perfectly identify erased collision positions. These are three native-language plants, not proof of general recovery power.

## Original frozen result

Physical p54 contains 232 runes and p55 76, without resetting at the page seam. Ignore all separators. The fit proposes 57 distinct cyclic key seeds and evaluates 3641 keys (including repeated evaluations); best cyclic representative [0,19,2,9,12,3,3,24] gives **−0.241941 nats/rune fit gain and −0.820708 held gain**, worse than every tested independent-key null on the held segment. Its Viterbi path has 39 repaired emissions out of 308; posterior mean repair count 39.68. The candidate continuation is nonlinguistic; mean model-conditional confidence on held Viterbi symbols is 0.5694. Exact legal forward replay is necessary but automatic for many paths and does not authenticate this key. Raw output preserves the rejected candidate, repair path and all per-rune posterior probabilities.

No accepted key, no original plaintext. The original loss is an empirical failure of this bounded seed/coordinate search under this specific fixed q, native prior, q8 continuous key and uniform-other hold channel. It does not prove that an unproposed key, different prior, or alternative repair mechanism cannot work. No further repair-law tuning or seed-bank extension justified absent independent source evidence.

## Reproduction

[CommonJS SFT](../sims/lp2_m04_hold_q8_native_inverse_sft.cjs), [raw result](lp2-m04-hold-q8-native-inverse-output.json). Core executed in connected JavaScript; both optimized and detailed forward likelihood agree to 1e-8, and detailed Viterbi paths are checked against every emission. Standalone Node wrapper not independently executed; no CI claim.

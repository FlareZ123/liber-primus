# Exact historical prime/F clock with one inferred origin and typed resets

**Agent 7 · 24 November 2026 · Director #2525.** Authentic blind key/clock recovery; exact original-cipher exclusion of one bounded low-dimensional extension. No unknown LP2 plaintext recovered.

## Frozen model and distinction

Use the actual solved p56 encoder: plaintext GP index zero (F) is output unchanged and consumes no prime. Otherwise (C_i=P_i+(p_j-1)\pmod {29}), and j advances by one. The key starts at one shared unknown zero-based ordinary-prime ordinal s in 0..463 (prime 2 through 3301). Five binary parameters select whether to reset j to the same s before the next rune at **every** physical four-dot stop, three-dot comma, 13-dot mark, 10-dot mark or nonempty physical page start. The bit mask is 1/2/4/8/16 in that order. No per-event decisions, prime reordering, new arithmetic, extra steps, fitted alphabet or independently seeded segments.

Prior [all464 monotone F-clock](lp2-prime-totient-all464-true-Fbranch-original-complete-inverses.md) and [prime2 red13 resets](lp2-red13-prime-totient-reset-original-gate.md) are already negative. The new finite family jointly infers origin and whole-class reset decisions; the no-reset case is included only as a regression. Reset extension is a hypothesis based on the known chapter/key boundaries and physical marks, not an author-authenticated rule. #2525 claim comment 7124877731 frozen before target processing.

Target: complete original p40–53, offsets [9640,12648), 3008 GP runes. Prefix 1500, untouched 1508 continuation. Use canonical corpus, physical ink and source-audited punctuation identity: exclude editorial events 57–60, uncertain singleton91, absent125; classify event127 by actual comma morphology. In this target those corrections do not change any events. Count 39 internal four-dot stops, one three-dot comma, zero internal 13-dot marks, one ten-dot mark and 12 nonempty page starts. Numerical p50 supplies no runes; the following p51 counts as one boundary. Initial and terminal marks do not add an extra consumption.

## Authentic blind calibration

Infer from only the first 60 real ciphertext runes of p56, all 464 starts and 8 distinguishable masks (the three actual internal mark classes, at 5/19/45: 13-dot, comma, 10-dot). The other two bits are unobserved on this page and cannot be identified. The derivative stop after the digest is not a printed separate four-dot mark. Model the language with add-one GP unigram, and hierarchical bigram/trigram conditional counts with fixed backoff weight10 from the seven solved LP1 native source sections (not p56/p57). Viterbi state comprises the current prime pointer and two most recent plaintext symbols. Every ciphertext F permits the literal-F path; a consuming inverse is permitted if and only if it yields non-F. A mark selected by the mask collapses the prime pointer to the shared origin, preserving language state.

The native plaintext donor is read for language training only from LP1 and for authentic p56 final comparisons; no p56 plaintext constraint enters inference. The rank-one training solution is the real prime2 origin and no resets at the three observed internal classes, with score −148.0506158101; the runner-up is origin5/13-dot reset at −162.5373870792. It recovers **60/60** prefix runes, including the literal F at 56. Freeze that exact prefix state and clock; infer the remaining F-branch choices only within the fixed model, using the disjoint 25 ciphertext symbols. Recover **25/25** withheld runes and replay all85 original ciphertext runes exactly. This is real ciphertext-only parameter recovery, although it is not a new solution to an unknown page.

## Exact original result

For each of 464 origins ×32 whole-class masks (14,848 parameter pairs), exact reachability propagates the set of prime pointers, with a mandatory reset at the selected class positions. Zero legal paths is a mechanical contradiction independent of language. No beam pruning, dictionary assumptions, or scoring enters this decision.

| Four-dot reset | Nonempty page reset | Other three class bits | Longest legal prefix over all starts | Surviving origin/mask pairs at 1500 |
|---|---|---|---:|---:|
| No | No | Any | 628 | 0 |
| Yes | No | Any | 275 | 0 |
| No | Yes | Any | 486 | 0 |
| Yes | Yes | Any | 243 | 0 |

The largest survival without a four-dot or page reset is at origins283/284/285. For four-dot reset alone it is origin312; page reset alone origin285; both origin66. The late comma (1689) and 10-dot mark (2474) occur after every path is extinct; the 13-dot bit has no effect inside this physical interval. Thus 32 nominal masks are only 16 physically distinct reset-position masks, and even those late distinctions are irrelevant to the early obstruction. No candidate survives the frozen training prefix; there is no key to evaluate on the withheld continuation and no language score to report. No false plaintext is generated to fill that gap.

## Decision

Retire this shared-origin, typed-reset extension on original p40–53 across the finite domain. The result directly includes the historical positive arithmetic/latent-F mechanism and the previously untested class-level shared-origin reset decisions. A genuine remaining prerequisite for this schedule is an independently selected **different origin or clock transition at a particular internal boundary before rune628**, or a different independently established key-generation rule. Neither the authentic p56 nor the current original marks identify it. Do not add private reset choices or arbitrary origins merely to rescue the model.

Reproduction: `node sims/lp2_prime_F_typed_reset_shared_origin_sft.cjs`, executed against exact repository inputs in connected V8; code commit 0ba8879c4022b622197d4014cfd806742bd67dca (assertions added after execution). No separate CI claim.
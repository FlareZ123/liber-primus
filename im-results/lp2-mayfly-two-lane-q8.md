# Issue #2735 — independent mayfly rune lanes, q8
Agent17, 2026-11-25. No original plaintext recovered.

**Frozen architecture:** continuous p23–26 (213+270+273+265=1021 GP29 runes), chapter-offset parity0 and parity1 lanes length511/510. Each starts q8 additive key phase zero; literal plaintext F emits zero and holds, non-F consumes. The p24 paired artwork motivates trying two lanes but does not authenticate this reading. Fit p23–25 = 378 runes per lane; p26 withheld =133/132. No page realignment or lane reversal; no printed spacing.

## Necessary bounds
Exact DP over each visible ciphertext zero as hold or consuming, retaining last 25 active symbols; aggregate equal-rune/bigram counts across active lags8,16,24. Any valid key preserves these equalities. Lane0 has 19 zeroes, rune range37–58, bigram0–2; lane1 has18, rune40–67, bigram1–5. Across every length-matched contiguous native-rendered Shakespeare, Emerson and Gibran window, only 86/599395 lane0 and 2051/599398 lane1 pass separate range/hold checks. These are relaxed marginal bounds; no joint feasibility or universal language exclusion follows. Two independently keyed planted lanes satisfy true equality invariants.

## Blind inverse
Spacing-free trigram trained on Gibran plus solved-native sections; Shakespeare and Emerson donors excluded. Beam over visible-zero masks (2048 states), exact phase-wise unigram score upper bounds on each prefix, keep top128 final masks, top5 feasible shift values per phase. With a fixed mask, all trigram factors couple at most three consecutive cyclic phases; exact cyclic max-sum DP chooses shifts within retained domains. Exact fixed-key Viterbi reranks and coordinate-refines top8 distinct keys on fit only. Freeze best key and end phase/last-two plaintext runes for holdout. Forward replay checked for every legal decoded fit and continuation. This is a bounded inference, not exhaustive key exclusion.

| Input | Fit nats/rune | Holdout nats/rune | Recovered fit/hold |
|---|---:|---:|---|
| Plant lane0 | -2.525911 | -2.580588 | 378/378,133/133 |
| Plant lane1 | -2.533034 | -2.558483 | 378/378,132/132 |
| One-message split0 | -5.069939 | no legal path | nonprose |
| One-message split1 | -5.207602 | no legal path | nonprose |
| Independent pad0 | -5.404001 | no legal path | nonprose |
| Independent pad1 | -5.314454 | -6.029140 | nonprose |
| Original lane0 | -5.428703 | no legal path | nonprose |
| Original lane1 | -5.441315 | no legal path | nonprose |

Both blind keys exactly recovered, 756/756 fit and 265/265 withheld symbols; controls use two independently keyed donors. Original best fit keys [27,12,12,16,2,15,11,2] and [8,15,28,14,7,26,8,14] yield nonsensical strings and neither has legal continuation from the frozen state. Original result does not establish that every key is impossible. Retire this frozen two-lane receiver under ordinary prose; don't change period/lane geometry after failure. No coherent original text or exact original full reinterleaving was recovered.

[Bounds SFT](../sims/lp2_mayfly_two_lane_q8_bounds_sft.cjs), [bounds output](lp2-mayfly-two-lane-q8-bounds.json), [blind SFT](../sims/lp2_mayfly_two_lane_q8_blind_sft.cjs), [blind output](lp2-mayfly-two-lane-q8-blind.json). Executed on connected ECMAScript runtime using exact repository inputs; no independent standalone CI execution claimed.

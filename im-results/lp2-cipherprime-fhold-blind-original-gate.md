# Ciphertext-prime clock with authentic-style F hold: blind key recovery gate

Extends the separately tested [no-hold model](lp2-cipherprime-periodic-blind-original-gate.md) by an independently historical operation: LP1 WELCOME/KOAN and solved LP2 p56 leave plaintext F transparent and do not advance the cipher clock. The conjectured clock weights themselves are not selected by a first-party rule. Here ordinary output is C=(P+K[q]) mod29; ordinary next phase is q+prime[C] mod L; plaintext F emits 0 and holds q. An ordinary cipher F is legal if K[q] is nonzero. No other skips, resets or clock signs are fitted. This differs from the Director #2544 plaintext-prime advance and the previous rank28 clock.

## Algorithm

Use 192 deterministic hidden-F-mask seeds per prefix, reconstruct a feasible unigram shift key from each, and alternate exact phase Viterbi with maximum-likelihood per-phase key estimates for at most 15 iterations. Rank the best 32 distinct unigram keys with exact trigram Viterbi over phase and two previous plaintext symbols. Freeze the best prefix path, key and terminal context before decoding the suffix. Also test full-key feasibility separately, allowing the prefix path to change. Training excludes LP2 solved pages 56/57 and each relevant plant target. A period must recover both key and every withheld rune in at least two of three native plants before original transfer. No unknown suffix is used in the search.

## Blinded controls

| Native source | Period | Key matches | Withheld matches | Distinct feasible keys |
|---|---:|---:|---:|---:|
| 0_welcome | 8 | 8/8 | 170/170 | 78 |
| 0_welcome | 13 | 13/13 | 170/170 | 85 |
| 0_welcome | 29 | 20/29 | 0/170 | 99 |
| 0_koan_1 | 8 | 8/8 | 258/258 | 43 |
| 0_koan_1 | 13 | 13/13 | 258/258 | 69 |
| 0_koan_1 | 29 | 23/29 | 0/258 | 109 |
| 0_loss_of_divinity | 8 | 8/8 | 250/250 | 74 |
| 0_loss_of_divinity | 13 | 13/13 | 250/250 | 94 |
| 0_loss_of_divinity | 29 | 1/29 | 0/250 | 116 |

Periods meeting the gate: 8, 13. Exact key recovery and withheld recovery do not imply uniquely correct prefix decoding: the period-8 KOAN control has two prefix mismatches even with its exact key.

## Original transfer

| Source scope | Period | Prefix/total | Prefix nats/rune | Frozen suffix nats/rune | Full fixed-key nats/rune |
|---|---:|---:|---:|---:|---:|
| p15-22 | 8 | 959/1903 | -5.2024 | none | none |
| p15-22 | 13 | 959/1903 | -4.8837 | none | none |
| p33-39 | 8 | 746/1680 | -5.0296 | none | none |
| p33-39 | 13 | 746/1680 | -4.8159 | none | none |

No recovered unknown plaintext or historical key is established. The finite search is heuristic; failure on plants cannot reject the underlying cipher. Frozen-path prediction and whole-key feasibility are distinct. Exact replay is an implementation invariant. Original predictions, full scores, all plant keys and match counts are in [machine output](lp2-cipherprime-fhold-blind-output.json). Reproduce with `node sims/lp2_cipherprime_fhold_blind_sft.cjs`. Executed directly on the pinned repository source in isolated JavaScript, no CI claim. Do not extend the clock family without a new source selector or materially stronger blind recovery.

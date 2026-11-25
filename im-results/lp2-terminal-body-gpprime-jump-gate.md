# Terminal body GP-prime jump, frozen physical-page continuation (#2756)

## Decision

Six of the 3,302 zero-based initial ordinals survive the complete corrected 299-rune body. The frozen prefix winner produces nonprose; no key or unknown plaintext is recovered. This is not a language-independent exclusion. One of two native controls fails exact origin recovery, so the ranking cannot exclude the family.

The recurrence is already present in `lp2-plaintext-gpprime-jump-clock-original-gate.md` and `lp2-plaintext-weighted-prime-index-clock.md`. Their terminal tests include the nine title runes (308 runes total), with different prefix boundaries. The only new receiver tested here is the source-corrected black body starting p54:9 and the physical p54/p55 boundary. No other weights, resets, or origins were introduced.

## Fixed operation and result

For non-F plaintext p, C=(p+prime[j]-1) mod29, then j+=GPprime[p]; literal F emits zero without advancing. Initial j=0..3301. Backward Boolean DP preserves both legal meanings of ciphertext zero and imposes no spacing or language constraints. The maximum ordinal is bounded by 3301+299*109. Every state within that bound is computed, with no beam or state cap.

The 223-rune p54 prefix admits six origins, and all six survive the complete 299-rune body: 860,864,890,926,936,952. The target-excluded native trigram prefix winner is 926, with boundary cursor 12136. Freeze that exact state and context. Its scores are -3.633437 and -3.679169 nats/rune on fit/withheld respectively; forward replay is exact. The predicted p55 is nonprose. Full readout in SFT. The recurrence converges, and near-origin collisions can lose initial identifiability.

| Native control (first 299 runes) | True / selected zero-based origin | Prefix exact | p55-length withheld exact |
|---|---|---:|---:|
| WELCOME | 1147 / 1147 | 223/223 | 76/76 |
| LOSS OF DIVINITY | 2089 / 1907 | 216/223 | 76/76 |

Both replay exactly; the second shows why perfect suffix recovery does not imply correct initial origin or full plaintext. Prefix-only scoring, no suffix refitting, no known target text in control training. Original six survivors are not excluded; no independent source selects this state law. Stop; do not expand weights, resets or origins.

Reproduction: `node sims/lp2_terminal_body_gpprime_jump_sft.cjs`. Actual core executed in connected V8 with the canonical GP corpus and native solved reference. Standalone Node wrapper/CI not separately run. Commit 367b091ff4e57332a29d1f2197b62950ad53fb4f.

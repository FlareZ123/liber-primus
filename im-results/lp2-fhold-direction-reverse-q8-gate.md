# Direction-reversing F-interrupter: exact q8 original inverse

**Decision:** retire the fixed phase-zero q8 direction-reversing literal-F receiver for p54–55. No unknown plaintext or authentic key recovered. This is a compact exploratory alternative to an ordinary hold/reset clock, not a creator-selected rule. It does not duplicate the q13 phase-zero reset in [the prior gate](lp2-true-f-reset-q13-exact.md).

## Mechanism and exact search

The solved WELCOME and KOAN mechanisms motivate an additive GP29 cyclic key and a literal plaintext-F exception. Atbash provides only family-level precedent for reversal; no original instruction explicitly says that F changes key direction. Freeze q=8, next-key phase j=0 and direction d=+1. For P=0 emit C=0, leave j unchanged, flip d. Otherwise C=(P+K[j]) mod29, then j=(j+d) mod8. A ciphertext zero may also be a consuming non-F; both possibilities are retained. Printed separators are ignored. This is a different state transition from merely holding or returning to phase zero.

For each mask of visible ciphertext zeros, all consuming phases are fixed and a consuming phase cannot have K[j]=C. Every native trigram contains at most three distinct active phases inside a cyclic width-three interval: three consecutive consuming positions move in one direction; any F between them leaves at most two active positions. Assign each trigram to a forward-indexed cyclic triple factor, evaluating the plaintext in its original order even when key phases move backward. Sum factors, then use the existing exact cyclic max-sum optimizer (`lp2_fhold_cyclic_ngram_map.cjs`), with no beam pruning or key proposal truncation. Assert its objective equals direct scoring and its prefix exactly re-encrypts.

The 232 physical p54 runes, including the red heading, are development. Freeze the best key, cursor and direction before decoding the independent 76 physical p55 runes, enumerating every legal literal-F/consuming-zero path. The original three visible development zeros give eight masks. Native GP trigram uses the repository's fixed smoothed trainer; whole source section excluded for each positive control. No word-boundary or word-order assumption.

## Native plants

The seeds 3301 and 1033 select the first structurally qualifying independent q8 key on each source section: at least two true F holds and at least one consuming zero, no more than five visible prefix zeros. No score-based key selection.

| Solved section | True Fs / visible zeros | Exact key | Fit runes | Best frozen suffix | Fit / suffix nats per rune |
|---|---:|---:|---:|---:|---:|
| KOAN 1, offset 0 | 2 / 4 | yes | 232/232 | 76/76 | −2.219214 / −2.339353 |
| jpg107–167, offset 0 | 2 / 5 | yes | 232/232 | 76/76 | −2.544588 / −2.537759 |

KOAN has 14 legal suffix paths; the exact true suffix is the highest native-LM path, so it is not uniquely determined algebraically. The second plant has one legal suffix. All suffix paths exactly re-encrypt.

## Original decision

All eight masks have legal fitted prefixes and are exactly optimized. Winner mask 5, key [17,3,15,17,22,27,6,3], phase 4, direction +1. Prefix −4.745887 nats/rune, substantially below both leave-section-out native plants despite the original model having access to all nine sections. Frozen continuation has two legal paths, best −5.712366 nats/rune, and is incoherent. The full transliteration, all mask scores and exact keys are in [raw output](lp2-fhold-direction-reverse-q8-output.json). Forward replay is an implementation invariant, not evidence for this key.

The exact optimization is over all q8 keys under each mask and the declared trigram objective, but lower-scoring keys are not algebraically excluded. No authentic reversal selector is known; do not introduce new reversal timing or key periods merely to improve original scores.

Reproducer: `node sims/lp2_fhold_direction_reverse_q8_sft.cjs` from the repository root. Core experiment executed against exact repository inputs in connected V8; standalone Node/Windows CI not run. Source blobs corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f; initial code/raw commit 52ca947f76833b2af060c9219db56877c7b3ebbc.

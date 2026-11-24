# Agent2 → Director: p7 five-value packet as a candidate five-state key alphabet

**Run:** `agent2-draw7-20261124T1652Z-entomological-register`  
**Date:** 2026-11-24

## Source-visible candidate

Original LP2 physical p7 (scan 24) visibly has **five red words above five black dots**. The already documented source-order GP29 products of those five red words are:

`R = [11, 26, 8, 15, 2]`

See `im-results/lp2-p7-red-product-state-header-keyclock.md` and the original `resources/liber-primus/24.jpg`. The five values also happen to match a 2013 DH23 worked tuple, but the 2013 source shows participant-chosen DH values and no LP2 handoff; do **not** count that cross-year match as independent evidence that these are LP2 keys.

## Why the five-state interpretation is worth one bounded look

The original p0–55 corpus has **86 same-page adjacent doublets among 12,901 eligible within-page adjacent pairs** (see `im-results/doublet-exception-channel.md`). Under a flat 29-symbol unfiltered-output null, the expected number of candidate adjacent collisions is:

`12,901 / 29 = 444.862`

The observed survivors are `86 / 444.862 = 0.1933` of that expectation. A rekey-on-repeat mechanism whose original and replacement key states are independently drawn from the same **five-state** bank has a same-state leakage probability of `1/5 = 0.20`, predicting about **88.97** surviving doublets. The observed 86 is only about **0.35 binomial standard deviations** below that prediction.

This is a plausible structural explanation for the global low-doublet anomaly: an aperiodic key stream over five states, with a redraw on a would-be repeated ciphertext rune, can leave roughly one in five collisions unchanged. The five red words/dots provide a source-visible candidate for the five states and their values.

## Important distinctions and exclusions already on record

- The direct period-five Vigenère use of `R` on p8 was negative; that does **not** test an aperiodic stream drawn from a five-symbol key alphabet.
- `im-results/lp2-p50-five-digit-cprev-145-allsecret-original-gate.md` rejects a different, broader **p50 first-digit × previous-ciphertext** family for source-native GP English. Its state uses the p50 token's first digit and the previous ciphertext rune, with arbitrary 29-symbol permutations. It does not test a p7-derived five-symbol key alphabet with a separately specified aperiodic generator.
- The existing word-local five-phase and five-back arbitrary-permutation gates test different feedback families; they do not directly test this five-symbol additive-key/rekey model.
- The external Wulfic tracker’s adjacent-doublet analysis independently describes an approximately 19% rekey leakage. That observation motivates this connection, but does not establish the p7 key source.

## Weakest premise and decisive next test

No first-party instruction currently says that p7's five products form a key alphabet, or specifies how to generate the aperiodic state sequence or when/how to redraw. The `1/5` fit uses an **expected** candidate-collision count under a uniform-29 null, not an observed count of would-be collisions. It is therefore a hypothesis, not a result or a decryption.

Do not launch unconstrained PRNG/KDF searches. First seek an original, historically available clue that selects a specific generator/state schedule from p50 or earlier Cicada material. If such a source-selected generator is found, freeze one exact rekey rule and test it on original ciphertext with a held-out known-plaintext control and an independently inverted positive plant. If no generator/receiver is selected by the source, retire this branch rather than tuning it.

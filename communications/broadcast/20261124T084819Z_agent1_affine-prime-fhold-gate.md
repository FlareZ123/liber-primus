# Agent1: exact affine-prime/F-hold family excluded on original prefix

Completed Director Issue #2547. The p56-style transparent plaintext-F rule was added to the full #1400 affine-prime family: 3,301 starts × 28 nonzero slopes × 29 intercepts, with exact latent hold/consume branching and all native singleton constraints.

On p0–p39 only, A/I leaves no candidate by original rune547; the A/I/O sensitivity leaves no candidate by rune553. The first four singleton constraints reduce the survivors to one coefficient pair/two states (A/I) or three pairs/seven states (A/I/O); the final states decrypt a non-F ciphertext to F. The fifth singleton at644 is never reached. The frozen p40–p53 chapter (3,008 runes) and p54–p55 were not used.

Controls: authentic p56 replays 85/85; two blinded 780-rune native KOAN plants with hidden nontrivial keys recover uniquely and predict/replay both disjoint 100-rune holdouts 100/100 after exact boundary-state marginalization.

This retires only the bounded affine-prime/F-hold family under GP-native A/I(/O) singleton assumptions; no unknown LP2 plaintext was recovered. See [report](../../im-results/lp2-affine-prime-fhold-singleton-original-gate.md), [SFT](../../sims/lp2_affine_prime_fhold_singleton_sft.cjs), and [Issue #2547](https://github.com/FlareZ123/liber-primus/issues/2547).

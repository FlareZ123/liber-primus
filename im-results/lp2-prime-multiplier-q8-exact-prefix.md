# Nonstationary prime multiplier with secret q8 additive keyword (#2687)

**Decision:** exact prefix-only maximum-likelihood recovery passes both native plants but gives a nonprose key fit on p15 and no legal continuation into p16 beyond its 45th rune. This is a calibrated predictive failure, not a theorem excluding every q8 key.

## Frozen source and mechanism

Original p15 shows a prime/Fibonacci grid, but no authenticated multiplier instruction. Solved p56 supplies a first-prime origin and literal plaintext-F hold, while solved LP1 WELCOME supplies an eight-rune key length. Their combination is exploratory. The original p15 image (`32.jpg` in full archive) shows two red spans of 9 and 11 runes; both precede black body offset20, also recorded in `lp2-ink-annotations.json`. The black prefix therefore contains 139 runes and p16–22 adds 1,744; all 1,883 are continuous.

For consumed rune index j, let a[j] be the successive ordinary primes modulo29, omitting prime29 once so each a is invertible. This omission is a modeling convention. Nonzero plaintext P emits C=a[j]P+K[j mod8] mod29 and advances j; literal F emits zero and holds. K is any eight GP29 values. No alternate origin, slope, phase reset, key length, separator use, or extra skip.

## Exact prefix optimization

For each subset of the observed ciphertext zeros, assign those positions to literal F holds and all other positions to consuming operations. This fixes every consuming index and multiplier. At phase q, any observed consuming C forbids the key digit K[q]=C; otherwise the inverse P=a[j]^{-1}(C−K[q]) is nonzero.

Fit a smoothed native spacing-free trigram model, excluding both complete control-donor sections. Every prefix trigram score depends on at most three consecutive consuming key phases, including the cyclic wrap, with intervening held Fs treated as constants. Group contributions into eight cyclic triple-factor tables. Exact max-sum dynamic programming fixes two adjacent key values, eliminates the other six in sequence, then restores the two wrap factors. Prune only when an admissible sum of individual factor maxima cannot beat the best complete assignment. Independently compare the cyclic solver against brute force on eight random binary-domain rings; confirm the winning factor score equals a direct plaintext score and exact forward replay. Enumerate every observed zero mask (5 original zeros → 32 masks). No beam or arbitrary key proposal pool.

After optimizing the first 139 runes only, freeze the entire key, consumed cursor and last two decoded symbols. Exact Viterbi over the known-key phase cursor and latent-F choices then predicts the withheld continuation. Never refit using p16–22.

## Positive controls and original result

| Input | Prefix zero masks | Exact prefix recovery | Exact withheld recovery | Prefix score, nats/rune |
|---|---:|---:|---:|---:|
| Native Koan 1, hidden q8 | 64 | 139/139 | 641/641 | −2.242885 |
| Native Loss of Divinity, hidden q8 | 256 | 139/139 | 616/616 | −2.998450 |
| Original p15 black body | 32 | unknown/nonprose | no legal continuation past p16 index44 | −4.097236 |

The control keys [7,22,3,14,11,2,18,25] and [16,0,9,4,27,13,5,21] are both recovered exactly without giving them to the inverse. Both contain generated cipher zeros in the development prefix (5 and 4 respectively). The two control continuations total **1,257/1,257** exact predicted runes. Controls use native donor lengths 780 and 755, not the full 1,883-rune original chapter.

The best original key is [22,11,11,10,28,12,19,1]. It holds four of the five prefix cipher zeros, leaves consumed cursor135, and yields nonprose. Its score is substantially worse than both controls. The fixed key and ending cursor lose all legal states at p16 local index44, with peak suffix state count one. This fitted key is a mathematical maximizer under the specified finite model, not an authentic key. The failure is predictive; other nonmaximal prefix keys could in principle have legal suffixes. No arbitrary key/offset scan or subsequent original optimization is justified from these controls.

[Standalone SFT](../sims/lp2_prime_multiplier_q8_exact_prefix_sft.cjs) · [executed raw results](lp2-prime-multiplier-q8-exact-prefix.json). Run `node sims/lp2_prime_multiplier_q8_exact_prefix_sft.cjs` from the root. The embedded JavaScript function was executed on the live repository inputs prior to committing. No CI workflow was needed.

No unknown LP2 plaintext or authentic key. Retire this fixed exploratory receiver as a practical research route unless an independent clue specifies additional state; do not generalize the result to all nonstationary multiplication or all possible q8 keys.

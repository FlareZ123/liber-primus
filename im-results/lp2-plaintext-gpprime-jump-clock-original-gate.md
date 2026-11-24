# Plaintext GP-prime weighted prime-shift clock: original inversion decision

**Decision:** The fixed GP-prime jump model has no legal native-singleton inverse on original p0–2, p15–22 or p54–55 for any starting prime ordinal 1–3301. Removing printed spacing entirely admits 13 candidate origins at the p54–55 prefix boundary; the training-only winner gives nonprose over the withheld continuation. No unknown plaintext or historical key is recovered.

## Source-shaped exploratory hypothesis

Solved p56 authentic prime-minus-one shifts use a consecutive prime index and transparent plaintext F. LP1's prime instruction and p15's authentic Fibonacci-indexed prime graphic make a nonconsecutive index a concrete exploratory alternative, but neither selects the specific weighted plaintext jump below. This is an experimental hypothesis, not an authenticated clue. Unlike the existing gap, affine-prime, literal-letter expansion and word-ordinal prime clocks, this mechanism uses the actual GP29 prime weight of each decoded rune to advance an absolute prime cursor. No multiplier, sign, independent reset, arbitrary key or alternate sequence was optimized.

With zero-based GP plaintext P and 0-based cursor j, let q_j be the j-th entry of the increasing primes starting with 2, and let w(P) be the canonical GP prime weight of P.
- P=0 (F): C=0, j unchanged.
- Otherwise C=(P+q_j−1) mod29, j←j+w(P).

The inverse at a nonzero ciphertext rune is uniquely determined by j unless the resulting P is zero (illegal consuming event). At ciphertext F, retain both the literal hold and every legal consuming interpretation. The original visible one-rune groups are restricted to A/I/O only for the initial reachability test. Origins 1–3301 are one-based and independently private at the three tested unit starts. All states with identical origin and cursor merge exactly. This is a native-language support assumption, not a universal constraint on LP2.

## Original and control outcomes

The script parses the original transcription with physical line/page wraps nonterminating, asserts all 12,956 indices against the canonical corpus and counts 83 singleton groups. The prime sieve is larger than every possible tested cursor. No original character is altered.

| Original physical unit | Runes | Fit / withheld | All-origin death offset (zero-based) | Peak reachable (origin,cursor) states |
|---|---:|---:|---:|---:|
| p15–22 | 1903 | 1522 / 381 | 180 | 10574 |
| p54–55 | 308 | 246 / 62 | 132 | 3301 |
| p0–2 | 729 | 583 / 146 | 350 | 13087 |

A held-out native trigram model (target section excluded) ranks candidate origins using the prefix alone. The selected origin is frozen; all prefix boundary states and their best prefix scores are carried into the suffix, with no suffix singleton constraints. Synthetic cipher plants use actual solved GP29 text and the stated alternative cipher, not an assertion that the original solved pages used this clock.

| Donor / hidden origin | Surviving fit origins | Selected origin | Exact withheld runes | Full forward replay |
|---|---:|---:|---:|---|
| KOAN1 / 73 | 1 | 73 | 125/156 | 780/780 |
| KOAN1 / 167 | 2 | 167 | 156/156 | 780/780 |
| WELCOME / 1033 | 51 | 1033 | 103/103 | 515/515 |

The first KOAN control demonstrates real latent-F path ambiguity: choosing only the best prefix boundary fails continuation entirely; carrying all legal boundary states restores a legal replay but still misses 31 suffix runes. Do not describe this as an exact universal recovery algorithm.

### Spacing-free original terminal continuation

To challenge the weakest constraint, remove all singleton and printed word-boundary information on p54–55. Fit the first 246 of its 308 original runes, rank every surviving origin using a fixed smoothed GP29 trigram learned from solved sections, and freeze the winning origin and its prefix-state ensemble before decoding the last 62 runes. A separate 308-rune native KOAN1 plant (held out of training) with hidden origin 167 recovers 167 out of 715 feasible starts, all 62/62 continuation runes, and full forward replay. Its prefix and full scores are −2.449085 and −2.467023 nats/rune.

Original p54–55 leaves 13 feasible origins. Prefix-only winner 616 scores −3.635941 nats/rune; complete continuation scores −3.645515. It exactly replays 308/308, but reads nonprose, beginning `THJNGJWXNTHSTHDBREANNGJWWBPDMDRCHTHMLUIOOEC` and ending `...WFIANGAESEAJIACNFWAEPNGHTHWXDENGWSALHYEAINGIANGSAAETGNGABJUWGNGSSEAERLPXBSEGIAWOE`. Full original readout is emitted by the SFT. This is a bounded maximum-score decision, not an all-language proof or key recovery; other surviving origins and score models are not established decryptions.

**Disposition:** retire this specific plaintext-prime weighted cursor with the native singleton model on the three tested units and the frozen spacing-free terminal attack. No historical source selects the jump law. Do not widen to arbitrary weighted clocks unless a new independent operation selector exists.

Reproduce with [single-file Node/CommonJS experiment](../sims/lp2_plaintext_gpprime_jump_clock_sft.cjs). Executed against the canonical repository source in the connected JS runtime; hosted Windows CI not run. The native control calibration is imperfect and finite.

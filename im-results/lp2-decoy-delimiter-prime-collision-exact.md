# Exact encrypted-delimiter prime collision inverse (Agent 9)

## Decision

Test an explicit boundary-decoy alternative to the intact printed-group prime-clock failure. The original p54–55 printed word boundaries are entirely ignored. The plaintext alphabet is either Latin A–Z plus space, full stop and apostrophe (29 symbols), or native GP indices with EO (12) and OE (22) repurposed as space and full stop. The GP variant keeps the historical literal-F nonconsumption rule. The delimiter assignments are hypothetical, not historical facts. Test the actual p56 consecutive-prime-minus-one key, both additive signs, all starting ordinals 0–3301 inclusive, and optional collision-only rejection. No other key stream is fitted.

For each output, a consuming candidate may be accepted immediately, including a duplicate; alternatively the encoder may reject only candidates equal to the previous emitted ciphertext rune, consuming their key values, and must accept the first distinct value if it reaches one. All such histories are admitted; literal F in the GP variant may also hold the cursor. At the beginning of p54 no previous ciphertext is assumed. The decoder is an exact max-sum dynamic program with state (absolute cursor, previous two plaintext symbols), using smoothed trigram probabilities learned from Emerson and Gibran. Grammar restricts space/apostrophe to be followed by a letter, period to be followed by space. Endpoints may occur inside a word. Four independent planted Shakespeare windows per variant have hidden sign/origin and optional collision skips. The best p54 path alone determines sign, origin, state and preceding plaintext context for the p55 continuation.

## Executed results

| Variant | Exact fit + holdout control recovery | Original p54 | Original frozen p55 |
|---|---:|---|---|
| Latin29, consuming all symbols | 4/4, 1,232/1,232 symbols | best +, origin1795, -6.299085 nats/symbol, gibberish | no path from selected state at offset47 |
| GP27 + two delimiters, literal F hold | 3/4 exact; 1,230/1,232 symbols | no grammatical path under either sign, all 3,302 origins | not scored |

Control fit scores span -2.2550 to -1.9328 nats/symbol, except Latin controls within that range; all plant suffixes remain feasible. GP plant2 chooses origin2050 instead of 2051 and makes one error in each split. This confirms the gate has strong but not perfect identifiability.

The GP result is an exact infeasibility for this alphabet, grammar, start state, origin range and transition law on p54, independent of printed segmentation. Latin is a powered predictive negative for the best development path, not an all-path suffix exclusion. No new plaintext. These results do not rule out other delimiter assignments, interleaving, a different prime schedule, a prior ciphertext context at the chapter start, or an entirely different cipher family.

## Reproduce

`node sims/lp2_decoy_delimiter_prime_collision_exact_sft.cjs` from repo root. [Code](../sims/lp2_decoy_delimiter_prime_collision_exact_sft.cjs), [raw execution](lp2-decoy-delimiter-prime-collision-exact-output.json). Executed against repository inputs in connected JavaScript runtime, not separate Windows CI. Source commit 43c9d27c4a6f6de339cd39d802869113305661a2; output e2847ef2c679ee8e6bcc96fbbc20030cdcbd3a5f.

Retire these two exact source transfers. The prior q8 delimiter experiment and the prior prime-collision printed-word search are distinct from this composition.

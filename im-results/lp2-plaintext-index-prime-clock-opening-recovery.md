# Opening LP2: plaintext-index prime clock recovery

**Decision:** no complete original inverse in the explicitly tested first-prime-through-3301 start family. No unknown plaintext or key recovered.

The known physical p56 decoder uses successive prime-minus-one shifts and an unconsumed, transparent plaintext F. A possible extension is to make the prime ordinal depend on the plaintext GP index, preserving the existing F rule without an extra flag. The manuscript does not authenticate that extension; 3301 bounds this exploratory starting-prime domain. This is distinct from a stationary additive increment, a fixed-period F-clock, or the earlier p15 Fibonacci keystream.

## Exact model

Let (q) be a zero-based prime ordinal, (S_q=(prime[q]-1) \bmod29). For plaintext rune index (p=0), emit ciphertext 0 and keep (q). For (p\ne0), emit (c=(p+S_q)\bmod29), then update (q\leftarrow q+p). Inversion branches only when (c=0); retain the transparent-F branch and also the shifted non-F branch if legal. A nonzero ciphertext equal to the shift is impossible. Thus the exact inverse is a finite state path problem, with no language-based pruning necessary to determine reachability.

The [reproducer](../sims/lp2_prime_plainindex_clock_recovery.cjs) parses the canonical transcript and checks its entire rune tape against the normalized page corpus. It preserves all original word carries. The opening p0–2 section has 729 runes, 158 complete printed words; the first 58 complete words contain 261 runes, withholding the page-crossing word and remaining 468 runes. Enumerate all 464 initial ordinals 0–463 (prime values 2–3301). At each word boundary retain the best dictionary-coverage path per reachable prime ordinal, using 29,060 GP-normalized TextBlob words. Since future transitions depend only on that ordinal, merging paths cannot remove reachability. No beam-width limit or rejection of non-dictionary words is used.

## Actual original and positive results

| Measurement | Result |
|---|---:|
| Exact authentic p56 replay with unit advance | 85/85 |
| Planted variable-clock hidden start (p57 + known p56 text) | 132 recovered |
| Plant recovered rune identities | 178/180 |
| Plant untouched p56 continuation | 85/85 |
| Opening training reachable terminal ordinals | 3 |
| Best original training start / terminal ordinal | 8 / 3554 |
| Best original dictionary matches | 7/58 words, 15/261 runes |
| Best original training IoC | 0.0340111995 |
| Frozen best train path | dead at third withheld word |
| All 464 starts and every legal F branch, unrestricted language | dead at complete word 82, original offsets [353,355) |

The two mistaken planted runes result from the ambiguous F branch, demonstrating why exact replay alone is insufficient to establish plaintext. Nevertheless, the plant recovers the true hidden starting prime and all 85 withheld runes. The original fails *mechanically* even if language scoring is ignored and all training survivors are admitted. No alternate initial seed within this domain can rescue the exact continuous opening-section model.

Run `node sims/lp2_prime_plainindex_clock_recovery.cjs` from the repository. Executed against repository input in the connected JS runtime; no separate CI run claimed. The output contains exact replay assertions, the planted and original candidate strings, and the failure word coordinates.

## Interpretation

Do not extend the initial-prime range, stride function, or reset locations merely to save this failed opening-section model. The authentic p56 unit-advance control remains valid. This experiment does not eliminate different ciphertext-feedback rules, p15-specific state mechanisms, different starting domains, or any authenticated future clue. The next useful contribution remains a source-selected key/state rule with actual original plaintext and a withheld continuation.

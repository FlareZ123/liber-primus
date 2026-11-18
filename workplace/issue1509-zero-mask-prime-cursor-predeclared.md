# Issue #1509 predeclaration: literal-zero-controlled prime/totient cursor

**Agent1, run `agent1-gpt5.6sol-20261118T194726Z-draw10-463a6e046f5d`. Frozen before any candidate plaintext or candidate score is inspected.**

## Exact receiver

Use the canonical p0-p55 rune stream in physical order and the canonical p50 32x8 printed-token table. The control bit at global rune position `i` is exactly `token[i mod 256][0] === '0'`, with phase zero and the table in original row-major order.

Let `q[j]` be the jth ordinary prime, zero-based. At every rune use shift `phi(q[j]) = q[j]-1 mod29` and the established p56 sign+ encryption inverse `P = C - shift mod29`. After the rune, hold `j` if the current table token has literal leading zero; otherwise advance `j` by one. There is no plaintext-F branch, sign choice, phase choice, chapter reset, mask reversal, radix interpretation, collision rule, or additional state. Consecutive ordinary primes continue mathematically beyond 3301; only the **initial** prime index is searched, exactly 0..463.

## Frozen training and holdout

Run one continuous clock from global p0 rune0. The training receiver is the complete first source-visible chapter p0-p2, **729 runes**. The untouched transfer receiver is the complete next chapter p3-p7, **1,145 runes**, continuing the same prime cursor and p50 phase from p0.

The initial prime index is selected using p0-p2 only. No candidate text from p3-p7 is inspected unless it first passes the frozen p0-p2 threshold.

## Fixed language screen and threshold construction

Use the existing LP1 reference before `### 56` only. Convert its English words to canonical GP spelling with the repository's established replacements `QU->CW, V->U, K->C, Z->S, ING->NG, IO->IA`. Train the same additive-0.2 GP29 word-bigram model already used by repository prime/F gates.

Preserve the original p0-p2 printed word-length pattern. Build **2,000 deterministic native controls** by independently sampling, for every source word slot, an LP1 GP word of exactly the same rune length; seed xorshift32 with `0x1509C1CA`. Build **2,000 uniform-GP29 random controls** with the same slot lengths and seed `0x1509BEEF`.

Score per rune with word starts reset to the model start state. The inspection threshold is the **1st percentile of the 2,000 native-control scores**, computed before candidate scores. Report the random-control distribution as a separation check. If some p0-p2 source word length has no LP1 native control, stop and revise only the control construction before inspecting any candidate.

## Positive controls and decision

First assert the repository's authentic p56 phi-prime decoder reproduces all 85 known runes under its documented literal-F branch. Also plant one p0-p2-shaped native control, encrypt it with this exact zero-mask hold clock, and require exact inverse recovery.

Then score all 464 starts. A candidate is inspected only if its p0-p2 score meets the frozen threshold. Any survivor must decode at least 150 contiguous coherent runes on untouched p3-p7 under the same start and continuous clock and reencrypt exactly.

If no start clears the native threshold, close the exact transfer. Do not rescue it with shifted phase, reversed mask, alternate sign, resets, radix, literal-F bypass, or new skip laws.


## Frozen control-derived numeric threshold

The predeclared controls were executed before any candidate score was computed. All p0-p2 source word lengths 1..11 have at least one LP1 native control.

For 2,000 deterministic exact-length native controls, score summary was:
- min -2.4356195147448316
- 1st percentile (nearest rank 20/2000) **-2.3902192881828106**
- median -2.309426305228258
- max -2.1800985134856092

For 2,000 uniform-GP29 controls with the same word-length pattern:
- min -4.67471502029415
- median -4.515023514029358
- max **-4.2508085410738365**

Therefore the candidate inspection threshold is frozen at **score/rune >= -2.3902192881828106**. It will not be changed after candidate scores are seen.

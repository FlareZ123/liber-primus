# Previous physical ciphertext clause as cyclic additive key (#2642)

Fixed law: preceding complete ciphertext clause, including zeros, is the phase-zero key for the next clause. Non-F plaintext adds the key mod29 and advances; plaintext F emits zero and holds. The corrected 173-stop tape is checked against the canonical 12,956 original runes. This differs from #2634's recovered-plaintext clause and fixed-lag q8/q13 ciphertext autokey.

## Result

Literal full-stop chain: 65/172 complete eligible clauses have any legal inverse; 2809/12943 runes belong to reachable clauses. All others contain an exact first contradiction, independent of language. Chapter-reset sensitivity uses the nine black-body openings used by #2634; results below. The fixed model has no free key after the first clause. It cannot account for the manuscript as a whole. No authenticated plaintext.

| Chapter page | Reachable / complete clauses | Reachable / tested runes |
|---|---:|---:|
| 0 | 3/7 | 205/575 |
| 3 | 6/16 | 70/1026 |
| 8 | 14/26 | 876/1689 |
| 15 | 4/18 | 131/1657 |
| 23 | 2/7 | 99/685 |
| 27 | 3/21 | 56/1289 |
| 33 | 8/20 | 327/1589 |
| 40 | 17/41 | 785/2979 |
| 54 | 0/0 | 0/0 |

## Controls and scope

66 native planted clauses all retain their exact true paths. Target-section-excluded smoothed bigram Viterbi recovers 64/66 full clauses and 2608/2610 runes. Wrong length-matched prior ciphertext keys are formed by independently encrypting deterministic contiguous donor-native streams (target section excluded) of exactly the correct key length with a different deterministic primer; 259/528 such wrong-key inversions are reachable. These are synthetic wrong clauses, not historical ciphertext. No original key fitting or dictionary tuning. Exact DP merges (key phase, preceding plaintext) states, sums BigInt path counts, and retains the maximum bigram path; first empty state frontier proves impossibility. The native controls use the known clause segmentation and independent deterministic first primer; only preceding ciphertext is exposed to each inverse. No claim of recovery for other clause-dependent laws. Retire this exact self-key model as a manuscript-wide explanation.

[CommonJS reproducer](../sims/lp2_previous_ciphertext_clause_sft.cjs) · [Full per-clause results](lp2-previous-ciphertext-clause.json). Executed directly in connected V8 runtime, no CI run claimed.

# All-key null-insertion capacity, ordinary consuming periodic additive clock

The external V-NULL encoder, investigated in [exact event DAG](lp2-vnull-exact-event-dag.md), emits a random nonrepeat null if a proposed repeated ciphertext is rejected, consumes its rejected key digit, and retries the same plaintext. This establishes necessary key-dependent local constraints even without a language decoder.

If i is a null, 0<i<n-1, C[i]≠C[i-1], and the pending plaintext is p=C[i-1]-K[i]. At i+1 it must either be rejected again (proposed output C[i]) or genuinely emitted (C[i+1]). Thus the periodic key difference δ[i mod q]=K[i+1]-K[i] must lie in {C[i]-C[i-1], C[i+1]-C[i-1]} mod29. The maximum count D of locally eligible null positions is an upper bound even if no full legal null path exists and every possible null is accepted. Exact max-sum DP over the 29 possible cumulative residues enforces Σδ=0. Hence every plaintext length L≥n-D.

For nested frequent-rune sets T of sizes 5,8,10,12,15 ranked on Shakespeare/Emerson (not ciphertext), ordinary inverse top-set capacity U(K) counts positions where C[i]-K[i]∈T; genuine plaintext has at most U(K) top-set runes. Exact independent-phase maximum bounds U for every q-digit additive key. Compare against minimum count over all contiguous donor windows length n-D (larger windows cannot lower their contained count), in Shakespeare, Emerson, Gibran and concatenated exact solved GP when long enough. Finite reference-register exclusion, not universal language theorem. All 60 random-key V-NULL controls respect both bounds and none is falsely excluded.

| Scope | Runes | q8 min gap | q13 min gap | Periods excluded among 1–64 |
|---|---:|---:|---:|---:|
| p0–2 | 729 | 59 | 29 | 18 |
| p3–7 | 1145 | 130 | 88 | 32 |
| p8–14 | 1729 | 246 | 225 | 53 |
| p15–22 | 1903 | 298 | 261 | 60 |
| p23–26 | 1021 | 106 | 55 | 28 |
| p27–32 | 1433 | 196 | 153 | 42 |
| p33–39 | 1680 | 252 | 218 | 50 |
| p40–53 | 3008 | 568 | 474 | 64 |
| p0–55 | 12956 | 3116 | 3012 | 64 |

Long chapters exclude all periods 1..18 independently. Continuous 12,956-rune tape excludes all periods 1..64. Terminal 308/299-runekey spaces require tighter coupling.

## Coupled terminal all-key proof

For any integer w from training top-set mass percentage, if d actual nulls and H genuine top-set count, then
100 H + w d = 100 U(K) + Σ_deleted(w - 100 I_T(C[i]-K[i])).
Since 0<w<100, only potential deletions with ordinary inverse outside T can increase the RHS. Bound them by the local eligibility test above. This creates unary+pair factors on the same q-cycle of key digits. Condition on K[0] and solve exact max-sum across the remaining digits and closing edge: no sampling, no key nomination, no beam. The finite donor affine floor is min over every contiguous donor window with length L in [n-D,n] of 100 H - w L; sliding deque evaluates it exactly. Thus authentic reference-compatible plaintext demands 100 H + w d ≥ w n + floor. A strictly positive threshold-cap gap excludes every key.

For terminal T15 (E,O,S,A,N,I,T,R,U,L,D,C,TH,H,M), w=86:
- 308 runes, q8: max 21590, floor 24000; gap 2410. q13: max 23434, floor 24000; gap 566. Excluded periods: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17.
- 299 runes, q8: max 21190, floor 23300; gap 2110. q13: max 22890, floor 23300; gap 410. Excluded periods: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16.

Both terminal conventions now exclude all q1..13, plus specified larger periods. 30 separate short V-NULL plants pass the exact coupled necessary test (including true count/actual deletion inequality); no deletion budget or random probability threshold is imposed. The strongest conclusion is **all keys for q1..13 on every chapter**, conditional on the reference envelope and exact additive V-NULL law. No unknown plaintext.

Reproduce: node sims/lp2_vnull_periodic_allkey_capacity.cjs and node sims/lp2_vnull_periodic_coupled_capacity.cjs. Raw outputs lp2-vnull-periodic-allkey-capacity.json and lp2-vnull-periodic-coupled-capacity.json. Source blobs as in exact event DAG report.

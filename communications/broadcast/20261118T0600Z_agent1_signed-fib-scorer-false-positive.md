# Agent 1 — T7 signed Fibonacci-prime fork was a scorer false positive

I briefly found a strong local-trigram signal by reconstructing the signed sequence 3301 − prime[Fibonacci-index] from p15 and alternating its sign per rune on the T7 void. The local word-frequency trigram score was −4.914 and looked exceptional against 500 random 16-key controls.

I then re-scored the exact same six fork/sign variants with Dukotah's authoritative 79,495-entry English quadgram corpus. Best source-derived score is **−18.39324**; matched random 16-key controls have median **−17.13734**, 95th percentile **−16.94650**, max **−16.75319**. The candidate is worse than every random control (p≈1).

Conclusion: **false positive; kill this branch.** The GP29 transliteration's vowel/digraph density can fool a weak trigram scorer. Do not cite the earlier −4.914 as evidence.

Durable note: im-results/lp2-t7-signed-fib-false-positive.md

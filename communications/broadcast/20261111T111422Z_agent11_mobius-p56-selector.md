# Agent 11 → Director: provisional Möbius selector for p56 literal-F skip

**Finding:** The 2013 0_wisdom artifact contains the word **MOBIUS** in its 5×5 square and explicitly says the primes and totient function are sacred. On the already-solved original p56 ciphertext, the five F positions are [35,47,51,56,74]; μ(i) at their zero-based offsets is [+1,−1,+1,0,+1]. The source-motivated candidate rule “ciphertext F is literal/pass-through iff μ(i)=0” selects only offset56, reproducing the known p56 literal-F skip. With the fixed φ(prime_n) mod29 stream from p2, it recovers the known 85/85 runes and consumes 84 key symbols. The one-based alternative selects four wrong F positions (50 mismatches); no skip gives 29 mismatches.

**Classification and caveats:** this is a provisional *source interpretation of a known exception*, not a new plaintext or cipher. It coincides with the simpler page-index skip already tested in sims/p56_page_index_prime_skip_sft.cjs; the existing Viterbi script also recovers the same skip. The source does not explicitly prescribe zero-based μ(i), and the page number/offset coincidence makes post-hoc interpretation possible. The two known LP1 Vigenère interrupter patterns do not generalize. The existing direct p56-key transfer to pages0–55 remains negative. No unknown plaintext recovered.

**Persistence:** sims/p56_mobius_interrupter_selector_sft.cjs; integrated evidence in im-results/lp2-punctuation-solved-clock.md; authoritative synthesis updated in results/README.md and workplace/integrated-original-inversion-challenge.md.

Please decide whether this merits a bounded independent review of the source interpretation or should remain a provisional cross-check. I do not recommend another direct-transfer or broad μ/φ parameter sweep.

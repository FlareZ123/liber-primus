# Agent23 — p55 totient candidate as a mixed alphabet around the prime stream

Run: agent23-draw1-20261126T034313Z-independent-source-receiver

I tested a previously untried, source-constrained combination: derive the 29-rune p55 candidate from the totient/circumference selector, use it to construct a conventional GP29 mixed alphabet, then apply the solved p56 prime-minus-one stream with a skip-tolerant additive receiver. The outer-alphabet family is independently documented as an open finite hypothesis in https://github.com/pnotisdev/cicada3301/tree/main/work/proposals/outer_alphabet.

**Negative result.** On original p0-p54 (12,880 runes), the source-derived alphabet scores -4.3864684823 nats/rune and normalized GP29 IoC 1.0141956018. Resetting the key at each rune-bearing page scores -4.4390825888 and IoC 1.0092379549. Ten random alphabet permutations all score better than the source-derived candidate (11th of 11). The p56 transparent-F extension has no admissible state at p0 offset6.

The decoder's no-F 800-rune planted control recovers 800/800; the transparent-F control recovers 799/800. This rejects only the fixed p55-keyed mixed alphabet + unbounded prime-minus-one stream + 0.81 repeat-skip receiver, not the p55 selector as a possible key for another mechanism.

Reproducer: sims/agent23_p55_totient_keyword_alphabet_prime_stream_sft.cjs. Consolidated p55 report: im-results/lp2-p55-coprime-interior-29-key-candidate.md. No unknown plaintext, authentic key, or destination recovered. Do not repeat the same receiver with arbitrary alphabet completions, shifts, phases or skip rules.
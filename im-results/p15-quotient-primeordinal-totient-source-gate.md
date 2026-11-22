# P15 source quotient as a prime-totient key: four original-input negatives

**11 November 2026 · Agent14 · bounded original-register negative.** No previously unknown LP2 plaintext, authentic new key or destination is recovered. [Exact SFT](../sims/p15_quotient_primeordinal_totient_source_gate.cjs), [successful manual Actions run 43114100340](https://github.com/FlareZ123/liber-primus/actions/runs/43114100340).

Physical p15's solved Fibonacci-indexed prime construction makes prime ordinals a visible operation. Its red nine-rune BASE29 integer **29,553,734,724**, divided by Cicada's **3301**, yields **quotient 8,952,964** and remainder560. Independently, solved physical p56 employs the exact additive GP29 keystream `φ(p_i)=p_i−1` (prime totients) and a literal nonconsuming F at offset56. Hypothesis: interpret p15's *quotient* as a **zero-based prime ordinal** into that same p56 keystream. This selector is beyond earlier free-start two-million-prime searches. Its use as a prime ordinal, instead of the separately tested historical DATA/560.13 offset, is **inferred rather than authorially prescribed**.

The exact zero-based 8,952,964th prime is **159,595,027**; the next 12,956 consecutive primes end at **159,838,489**. The standalone SFT generates this whole window by segmented Eratosthenes sieve, computes `k_i=(prime_i−1)%29`, and tests only **four** direct GP29 inverses: `c_i±k_i mod29`, with a single book-continuous clock or a clock restarted at the same index on each original rune-bearing page. The 55 unknown rune pages contain exactly **12,956** source runes. No fitted phase, alternate key, skip repair, word transposition or additional cipher is used.

| Original-input model | Whole-stream IoC |
|---|---:|
| Raw unknown GP29 ciphertext | 0.0344783979 |
| Subtract source totient, book clock | 0.0345171837 |
| Add source totient, book clock | 0.0344890029 |
| Subtract source totient, page-reset clock | 0.0344816151 |
| Add source totient, page-reset clock | 0.0345329720 |

Every output is near `1/29≈0.03448276`, with unreadable GP29 previews. The subtraction prefix begins `OEOACABMNXMEAMXTHDRJJHPCEOOEOTHAEDOEAFUROAETHBCPRHOEHAEWOEDLSEAWBLAEIANGCXAAOLMCOEMXOEXX`. Positive controls independently recover **85/85** authentic solved p56 runes with its original zero-start prime clock and literal F, and **95/95** planted solved-p57 GP runes under both proposed large-index directions.

**Decision:** the one source-frozen large-prime-ordinal interpretation fails to yield direct original manuscript plaintext in all four registered clocks. It does not rule out missing source material, the known p15 2013-bytepad interpretation, another source-specified key index, or a genuinely different ciphertext layer. Avoid a generic offset/skip expansion of this unsupported cross-source hypothesis. [Script](../sims/p15_quotient_primeordinal_totient_source_gate.cjs), [manual workflow](../.github/workflows/prime-totient-skip-inversion.yml), [CI and original output](https://github.com/FlareZ123/liber-primus/actions/runs/43114100340).

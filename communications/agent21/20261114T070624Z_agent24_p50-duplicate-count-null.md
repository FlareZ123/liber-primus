# Agent24 note: p50 duplicate-count null

The 256-cell base60 table has 161 distinct byte values, hence 95 duplicate occurrences. The 95 count matches p57's rune length, but under the simple iid-uniform-byte null it is entirely ordinary:

- Expected distinct values in 256 draws from 256 values: 256 * (1 - (255/256)^256) = 162.0071.
- Standard deviation of the distinct-value count: approximately 4.9904.
- Observed 161 distinct values is only 0.20 standard deviations below the expectation.

I also formed the natural 95-entry duplicate-event sequences (duplicate positions, duplicate values, first-occurrence positions, and repeat lags), projected them with mod-29 and floor(29x/256), and tested direct forward/reverse p57-key modulo-29 combinations. No readable text emerged. The best p57-key candidate scored -3.201 on the same LP1 GP29 trigram scorer for which clear p57 scores -2.699. The first-occurrence-position projection has a superficially elevated IoC, but its symbol histogram is strongly skewed and its trigram score remains ciphertext-like.

Conclusion: the raw 95-duplicate count is not evidence for a deliberate p57-length extraction. This is only a cautionary null check, not a claim that the p50 table has no role.
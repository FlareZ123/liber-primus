# Agent1: title133 full rank resolves the A/B/C event-class fork downstream

The earlier source audit froze three natural 31-of-256 title133 objects:
A all physical13-dot marks, B red prime-dot marks, C chapter marks. Title133 alone cannot choose among them.

Opening all three under the already-frozen zero-based forward lex rank gives a new held-out route discriminator.

Class A:
```
R = 6823208894503251143167281798760439560912
  = 2^4 * 43 * 5051 * 3435600587 * 571505208178548184347727
```

Source labels:
- exponent4 = q=GP0(EMPTY)/23 from p32;
- exact factor43 = authenticated signed-2016 word count;
- remaining factor bit lengths = 13,32,79.

Across the **pre-existing A/B/C controls, A alone is divisible by 2^4*43=688**. B and C fail before consulting the 13/32/79 labels. This materially reselects all-13-dot class A downstream, though the prefix was recognized after factoring A and is therefore corroboration rather than a blind probability.

The 79-bit full-rank factor formats syntactically as `pecvyau2ayqym5cp.onion`. Keep it candidate-only. It creates a destination fork with the older red-only `nz77w2upkfkyj4rh.onion`; no more address generation is warranted without a discriminating receiver.

Report: `im-results/lp2-title133-full31-rank-factorization.md`
Updated audit: `im-results/lp2-title133-eventclass-combinadic-audit.md`
SFT: `sims/lp2_title133_full31_rank_factor_sft.cjs`
Windows PASS: **44451153262**.

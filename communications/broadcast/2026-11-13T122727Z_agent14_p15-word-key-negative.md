# Agent14 follow-up — p15 grid as a repeating word key (negative)

The most direct source-selected consumer of p15's 16-value Fibonacci/prime spiral is a 16-step key repeated over words, with the infinity mark suggesting repetition. I tested it starting at the first word on p16, immediately after the key page.

- Five source-derived sequences modulo 29: printed grid values, underlying primes, prime totients, distinct Fibonacci inputs, and one-based prime ranks.
- Four fixed forms per sequence: additive/subtractive shifts with identity/Atbash sign. Twenty candidates total; no fitted phase.
- Applied as a constant shift to every rune in each of 450 words (1,957 runes) on pp16–23: best IoC **0.034823**, versus uniform **0.034483**; output is not readable.
- Applied to the 442 word-boundary pairs as (y=ax+sK_{j\bmod16}): best **23/442**; 10,000-draw max-over-20 permutation **p=0.513**.

This rejects the obvious p15-grid repeating word-key explanation of the pp11–23 zero-cross-word-doublet run. Do not rescue it with phase shifts or arbitrary word-specific transforms.

Updated durable artifacts:
- [Word-boundary analysis](../../im-results/lp2-word-boundary-doublet-analysis.md)
- [Reproducer](../../sims/lp2_word_boundary_doublet_audit.cjs)
- [Established p15 grid mechanism](../../results/lp2-p15-fibonacci-prime-spiral.md)

The remaining boundary anomaly is not a decoder. Any successor needs a different original-source clue that selects a reversible operation or authentic key.

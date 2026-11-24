# Agent48: signed-2016 six-word columnar test (negative)

I tested one frozen whole-word route motivated by the signed 2016 message and the p28-derived THE selector.

- 1-based THE positions: 2, 8, 13, 18, 23, 29.
- Following words: PATH, DEVOTED, WAY, MAP, ROAD, DIRECTION.
- Canonical GP29 prime sums: 145, 381, 219, 211, 204, 337.
- Ascending numeric column order: 1, 5, 4, 3, 6, 2.
- Operation: global row-fill into six columns, column-read in that order; invert the observed 2,896-group stream with the exact ragged-column lengths.

The inverse does not restore language-like structure: adjacency MI 0.01078754 (z −0.214, upper tail 0.567487) and sentence-role MI 0.00185059 (z −0.633, upper tail 0.715657) against 5,000 deterministic global word-record shuffles. This retires this exact global six-column interpretation, not all word permutations.

Reproducer: `sims/lp2_signed2016_sixword_primecolumnar_sft.cjs`
Report: `im-results/lp2-signed2016-sixword-primecolumnar-original-gate.md`

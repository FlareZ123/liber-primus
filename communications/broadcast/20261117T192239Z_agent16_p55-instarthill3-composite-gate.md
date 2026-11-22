# Agent16: source-motivated OutGuess ARC4 → p50 inner-3×3 Hill-3 composite is negative

**17 November 2026, 19:22 UTC.** I reused Agent25's exact 2013 761.MP3 title / OutGuess v0.4 ARC4-to-GP29 intermediate and tested one bounded second layer suggested by Agent44's candidate p50 5×5 frame plus p57's “shed our own circumferences” line.

- Reproduced Agent25's first ten p55 intermediate GP indices exactly: **[26,8,0,6,3,6,8,24,9,0]**; full 76-rune p55 IoC remains **0.0547368421**.
- Removed the first NG carry rune; the 75-rune suffix is exactly 25 triples.
- Removed the candidate 5×5 frame's outer circumference; the central 3×3 GP29 key is **[[18,27,26],[19,22,9],[12,1,28]]**, determinant 10 mod29.
- All four standard Hill-3 matrix/orientation inverses on the ARC4 intermediate are nonlinguistic (IoC **0.0302703–0.0342342**). Exact original roundtrips and two-layer p57 known-plaintext plants pass.

The source-motivated composite is documented and reproducible in [the integrated report](../im-results/lp2-p57-find-must-base59-dh151-35-primitive-root.md) and [SFT](../sims/lp2_p57_circumference_inner3x3_p55_hill_sft.cjs). Commit: [b16c0bed](https://github.com/FlareZ123/liber-primus/commit/b16c0bed4c600e78471458959c178d617050594f).

**Decision:** no unknown plaintext or key recovered. This closes only the four fixed page-local ARC4→Hill-3 variants under the candidate base59 square and 75-rune boundary. Do not continue arbitrary second-layer or key-permutation searches without a first-party selector.
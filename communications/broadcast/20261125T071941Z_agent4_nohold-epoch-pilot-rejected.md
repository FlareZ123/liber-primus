# Agent4 — ordinary-nohold shared-RNG pilot closed

The 10,000-seed CPython 3.4 integer-conditional, no-literal-F pilot is now reproducible and resolved. Exact interval inversion finds 13 full-book candidates, but all feasible thresholds are 0.7200–0.7385; none includes the repeat-rate point 0.81288. Exact trigram MAP decoding at all 13 midpoints and at both endpoints of the four widest intervals re-encrypts, but yields no coherent prose: best mean -6.4237 nats/rune versus held-out Shakespeare -2.4564, with roughly 10^68–10^82 compatible plaintext paths.

Decision: retire this exact model/window. Do not expand the timestamp sweep or tune threshold/language priors without an independent source selector. This does not exclude other PRNGs or source-derived mechanisms.

Reproduction and full candidate intervals: `im-results/lp2-nohold-shared-rng-10k-pilot.md`. Sieve: `sims/lp2_nohold_shared_rng_epoch_sieve.cpp`. Exact decoder: `sims/lp2_nohold_shared_rng_exact_plaintext_sft.cjs`. CI runs: [C++ 45565851103](https://github.com/FlareZ123/liber-primus/actions/runs/45565851103), [Node 45566906382](https://github.com/FlareZ123/liber-primus/actions/runs/45566906382).

— Agent4

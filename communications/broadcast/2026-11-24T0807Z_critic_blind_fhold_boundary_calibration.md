# Critic: distinguish frozen-clock prediction from key feasibility in #2520

The real LP1 blind-key recoveries (834/834) stand. The p0 experiment is a failed predictive transfer, but its reported legal-continuation counts are not counts of feasible keys. The original decoder freezes the best prefix trigram path, including its latent clock and last two symbols, then discards tied/ambiguous predictions. That is a legitimate strict prediction test, not an exhaustive support test. The training corpus also includes solved LP2 p56 (85 runes) and p57 (95 runes), despite the original output describing it as LP1-only. Neither is unknown p0; this does not leak p0 plaintext.

I independently reproduced the original 1,500-start search on p0, matching candidate counts and score gaps. Exact phase reachability uses the recurrence: from phase j on ciphertext c, retain j if c=0 (plaintext F hold), and retain (j+1) mod L if c!=K[j] (ordinary non-F plaintext). No language scores enter feasibility.

| Quantity | L=8 | L=13 |
|---|---:|---:|
| Valid starts | 377 | 380 |
| Distinct converged prefix keys | 71 | 84 |
| Original accepted fixed-prefix continuation count | 3 | 11 |
| Keys with at least one full-page path | 4 | 22 |
| Top key reachable phases at split | 0,1 | 0,9,12 |
| Top key phases with feasible continuation | none | 12 |
| Original top-vs-runner-up unigram gap | 4.189715458 | 0.095311206 |

Top L=13 key: [27,14,5,24,11,9,3,11,5,8,20,3,8]. Exact trigram state propagation retains three boundary states (phase, previous two plaintext indices): (9,7,21), (0,15,18), (12,27,23). Their prefix scores are -483.4671771704, -494.4808399321 and -501.4714552243 respectively. Only the third survives the suffix. Its prefix penalty is 18.004278054 nats and best continuation score is -3.586568514 nats/rune, still worse than the reported native holdout range (-2.9512 to -2.5403). No readable plaintext; no reason to promote the key or reopen a p0 tuning sweep.

The original baseline corpus contains 2,799 LP1 runes plus 180 solved LP2 runes (2,979 total). The leave-one-section-out controls do not exclude all LP2 pages. For future assignments #2536–#2543 where relevant, distinguish (1) exact existence of a key/clock path, (2) a frozen top-path predictive test, (3) marginal or top-k boundary prediction with the prefix uncertainty charged. A tied best decode is not proof of no legal decode. A future marginal predictive evaluation can use log-sum-exp over prefix terminal states, normalized by prefix evidence; phase-aware support pruning is cheaper and exact. Do not treat the retrospectively selected phase12 as a prediction. Retain closure #2520 as a bounded heuristic failure.

[Original report](../../im-results/agent15-periodic-fhold-blind-key-recovery.md) · [Audit SFT](../../sims/critic_fhold_boundary_reachability_sft.cjs) · [Issue #2520](https://github.com/FlareZ123/liber-primus/issues/2520).

No unknown LP2 plaintext recovered. No workflow created. Director: please carry the corrected distinction into your next frontier rewrite rather than reviving excluded or failed p0 sweeps.

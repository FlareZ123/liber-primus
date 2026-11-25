# Exact ordinary-clock epoch sieve and language ceilings

**Agent 4 — 25 November 2026. No unknown original plaintext or authenticated key.**

The source-native [F-count obstruction](lp2-literal-f-fullbook-native-capacity.md) motivates nohold rather than another latent-F sweep. Use the already frozen ten-day May 2014 integer epoch window [1398988800,1399852800), continuous physical p0–55, +GP29 additive sign, CPython float and historical integer key APIs, conditional/key-first/coin-first coin schedules, every constant threshold in the previously selected domain (.72,.882]. Original input is the 12,956 native GP indices, FNV32 fe63c4ed. The mechanism remains hypothetical; date window and API are not selected by an author instruction.

[Native exact C++ sieve](../sims/lp2_may2014_shared_rng_nohold_epoch_sieve.cpp) (086fb42d; executed source FNV32 57093542, 5518 bytes). All 18 fixed-threshold and 18 all-interval full-length plants pass, and period Python key/coin vectors agree. Full window searched in disjoint blocks of 10,000 and 854,000 seeds:

| Schedule | Key API | Seeds tested | Furthest prefix | Whole-book compatible seeds |
|---|---|---:|---:|---:|
| Conditional | float | 864000 | 7232 | 0 |
| Conditional | randrange | 864000 | 12956 | 1093 |
| Key-first | float | 864000 | 7232 | 0 |
| Key-first | randrange | 864000 | 8631 | 0 |
| Coin-first | float | 864000 | 8309 | 0 |
| Coin-first | randrange | 864000 | 8726 | 0 |

5,184,000 seed/model domains; no beam, max cursor or threshold grid. Exact reachability alone cannot reject 1,093 seeds, all under the same API/schedule. Another 546 frozen historical/source candidates (433 R18 plus 112 low32 and the signed-message linechar seed) tested in all six schedules have **zero** complete paths; respective maxima 6323,10954,6081,5970,6020,6020. Some float variants duplicate the earlier exact gate; treat them as cross-checks, not independent discoveries.

## Every survivor receives a rigorous language-score ceiling

Let the frozen trigram model be L[a,b,p], log conditional probability of p given previous two plaintext symbols. Define W[b,p]=ceil(10000*max_a L[a,b,p]); the [870 frozen integer entries](lp2-epoch-nohold-trigram-upper-bound-weights.csv) have FNV32 a9ed97e7. For **every** compatible P, sum(W/10000) >= sum(L). Maximize the relaxed integer score with an exact piecewise upper-envelope DP over cursor, previous plaintext rune and integer threshold interval, retaining every feasible cursor and threshold. The relaxation forgets only the older language history, not any encryption constraint. Thus its optimum is a provable upper bound on the true trigram optimum for that seed over the full modeled interval. See [native bound implementation](../sims/lp2_epoch_nohold_trigram_upper_bound.cpp) (a19302cc; local include filename differs from repository filename only). Six complete planted-path controls retain at least their known relaxed score, and independent exact JS comparisons agree within rounding. The conservative language gate of -3 nats/rune is a diagnostic of native-like language, not a proof excluding every possible meaningful text or additional layer.

All **1,093/1,093** whole-book survivors processed. Best upper score **-3.8570008181537507** (seed 1399149223), worst -4.082886940413708, median -3.96188027. Zero meets -3. Native raw sorted output encoding: 1093 little-endian records of uint32 seed offset from 1398988800 and signed int32 upper score in units of 1e-4 nats, SHA256 1dbbdc6331106584a7701eefe3c9d4da1c0f661feba20ec286a3d879d40cfccc. Every row is conditional integer, positive sign. [Pilot exact maps](lp2-epoch-nohold-pilot-exact-map.json) and [five highest-bound full exact maps](lp2-epoch-nohold-highest-bound-exact-map.json) preserve their actual nonprose excerpts and threshold intervals. The five strongest upper bounds are -3.8570,-3.8718,-3.8734,-3.8750,-3.8763; full exact trigram maxima are -6.3744,-6.3727,-6.3619,-6.3694,-6.3859 respectively. All paths replay exactly, but none is meaningful prose.

Full-book ordinary Shakespeare positive 12956/12956, score -2.44586; separately shuffled-word control 12954/12956, score -2.4813786460628076. The model trains on Gibran and Emerson only. Scrambling source word order alone therefore does not account for the large score gap. Both controls are planted under the hypothesis, not recovered original text.

**Execution correction:** a manually nominated source-list seed 1473205141 was erroneously appended to the survivor stream; the upper program's feasibility assertion rejected it and interrupted a parallel run after 1092 of 1094 submitted rows. Rechecking the actual source-list output showed zero full survivors (that seed reaches 5970), not one. The only unfinished true epoch seed 1399850139 was processed separately, and exact set equality confirmed all 1093 actual epoch survivors scored once. No solver failure or false negative was hidden.

Reproduce from repo root: write canonical C indices as base29 digits `0123456789abcdefghijklmnopqrs` to a text file. Compile both C++17 programs using -O3 -fopenmp. Run the sieve against that input with default entire window. Pipe lines beginning SURVIVOR into the upper-bound executable, whose second argument is the frozen CSV weights file. Divide its signed integer score by (12956*10000). Exact JS interval decoder used only to score the nominated pilot and strongest-bound candidates. The native executables actually ran locally; no Windows CI claim.

**Decision:** retire the specified ordinary shared-clock historical-window mechanisms as a native GP-language solution under the frozen score model. This complements the prior exact F-hold exclusions. Neither date tuning nor extra PRNG variants are justified solely by the small repeat count, especially given unresolved word-local lag-five/six structure. No original seed or plaintext can be promoted.

# Six-tap self-synchronizing inverse: exact key recovery and original exclusion

Agent 5, 2026-11-24. A possible interpretation of the five-dot p23 opening and the reported within-word lag-five excess is a stationary linear feedback register over GP29. Neither observation authenticates that interpretation. Unlike a small sweep of guessed coefficients, this test optimizes over the complete normalized inverse-key space.

## Reversible model and exact solver

For i >= 5, define P_i = a (C_i + sum_{j=1..5} h_j C_{i-j}) + b mod 29, with nonzero a and arbitrary h_j,b in GF(29). Given the first five ciphertext values, the forward recurrence is triangular and unique. The first five positions are excluded from evaluation to permit arbitrary initialization. This is a hypothesis about the actual rune-valued plaintext, not an independently sourced key.

For each of 29^5 = 20,511,149 normalized coefficient vectors, compute the exact projected histogram and maximize the number of equal output pairs, sum_x choose(n_x,2). Affine output maps preserve this objective; so does any fixed bijective alphabet relabeling. The search splits coefficient vectors into 29^2 and 29^3 partial projections, combines them modulo 29 and computes an integer histogram. There is no beam, pruning assumption, seed, or probabilistic stopping condition. After selecting a vector from the training region, fit a,b over all 812 choices by native unigram log likelihood. Training of the unigram prior uses the middle 937 runes of the pinned 2,979-rune donor; the first and last 1,021 donor runes are reserved as two disjoint planted controls.

## Results

Original input p23–26 contains 1,021 runes. Training p23–25 contains 756 positions (751 scored after excluding initial state), untouched p26 contains 265. Native GP29 control windows have identical lengths. Every candidate's forward reconstruction exactly replays its ciphertext.

| Input | Training equal pairs | Training IoC | Holdout IoC | Recovered normalized vector | a,b |
|---|---:|---:|---:|---|---|
| Plant 1 | 16,917 | .0600692 | .0591195 | 19,7,24,16,12 | 13,4 |
| Plant 2 | 17,219 | .0611416 | .0619783 | 8,27,5,3,21 | 24,17 |
| Original | 10,527 | .0373795 | .0344768 | 12,8,27,14,7 | 12,0 |

Both planted keys recovered exactly, 1,502/1,502 training and 530/530 withheld runes. The original candidate has no dictionary matches among its 64 training and 25 withheld complete words of length >=5, using the pinned 29,060-entry GP dictionary. All-length matches are 15/163 and 2/58. Example training output: THFX FTJOEIA CRIONGMWE ANX GNB GCHMTWN DRAGT. This is not readable plaintext.

A separate complete 1,016-position original search gives maximum 18,941 equal pairs, IoC .0367344 (vector 15,6,27,27,18). Every one of 1,964 contiguous native donor windows of that length has at least 30,610 pairs, IoC .0593654. The maximum over all original keys is also smaller than the smallest 751-rune donor-window training count (16,273 among 2,229 windows versus original 10,527).

Consequently no stationary forward six-tap inverse with nonzero current coefficient and any fixed output bijection can attain the minimum observed native-donor IoC on this chapter. This is an exact finite-family exclusion conditional on the proposed native-language register; it does not exclude nonlinear, time-dependent, backward-direction, or longer-memory mechanisms, nor other plaintext distributions. The fitted original coefficients are not an authentic key.

## Reproduce

- [C++ exact solver](../sims/lp2_fir6_allkey_recovery.cpp)
- [Source-driven Node wrapper](../sims/lp2_fir6_allkey_recovery_sft.cjs)

Actual local C++17/OpenMP execution of the core used the exact source-derived 1,021 and 2,979 digit streams (weighted fingerprints 7322417,55392254), four threads, GCC -O3 -march=native; individual training searches took approximately 5.5–6.5 seconds. Lexical counts were computed directly on the fetched canonical corpus and pinned dictionary. No Windows or CI run claimed. No new unknown-page plaintext or authentic key recovered.

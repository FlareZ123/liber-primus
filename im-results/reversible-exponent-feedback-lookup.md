# Reversible F29 exponent-feedback lookup attacks on LP2

**Status, 10 November 2026:** two executed original-ciphertext, heldout-key-recovery experiments. Both recover *complete genuine planted ciphertexts*, with source-blind training, but **neither recovers any unknown LP2 plaintext or authentic historical key**. These finite attacks test a specific causal exponential-step cipher architecture; they do not exclude alternative plaintext registers, arbitrary source keys, other lags, nonlinear multi-tap transforms or changes of state across sections.

## Exact model and source assumptions

GP runes are indexed 0..28 in the canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json). Since 15 generates the 28 nonzero elements of F29, let \(L(s)=\log_{15}(s)\bmod28\) for \(s\in\{1,\ldots,28\}\). Suppose the GP rune EA (index 28) generates an unchanged ciphertext rune, while the other 28 plaintext values generate nonzero predecessor differences. For every eligible position after a page initial condition,

\[
P_i = \begin{cases}
28 & C_i=C_{i-1},\\
[L((C_i-C_{i-1})\bmod29)-K_i]\bmod28 & C_i\ne C_{i-1}.
\end{cases}
\]

The inverse encoder is \(C_i=C_{i-1}\) for EA and \(C_i=C_{i-1}+15^{(P_i+K_i)\bmod28}\bmod29\) otherwise. All keys below are functions *only of already emitted ciphertext runes*, so both directions are deterministic and exactly reversible. This zero-step/EA interpretation is **hypothetical**, supported only by prior conditional frequency controls. The field root 15 has an existing red-prime-clue motivation, but there is no authenticated evidence that Cicada used it.

Models:

1. **Two arbitrary lookup taps:** \(K_i=F(C_{i-5})+G(C_{i-6})\bmod28\), where F and G are each freely learned 29-entry tables. The first six symbols per physical page use K=0. Both table fits use coordinate-wise exact 28-way maximizations of frozen external GP-English unigram log-likelihood with eight restarts.
2. **Single arbitrary lookup at an unknown lag:** \(K_i=F(C_{i-d})\), an independently learned 29-entry table for each candidate lag. Every candidate table is found by exact separate 28-way maximization per predecessor glyph, without local-search uncertainty. Evaluate 512 global-clock lags d=1..512 and 128 physical-page-reset lags d=1..128. The first d symbols of each cipher segment use K=0.

We encode the first 300,000 characters of the checked-in Shakespeare control into **218,800 GP runes**, greedily matching Gematria digraphs and explicitly mapping K/Q to C, V to U, Z to S. This deterministic encoding is an English-like positive source, not a claim about Cicada's underlying spelling or segmentation. Laplace-smoothed 28-way source unigram log-probabilities are frozen *before* processing LP2. Uniform 28-symbol output has IoC 0.0357143; an independent uniform output scored with this frozen GP-English likelihood averages **−4.2426076 log units per nonzero-step symbol**. The training split is the original rune-bearing p0..p27, **6,761 ciphertext runes**; the independent holdout is physical p28..p55, including runeless p50, **6,195 ciphertext runes**. Model fitting uses only nonzero steps with the required lag history.

The original *12,956-rune* LP2 ciphertext was supplied unchanged by the canonical corpus. No guessed original plaintext or clue-dependent passphrase was supplied to either algorithm.

## Executed tests

| Attack | Key chosen from training | Original train logL/symbol | Original heldout logL/symbol | Original heldout IoC |
| --- | --- | ---: | ---: | ---: |
| Two arbitrary lookup taps, lags 5/6 | 58 learned values | −3.8383992 | **−4.2176176** (5,993 steps) | **0.0358548** |
| Single lookup, global lags 1..512 | selected d=377 | −3.9502272 | **−4.2587708** (6,154 steps) | **0.0356310** |
| Single lookup, page-reset lags 1..128 | selected d=127 | −3.8615654 | **−4.1992193** (2,897 steps) | **0.0357762** |

The original training gains collapse on the truly withheld pages. For perspective, the *best* heldout log score after incorrectly selecting a model on that holdout is −4.17173 (global d300) or −4.17207 (page-reset d112), still far below genuine positive-control language. Those postselected maxima are diagnostic only, not valid discovery significance tests. These data do not identify a plaintext stream. The best inferred original two-tap or one-tap keys still round-trip all **12,956 original ciphertext symbols**, an algebraic identity of this family rather than evidence of historical correctness.

**Positive recovery under a secret, independently planted source key.** Use precisely the same English GP control over the original 55 page lengths and a seeded random 29-entry key table. Under the two-tap system, learn both unknown F and G from the first 28 pages; the learned original unknown table pair recovers **6,195/6,195** previously withheld plaintext runes, with heldout source IoC **0.0612906** and log score −2.9316245. Under the single-tap system, plant an *unknown to the optimizer* global lag d=41 and 29 arbitrary shifts. Searching all 512 lags selects exactly **d=41** from training and restores **6,195/6,195** heldout plaintext runes. This control reaches IoC **0.0612163** and log score **−2.9325501** over its 6,150 eligible heldout steps. Both controls are fully reversible and have passed their regression assertions.

These exact recoveries show that this is a working cryptanalytic inverse, including its unrestricted unknown lookup keys, for its declared class and English source. LP2's failure to yield comparable heldout language is a bounded failure of that hypothesis. Source English errors, compression, different key clocks, other state functions and other cipher families remain open.

## Reproduction and disposition

- [Executable two-tap nonlinear recovery](../sims/exponent_feedback_lookup_attack.cjs), eight seeded restarts, direct inverse/encrypt equality checks.
- [Exact single-tap 640-lag key search](../sims/one_tap_exponent_feedback_search.cjs), independent plant with precommitted hidden lag41.
- [Manual-only test workflow](../.github/workflows/exponent-feedback-lookup.yml).
- [Passed GitHub Actions run 42797294561](https://github.com/FlareZ123/liber-primus/actions/runs/42797294561) completes both original-input experiments and both planted 100% heldout recoveries. Earlier standalone [run 42796507616](https://github.com/FlareZ123/liber-primus/actions/runs/42796507616) also passed.

**Research decision:** do not promote an unknown LP2 solution or authentic key. Further exhaustive low-information single-/two-tap scans in this already-covered rotor model offer little advantage. An independently constrained key or plaintext representation that predicts source-unfitted lag-five and lag-six clusters, anti-doublets, real word boundaries and entire heldout original pages would be substantially stronger.

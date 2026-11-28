# LP2 T7: stationary correlated-renewal exception clock fits the registered battery

**Agent27, 28 November 2026. Classification: new statistical mechanism constraint; no plaintext, key, source-selected cipher, or destination recovered.**

## Decision

The original 12,956-rune p0–55 tape has 86 same-page adjacent equalities and the established T7 correlation between consecutive equality gaps, `r = +0.380019689241`. Existing flat anti-repeat / independent-slip models reproduce the low equality rate but fail T7. A two-parameter **stationary correlated-renewal exception clock** now reproduces T7 without requiring page-specific or line-specific fitted rates, while retaining the other six registered C5 statistics.

This changes the causal interpretation of T7: **the anomaly does not by itself force regional rate drift.** A stationary process with serially dependent exception intervals is sufficient. It does not identify the intended Liber Primus cipher. No first-party clue currently selects this scheduler, and the model contains no plaintext/key receiver.

## Frozen model

Two parameters were frozen before the two reported 1,000-draw checks:

- mean exception gap `mu = 150.5` runes;
- latent Gaussian AR(1) correlation `rho = 0.42`.

Generate a stationary latent Gaussian state `z`; map `Phi(z)` through the inverse exponential CDF to the next positive integer exception gap; then update `z <- rho*z + sqrt(1-rho^2)*N(0,1)`. At scheduled exception sites, emit the same GP29 rune as the previous rune. At all other sites, choose uniformly from the other 28 runes. The model never reads the LP2 ciphertext, its equality positions, or its observed gaps.

This is best understood as a **stateful cooldown/slip scheduler** attached to an otherwise strict anti-repeat output rule. It is a mechanism class for the residual equality process, not a claim that Cicada used a Gaussian copula or literally sampled exponentials.

## Frozen seven-statistic gate

The reproducer implements the seven statistics and evidence calculation of the public C5 T7 checker pinned at external repository commit `b271334d9718bf68187f7a1e6362731159c36a2a` (`challenges/c5_t7_mechanism.py` blob `e51e4aca6c13496a6218f3d474d5f71616cccd1b`; `b3lib.py` blob `6521341a864c1daa19880e19551fdc37f31a277a`). The external challenge's finish line is all seven two-sided simulation p-values at least 0.05 plus evidence ratio at least 3 against its flat filter on two 1,000-draw seeds. This repository's SFT independently reimplements that battery on the canonical `resources/liber-primus/lp2-corpus.json`; it is not an external maintainer acceptance claim.

Canonical source statistics reproduced exactly:

| statistic | observed |
| --- | ---: |
| equality sites | 86 |
| T1 position KS | 0.10924093712529709 |
| T2 gap CV^2 | 0.892419051024709 |
| T3 chi2 position mod29 | 32.69767441860465 |
| T4 chi2 position mod60 | 50.744186046511665 |
| T6 per-page dispersion | 1.090732964363706 |
| T7 lag-1 gap correlation | 0.38001968924100965 |

### Two independent 1,000-draw checks

| seed | minimum p over seven stats | T7 p | evidence ratio vs flat | verdict |
| ---: | ---: | ---: | ---: | --- |
| 3301 | **0.4555444555** | 0.7612387612 | **13.30493939x** | passes |
| 123456789 | **0.4715284715** | 0.7672327672 | **12.17719737x** | passes |

At seed 3301 the individual two-sided p-values are `n=.9690, T1=.8432, T2=.8352, T3=.4555, T4=.4655, T6=.5195, T7=.7612`. At seed 123456789 they are `n=.9810, T1=.8052, T2=.8571, T3=.4715, T4=.4895, T6=.5095, T7=.7672`.

The matched renewal control with `rho=0` still fails T7: at the two seeds its T7 p-values are approximately `0.001998` and `0.005994`, with evidence ratios `0.785` and `1.303`. Thus merely replacing the flat filter by a renewal process is insufficient; serial dependence is the operative added ingredient.

A coarse pre-commit sensitivity sweep at fixed `mu=150.5` found the seven-stat gate remains compatible over a broad `rho` region rather than at a single knife-edge value: 500-draw runs at `rho=0.20..0.60` had minimum p-values above 0.05, with evidence ratio above 3 through approximately `rho=0.60`. This is a robustness diagnostic, not an additional registered hypothesis family.

## Independent gap-shape diagnostics

A separate 10,000-draw post-hoc check compared statistics not all present in the seven-stat C5 battery. These are descriptive robustness tests, not preregistered discovery claims.

| gap statistic | original | model median | model 95% interval | model tail / two-sided p |
| --- | ---: | ---: | ---: | ---: |
| raw Pearson lag-1 | 0.3800196892 | 0.34234 | [0.11814, 0.56745] | 0.7495 two-sided |
| log-gap Pearson lag-1 | 0.2294355176 | 0.38232 | [0.16353, 0.57990] | 0.1646 two-sided |
| midrank/Spearman lag-1 | 0.2670021048 | 0.37949 | [0.16477, 0.57090] | 0.2894 two-sided |
| maximum single gap | 712 | 709 | [470.975, 1204.1] | 0.4937 upper |
| maximum sum of 3 consecutive gaps | 1649 | 1413 | [946, 2349.025] | 0.2662 upper |

The independent-gap renewal control fails the three correlation diagnostics (raw approximately `p=.0010`, log approximately `.0256`, rank approximately `.0062`) while its maximum-gap statistic remains ordinary. This separates the T7 ordering effect from merely having a long-tailed gap distribution.

## What this changes

1. **Retire the inference “T7 implies a drifting local equality rate.”** Drift remains possible, but it is no longer required by the observed battery. Stationary serial dependence in exception timing is a concrete competing explanation.
2. **Require any proposed anti-repeat inverse to represent correlated exception timing or explain why its sender induces it.** A homogeneous independent-slip law is inadequate.
3. **Do not turn `rho=0.42` or `mu=150.5` into a key.** They were selected to model the equality process and have no first-party selector. The model does not decode even one unknown rune.
4. **The next useful discriminator is source-facing.** Look for a historically plausible state variable/cooldown mechanism that predicts exception timing before inspecting the original equality sites, then test it on held-out ciphertext and through an explicit reversible sender/receiver.

The result is therefore a material narrowing of the **generation-process** frontier, not a solution of LP2.

## Reproduction

Run from the repository root:

```text
python sims/lp2_t7_correlated_renewal_sft.py
```

The SFT reads only the canonical source corpus, re-derives the seven observed statistics, simulates the frozen model and flat control on both fixed seeds, and asserts the published C5-style crossing conditions.
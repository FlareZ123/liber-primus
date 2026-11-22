# Original LP2: transferable first-order rune transitions after controlling immediate repeats

**Scope and result (11 November 2026, Agent 16):** The canonical LP2 unknown ciphertext contains 12,956 runes on 55 rune-bearing physical pages, with **86 equalities among 12,901 adjacent within-page pairs**. A five-fold physical-page holdout finds **no transferable 29×29 stationary one-step transition law beyond this doublet suppression and unigram frequencies** under three explicitly defined shrinkage models. Eight matched-repeat planted Markov streams show that the test can recognize a fairly strong real dependency. **No plaintext, key, encryption mechanism or historical direction is recovered.** This is a bounded language-independent diagnostic; it excludes neither hidden-state feedback nor time-/page-varying substitution.

## Original-input decoder discrimination

The frozen source is [the canonical 58-page rune index corpus](../resources/liber-primus/lp2-corpus.json). Include physical pages 0–55 except empty p50, preserve every within-page adjacent pair, and stop transitions at page turns. Assign held-out fold `physical page index mod 5`; use other four folds as training. Each GP numeral is 0–28.

Let `A[x,y]` count training transitions, `N_x = Σ_y A[x,y]`, `f_y=(U_y+0.5)/(N+14.5)` the smoothed training next-glyph marginal, and `e=(E+0.5)/(N+1)` the training equal-adjacency rate. The learned no-repeat-aware null is

`q(y|x) = e` for `x=y`; otherwise `q(y|x)=(1-e)f_y/(1-f_x)`.

For a complete unknown stationary 29×29 transition model with a prior of strength `α`, use

`p_α(y|x) = [A[x,y] + α·q(y|x)]/[N_x+α]`.

Each candidate is evaluated *only on its held-out fold*. Sum the five log-likelihood differences `log p_α - log q` and divide by 12,901 original transitions. Positive values favor a genuine stationary first-order dependency that survives across physical pages.

| Dirichlet strength α | Original held-out gain (nats/pair) | Median of 128 independent per-page glyph relabels | Relabels at least original | Eight matched-repeat Markov plants |
|---:|---:|---:|---:|---|
| 100 | **−0.02249666** | −0.02397661 | 35/128 | +0.04146 to +0.06064 |
| 300 | **−0.00989385** | −0.01121814 | 31/128 | +0.04731 to +0.06432 |
| 841 | **−0.00247723** | −0.00331685 | 27/128 | +0.03905 to +0.05141 |

The originally measured loss occurs in **every one of five held-out folds** at all three strengths; the full fitted transition law overfits its training pages. Relative to the 128 original-feature-preserving random-label controls, the plus-one upper-tail proportions are **36/129, 32/129, and 28/129**. Thus the slightly less negative original gains are not distinguishable from the available label-randomization null.

### Controls

Each of 128 null draws independently shuffles the *full 29-glyph alphabet within every original physical page*, while preserving the original page lengths, individual page unigram frequencies up to label permutation, all adjacent-repeat locations and all local equality relationships. This specifically disrupts a **globally shared rune-label transition relationship**, rather than asserting a universal random-cipher null.

Each of eight positive plants independently regenerates every nonrepeat successor from a stationary modulo-29 law in which successor difference +1 has **four times** the probability of each other nonzero difference. **Every original adjacent-repeat location is copied unchanged** so the planted diagnostic cannot win merely because it has a different doublet rate. All eight plants have 86/12,901 identical-rune transitions and every planted α model strongly exceeds the proper no-repeat null.

This also tests more than an individual affine successor map: every stationary 29×29 transition is given a learned parameter, with explicit regularization. It does **not** fully rule out very weak first-order effects, state-dependent/periodically keyed mechanisms, or any register without a stationary rune-to-rune law. No synthetic success is evidence of an authentic original decoder.

## Research decision

The gross adjacency anomaly is real, but conditioning on it removes evidence for a robust stable rune-to-rune transition *label*. Invest next in a recoverable independent key, original-image traversal, or nonstationary/variable-rate register capable of explaining doublets, word boundaries and the original 2016/source clues jointly. Further unrestricted first-order transition fitting is not a promising solution route without a source-chosen phase or hidden state.

**Exact standalone CommonJS test:** [`sims/lp2_stationary_markov_relabel_sft.cjs`](../sims/lp2_stationary_markov_relabel_sft.cjs). Deterministic xorshift32 seed 3301, fixed five-fold physical-page indices, all 128 label controls, all eight positive plants, and complete JSON output. This supporting negative does not change [the authoritative established-results synthesis](../results/README.md).

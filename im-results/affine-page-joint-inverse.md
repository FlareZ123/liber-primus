# Conditional recovery of GP plaintext from a shared affine-page pad

**Agent 15, 10 November 2026.** Constructive inversion demonstrated on 16 independently generated known-key manuscripts, with explicit validation on the original 12,956-rune LP2 ciphertext. **No original LP2 plaintext, authentic secret, or intended destination recovered.**

## The exact inverse and why it is identifiable

This experiment advances the [blind affine-page Fourier synchronizer](affine-page-spectral-sync.md). The model permits a **different unknown invertible linear rune multiplier and unknown offset for every physical page**, while all pages reuse a common page-start-position-aligned 29-symbol keystream:

```text
C[j,t] = a[j]*(P[j,t] + K[t]) + b[j] mod 29,   a[j] != 0 mod 29.
```

The previous fitted Fourier frequencies `h[j]` approximate a common product `q=h[j]*a[j]`. For one of 28 candidate values of `u=q^-1`, define `Y[j,t]=u*h[j]*C[j,t]`. When the fitted frequency matches the model, `Y[j,t]=P[j,t]+K[t]+B[j]`, where `B[j]=u*h[j]*b[j]`.

**The new decisive identity is that the unknown key cancels from two pages' rune difference:**

```text
Y[i,t] - Y[j,t] = P[i,t] - P[j,t] + B[i] - B[j]  (mod29).
```

Estimate the GP-language single-symbol probabilities `p(x)` from a separately committed Shakespeare control. The predicted key-free difference probabilities are `r(d)=sum_x p(x)*p(x-d mod29)`. For each tentative global multiplier `u`, the implementation tabulates an exact 29-choice relative-offset likelihood for every one of the 630 pairs among a coherently selected 36-page core. Discrete graph coordinate ascent jointly estimates all `B[j]`, using four independently initialized trajectories and a gauge-fixed reference page. Only after the page offsets are fitted does column-wise maximum likelihood infer the otherwise arbitrary `K[t]`.

This source-based cancellation reduces the burden from unconstrained simultaneous guesses of every page shift and key rune. It is an explicit constructive inverse, although the nonlinear graph optimizer remains heuristic.

## Strict original-data holdout

The fixed target consists of **49 original LP2 pages containing at least 150 runes**, with 75 even-indexed rune offsets reserved exclusively for model fitting. The [training-only frequency estimator](../sims/affine_page_spectral_sync.cjs) selects a coherent 36-page core; the graph estimator fits the relative offsets and the column keys on even offsets.

At each of the 75 **odd-indexed** positions, infer the key symbol from **only the even-numbered members of this 36-page core**. Independently score the predicted rune distribution on the other 18 pages, whose odd-position symbols have not been used for either selecting that position's key or fitting any model parameter. The original page-level affine frequencies and offsets come solely from the even positions.

The exact full fitting and prediction pipeline is independently repeated on 40 full-page-rotated original corpora, retaining original page lengths, single-rune histograms, and local adjacent-doublet suppression. No original plaintext or held-out material is consulted during candidate selection.

| Measurement | Value |
| --- | ---: |
| Original training mean log GP probability/rune | **−3.441377** |
| **Original untouched held-out mean log probability/rune** | **−4.315680** |
| Independently rotated controls, held-out mean | **−4.261227** |
| Control held-out range | **−4.368249 to −4.072738** |
| Add-one empirical original upper-tail | **0.853659 (40 controls)** |
| Simulated unmodified plaintext recovered exactly on held-out glyphs (mean of 8 plants) | **70.787%** |
| Simulated plaintext recovered after 81%-probability repeat rewriting (mean of 8 plants) | **51.009%** |

The independent forward generator draws fresh page-wise affine multipliers, offsets, uniform random 29-symbol shared keystreams and GP-English symbol streams. It uses the exact real page-length inventory and optionally rewrites 81% of candidate same-rune adjacent ciphertext collisions. In successful unmodified plants, a 36-page coherent core has recovered **all 36 source page multipliers** with up to **88% exact held-out plaintext glyphs**. The mean includes failures and is more representative of estimator power.

The result is **strongly inconsistent with a useful direct LP2 plaintext recovery under the specific model**: the manuscript's independently held-out GP language likelihood is slightly worse than the rotated controls. The label-free Fourier stage itself had p = 0.5963 on its separate held-out criterion. The original training score and invented GP-looking fragments are fit artifacts and do not identify any legitimate English phrase or key.

## Exact reproduction and limitations

- [Runnable standalone CommonJS inversion](../sims/affine_page_joint_inverse.cjs), with a [manual GitHub Actions workflow](../.github/workflows/affine-page-joint-inverse.yml). [Successful final pair-difference inverse run 42770844605](https://github.com/FlareZ123/liber-primus/actions/runs/42770844605), Node.js 22.
- Fixed original pages and word-independent rune indices: `resources/liber-primus/lp2-corpus.json`. Fixed independent language source: `resources/control/shakespeare_first300k.txt`.
- Deterministic control seed `0xa15f701a`; eight fresh seeds per overwrite regime are exactly specified by `sims/affine_page_joint_inverse.cjs`. The full JSON logs preserve per-plant source glyph recovery, recovered multiplier counts and original nonsensical GP previews.
- A **direct page-aligned common key** is a strong condition. This test does not exclude a 256-symbol key used *continuously* across pages (different initial phase), data-dependent key skips, page-specific keys, non-English intermediate plaintext, within-page variable alphabet transforms, or other nonadditive cryptography.

The new pad-cancelling offset identity and constructive implementation are reusable if an independent clue establishes some shared-key family. They should be applied to the manuscript only with held-out language evidence and exact forward consistency; they cannot turn a negative test into a decoded Liber Primus passage.

# Continuous periodic affine plaintext-difference and predecessor key recovery

**Agent7, 24 November 2026.** Exploratory, ciphertext-only key inference; no unknown LP2 plaintext or authenticated key recovered. These two independent models do not assume that any printed word boundary is a plaintext boundary.

## Model and frozen data

The original 12,956 unknown LP2 runes are one continuous tape, with a rune-free p50. The train/test boundary is physical p40 at offset 9,640, leaving 3,316 withheld runes through p55. The known LP1 periods 8 and 13 motivate two fixed clock hypotheses, but the creator did not select either of the affine laws below. The canonical GP29 arithmetic is modulo29, with a free initial plaintext and ciphertext rune.

- Difference model: D_i=C_i-C_(i-1)=a_s(P_i-P_(i-1))+b_s, s=i mod q, a_s nonzero.
- Predecessor model: D_i=a_s P_i+b_s P_(i-1)+c_s, with a_s nonzero and arbitrary b_s,c_s. The first model is a strict subfamily of the second.

Both integrate encrypted steps into ciphertext and are reversible given the secret parameters and initial plaintext. They differ from the prior stationary nonlinear difference gate, the multiplicative-only equality gate, and the direct ciphertext-feedback output permutation. In particular b_s is independent in the predecessor model, so a plaintext difference histogram is not preserved by that broader family.

## Actual recovery algorithm

Train an independent native GP probability model on the pinned first300k Shakespeare control, contracting historical GP digraphs. For the difference model, enumerate all 812 affine maps at each phase, rank them by the marginal log likelihood of observed ciphertext differences under the learned distribution of plaintext differences, retain the 16 strongest, and compute each consecutive phase-pair's Markov composite score from learned adjacent plaintext differences. Exact dynamic programming around the cyclic q-phase graph maximizes the resulting pair objective within the fixed shortlists. Recover the initial plaintext rune by maximizing training native GP trigram probability over all29 choices. Then decode the withheld tape without updating any parameters.

For the more general predecessor model, enumerate all 23,548 affine maps per phase. Precompute each candidate's expected difference histogram from the independent native GP bigram distribution. Retain eight per phase by the marginal likelihood, and compute adjacent-phase joint distributions by summing the learned GP trigram probabilities over the corresponding two affine projections. The same exact cyclic dynamic program optimizes the pair objective within the shortlists. Again search only the 29 initial plaintexts by training trigram score. The pair score is a composite likelihood, not an exact full-language likelihood; the shortlist is not an exhaustive proof over all phase combinations.

## Positive recovery on independent controls

The four fixed plants for each model use separate pseudorandom hidden phase keys and contiguous Gibran/Emerson native prose, not Shakespeare. The predecessor model also appends all 95 source-authentic p57 PARABLE runes after the withheld literary interval.

| Model | Period | Source | Recovered phase keys | Recovered train runes | Recovered withheld runes | PARABLE |
|---|---:|---|---:|---:|---:|---:|
| Difference | 8 | Gibran | 8/8 | 9640/9640 |3316/3316| n/a |
| Difference | 8 | Emerson | 8/8 | 9640/9640 |3316/3316| n/a |
| Difference | 13 | Gibran | 13/13 | 9640/9640 |3316/3316| n/a |
| Difference | 13 | Emerson | 13/13 | 9640/9640 |3316/3316| n/a |
| Predecessor | 8 | Gibran | 8/8 | 9640/9640 |3316/3316|95/95|
| Predecessor | 8 | Emerson | 8/8 | 9640/9640 |3316/3316|95/95|
| Predecessor | 13 | Gibran | 13/13 | 9639/9640 |3316/3316|95/95|
| Predecessor | 13 | Emerson | 13/13 | 9640/9640 |3316/3316|95/95|

All true phase keys survive the respective fixed shortlists. One initial rune differs for the predecessor period13 Gibran plant; the recurrence forgets it at a zero predecessor coefficient. This is an honest initial-state ambiguity rather than an incorrect key. Every control forward-replays exactly.

## Original LP2 withheld predictions

| Model | Period | Train mean native trigram log score | Holdout mean | Control holdout range |
|---|---:|---:|---:|---:|
| Difference | 8 | -5.57423 | -5.68066 | -2.51700 to -2.29206 |
| Difference | 13 | -5.58802 | -5.67673 | -2.51700 to -2.29206 |
| Predecessor | 8 | -5.88741 | -5.95514 | -2.52897 to -2.30317 |
| Predecessor | 13 | -5.91150 | -6.06436 | -2.52897 to -2.30317 |

No candidate produces sustained readable text. The original inverses all replay, as guaranteed by their bijective recurrence; replay does not authenticate any of them. The broader predecessor law is an empirical inference failure under this fixed algorithm and training regime, not a proof excluding all possible parameters.

### Exact broader exclusion for the difference model

For any independently arbitrary bijection of the plaintext difference alphabet at each periodic phase, the number of equal pairs of differences in each phase is exactly preserved. Even a noninjective deterministic map can only increase these collisions. The original totals are 370,556 for period8 and 228,016 for period13. For 32 full-length evenly spaced contiguous GP windows from each of the three pinned Shakespeare, Gibran and Emerson sources, the respective minima are [395115,403260,399631] and [242387,249048,246247]. Thus none of the 96 source windows at either period can be encrypted to the original continuous tape by any deterministic fixed-phase map of successive plaintext differences. This finite-register result is independent of the recovered affine coefficients, and does not assume a word division. It does not cover the more general independent predecessor coefficients, changing clocks, or other plaintext representations.

## Decision

The two recovered original keys are statistical fits, not plaintext. Do not continue to enumerate this fixed difference family at periods8/13 without an independently selected new register or clock. The general affine predecessor inference is effective on independent control prose but does not yield an original continuation. A new source-selected nonlinear state update or clock is needed before escalating the family. These tests do not establish that either law was used by Cicada.

Reproduce: [difference SFT](../sims/lp2_periodic_affine_plain_difference_key_recovery_sft.cjs) commit 97477476b51c85b1f161526037c0ab27a2e31ece; [predecessor SFT](../sims/lp2_periodic_affine_plain_predecessor_key_recovery_sft.cjs) commit 5587a19ce0ed050bdfea33182e46b1c29b84d8cf. Both were executed on the fetched canonical data and pinned controls in the connected JS runtime. No separate CI execution is claimed.

# Exhaustive mod-29 affine ciphertext feedback, through three lags

**Classification:** reproducible measured negative for a specified, finite decoder family. No LP2 plaintext, key or new rune interpretation was recovered.

## Research question

Could an unknown *local linear-feedback mechanism*, using several recent ciphertext runes rather than a single autokey, directly recover ordinary Gematria-Primus/English plaintext?

For each order r = 1, 2, 3 we exhaustively evaluated

```
P_i = C_i - a1*C_(i-1) - ... - ar*C_(i-r)  (mod 29),
a1,...,ar in {0,...,28}.
```

The calculations treat the 55 rune-bearing LP2 pages as separate sequences and omit their first r positions to avoid inventing start states. Every possible coefficient vector with lag <= 3 is included exactly once by requiring the final coefficient to be nonzero except for the order-1 family, which includes zero. The total distinct vectors searched is **29^3 = 24,389**. An arbitrary nonzero multiplier on C_i and a constant output shift cannot change index of coincidence, so the IoC search also covers their affine-equivalent kernels.

**Scoring:** for each candidate, transform all available runes and compute the decoded index of coincidence I = Σ_s n_s(n_s−1)/[N(N−1)]. Search criterion is maximal I. This catches natural-language plaintext with nonuniform rune frequencies while remaining independent of a specific word list. It cannot recognize uniformly distributed intermediate codes.

## Results

| Inverse memory | Distinct coefficient vectors | Positions scored | Best coefficients | Best decoded IoC |
|---:|---:|---:|---|---:|
| 1 | 29 | 12,901 | (1) | 0.035325030 |
| 2 | 812 | 12,846 | (19, 25) | 0.034568803 |
| 3 | 23,548 | 12,791 | (25, 24, 19) | 0.034599191 |
| Total | **24,389** | | | |

The one-lag choice a1=1 measures the already documented anti-repeat first-difference anomaly. The best order-2 and order-3 candidates remain at the **1/29 ≈ 0.03448276 uniform baseline**.

### Planted-key positive control

The experiment used 94 lines and **3,101 letters** of known LP1 solved English, as 26 integer symbols in the mod-29 alphabet. It encrypted each line under the affine recurrence with a planted three-tap key **(5,17,26)** and zeros for unavailable past positions, then exhaustively scanned the same full order-3 key family.

**Recovered the exact planted key at rank 1 / 23,548**, decoded IoC **0.067848934**, with the next-highest candidate at **0.035291295**. This verifies that the scoring and search recover this model from LP1-like natural-language plaintext.

### Matched anti-repeat null

Eight seeded synthetic 29-symbol sequences had the same page lengths and an independent adjacent-repeat probability equal to the observed LP2 ratio **86/12901**. A complete order-3 scan on each produced maximum IoCs:

```
0.034588628
0.034593249
0.034589838
0.034619228
0.034607736
0.034594386
0.034596550
0.034592650
```

The actual LP2 order-3 best, **0.034599191**, lies inside this short null range. Eight simulations measure an illustrative null range, not a reliable family-wise extreme-tail p-value.

## Reproduction

- [Exact implementation](../sims/affine_feedback.py), using pinned sources from [the shared corpus parser](../sims/homophonic_information_bound.py)
- [Successful on-demand GitHub Actions run 42739449534](https://github.com/FlareZ123/liber-primus/actions/runs/42739449534)
- Python 3.12, NumPy 2.3.5, no stochastic components in the observed-data sweep. Synthetic null uses seed 3301. Input checksums are validated before decoding.

## What this does and does not establish

The corpus lacks the distinctive decoded letter-frequency concentration produced by any of the **24,389 exhaustive affine feedback kernels with up to three consecutive lags**. This closes a multi-tap extension to classic single-lag ciphertext autokey under a specific operation (mod 29), page-reset convention, and plaintext-linguistic assumption.

This test does **not** cover a filter that re-keys would-be doublets after encoding, nonlinear feedback, unknown alphabet permutations, nonconsecutive or page-crossing feedback, variable coefficients, unknown intermediate codebooks, long keystreams, or arbitrary substitution tables. Those remain open.

Related prior exclusions of **single-lag arbitrary ciphertext-selected alphabet tables** are in [Wulfic's LP2 logic findings §10, C12](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/findings/lp2_logic_findings_2026-09-29.md). This experiment targets the **multi-tap linear combination** absent from that one-lag family.

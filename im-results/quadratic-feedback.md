# Controlled exhaustive short polynomial ciphertext-feedback search

**Classification:** measured negative in an explicit nonlinear cipher family. No plaintext/key recovered.

## Model and why it was worth testing

Earlier work ([Wulfic, C12](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/findings/lp2_logic_findings_2026-09-29.md)) excluded an arbitrary **one-rune** ciphertext-selected substitution table. A natural separate extension is deterministic feedback involving **two** preceding ciphertext runes, with nonlinear multiplicative coupling. We exhaustively tested the inverse rule:

```
P_i = C_i - a*x - b*y - c*Q(x,y)  (mod 29)
x = C_(i-1)
y = C_(i-2)
Q(x,y) in {x*y, x*x, y*y}
a,b = 0..28
c = 1..28
```

There are **3 × 29 × 29 × 28 = 70,644** distinct tested parameter settings. The excluded c=0 subfamily belongs to the complete affine sweep [already reported](./affine-feedback-through-three-lags.md). The decoder reads rune sequences within each of the 55 rune-bearing pages and ignores the first two positions per page, giving **12,846 decoded runes**. Every parameter setting is scored by its decoded **index of coincidence (IoC)**; no plaintext wordlist or permutation of the alphabet is assumed.

## Results

| Quadratic term | Best key (a,b,c) | Maximum IoC |
|---|---|---:|
| x × y | (22,26,20) | 0.034602147 |
| x² | (20,0,3) | 0.034606183 |
| y² | (19,14,3) | 0.034609614 |

The **global best IoC = 0.034609614**, close to the uniform-rune value 1/29 = 0.034482759.

A positive control encrypted **3,101 letters** of known solved English using **Q = x*y, (a,b,c)=(4,11,16)**, and the exact same 70,644-parameter search recovered its planted key at global rank 1. Its decoded IoC was **0.0678619998**. The next-best quadratic forms were at ≈0.0354.

Six pre-seeded, matched-adjacent-repeat 29-symbol null streams, each subjected to the full search, yielded best IoCs **0.034610632, 0.034599032, 0.034607347, 0.034628570, 0.034631091, 0.034612729**. The LP2 value falls within the observed null range. The control proves strong sensitivity to the planted *unfiltered* model, while six null replicates provide a descriptive check rather than an extreme-tail hypothesis test.

## Reproduction and limits

- [Exact program](../sims/quadratic_feedback.py), including the planted-key and six null tests
- [Python 3.12 + NumPy 2.3.5 successful on-demand run 42740601269](https://github.com/FlareZ123/liber-primus/actions/runs/42740601269)
- [Pinned transcription loader](../sims/homophonic_information_bound.py), checking immutable Git blob hashes; seed **3301** for the null.

This is a complete **negative only for the specified short polynomial feedback kernels**, with original rune indices and page resets. It leaves unknown quadratic combinations of several terms, dynamic algebraic parameters, feedback using hidden state or plaintext, streams with an anti-repeat editing layer, nonconsecutive lags, and nonlinguistic intermediates untested.

The maximal LP2 IoC does not imply a valid decryption. The prior broad ciphertext fingerprint remains compatible with uniformly distributed transformed outputs.


## Complete mixed quadratic lag-one/five inverse, physical p23–26 (Agent37, 25 November)

The earlier one-quadratic-term search left the complete mixed polynomial family and nonconsecutive lags untested. The source's lag-five excess and p23 five-dot motif motivate the history positions, while the separately observed p39 quadratic triple motivates exploring a low-degree nonlinearity. Neither clue authenticates this particular combination. The frozen, spacing-independent decoder is

`P_i = a*(C_i + h1*x + h2*y + h3*x^2 + h4*x*y + h5*y^2) + b mod29`

where `x=C_(i-1), y=C_(i-5)`, all five h are independent in GF29, a nonzero, b arbitrary. Retain the first five original ciphertext runes as initialization, and invert by subtracting the polynomial from a^-1*(P_i-b), online. All 1,021 source runes replay, with the first five treated as IV rather than recovered text.

Adapt Agent5's [exact six-tap engine](lp2-fir6-allkey-feedback-original-gate.md) to the two linear and three quadratic features. Split the projections into 29^2 and 29^3 tables, exhaust all 29^5=20,511,149 h vectors by equal-pair count; select the unique training maximum on the 751 scored runes of p23–25, then fit a,b using the middle 937 independent native-donor runes. Freeze and decode p26 (265 runes). The objective is invariant under any fixed output bijection, so its exact full-family maximum covers those as well, though the recovered candidate uses only an affine map. Both native plants are disjoint 1,021-rune windows of the same 2,979-rune pinned donor with independent fixed IVs, all five nonzero coefficients, and affine output.

| Input | Training equal pairs / IoC | Frozen p26 equal pairs / IoC | Selected polynomial h |
|---|---|---|---|
| Native plant 1 | 16917 / .0600692 | 2068 / .0591195 | 19,7,24,16,12 |
| Native plant 2 | 17219 / .0611416 | 2168 / .0619783 | 8,27,5,3,21 |
| Original | 10642 / .0377878 | 1257 / .0359348 | 17,25,20,2,7 |

Both controls recover every coefficient, affine map and all 751+265 runes exactly (two times). Original a=27,b=22, gibberish on both intervals. Every original candidate family member is bounded: the retrospective whole-corridor exact maximum is **18,854 equal pairs / .0365657** (h=[2,14,6,15,11]), below the **minimum 30,610 / .0593654** among every one of the 1,964 length-matched 1,016-rune windows of the pinned solved native tape. Likewise original training 10,642 is below the minimum 16,273 in all 2,229 matched training windows. Windows overlap and are descriptive native-register controls, not independent null trials.

**Disposition:** retire this full stationary two-history quadratic direct-plaintext family for the source p23–26 corridor under ordinary GP language. No need to repeat individual mixed quadratic coefficient cases. This is a mathematical maximum for all coefficients (and arbitrary fixed output relabeling) conditional on the native comparison, not a universal exclusion of nonlinear/stateful systems. No new authenticated key or plaintext. An independent source instruction is required before changing histories or increasing degree.

[C++17/OpenMP solver](../sims/lp2_quadratic_lag15_allkey.cpp) · [source-input runner](../sims/lp2_quadratic_lag15_allkey_sft.cjs). Local GCC -O3 -march=native, four threads, original 4.27s, plants 5.11s/4.22s; verified exact source GP-index FNV64 fingerprints b7c5e1f8758c70d8 (original), fc20de89018c27f3 (native). No Windows/CI execution claim. Input source blob identities unchanged; first/last donor windows excluded from unigram training. Commits 7dce45e5, d3f116b3.

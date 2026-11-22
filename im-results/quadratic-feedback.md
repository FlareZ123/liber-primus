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

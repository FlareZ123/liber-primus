# Exact Fibonacci-recursive inverse: blind key recovery on p16–22

Agent 5, 2026-11-24. A distinct recursive receiver of p15's solved Fibonacci-indexed-prime spiral is tested as a cipher hypothesis; the source does not authenticate this receiver. Unlike the earlier Fibonacci *key* recurrence in which plaintext feedback cancels algebraically into ciphertext sums, this model has a two-symbol recursive **decoded-output** state and two unknown feed-forward ciphertext coefficients.

## Model and complete search

Over GF(29), define

```
Q_i = Q_(i-1) + Q_(i-2) + C_i + u*C_(i-1) + v*C_(i-2)
P_i = a*Q_i + b
```

with C_(-1)=C_(-2)=0, arbitrary Q_(-1)=x, Q_(-2)=y, arbitrary u,v,b, and nonzero a. The p15 Fibonacci coefficients motivate the fixed recursion (1,1); its first two red-origin reduced values (22,21) are a plausible initial pair, but the exhaustive test grants **all 841** initial pairs, not merely those values. Every input plaintext has a unique forward inverse for fixed key; use Q_i=a^-1(P_i-b) and solve the displayed triangular equation for C_i. An additive constant in the Q recurrence can be absorbed by translating the Q state and b, so the family also covers constant bias.

Linearity separates the forced solution into three driven basis sequences and two homogeneous initial-state sequences. The exact search evaluates all 29^4=707,281 normalized (u,v,x,y) tuples using precomputed partial projections and integer collision counts, sum_s choose(n_s,2). No stochastic optimizer or early stopping. The objective is invariant under arbitrary fixed output alphabet permutations. Fit (a,b) by exhaustive native unigram log likelihood over 812 affine maps *after* selecting the training key; independent prior for each native plant excludes its respective 1,744-rune plaintext window.

## Original and planted results

Train p16–20 (1,340 runes), freeze all six recovered parameters, predict p21–22 (404). Use two distinct keys and first/last 1,744-rune windows from the 2,979-rune solved-native source (the plaintext windows overlap by 509; their fitted priors are disjoint from their respective windows). All ciphertexts exactly re-encode, without adjusting the heldout state.

| Input | Best training equal pairs | Train IoC | Heldout IoC | Recovered (u,v,x,y,a,b) |
|---|---:|---:|---:|---|
| Native plant 1 | 54,312 | .0605397 | .0593077 | 9,16,22,21,13,4 |
| Native plant 2 | 55,151 | .0614749 | .0658305 | 4,27,6,17,24,17 |
| Original | 32,178 | .0358677 | .0344201 | 12,9,12,8,27,3 |

Both controls recover their exact keys and every rune, including **808 withheld positions**. The original fitted output has 29/318 and 3/82 dictionary matches across training and holdout, but 0/115 and 0/36 complete words of length >=5 under the pinned 29,060-entry GP lexicon. No readable candidate, e.g. XCLYDEEAGAEMOYS XYUXSNGHA P IAIAWT XIAUI IR DRI HWM.

More decisively a separate full-length original exhaustive search achieves maximum **54,269 equal pairs**, IoC .0357057, at normalized key 25,23,1,1. All 1,236 contiguous 1,744-rune windows of the native donor have at least **91,900 equal pairs**, IoC .0604647. All 1,640 windows of training length have at least 54,128 equal pairs (vs original 32,178). Therefore **every** normalized key in this Fibonacci-recursive family, even followed by an arbitrary fixed bijective alphabet map, falls below the finite native plaintext control range. It does not exclude other feedback denominators, nonlinear/time-varying state, or a different plaintext register.

## Reproduce

- [Exact C++17/OpenMP solver](../sims/lp2_fibonacci_iir_allkey_recovery.cpp)
- [Source-driven Node SFT](../sims/lp2_fibonacci_iir_allkey_recovery_sft.cjs)

The core actually ran locally with GCC -O3 -march=native and four OpenMP threads using canonical source digit streams, weighted fingerprints original 21274367, donor 55392254. Lexical counts were calculated directly from the repository source and dictionary. The wrapper reconstructs these exact inputs from the repository and asserts the output. No Windows or CI execution claimed. No authentic unknown-page plaintext/key recovered. Retire this fixed-denominator model rather than perform new guessed initial-state or affine-map sweeps.

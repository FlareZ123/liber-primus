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


## Extension: all stationary second-order linear affine recurrences

Rather than guess further Fibonacci-like sequences, the same recovery idea was generalized to **every** pair of recurrence coefficients:

```
Q_i = A*Q_(i-1) + B*Q_(i-2) + C_i + u*C_(i-1) + v*C_(i-2) + d
P_i = a*Q_i + b
```

All arithmetic is GF29; the current ciphertext coefficient is normalized to 1, with its original nonzero scale absorbed into the state and output parameters. The initial decoded states x,y are arbitrary; the section begins with zero ciphertext prehistory C_(-1),C_(-2). The inverse is triangular and bijective for fixed parameters and a≠0.

**Reduction without losing any plaintexts.** If A+B≠1, translate Q by a constant t=d/(1−A−B) to absorb d into the initial states and output bias. If A+B=1, a constant translation preserves d and allows y=0. Thus each nonzero-B coefficient pair has 841 normalized state/bias choices. For B=0 the second initial state is irrelevant; when A=1, the first initial state can also be absorbed into the output translation, leaving d arbitrary. Each zero-B pair needs at most 29 state choices. There are 841 feed-forward coefficient pairs for every denominator. The exact normalized search therefore visits

29×841×29 + 812×841×841 = **575,019,453** candidate tuples (some have identical projections because of cancellations).

The collision objective is invariant under any fixed output bijection, not just affine maps. For each denominator, the solver precomputes the zero-state driven response and two homogeneous/bias basis responses, then searches the finite Cartesian product by integer collision counts. The previously executed (A,B)=(1,1) original-training search is reused exactly, so the new original run visits **574,312,172** tuples; together they cover the stated family. The independent control executes all 575,019,453. The standalone wrapper defaults to a fresh full search rather than requiring cached results.

| Input | Training runes | Max equal pairs | Training IoC | Heldout IoC |
|---|---:|---:|---:|---:|
| Independent native bias-branch plant | 600 | 10,852 | 0.0603895 | 0.0552764 |
| Original p16–20 | 1,340 | 32,587 | 0.0363236 | 0.0350957 |
| Minimum of all 1,640 equal-length authentic native windows | 1,340 | 54,128 | 0.0603346 | — |

The control specifically exercises the singular A+B=1 bias branch. Its nine planted parameters (A,B,u,v,x,y,d,a,b)=(7,23,14,3,9,0,11,19,4) are exactly recovered from 600 ciphertext runes plus the separate donor unigram prior. The frozen inverse recovers all 200 held-out runes, and all 800 forward-reencode. The original optimum is (5,3,9,0,2,24,0,3,10), with the affine map fitted only on training. It produces 27/318 dictionary matches on training and 5/82 on the frozen p21–22 continuation, but **0/115 and 0/36 words of at least five runes**. Sample: LALPAHRUAIIYA EIOLIHAET F HBCBA POEEOHP RY OENGC. Exact original ciphertext forward replay is automatic and does not establish authenticity.

**Decision:** every stationary second-order affine recursive inverse with the stated section initialization and a nonzero current-ciphertext coefficient lies below the native collision range on p16–20, even with an arbitrary fixed alphabet relabeling. This is an all-key finite-family exclusion conditional on the native plaintext reference range, not an unconditional theorem about the true LP2 language. It does not include longer or nonstationary recurrences, arbitrary extra forcing, or arbitrary pre-section ciphertext in the degenerate first-order boundary case. There is no reason to repeat a coefficient, IV or bias sweep of this family.

[General C++ solver](../sims/lp2_order2_allkey_recovery.cpp) and [source-driven Node SFT](../sims/lp2_order2_allkey_recovery_sft.cjs). Actual local GCC -O3 -march=native OpenMP execution: 104.5 seconds for the complete independent control, 223.6 seconds for the new original search (four threads). Same source fingerprints as above. No Windows/CI run claimed. No new authentic plaintext or key.

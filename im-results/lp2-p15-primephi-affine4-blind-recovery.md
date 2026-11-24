# LP2 p15: blind recovery of a prime-totient / affine four-register hybrid

Agent 7, 2026-11-24. This is a new, solution-capable exact attack, not an authenticated identification of the cipher.

## Model

For the p15–22 chapter, consider C_n = P_n + K_n mod 29, with
K_n = b*(prime[n]-1) + R_n mod 29 and
R_(n+4) = a0 R_n + a1 R_(n+1) + a2 R_(n+2) + a3 R_(n+3) + d.
The public prime-minus-one sequence is motivated by the solved p56, and the four-register candidate by p15's 4x4 graphic. Neither establishes that the hybrid was used. This particular clock advances on every rune, without an F skip. Both physical p15 start (global offset 3603) and its red rubric (3612) are tested independently.

For each of the 29^4 = 707281 tap tuples, the affine recurrence becomes homogeneous of degree five via multiplication of its characteristic polynomial by X-1. The five free initial residual symbols plus unknown prime coefficient b give six linear state variables. Eighteen original isolated one-rune words in p15–22 impose P in {A,I,O} = {24,10,3}. Incremental modular row reduction admits at most 3^6 assignments on independent observation rows; dependent rows check every compatible assignment. A rank-deficient row system does not cause an exclusion unless its observable assignment set is empty. Thus every secret initial state, affine constant and prime multiplier is included.

## Actual ciphertext result

| Clock origin | Tap tuples | Surviving tuples | Last elimination |
|---|---:|---:|---|
| physical p15 (3603) | 707281 | 0 | singleton 15 |
| red rubric (3612) | 707281 | 0 | singleton 15 |

For red rubric, the elimination counts by singleton 3..15 are 4,13,36,410,2583,20305,311184,319720,47409,5036,492,84,5. For physical p15, singleton 4..15 counts are 10,116,371,2568,18571,306033,324299,49369,5301,588,51,4.

This excludes the entire specified hybrid for each origin **conditional on the ordinary A/I/O interpretation of the original singleton words and the stated unskipped clock**. It does not exclude nonlinear state evolution, another clock, other singleton interpretations, or a different cipher family. No original plaintext recovered.

## Blind planted recovery

The 1894-rune source-shaped control uses a repeated native p57 plaintext tile with its 18 singleton positions adjusted to A/I/O. The hidden key was taps (3,7,2,9), five residual initials (5,12,14,3,27), b=11. The same complete tap search recovered exactly one polynomial and one six-variable state, matching these hidden values, with 1894/1894 exact plaintext runes. Only the 18 singleton ciphertext constraints entered key recovery; 1876 rune positions were withheld. This demonstrates actual key recovery when this family is correct, not a claim that the control is authentic unknown LP2.

## Reproduction

`sims/lp2_primephi_affine4_singleton_original_sft.cpp` (C++17). Default execution parses the original transcription and checks the exact singleton coordinates before running both origins. `--plant` executes the blind control; `--snapshot 3612 0 29` and `--snapshot 3603 0 29` use the embedded exact source singleton observations. The latter two modes and the blind planted mode were compiled and executed locally, each full sweep taking about 6.4 seconds. No CI run is claimed. Source observations were extracted from the repository transcription and checked against its GP corpus.

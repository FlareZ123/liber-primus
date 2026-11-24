# #2603 — ciphertext-only period identification with latent plaintext-F pauses

**Decision:** The frozen calibration failed. Retire this particular marginal pairwise estimator; the original target was not scored. Authentic exact periods selected 1/2; synthetic primitive periods selected correctly 10/12; wrong selected periods 0/12; nonperiodic pad false selections 0/12. No unknown LP2 plaintext or key was recovered.

## Distinct attack

The earlier #2521 exact collision bounds test fixed periods 8 and 13, while #2520 estimates digits given a known period. This method attempts to select an unknown consuming period directly from ciphertext and never deletes all visible F. For two nonzero ciphertext endpoints at physical distance d with m intervening zero runes, the active distance is d−h for h latent transparent holds. With a fixed approximate independent Bernoulli hold prior 0.4 conditional on visible F, compute w_q(d,m)=sum over h of Binomial(m,0.4) probability for d−h divisible by q. Endpoints necessarily consume under the authentic mechanism. The independence approximation is not a theorem about the real posterior of F positions.

The feature is the same-phase GP29 difference likelihood ratio minus one. Estimate the native non-F unigram distribution from 596 solved runes, excluding both authentic targets and the two largest native sections. Under an averaged uniform additive shift and independent plaintext endpoints, condition on both ciphertext endpoints being nonzero (factor 28/29 for zero difference and 27/29 otherwise). Divide this difference distribution by the difference distribution of independent uniform nonzero ciphertext symbols. Standardize the covariance of the resulting difference feature with the phase weights, across all nonzero endpoint pairs with physical lag ≤96. This scores evidence for a phase structure, not a recovered key or an exact likelihood for a complete ciphertext.

Scan q=2..24. Multiplicity and dependent pair effects are addressed empirically by 99 permutations of the nonzero symbols, preserving all zero positions and the ciphertext histogram; each permutation contributes its maximum across all 23 periods. Select only if the observed maximum exceeds all 99 maxima and its lead over the runner-up is ≥0.75 in score units. The permutation reference is conditional exchangeability, not an exact test for every nonperiodic language-derived cipher. Independent random consuming-pad plants additionally test false selections. Multiples and divisors compete in the same ranking.

The full contract was frozen in [issue comment 7134131437](https://github.com/FlareZ123/liber-primus/issues/2603#issuecomment-7134131437): exact authentic controls both select their true period; at least 9/12 separately seeded primitive-key plants select correctly, zero wrong selections, at most 1/12 nonperiodic pad selections. Only after this gate may the first 840 runes of physical p33–39 be scored; the remaining 840 are kept for a key continuation, and already retired scopes do not advance.

## Actual controls

Exact forward replay of the source WELCOME and second KOAN ciphertexts precedes scoring. Secret random primitive keys (3,5,7,9,11,12,15,17,19,21,23,24), 319/515/840-rune contiguous donor windows, and nonperiodic random pads are generated from pinned Shakespeare/Emerson/Gibran texts with deterministic seeds. The estimator is not given the period, key, plaintext, hold positions or word lengths.

| Control | n | True q | True rank | Top q | Score | Gap | Max null | Selected |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| WELCOME | 515 | 8 | 2 | 4 | 6.227 | 0.959 | 4.473 | 4 |
| KOAN | 319 | 13 | 1 | 13 | 10.737 | 9.274 | 5.253 | 13 |
| Shakespeare-138213 | 319 | 3 | 1 | 3 | 6.377 | 3.804 | 3.395 | 3 |
| Shakespeare-138100 | 515 | 5 | 1 | 5 | 4.158 | 1.484 | 3.259 | 5 |
| Shakespeare-137855 | 840 | 7 | 1 | 7 | 11.098 | 4.401 | 3.618 | 7 |
| Shakespeare-138200 | 319 | 9 | 1 | 9 | 5.824 | 1.980 | 4.407 | 9 |
| Emerson-204743 | 515 | 11 | 1 | 11 | 7.884 | 4.402 | 3.314 | 11 |
| Emerson-204554 | 840 | 12 | 1 | 12 | 8.522 | 2.773 | 4.080 | 12 |
| Emerson-204831 | 319 | 15 | 1 | 15 | 4.129 | 1.557 | 4.187 | abstain |
| Emerson-204724 | 515 | 17 | 1 | 17 | 3.883 | 3.266 | 3.357 | 17 |
| Gibran-39137 | 840 | 19 | 1 | 19 | 10.257 | 8.771 | 3.570 | 19 |
| Gibran-39474 | 319 | 21 | 1 | 21 | 4.097 | 0.658 | 4.563 | abstain |
| Gibran-39338 | 515 | 23 | 1 | 23 | 5.247 | 3.388 | 3.646 | 23 |
| Gibran-39134 | 840 | 24 | 1 | 24 | 6.336 | 2.708 | 3.786 | 24 |

### Nonperiodic controls

| Control | n | True q | True rank | Top q | Score | Gap | Max null | Selected |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Shakespeare-independent-pad-138213 | 319 | none | — | 11 | 1.873 | 1.118 | 4.192 | abstain |
| Shakespeare-independent-pad-138100 | 515 | none | — | 23 | 1.509 | 0.252 | 4.388 | abstain |
| Shakespeare-independent-pad-137855 | 840 | none | — | 17 | 1.642 | 0.206 | 3.127 | abstain |
| Shakespeare-independent-pad-138200 | 319 | none | — | 7 | 2.391 | 0.427 | 4.291 | abstain |
| Emerson-independent-pad-204743 | 515 | none | — | 3 | 1.731 | 0.084 | 3.124 | abstain |
| Emerson-independent-pad-204554 | 840 | none | — | 8 | 1.654 | 0.194 | 3.884 | abstain |
| Emerson-independent-pad-204831 | 319 | none | — | 16 | 1.524 | 0.388 | 3.306 | abstain |
| Emerson-independent-pad-204724 | 515 | none | — | 21 | 2.201 | 0.607 | 3.588 | abstain |
| Gibran-independent-pad-39137 | 840 | none | — | 15 | 2.382 | 1.156 | 3.671 | abstain |
| Gibran-independent-pad-39474 | 319 | none | — | 16 | 1.089 | 0.034 | 3.939 | abstain |
| Gibran-independent-pad-39338 | 515 | none | — | 22 | 2.271 | 0.970 | 3.629 | abstain |
| Gibran-independent-pad-39134 | 840 | none | — | 22 | 1.840 | 0.289 | 3.758 | abstain |

The WELCOME key has repeated values across phases: the score ranks divisor 4 above true period 8 (6.227 versus 5.268), with period 2 third. This is a concrete harmonic misidentification, not a failure to detect any periodicity. All 12 synthetic true periods rank first, including the two abstentions. The donor windows within each author overlap substantially because adjacent xorshift seeds produce nearby start offsets. These trials are finite separately seeded key/pad controls, not 12 independent draws of prose; do not attach binomial confidence intervals to their counts. A future independent harmonic discriminator would need separately frozen controls, including keys with deliberate repeated digits, before original use.

## Original decision

The predeclared calibration did not authorize original testing. No claim is made about the actual LP2 period. A different estimator would need independent fresh calibration; changing thresholds or reusing this test set to select an algorithm is not justified.

Reproduce from repository root: `node sims/lp2_latent_f_period_marginal_estimator_sft.cjs`. [Raw output](lp2-latent-f-period-marginal-estimator.json). Executed in connected V8 using repository-native data; independent CI replay is not claimed.


## Independent successor (Agent2)

The pairwise estimator above remains retired. A distinct soft-phase EM + fixed-key hardening method, using an independent primitive-normalized control gate, identifies WELCOME's true period and recovers both genuine exact keys. The frozen p33–39 first840 original test rejects its selected q2 (soft heldout gain −0.005617; no legal hardened key), so the second840 is not scored. [Consolidated successor report](lp2-latent-f-soft-phase-period.md). No original plaintext/key.

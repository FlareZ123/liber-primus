# Affine ciphertext feedback: consecutive and lag-five/six inverses

**Classification:** exhaustive original-GP29 key searches for specified three-tap finite decoder families, with authentic-source planted-key recovery and disjoint physical-page test sets. No LP2 plaintext, key or cipher mechanism was recovered.

## Research question

Could an unknown *local linear-feedback mechanism*, using several recent ciphertext runes rather than a single autokey, directly recover ordinary Gematria-Primus/English plaintext?

The original consecutive-lag experiment exhaustively evaluated each order r = 1, 2, 3:

```
P_i = C_i - a1*C_(i-1) - ... - ar*C_(i-r)  (mod 29),
a1,...,ar in {0,...,28}.
```

The calculations treat the 55 rune-bearing LP2 pages as separate sequences and omit their first r positions to avoid inventing start states. Every possible coefficient vector with lag <= 3 is included exactly once by requiring the final coefficient to be nonzero except for the order-1 family, which includes zero. The total distinct vectors searched is **29^3 = 24,389**. An arbitrary nonzero multiplier on C_i and a constant output shift cannot change index of coincidence, so the IoC search also covers their affine-equivalent kernels.

**Scoring:** for each candidate, transform all available runes and compute the decoded index of coincidence I = Σ_s n_s(n_s−1)/[N(N−1)]. Search criterion is maximal I. This catches natural-language plaintext with nonuniform rune frequencies while remaining independent of a specific word list. It cannot recognize uniformly distributed intermediate codes.

## Consecutive-lag source results

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

## Motif-selected distant feedback: lags 5 and 6

The ciphertext's separately documented five-back and six-back echoes motivate a distinct *direct* decoder that the consecutive-lag scan does not include. On the same authentic GP29 ordinal alphabet, we exhaustively test

```text
P_i = C_i - a*C_(i-1) - b*C_(i-5) - d*C_(i-6) (mod29)
a,b,d in {0,...,28}.
```

For the **lag-(5,6)** family set a=0 and test all **841** key pairs. For **lag-(1,5,6)** test all **24,389** triples, including the first family; the models are stationary with no unknown nonlinear transform, skipped key steps, or collision repairs. We independently test history reset on each physical rune page and history continuous across the full unsolved rune stream. The first six source positions of each page (or of the continuous stream) are withheld from scoring; all 55 rune-bearing original LP2 pages contribute. Select each key from physical pages **0–27** only and measure the frozen inverse on pages **28–55**. A single IoC criterion is used throughout; an additive plaintext constant or nonzero multiplier cannot change IoC.

| Scope | Models | Training runes | Held-out runes | Best training (a,b,d) | Training IoC | Frozen held-out IoC |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| Page-local, taps 5/6 | 841 | 6,593 | 6,033 | (0,3,25) | 0.034646374 | **0.034526506** |
| Continuous, taps 5/6 | 841 | 6,755 | 6,195 | (0,3,25) | 0.034635965 | **0.034517614** |
| Page-local, taps 1/5/6 | 24,389 | 6,593 | 6,033 | (1,0,0) | 0.035272728 | **0.035418703** |
| Continuous, taps 1/5/6 | 24,389 | 6,755 | 6,195 | (1,0,0) | 0.035276823 | **0.035405505** |

The selected three-tap winner **(1,0,0)** is the already documented first-difference anti-doublet signature. With that coefficient vector set aside, the strongest page-local genuine multi-tap selection, **(12,7,21)**, scores only **0.034704541 training** and **0.034455609 heldout**, essentially 1/29. Thus adding both source-motivated delayed taps does not expose a recovered GP-English plaintext.

**Fully invertible original-layout positive control:** Encode a separate 12,956-rune wordwise-GP English excerpt from the independently pinned Shakespeare text beginning after character180,000. Encrypt the exact original physical page sizes with true secret triple **(7,11,19)** and six transparent starting IVs on every page. The search recovers the exact secret triple at **rank 1 of 24,389**, with training IoC **0.059588244**, and decrypts and forward re-encrypts **all 12,956 runes exactly**. This demonstrates the search's detection power against the stated direct feedback construction, using source text that is independently unrelated to original LP2.

The authentic original flat heldout scores provide a finite model-family negative, with the same plaintext-register limitations as the historical consecutive-lag search. The original ciphertext has not been deciphered, and the test leaves hidden changing state, compressed or binary intermediates, and additional nonlinear output layers open.

Exact CommonJS implementation: [sims/affine_156_feedback_inverse.cjs](../sims/affine_156_feedback_inverse.cjs). [Successful manually dispatched source-original GitHub Actions run 42837751879](https://github.com/FlareZ123/liber-primus/actions/runs/42837751879).

## Cross-test using independently observed prime-valued clauses

Solved original Cicada pages have a source-authenticated, **historically selected** property: 13 of 16 literal printed clauses in three [solved reference segments](author-native-prime-clause-discriminator.md) have **prime** sums of their GP-prime rune values. It provides a second scoring axis for a candidate plaintext, independently of English unigram frequency. This is a conditional authorship cue, with an unresolved assumption that the original full-stop punctuation and clause structure remain in the unknown ciphertext.

Use the **175 nonempty printed full-stop-delimited clauses** in the original LP2 transcription, preserving physical-page wraps. For each of the **24,389** keys in the same lag-(1,5,6) GP29 family, calculate the GP-prime sum of every inverse clause. In the page-reset version, the first six runes of each page are explicitly treated as transparent initialization symbols; in the continuous version the first six runes of the book are transparent. Keys are selected on only the **first 88 clauses**, with all **87 remaining clauses** frozen as a separate validation. Count primality using an exact integer sieve.

| Original-cipher reading | Untransformed original | Training-max selected key (a,b,d) | Selected training prime clauses | Unseen heldout prime clauses | Maximum whole-book prime clauses in any model |
| --- | --- | --- | ---: | ---: | ---: |
| Page-local feedback | 28/175 | (26,24,27) | **29/88** | **11/87** | **40/175** |
| Continuous feedback | 28/175 | (14,12,2) | **27/88** | **14/87** | **41/175** |

The training primes are upward-selected by 24,389 candidate keys; their heldout primes have no plausible resemblance to the selected solved-page **13/16** signature. The original candidate key and forward cipher remain unrecovered.

**Positive true-plaintext/key control:** Encode **12,956 genuine independent Shakespeare GP runes** with the exact manuscript page sizes and clause lengths, adjusting only **155 of 12,956 rune positions** to give **172/175** prime-valued clauses, one rune per clause at most. Encrypt using the previously selected independently hidden key **(7,11,19)** and six transparent starting IVs. Exhaustively screen all 24,389 keys using the first 88 clauses. The exact true key is **unique rank 1**, scoring **87/88** prime-valued training clauses and **85/87** completely unseen heldout clauses; all 12,956 planted symbols roundtrip exactly under the same cipher. This positive demonstrates a stringent prime-sum discriminator for the specified author-like source control without presuming that the unknown author used this property everywhere.

The original is incompatible with a **strong clause-prime property** and this fixed affine cipher jointly. It is possible that LP2 clauses are not prime-valued, that printed full stops or page initials do not retain plaintext semantics, or that an encrypted intermediate hides the direct GP field. This test adds no plaintext. The [exact script](../sims/affine_156_native_prime_clause.cjs) and [successful combined GitHub Actions run 42839416871](https://github.com/FlareZ123/liber-primus/actions/runs/42839416871) preserve the full model selection and planted-key calibration.

## Reproduction

- [Exact implementation](../sims/affine_feedback.py), using pinned sources from [the shared corpus parser](../sims/homophonic_information_bound.py)
- [Successful on-demand GitHub Actions run 42739449534](https://github.com/FlareZ123/liber-primus/actions/runs/42739449534)
- Python 3.12, NumPy 2.3.5, no stochastic components in the observed-data sweep. Synthetic null uses seed 3301. Input checksums are validated before decoding.

## Interpretation and limits

Neither the complete **24,389 consecutive-lag coefficient family**, nor the separately complete **24,389 lag-(1,5,6) family** (containing the **841 lag-(5,6) keys**) generates the distinctive source-language IoC concentration on the original unknown LP2 rune pages. The new latter family is explicitly checked in both page-local and continuous causal scopes with a fixed unseen original physical-page half. These source-conditioned exclusions concern affine GP29 ciphertext feedback; the independent prime-clause discriminator corroborates the absence of an author-like direct GP plaintext in that family, under its additional original punctuation and six-initial-symbol assumptions. They do not establish the manuscript's actual encryption method.

Nonlinear feedback, unobserved plaintext-conditioned or evolving key states, output collision repair, different alphabets or binary/compressed intermediate registers, other nonconsecutive tap choices, and external running keys remain open.

Related prior exclusions of **single-lag arbitrary ciphertext-selected alphabet tables** are in [Wulfic's LP2 logic findings §10, C12](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/findings/lp2_logic_findings_2026-09-29.md). This experiment targets the **multi-tap linear combination** absent from that one-lag family.

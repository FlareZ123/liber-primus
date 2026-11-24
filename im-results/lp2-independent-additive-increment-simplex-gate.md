# LP2 stationary independent additive increments: original-input simplex gate

Director [#2484](https://github.com/FlareZ123/liber-primus/issues/2484) · [Read-only CJS reproducer](../sims/lp2_independent_additive_increment_lp_sft.cjs)

## Decision

Under unchanged original rune positions and word-boundary semantics, one shared stationary increment law independent of comparable native GP plaintext differences is inconsistent with both training and untouched-chapter adjacency counts. This is a **conditional finite-control rejection**, not an exclusion of every additive cipher or all English. No unknown plaintext, actual key or historical cipher was recovered. Prioritize a source-constrained state-dependent or cross-symbol mechanism, rather than fitting another stationary independent increment distribution.

## Why this test excludes every key distribution in the stated model

Let (C_i=P_i+K_i\pmod{29}), (d_i=P_i-P_{i-1}), (e_i=K_i-K_{i-1}), and (z_i=C_i-C_{i-1}). If the increment distribution (q) is independent of plaintext differences and common to strata (s), the necessary relation is

\[
D_{C,s}(z)=\sum_{k=0}^{28}D_{P,s}(z-k)q_k,
\qquad q_k\ge0,\quad\sum_kq_k=1.
\]

For ordinary within-word and ordinary across-word strata with original counts (N_s), the predicted weighted equality count is a linear function (\sum_k q_k\sum_s N_s D_{P,s}(-k)). Its exact minimum over the entire probability simplex is the smallest of the 29 coefficients. This is a closed-form linear program: if even its most favorable vertex predicts too many equalities, all 29-bin convolution fits fail at that necessary coordinate. No noisy Fourier division or fitted key search is needed. For independent draws of increments conditional on a fixed plaintext tape, the equality indicators are independent Bernoulli variables, potentially with different probabilities; a lower-tail Chernoff bound is (\exp[-nD_{KL}(z/n\Vert p_{\min})]) by concavity of the log MGF. Dependence between increments over time can invalidate this sampling bound.

## Original input

Canonical 58 pages plus native transcription, with runeless physical p50 explicitly inserted. Every physical page is checked rune-for-rune; newline and slash line breaks are carried, ordinary dashes mark words, punctuation and genuine 13-dot offsets are kept separate. 28 physical 13-dot events give 26 distinct cuts (coincident/end cuts); 25 interior transition positions are present in the full unknown tape.

| Frozen original region | Within-word (equal/total) | Ordinary across-word | Other major/printed punctuation | 13-dot |
|---|---:|---:|---:|---:|
| p0–39 training | 48/7479 | 16/2031 | 1/107 | 0/22 |
| p40–53 holdout | 14/2339 | 4/626 | 0/42 | 0/0 |
| p54–55 terminal | 1/242 | 2/64 | 0/0 | 0/1 |
| p0–55 continuous | 63/10060 | 22/2721 | 1/149 | 0/25 |

Whole source: 12,956 runes, 86 equal-adjacent events. The main LP uses 85/12,781 ordinary transitions (0.66505%); genuine marks and remaining punctuation are reported but not pooled into the rejection. The 306 ordinary terminal transitions alone are too few for a decisive test. The split discards a boundary transition between regions; full source is counted separately.

## Exact simplex minima with frozen native donor histograms

Greedy published GP29 transliteration of the repository's historical Crowley and Blake sources gives 21,611 and 18,631 runes. The deduplicated editorial LP reference gives 2,851 runes, and authentic clear p57 gives 95. The latter is exact source-native, but many difference bins are empty and it cannot independently constrain the law.

| Native donor | Train minimum vs 64 | Holdout minimum vs 18 | Whole-book minimum vs 85 |
|---|---:|---:|---:|
| Crowley | 150.30 | 46.69 | 201.80 |
| Blake | 145.30 | 45.11 | 195.05 |
| Editorial LP | 127.70 | 39.83 | 171.65 |

Minimizing increment is 11 for both literary controls and 22 for the editorial reference; these are extremal statistical vertices, **not recovered key digits**. Fixed empirical whole-book Chernoff bounds are 9.09e-20, 4.56e-18 and 1.53e-12 respectively under the declared iid law and donor frequencies. The two historical texts are finite controls, not the true unknown plaintext.

## Finite-donor uncertainty and untouched chapters

A simultaneous empirical absolute max-t bootstrap sensitivity band over 4 frozen source-region weightings × 29 shift coefficients uses 3,000 deterministic block resamples per donor and block size 128, 256, 512, 1024. Complete contiguous rune blocks retain within-block dependence; transitions are assigned to their ending block. The lower edge for each coefficient is taken before the simplex minimum. This is a 99% empirical bootstrap band, not a distribution-free 99% guarantee for arbitrary prose. It is deliberately simultaneous over shifts, so the favorable increment cannot be selected after seeing a noisy coefficient.

Across both historical donors and all four block sizes:
- Training: lower minima **110.996–115.788**, observed 64; conditional tail bound ≤ 6.97e-6.
- Untouched p40–53: lower minima **34.617–36.104**, observed 18; conditional tail bound ≤ 0.007502.
- Whole unknown book: lower minima **149.187–155.618**, observed 85; conditional tail bound ≤ 6.61e-8.

Do not combine those conditional tail bounds with bootstrap uncertainty as an unconditional p-value. All tested uncertainty choices leave the same model decision. No parameters were fitted from the unknown source to derive the law. The already-known unusual adjacency deficit motivated the test; p40–53 is held out from parameter fitting, not an untouched discovery dataset.

## Controls and rival

The script first exactly replays all 85 authentic solved p56 runes using successive prime-minus-one offsets with F bypass and no advance on plaintext F. Then it enciphers 12,956-rune native donor prefixes using known periodic DIVINITY shifts, the direct continuous prime-minus-one schedule, iid uniform increments, and constant increment 11 (the most favorable vertex). All synthetic additive inverses recover the complete plaintext exactly. The direct periodic/prime controls do not purport to model every deterministic phase alignment or F-transparent clock. Actual F bypass explicitly violates the stated independent-increment premise.

| Control | Crowley equal/ordinary | Blake equal/ordinary |
|---|---:|---:|
| Plain | 416/12521 | 396/12715 |
| DIVINITY periodic | 448/12521 | 483/12715 |
| Continuous prime offsets | 411/12521 | 396/12715 |
| iid uniform increments | 407/12521 | 400/12715 |
| Constant increment 11 | 199/12521 | 196/12715 |
| Adaptive permuted delta, X→0 | 17/12521 | 29/12715 |

For a concrete reversible adaptive rival choose a fresh keyed permutation of GP29 at each step that fixes the rare plaintext X to delta zero and maps all other symbols bijectively to the 28 nonzero differences. Set (C_i=C_{i-1}+\pi_i(P_i)\). Decode by (P_i=\pi_i^{-1}(C_i-C_{i-1})\). Both complete planted sequences invert exactly. This construction uses previous ciphertext and plaintext symbol identity to determine the delta, so its additive key increments are not independent of plaintext differences. It suppresses repeats while retaining all 29 plaintext symbols without a side channel beyond the permutation schedule. The original ordinary nonzero-difference Pearson statistic against equal off-zero counts is 40.295; the adaptive examples give 37.550 and 15.181. These are descriptive comparisons, not a source-selected decoder or a statistical identification of the actual mechanism. The adaptive controls have **too few** equalities relative to LP2, so they are a rival-family witness, not a fit. Do not tune their rare-symbol mapping or schedule to LP2 without an authenticated selector.

## Consequence and remaining uncertainty

Retire the common iid plaintext-independent additive increment model at this native-control scope. A source-selected plaintext-dependent clock, nonlocal state transform, correlated increments, non-prose transport, or a changed segmentation may escape the test. Small p57 alone is nonidentifying; the underlying unknown plaintext distribution has not been established. An arbitrary private adaptive schedule is also nonidentifiable: it can map different plaintext tapes to the same ciphertext. Further research should require an independently selected state update/key source and a prediction on authentic unknown material. Do not treat this conditional statistical exclusion or reversible synthetic control as a recovered cipher.

Reproduction: `node sims/lp2_independent_additive_increment_lp_sft.cjs` from repository root. The same JS study function was executed on the exact repository source strings in the tool runtime, including the 58-page source checks, p56 replay, planted inverses, and all block resamples. No CI workflow or external dependency was needed.

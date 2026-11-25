# LP2 stationary independent additive increments: original-input simplex gate

Director [#2484](https://github.com/FlareZ123/liber-primus/issues/2484) · [Read-only CJS reproducer](../sims/lp2_independent_additive_increment_lp_sft.cjs)

## Decision

Under unchanged original rune positions and word-boundary semantics, one shared stationary increment law independent of comparable native GP plaintext differences is inconsistent with both training and untouched-chapter adjacency counts. This is a **conditional finite-control rejection**, not an exclusion of every additive cipher or all English. No unknown plaintext, actual key or historical cipher was recovered. The #2870 extension below quantifies how much one-edge coupling is required and rejects the reversible zero-output transposition repair envelope for three historical nominal clocks, including literal-F variants. A source-selected different state law, representation or cross-symbol mechanism remains open; further marginal-only fits do not identify a cipher.

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


## New spacing-free extension: authentic F holds and every native donor window (Agent 8, 24 November)

The original simplex gate explicitly did not cover historical F interruption and conditioned on printed word boundaries. This extension removes both assumptions. Let consuming key symbols be K_j; a plaintext F emits literal F without consuming a key symbol. For each adjacent pair of non-F plaintext runes, both consume consecutive key symbols, so equality is exactly the event K_j−K_(j−1)=P_(i−1)−P_i mod29. Drop all adjacent pairs involving a plaintext F: their additional repeat count is nonnegative, so dropping them gives a valid lower bound. Also drop the exact original 54 physical-page boundary pairs, regardless of whether a reset occurs there.

For a fixed native plaintext tape and a plaintext-independent stationary marginal distribution q of consuming-key increments, the expected number of retained equalities is Σ_d h_d q_d, where h_d counts the negative plaintext differences on retained non-F pairs. Consequently the minimum over **all 29-bin probability laws** is min_d h_d. No printed spaces, word lengths, F positions in the unknown ciphertext, named book alignment or specific key distribution are required. For iid increments the retained equality indicators are conditionally independent because each retained pair uses a distinct increment. The lower-tail Chernoff bound is exp(−μ+z+z log(μ/z)) for z<μ, taking μ=min_d h_d. Correlated increments can invalidate the tail bound but not the expectation calculation.

[Standalone SFT](../sims/lp2_fhold_independent_increment_allwindows_sft.cjs) checks every contiguous native-GP donor window of the exact target length, using each original physical page cut as a dropped transition. The sliding histogram finds the global minimum over every window and all 29 increments; a brute witness recount verifies each selected minimum. Five trimmed source texts use the existing greedy GP orthography (including QU→CW, K/Q→C, V→U, Z→S, ING alias). The original full book contains 12,956 runes, 12,901 within-page opportunities and 86 total repeats. No original word boundaries enter the test.

| Donor | Native runes | Min expected retained non-F repeats (all LP2) | Conditional iid tail at 86 | p0–39 min vs65 | p40–53 min vs18 |
|---|---:|---:|---:|---:|---:|
| Gibran | 47,703 | 136 | 2.53e−5 | 94 | 19 |
| Shakespeare | 217,644 | 142 | 2.57e−6 | 100 | 20 |
| Emerson | 308,478 | 122 | 0.002664 | 79 | 20 |
| Crowley | 21,538 | 173 | 2.10e−12 | 121 | 29 |
| Blake | 18,751 | 169 | 1.53e−11 | 114 | 23 |

The exact adversarial constant-increment plants at those full-length minima produce total repeats 164,167,170,192,193 respectively, and replay all 12,956 plaintext symbols per plant using known keys and known hold masks. Seven source-native controls check the equality identity and exact inverse with an oracle mask; authentic p56 independently replays 85/85 with its prime-minus-one schedule. This is algebraic validation, not blind mask/key recovery.

**Decision:** the full-book repeat deficit disfavors even arbitrary stationary plaintext-independent additive increment distributions with genuine F interruption, without assuming printed word boundaries. The independent p40–53 comparison is weak under the deliberately worst-case donor-window minimization (best-case iid bounds 0.0893–0.9736). The chapter-local minima, including 0 on short terminal windows, are generally too small for a decisive chapter-private-law rejection. Do not combine expectation bounds as a probability under correlated schedules, interpret donor minima as universal English lower bounds, or claim a recovered key. The earlier stronger word-stratified bootstrap and holdout result remains separate. New contribution: exact spacing-free F-hold expectation bound and full-length empirical minima. No original plaintext recovered. [Complete JSON with source blob SHAs](lp2-fhold-independent-increment-allwindows-output.json). Executed on exact repository inputs in a JS runtime; no independent Windows CI claimed.


## Minimum coupling and reversible collision-repair decision — Agent48, Director #2870 (25 November 2026)

**New decision:** fixed-marginal statistical dependence can explain the repeat rate, but the minimal full-alphabet reversible repair family with the known DIUINITY, FIRFUMFERENFE or prime-minus-one nominal clocks fails the original long-group lexical gate even if its repair targets change arbitrarily at every position. No recovered unknown plaintext or authentic new key. This is distinct from #2484's independent-marginal simplex, Agent4's noninjective fixed-target postprocessor, stationary rank escape, and adaptive alphabet swap: here the output transposition repairs an otherwise additive **difference** encoder, with no private repair bit.

### Exact amount of coupling for independently fixed marginals

Use the same original ordinary-edge weights and the exact frozen native control encodings above. Write d for the plaintext difference and j=-e mod29 for the negative nominal shift increment, so equality is the diagonal d=j. Let p and q denote their marginal laws (p is the ordinary within-/across-word weighted donor marginal). The independent joint is B_ij=p_i q_j; its diagonal mass R=sum_i p_i q_i. The observed target is rho=85/12781 (whole) or 18/2965 (held-out p40–53). Any joint J with those marginals and diagonal mass <=rho satisfies TV(J,B)>=max(0,R-rho), by the variational definition of TV. Equivalently, an optimal joint coupling must change at least that fraction of independent pair draws. The binary event data-processing lower bound on mutual information is D_Bern(rho||R) bits when R>rho; it is not necessarily the exact minimum MI.

For delta=R-rho>0, this TV bound is attained whenever sum_i min(B_ii,delta/2)>=delta: choose removed diagonal masses a_i<=min(B_ii,delta/2) summing to delta; partition a circle of circumference delta into consecutive arcs of lengths a_i and shift by delta/2. Arc-overlap transport restores both marginal deficits without any self-overlap. Hence J changes only diagonal and off-diagonal masses by the necessary amount, preserves both marginals and has exactly TV=delta. Executed construction checks all marginal residuals, nonnegativity and TV. This is a sufficient certificate, not a claim of exact TV when the certificate fails.

Freeze q independently as uniform, cyclic consecutive GP shifts of the actual LP1 q8 and q13 keys, or the 83 consecutive increments from the first 84 prime-minus-one shifts consumed by authentic p56. The latter is an empirical nominal-clock distribution, not a claim of the same effective distribution on LP2.

| Native p | Uniform | DIUINITY | FIRFUMFERENFE | p56 nominal prime |
|---|---:|---:|---:|---:|
| Crowley | 2.783% | 2.966% | 2.441% | 2.636% |
| Blake | 2.783% | 3.036% | 2.726% | 2.384% |
| Editorial LP | 2.783% | 3.039% | 2.767% | 2.524% |
| Authentic p57 (small sample) | 2.783% | 3.875% | 3.017% | 1.804% |

Entries are **exact minimum TV for the finite pooled empirical marginals and whole-book target**, not observed changes to a recovered plaintext or a p-value. All displayed rows have a valid transport witness. For the two large donors plus editorial LP, the corresponding binary MI lower bounds are 0.02021–0.02805 bits/edge and heldout minimum TV is 2.442–3.097%. The 95-rune p57 estimate is unstable, especially at sparse differences. Pooling the within/across-word strata relaxes any requirement to maintain separate marginals by stratum; the result is a lower bound for a more restrictive model. With no fixed q at all, the previous simultaneous block-bootstrap lower minima (149.187–155.618 expected equalities for historical donors) imply a conservative conditional TV lower bound (149.187–85)/12781=0.502% to (155.618–85)/12781=0.553% across the reported block settings; this is an empirical sensitivity calculation, not a distribution-free interval or a deterministic sample guarantee. The expectation theorem holds regardless of temporal correlation if one-edge independence holds; the old iid tail bound does not.

### A causal sender and what the minimum means

Changing only zero nominal outputs loses injectivity on the complete 29-symbol alphabet: the unchanged 28 nonzero output images already occupy every nonzero symbol. A reversible local row can change the repeat preimage from d0=-e to d1 by transposing nominal output 0 with t=d1+e. It must also alter the old preimage of t. For a decoder-known previous plaintext a and nominal e, define z=d+e mod29, exchange 0 and t (t=0 means identity), then emit C_i=C_(i-1)+z' mod29. The decoder applies the same transposition and subtracts e, then adds previous plaintext. Arbitrary known state may choose t; all 29^3=24,389 local combinations round-trip. With literal-F holds, F emits 0 and does not advance the consuming states; the same transposition applies to the consecutive consuming stream. A consuming output may also be zero. This candidate is motivated by the repeat deficit and authentic additive clocks, not authenticated as a Cicada operation.

For each (a,e), switching from old repeat preimage d0 to new d1 reduces conditional repeat mass by P(d0|a)-P(d1|a), and changing at least both preimages costs P(d0|a)+P(d1|a). The transposition attains this local bound. The least-frequent d1 dominates other alternatives in reduction and override cost per unit reduction; fractional allocation across (a,e) by increasing cost/gain solves the relaxed expected override minimization, allowing a public random decision in the final fractional state. The empirical controls have zero-count conditional cells, so the minimum equals the TV deficit numerically in the displayed rows. This is an optimization in the empirical finite conditional model, **not** a uniform guarantee: unseen differences need not be impossible in real prose. It also does not enforce the repaired effective increment marginal q, whereas the transport proof does. In particular the two optimizations must not be conflated. A table chosen from empirical zeros is not an authenticated key. Authentic p56 replays 85/85, with 84 consuming shifts and 2 physical adjacent equalities versus 2.583 under its empirical effective marginal product; finite sample empirical joint TV=0.46584 is not evidence for this repair (the actual mechanism is transparent F with prime shifts).

### Decisive original inverse-support envelope

Instead of tuning a table or searching arbitrary hidden state, grant an independent t at every transition, including an encoder-only choice that a real receiver might not know. If observed z' is nonzero, its nominal preimage must satisfy d+e in {0,z'}; observed z'=0 grants arbitrary d. This is a necessary and exact single-transition envelope over every possible target. With intact printed groups, check every word candidate of matching length in the previous Agent48 38,938-form GP lexicon (all TextBlob spelling tokenizations plus native solved forms). Preserve all 2,896 complete groups and the 12,956 source runes. Inspect all 559 groups of length >=7. For literal-F mode each candidate determines its F mask: F requires visible 0; consuming zeros remain legal. The constraint applies to consecutive consuming symbols, including across an intervening F. Each group starts with free plaintext and ciphertext state.

The q8/q13 tests grant each group every possible independent initial clock phase. For the continuous prime-minus-one ordinary clock, use the known physical offset. For its literal-F variant, an initial consuming index is necessarily between the physical offset minus all preceding ciphertext zeros and the physical offset. Grant every index in this interval independently per group, even if no consistent global hold assignment exists. An inverted index of the known prime increments selects the rarest two-residue constraint before testing remaining constraints; this preserves exhaustive phase coverage, rather than using a phase cutoff. The original result is:

| Nominal clock | Ordinary: groups with any candidate / 559 | Literal-F: groups with any candidate / 559 | Length >=9 (187 groups), either |
|---|---:|---:|---:|
| DIUINITY | 3 | 3 | 0 |
| FIRFUMFERENFE | 3 | 2 | 0 |
| prime-minus-one | 0 | 25 | 0 |

Even the most permissive prime F-hold envelope forces at least 534/559 long groups outside this finite lexicon (and all 343 groups of length >=8). For all six model variants, 187/187 groups of length >=9 lack a candidate. All 681 multi-rune native solved groups pass each of six planted transposition gates, 4,086/4,086 checks, including 43 literal holds and consuming-zero events per applicable plant. Three deterministic full-stream ordinary plants replay 28,763/28,763 runes; genuine p56 independently satisfies the hold-aware envelope without any repair. This is a necessary-condition receiver rejection, not key recovery; no candidate survives to justify blind repair-key inference or a prospective original prose output. The naive exhaustive prime F-hold phase pass timed out; the indexed pass completed and includes positive comparison with direct phase enumeration on narrow windows. Core JS executed against exact repository blob inputs; standalone Node wrapper not separately executed, no CI claimed.

**Scope and Director decision:** retire the collision-only change and zero-output transposition repair family over these three historical nominal clocks for the intact-group finite GP lexicon. This excludes even arbitrary state-dependent repair targets, not general permutations changing nonzero-to-nonzero mappings, arbitrary unknown clocks, other registers or changed boundaries. Coupling magnitude alone is too weak to identify a receiver. The next viable branch must supply an independently sourced clock or a genuinely different invertible operation, not more marginal fits or unconstrained hidden repair bits.

[Standalone SFT](../sims/lp2_increment_coupling_collision_swap_sft.cjs) · [Exact raw result with transport witnesses and original group indices](lp2-increment-coupling-collision-swap-output.json).

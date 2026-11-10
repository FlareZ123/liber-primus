# Exhaustive crib-free source-matrix F29 state inversion

**Evidence classification, 10 November 2026 (Agent 7): original-negative for three source-fixed four-state F29 matrices under multiple independent GP emission and plaintext criteria.** No unknown LP2 plaintext, historical key or complete mechanism recovered. The original source matrices fail solved-Cicada and Latin GP reference likelihoods, and now also fail the historically evidenced author-prime clause checksum in both the direct additive and transparent-EA output architectures. Every conclusion is bounded by its declared output map, original clause segmentation and global state clock.

## Why this attack is a meaningful extension

Earlier original-source red16 and printed-page15 4D studies used solved-native EA-containing word cribs to solve keys, giving only hundreds of original candidate states. This attack instead scores **all 29^4 = 707,281 possible initial states** under each independently selected matrix, using no fitted plaintext word or original key prior. Each candidate state is globally continuous across the original physical-page layout. All original page indices 0–27 (6,761 runes) select the key; pages28–55 (6,195 runes) are never used during optimization.

Original sources, forward and inverse assumptions are the existing [red16 original-input study](red16-fibonacci-spiral-inverse.md). The three exact source-derived 4×4 transition matrices are (i) 16 original red-span GP-prime sums placed along the p15 4×4 Fibonacci spiral, (ii) the 16 printed original p15 square entries reduced modulo29, and (iii) the 16 original visually red rune-span lengths [13,16,3,11,14,12,9,11,16,19,10,8,3,8,51,9] in physical manuscript order placed clockwise along the same spiral. The third matrix is [[9,11,16,19],[12,13,16,10],[14,11,3,8],[9,22,8,3]] mod29, giving a materially different fixed source-derived state recursion. The original span counts are in [the pinned visual ink annotations](../resources/liber-primus/lp2-ink-annotations.json). The differential output convention is unchanged: for non-page-initial symbols, GP-EA (index28) emits an adjacent-equal ciphertext rune, whereas GP p∈0..27 emits the nonzero step 15^((p+K)%28) modulo29. The key tap is the first coordinate of A^t S reduced modulo29, then modulo28 for nonzero steps. Page heads use GP29 addition. The unknown key S contains exactly four F29 coordinates and has no individually fitted location, page offset, or crib.

## New algorithm: exact finite-field ridge Fourier optimization

For an original ciphertext position t, the observed nonzero step exponent e_t gives decoded GP index p_t=(e_t - (v_t⋅S mod29 mod28)) mod28, where v_t=e0 A^t. Let f_t(k) be the fixed solved-Cicada GP unigram log likelihood for p_t under projected state k∈F29. Then

    L(S) = sum_t f_t(v_t⋅S)
         = sum_{u∈F29^4} H(u) exp(2πi u⋅S/29),

with only 29 nonzero possible frequencies per original training position. For adjacent nonzero steps, the joint-source bigram objective is

    B(S) = sum_t g_t(v_(t-1)⋅S, v_t⋅S),

whose Fourier coefficients lie on two-dimensional subspaces: u=m v_(t-1)+n v_t. The attack aggregates 29² coefficients per eligible source pair, then performs four successive exact-definition 29-point complex Fourier syntheses to obtain the score of **every** S in F29^4. Numerical equality with direct likelihood summation is asserted at independent states to 1e−5. No heuristic random walk, local search, word-crib alignment or early termination occurs.

The unigram score uses 0.5-smoothed GP frequencies from the 796 previously solved Cicada source words, conditioning on non-EA for nonzero steps. The bigram score uses a 0.5-smoothed 28×28 solved-source adjacent GP frequency matrix and ignores pairs containing a ciphertext EA-step or a page head. The two objectives are independent ranking experiments against the **same frozen training/heldout split**, without using the original heldout pages for key selection.

## Executed exact full-key results

| Matrix / objective | Best original training state S | Original training log-ratio/rune | Frozen original heldout log-ratio/rune | Original heldout GP IoC |
| --- | --- | ---: | ---: | ---: |
| Red16 unigram | [12,26,5,26] | −0.811645 | **−0.916692** | 0.035329 |
| Printed p15 unigram | [24,3,18,8] | −0.811420 | **−0.930148** | 0.035307 |
| Visible-red-count unigram | [8,6,3,11] | −0.814951 | **−0.925797** | 0.035233 |
| Red16 bigram | [7,26,0,27] | −1.021958 | **−1.104237** | 0.035281 |
| Printed p15 bigram | [19,6,22,24] | −1.014708 | **−1.074075** | 0.035307 |
| Visible-red-count bigram | [3,8,24,26] | −1.025466 | **−1.123101** | 0.035268 |

Source GP positive controls encrypt 12,956 runes drawn cyclically from the established solved-Cicada GP reference using hidden states [11,7,22,3], [5,12,19,27], and [1,9,18,27] for the red16 prime-sum, printed p15, and visibly red count matrix respectively, on exactly the original printed-page boundaries and continuous source clocks. In all six objective/matrix combinations, exhaustive blind search identifies the true initial state at **rank 1/707,281**. Each positive yields **12,956/12,956 exact GP runes recovered and re-encrypted**, GP heldout IoC **0.062342**, and heldout log-ratios **+0.419661 unigram / +1.292815 bigram**. The native source used for the plant is also the source for its frequency model, so this is a genuine key-recovery positive, not an independent heldout author-detection experiment.

The source-negative original heldout IoCs are near the GP29 uniform baseline 1/29 = 0.034483. No candidate recovers sustained source-native GP text under either fitted objective. The original 12,956 symbols can be exactly re-encrypted under any state; this exactness is a necessary implementation check, not evidence of an authentic historical key.

## Independent Latin-original 4D exhaustion (same cipher states, new source register)

The original red heading has a published but unauthenticated Latin reading. As a language-specific challenge, freeze **the same three source matrices, 29⁴ states, complete original page split, field output transform, and independent Fourier unigram/bigram objectives**, replacing the GP reference only with the independent previously established **203,357-rune Latin Vulgate training corpus** (Luke/John/Acts/Romans) and its 2,400-rune Revelation GP holdout for the blind source-key plant. No Latin ciphertext crib is fitted, and no source positional parameter is changed.

| Matrix / Latin objective | Training-selected state | Original heldout mean log ratio / rune | Heldout IoC | Source-correct native-GP plant heldout score |
| --- | --- | ---: | ---: | ---: |
| Red16 Latin unigram | [2,26,26,12] | **−1.383865** | 0.035305 | +0.526902 |
| Printed p15 Latin unigram | [15,10,28,5] | **−1.323108** | 0.035313 | +0.526902 |
| Visible-red-count Latin unigram | [22,1,6,19] | **−1.363608** | 0.035308 | +0.526902 |
| Red16 Latin bigram | [11,1,28,0] | **−2.855965** | 0.035306 | +1.386850 |
| Printed p15 Latin bigram | [6,12,10,26] | **−2.972565** | 0.035259 | +1.386850 |
| Visible-red-count Latin bigram | [3,28,16,9] | **−2.895259** | 0.035249 | +1.386850 |

The unmodified full enumeration places the correct hidden key first among **707,281** states for **all six** Latin native-source cipher controls, reconstructing and exactly re-encrypting **12,956/12,956** runes. The 2,400 independent Latin heldout runes are recycled to fill the original 12,956-symbol layout; this is a *synthetic key-recovery positive*, so the repeated plaintext itself does not create independent evidence for Cicada intent. The original source remains near uniform and no original Latin is recovered. The independent source-register check is a **finite two-language negative** for the declared three-matrix cipher architecture, and no stronger assertion about arbitrarily encoded non-prose is implied.

The current workflow additionally executes `GP_REGISTER=latin node sims/source_4d_fourier_fullkey_inverse.cjs`. [Completed three-matrix English-and-Latin original/full-key controls 42821696704](https://github.com/FlareZ123/liber-primus/actions/runs/42821696704).

## Author-prime clause complete state inversion: six original full-key tests

**Agent 7, 10 November 2026.** The independently authenticated 2013 Cicada audio metadata product **1,595,277,641 = 1,259 × 1,031 × 1,229** corresponds to the GP-prime sums of the three solved *Parable* body clauses. Agent43's [author-native source discriminator](author-native-prime-clause-discriminator.md) records **13 prime-valued among 16** printed clauses in three solved Cicada passages. This supplies a language-independent, author-specific plaintext criterion distinct from the previously exhausted GP-English/Latin unigram and bigram models.

The [exact author-prime inverter](../sims/source_4d_prime_clause_fullkey.cjs) aligns all original 12,956 cipher runes and printed period punctuation against the master. Of **168** nonempty dot-delimited clauses, the source-specified solved-Cicada maximum length of **76** gives **101** clauses of length 3–76. Freeze **50 training clauses (1,590 runes)** wholly in physical pages 0–27 and **51 heldout clauses (1,759 runes)** wholly in pages 28–55. A clause crossing the split is excluded. Original page and word positions, physical-page initials, and a globally continuous state clock are preserved in the inverse.

For each of the three previously source-fixed 4×4 matrices, enumerate **all 29⁴ = 707,281 initial-state keys**, choosing the state with the greatest number of prime-valued training clause sums and then scoring the later clauses with the key frozen. Two independently specified original forward/inverse channels are checked:

- Transparent GP EA (28) produces a repeated ciphertext rune; all other runes are primitive-root-15 nonzero predecessor steps with a state mask reduced mod28. Page initials use GP29 addition.
- Direct addition in GP29 uses the same four-coordinate matrix state, with every plaintext symbol decoded as ciphertext minus the state projection mod29.

Both are reversible. Reencryption of any chosen original-state candidate is an algebraic sanity check and does not authenticate that candidate.

| Frozen matrix | Output rule | Highest train primes / 50 | Heldout primes / 51 | Heldout GP IoC |
| --- | --- | ---: | ---: | ---: |
| Red16 prime-value spiral | EA / 15-step | **20** (7 tied) | **1** | 0.035251 |
| Red16 visible-count spiral | EA / 15-step | **20** (3 tied) | **8** | 0.035252 |
| Printed Fibonacci prime square | EA / 15-step | **21** (2 tied) | **10** | 0.035198 |
| Red16 prime-value spiral | GP29 direct addition | **21** (unique) | **10** | 0.034542 |
| Red16 visible-count spiral | GP29 direct addition | **22** (unique) | **8** | 0.034547 |
| Printed Fibonacci prime square | GP29 direct addition | **21** (unique) | **8** | 0.034497 |

The apparent training maxima are expected to be inflated by **707,281-way key selection**. Frozen validation never exceeds **10 of 51**, and the decoded heldout unigram collision rates remain close to uniform. No original state gives independent source-authenticated plaintext.

**Author-prime control with exact key recovery.** A separate native solved-Cicada GP corpus (3,248 runes) was recycled over the exact 12,956-position original page layout. A predetermined 13-of-16 selection of original-shaped short clauses received at most two GP symbol edits where necessary, enforcing **83 prime clauses** and yielding **84/101** prime clause sums in total, with **70 changed runes**. Independently keyed copies were forward encrypted under each of the six matrix/output families. The same 707,281-key scorer, blinded to the secret state, recovered the actual planted key **at rank 1 in all six families**. Their independently withheld score is **43/51**, compared with **41/50** on training. Each planted plaintext decoded and reencrypted exactly, **12,956/12,956 symbols**. This demonstrates recovery power for the declared author-prime signal; no synthetic authoring rule is claimed for the unknown manuscript.

**Scope and decision.** All **4,243,686 source-model original keys**, plus equivalent positive controls, were evaluated exactly. The complete direct-addition and transparent-EA four-state families lack the independent author-prime signal under the frozen matrix, global clock, period segmentation, GP value map and length criterion. Alternative plaintext registers, editorial segmentation, key schedules, source matrices or nonlinear output channels remain open. Retuning length limits on the same original key scores would amount to fitting the observed negative and requires a new independent source rule.

[Six-job original-input and planted-control successful CI 42841743152](https://github.com/FlareZ123/liber-primus/actions/runs/42841743152) provides exact original training score histograms, the ten top frozen keys and holdout counts per model. [Manual parallel workflow](../.github/workflows/source-4d-prime-clause-manual.yml) and [complete CommonJS SFT](../sims/source_4d_prime_clause_fullkey.cjs) make the full finite search reproducible.

## Reproduce and next decision

- [Exact CommonJS full-state Fourier engine](../sims/source_4d_fourier_fullkey_inverse.cjs): three source-defined matrices, unconditional all-key enumeration, exact direct-score comparisons, heldout original inverses, native GP blind-key positives and exact whole-book forward re-encryption.
- [Dispatch-only CI](../.github/workflows/source-4d-fourier-fullkey-manual.yml), [successful full unigram run 42817630661](https://github.com/FlareZ123/liber-primus/actions/runs/42817630661), [successful unigram + bigram run 42818399747](https://github.com/FlareZ123/liber-primus/actions/runs/42818399747), and [all three matrices in both English and Latin, CI 42821696704](https://github.com/FlareZ123/liber-primus/actions/runs/42821696704). The final run is the reproducible current source test.

The source-locked constant-matrix four-state/transparent-EA cipher can now be rejected as a *recovery path using the supplied source-native English and independent Latin GP models* for all three source-fixed clue matrices, rather than merely being tested against a handful of fitted cribs. The exhaustive method generalizes to source-constrained hidden linear state with arbitrary per-rune and pairwise GP emission scores, providing a useful algorithm when a stronger independent source rule fixes A and the output register. Do not interpret the finite failure as a mathematical exclusion of every possible plaintext; alternate languages and nonnative registers were not tested. The new author-prime clause scorer supplies a separate, independently motivated observation criterion and has also been exhausted for the six original source-matrix/output combinations above. Repeated search using these same matrices and channels is low-value without an independently grounded change to state construction or source assumptions.

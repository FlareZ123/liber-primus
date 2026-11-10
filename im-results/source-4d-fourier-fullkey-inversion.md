# Exhaustive crib-free source-matrix F29 state inversion

**Evidence classification, 10 November 2026 (Agent 7): original-negative for three fully specified 4D F29 stream models.** No unknown LP2 plaintext, historical key or complete mechanism recovered. This experiment eliminates the possibility that an *unknown initial four-coordinate state alone*, under each of the three locked matrices and the declared EA/step output rule, produces source-native GP plaintext with the tested train/holdout behavior. It does not constrain other output maps, page resets, matrices or alternate plaintext registers.

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

## Reproduce and next decision

- [Exact CommonJS full-state Fourier engine](../sims/source_4d_fourier_fullkey_inverse.cjs): three source-defined matrices, unconditional all-key enumeration, exact direct-score comparisons, heldout original inverses, native GP blind-key positives and exact whole-book forward re-encryption.
- [Dispatch-only CI](../.github/workflows/source-4d-fourier-fullkey-manual.yml), [successful full unigram run 42817630661](https://github.com/FlareZ123/liber-primus/actions/runs/42817630661), [successful unigram + bigram run 42818399747](https://github.com/FlareZ123/liber-primus/actions/runs/42818399747), and [all three matrices in both English and Latin, CI 42821696704](https://github.com/FlareZ123/liber-primus/actions/runs/42821696704). The final run is the reproducible current source test.

The source-locked constant-matrix four-state/transparent-EA cipher can now be rejected as a *recovery path using the supplied source-native English and independent Latin GP models* for all three source-fixed clue matrices, rather than merely being tested against a handful of fitted cribs. The exhaustive method generalizes to source-constrained hidden linear state with arbitrary per-rune and pairwise GP emission scores, providing a useful algorithm when a stronger independent source rule fixes A and the output register. Do not interpret the finite failure as a mathematical exclusion of every possible plaintext; alternate languages and nonnative registers were not tested. Further search with these exact A and output assumptions is low-value unless new source evidence modifies the state or observation model.

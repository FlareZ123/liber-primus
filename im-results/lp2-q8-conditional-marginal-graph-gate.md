# Conditional word-position marginals: cyclic GP29 graph recovery on larger controls

**Agent21, 26 November 2026. Decision: control-only receiver failure.** This is a different identification method from the p54 carry/lexical DFS, SAT, block stochastic and whole-word differentiable experiments in [#2722](https://github.com/FlareZ123/liber-primus/issues/2722) and [#3028](https://github.com/FlareZ123/liber-primus/issues/3028). It tests whether a substantially larger sample permits recovery of the *unordered* phase-action graph by conditional native plaintext letter distributions. No original unknown rune identities were scored, no original action or plaintext recovered, and the stronger assumption of a single book-wide q8 action is already contradicted by the original [singleton support bound](lp2-singleton-word-cipher-state-support-bound.md) under native A/I/O and intact spacing.

## Model and exact marginal

Let pi be an unknown bijection of GP29 with pi(F)=0 and let eight distinct shifts K be selected. Each printed group begins at an independently uniform phase of a primitive q8 key. A true F passes unchanged and does not consume phase. For context g=(word length, rune position), write f_g(p) for the native plaintext marginal. Conditional on any complete plaintext word, the effective phase at any non-F position remains uniform, regardless of earlier holds. Therefore the exact marginal is

```
Pr(C=c | g) = 1[c=F] f_g(F) + (1/8) Σ_{p != F} A[c,p] f_g(p)
A[c,p] = 1[pi(c)-pi(p) mod29 belongs to K].
```

A is an unknown 8-regular directed Cayley graph relabeled by pi. The formula loses key order entirely. It is valid for uniform independent word starts, **not** arbitrary source-determined phase starts. Only distinct shifts are tested. The 8-regularity applies to A including its F column, even though that column is omitted from the non-F mixture. To score independent row hypotheses, use the composite Poisson objective Σ_g (count[g,c] log expected[g,c] - expected[g,c]); dependence among positions of a word means this is not a calibrated full-word likelihood.

The native priors use the first 67% of each pinned Shakespeare, Gibran and Emerson word stream, 99,877 words total; 49,195 held-out words form length-matched plants. Normalize each as in the existing shared-pad SFT (QU→CW, V→U, K→C, Z→S, ING→NG, IO→IA, longest matching GP digraph). Lengths 1–10 retain exact positions; longer words pool the first/last three and middle positions. There are 62 observed contexts in the plants. Smooth native counts by ten pseudo-observations from the pooled native rune prior. The original source is used only for its complete group-length profile. Plants sample held-out words by length with replacement; they need not be contiguous prose. Each plant has a separate random permutation fixing F and a distinct eight-shift key.

## Local information and blind inversion

In each of four seeded plants:
1. Score the true unordered graph, every single non-F label swap (378) and one-shift replacement (168), plus 100 random graph controls. Independent row fitting samples 2,000 eight-element predecessor sets per row and improves the best by single replacements; it never sees the true row.
2. Independently sample a tempered row posterior by 5,000 Metropolis proposals (temperature 2, first 1,000 discarded). Balance its soft adjacency matrix to approximately 8-regular using capped-simplex row/column projections.
3. Recover a circular order from all nonconstant eigenvector pairs of the symmetrized, row-Gram, and column-Gram matrices. For an exact Cayley graph these are Fourier eigenspaces, and the 29-prime order permits recovery up to multiplication/rotation gauge. Anchor F=0 and normalize rank of rune 1. Select eight shifts maximizing soft graph edge log odds.
4. Refine eight spectral and four random seeds by 25,000 surrogate annealing steps apiece; rank the results by actual marginal score and apply full single-swap/shift-replacement hill climbing to the best three. This is a bounded heuristic, **not** a global optimum. The independent exact noiseless-graph spectral control recovers all 232 edges in all four cases. It uses the known graph only for validation; the blind fits use only observed category counts and native priors.

| Plant | Runes / groups | True minus best random score | Better one-swap / one-shift neighbors | Independent fitted row overlap / 8 | Blind final graph overlap / 232 | Final score minus truth |
|---|---:|---:|---:|---:|---:|---:|
| Chapter 1 | 3008 / 669 | 449.464 | 0 / 0 | 3.897 | 92 | -119.093 |
| Chapter 2 | 3008 / 669 | 500.115 | 1 / 0 | 4.207 | 115 | -83.381 |
| Book-size 1 | 12956 / 2896 | 2027.028 | 0 / 0 | 5.207 | 110 | -705.154 |
| Book-size 2 | 12956 / 2896 | 1911.848 | 0 / 0 | 5.207 | 116 | -785.422 |

All 400 random graphs score below their respective supplied true graph. The chapter-2 truth is beaten by one label swap by 0.237 nats, so exact maximization of this empirical composite objective would not identify the truth in every chapter control. No independently fitted row in any of the four final controls recovers all eight predecessors. The two book-size controls have much stronger row information, but the joint graph solver fails to assemble the correct cycle even there. A single shared book-wide action is deliberately an oversized synthetic calibration, not a proposed original receiver. No key order is inferred; unordered graph recovery fails at the prerequisite. No original ciphertext fit is justified.

**Fork:** conditional marginal information is real but the proposed spectral recovery is inadequate even with optimistic uniform starts and additional data. Do not restart the same heuristic or expand the target to a shared whole-book q8 action. An independently provided alphabet cycle or shift multiset could change the inversion problem. This is not an exclusion of the unresolved shared-cycle family at p54–55.

[Reproducer](../sims/lp2_q8_conditional_marginal_graph_sft.cjs), [raw output](lp2-q8-conditional-marginal-graph-output.json). Executed the authored experiment directly in the connector JS runtime on pinned repository inputs; standalone Node22 wrapper not separately CI-run. Sources: corpus 054f2a0f, transcription 43bfeb6b, Shakespeare 94c677ad, Gibran df260a07, Emerson a92be8ba. Seeds 35088897–35088900.

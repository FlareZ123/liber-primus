# Author-disjoint contrastive GP29 running-key ranking

**Decision for #2476, 24 November 2026: the tested contrastive objective fails the prospective two-stream recovery gate.** No original unknown LP2 was scored or deciphered. This is a calibrated model failure, not a theorem against all natural-language keys.

## Model and separation

Follow #2459's additive C=P+K mod29 model, known plaintext word lengths, independently inferred key boundaries, and no F bypass. Prior three solvers showed objective misranking as well as beam loss. Here fit the ranking itself using competing exact-replay paths, rather than widen the old beam.

- Character language model and lexical counts: Shakespeare and Emerson, 55,407 and 74,866 words, 656,395 rune-or-boundary tokens; add-.1 unigram and hierarchical smoothing through 4-gram, plus 5-gram log-likelihood improvement. Trie 29,968 nodes. No held-out author enters these counts.
- Contrastive source pairs: Gibran and Orthodox Daily Prayers, eight 108–144-rune windows at fixed disjoint starts. No LP or Blake words are used in ranker fitting. Remove matched Gutenberg header/footer delimiters and explicit source-text envelope where present.
- Held-out source/author pair: original solved-native LP transcriptions and Blake, four 113–168-rune plants. No original unknown ciphertext used for selection. GP conversions use declared K/Q→C, V→U, Z→S and ING→21 mapping.
- Twelve local features: separate P/K interpolated character4 likelihoods; initial and ongoing OOV penalties; word-bigram contextual ratios; lexical probabilities conditional on word length; character5 improvement. P uses supplied whole-word lengths, K freely branches over boundaries. Every candidate derives K=C−P exactly.
- Mine five incorrect top paths per training pair using the baseline beam (width128); learn a nonnegative 12-weight ranker by regularized pairwise logistic optimization of the true-minus-decoy feature differences divided by sqrt(length). Mine another five paths per pair using the learned model, then refit on all 80 decoys and freeze. Weights are constrained to [0,8], regularized toward the baseline, with fixed 650 gradient steps. No heldout tuning. Test with width256.

The first fit separates 35/40 mined contrasts (87.5%), but drops both base character4 weights and performs very poorly when used for its own hard-decoy generation (5–16 correct runes). After the second mining round the frozen ranker separates 60/80 training contrasts (75%); weights recover a positive character4 score and emphasize key character5 (2.38167). This is a direct objective generalization test, not simply wider search.

## Held-out exact-pair recovery

| Held-out source pair | N | Baseline correct | Contrastive correct | Frozen true actual-boundary minus selected score, nats | Frozen true rune-pair with best searched key segmentation minus selected score |
|---|---:|---:|---:|---:|---:|
| LP Welcome / Blake | 120 | 69 | 78 | −63.3961 | −57.7240 |
| LP Koan / Blake | 149 | 89 | 96 | −55.7171 | −48.3767 |
| LP Divinity / Blake | 168 | 108 | 91 | −87.1197 | −87.1197 |
| Blake / LP Koan | 113 | 58 | 58 | −67.6657 | −67.6657 |
| Total | 550 | 324 | 323 | | |

Every selected candidate exactly replays ciphertext, but no held-out plant is completely recovered. All four true paths lose to the wrong selected pairs. The separate restricted search, fixing the true P/K rune streams and optimizing K boundary decisions (width128), does not rescue any gap. This is a stronger finite diagnostic than scoring only the actual true key segmentation; it is still a beam over boundaries, not a proof of the global optimum.

The four uniform-pad controls yield only 10/120, 18/149, 13/168 and 3/113 correct P runes. Their frozen normalized scores (−4.1505, −4.0983, −4.1368, −4.2607) are worse than corresponding positive scores (−3.6753, −3.6562, −3.8114, −3.7781). The small finite separation does not warrant accepting original fragments as a solution. Both baseline and contrastive scores are calibrated on different weights and should not be compared directly in absolute units.

**Gate and consequence:** no exact recovery on the four disjoint source plants, true paths misrank on all four, and aggregate accuracy does not improve (58.73% →58.55%). The first ranker exploits an unstable training contrast; mining its own counterexamples reveals the failure. Retire this particular successor. A new independent key anchor, substantially stronger held-out language model, or another source-selected constraint is needed before reopening original inference. Do not increase beam width or retune weights to these holdout pairs merely to get an original candidate.

## Reproduction

- [Node22 read-only CommonJS SFT](../sims/lp2_joint_gp29_contrastive_pair_ranker_sft.cjs)
- [Complete frozen result](lp2-joint-gp29-contrastive-pair-ranker-output.json), source splits, weights, mining rounds, true score gaps and pad negatives.
- [Prior #2459 report](lp2-joint-native-running-key-recovery.md).

Executed against the actual repository inputs in the JavaScript runtime. No CI run or new plaintext claim.

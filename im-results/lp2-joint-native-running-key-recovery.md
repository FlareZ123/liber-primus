# Joint native-GP natural-language running-key recovery

**Agent8, 24 November 2026; Director #2459.** Experimental attack with independent language keys; no recovered unknown LP2 plaintext or key.

## Fixed model and controls

The candidate is additive GP29 encryption C=P+K mod29, with P's true word lengths supplied and K independently segmented. Both rune streams must be inferred jointly. The key begins at an ordinary word boundary and may end inside a word. No named-book search, known plaintext crib, key reuse or LP2 scoring is used.

Train a boundary-aware interpolated GP 1–4-gram model on the first 70% of each repository-native Gibran, Shakespeare, Emerson word stream (11,013 / 38,784 / 54,552 words; 522,998 rune-or-boundary tokens). Normalize K/Q→C, V→U, Z→S; native ING is GP rune21. The published clear p57 transcription maps exactly to all 95 authentic original runes. Three independent plants:

1. Authentic p57 (95 runes), key from Gibran's held-out region.
2. LP1 LOSS OF DIVINITY passage (145 runes), key from Shakespeare's held-out region.
3. Independent held-out Gibran passage (141 runes), held-out Emerson key.

No training includes the LP1 or p57 plaintexts. Each pair is encrypted, then both streams are hidden from a beam that receives only ciphertext and P's word lengths. Uniform independent-pad negatives use the same P and deterministic seed 0x33010245. The cipher has no F interruption in this test. The three source windows and split rules are fixed in code.

## Actual inference implementations

The [character beam SFT](../sims/lp2_joint_native_gp_running_key_beam_sft.cjs) keeps a paired language context, branches over every 29 possible P runes, derives K algebraically and branches over its optional word boundary. States with identical contexts are deduplicated by best joint score; surviving backpointers recover both sequences. No language score is used to select an external key corpus.

The [soft lexical beam SFT](../sims/lp2_joint_native_gp_running_key_lexical_beam_sft.cjs) retains both independent lexical prefix states, using a frozen 31,467-type GP dictionary from TextBlob and training literature. A length-aware prefix trie gives P exact word length, K independent lengths. It allows unknown words with a 4-nat initial and 0.16-nat subsequent OOV penalty. Thus the result is not a hard-dictionary exclusion. The first 70%-by-rune word-aligned best-prefix candidate is also recorded before the rest of the ciphertext is processed.

## Initial blind recovery

| Plant | Pure character beam, width 512 | Soft lexical beam, width 1024 | Soft lexical first-prefix recovery |
|---|---:|---:|---:|
| p57 + Gibran | 63/95 (66.3%) | 54/95 (56.8%) | 37/64 (57.8%) |
| LP1 + Shakespeare | 86/145 (59.3%) | 100/145 (69.0%) | 70/101 (69.3%) |
| Gibran + Emerson | 105/141 (74.5%) | 120/141 (85.1%) | 80/98 (81.6%) |

Because C=P+K, the recovered rune correctness counts are identical for P and K. Every selected candidate exactly re-encrypts its ciphertext. All three uniform-pad negative P recoveries were only 6–18 correct runes under the lexical beam, but their decoded texts still contained frequent short words and superficially meaningful fragments. Pure-character normalized negative joint scores -4.172/-4.047/-4.131, versus positive -3.849/-3.749/-3.604. Lexical negative scores -4.662/-4.558/-4.484, versus positive -4.132/-4.016/-3.740. A small set of well-separated positive/negative controls is encouraging for model discrimination, but is not a calibrated original-cipher identification threshold.

The lexical beam improves the literary and LP1 plants but degrades p57; INSTAR, TUNNELNG and CIRCUMFERENCES are absent from the training lexicon (the true LP1 BEHAUIORS and BELEIUE are also missing, and the Gibran control BERRIES). Doubling lexical beam width 512→1024 changes none of these final results. These tests establish real partial two-stream recovery, not reliable exact recovery. The best 120/141 literary plant still corrupts 21 runes in each stream.

## Word-context improvement and true-path misranking certificate

The third [word-context beam SFT](../sims/lp2_joint_native_gp_running_key_wordcontext_sft.cjs) adds 61,546 observed word bigrams, a smoothed contextual word/unigram likelihood ratio (weight 0.65), generic inflection variants (96,354 GP dictionary types), and softer OOV penalties. It tracks each stream's previous word and true prefix. Three prior plants are development controls; three additional source windows are frozen in code for fresh calibration. Width 512, same independent-segmentation model.

| Plant | Both rune streams correct | Prefix correct | True-path score minus decoded score (nats) |
|---|---:|---:|---:|
| Development p57 / Gibran | 59/95 | 36/64 | −14.219 |
| Development LP1 / Shakespeare | 108/145 | 77/101 | −33.216 |
| Development Gibran / Emerson | 118/141 | 79/98 | −17.843 |
| Fresh authentic p56 / Emerson | 71/85 | 49/59 | −6.052 |
| Fresh LP1 koan / Shakespeare | 119/141 | 76/98 | −27.217 |
| Fresh Emerson / Gibran-file holdout | 134/146 | 92/102 | −6.395 |

The final fresh key window in the Gibran file includes Gutenberg license boilerplate, rather than Gibran's authored prose; it remains an independent natural-language key but is not a clean literary-author holdout. Fresh negatives recover only 3, 11 and 11 true plaintext runes; their normalized scores −4.524/−4.621/−4.500 remain worse than the corresponding positive −3.765/−4.010/−3.619.

**Decisive diagnostic:** the solver scores the complete true P and K with their actual boundaries using the identical frozen objective, without supplying that truth to the candidate beam. For **all six** positive controls an incorrect reconstructed pair has a strictly greater joint score than the true pair with its actual boundaries. This is not merely beam width or first-path pruning. The intended rune streams could theoretically obtain a different score under alternative K segmentation, so this certifies misranking of the true joint rune-and-boundary path, not every possible segmentation of the true rune pair. In all six cases the true path is also lost before the end (first zero-based loss at 10,8,6,21,5,55). Larger beams alone cannot guarantee identification of the true joint path under this objective.

**Research decision:** close #2459 at the calibrated inability branch. No original unknown ciphertext has been scored or decrypted by these models. Even the best 134/146 fresh result leaves 12 incorrect runes in each stream, and the authentic controls are weaker. A stronger joint contextual language model and/or independently constrained key are required before interpreting LP2 fragments. All three programs were executed on exact repository text data in an isolated JavaScript runtime, with authentic p57 and forward-replay assertions; no Windows CI run is claimed. The result is an empirical limitation of the finite beam/objective family, not a theorem ruling out natural-language running keys.

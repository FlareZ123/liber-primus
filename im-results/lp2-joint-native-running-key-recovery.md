# Joint native-GP natural-language running-key recovery

**Agent8, 24 November 2026; Director #2459.** Experimental attack with independent language keys; no recovered unknown LP2 plaintext or key.

## Current decision: semantic repair (#2656) improves partial recovery but does not authenticate a complete inverse

The [pretrained DistilGPT2 semantic experiment](lp2-semantic-running-key-distilgpt2.md) ranked authentic pairs above both sampled wrong n-gram pairs in 6/6 fresh controls, with zero of six uniform threshold crossings. A subsequent distinct six-pair ciphertext-only coordinate-beam search improved exact rune recovery from 425/599 to 493/599 (+11.35 percentage points), but recovered 0/6 complete rune pairs and 0/6 exact key boundary tapes. Three optimized wrong pairs scored above their authentic pair, so the prior objective-misranking problem remains, despite improved candidate discrimination. The frozen full-recovery gate failed; original LP2 was not scored. Retire this fixed no-F objective/search. The [manuscript-wide doublet test](lp2-runningkey-native-doublet-gate.md) also disfavors direct independent literary addition absent a distinct anti-repeat layer or dependent key.

## Exact long-word recovery with authentic F interruption

The earlier full-stream beams below concern the no-interruption cipher. Agent8 subsequently implemented a different, exact local inference model: plaintext F outputs F without consuming the key, while encrypted non-F symbols may also output F. It enumerates possible plaintext words of the supplied original rune length and derives each required consuming key fragment. Its key alignment is arbitrary, including within a key word. No crib or chosen book position is assumed.

First, [exact support enumeration](../sims/lp2_joint_fhold_running_key_exact_local_sft.cjs) with 41,950 GP spellings checks whether each required key fragment is a substring of the dictionary concatenation language (including partial first and last key words). All 187 original words of lengths 9–14 are feasible; none is unique. Median numbers of plaintext candidates by length are 796, 485, 202, 82, 24, 6. All 374 native controls preserve the true word, but all corresponding uniform negatives also remain feasible. [Raw output](lp2-joint-fhold-running-key-exact-local-output.json).

The improved [stationary Bayesian solver](../sims/lp2_joint_fhold_running_key_stationary_bayes_sft.cjs) sums over every key word boundary and starting alignment, rather than maximizing over a potentially implausible fragment. Its normalized word prior is a mixture of 49% TextBlob frequencies (split over GP variants), 49% training-region literary word frequencies, and 2% uniform over 41,947 GP spellings. Unordered held-out donor vocabulary and known native words are included; held-out frequencies are excluded. Gutenberg boilerplate is trimmed in this second experiment. The key word process is IID; it does not model syntactic context.

For a nonempty required key fragment s, let W(s) be its whole-word probability, A(s) the sum of probabilities of words beginning with s, Z(s) the corresponding suffix sum, and I(s) the weighted count of all within-word occurrences. Let L be the expected word length. The boundary-started fragment probability is B(s)=A(s)+sum over proper nonempty prefixes t of W(t)B(s after t). The stationary probability is Q(s)=[I(s)+sum over proper nonempty prefixes t of Z(t)B(s after t)]/L, with Q(empty)=1. This marginal counts each alignment exactly once. For each possible plaintext p of length n, the model likelihood contribution is its length-conditional prior times Q(k(p,c)); incompatible F positions contribute zero. The uniform-pad null replaces Q(k) with 29^(-length(k)). The ratio of summed likelihoods is the Bayes factor (BF). The implementation checks normalization and a two-symbol marginal identity.

| Sample | Words | Exact top-1 word | Mean log BF | Median log BF | BF > 1 |
|---|---:|---:|---:|---:|---:|
| Gibran plaintext / Shakespeare key | 180 | 170 | +5.1153 | +4.9194 | |
| Emerson plaintext / Gibran key | 187 | 179 | +5.7326 | +5.7499 | |
| Native controls combined | 367 | 349 (95.1%) | | | 325 |
| Uniform-pad negatives, same plaintexts | 367 | | | | 17 |
| Original LP2 long words | 187 | unknown | -7.5288 | -6.2124 | 14 |

The uniform negative mean log BFs are -7.2583 and -7.5763; medians -6.2502 and -6.3198. All 43 native control words of length at least 12 rank exactly first. Overall 366/367 native controls rank in the top five. All nine original chapters have negative mean log BF; each corresponding native control subset has positive mean. The original score distributions closely resemble the negative controls. These are descriptive comparisons (words from the same texts are not independent experiments), not universal exclusions.

Conditional word posterior alone is misleading: original MULTILOCULAR has posterior 0.999999937 but log BF -15.6997. Original INTELLECTUALLY has posterior near 0.99998 but log BF -36.31275. Even uniform-pad controls yield 125/367 posteriors >=0.9. Requiring both posterior >=0.9 and log BF >0 gives 300/367 native controls (297 correct), 11/367 uniform controls, and 11/187 original candidates. No original word is accepted as recovered plaintext. [Full output](lp2-joint-fhold-running-key-stationary-bayes-output.json).

### Fixed anti-repeat outer layer

The same frozen model also tests the previously studied reversible zero-F wrapper from #1422/#1524, with the source p49–51 grid and global phase, without optimizing the wrapper or refitting the language model. The [wrapper SFT](../sims/lp2_joint_fhold_running_key_zeroF_wrapper_sft.cjs) verifies 549 whole-book edits, roundtrip and 367 control replays. The 63 affected long words' mean log BF changes from -7.6569 to -7.9055; median paired change -0.4070, mean paired change -0.2486. Across all 187 long words, mean is -7.6126 and median -6.3728, with 14 positive BFs. It does not rescue this native-language inner model. Windows Node22 [CI run 45380577043](https://github.com/FlareZ123/liber-primus/actions/runs/45380577043) passed.

**Decision:** exact local recovery is demonstrably effective in these synthetic native-GP plants, and the original long-word evidence disfavors the specified independent native-language additive running-key model with F interruption, either directly or after the fixed wrapper. This narrows the route beyond the previous no-interruption beam failure. It does not exclude out-of-vocabulary plaintext, a different key distribution, dependent streams, incorrect word boundaries, or other ciphers. It recovers no authenticated original plaintext, key, or continuous passage. No further tuning of these two negative routes is justified without independent source constraints.

## Gematria-prime projected running key (Agent8, 24 November)

This distinct source-motivated model follows the historical emphasis on Gematria prime values: keep native GP index plaintext and transparent plaintext F, but derive each consuming additive pad symbol as the published prime of the key rune modulo29. The prime projection has 24 residues and collisions (e.g. F, I and D all project to2). It is not a bijective replacement for the plaintext alphabet; the many-to-one key representation is marginalized, not inverted uniquely. No author instruction selects this precise running-key combination.

The [exact local inverse](../sims/lp2_joint_fhold_prime_projected_running_key_sft.cjs) retains the earlier 41,947 native spellings and stationary IID-word prior, aggregates collisions into 41,528 distinct projected word types, and sums all projected key fragment alignments including partial boundaries. It tests both a uniform GP29 pad null and an IID pad with the *same projected single-symbol marginal*. The latter distinguishes key-language structure from the projection's restricted support and nonuniform frequencies. All 29 one- and two-symbol marginal identities and every selected anchor candidate's exact forward replay are asserted. Control texts use held-out literary regions (their unordered vocabulary is included), with projected natural-language, matched-IID, and uniform pads. The source map and random seed were fixed before original scoring.

| Sample | Anchors | Rank-one true word | Mean log BF vs uniform | Mean log BF vs projected IID |
|---|---:|---:|---:|---:|
| Gibran / Shakespeare | 180 | 173 | +5.078 | +4.105 |
| Emerson / Gibran | 187 | 177 | +6.660 | +5.507 |
| Gibran / matched IID | 180 | 34 | -4.904 | -6.134 |
| Emerson / matched IID | 187 | 33 | -5.645 | -6.927 |
| Gibran / uniform | 180 | 0 | -9.230 | -7.939 |
| Emerson / uniform | 187 | 0 | -10.383 | -8.789 |
| Original LP2 | 187 | unknown | -9.809 | -8.372 |

The two means for original LP2 and the second uniform negative exclude two zero-language-support words each; these are exact zero likelihoods within the finite model (log BF negative infinity), not missing data. All 367 projected native controls retain truth, all rank in the top five, and 43/43 controls of length at least12 are recovered at rank one. Original words at offsets3925 and10453 (lengths12 and14) have no compatible joint lexical fragment despite all 187 anchors having support under the projected IID null. Of 187 original anchors, 12 have positive BF against projected IID and only six have both positive BFs and posterior at least0.9; the same criterion passes 296/367 native controls, 15/367 matched-IID controls and 6/367 uniform controls. The original top candidate MINNESINGERS has posterior >0.999999999999 but negative BF against the uniform null, illustrating why conditional confidence cannot certify plaintext.

**Decision:** retire the fixed prime-value projected independent native-language running-key branch under intact printed-group assumptions; it fails even after exact projection-collision marginalization. No authentic key, unknown plaintext or continuous continuation is recovered. Do not tune alternate prime offsets or alphabet projections without independent source selection. The result is conditional on the fixed vocabulary, language prior, and additive receiver, not a general impossibility theorem. The [full output](lp2-joint-fhold-prime-projected-running-key-output.json) records all 187 original anchors, 367 matched sets of controls, and input blob SHAs. Executed directly on exact repository files in an isolated JavaScript runtime; Windows CI has not been run.

## Exact continuous-rune joint inversion with transparent F

The fixed-word local models do not address a possible false printed grouping. The [spacing-free trigram inverse](../sims/lp2_joint_fhold_spacingfree_trigram_sft.cjs) therefore marginalizes over every plaintext and key rune path with **no word lengths, no dictionary, no beam pruning and no fixed F mask**. Both independent language streams use the same hierarchical GP29 unigram/bigram/trigram model trained on the first 70% of trimmed Gibran/Shakespeare/Emerson rune streams (401,676 total runes; no authentic LP1/LP2 plaintext used for training). The empirical half-count unigram, bigram prior mass16 and trigram prior mass32 were fixed in code.

State is the last two plaintext runes and last two consumed key runes, with initial sentinel contexts. For each ciphertext rune c, the nonhold transitions enumerate p=1..28 with k=(c-p) mod29, multiplying both language transitions. If c=0 the additional p=0 transition advances only plaintext context. Exact forward summation merges equal states; scaled forward evidence is compared with a plaintext-only trigram model under an independent uniform consuming pad. Viterbi retains an exact maximum joint path and every recovered candidate is re-encrypted. Maximum reachable state count across the tested streams is 3,164; no search cap. The p57 native source transcription is asserted against authentic clear p57.

| Plant or original | Runes | Exact Viterbi plaintext correct | Log BF/rune vs uniform | Matched uniform control log BF/rune |
|---|---:|---:|---:|---:|
| Native LP1 KOAN / Shakespeare | 729 | 151 (20.7%) | +0.04470 | -0.02023 |
| Native LP1 LOSS / Gibran | 308 | 65 (21.1%) | +0.06623 | -0.06135 |
| Held-out Gibran / Emerson | 308 | 83 (26.9%) | +0.05664 | -0.04317 |
| Held-out Emerson / Shakespeare | 729 | 120 (16.5%) | +0.01697 | -0.03873 |
| Original p0–2 | 729 | unknown | -0.04848 | |
| Original p54–55 | 308 | unknown | -0.03526 | |

All four positive controls have positive evidence against the uniform null and all four matched uniform controls have negative evidence. Their exact MAP paths nevertheless recover only 419/2,074 original plaintext runes, so **exact dynamic programming cannot overcome this weak language model**. Unlike the prior beam tests, the limitation here is not search pruning. Both original sections score within or near the small uniform-negative comparison range and output only incoherent language-like fragments with exact ciphertext replay. The exact joint log BFs are -35.341 and -10.859 respectively. No full original plaintext or authentic key is established.

**Decision:** retire this particular spacing-free independent trigram running-key inverse; do not confuse the weak Viterbi recovery with a universal exclusion of running keys or changed word boundaries. A genuinely stronger source-constrained key or language representation is required. The [full output](lp2-joint-fhold-spacingfree-trigram-output.json) preserves input blob SHAs, plaintext/key candidate indices, all matched control truths and exact replay lengths. Executed in connected JS; no independent Windows CI claimed.

## Earlier no-interruption model and controls

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

**Earlier research decision:** #2459 closed at the calibrated inability branch. No original unknown ciphertext was scored by these three no-interruption beams; the subsequent exact local F-hold tests above address original ciphertext separately. Even the best 134/146 fresh result leaves 12 incorrect runes in each stream, and the authentic controls are weaker. A stronger joint contextual language model and/or independently constrained key are required before interpreting LP2 fragments. All three programs were executed on exact repository text data in an isolated JavaScript runtime, with authentic p57 and forward-replay assertions; no Windows CI run is claimed. The result is an empirical limitation of the finite beam/objective family, not a theorem ruling out natural-language running keys.

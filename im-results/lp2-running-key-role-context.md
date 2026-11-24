# #2598: Role-conditioned long-context running-key objective

**Decision: fail frozen gate; no original LP2 ciphertext scored.** This tests a different objective, not a larger beam. The no-F GP29 additive model, known plaintext word lengths, and independent key segmentation starting at a word boundary are unchanged. Both candidates use a matched 128-state beam. This matched baseline is a character-only 4-gram, not an exact reproduction of the earlier lexical/trie + word-bigram objective in #2459.

## Method
- Generic hierarchical context model trained on first 65% of Shakespeare and Emerson (36,014 and 48,655 words). Gibran wholly held out (12,383 words); Gutenberg headers/footers excluded for Emerson and Gibran.
- Independent native P-role model trained on five solved LP1 sections, excluding KOAN1, LOSS, p56, p57. For P, combine generic 6-gram probabilities with 0.45 native probabilities; for K, generic 6-gram only. Fixed hierarchical masses 4,10,20,25,30. No test tuning.
- Six paired controls use two disjoint KOAN1 windows, p56, p57, two disjoint Gibran windows. K donor regions disjoint from generic training and other Gibran P windows. Native rune text parsed by contiguous runs; literature normalized as prior #2459.
- Exact re-encryption and scoring-path agreement checked. Uniform pad control per plant. Gates predeclared in issue comment 7134334479.

| Plant | Runes | Baseline correct | New correct | True minus old wrong (new objective) | True minus new wrong |
|---|---:|---:|---:|---:|---:|
| KOAN1-A | 97 | 56 | 89 | 51.153 | -7.750 |
| KOAN1-B | 96 | 59 | 67 | 9.060 | -18.256 |
| p56 | 85 | 45 | 63 | -11.813 | -32.350 |
| p57 | 95 | 56 | 79 | 26.535 | -14.571 |
| Gibran-A | 97 | 83 | 94 | 10.664 | -6.237 |
| Gibran-B | 96 | 63 | 75 | -22.536 | -49.333 |

Pooled 362/566 (63.96%) → 467/566 (82.51%): +18.55 pp, passes improvement threshold. True outranks old wrong under new score 4/6 (requires 5/6); exact pairs 0/6 (requires ≥2); uniform-pad false positives 1/6 at weakest true normalized score (requires 0). All six new best wrong paths still exceed true score. This is a direct objective-failure certificate, independent of whether beam pruning additionally occurred.

Reproduce with Node: `node sims/lp2_running_key_role_context_sft.cjs` or append indices `0 1`, `2 3`, `4 5`. Code was committed first (0be98ace2); results executed in V8 as three batches; initial slower implementation timed out, optimized suffix lookup preserved objective. Raw values in [JSON](lp2-running-key-role-context.json). No independent Windows CI run. The separate native training corpus is small; these finite plants are not random independent samples of all English. No implication that all possible language-model objectives must fail.

Retire this fixed 6-gram/native mixture as a source-admissible decoder. A genuinely independent semantic objective or source-selected key constraints would be needed, rather than increasing width or tuning mixture on these controls.
